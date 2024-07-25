"use client";

import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";
import "leaflet-defaulticon-compatibility";
import { ReactNode, RefObject, useEffect, useLayoutEffect, useRef, useState } from "react";
import { ZoomControl, useMap, useMapEvent } from "react-leaflet";
import { DivIcon, LatLngTuple } from "leaflet";
import { renderToString } from "react-dom/server";
import dynamic from "next/dynamic";
import HomeIcon from "./icon/HomeIcon";
import EtablissementIcon from "./icon/EtablissementIcon";

const VectorTileLayer = dynamic(() => import("react-leaflet-vector-tile-layer").then((mod) => mod), {
  ssr: false,
});
const MapContainer = dynamic(() => import("react-leaflet").then((mod) => mod.MapContainer), { ssr: false });

export const LeafletHomeIcon = new DivIcon({
  iconSize: [52, 58],
  iconAnchor: [26, 58],
  popupAnchor: [-3, -76],
  className: "custom-leaflet-icon color-white",
  html: renderToString(<HomeIcon />),
});

export const LeafletEtablissementIcon = new DivIcon({
  iconSize: [52, 58],
  iconAnchor: [26, 58],
  popupAnchor: [-3, -76],
  className: "custom-leaflet-icon color-white",
  html: renderToString(<EtablissementIcon />),
});

export const LeafletSelectedEtablissementIcon = new DivIcon({
  iconSize: [58, 64],
  iconAnchor: [29, 64],
  popupAnchor: [-3, -76],
  className: "custom-leaflet-icon color-grey leaflet-icon-selected",
  html: renderToString(<EtablissementIcon />),
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
  }, [map]);
  return <></>;
}

function TileLayer() {
  const map = useMap();

  if (!map) {
    return <></>;
  }
  return <VectorTileLayer styleUrl="https://openmaptiles.geo.data.gouv.fr/styles/osm-bright/style.json" />;
}

const RecenterAutomatically = ({ position }: { position: LatLngTuple }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(position);
  }, [map, position[0], position[1]]);
  return null;
};

function PreventFocus() {
  const map = useMap();
  map.getContainer().focus = () => {};
  return null;
}

export function FitBound({ groupRef }: { groupRef: RefObject<L.FeatureGroup> }) {
  const [isLoading, setIsLoading] = useState(true);

  const map = useMapEvent("layeradd", () => {
    if (!groupRef?.current) {
      return;
    }

    const bounds = groupRef.current.getBounds();
    if (bounds.isValid()) {
      if (isLoading) {
        setIsLoading(false);
      }
    }
  });

  useEffect(() => {
    if (!groupRef?.current) {
      return;
    }

    const bounds = groupRef.current.getBounds();
    if (bounds.isValid()) {
      if (isLoading) {
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    if (isLoading || !groupRef?.current) {
      return;
    }

    const bounds = groupRef.current.getBounds();
    map.fitBounds(bounds);
  }, [isLoading]);
  return null;
}

export default function Map({ center, children }: { center: LatLngTuple; children?: ReactNode }) {
  const [unmountMap, setUnmountMap] = useState(false);
  //to prevent map re-initialization
  useLayoutEffect(() => {
    setUnmountMap(false);
    return () => {
      setUnmountMap(true);
    };
  }, []);

  if (unmountMap) {
    return <></>;
  }

  return (
    <MapContainer
      zoomControl={false}
      scrollWheelZoom={true}
      style={{ height: "100%", width: "100%" }}
      center={center}
      zoom={13}
    >
      <PreventFocus />
      <MapAutoresize />
      <TileLayer />
      {children}
      <RecenterAutomatically position={center} />

      <ZoomControl />
    </MapContainer>
  );
}
