import "server-only";
import { headers } from "next/headers";
import { Typograhpy } from "#/app/components/MaterialUINext";
import Container from "#/app/components/Container";
import * as Metabase from "#/app/(statistiques)/statistiques/api/metabase";
import MetabaseIframe from "#/app/components/MetabaseIframe";
import { MetabaseConfig } from "#/types/metabase";
import Config from "#/app/(statistiques)/statistiques/config";
import Overview from "./overview";
import { fr } from "@codegouvfr/react-dsfr";

export const revalidate = 0;

export default async function Page() {
  const dashboards = (Config.METABASE as unknown as MetabaseConfig).dashboards;
  const iframeStatsUrl = await Metabase.iframe(
    dashboards.stats.id,
    {},
    dashboards.stats.defaultQueryParams,
    dashboards.stats.hideParams
  );

  const iframeStatsRegion = await Metabase.iframe(dashboards.statsRegion.id, {});

  return (
    <>
      <Overview />

      <Container variant="subContent" maxWidth={false} sx={{ marginTop: fr.spacing("5v") }}>
        <Typograhpy variant="h6">{"Statistiques détaillées du projet Exposition d'InserJeunes"}</Typograhpy>
        <MetabaseIframe title="Vue metabase des appels d'API" url={iframeStatsUrl} />
      </Container>

      <Container variant="subContent" maxWidth={false} sx={{ marginTop: fr.spacing("5v") }}>
        <Typograhpy variant="h6" sx={{ marginBottom: fr.spacing("2v") }}>
          {"Vues par région de formations"}
        </Typograhpy>
        <MetabaseIframe title="Vue metabase des appels par région" height={"400"} url={iframeStatsRegion} />
      </Container>
    </>
  );
}
