"use client";
import React, { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Typography } from "#/app/components/MaterialUINext";
import { getDistance } from "geolib";
import { formationRoute } from "#/app/api/exposition/formation/route/query";
import Loader from "#/app/components/Loader";
import { fr } from "@codegouvfr/react-dsfr";
import { Etablissement } from "#/types/formation";
import moment from "moment";

export default function FormationRoute({
  etablissement,
  longitude,
  latitude,
}: {
  etablissement: Etablissement;
  longitude?: string | null;
  latitude?: string | null;
}) {
  const address =
    etablissement.address.street + ", " + etablissement.address.postCode + " " + etablissement.address.city;

  const distance = useMemo(() => {
    if (!latitude || !longitude) {
      return null;
    }

    return getDistance(
      { latitude: parseFloat(latitude), longitude: parseFloat(longitude) },
      {
        latitude: etablissement.coordinate.coordinates[1],
        longitude: etablissement.coordinate.coordinates[0],
      },
      0.01
    );
  }, [longitude, latitude, etablissement.coordinate.coordinates]);

  const { isLoading, isError, data } = useQuery({
    staleTime: Infinity,
    cacheTime: Infinity,
    retry: 0,
    queryKey: [
      "formation",
      latitude,
      longitude,
      etablissement.coordinate.coordinates[1],
      etablissement.coordinate.coordinates[0],
    ],
    queryFn: ({ signal }) => {
      if (!latitude || !longitude) {
        return null;
      }

      return formationRoute(
        {
          latitudeA: latitude,
          longitudeA: longitude,
          latitudeB: etablissement.coordinate.coordinates[1],
          longitudeB: etablissement.coordinate.coordinates[0],
        },
        { signal }
      );
    },
  });

  const timeRoute = useMemo(() => {
    if (!data?.paths) {
      return null;
    }

    const legs = data.paths[0].legs;
    const departure = moment(legs[0].departure_time);
    const arrival = moment(legs[legs.length - 1].arrival_time);
    return arrival.diff(departure);
  }, data);

  if (isLoading) {
    return <Loader />;
  }

  return (
    <>
      <Typography
        variant="subtitle2"
        style={{ color: "var(--blue-france-sun-113-625)", marginBottom: fr.spacing("3v") }}
      >
        {timeRoute !== null && (
          <>
            <i className={fr.cx("fr-icon-bus-fill")} style={{ marginRight: fr.spacing("1w") }} />A{" "}
            {(timeRoute / 1000 / 60).toFixed(0)} minutes
          </>
        )}
        {!data?.paths && distance !== null && (
          <>
            <i className={fr.cx("fr-icon-bus-fill")} style={{ marginRight: fr.spacing("1w") }} />A{" "}
            {(distance / 1000).toFixed(2)} km
          </>
        )}

        <a
          style={{ marginLeft: fr.spacing("3v") }}
          href={`https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(
            latitude + "," + longitude
          )}&destination=${encodeURIComponent(address)}&travelmode=transit`}
          target="_blank"
        >
          Voir le trajet
        </a>
      </Typography>
    </>
  );
}