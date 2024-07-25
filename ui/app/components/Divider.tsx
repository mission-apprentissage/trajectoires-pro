/** @jsxImportSource @emotion/react */
import { fr } from "@codegouvfr/react-dsfr";
import { css } from "@emotion/react";
import Divider, { DividerProps } from "@mui/material/Divider";
import { useTheme } from "@mui/material/styles";

export default function CustomDivider({ margin, className, ...props }: DividerProps & { margin?: string }) {
  const theme = useTheme();
  return (
    <Divider
      component="div"
      style={{
        marginTop: margin !== undefined ? margin : fr.spacing("5v"),
        marginBottom: margin !== undefined ? margin : fr.spacing("5v"),
        ...props.style,
      }}
      className={className}
      css={css`
        ${theme.breakpoints.down("md")} {
          margin: 0;
        }
      `}
      {...props}
    />
  );
}
