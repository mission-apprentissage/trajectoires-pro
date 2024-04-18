import { useState } from "react";
import styled from "@emotion/styled";
import { Collapse, Grid } from "@mui/material";
import { fr } from "@codegouvfr/react-dsfr";

const ButtonDiv = styled.div`
  :hover {
    cursor: pointer;
  }
`;

export default function CustomAccordion({
  label,
  children,
}: {
  label: JSX.Element;
  children: JSX.Element | JSX.Element[];
}) {
  const [expanded, setExpanded] = useState(false);

  //TODO: add aria control
  return (
    <div>
      <ButtonDiv onClick={() => setExpanded(!expanded)}>
        <Grid container>
          <Grid item xs={11}>
            {label}
          </Grid>
          <Grid item xs={1}>
            {expanded ? (
              <i className={fr.cx("fr-icon-arrow-up-s-line")} />
            ) : (
              <i className={fr.cx("fr-icon-arrow-down-s-line")} />
            )}
          </Grid>
        </Grid>
      </ButtonDiv>
      <Collapse in={expanded}>{children}</Collapse>
    </div>
  );
}
