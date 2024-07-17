"use client";
import { createMuiDsfrThemeProvider } from "@codegouvfr/react-dsfr/mui";
import { merge } from "lodash-es";

declare module "@mui/material/styles" {
  interface Theme {
    custom: {
      isDarkModeEnabled: boolean;
    };
  }

  interface TypographyVariantsOptions {
    h1_main?: React.CSSProperties;
    subtitle4?: React.CSSProperties;
  }

  interface TypographyVariants {
    h1_main: React.CSSProperties;
    subtitle4: React.CSSProperties;
  }
}

declare module "@mui/material" {
  interface TypographyPropsVariantOverrides {
    h1_main: true;
    subtitle4: true;
  }

  interface TypographyClasses {
    h1_main: string;
    subtitle4: string;
  }
}

const { MuiDsfrThemeProvider } = createMuiDsfrThemeProvider({
  augmentMuiTheme: ({ nonAugmentedMuiTheme, isDark }) => {
    return {
      ...merge(nonAugmentedMuiTheme, {
        components: {
          MuiTypography: {
            defaultProps: {
              variantMapping: {
                h1_main: "h1",
                subtitle4: "p",
              },
            },
          },
        },
        typography: {
          h1_main: {
            lineHeight: "4.5rem",
            fontSize: "4rem",
            fontWeight: 700,
            [nonAugmentedMuiTheme.breakpoints.down("sm")]: {
              fontSize: "2.5rem",
              lineHeight: "3rem",
            },
          },
          h5: {
            fontSize: "1.25rem",
            lineHeight: "1.75rem",
            [nonAugmentedMuiTheme.breakpoints.up("xs")]: {
              fontSize: "1.25rem",
              lineHeight: "1.75rem",
            },
          },
          subtitle1: {
            fontSize: 20,
            fontWeight: 700,
          },
          subtitle2: {
            fontSize: 18,
            fontWeight: 700,
          },
          subtitle3: {
            fontSize: 18,
          },
          subtitle4: {
            fontSize: "1rem",
            lineHeight: "1.5rem",
            fontWeight: 700,
          },
          body1: {
            fontSize: 18,
          },
          body2: {
            fontSize: 14,
            lineHeight: "1.5rem",
          },
        },
        MuiTouchRipple: {
          borderRadius: 0,
        },
        MuiCardActionArea: {
          focusHighlight: 0,
        },
      }),
      custom: {
        isDarkModeEnabled: isDark,
      },
    };
  },
});

export default MuiDsfrThemeProvider;
