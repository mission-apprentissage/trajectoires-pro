import { FormationTag } from "#/types/formation";
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