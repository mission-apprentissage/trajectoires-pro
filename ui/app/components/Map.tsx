"use client";

import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";
import "leaflet-defaulticon-compatibility";
import { ReactNode, useEffect, useRef } from "react";
import { Popup, Marker, TileLayer, Tooltip, useMap } from "react-leaflet";
import { Typograhpy } from "./MaterialUINext";
import { useWindowSize, useWindowWidth, useWindowHeight } from "@react-hook/window-size";
import { DivIcon } from "leaflet";
import { renderToString } from "react-dom/server";
import { fr } from "@codegouvfr/react-dsfr";
import VectorTileLayer from "react-leaflet-vector-tile-layer";
import dynamic from "next/dynamic";

const MapContainer = dynamic(() => import("react-leaflet").then((mod) => mod.MapContainer), { ssr: false });

const HomeIcon = new DivIcon({
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  popupAnchor: [-3, -76],
  className: "custom-leaflet-icon",
  html: renderToString(<i className={fr.cx("fr-icon-home-4-fill") + " " + "fr-icon--lg"} />),
});

function MapAutoresize() {
  const map = useMap();
  const resizeObserver = useRef<ResizeObserver | null>(null);

  useEffect(() => {
    resizeObserver.current = new ResizeObserver(() => {
      map.invalidateSize();
    });
    const container = map.getContainer();
    resizeObserver.current.observe(container);

    return () => {
      resizeObserver && resizeObserver.current && resizeObserver.current.disconnect();
    };
  }, []);
  return <></>;
}

export default function Map({ center, children }: { center: any; children?: ReactNode }) {
  return (
    <MapContainer scrollWheelZoom={true} style={{ height: "100%", width: "100%" }} center={center} zoom={13}>
      <MapAutoresize />
      <VectorTileLayer styleUrl="https://openmaptiles.geo.data.gouv.fr/styles/osm-bright/style.json" />

      {children}
      {center && (
        <Marker icon={HomeIcon} position={center}>
          <Tooltip>
            <Typograhpy variant="subtitle1">Ma position</Typograhpy>
          </Tooltip>
        </Marker>
      )}
    </MapContainer>
  );
}
