import "server-only";

import * as Metabase from "#/app/api/metabase";
import MetabaseIframe from "#/app/components/MetabaseIframe";
import { MetabaseConfig } from "./types/metabase";

export default async function Page() {
  const dashboards = (process.env.METABASE as unknown as MetabaseConfig).dashboards;
  const iframeStatsUrl = await Metabase.iframe(dashboards.stats.id, {}, dashboards.stats.defaultQueryParams);

  return (
    <>
      <MetabaseIframe url={iframeStatsUrl} />
    </>
  );
}
