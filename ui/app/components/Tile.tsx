"use client";
import { Tile as TileDsfr } from "@codegouvfr/react-dsfr/Tile";
import styled from "@emotion/styled";

const Tile = styled(TileDsfr)`
  box-shadow: 1px 2px 10px 0px rgba(89, 87, 87, 0.85);
  border-radius: 10px;
  .fr-tile__title::before {
    content: none;
  }
  .fr-tile__title a::before {
    background-image: none;
  }

  .fr-tile__title a::after {
    content: none !important;
  }

  .fr-tile__title {
    font-weight: 500;
  }

  .fr-tile__title a {
    color: var(--text-default-grey);
  }

  .fr-tile__img {
    margin: 0 auto 0;
  }

  ${({ desc }) =>
    !desc &&
    `
  .fr-tile__desc {
    display: none;
  }
  `}
`;
export default Tile;
