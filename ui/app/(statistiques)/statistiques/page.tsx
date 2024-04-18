import "server-only";
import { Typograhpy } from "#/app/components/MaterialUINext";
import Container from "#/app/components/Container";
import * as Metabase from "#/app/(statistiques)/statistiques/api/metabase";
import MetabaseIframe from "#/app/components/MetabaseIframe";
import { MetabaseConfig } from "#/types/metabase";
import Config from "#/app/(statistiques)/statistiques/config";
import Overview from "./overview";
import Plateformes from "./plateformes";
import { fr } from "@codegouvfr/react-dsfr";

export const revalidate = false;

export default async function Page() {
  const dashboards = (Config.METABASE as unknown as MetabaseConfig).dashboards;
  const iframeStatsRegion = await Metabase.iframe(dashboards.statsRegion.id, {});

  return (
    <>
      <Typograhpy variant="h2">{"Vue d'ensemble"}</Typograhpy>
      <Typograhpy variant="body1">{""}</Typograhpy>

      <Overview />

      <Plateformes />

      <Container variant="subContent" maxWidth={false} sx={{ marginTop: fr.spacing("5v") }}>
        <Typograhpy variant="h6" sx={{ marginBottom: fr.spacing("2v") }}>
          {"Vues par région de formations"}
        </Typograhpy>
        <MetabaseIframe title="Vue metabase des appels par région" height={"400"} url={iframeStatsRegion} />
      </Container>
    </>
  );
}
