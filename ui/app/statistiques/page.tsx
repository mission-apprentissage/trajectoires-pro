import "server-only";
import { headers } from "next/headers";
import * as Metabase from "#/app/api/metabase";
import MetabaseIframe from "#/app/components/MetabaseIframe";
import { MetabaseConfig } from "../types/metabase";
import Config from "../config";

export const revalidate = 0;

export default async function Page() {
  const dashboards = (Config.METABASE as unknown as MetabaseConfig).dashboards;
  const iframeStatsUrl = await Metabase.iframe(
    dashboards.stats.id,
    {},
    dashboards.stats.defaultQueryParams,
    dashboards.stats.hideParams
  );

  return (
    <>
      <MetabaseIframe url={iframeStatsUrl} />
    </>
  );
}