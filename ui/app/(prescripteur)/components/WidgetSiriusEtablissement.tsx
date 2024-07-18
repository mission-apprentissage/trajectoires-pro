"use client";
import React, { useEffect, useRef, useState } from "react";
import { Etablissement } from "#/types/formation";

export default function WidgetSiriusEtablissement({
  etablissement,
  fallbackComponent,
}: {
  fallbackComponent?: JSX.Element;
  etablissement: Etablissement;
}) {
  const [isNotFound, setIsNotFound] = useState(false);
  const API_URL = process.env.NEXT_PUBLIC_SIRIUS_API_BASE_URL || "https://sirius.inserjeunes.beta.gouv.fr";

  const ref = useRef<HTMLDivElement>(null);
  const widgetCode = `<iframe style="width: 100%;" src="${API_URL}/iframes/etablissement?uai=${etablissement.uai}"
   scrolling="no" frameBorder="0"></iframe>`;

  useEffect(() => {
    window.addEventListener("message", (e) => {
      if (ref.current && e.data?.siriusHeight) {
        // TODO: changer la vérification quand le widget n'existe pas
        if (e.data?.siriusHeight === 50) {
          setIsNotFound(true);
        } else {
          setIsNotFound(false);
        }
        const iframe = ref.current.querySelector("iframe");
        if (iframe) {
          iframe.style.height = e.data.siriusHeight + "px";
        }
      }
    });
  });

  return <>{isNotFound ? fallbackComponent : <div ref={ref} dangerouslySetInnerHTML={{ __html: widgetCode }}></div>}</>;
}
