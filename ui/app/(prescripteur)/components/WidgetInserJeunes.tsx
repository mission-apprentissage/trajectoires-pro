"use client";
import React from "react";
import { Etablissement, FormationDetail } from "#/types/formation";

export default function WidgetInserJeunes({
  etablissement,
  formation,
}: {
  etablissement: Etablissement;
  formation: FormationDetail;
}) {
  const WIDGET_HASH = process.env.NEXT_PUBLIC_EXPOSITION_WIDGET_HASH;
  const API_URL = process.env.NEXT_PUBLIC_EXPOSITION_API_BASE_URL || "";
  const HOST = API_URL.split("/").slice(0, 3).join("/");

  const code = formation.voie === "apprentissage" ? formation.cfd : formation.mef11;

  return (
    <>
      <div>
        <iframe
          style={{ display: "block", width: "100%", height: 0 }}
          scrolling="no"
          frameBorder="0"
          src={`${API_URL}/inserjeunes/formations/${etablissement.uai}-${code}/widget/${WIDGET_HASH}?noTitle=true&responsiveWidth=28em`}
          onLoad={(i) => {
            window.addEventListener(
              "message",
              function (t) {
                HOST !== t.origin || isNaN(t.data) || ((i.target as HTMLIFrameElement).style.height = t.data + "px");
              },
              !1
            );
          }}
        ></iframe>
      </div>
    </>
  );
}
