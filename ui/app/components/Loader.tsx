import { CSSProperties } from "react";
import styled from "@emotion/styled";
import { CircularProgress, Grid } from "#/app/components/MaterialUINext";
import { fr } from "@codegouvfr/react-dsfr";

interface LoaderProps {
  style?: CSSProperties | undefined;
  withMargin?: boolean;
  className?: string;
}

function Loader({ style, className }: LoaderProps) {
  return (
    <Grid
      className={className}
      container
      style={style}
      spacing={0}
      direction="column"
      alignItems="center"
      justifyContent="center"
    >
      <Grid item xs={3}>
        <CircularProgress />
      </Grid>
    </Grid>
  );
}

export default styled(Loader)<LoaderProps>`
  ${({ withMargin }) => {
    return withMargin ? `margin-top: ${fr.spacing("5v")};` : "";
  }}
`;
