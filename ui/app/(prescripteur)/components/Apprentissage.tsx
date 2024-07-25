import React from "react";
import { Typography } from "@mui/material";
import Tag from "#/app/components/Tag";
import { FormationDetail } from "#/types/formation";
import "moment/locale/fr";

export function TagApprentissage({ formationDetail }: { formationDetail: FormationDetail }) {
  return (
    formationDetail.voie === "apprentissage" && (
      <Tag
        variant="yellow"
        square
        style={{
          fontWeight: 700,
        }}
      >
        EN ALTERNANCE
      </Tag>
    )
  );
}

export function LabelApprentissage({ formationDetail }: { formationDetail: FormationDetail }) {
  return (
    formationDetail.voie === "apprentissage" && (
      <Typography
        style={{
          fontSize: "16px",
          color: "var(--warning-425-625-hover)",
        }}
      >
        Alternance
      </Typography>
    )
  );
}
