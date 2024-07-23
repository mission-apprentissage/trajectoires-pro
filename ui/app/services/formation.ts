import { FormationDomaine, FormationTag } from "#/types/formation";
import { FrCxArg } from "@codegouvfr/react-dsfr";

export const FORMATION_TAG: { tag: FormationTag; libelle: string; color: string; bgColor: string; icon: FrCxArg }[] = [
  {
    tag: FormationTag.POUR_TRAVAILLER_RAPIDEMENT,
    libelle: "POUR TRAVAILLER RAPIDEMENT",
    color: "#18753c",
    bgColor: "var(--success-975-75)",
    icon: "ri-briefcase-4-fill",
  },
  {
    tag: FormationTag.POUR_CONTINUER_DES_ETUDES,
    libelle: "POUR CONTINUER DES ÉTUDES",
    color: "var(--info-425-625)",
    bgColor: "var(--info-975-75)",
    icon: "fr-icon-book-2-fill",
  },
  {
    tag: FormationTag.ADMISSION_FACILE,
    libelle: "ADMISSION FACILE",
    color: "var(--warning-425-625)",
    bgColor: "var(--warning-975-75)",
    icon: "ri-door-open-fill",
  },
];

export const FORMATION_DOMAINE: {
  domaine: FormationDomaine;
  isAll?: boolean;
}[] = [
  { domaine: FormationDomaine["tous secteurs"], isAll: true },
  { domaine: FormationDomaine["agriculture, animaux"] },
  { domaine: FormationDomaine["armée, sécurité"] },
  { domaine: FormationDomaine["arts, culture, artisanat"] },
  { domaine: FormationDomaine["banque, assurances, immobilier"] },
  { domaine: FormationDomaine["commerce, marketing, vente"] },
  { domaine: FormationDomaine["construction, architecture, travaux publics"] },
  { domaine: FormationDomaine["économie, droit, politique"] },
  { domaine: FormationDomaine["électricité, électronique, robotique"] },
  { domaine: FormationDomaine["environnement, énergies, propreté"] },
  { domaine: FormationDomaine["gestion des entreprises, comptabilité"] },
  { domaine: FormationDomaine["histoire-géographie, psychologie, sociologie"] },
  { domaine: FormationDomaine["hôtellerie-restauration, tourisme"] },
  { domaine: FormationDomaine["information-communication, audiovisuel"] },
  { domaine: FormationDomaine["informatique, Internet"] },
  { domaine: FormationDomaine["lettres, langues, enseignement"] },
  { domaine: FormationDomaine["logistique, transport"] },
  { domaine: FormationDomaine["matières premières, fabrication, industries"] },
  { domaine: FormationDomaine["mécanique"] },
  { domaine: FormationDomaine["santé, social, sport"] },
  { domaine: FormationDomaine["sciences"] },
];
