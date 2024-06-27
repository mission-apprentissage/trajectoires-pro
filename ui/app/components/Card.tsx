"use client";
import { fr } from "@codegouvfr/react-dsfr";
import styled from "@emotion/styled";
import Link from "next/link";
import { Box, Container, Typography } from "./MaterialUINext";
import { isNil } from "lodash-es";
import { CardActionArea, CardActionAreaProps } from "@mui/material";

export interface CardProps {
  title?: string | JSX.Element | null;
  children?: JSX.Element | JSX.Element[];
  className?: string;
  link?: string;
  linkTarget?: string;
  selected?: boolean;
  actionProps?: CardActionAreaProps;
}

const StyledLink = styled(Link)`
  &[target="_blank"]::after {
    content: none;
  }
`;

function BaseCard({ title, children, className, ...props }: CardProps) {
  return (
    <Box className={className} {...props}>
      {title && (typeof title === "string" ? <Typography variant="h4">{title}</Typography> : title)}
      <Container style={{ padding: fr.spacing("3v") }}>{children}</Container>
    </Box>
  );
}

export function Card({ title, link, linkTarget, children, className, actionProps, ...props }: CardProps) {
  return link ? (
    <StyledLink href={link} target={linkTarget}>
      <CardActionArea {...actionProps} className={className}>
        <BaseCard {...props} title={title}>
          {children}
        </BaseCard>
      </CardActionArea>
    </StyledLink>
  ) : (
    <BaseCard title={title} className={className} {...props}>
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
