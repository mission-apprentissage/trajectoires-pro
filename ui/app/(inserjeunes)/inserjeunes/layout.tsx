import Container from "#/app/components/Container";
import { Typograhpy, Box } from "#/app/components/MaterialUINext";
import InformationSvg from "#/public/dsfr/artwork/pictograms/system/information.svg";
import { Button } from "@codegouvfr/react-dsfr/Button";
import Image from "next/image";

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
            <svg viewBox="0 0 80 80" style={{ height: "3rem", width: "3rem" }}>
              <use className="fr-artwork-decorative" href={`${InformationSvg.src}#artwork-decorative`}></use>
              <use className="fr-artwork-minor" href={`${InformationSvg.src}#artwork-minor`}></use>
              <use className="fr-artwork-major" href={`${InformationSvg.src}#artwork-major`}></use>
            </svg>

            <Typograhpy variant="h5">Tout comprendre des données InserJeunes ?</Typograhpy>
          </Box>
          <Button priority="secondary">Consulter la documentation</Button>
        </Box>
      </Container>
    </>
  );
}
