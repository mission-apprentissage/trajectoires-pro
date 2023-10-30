import Container from "#/app/components/Container";
import DefaultRootLayout from "#/app/components/RootLayout";

export default function RootLayout({ children }: { children: JSX.Element }) {
  const lang = "fr";

  return (
    <DefaultRootLayout title={"Exposition - Documentation"}>
      <>
        <Container maxWidth={"xl"}>{children}</Container>
      </>
    </DefaultRootLayout>
  );
}
