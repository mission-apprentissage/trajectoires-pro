import PlausibleProvider from "next-plausible";
import { fr } from "@codegouvfr/react-dsfr";
import Container from "#/app/components/Container";
import DefaultRootLayout from "#/app/components/RootLayout";
import Layout from "#/app/components/Layout";

export default function RootLayout({ children }: { children: JSX.Element }) {
  const title = "Exposition - Documentation";

  return (
    <DefaultRootLayout title={title}>
      <Layout title={title}>
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
          <PlausibleProvider domain={process.env.DOCUMENTATION_SITE_HOST || ""}>
            <Container maxWidth={"xl"}>{children}</Container>
          </PlausibleProvider>
        </div>
      </Layout>
    </DefaultRootLayout>
  );
}
