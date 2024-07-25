import { FormationDomaine, FormationTag } from "#/types/formation";
import { FrCxArg, FrIconClassName, RiIconClassName } from "@codegouvfr/react-dsfr";

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
  icon?: FrIconClassName | RiIconClassName;
}[] = [
  { domaine: FormationDomaine["tout"], isAll: true },
  { domaine: FormationDomaine["agriculture, animaux"], icon: "ri-seedling-line" },
  { domaine: FormationDomaine["armée, sécurité"], icon: "ri-medal-2-line" },
  { domaine: FormationDomaine["arts, culture, artisanat"], icon: "ri-palette-line" },
  { domaine: FormationDomaine["banque, assurances, immobilier"], icon: "ri-bank-card-2-line" },
  { domaine: FormationDomaine["commerce, marketing, vente"], icon: "ri-shopping-basket-2-line" },
  { domaine: FormationDomaine["construction, architecture, travaux publics"], icon: "ri-barricade-line" },
  { domaine: FormationDomaine["économie, droit, politique"], icon: "ri-auction-line" },
  { domaine: FormationDomaine["électricité, électronique, robotique"], icon: "ri-lightbulb-flash-line" },
  { domaine: FormationDomaine["environnement, énergies, propreté"], icon: "ri-water-flash-line" },
  { domaine: FormationDomaine["gestion des entreprises, comptabilité"], icon: "ri-calculator-line" },
  // Pas de formations dans le catalogue actuellement
  //{ domaine: FormationDomaine["histoire-géographie, psychologie, sociologie"] },
  { domaine: FormationDomaine["hôtellerie-restauration, tourisme"], icon: "ri-restaurant-line" },
  { domaine: FormationDomaine["information-communication, audiovisuel"], icon: "ri-vidicon-2-line" },
  { domaine: FormationDomaine["informatique, Internet"], icon: "ri-mac-line" },
  // Pas de formations dans le catalogue actuellement
  //{ domaine: FormationDomaine["lettres, langues, enseignement"] },
  { domaine: FormationDomaine["logistique, transport"], icon: "ri-truck-line" },
  { domaine: FormationDomaine["matières premières, fabrication, industries"], icon: "ri-contrast-drop-2-line" },
  { domaine: FormationDomaine["mécanique"], icon: "ri-car-line" },
  { domaine: FormationDomaine["santé, social, sport"], icon: "ri-hand-heart-line" },
  { domaine: FormationDomaine["sciences"], icon: "ri-microscope-line" },
];
