import "server-only";

import { DsfrHead } from "@codegouvfr/react-dsfr/next-appdir/DsfrHead";
import { getHtmlAttributes } from "@codegouvfr/react-dsfr/next-appdir/getHtmlAttributes";
import StartDsfr from "../StartDsfr";
import { DsfrProvider } from "@codegouvfr/react-dsfr/next-appdir/DsfrProvider";
import { defaultColorScheme } from "../defaultColorScheme";
import Link from "next/link";
import { Header } from "@codegouvfr/react-dsfr/Header";
import { Footer } from "@codegouvfr/react-dsfr/Footer";

import Providers from "#/app/providers";
import IJProviders from "./providers";
import * as Url from "#/common/url";
import LogoDares from "#/public/logo-dares.svg";

function Layout({ children }: { children: JSX.Element }) {
  return (
    <DsfrProvider>
      <Providers>
        <IJProviders>
          <Header
            brandTop={<>InserJeunes</>}
            serviceTitle="InserJeunes"
            homeLinkProps={{
              href: Url.getPath("/inserjeunes/"),
              title: "InserJeunes",
            }}
            quickAccessItems={[]}
          />
          {children}
          <Footer
            brandTop={
              <>
                RÉPUBLIQUE
                <br />
                FRANÇAISE
              </>
            }
            accessibility="partially compliant"
            contentDescription={
              <>
                {"Inserjeunes a pour mission de faciliter l'orientation et l'insertion professionnelle des jeunes en"}
                {
                  " élaborant et en rendant visible des indicateurs pertinents, notamment sur l'accès au marché de l'emploi"
                }
                {" et la trajectoire professionnelle après une formation."}
              </>
            }
            termsLinkProps={{
              href: "#",
            }}
            websiteMapLinkProps={{
              href: "#",
            }}
            partnersLogos={{
              sub: [
                {
                  alt: "[DARES]",
                  href: "https://dares.travail-emploi.gouv.fr/",
                  imgUrl: LogoDares.src,
                },
                {
                  alt: "[EDUC]",
                  href: "https://www.education.gouv.fr/",
                  imgUrl: "static/media/placeholder.16x9.3d46f94c.png",
                },
              ],
            }}
          />
        </IJProviders>
      </Providers>
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
        <title>InserJeunes</title>
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
