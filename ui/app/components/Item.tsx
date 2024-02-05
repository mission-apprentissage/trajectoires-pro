"use client";
import styled from "@emotion/styled";
import { Box } from "#/app/components/MaterialUINext";
import { BoxProps } from "@mui/material/Box";
import { fr } from "@codegouvfr/react-dsfr";

export interface ItemProps extends BoxProps {
  variant?: string;
}

const Item = styled(Box)<ItemProps>`
  display: flex;
  justify-content: center;
  width: 100%;
  ${({ variant }) => {
    switch (variant) {
      case "empty":
        return ``;
      default:
        return "background-color: white;";
    }
  }}
  flex-direction: column;
  align-content: center;
  align-items: center;
  padding: ${fr.spacing("2v")};
`;

export default Item;
