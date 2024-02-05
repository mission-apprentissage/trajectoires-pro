import { Typograhpy, Stack, Box } from "#/app/components/MaterialUINext";
import Container from "#/app/components/Container";
import Item from "#/app/components/Item";
import { fr } from "@codegouvfr/react-dsfr";
import { plateformesInfo, statsInfo, couverturesInfo } from "#/app/(statistiques)/statistiques/stats";

function BlockCouverture({ couvertures, nom, type }: { couvertures: any; nom: string; type: string }) {
  return (
    <>
      <Typograhpy variant="body2" sx={{ marginBottom: fr.spacing("2v"), fontWeight: "bold" }}>
        {nom}
      </Typograhpy>

      <Stack
        sx={{ backgroundColor: "var(--background-alt-grey-active)", padding: "1px", marginBottom: fr.spacing("4v") }}
        direction={{ sm: "column", md: "row" }}
        spacing={"1px"}
      >
        <Item>
          <Typograhpy variant="h2">{couvertures?.couverte[type].toLocaleString("fr")}</Typograhpy>
          <Typograhpy variant="body1" sx={{ fontWeight: "bold" }}>
            Formations couvertes
          </Typograhpy>
        </Item>
        <Item>
          <Typograhpy variant="h2">{couvertures?.couverteVoiePro[type].toLocaleString("fr")}</Typograhpy>
          <Typograhpy variant="body1" sx={{ fontWeight: "bold" }}>
            Formations en voie professionnel
          </Typograhpy>
        </Item>
        <Item>
          <Typograhpy variant="h2">{couvertures?.couverteApprentissage[type].toLocaleString("fr")}</Typograhpy>
          <Typograhpy variant="body1" sx={{ fontWeight: "bold" }}>
            Formations en apprentissage
          </Typograhpy>
        </Item>
        <Item>
          <Typograhpy variant="h2">{couvertures?.couverteBetween.count[type]}</Typograhpy>
          <Typograhpy variant="body1" sx={{ fontWeight: "bold", textAlign: "center" }}>
            Formations couvertes en plus depuis {couvertures?.couverteBetween.date}
          </Typograhpy>
        </Item>
      </Stack>
    </>
  );
}

export default async function Overview() {
  const plateformes = await plateformesInfo();
  const couvertures = await couverturesInfo();
  const stats = await statsInfo();

  return (
    <>
      <Typograhpy variant="h2">{"Vue d'ensemble"}</Typograhpy>
      <Typograhpy variant="body1">{""}</Typograhpy>

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
              Plateformes en ligne
            </Typograhpy>
          </Item>
          <Item>
            <Typograhpy variant="h2">{plateformes?.waiting.length}</Typograhpy>
            <Typograhpy variant="body1" sx={{ fontWeight: "bold" }}>
              Plateformes en étude
            </Typograhpy>
          </Item>
          <Item>
            <Typograhpy variant="h2">{stats.views.toLocaleString("fr")}</Typograhpy>
            <Typograhpy variant="body1" sx={{ fontWeight: "bold" }}>
              Consultations
            </Typograhpy>
          </Item>
          <Item variant="empty"></Item>
        </Stack>
      </Container>

      <Container variant="subContent" maxWidth={false} sx={{ marginTop: fr.spacing("5v") }}>
        <Typograhpy variant="h6" sx={{ marginBottom: fr.spacing("2v") }}>
          Nos données
        </Typograhpy>

        <BlockCouverture couvertures={couvertures} nom={"Au niveau national"} type={"national"} />
        <BlockCouverture couvertures={couvertures} nom={"Au niveau régional"} type={"regional"} />
        <BlockCouverture couvertures={couvertures} nom={"Au niveau établissement"} type={"etablissement"} />
      </Container>
    </>
  );
}
