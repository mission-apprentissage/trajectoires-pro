import { fr } from "@codegouvfr/react-dsfr";
import Divider, { DividerProps } from "@mui/material/Divider";

export default function CustomDivider(props: DividerProps) {
  return (
    <Divider
      component="div"
      style={{ marginTop: fr.spacing("5v"), marginBottom: fr.spacing("5v"), ...props.style }}
      {...props}
    />
  );
}
