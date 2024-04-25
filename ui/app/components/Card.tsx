"use client";
import { fr } from "@codegouvfr/react-dsfr";
import styled from "@emotion/styled";
import Link from "next/link";
import { Box, Container, Typograhpy } from "./MaterialUINext";
import { isNil } from "lodash-es";
import { CardActionArea, CardActionAreaProps, Grid, Stack, Typography } from "@mui/material";

export interface CardProps {
  title?: string | JSX.Element | null;
  children?: JSX.Element | JSX.Element[];
  className?: string;
  link?: string;
  selected?: boolean;
  actionProps?: CardActionAreaProps;
}

function BaseCard({ title, children, className }: CardProps) {
  return (
    <Box className={className}>
      {title && (typeof title === "string" ? <Typograhpy variant="h4">{title}</Typograhpy> : title)}
      <Container style={{ padding: fr.spacing("3v") }}>{children}</Container>
    </Box>
  );
}

export function Card({ title, link, children, className, actionProps }: CardProps) {
  return link ? (
    <Link href={link}>
      <CardActionArea {...actionProps} className={className}>
        <BaseCard title={title}>{children}</BaseCard>
      </CardActionArea>
    </Link>
  ) : (
    <BaseCard title={title} className={className}>
      {children}
    </BaseCard>
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

  ${({ selected }) => {
    return !isNil(selected) && selected ? "background-color: var(--hover);" : "";
  }}
`;
