"use client";
import React, { useRef } from "react";
import dynamic from "next/dynamic";
import {
  LeafletHomeIcon,
  LeafletEtablissementIcon,
  LeafletSelectedEtablissementIcon,
  FitBound,
} from "#/app/components/Map";
import { Etablissement, Formation } from "#/types/formation";
import { FeatureGroup, Marker } from "react-leaflet";
import EtablissementCard from "./EtablissementCard";
import DynamicPopup from "./DynamicPopup";
import L from "leaflet";

const Map = dynamic(() => import("#/app/components/Map"), { ssr: false });

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
  const groupRef = useRef<L.FeatureGroup>(null);

  return (
    <Map center={[latitude, longitude]}>
      <FeatureGroup ref={groupRef}>
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
              <DynamicPopup
                offsets={{
                  n: new L.Point(0, -50),
                  ne: new L.Point(0, -50),
                  nw: new L.Point(0, -50),
                  s: new L.Point(0, 0),
                }}
                bounds={{
                  y: 100,
                }}
              >
                <EtablissementCard
                  etablissement={etablissement}
                  latitude={latitude.toString()}
                  longitude={longitude.toString()}
                />
              </DynamicPopup>
            </Marker>
          );
        })}

        <Marker icon={LeafletHomeIcon} zIndexOffset={10000} position={[latitude, longitude]}>
          {/* <Tooltip>
          <Typography variant="subtitle1">Ma position</Typography>
        </Tooltip> */}
        </Marker>
      </FeatureGroup>

      <FitBound key={etablissements.length} groupRef={groupRef} />
    </Map>
  );
}
