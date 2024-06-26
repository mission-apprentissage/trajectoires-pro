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

  const widgetCode = `<iframe onLoad="!function(i){window.addEventListener('message',function(t){'${HOST}'!==t.origin||isNaN(t.data)||(i.style.height=t.data+'px')},!1)}(this);" style="width: 100%; height: 0;" 
  src="${API_URL}/inserjeunes/formations/${etablissement.uai}-${code}/widget/${WIDGET_HASH}?noTitle=true&responsiveWidth=28em"
   scrolling="no" frameBorder="0"></iframe>`;

  return (
    <>
      <div dangerouslySetInnerHTML={{ __html: widgetCode }}></div>
    </>
  );
}
