"use client";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v14-appRouter";
import { DsfrProvider } from "@codegouvfr/react-dsfr/next-appdir/DsfrProvider";
import MuiDsfrThemeProvider from "#/app/components/MuiDsfrThemeProvider";
import { Header } from "@codegouvfr/react-dsfr/Header";
import Providers from "#/app/provider";
import { StyledEngineProvider } from "@mui/material/styles";

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
      <AppRouterCacheProvider options={{ key: "css", speedy: true }}>
        <StyledEngineProvider injectFirst>
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
                  backgroundColor: "#fff",
                }}
              >
                {children}
              </div>
            </Providers>
          </MuiDsfrThemeProvider>
        </StyledEngineProvider>
      </AppRouterCacheProvider>
    </DsfrProvider>
  );
}
