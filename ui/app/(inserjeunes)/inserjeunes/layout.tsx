import Container from "#/app/components/Container";
import { Typograhpy, Box } from "#/app/components/MaterialUINext";
import InformationSvg from "#/public/dsfr/artwork/pictograms/system/information.svg";
import { Button } from "@codegouvfr/react-dsfr/Button";

export default function PageLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          width: "100%",
          margin: "auto",
          maxWidth: 1200,
        }}
      >
        {children}
      </div>
      <Container variant={"content"} maxWidth={false} sx={{ mt: "10rem" }}>
        <Box display="flex" justifyContent="center" alignItems="center" minWidth="100%" flexDirection={"column"}>
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            minWidth="100%"
            flexDirection={"row"}
            margin={2}
          >
            <img
              alt=" Tout comprendre des données InserJeunes ?"
              className="fr-responsive-img"
              style={{ height: "3rem", width: "auto" }}
              src={`${InformationSvg}#artwork-minor`}
              data-fr-js-ratio="true"
            />
            <Typograhpy variant="h5">Tout comprendre des données InserJeunes ?</Typograhpy>
          </Box>
          <Button priority="secondary">Consulter la documentation</Button>
        </Box>
      </Container>
    </>
  );
}
