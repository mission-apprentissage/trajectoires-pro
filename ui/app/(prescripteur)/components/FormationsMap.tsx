"use client";
import React, { useMemo } from "react";
import dynamic from "next/dynamic";
import { LeafletHomeIcon, LeafletEtablissementIcon, LeafletSelectedEtablissementIcon } from "#/app/components/Map";
import { Etablissement, Formation } from "#/types/formation";
import { LatLngTuple } from "leaflet";

const Map = dynamic(() => import("#/app/components/Map"), { ssr: false });
const Marker = dynamic(() => import("react-leaflet").then((mod) => mod.Marker), { ssr: false });
const Popup = dynamic(() => import("react-leaflet").then((mod) => mod.Popup), { ssr: false });
const Tooltip = dynamic(() => import("react-leaflet").then((mod) => mod.Tooltip), { ssr: false });

export default function FormationsMap({
  latitude,
  longitude,
  etablissements,
  selected,
  onMarkerClick,
}: {
  latitude: number;
  longitude: number;
  etablissements: any[];
  selected?: Formation | null;
  onMarkerClick?: (etablissement: Etablissement) => void;
}) {
  const selectedCoordinate: LatLngTuple | null = useMemo(() => {
    return selected
      ? [selected.etablissement.coordinate.coordinates[1], selected.etablissement.coordinate.coordinates[0]]
      : null;
  }, [selected]);

  return (
    <Map center={selectedCoordinate ? selectedCoordinate : [latitude, longitude]}>
      {etablissements.map((etablissement: Etablissement) => {
        const key = `marker_${etablissement.uai}`;
        const coordinate = etablissement.coordinate.coordinates;
        const isSelected = selected?.etablissement.uai === etablissement.uai;

        return (
          <Marker
            icon={isSelected ? LeafletSelectedEtablissementIcon : LeafletEtablissementIcon}
            zIndexOffset={isSelected ? 10500 : 0}
            key={key}
            position={[coordinate[1], coordinate[0]]}
            bubblingMouseEvents={false}
            eventHandlers={{
              click: (e) => {
                onMarkerClick && onMarkerClick(etablissement);
              },
            }}
          >
            {/* <Popup>{etablissement.libelle}</Popup>
            <Tooltip>
              <div style={{ width: "300px" }}>
                <Typography sx={{ whiteSpace: "pre-line" }} variant="subtitle1">
                  {etablissement.libelle}
                </Typography>
                {etablissement.accessTime && (
                  <Typography variant="body1">
                    À moins de {Math.round(etablissement.accessTime / 60)} minutes
                  </Typography>
                )}
                <Typography variant="body1">{etablissement.address.street}</Typography>
                <Typography variant="body1">
                  {etablissement.address.postCode} {etablissement.address.city}
                </Typography>
              </div>
            </Tooltip> */}
          </Marker>
        );
      })}

      <Marker icon={LeafletHomeIcon} zIndexOffset={10000} position={[latitude, longitude]}>
        {/* <Tooltip>
          <Typography variant="subtitle1">Ma position</Typography>
        </Tooltip> */}
      </Marker>
    </Map>
  );
}
