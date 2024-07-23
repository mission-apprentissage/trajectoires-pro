"use client";
import styled from "@emotion/styled";
import Button, { ButtonProps as DSFRButtonProps } from "@codegouvfr/react-dsfr/Button";
import { isString } from "lodash-es";

export type ButtonProps = {
  rounded?: boolean | string;
  variant?: "white" | "white-black";
  smallIconOnly?: boolean;
  iconOnly?: boolean;
} & DSFRButtonProps;

function ButtonBase({ children, smallIconOnly, ...props }: ButtonProps) {
  return (
    <Button {...props}>
      <div>{children}</div>
    </Button>
  );
}

export default styled(ButtonBase, {
  shouldForwardProp: (prop) => !["iconOnly", "rounded", "variant"].includes(prop),
})<ButtonProps>`
  ${({ rounded }) => (rounded ? (isString(rounded) ? `border-radius: ${rounded};` : "border-radius: 16px;") : "")}
  ${({ variant }) => {
    switch (variant) {
      case "white":
        return `background-color: var(--grey-1000-50);`;
      case "white-black":
        return `
        background-color: var(--grey-1000-50);
        color: #000000;
        border-color: #000000;
        box-shadow: inset 0 0 0 1px #000000;
        padding: 16px;
        `;
      default:
        return "";
    }
  }};
  ${({ smallIconOnly, theme }) => {
    return smallIconOnly
      ? `${theme.breakpoints.down("md")} {
        &[class^=fr-icon-]::before, &[class*=" fr-icon-"]::before, &[class^=fr-fi-]::before, &[class*=" fr-fi-"]::before {
          margin-right: auto;
          margin-left: auto;
       }

       & > div {
        display: none;
       }
      }`
      : "";
  }}

  ${({ iconOnly }) => {
    return iconOnly
      ? `
      &.fr-btn--lg.fr-btn--icon-left[class^=fr-icon-]::before, &.fr-btn--lg.fr-btn--icon-left[class*=" fr-icon-"]::before, &.fr-btn--lg.fr-btn--icon-left[class^=fr-fi-]::before, &.fr-btn--lg.fr-btn--icon-left[class*=" fr-fi-"]::before, &[class^=fr-icon-]::before, &[class*=" fr-icon-"]::before, &[class^=fr-fi-]::before, &[class*=" fr-fi-"]::before{
          margin-right: 0;
          margin-left: 0;
      }

      padding: 0.25rem;
      border-radius: 1rem;
      min-height: 0;
    `
      : "";
  }}
`;
