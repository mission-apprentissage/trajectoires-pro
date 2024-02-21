import { Typograhpy, Stack } from "#/app/components/MaterialUINext";
import Container from "#/app/components/Container";
import Item from "#/app/components/Item";
import { fr } from "@codegouvfr/react-dsfr";
import { couverturesInfo } from "#/app/(statistiques)/statistiques/stats";

function BlockCouverture({ couvertures, nom, type }: { couvertures: any; nom: string; type: string }) {
  const labelFormation = type === "national" ? "Certifications" : "Formations";

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
            {labelFormation} couvertes
          </Typograhpy>
        </Item>
        <Item>
          <Typograhpy variant="h2">{couvertures?.couverteVoiePro[type].toLocaleString("fr")}</Typograhpy>
          <Typograhpy variant="body1" sx={{ fontWeight: "bold" }}>
            {labelFormation} en voie scolaire
          </Typograhpy>
        </Item>
        <Item>
          <Typograhpy variant="h2">{couvertures?.couverteApprentissage[type].toLocaleString("fr")}</Typograhpy>
          <Typograhpy variant="body1" sx={{ fontWeight: "bold" }}>
            {labelFormation} en apprentissage
          </Typograhpy>
        </Item>
        <Item>
          <Typograhpy variant="h2">{Math.round(couvertures?.couverteBetween.count[type] * 100)}%</Typograhpy>
          <Typograhpy variant="body1" sx={{ fontWeight: "bold", textAlign: "center" }}>
            Augmentation de la couverture depuis {couvertures?.couverteBetween.date}
          </Typograhpy>
        </Item>
      </Stack>
    </>
  );
}

export default async function Overview() {
  const couvertures = await couverturesInfo();

  return (
    <>
      <Container
        variant="subContent"
        maxWidth={false}
        sx={{ marginBottom: fr.spacing("5v"), marginTop: fr.spacing("5v") }}
      >
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
