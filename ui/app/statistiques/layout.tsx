import { NextAppDirEmotionCacheProvider } from "tss-react/next";
import { DsfrHead } from "@codegouvfr/react-dsfr/next-appdir/DsfrHead";
import { DsfrProvider } from "@codegouvfr/react-dsfr/next-appdir/DsfrProvider";
import { getHtmlAttributes } from "@codegouvfr/react-dsfr/next-appdir/getHtmlAttributes";
import StartDsfr from "../StartDsfr";
import { defaultColorScheme } from "../defaultColorScheme";
import MuiDsfrThemeProvider from "@codegouvfr/react-dsfr/mui";
import Link from "next/link";
import { Typograhpy } from "#/app/components/MaterialUINext";
import Container from "#/app/components/Container";
import { Header } from "@codegouvfr/react-dsfr/Header";
import { fr } from "@codegouvfr/react-dsfr";

export function Layout({ children }: { children: JSX.Element }) {
  return (
    <DsfrProvider>
      <NextAppDirEmotionCacheProvider options={{ key: "css" }}>
        <MuiDsfrThemeProvider>
          <Header
            brandTop={<>Exposition - Statistique</>}
            serviceTitle="Exposition - Statistique"
            homeLinkProps={{
              href: "/",
              title: "Exposition - Statistique",
            }}
            quickAccessItems={[]}
          />
          <div
            style={{
              flex: 1,
              width: "100%",
              margin: "auto",
              maxWidth: 1200,
              ...fr.spacing("padding", {
                topBottom: "10v",
              }),
            }}
          >
            <Container variant="content" maxWidth={false}>
              <Typograhpy variant="h3">{"Page statistiques du projet Exposition d'InserJeunes"}</Typograhpy>
              <Typograhpy variant="body1">{""}</Typograhpy>

              <Container variant="subContent" maxWidth={false}>
                {children}
              </Container>
            </Container>
          </div>
        </MuiDsfrThemeProvider>
      </NextAppDirEmotionCacheProvider>
    </DsfrProvider>
  );
}

export default function RootLayout({ children }: { children: JSX.Element }) {
  const lang = "fr";

  return (
    <html
      {...getHtmlAttributes({ defaultColorScheme, lang })}
      style={{
        overflow: "-moz-scrollbars-vertical",
        overflowY: "scroll",
      }}
    >
      <head>
        <title>Exposition - Statistiques</title>
        <StartDsfr />
        <DsfrHead
          Link={Link}
          preloadFonts={[
            "Marianne-Regular",
            "Marianne-Medium",
            // //"Marianne-Light",
            // //"Marianne-Light_Italic",
            // "Marianne-Regular",
            // //"Marianne-Regular_Italic",
            // "Marianne-Medium",
            // //"Marianne-Medium_Italic",
            // "Marianne-Bold",
            // //"Marianne-Bold_Italic",
            // //"Spectral-Regular",
            // //"Spectral-ExtraBold"
          ]}
        />
      </head>
      <body
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Layout>{children}</Layout>
      </body>
    </html>
  );
}
