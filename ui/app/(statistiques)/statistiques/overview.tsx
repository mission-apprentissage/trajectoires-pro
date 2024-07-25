import { Typography, Stack } from "#/app/components/MaterialUINext";
import Container from "#/app/components/Container";
import Item from "#/app/components/Item";
import { fr } from "@codegouvfr/react-dsfr";
import { couverturesInfo } from "#/app/(statistiques)/statistiques/stats";

function BlockCouverture({ couvertures, nom, type }: { couvertures: any; nom: string; type: string }) {
  const labelFormation = type === "national" ? "Certifications" : "Formations";

  return (
    <>
      <Typography variant="body2" sx={{ marginBottom: fr.spacing("2v"), fontWeight: "bold" }}>
        {nom}
      </Typography>

      <Stack
        sx={{ backgroundColor: "var(--background-alt-grey-active)", padding: "1px", marginBottom: fr.spacing("4v") }}
        direction={{ sm: "column", md: "row" }}
        spacing={"1px"}
      >
        <Item>
          <Typography variant="h2">{couvertures?.couverte[type].toLocaleString("fr")}</Typography>
          <Typography variant="body1" sx={{ fontWeight: "bold" }}>
            {labelFormation} couvertes
          </Typography>
        </Item>
        <Item>
          <Typography variant="h2">{couvertures?.couverteVoiePro[type].toLocaleString("fr")}</Typography>
          <Typography variant="body1" sx={{ fontWeight: "bold" }}>
            {labelFormation} en voie scolaire
          </Typography>
        </Item>
        <Item>
          <Typography variant="h2">{couvertures?.couverteApprentissage[type].toLocaleString("fr")}</Typography>
          <Typography variant="body1" sx={{ fontWeight: "bold" }}>
            {labelFormation} en apprentissage
          </Typography>
        </Item>
        <Item>
          <Typography variant="h2">{Math.round(couvertures?.couverteBetween.count[type] * 100)}%</Typography>
          <Typography variant="body1" sx={{ fontWeight: "bold", textAlign: "center" }}>
            Augmentation de la couverture depuis {couvertures?.couverteBetween.date}
          </Typography>
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
        <Typography variant="h6" sx={{ marginBottom: fr.spacing("2v") }}>
          Nos données
        </Typography>

        <BlockCouverture couvertures={couvertures} nom={"Au niveau national"} type={"national"} />
        <BlockCouverture couvertures={couvertures} nom={"Au niveau régional"} type={"regional"} />
        <BlockCouverture couvertures={couvertures} nom={"Au niveau établissement"} type={"etablissement"} />
      </Container>
    </>
  );
}
