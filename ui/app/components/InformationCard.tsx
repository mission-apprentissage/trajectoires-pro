"use client";
import styled from "@emotion/styled";
import { ContainerProps as MUIContainerProps } from "@mui/material/Container";
import { Container as MUIContainer } from "#/app/components/MaterialUINext";
import { fr } from "@codegouvfr/react-dsfr";

export interface InformationCardProps extends MUIContainerProps {}

function InformationCard({ children, ...props }: InformationCardProps) {
  return (
    <MUIContainer {...props}>
      <>{children}</>
    </MUIContainer>
  );
}

export default styled(InformationCard)<InformationCardProps>`
  background-color: #e3e3fd;
  border: 1px solid #dddddd;
  border-radius: 10px;
  padding-top: ${fr.spacing("3v")};
  padding-bottom: ${fr.spacing("3v")};
`;
