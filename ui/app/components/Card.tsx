"use client";
import { fr } from "@codegouvfr/react-dsfr";
import styled from "@emotion/styled";
import Link from "next/link";
import { Box, Container, Typography } from "./MaterialUINext";
import { isNil } from "lodash-es";
import { CardActionArea, CardActionAreaProps, CardProps as MUICardProps } from "@mui/material";

export type CardProps = Omit<MUICardProps, "title"> & {
  title?: string | JSX.Element | null;
  link?: string;
  linkTarget?: string;
  selected?: boolean;
  actionProps?: CardActionAreaProps;
};

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

export function Card({ title, link, linkTarget, style, children, className, actionProps, ...props }: CardProps) {
  if (link) {
    return (
      <StyledLink href={link} target={linkTarget} style={style}>
        <CardActionArea {...actionProps} className={className}>
          <BaseCard {...props} title={title}>
            {children}
          </BaseCard>
        </CardActionArea>
      </StyledLink>
    );
  }

  if (actionProps) {
    return (
      <CardActionArea {...actionProps} style={style} className={className}>
        <BaseCard {...props} title={title}>
          {children}
        </BaseCard>
      </CardActionArea>
    );
  }

  return (
    <BaseCard title={title} className={className} style={style} {...props}>
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
