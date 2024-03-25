import { NextAppDirEmotionCacheProvider } from "tss-react/next";
import { DsfrProvider } from "@codegouvfr/react-dsfr/next-appdir/DsfrProvider";
import MuiDsfrThemeProvider from "#/app/components/MuiDsfrThemeProvider";
import { Header } from "@codegouvfr/react-dsfr/Header";
import Providers from "#/app/provider";

export default function Layout({
  title,
  tagline,
  children,
  header,
}: {
  title: string;
  tagline?: string;
  header?: JSX.Element;
  children: JSX.Element;
}) {
  return (
    <DsfrProvider>
      <NextAppDirEmotionCacheProvider options={{ key: "css" }}>
        <MuiDsfrThemeProvider>
          <Providers>
            {header || (
              <Header
                brandTop={
                  <>
                    RÉPUBLIQUE
                    <br />
                    FRANÇAISE
                  </>
                }
                serviceTitle={title}
                serviceTagline={tagline}
                homeLinkProps={{
                  href: "/",
                  title,
                }}
                quickAccessItems={[]}
              />
            )}
            <div
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                width: "100%",
                margin: "auto",
              }}
            >
              {children}
            </div>
          </Providers>
        </MuiDsfrThemeProvider>
      </NextAppDirEmotionCacheProvider>
    </DsfrProvider>
  );
}
