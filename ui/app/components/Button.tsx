"use client";
import styled from "@emotion/styled";
import isPropValid from "@emotion/is-prop-valid";
import Button, { ButtonProps as DSFRButtonProps } from "@codegouvfr/react-dsfr/Button";
import { fr } from "@codegouvfr/react-dsfr";

export type ButtonProps = {
  rounded?: boolean;
  variant?: "white";
} & DSFRButtonProps;

export default styled(Button, {
  shouldForwardProp: (prop) => !["rounded", "variant"].includes(prop),
})<ButtonProps>`
  ${({ rounded }) => (rounded ? "border-radius: 16px;" : "")}
  ${({ variant }) => {
    switch (variant) {
      case "white":
        return `background-color: var(--grey-1000-50);`;
      default:
        return "";
    }
  }};
`;
