import PlausibleProvider from "next-plausible";
import Container from "#/app/components/Container";
import DefaultRootLayout from "#/app/components/RootLayout";

export default function RootLayout({ children }: { children: JSX.Element }) {
  const lang = "fr";

  return (
    <DefaultRootLayout title={"Exposition - Documentation"}>
      <PlausibleProvider domain={process.env.DOCUMENTATION_SITE_HOST || ""}>
        <Container maxWidth={"xl"}>{children}</Container>
      </PlausibleProvider>
    </DefaultRootLayout>
  );
}
