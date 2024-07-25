import "server-only";

import * as Metabase from "#/app/(statistiques)/statistiques/api/metabase";
import MetabaseIframe from "#/app/components/MetabaseIframe";
import Container from "#/app/components/Container";
import { Typography } from "../../../components/MaterialUINext";
import { MetabaseConfig } from "../../../../types/metabase";
import Config from "#/app/(statistiques)/statistiques/config";

export const revalidate = false;

export default async function Page({
  searchParams,
}: {
  searchParams: { adresse_ip: string; date: string; consumer: string };
}) {
  const { adresse_ip, date, consumer } = searchParams;
  const dashboards = (Config.METABASE as unknown as MetabaseConfig).dashboards;
  const iframeStatsUrl = await Metabase.iframe(
    dashboards.statsDetails.id,
    {},
    {
      adresse_ip: adresse_ip.split(","),
      "date_r%25C3%25A9f%25C3%25A9rence": date,
    },
    dashboards.statsDetails.hideParams
  );

  return (
    <>
      <Typography variant="h3">{"Statistiques du projet Exposition d'InserJeunes"}</Typography>
      <Typography variant="body1">{""}</Typography>

      <Container variant="subContent" maxWidth={false}>
        <Typography variant="h4">{consumer}</Typography>
        <MetabaseIframe url={iframeStatsUrl} />
      </Container>
    </>
  );
}
