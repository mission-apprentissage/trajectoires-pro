"use client";
import styled from "@emotion/styled";
import Link, { LinkProps as NextLinkProps } from "next/link";

export type LinkProps = {
  noIcon?: boolean;
} & NextLinkProps;

export default styled(Link, {
  shouldForwardProp: (prop) => !["noIcon"].includes(prop),
})<LinkProps>`
  ${({ noIcon }) =>
    noIcon
      ? `::after {
        content: none;
      }`
      : ""}
`;
