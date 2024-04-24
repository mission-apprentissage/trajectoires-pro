"use client";
import styled from "@emotion/styled";
import Tag, { TagProps as DSFRBTagProps } from "@codegouvfr/react-dsfr/Tag";

export type TagProps = {
  variant?: "white" | "yellow" | "grey";
  square?: boolean;
} & DSFRBTagProps;

// TODO: fix css order
export default styled(Tag, {
  shouldForwardProp: (prop) => !["variant", "square"].includes(prop),
})<TagProps>`
  &,
  &.fr-tag {
    ${({ variant }) => {
      switch (variant) {
        case "white":
          return `
          background-color: var(--grey-1000-50);
        font-weight: 700;
        color: var(--blue-france-sun-113-625);
        border: 1px solid #ECECFE;
        
        &:not(:disabled):hover {
          background-color: var(--background-default-grey-hover);
        }`;
        case "yellow":
          return `background-color: #FEECC2;
        color: #716043;
        font-weight: 700;`;
        case "grey":
          return `color: #3A3A3A;`;
        default:
          return "";
      }
    }};

    ${({ square }) => {
      return square ? `border-radius: 4px;` : "";
    }}
  }
`;
