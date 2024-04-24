import { FormationTag } from "#/types/formation";
import { FrCxArg } from "@codegouvfr/react-dsfr";

export const FORMATION_TAG: { tag: FormationTag; libelle: string; color: string; bgColor: string; icon: FrCxArg }[] = [
  {
    tag: FormationTag.POUR_TRAVAILLER_RAPIDEMENT,
    libelle: "POUR TRAVAILLER RAPIDEMENT",
    color: "#18753c",
    bgColor: "",
    icon: "fr-icon-shopping-cart-2-fill",
  },
  {
    tag: FormationTag.POUR_CONTINUER_DES_ETUDES,
    libelle: "POUR CONTINUER DES ÉTUDES",
    color: "#b34000",
    bgColor: "#FFE9E9",
    icon: "fr-icon-book-2-fill",
  },
];
