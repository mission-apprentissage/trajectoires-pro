"use client";
import styled from "@emotion/styled";
import isPropValid from "@emotion/is-prop-valid";
import Tag, { TagProps as DSFRBTagProps } from "@codegouvfr/react-dsfr/Tag";
import { fr } from "@codegouvfr/react-dsfr";

export type TagProps = {
  variant?: "white" | "yellow" | "grey";
} & DSFRBTagProps;

// TODO: fix css order
export default styled(Tag, {
  shouldForwardProp: (prop) => !["variant"].includes(prop),
})<TagProps>`
  ${({ variant }) => {
    switch (variant) {
      case "white":
        return `background-color: var(--grey-1000-50);
        font-weight: 700;
        color: var(--blue-france-sun-113-625);
        border: 1px solid #ECECFE;`;
      case "yellow":
        return `background-color: #FEECC2;
        color: #716043;
        font-weight: 700;
        border-radius: 4px;`;
      case "grey":
        return `color: #3A3A3A;`;
      default:
        return "";
    }
  }};
`;
