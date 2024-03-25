"use client";
import styled from "@emotion/styled";
import { ContainerProps as MUIContainerProps } from "@mui/material/Container";
import { Container as MUIContainer } from "#/app/components/MaterialUINext";
import { fr } from "@codegouvfr/react-dsfr";

export interface ContainerProps extends MUIContainerProps {
  variant?: string;
  nopadding?: boolean;
  noShadow?: boolean;
}

function Container({ children, variant, nopadding, noShadow, ...props }: ContainerProps) {
  const className = [
    props.className || "",
    ...(variant === "subContent" ? [fr.cx("fr-card"), !noShadow ? fr.cx("fr-card--shadow") : ""] : []),
  ].join(" ");
  return (
    <MUIContainer {...props} className={className}>
      <>{children}</>
    </MUIContainer>
  );
}

export default styled(Container)<ContainerProps>`
  padding-top: ${({ nopadding }) => (nopadding ? "0" : fr.spacing("3w"))};
  padding-bottom: ${({ nopadding }) => (nopadding ? "0" : fr.spacing("3w"))};
  padding-left: ${({ nopadding }) => (nopadding ? "0" : fr.spacing("5w"))};
  ${({ variant }) => {
    switch (variant) {
      case "content":
        return `background-color: var(--background-alt-grey);`;
      case "subContent":
        return `background-color: var(--background-raised-grey);`;
      default:
        return "";
    }
  }}
`;
