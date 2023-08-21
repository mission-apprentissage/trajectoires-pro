"use client";
import "./StartDsfr";
import React from "react";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { ThemeProvider } from "@emotion/react";
import { NextAppDirEmotionCacheProvider } from "tss-react/next";
import MuiDsfrThemeProvider from "@codegouvfr/react-dsfr/mui";
import { useColors } from "@codegouvfr/react-dsfr/useColors";

function Providers({ children }: React.PropsWithChildren) {
  const colors = useColors();
  const [client] = React.useState(
    new QueryClient({
      defaultOptions: {
        queries: {
          useErrorBoundary: true,
        },
      },
    })
  );

  return (
    <MuiDsfrThemeProvider>
      <NextAppDirEmotionCacheProvider options={{ key: "css" }}>
        <QueryClientProvider client={client}>
          <ThemeProvider theme={colors}>{children}</ThemeProvider>
        </QueryClientProvider>
      </NextAppDirEmotionCacheProvider>
    </MuiDsfrThemeProvider>
  );
}

export default Providers;
