import { DsfrHead } from "@codegouvfr/react-dsfr/next-appdir/DsfrHead";
import { getHtmlAttributes } from "@codegouvfr/react-dsfr/next-appdir/getHtmlAttributes";
import StartDsfr from "#/app/StartDsfr";
import { defaultColorScheme } from "#/app/defaultColorScheme";
import Link from "next/link";

export default function RootLayout({ title, children }: { title: string; children: JSX.Element }) {
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
        <title>{title}</title>
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
        {children}
      </body>
    </html>
  );
}
