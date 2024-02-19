import { Typograhpy, Stack } from "#/app/components/MaterialUINext";
import Container from "#/app/components/Container";
import Item from "#/app/components/Item";
import { fr } from "@codegouvfr/react-dsfr";
import { plateformesInfo, statsInfo } from "#/app/(statistiques)/statistiques/stats";
import * as Metabase from "#/app/(statistiques)/statistiques/api/metabase";
import MetabaseIframe from "#/app/components/MetabaseIframe";
import { MetabaseConfig } from "#/types/metabase";
import Config from "#/app/(statistiques)/statistiques/config";

export default async function Plateformes() {
  const plateformes = await plateformesInfo();
  const stats = await statsInfo();

  const dashboards = (Config.METABASE as unknown as MetabaseConfig).dashboards;
  const iframeStatsUrl = await Metabase.iframe(
    dashboards.stats.id,
    {},
    dashboards.stats.defaultQueryParams,
    dashboards.stats.hideParams
  );

  return (
    <>
      <Container variant="subContent" maxWidth={false}>
        <Typograhpy variant="h6" sx={{ marginBottom: fr.spacing("2v") }}>
          Nos partenaires
        </Typograhpy>

        <Stack
          sx={{ backgroundColor: "var(--background-alt-grey-active)", padding: "1px" }}
          direction={{ sm: "column", md: "row" }}
          spacing={"1px"}
        >
          <Item>
            <Typograhpy variant="h2">{plateformes?.production.length}</Typograhpy>
            <Typograhpy variant="body1" sx={{ fontWeight: "bold" }}>
              Plateformes utilisatrices
            </Typograhpy>
          </Item>
          <Item>
            <Typograhpy variant="h2">{plateformes?.waiting.length}</Typograhpy>
            <Typograhpy variant="body1" sx={{ fontWeight: "bold" }}>
              Plateformes candidates
            </Typograhpy>
          </Item>
          <Item>
            <Typograhpy variant="h2">{stats.views.toLocaleString("fr")}</Typograhpy>
            <Typograhpy variant="body1" sx={{ fontWeight: "bold" }}>
              Appels API
            </Typograhpy>
          </Item>
          <Item variant="empty"></Item>
        </Stack>
        <MetabaseIframe title="Vue metabase des appels d'API" url={iframeStatsUrl} />
      </Container>
    </>
  );
}
