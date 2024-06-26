"use client";
import React from "react";
import { Typography } from "#/app/components/MaterialUINext";
import { fr } from "@codegouvfr/react-dsfr";
import { FormationTag } from "#/types/formation";
import Tag from "#/app/components/Tag";
import { FORMATION_TAG } from "#/app/services/formation";

export default function FormationAllTags({
  selected,
  onClick,
}: {
  selected?: FormationTag | null;
  onClick?: (tag: FormationTag) => void;
}) {
  return FORMATION_TAG.map((tagElt) => {
    return (
      <Tag
        key={"tag_" + tagElt.tag}
        variant="button-white"
        style={{ ...(selected === tagElt.tag ? { backgroundColor: "var(--background-default-grey-active)" } : {}) }}
        nativeButtonProps={{
          onClick: function () {
            onClick && onClick(tagElt.tag);
          },
        }}
      >
        <i
          style={{ color: "white", background: tagElt.color, marginRight: fr.spacing("2v") }}
          className={"circle-icon fr-icon--sm " + fr.cx(tagElt.icon)}
        ></i>
        <Typography color={tagElt.color} variant="subtitle1">
          {tagElt.libelle}
        </Typography>
      </Tag>
    );
  });
}
