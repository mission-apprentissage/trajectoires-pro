# Documentation Technique : Jobs d'importation

Cette section décrit les traitements automatisés (Jobs) qui alimentent la base de données MongoDB de l'application Exposition, dans l'ordre d'exécution de la commande `importAll`.

---

## 1. Référentiels BCN

### Vue d'ensemble

La BCN (Base Centrale des Nomenclatures) est le référentiel officiel de l'Éducation Nationale pour les formations et diplômes. Ce module importe et enrichit ces données pour permettre le suivi des formations à travers leurs évolutions (continuum).

#### Nomenclatures API utilisées

| Nomenclature                     | Description                       | Clé primaire                             | Usage                            |
| -------------------------------- | --------------------------------- | ---------------------------------------- | -------------------------------- |
| `V_FORMATION_DIPLOME`            | Diplômes voie apprentissage       | `formation_diplome`                      | CFD apprentissage                |
| `N_FORMATION_DIPLOME`            | Diplômes voie scolaire            | `formation_diplome`                      | CFD scolaire + continuum         |
| `N_FORMATION_DIPLOME_ENQUETE_51` | Diplômes apprentissage hors EN    | `formation_diplome`                      | CFD apprentissage complémentaire |
| `N_MEF`                          | Modules Élémentaires de Formation | `mef_stat_11`                            | Années de formation              |
| `N_DIPLOME_SISE`                 | Diplômes supérieur                | `diplome_sise`                           | Formations sup                   |
| `N_NIVEAU_FORMATION_DIPLOME`     | Niveaux de diplôme                | `niveau_formation_diplome`               | Enrichissement niveaux           |
| `N_TYPE_DIPLOME_SISE`            | Types diplômes SISE               | `type_diplome_sise`                      | Enrichissement SISE              |
| `N_GROUPE_FORMATION`             | Familles de métiers               | `groupe_formation`                       | Secondes communes                |
| `N_LIEN_FORMATION_GROUPE`        | Liens formation-groupe            | `formation_diplome` + `groupe_formation` | Association familles             |

#### Formats des codes d'identification

**CFD (Code Formation Diplôme)** - 8 caractères alphanumériques

```
Exemple : 40025214
```

- Utilisé pour identifier un diplôme indépendamment de l'année de cursus
- Partagé entre voie scolaire et apprentissage

**MEF STAT 11** - 11 caractères alphanumériques

Code hiérarchique : plus on lit de caractères, plus la description est fine.

```
Exemple : 24725214311
          │││││││││││
          ││││││││└┴┴─ Groupe de spécialité (positions 9-11)
          │││││└┴┴──── Domaine et catégorie de spécialité (positions 7-8)
          ││││└─────── Voie/Série (positions 5-6)
          │││└──────── Niveau de classe (position 4)
          ││└───────── Dispositif de formation (position 3)
          │└────────── Cycle d'enseignement (position 2)
          └─────────── Degré d'enseignement (position 1)
```

| Position | Désignation | Signification                                        |
| -------- | ----------- | ---------------------------------------------------- |
| 1        | Degré       | Primaire, secondaire, post-secondaire                |
| 2        | Cycle       | 1er cycle, 2ème cycle, cycle pro                     |
| 3        | Dispositif  | CAP 1 an, CAP 2 ans, BAC PRO 3 ans, BTS 2 ans...     |
| 4        | Niveau      | Niveau de classe (1=1ère année, 2=2ème, 3=terminale) |
| 5-6      | Voie/Série  | Générale, Technologique, Pro / S, L, ES, STI2D...    |
| 7-9      | Spécialité  | Catégorie, domaine et groupe de spécialité           |
| 10-11    | Suffixe     | Identification complémentaire                        |

- **Position 4 (index 3)** : Utilisée par le code pour identifier l'année du cursus
- Permet d'identifier une année précise d'une formation
- Utilisé uniquement pour la voie scolaire

**SISE** - 7 caractères numériques

```
Exemple : 2500128
```

- Utilisé pour l'enseignement supérieur

#### Collections MongoDB

| Collection | Clé unique           | Description                        |
| ---------- | -------------------- | ---------------------------------- |
| `bcn`      | `code_certification` | CFD et MEF enrichis avec continuum |
| `bcnMef`   | `mef_stat_11`        | MEF détaillés (36 champs)          |
| `bcnSise`  | `diplome_sise`       | Diplômes supérieur                 |

---

### `importBCN`

**Description :** Import des codes CFD (diplômes) et MEF (modules d'enseignement) depuis la Base Centrale des Nomenclatures.

- **Source Externe :** API BCN (V_FORMATION_DIPLOME, N_FORMATION_DIPLOME, N_FORMATION_DIPLOME_ENQUETE_51, N_MEF)
- **Collections MongoDB Sources :** -
- **Collections MongoDB de Sortie :** `bcn`

#### Clés et identifiants

| Champ                    | Source              | Description                                                        |
| ------------------------ | ------------------- | ------------------------------------------------------------------ |
| `code_certification`     | Calculé             | Clé unique = `code_formation_diplome` (CFD) ou `mef_stat_11` (MEF) |
| `code_formation_diplome` | `formation_diplome` | Code CFD du diplôme parent                                         |
| `type`                   | Calculé             | `"cfd"` ou `"mef"` selon la source                                 |

#### Règles métier

1. **Deux types de certifications :**
   - `type: "cfd"` pour les diplômes (sources : V_FORMATION_DIPLOME, N_FORMATION_DIPLOME, N_FORMATION_DIPLOME_ENQUETE_51)
   - `type: "mef"` pour les modules d'enseignement (source : N_MEF)

2. **Mapping du niveau de diplôme** de l'ancienne nomenclature (0-5) vers la nouvelle (0-7) :
   | Ancien | Nouveau | Exemple |
   |--------|---------|---------|
   | 5 | 3 | CAP |
   | 4 | 4 | BAC PRO |
   | 3 | 5 | BTS, DUT |
   | 2 | 6 | Licence |
   | 1 | 7 | Master, Doctorat |
   | 0 | 0 | Mention complémentaire |

3. **Extraction du niveau depuis le CFD :**

   ```
   CFD "40025214" → niveau_formation_diplome = "400"
   Lookup dans N_NIVEAU_FORMATION_DIPLOME → niveau_interministeriel = "4"
   Mapping → niveau = 4 (BAC)
   ```

4. **Initialisation des tableaux** `ancien_diplome` et `nouveau_diplome` vides (remplis par importBCNContinuum)

#### Traitements effectués

```
Pour chaque nomenclature (V_FORMATION_DIPLOME, N_FORMATION_DIPLOME, N_FORMATION_DIPLOME_ENQUETE_51):
  1. Récupérer les données depuis l'API BCN
  2. Pour chaque formation:
     a. Extraire le code CFD (formation_diplome)
     b. Calculer code_certification = formation_diplome
     c. Définir type = "cfd"
     d. Extraire niveau_formation_diplome (3 premiers caractères de formation_diplome si commence par chiffre)
     e. Lookup niveau dans N_NIVEAU_FORMATION_DIPLOME
     f. Mapper niveau ancien → nouveau
     g. Parser dates (date_ouverture, date_fermeture) en UTC
     h. Créer objet diplome: { code, libelle }
     i. Upsert dans collection bcn (clé: code_certification)

Pour N_MEF:
  1. Récupérer les données depuis l'API BCN
  2. Pour chaque MEF:
     a. Extraire mef_stat_11
     b. Calculer code_certification = mef_stat_11
     c. Définir type = "mef"
     d. Récupérer code_formation_diplome depuis le champ formation_diplome
     e. Parser dates en UTC
     f. Upsert dans collection bcn (clé: code_certification)
```

- Upsert avec 10 workers parallèles
- Rate limiting : 5 requêtes/seconde vers l'API BCN

---

### `importBCNMEF`

**Description :** Import détaillé des MEF (Modules d'Enseignement-Formation) pour l'enseignement secondaire.

- **Source Externe :** API BCN (N_MEF)
- **Collections MongoDB Sources :** -
- **Collections MongoDB de Sortie :** `bcnMef`

#### Clés et identifiants

| Champ                  | Source                 | Description                       |
| ---------------------- | ---------------------- | --------------------------------- |
| `mef_stat_11`          | `mef_stat_11`          | Clé unique, 11 caractères         |
| `mef`                  | `mef`                  | Code MEF court                    |
| `formation_diplome`    | `formation_diplome`    | CFD parent                        |
| `dispositif_formation` | `dispositif_formation` | Type de voie (ex: 247 = 2nde pro) |
| `annee_dispositif`     | `annee_dispositif`     | Année dans le cursus (1, 2 ou 3)  |
| `duree_dispositif`     | `duree_dispositif`     | Durée totale du cursus            |

#### Champs importés (22 au total)

Catégories de champs :

- **Identifiants** : `mef`, `mef_stat_11`, `mef_stat_9`, `formation_diplome`, `dispositif_formation`
- **Temporels** : `annee_dispositif`, `duree_dispositif`, `duree_projet`, `duree_stage`
- **Dates** : `date_ouverture`, `date_fermeture`, `date_intervention`
- **Libellés** : `libelle_court`, `libelle_long`, `libelle_edition`
- **Options pédagogiques** : `nb_option_obligatoire`, `nb_option_facultatif`, `renforcement_langue`, `horaire`
- **Inscription et statut** : `mef_inscription_scolarite`, `statut_mef`, `commentaire`

#### Traitements effectués

```
Pour chaque record N_MEF:
  1. Mapper les 22 champs source vers le schéma cible
  2. Convertir les dates au format UTC:
     - date_ouverture: parseAsUTCDate(date_ouverture)
     - date_fermeture: parseAsUTCDate(date_fermeture)
     - date_intervention: parseAsUTCDate(date_intervention)
  3. Ajouter métadonnées _meta: { created_on, updated_on }
  4. Upsert dans bcnMef (clé: mef_stat_11)
```

---

### `importBCNSise`

**Description :** Import des diplômes du supérieur (codes SISE) depuis la BCN.

- **Source Externe :** API BCN (N_DIPLOME_SISE) + 3 records fictifs créés par InserSup
- **Collections MongoDB Sources :** -
- **Collections MongoDB de Sortie :** `bcnSise`

#### Clés et identifiants

| Champ               | Source              | Description               |
| ------------------- | ------------------- | ------------------------- |
| `diplome_sise`      | `diplome_sise`      | Clé unique, 7 caractères  |
| `type_diplome_sise` | `type_diplome_sise` | Type de diplôme supérieur |

#### Records fictifs BUT

3 codes SISE fictifs sont ajoutés pour certaines spécialités BUT non présentes dans la BCN :

```javascript
{ diplome_sise: "0000001", libelle: "BUT spécialité 1" }
{ diplome_sise: "0000002", libelle: "BUT spécialité 2" }
{ diplome_sise: "0000003", libelle: "BUT spécialité 3" }
```

#### Traitements effectués

```
1. Récupérer N_DIPLOME_SISE depuis l'API BCN
2. Récupérer N_TYPE_DIPLOME_SISE pour enrichissement
3. Fusionner avec les 3 records fictifs BUT
4. Pour chaque diplôme SISE:
   a. Extraire les 19 champs principaux
   b. Enrichir avec type_diplome depuis N_TYPE_DIPLOME_SISE
   c. Upsert dans bcnSise (clé: diplome_sise)
```

---

### `importBCNContinuum`

**Description :** Construction du continuum diplôme en établissant les relations de succession entre anciens et nouveaux diplômes.

- **Source Externe :** API BCN (N_FORMATION_DIPLOME)
- **Collections MongoDB Sources :** `bcn`
- **Collections MongoDB de Sortie :** `bcn` (mise à jour)

#### Structure du continuum dans N_FORMATION_DIPLOME

La table N_FORMATION_DIPLOME contient jusqu'à 7 champs pour les anciens diplômes et 7 pour les nouveaux :

```
ancien_diplome_1, ancien_diplome_2, ..., ancien_diplome_7
nouveau_diplome_1, nouveau_diplome_2, ..., nouveau_diplome_7
```

#### Règles métier

1. **Relation bidirectionnelle :**
   - Si diplôme A référence B dans `ancien_diplome_*`, alors B obtient A dans `nouveau_diplome`
   - Si diplôme A référence C dans `nouveau_diplome_*`, alors C obtient A dans `ancien_diplome`

2. **Auto-références filtrées :** Un diplôme ne peut pas être son propre successeur/prédécesseur

3. **Relations many-to-many :** Un diplôme peut avoir plusieurs prédécesseurs ET plusieurs successeurs

#### Traitements effectués

```
1. Récupérer N_FORMATION_DIPLOME depuis l'API BCN
2. Pour chaque formation:
   a. Extraire dynamiquement tous les champs ancien_diplome_* non vides
   b. Extraire dynamiquement tous les champs nouveau_diplome_* non vides
   c. Filtrer les auto-références (cfd !== ancien_cfd && cfd !== nouveau_cfd)

3. Mise à jour directe (A → anciens/nouveaux):
   Pour chaque CFD A avec anciens [B, C] et nouveaux [D]:
     - Update bcn où code_certification = A:
       $addToSet ancien_diplome: [B, C]
       $addToSet nouveau_diplome: [D]

4. Mise à jour inverse (anciens/nouveaux → A):
   Pour chaque CFD A avec anciens [B, C]:
     - Update bcn où code_certification IN [B, C]:
       $addToSet nouveau_diplome: A
   Pour chaque CFD A avec nouveaux [D]:
     - Update bcn où code_certification = D:
       $addToSet ancien_diplome: A

5. Mise à jour des dates de session:
   - $set date_premiere_session depuis la source BCN
   - $set date_derniere_session depuis la source BCN
```

---

### `computeBCNMEFContinuum`

**Description :** Projection du continuum CFD au niveau MEF pour suivre les trajectoires de modules d'enseignement.

- **Source Externe :** -
- **Collections MongoDB Sources :** `bcn`, `bcnMef`
- **Collections MongoDB de Sortie :** `bcn` (mise à jour des records MEF)

#### Algorithme de résolution MEF

```
Pour chaque record MEF dans bcn (où type = "mef"):
  1. Récupérer le CFD parent depuis code_formation_diplome
  2. Récupérer le continuum CFD (ancien_diplome, nouveau_diplome)

  Pour chaque ancien_cfd dans ancien_diplome:
    3. Récupérer tous les MEF de l'ancien CFD depuis bcnMef
    4. Appliquer l'algorithme de matching:

       SI ancien_cfd a exactement 1 MEF ET cfd_courant a exactement 1 MEF:
         → Association directe (cas 1:1)
       SINON:
         a. Filtrer par dispositif_formation identique
         b. Comparer les 4 premiers caractères de mef_stat_11
         c. Si correspondance trouvée → association
         d. Sinon → pas d'association (null)

    5. Si MEF ancien trouvé:
       $addToSet ancien_diplome: mef_ancien

  Pour chaque nouveau_cfd dans nouveau_diplome:
    6. Même algorithme pour trouver le MEF nouveau
    7. Si MEF nouveau trouvé:
       $addToSet nouveau_diplome: mef_nouveau
```

#### Exemple de matching

```
CFD actuel: 40025214
  → MEF parent: mef_stat_11 = "24725214311", dispositif_formation = "247"

CFD ancien: 40025213 avec 2 MEFs dans bcnMef:
  - mef_stat_11 = "24725213311", dispositif_formation = "247"
    → MATCH : même dispositif_formation ET mef_stat_11.substr(0,4) = "2472" identique
  - mef_stat_11 = "24125213311", dispositif_formation = "241"
    → PAS DE MATCH : dispositif_formation différent (241 ≠ 247)
```

---

### `importLibelle`

**Description :** Enrichissement des certifications avec les libellés courants et historiques.

- **Source Externe :** -
- **Collections MongoDB Sources :** `bcn`
- **Collections MongoDB de Sortie :** `bcn` (mise à jour)

#### Règles métier

1. **Parcours récursif** de la chaîne `ancien_diplome` jusqu'à trouver un libellé fondamentalement différent

2. **Comparaison des libellés :**

   ```javascript
   // Normalisation: suppression accents, minuscules
   normalize("CAP Boulangerie") → "cap boulangerie"

   // Comparaison par inclusion
   Si libelle_actuel est sous-chaîne de libelle_ancien:
     → considérés identiques, continuer le parcours
   Sinon:
     → libellés différents, stocker et arrêter
   ```

3. **Conditions d'arrêt :**
   - Branchement (plusieurs prédécesseurs)
   - Fin de chaîne (plus d'ancien diplôme)
   - Libellé fondamentalement différent trouvé

#### Traitements effectués

```
Pour chaque certification dans bcn:
  SI type = "mef":
    libelle = bcn[code_formation_diplome].libelle_long
  SINON:
    libelle = certification.libelle_long

  libelle_ancien = null
  cfd_courant = certification

  TANT QUE cfd_courant.ancien_diplome.length == 1:
    ancien = bcn[cfd_courant.ancien_diplome[0]]
    ancien_libelle = ancien.libelle_long

    SI NOT normalize(libelle).includes(normalize(ancien_libelle)):
      libelle_ancien = ancien_libelle
      BREAK

    cfd_courant = ancien

  Update certification:
    libelle_long = libelle
    libelle_long_ancien = libelle_ancien
```

---

### `importBCNFamilleMetier`

**Description :** Association des diplômes aux familles de métiers pour le regroupement par secteur professionnel (secondes communes).

- **Source Externe :** API BCN (N_GROUPE_FORMATION, N_LIEN_FORMATION_GROUPE)
- **Collections MongoDB Sources :** `bcn`, `bcnMef`
- **Collections MongoDB de Sortie :** `bcn` (mise à jour)

#### Structure des données source

**N_GROUPE_FORMATION** (familles de métiers) :

```javascript
{
  groupe_formation: "G0003",
  libelle_long: "Métiers de la construction durable, du bâtiment et des travaux publics"
}
```

**N_LIEN_FORMATION_GROUPE** (liens CFD → famille) :

```javascript
{
  formation_diplome: "40025214",  // CFD
  groupe_formation: "G0003"       // Code famille
}
```

#### Règles métier

1. **Propagation au continuum :**
   - Si CFD A appartient à la famille X, tous ses ancêtres et descendants dans la chaîne 1-to-1 héritent de X
   - Pas de propagation si branchement (plusieurs anciens ou nouveaux)

2. **Flag `isAnneeCommune` :**
   ```javascript
   isAnneeCommune = true SI:
     - Tous les MEF du CFD ont annee_dispositif = "1"
     - ET il n'existe pas de MEF avec annee_dispositif = "2" ou "3"
   ```

#### Traitements effectués

```
1. Récupérer N_GROUPE_FORMATION → Map<code, { code, libelle }>
2. Récupérer N_LIEN_FORMATION_GROUPE → Map<cfd, code_famille>

3. Pour chaque lien (cfd, famille):
   a. Récupérer tous les CFD du continuum via cfdsParentAndChildren(cfd)
      (uniquement relations 1:1)

   b. Pour chaque cfd_continuum:
      - Vérifier isAnneeCommune via bcnMef:
        mefsAnnee1 = bcnMef.find({ formation_diplome: cfd, annee_dispositif: "1" })
        mefsAutres = bcnMef.find({ formation_diplome: cfd, annee_dispositif: { $ne: "1" } })
        isAnneeCommune = mefsAnnee1.length > 0 && mefsAutres.length == 0

      - Update bcn où code_certification = cfd_continuum:
        familleMetier: {
          code: famille.code,
          libelle: famille.libelle,
          isAnneeCommune: isAnneeCommune
        }
```

#### Fonction `cfdsParentAndChildren(cfd)`

```
Retourne tous les CFD liés par continuum 1:1:

function cfdsParentAndChildren(cfd):
  result = [cfd]

  // Remonter les ancêtres
  current = cfd
  TANT QUE bcn[current].ancien_diplome.length == 1:
    ancien = bcn[current].ancien_diplome[0]
    SI bcn[ancien].nouveau_diplome.length == 1:
      result.push(ancien)
      current = ancien
    SINON:
      BREAK  // Branchement détecté

  // Descendre les descendants
  current = cfd
  TANT QUE bcn[current].nouveau_diplome.length == 1:
    nouveau = bcn[current].nouveau_diplome[0]
    SI bcn[nouveau].ancien_diplome.length == 1:
      result.push(nouveau)
      current = nouveau
    SINON:
      BREAK  // Branchement détecté

  RETURN result
```

---

## 2. Établissements

### Vue d'ensemble

Le fichier ACCE (Annuaire des Établissements de l'Éducation Nationale) contient l'ensemble des établissements d'enseignement français avec leurs caractéristiques administratives, géographiques et de contact.

#### Source de données

| Propriété  | Valeur                         |
| ---------- | ------------------------------ |
| Fichier    | `data/acce_etablissements.csv` |
| Encodage   | ISO-8859-1                     |
| Délimiteur | Point-virgule (`;`)            |
| Volume     | ~154 000 établissements        |

#### Format du code UAI

**UAI (Unité Administrative Immatriculée)** - 8 caractères

```
Exemple : 0010001W
```

#### Collection MongoDB

| Collection           | Clé unique   | Description                         |
| -------------------- | ------------ | ----------------------------------- |
| `acceEtablissements` | `numero_uai` | Annuaire complet des établissements |

---

### `importEtablissements`

**Description :** Import de l'annuaire des établissements (UAI) depuis le fichier ACCE.

- **Source Externe :** Fichier CSV ACCE (encodage ISO-8859-1, délimiteur point-virgule)
- **Collections MongoDB Sources :** -
- **Collections MongoDB de Sortie :** `acceEtablissements`

#### Clés et identifiants

| Champ        | Source CSV   | Description                             |
| ------------ | ------------ | --------------------------------------- |
| `numero_uai` | `numero_uai` | Clé unique, 8 caractères (ex: 0010001W) |

#### Colonnes du fichier CSV (62 colonnes)

**Identifiants et classification :**

```
numero_uai, nature_uai, nature_uai_libe, type_uai, type_uai_libe,
etat_etablissement, etat_etablissement_libe
```

**Tutelle et secteur :**

```
ministere_tutelle, ministere_tutelle_libe, tutelle_2, tutelle_2_libe,
secteur_public_prive, secteur_public_prive_libe
```

**Identités :**

```
sigle_uai, denomination_principale, appellation_officielle, patronyme_uai
```

**Juridique et financier :**

```
categorie_juridique, categorie_juridique_libe, contrat_etablissement,
contrat_etablissement_libe, categorie_financiere, categorie_financiere_libe,
situation_comptable, situation_comptable_libe
```

**Hiérarchie et localisation :**

```
niveau_uai, niveau_uai_libe, commune, commune_libe, academie, academie_libe,
pays, pays_libe, departement_insee_3, departement_insee_3_libe
```

**Adresse :**

```
lieu_dit_uai, adresse_uai, boite_postale_uai, code_postal_uai,
etat_sirad_uai, localite_acheminement_uai, pays_etranger_acheminement
```

**Contact :**

```
numero_telephone_uai, numero_telecopieur_uai, mention_distribution,
mel_uai, site_web
```

**Géolocalisation :**

```
coordonnee_x, coordonnee_y, appariement, appariement_complement,
localisation, localisation_complement, date_geolocalisation, source
```

**Dates :**

```
date_ouverture, date_fermeture, date_derniere_mise_a_jour
```

**Autres :**

```
hebergement_etablissement, hebergement_etablissement_libe,
numero_siren_siret_uai, numero_finess_uai
```

#### Types d'établissements éligibles InserJeunes

La constante `NATURE_UAI_ETABLISSEMENTS_INSERJEUNES` définit les 40 codes `nature_uai` éligibles :

| Code                             | Libellé                                       |
| -------------------------------- | --------------------------------------------- |
| **Établissements spécialisés**   |                                               |
| 240                              | Institut médico-éducatif (IME)                |
| 241                              | ITEP / DITEP                                  |
| 242                              | Institut d'éducation motrice (IEM)            |
| 261                              | Maison d'enfants à caractère social           |
| **Lycées**                       |                                               |
| 300                              | Lycée d'enseignement général et technologique |
| 301                              | Lycée d'enseignement technologique            |
| 302                              | Lycée d'enseignement général                  |
| 306                              | Lycée polyvalent                              |
| 307                              | Lycée agricole                                |
| 310                              | Lycée climatique                              |
| 315                              | Lycée expérimental                            |
| 320                              | Lycée professionnel                           |
| 332                              | École professionnelle spécialisée handicap    |
| 334                              | Section d'enseignement professionnel          |
| 370                              | EREA / LEA                                    |
| 380                              | Maison familiale rurale                       |
| **Enseignement supérieur court** |                                               |
| 400                              | STS et/ou CPGE                                |
| 430                              | École de formation sanitaire et sociale       |
| 440                              | École technico-professionnelle services       |
| 445                              | École de commerce, gestion, comptabilité      |
| 450                              | École de formation artistique                 |
| 480                              | École technico-professionnelle production     |
| **Enseignement supérieur**       |                                               |
| 506                              | Centre régional CNAM                          |
| 523                              | Université                                    |
| 528                              | Service formation continue                    |
| 540                              | Composante université avec formation          |
| 551                              | Université de technologie                     |
| 580                              | École d'ingénieurs                            |
| **Apprentissage**                |                                               |
| 600                              | CFA (convention régionale)                    |
| 605                              | Organisme de formation - CFA                  |
| 610                              | CFA (convention nationale)                    |
| 625                              | Annexe organisme de formation - CFA           |
| 630                              | Section d'apprentissage                       |
| **Formation continue**           |                                               |
| 700                              | Établissement de formation continue           |
| 710                              | GRETA                                         |
| 720                              | Centre d'enseignement à distance              |
| 730                              | Établissement formation métiers du sport      |
| 740                              | Centre de formation professionnelle agricole  |
| 830                              | GIP formation continue et insertion           |

#### Règles métier

1. **Clé unique :** `numero_uai` (index unique MongoDB)

2. **Conversion des dates** du format DD/MM/YYYY vers Date JS :

   ```javascript
   // Timezone Europe/Paris pour respecter les dates françaises
   moment.tz(dateStr, "DD/MM/YYYY", "Europe/Paris").toDate();
   ```

   Champs convertis : `date_ouverture`, `date_fermeture`, `date_derniere_mise_a_jour`, `date_geolocalisation`

3. **Nettoyage des valeurs :**
   - Suppression des champs `null` ou `undefined`
   - Suppression des chaînes vides

#### Traitements effectués

```
1. Lecture du fichier CSV:
   a. Ouvrir stream fichier: data/acce_etablissements.csv
   b. Décoder ISO-8859-1 → UTF-8 (via iconv-lite)
   c. Parser CSV avec délimiteur ";"

2. Pour chaque ligne:
   a. Extraire les 62 colonnes
   b. Convertir les dates:
      - date_ouverture: DD/MM/YYYY → Date (Europe/Paris)
      - date_fermeture: DD/MM/YYYY → Date (Europe/Paris)
      - date_derniere_mise_a_jour: DD/MM/YYYY → Date (Europe/Paris)
      - date_geolocalisation: DD/MM/YYYY → Date (Europe/Paris)
   c. Nettoyer: supprimer champs null/undefined/vides (omitNil)
   d. Préparer upsert:
      - $setOnInsert: { _meta.created_on: now, _meta.date_import: now }
      - $set: { ...data, _meta.updated_on: now }
   e. Upsert dans acceEtablissements (clé: numero_uai)

3. Retourner stats:
   { total: N, created: X, updated: Y, failed: Z }
```

- Parallélisation : 10 documents traités simultanément
- Pattern : Stream processing (oleoduc)

#### Schéma MongoDB

```javascript
{
  // Clé unique
  numero_uai: String,  // REQUIRED, ex: "0010001W"

  // Classification
  nature_uai: String,           // Code nature (ex: "320")
  nature_uai_libe: String,      // Libellé (ex: "Lycée professionnel")
  type_uai: String,
  type_uai_libe: String,
  etat_etablissement: String,   // "1" = ouvert, "2" = fermé
  etat_etablissement_libe: String,

  // Tutelle
  ministere_tutelle: String,
  ministere_tutelle_libe: String,
  tutelle_2: String,
  tutelle_2_libe: String,
  secteur_public_prive: String,  // "PU" ou "PR"
  secteur_public_prive_libe: String,

  // Identités
  sigle_uai: String,
  denomination_principale: String,
  appellation_officielle: String,  // Nom complet
  patronyme_uai: String,

  // Localisation
  academie: String,              // Code académie
  academie_libe: String,         // Libellé académie
  departement_insee_3: String,   // Code département (3 chars)
  departement_insee_3_libe: String,
  commune: String,               // Code commune INSEE
  commune_libe: String,
  code_postal_uai: String,
  adresse_uai: String,

  // Coordonnées géographiques (Lambert 93)
  coordonnee_x: String,
  coordonnee_y: String,

  // Identifiants externes
  numero_siren_siret_uai: String,  // SIRET
  numero_finess_uai: String,       // FINESS (sanitaire)

  // Dates (converties en Date)
  date_ouverture: Date,
  date_fermeture: Date,
  date_derniere_mise_a_jour: Date,
  date_geolocalisation: Date,

  // Contact
  numero_telephone_uai: String,
  mel_uai: String,
  site_web: String,

  // Métadonnées
  _meta: {
    created_on: Date,
    updated_on: Date,
    date_import: Date  // REQUIRED
  }
}
```

#### Utilisation dans le pipeline

Les données `acceEtablissements` sont utilisées par :

1. **`importFormationsStats`** : Filtrage des établissements éligibles via `nature_uai`
2. **`importFormationsSupStats`** : Récupération des informations établissement par UAI
3. **Routes API formations** : Validation de l'existence d'un UAI

**Requête type pour établissements éligibles :**

```javascript
AcceEtablissementRepository.find({
  nature_uai: { $in: NATURE_UAI_ETABLISSEMENTS_INSERJEUNES },
  pays_libe: "France",
});
```

---

## 3. Statistiques InserJeunes

### Vue d'ensemble

InserJeunes est un dispositif de la DEPP (Direction de l'évaluation, de la prospective et de la performance) qui mesure l'insertion professionnelle des jeunes sortant de formations professionnelles et d'apprentissage. Les données sont collectées à différentes granularités : nationale (certifications), régionale, et par établissement (formations).

#### API InserJeunes

| Propriété        | Valeur                                               |
| ---------------- | ---------------------------------------------------- |
| URL de base      | `https://www.inserjeunes.education.gouv.fr/api/v1.0` |
| Documentation    | `https://www.inserjeunes.education.gouv.fr/api/docs/` |
| Authentification | Bearer Token (login/password via headers)            |
| Rate limiting    | 5 requêtes/seconde                                   |
| Token timeout    | 120 minutes                                          |
| Retry            | 5 tentatives avec backoff exponentiel                |

**Endpoints utilisés :**

| Endpoint                                                     | Paramètres                      | Usage               |
| ------------------------------------------------------------ | ------------------------------- | ------------------- |
| `POST /login`                                                | headers: `username`, `password` | Authentification    |
| `GET /france/millesime/{millesime}/filiere/{filiere}`        | millesime, filiere              | Stats nationales    |
| `GET /UAI/{uai}/millesime/{millesime}`                       | uai, millesime                  | Stats établissement |
| `GET /region/{code_region_academique}/millesime/{millesime}` | code_region, millesime          | Stats régionales    |

#### Format des millésimes

| Type   | Format      | Exemple       | Usage                     |
| ------ | ----------- | ------------- | ------------------------- |
| Simple | `YYYY`      | `"2024"`      | Certifications nationales |
| Double | `YYYY_YYYY` | `"2023_2024"` | Formations, Régionales    |

**Conversion :**

```javascript
// Année simple → Année double
millesime = "2024" → "2023_2024"

// Extraction depuis année double
"2023_2024" → année = "2024"
```

#### Filières

| Code API                | Filière interne | Description                   |
| ----------------------- | --------------- | ----------------------------- |
| `apprentissage`         | `apprentissage` | Voie apprentissage            |
| `voie_pro_sco_educ_nat` | `pro`           | Voie professionnelle scolaire |
| `voie_pro_sco_agri`     | `agricole`      | Voie professionnelle agricole |

#### Collections MongoDB

| Collection            | Clé unique                                                     | Granularité   |
| --------------------- | -------------------------------------------------------------- | ------------- |
| `certificationsStats` | `millesime` + `code_certification` + `filiere`                 | Nationale     |
| `formationsStats`     | `uai` + `code_certification` + `millesime` + `filiere`         | Établissement |
| `regionalesStats`     | `region.code` + `code_certification` + `millesime` + `filiere` | Régionale     |

#### Structure des statistiques

**Effectifs (nombres absolus) :**
| Champ | Description |
|-------|-------------|
| `nb_annee_term` | Effectifs en année terminale |
| `nb_sortant` | Sortants (calculé si absent) |
| `nb_poursuite_etudes` | En poursuite d'études |
| `nb_en_emploi_6_mois` | En emploi à 6 mois |
| `nb_en_emploi_12_mois` | En emploi à 12 mois |
| `nb_en_emploi_18_mois` | En emploi à 18 mois |
| `nb_en_emploi_24_mois` | En emploi à 24 mois |

**Taux (pourcentages) :**
| Champ | Description |
|-------|-------------|
| `taux_en_emploi_6_mois` | Taux d'emploi à 6 mois |
| `taux_en_emploi_12_mois` | Taux d'emploi à 12 mois (calculé) |
| `taux_en_emploi_18_mois` | Taux d'emploi à 18 mois (calculé) |
| `taux_en_emploi_24_mois` | Taux d'emploi à 24 mois (calculé) |
| `taux_en_formation` | Taux en poursuite d'études |
| `taux_rupture_contrats` | Taux de rupture (apprentissage) |
| `taux_autres_6_mois` | Autres situations à 6 mois |
| `taux_autres_12_mois` | Autres situations à 12 mois (calculé) |
| `taux_autres_18_mois` | Autres situations à 18 mois (calculé) |
| `taux_autres_24_mois` | Autres situations à 24 mois (calculé) |

**Salaires (certifications uniquement) :**
| Champ | Description |
|-------|-------------|
| `salaire_12_mois_q1` | 1er quartile à 12 mois |
| `salaire_12_mois_q2` | Médiane à 12 mois |
| `salaire_12_mois_q3` | 3e quartile à 12 mois |

#### Système `donnee_source`

Le champ `donnee_source` identifie l'origine des données :

| Type         | Description                                 | Créé par                |
| ------------ | ------------------------------------------- | ----------------------- |
| `"self"`     | Données directement importées d'InserJeunes | `importStats`           |
| `"ancienne"` | Données héritées d'un diplôme plus ancien   | `computeContinuumStats` |
| `"nouvelle"` | Données héritées d'un diplôme plus récent   | `computeContinuumStats` |

```javascript
donnee_source: {
  code_certification: "40025214",  // CFD source
  type: "self" | "ancienne" | "nouvelle"
}
```

---

### `importStats`

**Description :** Orchestrateur de l'import des statistiques d'insertion pour l'enseignement secondaire depuis l'API InserJeunes.

- **Source Externe :** API InserJeunes
- **Collections MongoDB Sources :** `acceEtablissements` (pour les formations)
- **Collections MongoDB de Sortie :** `certificationsStats`, `formationsStats`, `regionalesStats`

#### Sous-jobs exécutés

L'orchestrateur appelle séquentiellement :

1. `importCertificationsStats` - Stats nationales
2. `importFormationsStats` - Stats par établissement
3. `importRegionalesStats` - Stats régionales

#### Traitements effectués

```
1. Authentification API InserJeunes
   - POST /login avec headers username/password
   - Récupération Bearer Token

2. Import Certifications (niveau national):
   Pour chaque millesime dans config.millesimes.default:
     Pour chaque filiere dans ["apprentissage", "voie_pro_sco_educ_nat"]:
       - GET /france/millesime/{millesime}/filiere/{filiere}
       - Transformer et grouper par code_certification
       - Upsert dans certificationsStats

3. Import Formations (niveau établissement):
   Pour chaque etablissement dans acceEtablissements (filtré par nature_uai):
     Pour chaque millesime dans config.millesimes.formations:
       - GET /UAI/{uai}/millesime/{millesime}
       - Enrichir avec région/académie
       - Transformer et grouper par code_certification + filiere
       - Upsert dans formationsStats

4. Import Régionales:
   Pour chaque region (sauf codes 00 et 13):
     Pour chaque millesime dans config.millesimes.formations:
       - GET /region/{code_region_academique}/millesime/{millesime}
       - Transformer et grouper par code_certification + filiere
       - Upsert dans regionalesStats

5. Retourner les compteurs de chaque sous-job:
   {
     certifications: { created, updated, failed },
     formations: { created, updated, failed, ignored },
     regionales: { created, updated, failed }
   }
```

---

### `importCertificationsStats`

**Description :** Import des statistiques nationales par certification.

- **Source Externe :** API InserJeunes (endpoint `/france`)
- **Collections MongoDB Sources :** `bcn`
- **Collections MongoDB de Sortie :** `certificationsStats`

#### Clés et identifiants

| Champ                     | Source                                         | Description              |
| ------------------------- | ---------------------------------------------- | ------------------------ |
| `millesime`               | Paramètre API                                  | Année (ex: "2024")       |
| `code_certification`      | `id_formation_apprentissage` ou `id_mefstat11` | CFD ou MEF11             |
| `filiere`                 | Déduit de la réponse                           | `apprentissage` ou `pro` |
| `code_certification_type` | Calculé                                        | `cfd` ou `mef11`         |

#### Identification de la filière depuis l'API

```javascript
// Dans la réponse API, chaque mesure a des "dimensions"
dimensions: [
  { id_formation_apprentissage: "40025214" }  // → filiere = "apprentissage", type = "cfd"
  // OU
  { id_mefstat11: "24725214311" }             // → filiere = "pro", type = "mef11"
]
```

#### Règles métier

1. **Suppression préalable :** Avant upsert, suppression des données dérivées (`donnee_source.type !== "self"`)

2. **Enrichissement BCN :** Pour chaque certification, récupération depuis `bcn` :
   - `code_formation_diplome`
   - `libelle`, `libelle_ancien`
   - `diplome` (code, libelle)
   - `date_fermeture`
   - `familleMetier`

3. **Renommage des champs API :**

   ```javascript
   DEVENIR_part_autre_situation_6_mois → taux_autres_6_mois
   DEVENIR_part_en_emploi_6_mois      → taux_en_emploi_6_mois
   DEVENIR_part_poursuite_etudes      → taux_en_formation
   salaire_TS_Q1_12_mois              → salaire_12_mois_q1
   salaire_TS_Q2_12_mois              → salaire_12_mois_q2
   salaire_TS_Q3_12_mois              → salaire_12_mois_q3
   ```

4. **Calcul des statistiques manquantes :**

   ```javascript
   // Si nb_sortant absent
   nb_sortant = nb_annee_term - nb_poursuite_etudes

   // Si 100% en poursuite d'études
   SI nb_poursuite_etudes == nb_annee_term:
     nb_en_emploi_6_mois = 0
     nb_en_emploi_12_mois = 0
     nb_en_emploi_18_mois = 0
     nb_en_emploi_24_mois = 0

   // Taux calculés
   taux_en_emploi_12_mois = (nb_en_emploi_12_mois / nb_annee_term) * 100
   taux_en_emploi_18_mois = (nb_en_emploi_18_mois / nb_annee_term) * 100
   taux_en_emploi_24_mois = (nb_en_emploi_24_mois / nb_annee_term) * 100
   taux_autres_12_mois = 100 - taux_en_emploi_12_mois - taux_en_formation
   taux_autres_18_mois = 100 - taux_en_emploi_18_mois - taux_en_formation
   taux_autres_24_mois = 100 - taux_en_emploi_24_mois - taux_en_formation
   ```

5. **Champs ignorés stockés dans `_meta.inserjeunes` :**
   ```javascript
   taux_poursuite_etudes, taux_emploi_*_mois,
   DEVENIR_part_*, salaire_TS_Q*_12_mois_prec
   ```

#### Traitements effectués

```
Pour chaque (millesime, filiere):
  1. GET /france/millesime/{millesime}/filiere/{filiere}
  2. Stream JSON → extraire tableau "data"
  3. Pour chaque mesure:
     a. Extraire code_certification depuis dimensions
     b. Identifier filiere (apprentissage si id_formation_apprentissage, sinon pro)
     c. Grouper les mesures par (code_certification, filiere)
  4. Pour chaque groupe:
     a. Aplatir les mesures en objet { stat_name: value }
     b. Renommer les champs selon mapping
     c. Calculer les stats manquantes
     d. Séparer stats valides / ignorées
     e. Enrichir avec données BCN
     f. Supprimer données dérivées existantes
     g. Upsert avec donnee_source.type = "self"

Parallélisation: 4 requêtes API, 10 écritures MongoDB
```

---

### `importFormationsStats`

**Description :** Import des statistiques par établissement.

- **Source Externe :** API InserJeunes (endpoint `/UAI`)
- **Collections MongoDB Sources :** `acceEtablissements`, `bcn`
- **Collections MongoDB de Sortie :** `formationsStats`

#### Clés et identifiants

| Champ                | Source               | Description                             |
| -------------------- | -------------------- | --------------------------------------- |
| `uai`                | Paramètre API        | Code UAI établissement (ex: "0010001W") |
| `millesime`          | Paramètre API        | Année double (ex: "2023_2024")          |
| `code_certification` | Réponse API          | CFD ou MEF11                            |
| `filiere`            | Déduit de la réponse | `apprentissage` ou `pro`                |

#### Champs spécifiques formations

| Champ                   | Source                                      | Description            |
| ----------------------- | ------------------------------------------- | ---------------------- |
| `libelle_etablissement` | `acceEtablissements.appellation_officielle` | Nom de l'établissement |
| `region.code`           | `regions` service                           | Code région INSEE      |
| `region.nom`            | `regions` service                           | Nom de la région       |
| `academie.code`         | `acceEtablissements.academie`               | Code académie          |
| `academie.nom`          | `acceEtablissements.academie_libe`          | Nom académie           |

#### Filtrage des établissements

Seuls les établissements avec `nature_uai` dans `NATURE_UAI_ETABLISSEMENTS_INSERJEUNES` sont requêtés (40 codes, voir section Établissements).

#### Règles métier

1. **Gestion des erreurs API :**
   - Code 400 "UAI incorrect ou agricole" → ignoré (pas d'échec)
   - Autres erreurs → retry avec backoff

2. **Conversion millésime :**

   ```javascript
   // config.millesimes.formations = ["2019_2020", "2020_2021", ...]
   // Utilisé tel quel pour l'API
   ```

3. **Enrichissement localisation :**
   ```javascript
   {
     region: {
       code: "84",                    // Code région INSEE
       nom: "Auvergne-Rhône-Alpes"
     },
     academie: {
       code: "10",
       nom: "Lyon"
     }
   }
   ```

#### Traitements effectués

```
1. Récupérer tous les établissements éligibles:
   acceEtablissements.find({
     nature_uai: { $in: NATURE_UAI_ETABLISSEMENTS_INSERJEUNES },
     pays_libe: "France"
   })

2. Pour chaque etablissement:
   a. Enrichir avec région/académie depuis services/regions.js

3. Pour chaque (etablissement, millesime):
   a. GET /UAI/{uai}/millesime/{millesime}
   b. Si erreur 400 "UAI incorrect" → ignorer
   c. Grouper par (code_certification, filiere)
   d. Pour chaque groupe:
      - Enrichir avec données BCN
      - Enrichir avec données établissement
      - Supprimer données dérivées existantes
      - Upsert avec donnee_source.type = "self"

Parallélisation: 10 requêtes API, 10 écritures MongoDB
```

---

### `importRegionalesStats`

**Description :** Import des statistiques agrégées par région.

- **Source Externe :** API InserJeunes (endpoint `/region`)
- **Collections MongoDB Sources :** `bcn`
- **Collections MongoDB de Sortie :** `regionalesStats`

#### Clés et identifiants

| Champ                           | Source               | Description               |
| ------------------------------- | -------------------- | ------------------------- |
| `region.code`                   | `regions` service    | Code région INSEE         |
| `region.nom`                    | `regions` service    | Nom région                |
| `region.code_region_academique` | `regions` service    | Code pour API InserJeunes |
| `millesime`                     | Paramètre API        | Année double              |
| `code_certification`            | Réponse API          | CFD ou MEF11              |
| `filiere`                       | Déduit de la réponse | `apprentissage` ou `pro`  |

#### Régions filtrées

Codes région académique ignorés (non gérés par InserJeunes) :

- `"00"` - Collectivités d'outre-mer
- `"13"` - Mayotte

#### Traitements effectués

```
1. Récupérer toutes les régions (sauf codes 00 et 13)

2. Pour chaque (region, millesime):
   a. GET /region/{code_region_academique}/millesime/{millesime}
   b. Grouper par (code_certification, filiere)
   c. Filtrer: supprimer filiere = "agricole"
   d. Pour chaque groupe:
      - Enrichir avec données BCN
      - Enrichir avec données région
      - Supprimer données dérivées existantes
      - Upsert avec donnee_source.type = "self"

Parallélisation: 4 requêtes API, 10 écritures MongoDB
```

---

### Schéma MongoDB `certificationsStats`

```javascript
{
  // Clés uniques
  millesime: String,           // "2024"
  code_certification: String,  // "40025214" ou "24725214311"
  filiere: String,             // "apprentissage" | "pro" | "agricole" | "superieur"

  // Identification certification
  code_certification_type: String,  // "cfd" | "mef11" | "sise"
  code_formation_diplome: String,   // CFD parent (si MEF)
  libelle: String,
  libelle_ancien: String,
  diplome: {
    code: String,
    libelle: String
  },
  date_fermeture: Date,
  familleMetier: {
    code: String,
    libelle: String,
    isAnneeCommune: Boolean
  },
  certificationsTerminales: [{
    code_certification: String
  }],

  // Effectifs
  nb_annee_term: Number,
  nb_sortant: Number,
  nb_poursuite_etudes: Number,
  nb_en_emploi_6_mois: Number,
  nb_en_emploi_12_mois: Number,
  nb_en_emploi_18_mois: Number,
  nb_en_emploi_24_mois: Number,

  // Taux
  taux_en_emploi_6_mois: Number,
  taux_en_emploi_12_mois: Number,
  taux_en_emploi_18_mois: Number,
  taux_en_emploi_24_mois: Number,
  taux_en_formation: Number,
  taux_rupture_contrats: Number,
  taux_autres_6_mois: Number,
  taux_autres_12_mois: Number,
  taux_autres_18_mois: Number,
  taux_autres_24_mois: Number,

  // Salaires (national uniquement)
  salaire_12_mois_q1: Number,
  salaire_12_mois_q2: Number,
  salaire_12_mois_q3: Number,

  // Source des données
  donnee_source: {
    code_certification: String,
    type: String  // "self" | "ancienne" | "nouvelle"
  },

  // Métadonnées
  _meta: {
    created_on: Date,
    updated_on: Date,
    date_import: Date,
    inserjeunes: {
      // Champs API ignorés stockés pour audit
      taux_poursuite_etudes: Number,
      taux_emploi_6_mois: Number,
      // ...
    }
  }
}
```

### Schéma MongoDB `formationsStats`

Hérite de tous les champs de `certificationsStats` plus :

```javascript
{
  // ... tous les champs certificationsStats ...

  // Établissement
  uai: String,                  // "0010001W"
  libelle_etablissement: String,

  // Classification UAI (ajouté par computeUAI)
  uai_type: String,             // "lieu_formation" | "formateur" | "gestionnaire" | "inconnu"
  uai_donnee: String,
  uai_donnee_type: String,
  uai_lieu_formation: [String],
  uai_formateur: [String],
  uai_gestionnaire: [String],

  // Localisation
  region: {
    code: String,
    nom: String
  },
  academie: {
    code: String,
    nom: String
  }
}
```

### Schéma MongoDB `regionalesStats`

Hérite de tous les champs de `certificationsStats` plus :

```javascript
{
  // ... tous les champs certificationsStats ...

  // Région
  region: {
    code: String,                 // Code INSEE région
    nom: String,
    code_region_academique: String
  }
}
```

---

## 4. Statistiques InserSup

### Vue d'ensemble

InserSup est le système d'information qui mesure l'insertion professionnelle des diplômés de l'enseignement supérieur. Les données proviennent du SIES (Sous-direction des systèmes d'information et des études statistiques) et sont exposées via deux plateformes techniques : une API OpenDataSoft pour les statistiques nationales et une API Omogen pour les statistiques par établissement.

#### Sources de données

| Source                    | Type         | URL                                      | Usage                   |
| ------------------------- | ------------ | ---------------------------------------- | ----------------------- |
| DataEnseignementSup (ODS) | OpenDataSoft | `data.enseignementsup-recherche.gouv.fr` | Stats nationales        |
| InserSup API (Omogen)     | REST API     | Configurable                             | Stats par établissement |

#### API DataEnseignementSup (Certifications nationales)

| Propriété        | Valeur                                           |
| ---------------- | ------------------------------------------------ |
| Domain           | `https://data.enseignementsup-recherche.gouv.fr` |
| Dataset          | `fr-esr-insersup`                                |
| Rate limiting    | 5 requêtes/seconde                               |
| Authentification | Aucune (API publique)                            |

#### API InserSup/Omogen (Formations par établissement)

| Propriété        | Valeur                                                |
| ---------------- | ----------------------------------------------------- |
| URL de base      | Configurable via `TRAJECTOIRES_PRO_INSERSUP_BASE_URL` |
| Authentification | Header `X-Omogen-Api-Key`                             |
| Rate limiting    | 5 requêtes/seconde                                    |
| Format réponse   | JSON avec tableau `results`                           |

#### Format des millésimes

| Type   | Format      | Exemple       | Usage                     |
| ------ | ----------- | ------------- | ------------------------- |
| Simple | `YYYY`      | `"2021"`      | Année unique (sous-seuil) |
| Double | `YYYY_YYYY` | `"2020_2021"` | Années cumulées           |

**Détection du format depuis les données :**

```javascript
// Valeur avec "**" (sous-seuil de confidentialité) → année simple
"12 **" → millesime = "2021"

// Valeur avec "*" (données cumulées) → année double
"130 *" → millesime = "2020_2021"

// Valeur sans marqueur → année simple
"54" → millesime = "2021"
```

#### Collections MongoDB

| Collection            | Clé unique                                             | Granularité                           |
| --------------------- | ------------------------------------------------------ | ------------------------------------- |
| `certificationsStats` | `millesime` + `code_certification` + `filiere`         | Nationale (filiere = "superieur")     |
| `formationsStats`     | `uai` + `code_certification` + `millesime` + `filiere` | Établissement (filiere = "superieur") |

#### Parsing des valeurs spéciales

Les données InserSup contiennent des marqueurs textuels :

| Marqueur  | Signification                 | Transformation |
| --------- | ----------------------------- | -------------- |
| `"nd"`    | Non disponible                | `null`         |
| `"na"`    | Non applicable                | `null`         |
| `"130 *"` | Données cumulées sur 2 ans    | `130` (entier) |
| `"12 **"` | Sous seuil de confidentialité | `12` (entier)  |

```javascript
const formatInt = (str) =>
  str.substr(0, 2) === "nd" || str.substr(0, 2) === "na" ? null : parseInt(str.replaceAll("*", ""));
```

#### Structure des statistiques InserSup

**Effectifs :**
| Champ | Source Formations (Omogen) | Source Certifications (ODS) | Description |
|-------|----------------------------|----------------------------|-------------|
| `nb_annee_term` | Calculé | Calculé | `nb_sortant + nb_poursuite_etudes` |
| `nb_sortant` | `nb_sortants` | `nb_sortants` | Sortants du diplôme |
| `nb_poursuite_etudes` | `nb_poursuivants` | `nb_poursuivants` | En poursuite d'études |
| `nb_diplome` | `nb_diplomes` | - | Diplômés |
| `nb_en_emploi_6_mois` | `nb_in_dsn_6` | `nb_sortants_en_emploi_sal_fr_6` | En emploi à 6 mois |
| `nb_en_emploi_12_mois` | `nb_in_dsn_12` | `nb_sortants_en_emploi_sal_fr_12` | En emploi à 12 mois |
| `nb_en_emploi_18_mois` | `nb_in_dsn_18` | `nb_sortants_en_emploi_sal_fr_18` | En emploi à 18 mois |
| `nb_en_emploi_24_mois` | `nb_in_dsn_24` | `nb_sortants_en_emploi_sal_fr_24` | En emploi à 24 mois |

**Salaires :**
| Champ | Source Formations (Omogen) | Source Certifications (ODS) | Description |
|-------|----------------------------|----------------------------|-------------|
| `salaire_12_mois_q1` | `salaire_q1_national_diplome_12` | `salaire_q1_12` | 1er quartile |
| `salaire_12_mois_q2` | `salaire_q2_national_diplome_12` | `salaire_q2_12` | Médiane |
| `salaire_12_mois_q3` | `salaire_q3_national_diplome_12` | `salaire_q3_12` | 3e quartile |

**Taux calculés :**
| Champ | Formule |
|-------|---------|
| `taux_en_formation` | `(nb_poursuite_etudes / nb_annee_term) * 100` |
| `taux_en_emploi_6_mois` | `(nb_en_emploi_6_mois / nb_annee_term) * 100` |
| `taux_en_emploi_12_mois` | `(nb_en_emploi_12_mois / nb_annee_term) * 100` |
| `taux_en_emploi_18_mois` | `(nb_en_emploi_18_mois / nb_annee_term) * 100` |
| `taux_en_emploi_24_mois` | `(nb_en_emploi_24_mois / nb_annee_term) * 100` |
| `taux_autres_*_mois` | `100 - taux_en_emploi_*_mois - taux_en_formation` |

---

### `importSupStats`

**Description :** Orchestrateur de l'import des statistiques d'insertion pour l'enseignement supérieur.

- **Source Externe :** API DataEnseignementSup (ODS) + API InserSup (Omogen)
- **Collections MongoDB Sources :** `acceEtablissements`, `bcnSise`
- **Collections MongoDB de Sortie :** `certificationsStats`, `formationsStats`

#### Sous-jobs exécutés

L'orchestrateur appelle séquentiellement :

1. `importCertificationsSupStats` - Stats nationales par diplôme SISE
2. `importFormationsSupStats` - Stats par établissement

#### Traitements effectués

```
1. Import Certifications nationales:
   Pour chaque millesime dans config.millesimes.defaultSup:
     - GET DataEnseignementSup API (dataset fr-esr-insersup)
     - Filtrer: nationalite/genre/obtention/regime = "ensemble"
     - Transformer et enrichir avec BCN SISE
     - Calculer taux dérivés
     - Upsert dans certificationsStats (filiere = "superieur")

2. Import Formations par établissement:
   - GET InserSup API (Omogen) - flux complet
   - Pour chaque formation:
     a. Parser millésime (détecter * et **)
     b. Parser valeurs spéciales (nd, na)
     c. Valider UAI via ACCE
     d. Enrichir avec région/académie
     e. Enrichir avec BCN SISE
     f. Calculer taux dérivés
     g. Upsert dans formationsStats (filiere = "superieur")

3. Retourner les compteurs de chaque sous-job:
   {
     certifications: { created, updated, failed },
     formations: { created, updated, failed }
   }
```

---

### `importCertificationsSupStats`

**Description :** Import des statistiques nationales par diplôme SISE.

- **Source Externe :** API DataEnseignementSup (OpenDataSoft)
- **Collections MongoDB Sources :** `bcnSise`
- **Collections MongoDB de Sortie :** `certificationsStats`

#### Clés et identifiants

| Champ                     | Source    | Description                                       |
| ------------------------- | --------- | ------------------------------------------------- |
| `millesime`               | `promo`   | Année(s) de promotion (ex: "2021" ou "2020_2021") |
| `code_certification`      | `diplome` | Code SISE du diplôme                              |
| `filiere`                 | Fixe      | `"superieur"`                                     |
| `code_certification_type` | Fixe      | `"sise"`                                          |

#### Filtres appliqués sur l'API

Les données sont filtrées pour obtenir uniquement les agrégats nationaux :

```javascript
{
  nationalite: "ensemble",
  genre: "ensemble",
  obtention_diplome: "ensemble",
  regime_inscription: "ensemble"
}
```

#### Règles métier

1. **Construction du millésime depuis `promo` :**

   ```javascript
   // promo = ["2021"] → millesime = "2021"
   // promo = ["2020", "2021"] → millesime = "2020_2021"
   millesime = promo.join("_");
   ```

2. **Calcul de `nb_annee_term` :**

   ```javascript
   nb_annee_term = nb_sortant + nb_poursuite_etudes;
   ```

3. **Enrichissement BCN SISE :** Pour chaque diplôme, récupération depuis `bcnSise` :
   - `libelle` (depuis `libelle_intitule_1`)
   - `diplome` (code, libelle)
   - `date_fermeture`

4. **Métadonnées stockées dans `_meta.insersup` :**
   ```javascript
   {
     type_diplome: "licence_pro",
     domaine_disciplinaire: "DEG",
     secteur_disciplinaire: "SCIENCES DE GESTION",
     discipline: "Sciences économiques"
   }
   ```

#### Traitements effectués

```
Pour chaque millesime dans config.millesimes.defaultSup:
  1. GET DataEnseignementSup API:
     - dataset: fr-esr-insersup
     - filtre: promo contient millesime
     - filtre: nationalite/genre/obtention/regime = "ensemble"

  2. Pour chaque record:
     a. Construire millesime depuis promo
     b. Filtrer si diplome null
     c. Mapper champs API → champs stats:
        - nb_sortants_en_emploi_sal_fr_* → nb_en_emploi_*_mois
        - nb_poursuivants → nb_poursuite_etudes
        - salaire_q*_12 → salaire_12_mois_q*
     d. Calculer nb_annee_term
     e. Enrichir avec BCN SISE
     f. Calculer taux dérivés
     g. Supprimer données dérivées existantes
     h. Upsert avec donnee_source.type = "self"
```

---

### `importFormationsSupStats`

**Description :** Import des statistiques par établissement pour l'enseignement supérieur.

- **Source Externe :** API InserSup (Omogen)
- **Collections MongoDB Sources :** `acceEtablissements`, `bcnSise`
- **Collections MongoDB de Sortie :** `formationsStats`

#### Clés et identifiants

| Champ                | Source                               | Description            |
| -------------------- | ------------------------------------ | ---------------------- |
| `uai`                | `etablissement`                      | Code UAI établissement |
| `millesime`          | Calculé depuis `annee_universitaire` | Format selon marqueurs |
| `code_certification` | `diplome` ou `diplome_consol`        | Code SISE              |
| `filiere`            | Fixe                                 | `"superieur"`          |

#### Format de réponse API Omogen

```javascript
{
  "results": [
    {
      "diplome": "2400074",
      "libelle_diplome": "MANAGEMENT ET GESTION DES ORGANISATIONS",
      "type_diplome_long": "licence_pro",
      "etablissement": "0062205P",
      "denomination_principale": "UNIVERSITE COTE D'AZUR",
      "domaine": "DEG",
      "discipline": "Sciences économiques",
      "secteur_disciplinaire": "SCIENCES DE GESTION",
      "annee_universitaire": "2020-2021",

      "nb_inscrits": "119",
      "nb_diplomes": "101",
      "nb_sortants": "54",        // ou "130 *" ou "12 **"
      "nb_poursuivants": "65",

      "nb_in_dsn_6": "23",
      "nb_in_dsn_12": "25",
      "nb_in_dsn_18": "26",
      "nb_in_dsn_24": "27",

      "salaire_q1_national_diplome_12": "nd",
      "salaire_q2_national_diplome_12": "nd",
      "salaire_q3_national_diplome_12": "nd"
    }
  ]
}
```

#### Règles métier

1. **Détermination du millésime :**

   ```javascript
   // annee_universitaire = "2020-2021"
   const cumulImpossible = /\*\*/.test(nb_sortants); // Sous-seuil
   const hasCumul = /\*/.test(nb_sortants); // Cumulé

   if (cumulImpossible || !hasCumul) {
     millesime = "2021"; // Année simple (2ème partie)
   } else {
     millesime = "2020_2021"; // Format cumulé
   }
   ```

2. **Mapping des champs :**

   ```javascript
   {
     uai: data.etablissement,
     code_certification: data.diplome || data.diplome_consol,
     nb_annee_term: formatInt(data.nb_inscrits),
     nb_diplome: formatInt(data.nb_diplomes),
     nb_sortant: formatInt(data.nb_sortants),
     nb_poursuite_etudes: formatInt(data.nb_poursuivants),
     nb_en_emploi_6_mois: formatInt(data.nb_in_dsn_6),
     nb_en_emploi_12_mois: formatInt(data.nb_in_dsn_12),
     nb_en_emploi_18_mois: formatInt(data.nb_in_dsn_18),
     nb_en_emploi_24_mois: formatInt(data.nb_in_dsn_24),
     salaire_12_mois_q1: formatInt(data.salaire_q1_national_diplome_12),
     salaire_12_mois_q2: formatInt(data.salaire_q2_national_diplome_12),
     salaire_12_mois_q3: formatInt(data.salaire_q3_national_diplome_12)
   }
   ```

3. **Validation UAI :** L'établissement doit exister dans `acceEtablissements`

4. **Enrichissement localisation :**

   ```javascript
   {
     libelle_etablissement: acce.appellation_officielle,
     region: { code, nom },
     academie: { code, nom }
   }
   ```

5. **Métadonnées stockées dans `_meta.insersup` :**
   ```javascript
   {
     etablissement_libelle: data.denomination_principale,
     etablissement_actuel_libelle: data.denomination_actuel_principale,
     type_diplome: data.type_diplome_long,
     domaine_disciplinaire: data.domaine,
     secteur_disciplinaire: data.secteur_disciplinaire,
     discipline: data.discipline
   }
   ```

#### Traitements effectués

```
1. GET InserSup API (Omogen) - flux complet JSON
2. Stream JSON → extraire tableau "results"

3. Pour chaque formation:
   a. Parser millésime depuis annee_universitaire et marqueurs
   b. Parser valeurs avec formatInt (nd, na, *, **)
   c. Filtrer si millesime non dans config.millesimes.formationsSup
   d. Valider UAI existe dans ACCE
   e. Récupérer région/académie
   f. Enrichir avec BCN SISE (getCertificationSupInfo)
   g. Calculer taux dérivés
   h. Supprimer données dérivées existantes
   i. Upsert avec donnee_source.type = "self"

Parallélisation: 10 écritures MongoDB
```

---

### Schéma MongoDB pour InserSup

Les données InserSup utilisent les mêmes collections que InserJeunes (`certificationsStats`, `formationsStats`) avec `filiere = "superieur"`.

**Champs spécifiques au supérieur :**

```javascript
{
  // Identification
  code_certification_type: "sise",  // Toujours "sise" pour le supérieur
  filiere: "superieur",

  // Effectif supplémentaire
  nb_diplome: Number,               // Nombre de diplômés (spécifique sup)

  // Métadonnées InserSup
  _meta: {
    insersup: {
      type_diplome: String,           // "licence_pro", "master", etc.
      domaine_disciplinaire: String,  // "DEG", "SHS", etc.
      secteur_disciplinaire: String,
      discipline: String,
      // Pour formations uniquement:
      etablissement_libelle: String,
      etablissement_actuel_libelle: String
    }
  }
}
```

**Note :** Le continuum diplôme (`computeContinuumStats`) n'est pas appliqué aux données du supérieur (`filiere !== "superieur"` est filtré).

---

## 5. Calcul du continuum stats

### Vue d'ensemble

Le continuum diplôme représente les chaînes de succession entre diplômes (ancien → nouveau). Ce job propage les statistiques d'insertion le long de ces chaînes pour permettre l'affichage de données sur des diplômes qui n'ont pas encore leurs propres statistiques (nouveaux diplômes) ou qui n'en ont plus (anciens diplômes fermés).

### Concept de `donnee_source`

Le champ `donnee_source` indique l'origine des statistiques :

| Type       | Description                                       | Priorité                        |
| ---------- | ------------------------------------------------- | ------------------------------- |
| `self`     | Données propres au diplôme (issues d'InserJeunes) | Haute - jamais écrasées         |
| `ancienne` | Données dérivées d'un ancien diplôme              | Basse - créées si pas de `self` |
| `nouvelle` | Données dérivées d'un nouveau diplôme             | Basse - créées si pas de `self` |

Structure du champ :

```javascript
donnee_source: {
  type: "self" | "ancienne" | "nouvelle",
  code_certification: "CFD_source"  // CFD du diplôme source (si dérivé)
}
```

### Règle de propagation 1-to-1

**CRITIQUE** : La propagation ne se fait que pour les relations 1-to-1 :

- Un diplôme avec **plusieurs** anciens diplômes → pas de propagation vers lui depuis les anciens
- Un diplôme avec **plusieurs** nouveaux diplômes → pas de propagation vers eux depuis lui

Ceci évite l'ambiguïté : si un diplôme a 3 prédécesseurs, lequel utiliser pour les stats ?

### `computeContinuumStats`

**Description :** Propagation des statistiques à travers le continuum diplôme pour créer des records synthétiques sur les anciens/nouveaux diplômes.

- **Source Externe :** -
- **Collections MongoDB Sources :** `bcn`, `certificationsStats`, `formationsStats`, `regionalesStats`
- **Collections MongoDB de Sortie :** Mêmes collections stats (ajout de records synthétiques)

#### Clés et identifiants

| Champ                | Description                 | Utilisation                 |
| -------------------- | --------------------------- | --------------------------- |
| `code_certification` | CFD du diplôme              | Clé de jointure avec BCN    |
| `ancien_diplome[]`   | Liste des CFD prédécesseurs | Navigation vers ancêtres    |
| `nouveau_diplome[]`  | Liste des CFD successeurs   | Navigation vers descendants |
| `millesime`          | Année des stats             | Propagé tel quel            |
| `filiere`            | Type de formation           | Exclure "superieur"         |

#### Règles métier détaillées

1. **Exclusion du supérieur** : `filiere !== "superieur"` (InserSup a son propre système)
2. **Données sources uniquement** : Ne propage que les stats avec `donnee_source.type: "self"`
3. **Pas d'écrasement** : Si le diplôme cible a déjà des données (`self` ou dérivées), pas de création
4. **Récursivité** : Parcours complet de la chaîne (diplôme → parent → grand-parent → ...)

#### Algorithme de propagation

```
FONCTION computeContinuumStats():
    POUR CHAQUE collection DANS [certificationsStats, formationsStats, regionalesStats]:

        // Phase 1: Propager vers les NOUVEAUX diplômes (ancienne → nouvelle)
        statsOriginales = collection.find({ "donnee_source.type": "self", filiere: { $ne: "superieur" } })

        POUR CHAQUE stat DANS statsOriginales:
            cfd = stat.code_certification
            diplomeBCN = bcn.findOne({ code_certification: cfd })

            SI diplomeBCN.nouveau_diplome.length > 0:
                // Parcours récursif des descendants
                propagerVersDescendants(stat, diplomeBCN.nouveau_diplome, collection, "nouvelle")

        // Phase 2: Propager vers les ANCIENS diplômes (nouvelle → ancienne)
        POUR CHAQUE stat DANS statsOriginales:
            cfd = stat.code_certification
            diplomeBCN = bcn.findOne({ code_certification: cfd })

            SI diplomeBCN.ancien_diplome.length > 0:
                // Parcours récursif des ancêtres
                propagerVersAncetres(stat, diplomeBCN.ancien_diplome, collection, "ancienne")


FONCTION propagerVersDescendants(statSource, nouveauxDiplomes, collection, type):
    POUR CHAQUE nouveauCfd DANS nouveauxDiplomes:
        nouveauDiplome = bcn.findOne({ code_certification: nouveauCfd })

        // Condition 1-to-1 : le nouveau diplôme n'a qu'un seul ancien
        SI nouveauDiplome.ancien_diplome.length != 1:
            CONTINUER  // Skip - relation N-to-1

        // Vérifier si données existantes
        existant = collection.findOne({
            code_certification: nouveauCfd,
            millesime: statSource.millesime,
            ...autresCritères
        })

        SI existant EST NULL:
            // Créer record dérivé
            nouveauRecord = copierStatsSansIdentifiants(statSource)
            nouveauRecord.code_certification = nouveauCfd
            nouveauRecord.donnee_source = { type: "nouvelle", code_certification: statSource.code_certification }
            collection.insertOne(nouveauRecord)

        // Récursion vers les descendants du descendant
        SI nouveauDiplome.nouveau_diplome.length > 0:
            propagerVersDescendants(statSource, nouveauDiplome.nouveau_diplome, collection, type)


FONCTION propagerVersAncetres(statSource, anciensDiplomes, collection, type):
    POUR CHAQUE ancienCfd DANS anciensDiplomes:
        ancienDiplome = bcn.findOne({ code_certification: ancienCfd })

        // Condition 1-to-1 : l'ancien diplôme n'a qu'un seul nouveau
        SI ancienDiplome.nouveau_diplome.length != 1:
            CONTINUER  // Skip - relation 1-to-N

        // Vérifier si données existantes
        existant = collection.findOne({
            code_certification: ancienCfd,
            millesime: statSource.millesime,
            ...autresCritères
        })

        SI existant EST NULL:
            // Créer record dérivé
            nouveauRecord = copierStatsSansIdentifiants(statSource)
            nouveauRecord.code_certification = ancienCfd
            nouveauRecord.donnee_source = { type: "ancienne", code_certification: statSource.code_certification }
            collection.insertOne(nouveauRecord)

        // Récursion vers les ancêtres de l'ancêtre
        SI ancienDiplome.ancien_diplome.length > 0:
            propagerVersAncetres(statSource, ancienDiplome.ancien_diplome, collection, type)


FONCTION copierStatsSansIdentifiants(stat):
    // Copier toutes les valeurs stats mais pas les identifiants
    EXCLURE: _id, code_certification, uai, region, ...
    GARDER: nb_annee_term, nb_poursuite_etudes, nb_en_emploi_*,
            taux_en_formation, taux_en_emploi_*, taux_autres_*,
            part_en_emploi_*, salaire_*, ...
    RETOURNER copie
```

#### Exemple de propagation

```
Chaîne de continuum BCN:
  40025106 (fermé 2018) → 40025214 (actif) → 40025315 (nouveau 2024)
  (BAC PRO ancien)        (BAC PRO actuel)   (BAC PRO rénové)

Données InserJeunes disponibles:
  40025214: millesime 2023, taux_emploi_6_mois: 75%

Après computeContinuumStats:
  40025106: millesime 2023, taux_emploi_6_mois: 75%, donnee_source: { type: "ancienne", code_certification: "40025214" }
  40025214: millesime 2023, taux_emploi_6_mois: 75%, donnee_source: { type: "self" }
  40025315: millesime 2023, taux_emploi_6_mois: 75%, donnee_source: { type: "nouvelle", code_certification: "40025214" }
```

---

## 6. Années non terminales

### Vue d'ensemble

Les formations professionnelles et agricoles durent généralement 3 ans (seconde, première, terminale). InserJeunes ne fournit des statistiques que pour l'année terminale. Ce module crée des records "virtuels" pour les années 1 et 2, liés à la certification terminale correspondante.

### Structure du code MEF STAT 11

Le code MEF STAT 11 encode l'année dans sa structure :

```
Position:  1 2 3 4 5 6 7 8 9 10 11
Exemple:   2 4 7 3 1 2 1 1 A 1  1
                 ^
                 |
                 Position 4 (index 3) = année du dispositif (1, 2 ou 3)
```

**Valeurs de l'année (position 4)** :

- `1` = Première année (seconde pro)
- `2` = Deuxième année (première pro)
- `3` = Troisième année (terminale pro) - seule année avec stats InserJeunes

### `importAnneesNonTerminales`

**Description :** Création des stats pour les années non terminales (années 1-2 des parcours 3 ans) liées aux certifications terminales.

- **Source Externe :** -
- **Collections MongoDB Sources :** `bcnMef`, `certificationsStats`, `formationsStats`, `regionalesStats`
- **Collections MongoDB de Sortie :** Mêmes collections stats

#### Clés et identifiants

| Champ                        | Description              | Utilisation                           |
| ---------------------------- | ------------------------ | ------------------------------------- |
| `code_certification`         | MEF STAT 11              | Identifiant unique avec année encodée |
| `code_formation_diplome`     | CFD du diplôme           | Lien vers BCN                         |
| `annee_dispositif`           | Année (1, 2 ou 3)        | Extraite de position 3 du MEF         |
| `certificationsTerminales[]` | Liste des MEF terminales | Référence vers stats sources          |

#### Règles métier détaillées

1. **Filières cibles** : `pro` et `agricole` uniquement (apprentissage exclu)
2. **Source des stats** : Uniquement les records avec `donnee_source.type: "self"` et année = 3
3. **Construction itérative** : Pour une terminale (année 3), créer les records année 2 puis année 1
4. **Résolution de certification** :
   - Méthode 1 : `getCertificationInfo(previousMef)` avec MEF reconstruit
   - Méthode 2 (fallback) : Lookup `bcnMef` par `code_formation_diplome` + `annee_dispositif`

#### Algorithme de construction des MEF

```
FONCTION importAnneesNonTerminales():
    POUR CHAQUE collection DANS [certificationsStats, formationsStats, regionalesStats]:

        // Récupérer toutes les stats terminales (année 3)
        statsTerminales = collection.find({
            "donnee_source.type": "self",
            filiere: { $in: ["pro", "agricole"] }
        })

        POUR CHAQUE stat DANS statsTerminales:
            mefTerminal = stat.code_certification  // ex: "24731211A11"
            anneeTerminale = extraireAnnee(mefTerminal)  // Position 3 → "3"

            SI anneeTerminale != "3":
                CONTINUER  // Pas une terminale

            // Itérer de année-1 jusqu'à année 1
            POUR annee DE (anneeTerminale - 1) JUSQU'À 1:
                mefAnnee = construireMEFAnnee(mefTerminal, annee)

                // Résolution de la certification pour cette année
                certifInfo = getCertificationInfo(mefAnnee)

                SI certifInfo EST NULL:
                    // Fallback : lookup BCN
                    certifInfo = bcnMef.findOne({
                        code_formation_diplome: stat.code_formation_diplome,
                        annee_dispositif: annee.toString()
                    })

                SI certifInfo:
                    // Créer ou mettre à jour le record
                    collection.updateOne(
                        { code_certification: mefAnnee, millesime: stat.millesime, ... },
                        {
                            $set: { ...donnéesCertification },
                            $addToSet: { certificationsTerminales: mefTerminal }
                        },
                        { upsert: true }
                    )


FONCTION extraireAnnee(mef):
    // Position 3 (index 2) du MEF STAT 11
    RETOURNER mef[2]


FONCTION construireMEFAnnee(mefOriginal, nouvelleAnnee):
    // Remplacer le caractère à la position 3
    prefixe = mefOriginal.substring(0, 2)      // "24"
    suffixe = mefOriginal.substring(3)          // "31211A11"
    RETOURNER prefixe + nouvelleAnnee + suffixe // "24" + "2" + "31211A11" = "24231211A11"
```

#### Exemple de création

```
Stat terminale existante:
  code_certification: "24731211A11"  (année 3 - terminale)
  code_formation_diplome: "40025214"
  millesime: "2023"
  taux_emploi_6_mois: 75%

Après importAnneesNonTerminales:

Record année 2 créé:
  code_certification: "24231211A11"  (année 2 - première)
  code_formation_diplome: "40025214"
  millesime: "2023"
  certificationsTerminales: ["24731211A11"]
  // Pas de taux - juste le lien vers la terminale

Record année 1 créé:
  code_certification: "24131211A11"  (année 1 - seconde)
  code_formation_diplome: "40025214"
  millesime: "2023"
  certificationsTerminales: ["24731211A11"]
```

---

### `importSecondeCommune`

**Description :** Agrégation des stats pour les secondes communes (première année partagée entre plusieurs spécialisations) en filières pro et agricole.

- **Source Externe :** API BCN (`getFamilleMetier`)
- **Collections MongoDB Sources :** `certificationsStats`, `formationsStats`, `regionalesStats`
- **Collections MongoDB de Sortie :** Mêmes collections stats

#### Concept de seconde commune

Depuis la réforme du BAC PRO, certaines secondes sont "communes" à plusieurs spécialités. Par exemple, la seconde "Métiers de la relation client" peut mener à :

- BAC PRO Commerce
- BAC PRO Vente
- BAC PRO Accueil

Ces secondes sont regroupées en **familles de métiers**.

#### Clés et identifiants

| Champ                          | Description              | Utilisation                         |
| ------------------------------ | ------------------------ | ----------------------------------- |
| `familleMetier.code`           | Code de la famille       | Identifiant unique de regroupement  |
| `familleMetier.isAnneeCommune` | Boolean                  | `true` si seconde commune           |
| `certificationsTerminales[]`   | Liste des MEF terminales | Toutes les terminales de la famille |

#### Règles métier détaillées

1. **Filtre famille** : Uniquement celles avec `isAnneeCommune: true`
2. **Filières** : `pro` et `agricole` (pas apprentissage car CFA n'a pas de seconde commune)
3. **Séparation** : Une famille peut avoir des versions pro ET agricole séparées
4. **Agrégation** : Le record de seconde commune référence TOUTES les terminales de la famille

#### Algorithme

```
FONCTION importSecondeCommune():
    // Récupérer les familles de métiers avec année commune
    familles = getFamilleMetier()  // API BCN
    famillesCommunes = familles.filter(f => f.isAnneeCommune === true)

    POUR CHAQUE collection DANS [certificationsStats, formationsStats, regionalesStats]:
        POUR CHAQUE famille DANS famillesCommunes:

            // Séparer pro et agricole
            POUR CHAQUE filiere DANS ["pro", "agricole"]:

                // Trouver toutes les terminales de cette famille avec stats
                terminales = collection.find({
                    "familleMetier.code": famille.code,
                    filiere: filiere,
                    "donnee_source.type": "self"
                })

                SI terminales.length == 0:
                    CONTINUER

                // Extraire les codes MEF des terminales
                mefTerminales = terminales.map(t => t.code_certification)

                // Trouver ou créer le MEF de la seconde commune
                mefSecondeCommune = getMEFSecondeCommune(famille, filiere)

                // Créer le record de seconde commune
                collection.updateOne(
                    {
                        code_certification: mefSecondeCommune,
                        filiere: filiere,
                        ...autresCritères
                    },
                    {
                        $set: {
                            familleMetier: famille,
                            filiere: filiere
                        },
                        $addToSet: {
                            certificationsTerminales: { $each: mefTerminales }
                        }
                    },
                    { upsert: true }
                )
```

#### Exemple de seconde commune

```
Famille de métiers: "Métiers de la relation client"
  code: "MRC"
  isAnneeCommune: true

Terminales trouvées avec stats:
  - "24731211A11" (BAC PRO Commerce, filiere: "pro")
  - "24731212B22" (BAC PRO Vente, filiere: "pro")
  - "24731213C33" (BAC PRO Accueil, filiere: "pro")

Record seconde commune créé:
  code_certification: "24131210MRC"  // MEF seconde commune
  filiere: "pro"
  familleMetier: { code: "MRC", isAnneeCommune: true, ... }
  certificationsTerminales: ["24731211A11", "24731212B22", "24731213C33"]
```

---

## 7. Catalogue Apprentissage

### Vue d'ensemble

Le Catalogue de l'Apprentissage est une base de données nationale référençant toutes les formations en apprentissage. Il fournit les informations cruciales pour la chaîne UAI : qui est le **lieu de formation** (où l'apprenti suit les cours), le **formateur** (CFA qui dispense), et le **gestionnaire** (organisme administratif responsable).

### Configuration API

| Paramètre           | Valeur                                                     |
| ------------------- | ---------------------------------------------------------- |
| URL de base         | `https://catalogue.apprentissage.education.gouv.fr/api/v1` |
| Endpoint formations | `/entity/formations`                                       |
| Authentification    | Cookie session (login/password)                            |
| Rate limiting       | 5 requêtes par seconde                                     |
| Expiration token    | 6 heures                                                   |
| Pagination          | 100 records par page                                       |

### `importCatalogueApprentissage`

**Description :** Import des formations en apprentissage depuis le Catalogue de l'Apprentissage pour lier les UAI aux lieux physiques de formation.

- **Source Externe :** API Catalogue de l'Apprentissage (Ministère de l'Éducation)
- **Collections MongoDB Sources :** -
- **Collections MongoDB de Sortie :** `CAFormations`

#### Clés et identifiants

| Champ                            | Type     | Description                                       |
| -------------------------------- | -------- | ------------------------------------------------- |
| `id`                             | ObjectId | Identifiant unique de la formation (clé primaire) |
| `cfd`                            | String   | Code Formation Diplôme - lien vers BCN            |
| `uai_formation`                  | String   | UAI du lieu physique de formation                 |
| `etablissement_formateur_uai`    | String   | UAI du CFA formateur                              |
| `etablissement_gestionnaire_uai` | String   | UAI de l'organisme gestionnaire                   |

#### Structure des UAI dans le Catalogue

```
┌─────────────────────────────────────────────────────────────────┐
│                    GESTIONNAIRE                                  │
│                 (Organisme administratif)                        │
│                 UAI: 0751234A                                    │
│                                                                  │
│    ┌──────────────────────┐    ┌──────────────────────┐        │
│    │     FORMATEUR 1      │    │     FORMATEUR 2      │        │
│    │   (CFA dispensant)   │    │   (CFA dispensant)   │        │
│    │   UAI: 0752345B      │    │   UAI: 0753456C      │        │
│    │                      │    │                      │        │
│    │  ┌────┐ ┌────┐      │    │  ┌────┐             │        │
│    │  │Lieu│ │Lieu│      │    │  │Lieu│             │        │
│    │  │ 1  │ │ 2  │      │    │  │ 3  │             │        │
│    │  │UAI:│ │UAI:│      │    │  │UAI:│             │        │
│    │  │075 │ │075 │      │    │  │075 │             │        │
│    │  │456D│ │567E│      │    │  │678F│             │        │
│    │  └────┘ └────┘      │    │  └────┘             │        │
│    └──────────────────────┘    └──────────────────────┘        │
└─────────────────────────────────────────────────────────────────┘
```

#### Requête API

```javascript
// Filtre de requête
{
  "$or": [
    { "published": true },
    { "catalogue_published": true }
  ],
  "cfd": { "$ne": null }
}
```

#### Champs importés (whitelist)

**Identifiants** :

- `id` → transformé en `ObjectId`
- `etablissement_gestionnaire_id` → transformé en `ObjectId`
- `etablissement_formateur_id` → transformé en `ObjectId`
- `etablissement_reference`

**Gestionnaire** (préfixe `etablissement_gestionnaire_`) :

- `siret`, `enseigne`, `uai`, `entreprise_raison_sociale`, `siren`

**Formateur** (préfixe `etablissement_formateur_`) :

- `siret`, `enseigne`, `uai`, `entreprise_raison_sociale`, `siren`

**Qualification** :

- `cfd`, `cfd_specialite`, `cfd_outdated`, `cfd_date_fermeture`, `niveau`, `diplome`

**Localisation** :

- `nom_academie`, `num_academie`, `code_postal`, `code_commune_insee`, `num_departement`, `nom_departement`, `region`, `localite`, `uai_formation`

**Description** :

- `nom`, `intitule_long`, `intitule_court`, `libelle_court`

**MEF** :

- `bcn_mefs_10` → transformé pour ne garder que `mef10`, `modalite.duree`, `modalite.annee`, `date_fermeture`

#### Algorithme d'import

```
FONCTION importCatalogueApprentissage():
    // Authentification par cookie session
    SI token_expiré OU non_authentifié:
        response = POST /auth/login { username, password }
        cookie = response.headers["set-cookie"]

    page = 1
    BOUCLE:
        // Requête paginée
        params = {
            page: page,
            limit: 100,
            query: JSON.stringify(FILTRE_REQUETE)
        }
        response = GET /entity/formations?{params}
            headers: { cookie: cookie }

        SI response.formations.length == 0:
            SORTIR BOUCLE

        // Transformation des formations
        formations = response.formations.map(transformerFormation)

        // Upsert batch
        POUR CHAQUE formation DANS formations:
            CAFormations.updateOne(
                { id: formation.id },
                { $set: formation },
                { upsert: true }
            )

        page++


FONCTION transformerFormation(formationAPI):
    formation = {}

    // Transformer les ObjectId
    formation.id = ObjectId(formationAPI.id)
    SI formationAPI.etablissement_gestionnaire_id:
        formation.etablissement_gestionnaire_id = ObjectId(...)
    SI formationAPI.etablissement_formateur_id:
        formation.etablissement_formateur_id = ObjectId(...)

    // Transformer les dates
    SI formationAPI.cfd_date_fermeture:
        formation.cfd_date_fermeture = new Date(formationAPI.cfd_date_fermeture)

    // Extraire les champs de la whitelist
    POUR CHAQUE champ DANS WHITELIST:
        SI formationAPI[champ] EXISTE:
            formation[champ] = formationAPI[champ]

    // Transformer bcn_mefs_10 (extraction sélective)
    SI formationAPI.bcn_mefs_10:
        formation.bcn_mefs_10 = formationAPI.bcn_mefs_10.map(mef => ({
            mef10: mef.mef10,
            modalite: {
                duree: mef.modalite?.duree,
                annee: mef.modalite?.annee
            }
        }))

    RETOURNER formation
```

#### Schéma MongoDB `CAFormations`

```javascript
{
  _id: ObjectId,
  id: ObjectId,                              // ID source du Catalogue

  // Gestionnaire
  etablissement_gestionnaire_id: ObjectId,
  etablissement_gestionnaire_siret: String,
  etablissement_gestionnaire_enseigne: String,
  etablissement_gestionnaire_uai: String,    // Ex: "0751234A"
  etablissement_gestionnaire_raison_sociale: String,
  etablissement_gestionnaire_siren: String,

  // Formateur
  etablissement_formateur_id: ObjectId,
  etablissement_formateur_siret: String,
  etablissement_formateur_enseigne: String,
  etablissement_formateur_uai: String,       // Ex: "0752345B"
  etablissement_formateur_raison_sociale: String,
  etablissement_formateur_siren: String,

  // Qualification
  cfd: String,                               // Ex: "40025214"
  cfd_specialite: String,
  cfd_outdated: Boolean,
  cfd_date_fermeture: Date,
  niveau: String,
  diplome: String,

  // Localisation
  nom_academie: String,
  num_academie: String,
  code_postal: String,
  code_commune_insee: String,
  region: String,
  localite: String,
  uai_formation: String,                     // Ex: "0754567D" - lieu physique

  // Description
  nom: String,
  intitule_long: String,
  intitule_court: String,
  libelle_court: String,

  // MEF
  bcn_mefs_10: [{
    mef10: String,
    modalite: {
      duree: String,
      annee: String
    }
  }]
}
```

---

## 8. Calcul UAI

### Vue d'ensemble

En apprentissage, une même formation peut avoir des statistiques rattachées à différents niveaux de la hiérarchie UAI. Ce module détermine à quel niveau (lieu, formateur, gestionnaire) appartiennent les données et propage les statistiques vers les niveaux inférieurs quand nécessaire.

### Les 3 types d'UAI

| Type             | Description                             | Exemple                                  |
| ---------------- | --------------------------------------- | ---------------------------------------- |
| `lieu_formation` | Site physique où se déroulent les cours | Annexe d'un CFA à Versailles             |
| `formateur`      | CFA qui dispense la formation           | CFA des métiers de l'automobile IDF      |
| `gestionnaire`   | Organisme administratif responsable     | Chambre de Commerce et d'Industrie Paris |

### Cas par filière

| Filière                           | Comportement                                            |
| --------------------------------- | ------------------------------------------------------- |
| `superieur`                       | `uai_type: "inconnu"` - classification non applicable   |
| `pro`, `agricole` (voie scolaire) | Les 3 rôles = même UAI (établissement unique)           |
| `apprentissage`                   | Lookup dans `CAFormations` pour déterminer le rôle réel |

### `computeUAI`

**Description :** Classification du rôle de chaque UAI dans la chaîne de formation apprentissage : lieu de formation, formateur, ou gestionnaire.

- **Source Externe :** -
- **Collections MongoDB Sources :** `formationsStats`, `CAFormations`, `bcn`
- **Collections MongoDB de Sortie :** `formationsStats` (mise à jour)

#### Clés et identifiants

| Champ                            | Description                | Utilisation                          |
| -------------------------------- | -------------------------- | ------------------------------------ |
| `uai`                            | Code UAI de la stat        | Identifiant à classifier             |
| `code_certification`             | CFD ou MEF                 | Jointure avec CAFormations via `cfd` |
| `uai_formation`                  | UAI lieu (dans CA)         | Lookup niveau 1                      |
| `etablissement_formateur_uai`    | UAI formateur (dans CA)    | Lookup niveau 2                      |
| `etablissement_gestionnaire_uai` | UAI gestionnaire (dans CA) | Lookup niveau 3                      |

#### Champs mis à jour

| Champ                | Type   | Description                                                               |
| -------------------- | ------ | ------------------------------------------------------------------------- |
| `uai_type`           | String | Type déterminé : `lieu_formation`, `formateur`, `gestionnaire`, `inconnu` |
| `uai_donnee_type`    | String | Type effectif des données source                                          |
| `uai_formateur`      | Array  | Liste des UAI formateurs liés                                             |
| `uai_gestionnaire`   | Array  | Liste des UAI gestionnaires liés                                          |
| `uai_lieu_formation` | Array  | Liste des UAI lieux de formation liés                                     |

### Algorithme en 5 phases

#### Phase 1 : `computeUAIBase` - Classification initiale

Détermine le type de base de chaque UAI en cherchant dans le Catalogue.

```
FONCTION computeUAIBase():
    POUR CHAQUE stat DANS formationsStats.find({ filiere: "apprentissage" }):
        uai = stat.uai
        cfd = extraireCFD(stat.code_certification)

        // Recherche hiérarchique dans CAFormations
        // 1. Est-ce un lieu de formation ?
        caFormation = CAFormations.findOne({ uai_formation: uai, cfd: cfd })
        SI caFormation:
            stat.uai_type = "lieu_formation"
            stat.uai_formateur = [caFormation.etablissement_formateur_uai]
            stat.uai_gestionnaire = [caFormation.etablissement_gestionnaire_uai]
            CONTINUER

        // 2. Est-ce un formateur ?
        caFormations = CAFormations.find({ etablissement_formateur_uai: uai, cfd: cfd })
        SI caFormations.length > 0:
            stat.uai_type = "formateur"
            stat.uai_lieu_formation = caFormations.map(f => f.uai_formation).unique()
            stat.uai_gestionnaire = caFormations.map(f => f.etablissement_gestionnaire_uai).unique()
            CONTINUER

        // 3. Est-ce un gestionnaire ?
        caFormations = CAFormations.find({ etablissement_gestionnaire_uai: uai, cfd: cfd })
        SI caFormations.length > 0:
            stat.uai_type = "gestionnaire"
            stat.uai_formateur = caFormations.map(f => f.etablissement_formateur_uai).unique()
            stat.uai_lieu_formation = caFormations.map(f => f.uai_formation).unique()
            CONTINUER

        // 4. Non trouvé
        stat.uai_type = "inconnu"

        formationsStats.updateOne({ _id: stat._id }, { $set: stat })
```

#### Phase 2 : `computeUaiFormateur` - Upgrade lieu → formateur

Si un lieu_formation est aussi son propre formateur et que ce formateur a d'autres lieux sans données, upgrader en formateur.

```
FONCTION computeUaiFormateur():
    POUR CHAQUE stat DANS formationsStats.find({ uai_type: "lieu_formation" }):

        // Condition 1 : L'UAI est son propre formateur unique
        SI stat.uai_formateur.length != 1 OU stat.uai_formateur[0] != stat.uai:
            CONTINUER

        // Condition 2 : Ce formateur a d'autres lieux de formation
        autresLieux = CAFormations.find({
            etablissement_formateur_uai: stat.uai,
            uai_formation: { $ne: stat.uai }
        })

        SI autresLieux.length == 0:
            CONTINUER

        // Condition 3 : Ces autres lieux n'ont pas de données propres
        lieuxAvecDonnees = formationsStats.find({
            uai: { $in: autresLieux.map(l => l.uai_formation) },
            code_certification: stat.code_certification,
            millesime: stat.millesime
        })

        SI lieuxAvecDonnees.length == 0:
            // Upgrader en formateur
            stat.uai_type = "formateur"
            stat.uai_donnee_type = "formateur"  // Les données sont au niveau formateur
            stat.uai_lieu_formation = [stat.uai, ...autresLieux.map(l => l.uai_formation)]
            formationsStats.updateOne({ _id: stat._id }, { $set: stat })
```

#### Phase 3 : `computeUaiGestionnaire` - Upgrade → gestionnaire

Si un formateur/lieu est aussi son propre gestionnaire et que ce gestionnaire a d'autres formateurs sans données (mais dont les lieux ont des données), upgrader en gestionnaire.

```
FONCTION computeUaiGestionnaire():
    POUR CHAQUE stat DANS formationsStats.find({ uai_type: { $in: ["lieu_formation", "formateur"] } }):

        // Condition 1 : L'UAI est son propre gestionnaire unique
        SI stat.uai_gestionnaire.length != 1 OU stat.uai_gestionnaire[0] != stat.uai:
            CONTINUER

        // Condition 2 : Ce gestionnaire a d'autres formateurs
        autresFormateurs = CAFormations.find({
            etablissement_gestionnaire_uai: stat.uai,
            etablissement_formateur_uai: { $ne: stat.uai }
        })

        SI autresFormateurs.length == 0:
            CONTINUER

        // Condition 3 : Ces autres formateurs n'ont pas de données propres
        // ET tous leurs lieux ont des données
        formateursSansDonnees = []
        POUR CHAQUE formateur DANS autresFormateurs:
            statFormateur = formationsStats.findOne({
                uai: formateur.etablissement_formateur_uai,
                code_certification: stat.code_certification,
                millesime: stat.millesime
            })

            SI statFormateur EST NULL:
                // Vérifier si tous les lieux de ce formateur ont des données
                lieuxFormateur = CAFormations.find({ etablissement_formateur_uai: formateur.etablissement_formateur_uai })
                tousLieuxOntDonnees = lieuxFormateur.every(lieu =>
                    formationsStats.exists({
                        uai: lieu.uai_formation,
                        code_certification: stat.code_certification,
                        millesime: stat.millesime
                    })
                )

                // Si tous les lieux ont des données, le formateur n'est pas "sans données"
                SI NON tousLieuxOntDonnees:
                    formateursSansDonnees.push(formateur)

        SI formateursSansDonnees.length > 0:
            // Upgrader en gestionnaire
            stat.uai_type = "gestionnaire"
            stat.uai_donnee_type = "gestionnaire"  // Les données sont au niveau gestionnaire
            formationsStats.updateOne({ _id: stat._id }, { $set: stat })
```

#### Phase 4 : `computeUAILieuFormationForFormateur` - Créer lieux manquants depuis formateur

Pour chaque formateur, créer des records pour ses lieux de formation non attestés (si formateur unique du lieu).

```
FONCTION computeUAILieuFormationForFormateur():
    POUR CHAQUE stat DANS formationsStats.find({ uai_type: "formateur" }):

        POUR CHAQUE lieuUai DANS stat.uai_lieu_formation:
            // Skip si le lieu a déjà des données
            SI formationsStats.exists({ uai: lieuUai, code_certification: stat.code_certification, millesime: stat.millesime }):
                CONTINUER

            // Vérifier que le formateur est le seul formateur de ce lieu
            formateursLieu = CAFormations.find({ uai_formation: lieuUai }).map(f => f.etablissement_formateur_uai).unique()
            SI formateursLieu.length != 1 OU formateursLieu[0] != stat.uai:
                CONTINUER

            // Créer le record pour le lieu
            nouveauRecord = copierStats(stat)
            nouveauRecord.uai = lieuUai
            nouveauRecord.uai_type = "lieu_formation"
            nouveauRecord.uai_donnee_type = "formateur"  // Données issues du formateur
            nouveauRecord.uai_formateur = [stat.uai]

            formationsStats.insertOne(nouveauRecord)
```

#### Phase 5 : `computeUAILieuFormationForGestionnaire` - Créer lieux manquants depuis gestionnaire

Pour chaque gestionnaire, créer des records pour les lieux de ses formateurs.

```
FONCTION computeUAILieuFormationForGestionnaire():
    POUR CHAQUE stat DANS formationsStats.find({ uai_type: "gestionnaire" }):

        // Récupérer tous les formateurs du gestionnaire
        formateurs = CAFormations.find({ etablissement_gestionnaire_uai: stat.uai })
            .map(f => f.etablissement_formateur_uai).unique()

        POUR CHAQUE formateurUai DANS formateurs:
            // Récupérer les lieux de ce formateur
            lieuxFormateur = CAFormations.find({ etablissement_formateur_uai: formateurUai })
                .map(f => f.uai_formation).unique()

            POUR CHAQUE lieuUai DANS lieuxFormateur:
                // Skip si le lieu a déjà des données
                SI formationsStats.exists({ uai: lieuUai, code_certification: stat.code_certification, millesime: stat.millesime }):
                    CONTINUER

                // Créer le record pour le lieu
                nouveauRecord = copierStats(stat)
                nouveauRecord.uai = lieuUai
                nouveauRecord.uai_type = "lieu_formation"
                nouveauRecord.uai_donnee_type = "gestionnaire"  // Données issues du gestionnaire
                nouveauRecord.uai_formateur = [formateurUai]
                nouveauRecord.uai_gestionnaire = [stat.uai]

                formationsStats.insertOne(nouveauRecord)
```

### Exemple de classification

```
Données du Catalogue Apprentissage:
  Formation CAP Boulanger (CFD: 50022137)
  - Gestionnaire: CCI Paris (UAI: 0751234A)
  - Formateur: CFA Boulangerie (UAI: 0752345B)
  - Lieux: Annexe Versailles (UAI: 0782456C), Annexe Meaux (UAI: 0772567D)

Stats InserJeunes reçues:
  - UAI: 0751234A (gestionnaire), taux_emploi: 80%

Après computeUAI:

Phase 1 (computeUAIBase):
  0751234A: uai_type="gestionnaire", uai_formateur=["0752345B"], uai_lieu_formation=["0782456C", "0772567D"]

Phase 5 (computeUAILieuFormationForGestionnaire):
  Créé: 0782456C: uai_type="lieu_formation", uai_donnee_type="gestionnaire", taux_emploi=80%
  Créé: 0772567D: uai_type="lieu_formation", uai_donnee_type="gestionnaire", taux_emploi=80%

Résultat final:
  - 0751234A: données originales (gestionnaire)
  - 0782456C: données propagées depuis gestionnaire (lieu)
  - 0772567D: données propagées depuis gestionnaire (lieu)
```

---

## Ordre d'exécution `importAll`

```
1. importBCN (7 sous-jobs)
   ├── importBCN
   ├── importBCNMEF
   ├── importBCNSise
   ├── importBCNContinuum
   ├── computeBCNMEFContinuum
   ├── importLibelle
   └── importBCNFamilleMetier
2. importEtablissements
3. importStats
4. importSupStats
5. computeContinuumStats
6. importAnneesNonTerminales
   ├── importAnneesNonTerminales
   └── importSecondeCommune
7. importCatalogueApprentissage
8. computeUAI
```
