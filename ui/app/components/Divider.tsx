import { fr } from "@codegouvfr/react-dsfr";
import { css } from "@emotion/css";
import Divider, { DividerProps } from "@mui/material/Divider";
import { useTheme } from "@mui/material/styles";

export default function CustomDivider({ noMargin, className, ...props }: DividerProps & { noMargin?: boolean }) {
  const theme = useTheme();
  return (
    <Divider
      component="div"
      style={{
        marginTop: noMargin ? 0 : fr.spacing("5v"),
        marginBottom: noMargin ? 0 : fr.spacing("5v"),
        ...props.style,
      }}
      className={
        className +
        " " +
        css`
          ${theme.breakpoints.down("md")} {
            margin: 0;
          }
        `
      }
      {...props}
    />
  );
}
