# Documentation Fonctionnelle - Routes API

Ce document décrit les règles métier et traitements des routes de l'API Exposition.

Pour les formats de réponse détaillés, voir le swagger (`/api/doc`).

---

## Table des matières

1. [Vue d'ensemble](#1-vue-densemble)
2. [Règles communes](#2-règles-communes)
3. [Routes Certifications](#3-routes-certifications)
4. [Routes Régionales](#4-routes-régionales)
5. [Routes Formations](#5-routes-formations)

---

## 1. Vue d'ensemble

### Architecture des routes

```
/api/inserjeunes/
├── certifications/
│   ├── /                        GET   - Recherche paginée
│   ├── .{ext}                   GET   - Recherche paginée avec format JSON/CSV
│   ├── /{code_certification}    GET   - Stats formation unique
│   └── /{codes_certifications}  GET   - Stats multiples agrégées par filière
├── regionales/
│   ├── /                        GET   - Recherche paginée
│   ├── .{ext}                   GET   - Recherche paginée avec format JSON/CSV
│   ├── /{code_region}           GET   - Stats paginée par région
│   ├── /{code_region}.{ext}     GET   - Stats paginée par région avec format JSON/CSV
│   └── /{code_region}/certifications/{codes}  GET - Stats région pour une formations
└── formations/
    ├── /                        GET   - Recherche paginée
    ├── .{ext}                   GET   - Recherche paginée avec format JSON/CSV
    └── /{uai}-{code_certification}  GET - Stats formation pour un établissement
```

### Collections MongoDB utilisées

| Route             | Collections sources                        |
| ----------------- | ------------------------------------------ |
| `/certifications` | `certificationsStats`, `bcn`               |
| `/regionales`     | `regionalesStats`, `bcn`                   |
| `/formations`     | `formationsStats`, `etablissements`, `bcn` |

---

## 2. Règles communes

### Normalisation des codes certification

Tous les codes sont acceptés avec ou sans préfixe. Le préfixe est retiré avant requête :

```
FONCTION normaliserCodeCertification(code):
    SI code.startsWith("CFD:"):
        RETOURNER code.substring(4)
    SI code.startsWith("MEFSTAT11:"):
        RETOURNER code.substring(10)
    SI code.startsWith("SISE:"):
        RETOURNER code.substring(5)
    RETOURNER code
```

Le type de code est détecté automatiquement :

| Pattern                              | Type      | Filière                  |
| ------------------------------------ | --------- | ------------------------ |
| `CFD:` (optionnel) + 8 caractères    | CFD       | apprentissage            |
| `MEFSTAT11:` (optionnel) + 11 chars  | MEFSTAT11 | pro, agricole (voie sco) |
| `SISE:` (obligatoire) + 7 caractères | SISE      | superieur                |

### Règle du seuil statistique

**CRITIQUE** : Les taux ne sont affichés que si `nb_annee_term >= 20`.

Cette règle garantit :

- La significativité statistique des données
- La protection de l'anonymat des individus

```
FONCTION appliquerSeuilStatistique(stat):
    SI stat.nb_annee_term < 20:
        // Masquer tous les taux et effectifs sauf nb_annee_term
        stat.taux_en_emploi_6_mois = null
        stat.taux_en_emploi_12_mois = null
        stat.taux_en_formation = null
        stat.nb_en_emploi_6_mois = null
        stat.nb_poursuite_etudes = null
        // ... tous les autres champs numériques sauf nb_annee_term

        stat._meta.messages.push(
            "Les taux ne peuvent pas être affichés car il n'y a pas assez d'élèves pour fournir une information fiable."
        )

    RETOURNER stat
```

### Gestion des millésimes

Le format varie selon le contexte :

| Collection            | Format             | Exemple               |
| --------------------- | ------------------ | --------------------- |
| `certificationsStats` | Année simple       | `2023`                |
| `regionalesStats`     | Période (2 années) | `2022_2023`           |
| `formationsStats`     | Période ou année   | `2022_2023` ou `2023` |

#### Résolution du millésime par défaut

Si aucun millésime n'est spécifié, le système utilise le dernier millésime disponible :

```
FONCTION getMillesimeParDefaut(collection, filiere):
    SI filiere == "superieur":
        RETOURNER config.millesimes.defaultSup.dernierElement()
    SINON:
        RETOURNER config.millesimes.default.dernierElement()
```

#### Double requête pour formations

Pour les formations, le système cherche les deux formats :

```
FONCTION creerVariantesMillesime(millesime):
    SI millesime.contains("_"):
        // C'est une période (ex: 2022_2023)
        annee = millesime.split("_")[1]  // 2023
        RETOURNER [millesime, annee]
    SINON:
        // C'est une année simple (ex: 2023)
        periode = (millesime - 1) + "_" + millesime  // 2022_2023
        RETOURNER [millesime, periode]
```

### Transformation `transformDisplayStat`

Appliquée à toutes les réponses, cette fonction effectue :

1. **Nettoyage** : Suppression de `_id` et champs internes
2. **Seuil statistique** : Application de la règle < 20
3. **Détection fermeture** : Ajout de `formation_fermee` si `date_fermeture` passée
4. **Attribution source UAI** : Message si données provenant d'un autre UAI

---

## 3. Routes Certifications

### `GET /api/inserjeunes/certifications`

**Description** : Recherche paginée des statistiques nationales par certification.

#### Algorithme de filtrage

```
FONCTION getCertifications(params):
    query = {}

    // 1. Millésimes : SCO et SUP séparément
    SI params.millesimes:
        query.millesime = { $in: params.millesimes.split(/[,|]/) }
    SINON:
        // Requête OR : dernier millésime SCO OU dernier millésime SUP
        query.$or = [
            { filiere: { $ne: "superieur" }, millesime: { $in: [getLastMillesimes()] } },
            { filiere: "superieur", millesime: { $in: [getLastMillesimesSup()] } }
        ]

    // 2. Codes certification
    SI params.code_certifications:
        codes = params.code_certifications.split(/[,|]/).map(normaliserCodeCertification)
        query.code_certification = { $in: codes }

    // 3. Exécution paginée
    results = certificationsStats
        .find(query)
        .skip((params.page - 1) * params.items_par_page)
        .limit(params.items_par_page)

    // 4. Transformation
    RETOURNER results.map(r => transformDisplayStat(r))
```

---

### `GET /api/inserjeunes/certifications/{code_certification}`

**Description** : Statistiques pour une certification unique.

#### Résolution du millésime

```
FONCTION resoudreMillesime(code, millesimeParam):
    SI millesimeParam:
        RETOURNER millesimeParam

    // Trouver le dernier millésime SCO OU dernier millésime SUP
    SI SUP:
        RETOURNER getLastMillesimesSup()
    SINON:
        RETOURNER getLastMillesimes()
```

#### Gestion des erreurs

```
FONCTION getCertification(code, params):
    codeNormalise = normaliserCodeCertification(code)
    millesime = resoudreMillesime(codeNormalise, params.millesime)

    stat = certificationsStats.findOne({
        code_certification: codeNormalise,
        millesime: millesime
    })

    SI stat EST NULL:
        // La certification existe-t-elle pour d'autres millésimes ?
        autresMillesimes = certificationsStats.distinct("millesime", {
            code_certification: codeNormalise
        })

        SI autresMillesimes.length > 0:
            THROW ErrorNoDataForMillesime(millesime, autresMillesimes)
        SINON:
            THROW ErrorCertificationNotFound

    // Enrichissements
    stat = ajouterCertificationsTerminales(stat)

    RETOURNER transformDisplayStat(stat)
```

#### Logique des certifications terminales

Si la certification n'est pas une année terminale, le champ `certificationsTerminales` contient les codes des années terminales liées :

```
FONCTION ajouterCertificationsTerminales(stat):
    // certificationsTerminales est déjà en base (calculé par le pipeline d'import)
    // Si présent, c'est une année non terminale (seconde, première)
    SI stat.certificationsTerminales ET stat.certificationsTerminales.length > 0:
        // Récupérer les stats des années terminales si demandé
        SI fetchAnneesTerminales:
            RETOURNER statsAnneeTerminale(stat)

    RETOURNER stat
```

#### Agrégation des stats d'années terminales

```
FONCTION statsAnneeTerminale(stat):
    terminales = stat.certificationsTerminales

    // Cas simple : une seule terminale et pas d'année commune
    SI terminales.length == 1 ET stat.familleMetier?.isAnneeCommune != true:
        RETOURNER getCertification(terminales[0].code_certification, params)

    // Cas multiple : agréger les stats de toutes les terminales
    statsTerminales = []
    POUR CHAQUE term DANS terminales:
        TRY:
            s = getCertification(term.code_certification, params)
            statsTerminales.push(s)
        CATCH:
            // Ignorer les erreurs individuelles
            CONTINUER

    // Agrégation
    resultat = {
        // ...autres données
        certificationsTerminales: statsTerminales
    }

    RETOURNER resultat
```

---

### `GET /api/inserjeunes/certifications/{codes_certifications}` (multiple)

**Description** : Statistiques agrégées par filière pour plusieurs certifications.

#### Détection mode multiple

Le mode multiple est activé si le paramètre contient `,` ou `|` :

```
codes = "CFD:40025214|MEFSTAT11:24731211A11"  // → mode multiple
codes = "CFD:40025214"                         // → mode simple
```

#### Algorithme d'agrégation par filière

```
FONCTION getCertificationsMultiples(codes, params):
    codesNormalises = codes.split(/[,|]/).map(normaliserCodeCertification)

    // 1. Récupérer tous les CFD correspondants
    cfds = BCNRepository.findCodesFormationDiplome(codesNormalises)

    // 2. Requête d'agrégation MongoDB
    pipeline = [
        // Match par CFD et millésime
        { $match: {
            code_formation_diplome: { $in: cfds },
            millesime: params.millesime || getLastMillesimes()
        }},

        // Groupement par filière
        { $group: {
            _id: "$filiere",
            codes_certifications: { $addToSet: "$code_certification" },
            codes_formation_diplome: { $addToSet: "$code_formation_diplome" },
            nb_annee_term: { $sum: "$nb_annee_term" },
            nb_en_emploi_6_mois: { $sum: "$nb_en_emploi_6_mois" },
            nb_en_emploi_12_mois: { $sum: "$nb_en_emploi_12_mois" },
            nb_poursuite_etudes: { $sum: "$nb_poursuite_etudes" },
            // ... autres sommes
        }},

        // Calcul des taux agrégés
        { $addFields: {
            taux_en_emploi_6_mois: {
                $cond: {
                    if: { $gte: ["$nb_annee_term", 20] },
                    then: { $multiply: [
                        { $divide: ["$nb_en_emploi_6_mois", "$nb_annee_term"] },
                        100
                    ]},
                    else: null
                }
            },
            // ... autres taux
        }}
    ]

    results = certificationsStats.aggregate(pipeline)

    // 3. Structuration par filière
    parFiliere = {}
    POUR CHAQUE r DANS results:
        parFiliere[r._id] = transformDisplayStat(r)

    RETOURNER parFiliere  // { pro: {...}, apprentissage: {...} }
```

#### Structure de la réponse filières

```json
{
  "pro": {
    "millesime": "2023",
    "codes_certifications": ["24731211A11", "24731212B22"],
    "codes_formation_diplome": ["40025214"],
    "filiere": "pro",
    "nb_annee_term": 2360,
    "taux_en_emploi_6_mois": 52.3
  },
  "apprentissage": {
    "millesime": "2023",
    "codes_certifications": ["40025214"],
    "filiere": "apprentissage",
    "nb_annee_term": 1180,
    "taux_en_emploi_6_mois": 55.1
  }
}
```

---

## 4. Routes Régionales

### `GET /api/inserjeunes/regionales`

**Description** : Recherche paginée des statistiques par région.

#### Conversion code postal → région

Si un code postal (5 chiffres) est fourni, il est converti en code région :

```
FONCTION codePostalVersRegion(codePostal):
    // Extraction département
    SI codePostal.startsWith("97"):
        departement = codePostal.substring(0, 3)  // DOM-TOM
    SINON:
        departement = codePostal.substring(0, 2)

    // Mapping département → région INSEE
    MAPPING = {
        // Auvergne-Rhône-Alpes (84)
        "01": "84", "03": "84", "07": "84", "15": "84", "26": "84",
        "38": "84", "42": "84", "43": "84", "63": "84", "69": "84", "73": "84", "74": "84",

        // Île-de-France (11)
        "75": "11", "77": "11", "78": "11", "91": "11", "92": "11", "93": "11", "94": "11", "95": "11",

        // Provence-Alpes-Côte d'Azur (93)
        "04": "93", "05": "93", "06": "93", "13": "93", "83": "93", "84": "93",

        // ... (voir liste complète des départements)
    }

    RETOURNER MAPPING[departement]
```

#### Algorithme de filtrage

```
FONCTION getRegionales(params):
    query = {}

    // 1. Régions (avec conversion code postal)
    SI params.regions:
        regions = params.regions.split(",").map(r =>
            r.length == 5 ? codePostalVersRegion(r) : r
        )
        query["region.code"] = { $in: regions }

    // 2. Millésimes (format période pour régionales)
    SI params.millesimes:
        query.millesime = { $in: params.millesimes.split(",") }
    SINON:
        query.millesime = getLastMillesimesRegionales()  // ex: "2022_2023"

    // 3. Codes certification
    SI params.code_certifications:
        codes = params.code_certifications.split(/[,|]/).map(normaliserCodeCertification)
        query.code_certification = { $in: codes }

    // 4. Exécution paginée avec enrichissement
    results = regionalesStats.find(query)
        .skip((params.page - 1) * params.items_par_page)
        .limit(params.items_par_page)

    RETOURNER results.map(r => transformDisplayStat(r))
```

---

### `GET /api/inserjeunes/regionales/{code_region}/certifications/{codes_certifications}`

**Description** : Statistiques régionales pour une ou plusieurs certifications.

#### Algorithme

```
FONCTION getRegionaleCertification(codeRegion, codesCertif, params):
    // 1. Normalisation région
    SI codeRegion.length == 5:
        codeRegion = codePostalVersRegion(codeRegion)

    codes = codesCertif.split(/[,|]/).map(normaliserCodeCertification)

    SI codes.length == 1:
        // --- Mode certification unique ---
        RETOURNER getRegionaleUnique(codeRegion, codes[0], params)
    SINON:
        // --- Mode certifications multiples ---
        RETOURNER getRegionalesMultiples(codeRegion, codes, params)


FONCTION getRegionaleUnique(region, code, params):
    millesime = params.millesime || getLastMillesimesRegionales()

    stat = regionalesStats.findOne({
        "region.code": region,
        code_certification: code,
        millesime: millesime
    })

    SI stat EST NULL:
        // Vérifier si la formation existe dans BCN
        SI NOT bcn.exists({ code_certification: code }):
            THROW ErrorFormationNotExist

        // Vérifier si la région a des données pour cette certification
        SI NOT regionalesStats.exists({ "region.code": region, code_certification: code }):
            THROW ErrorRegionaleNotFound

        // Données existent mais pas pour ce millésime
        autresMillesimes = regionalesStats.distinct("millesime", {
            "region.code": region,
            code_certification: code
        })
        THROW ErrorNoDataForMillesime(millesime, autresMillesimes)

    RETOURNER transformDisplayStat(stat)


FONCTION getRegionalesMultiples(region, codes, params):
    // Même logique d'agrégation que certifications multiples
    // mais filtré par région

    cfds = BCNRepository.findCodesFormationDiplome(codes)

    pipeline = [
        { $match: {
            "region.code": region,
            code_formation_diplome: { $in: cfds },
            millesime: params.millesime || getLastMillesimesRegionales()
        }},
        // ... même agrégation par filière
    ]

    RETOURNER regionalesStats.aggregate(pipeline)
```

---

## 5. Routes Formations

### `GET /api/inserjeunes/formations`

**Description** : Recherche paginée des statistiques par établissement/formation.

#### Paramètres de filtrage

| Paramètre             | Description                         |
| --------------------- | ----------------------------------- |
| `uais`                | Codes UAI (7 chiffres + 1 lettre)   |
| `regions`             | Codes région INSEE ou codes postaux |
| `academies`           | Codes académie                      |
| `code_certifications` | Codes certification                 |
| `millesimes`          | Périodes ou années                  |

#### Algorithme avec double millésime

```
FONCTION getFormations(params):
    query = {}

    // 1. Filtres simples
    SI params.uais:
        query.uai = { $in: params.uais.split(",") }

    SI params.regions:
        regions = params.regions.split(",").map(r =>
            r.length == 5 ? codePostalVersRegion(r) : r
        )
        query["region.code"] = { $in: regions }

    SI params.academies:
        query["academie.code"] = { $in: params.academies.split(",") }

    SI params.code_certifications:
        codes = params.code_certifications.split(/[,|]/).map(normaliserCodeCertification)
        query.code_certification = { $in: codes }

    // 2. Millésimes : gestion SCO/SUP avec variantes
    SI params.millesimes:
        // Créer les variantes pour chaque millésime fourni
        variantes = []
        POUR CHAQUE m DANS params.millesimes.split(","):
            variantes.push(...creerVariantesMillesime(m))

        query.$or = [
            { millesime: { $in: variantes }, filiere: { $ne: "superieur" } },
            { millesime: { $in: variantes }, filiere: "superieur" }
        ]
    SINON:
        // Défaut : derniers millésimes SCO et SUP avec variantes
        millesimeSco = getLastMillesimesFormations()  // ex: "2022_2023"
        millesimeSup = getLastMillesimesFormationsSup()
        anneeSco = getMillesimeFormationsYearFrom(millesimeSco)  // ex: "2023"
        anneeSup = getMillesimeFormationsYearFrom(millesimeSup)

        query.$or = [
            { filiere: { $ne: "superieur" }, millesime: { $in: [anneeSco, millesimeSco] } },
            { filiere: "superieur", millesime: { $in: [anneeSup, millesimeSup] } }
        ]

    // 3. Exécution paginée
    results = formationsStats.find(query)
        .skip((params.page - 1) * params.items_par_page)
        .limit(params.items_par_page)

    // 4. Transformation
    RETOURNER results.map(r => transformDisplayStat(r))
```

---

### `GET /api/inserjeunes/formations/{uai}-{code_certification}`

**Description** : Statistiques pour une formation spécifique dans un établissement.

#### Validation UAI

```
FONCTION validerUAI(uai):
    // Format : 7 chiffres + 1 lettre
    SI NOT uai.match(/^[0-9]{7}[A-Z]$/):
        THROW ErrorEtablissementNotExist

    // Vérification existence
    SI NOT etablissements.exists({ uai: uai }):
        THROW ErrorEtablissementNotExist
```

#### Algorithme avec double requête millésime

```
FONCTION getFormation(uai, codeCertifWithType, params):
    // 1. Extraction type et code
    { type, code, filiere } = parseCodeCertification(codeCertifWithType)

    // 2. Résolution millésime (basée sur la filière du code certification)
    SI params.millesime:
        millesime = params.millesime
    SINON:
        // Défaut : dernier millésime (année) selon la filière du code certification
        SI filiere == "superieur":
            millesime = getMillesimeFormationsYearFrom(getLastMillesimesFormationsSup())  // ex: "2023"
        SINON:
            millesime = getMillesimeFormationsYearFrom(getLastMillesimesFormations())  // ex: "2023"

    // Création des variantes pour la recherche (année ↔ période)
    variantes = creerVariantesMillesime(millesime)
    // Ex: "2023" → ["2023", "2022_2023"]
    // Ex: "2022_2023" → ["2022_2023", "2023"]

    // 3. Recherche
    stat = formationsStats.findOne({
        uai: uai,
        code_certification: code,
        millesime: { $in: variantes }
    })

    SI stat EST NULL:
        // Vérifier si la formation existe dans BCN
        SI type == "sise":
            SI NOT bcnSise.exists({ diplome_sise: code }):
                THROW ErrorFormationNotExist
        SINON:
            SI NOT bcn.exists({ code_certification: code }):
                THROW ErrorFormationNotExist

        // Vérifier si l'établissement existe
        SI NOT acceEtablissement.exists({ numero_uai: uai }):
            THROW ErrorEtablissementNotExist

        // Formation existe mais pas dans cet établissement
        SI NOT formationsStats.exists({ uai: uai, code_certification: code }):
            THROW ErrorFormationNotFound

        // Données existent mais pas pour ce millésime
        autresMillesimes = formationsStats.distinct("millesime", {
            uai: uai,
            code_certification: code
        })
        THROW ErrorNoDataForMillesime(millesime, autresMillesimes)

    // 4. Récupération des années terminales si applicable
    SI stat.certificationsTerminales:
        stat = statsAnneeTerminale(stat)

    RETOURNER transformDisplayStat(stat)
```

#### Champs UAI spécifiques (apprentissage)

Pour les formations en apprentissage, des champs additionnels indiquent la source des données :

| Champ                | Description                                                                      |
| -------------------- | -------------------------------------------------------------------------------- |
| `uai_type`           | Rôle de l'UAI demandé : `lieu_formation`, `formateur`, `gestionnaire`, `inconnu` |
| `uai_donnee`         | UAI d'où proviennent réellement les données                                      |
| `uai_donnee_type`    | Rôle de l'UAI source                                                             |
| `uai_lieu_formation` | Liste des UAI lieux de formation liés                                            |
| `uai_formateur`      | Liste des UAI formateurs liés                                                    |
| `uai_gestionnaire`   | Liste des UAI gestionnaires liés                                                 |

#### Message d'attribution source

Si `uai_type != uai_donnee_type`, un message explicatif est ajouté :

```
SI stat.uai_type != stat.uai_donnee_type:
    SWITCH stat.uai_donnee_type:
        CASE "gestionnaire":
            message = "Les données pour cette formation proviennent de l'organisme gestionnaire de la formation."
        CASE "formateur":
            message = "Les données pour cette formation proviennent de l'organisme formateur de la formation."
        CASE "lieu_formation":
            message = "Les données pour cette formation proviennent du lieu de formation de la formation."
        CASE "inconnu":
            message = "Nous ne pouvons pas déterminer si les données pour cette formation proviennent de l'organisme gestionnaire, de l'organisme formateur ou du lieu de formation"

    stat._meta.messages.push(message)
```

---

## Hiérarchie des erreurs

| Erreur                        | HTTP | Condition                                    |
| ----------------------------- | ---- | -------------------------------------------- |
| `ErrorCertificationNotFound`  | 404  | Code certification inexistant dans BCN       |
| `ErrorCertificationsNotFound` | 404  | Aucune certification trouvée (mode multiple) |
| `ErrorFormationNotExist`      | 404  | Code formation inexistant dans BCN           |
| `ErrorFormationNotFound`      | 404  | Pas de données pour cette formation/UAI      |
| `ErrorEtablissementNotExist`  | 404  | UAI inexistant                               |
| `ErrorRegionaleNotFound`      | 404  | Pas de données régionales                    |
| `ErrorNoDataForMillesime`     | 404  | Données existent mais pas pour ce millésime  |
| `ErrorNoDataAvailable`        | 404  | Pas de données suffisantes (mode SVG)        |

### Exemple `ErrorNoDataForMillesime`

```json
{
  "statusCode": 404,
  "error": "Not Found",
  "message": "Pas de données pour le millésime",
  "data": {
    "millesime": "2024_2025",
    "millesimesDisponible": ["2022_2023", "2021_2022", "2020_2021"]
  }
}
```
