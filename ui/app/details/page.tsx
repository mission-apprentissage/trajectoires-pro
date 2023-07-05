import "server-only";

import * as Metabase from "#/app/api/metabase";
import MetabaseIframe from "#/app/components/MetabaseIframe";
import { Typograhpy } from "../components/MaterialUINext";
import { MetabaseConfig } from "../types/metabase";

export const revalidate = 0;

export default async function Page({
  searchParams,
}: {
  searchParams: { adresse_ip: string; date: string; consumer: string };
}) {
  const { adresse_ip, date, consumer } = searchParams;
  const dashboards = (process.env.METABASE as unknown as MetabaseConfig).dashboards;
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
      <Typograhpy variant="h4">{consumer}</Typograhpy>
      <MetabaseIframe url={iframeStatsUrl} />
    </>
  );
}
