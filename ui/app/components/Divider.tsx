import { fr } from "@codegouvfr/react-dsfr";
import Divider, { DividerProps } from "@mui/material/Divider";

export default function CustomDivider({ noMargin, ...props }: DividerProps & { noMargin?: boolean }) {
  return (
    <Divider
      component="div"
      style={{
        marginTop: noMargin ? 0 : fr.spacing("5v"),
        marginBottom: noMargin ? 0 : fr.spacing("5v"),
        ...props.style,
      }}
      {...props}
    />
  );
}
