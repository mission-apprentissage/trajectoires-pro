"use client";

import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";
import "leaflet-defaulticon-compatibility";

import { ReactNode, useEffect } from "react";
import { MapContainer, Popup, Marker, TileLayer, Tooltip } from "react-leaflet";
import AutoSizer from "react-virtualized-auto-sizer";
import { Typograhpy } from "./MaterialUINext";
import { useWindowSize, useWindowWidth, useWindowHeight } from "@react-hook/window-size";
import { DivIcon } from "leaflet";
import { renderToString } from "react-dom/server";
import { fr } from "@codegouvfr/react-dsfr";

const HomeIcon = new DivIcon({
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  popupAnchor: [-3, -76],
  className: "custom-leaflet-icon",
  html: renderToString(<i className={fr.cx("fr-icon-home-4-fill") + " " + "fr-icon--lg"} />),
});

export default function Map({ center, children }: { center: any; children?: ReactNode }) {
  return (
    <MapContainer scrollWheelZoom={true} style={{ height: "100%", width: "100%" }} center={center} zoom={13}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

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
