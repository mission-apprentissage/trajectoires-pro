"use client";
import { fr } from "@codegouvfr/react-dsfr";
import styled from "@emotion/styled";
import { Box, Container, Typograhpy } from "./MaterialUINext";

export interface CardProps {
  title?: string | JSX.Element | null;
  children?: JSX.Element | JSX.Element[];
  className?: string;
}

export function Card({ title, children, className }: CardProps) {
  return (
    <Box className={className}>
      {title && (typeof title === "string" ? <Typograhpy variant="h4">{title}</Typograhpy> : title)}
      <Container style={{ padding: fr.spacing("3v") }}>{children}</Container>
    </Box>
  );
}

export default styled(Card)<CardProps>`
  border: 1px solid #dddddd;
  border-radius: 10px;
  padding: 0;
  overflow: hidden;

  h4 {
    background-color: #f5f5fe;
    color: var(--blue-france-sun-113-625);
    padding: ${fr.spacing("3v")};
  }
`;
