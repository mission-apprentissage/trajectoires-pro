import { NextAppDirEmotionCacheProvider } from "tss-react/next";
import PlausibleProvider from "next-plausible";
import { DsfrProvider } from "@codegouvfr/react-dsfr/next-appdir/DsfrProvider";
import MuiDsfrThemeProvider from "@codegouvfr/react-dsfr/mui";
import { Header } from "@codegouvfr/react-dsfr/Header";
import { fr } from "@codegouvfr/react-dsfr";

export default function BaseLayout({ children }: { children: JSX.Element }) {
  const title = "Exposition des données InserJeunes - Statistiques";
  return (
    <DsfrProvider>
      <NextAppDirEmotionCacheProvider options={{ key: "css" }}>
        <MuiDsfrThemeProvider>
          <PlausibleProvider domain={process.env.STATISTIQUES_SITE_HOST || ""}>
            <Header
              brandTop={
                <>
                  RÉPUBLIQUE
                  <br />
                  FRANÇAISE
                </>
              }
              serviceTitle={title}
              homeLinkProps={{
                href: "/",
                title: title,
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
              {children}
            </div>
          </PlausibleProvider>
        </MuiDsfrThemeProvider>
      </NextAppDirEmotionCacheProvider>
    </DsfrProvider>
  );
}
