"use client";
import { createMuiDsfrThemeProvider } from "@codegouvfr/react-dsfr/mui";
import { merge } from "lodash-es";

declare module "@mui/material/styles" {
  interface Theme {
    custom: {
      isDarkModeEnabled: boolean;
    };
  }
}

const { MuiDsfrThemeProvider } = createMuiDsfrThemeProvider({
  augmentMuiTheme: ({ nonAugmentedMuiTheme, isDark }) => {
    return {
      ...merge(nonAugmentedMuiTheme, {
        typography: {
          subtitle1: {
            fontSize: 18,
            fontWeight: 700,
          },
          subtitle2: {
            fontSize: 16,
            fontWeight: 700,
          },
        },
      }),
      custom: {
        isDarkModeEnabled: isDark,
      },
    };
  },
});

export default MuiDsfrThemeProvider;
