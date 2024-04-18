"use client";
import React from "react";
import { Typograhpy } from "#/app/components/MaterialUINext";
import dynamic from "next/dynamic";
import { LeafletEtablissementIcon, LeafletSelectedEtablissementIcon } from "#/app/components/Map";

const Map = dynamic(() => import("#/app/components/Map"), { ssr: false });
const Marker = dynamic(() => import("react-leaflet").then((mod) => mod.Marker), { ssr: false });
const Popup = dynamic(() => import("react-leaflet").then((mod) => mod.Popup), { ssr: false });
const Tooltip = dynamic(() => import("react-leaflet").then((mod) => mod.Tooltip), { ssr: false });

export default function FormationsMap({
  latitude,
  longitude,
  etablissements,
  selected,
}: {
  latitude: number;
  longitude: number;
  etablissements: any[];
  selected?: string | null;
}) {
  return (
    <Map center={[latitude, longitude]}>
      {etablissements.map((etablissement: any) => {
        const key = `marker_${etablissement.uai}`;
        const coordinate = etablissement.coordinate.coordinates;

        return (
          <Marker
            icon={selected === etablissement.uai ? LeafletSelectedEtablissementIcon : LeafletEtablissementIcon}
            key={key}
            position={[coordinate[1], coordinate[0]]}
          >
            <Popup>{etablissement.libelle}</Popup>
            <Tooltip>
              <div style={{ width: "300px" }}>
                <Typograhpy sx={{ whiteSpace: "pre-line" }} variant="subtitle1">
                  {etablissement.libelle}
                </Typograhpy>
                {etablissement.accessTime && (
                  <Typograhpy variant="body1">
                    A moins de {Math.round(etablissement.accessTime / 60)} minutes
                  </Typograhpy>
                )}
                <Typograhpy variant="body1">{etablissement.address.street}</Typograhpy>
                <Typograhpy variant="body1">
                  {etablissement.address.postCode} {etablissement.address.city}
                </Typograhpy>
              </div>
            </Tooltip>
          </Marker>
        );
      })}
    </Map>
  );
}
