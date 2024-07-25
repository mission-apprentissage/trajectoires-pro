import RootLayout from "../components/RootLayout";
import Layout from "../components/Layout";
import Header from "#/app/components/Header";
import { title, tagline } from "./constants/constants";
import "./style.scss";
import Title from "./components/Title";
import Footer from "../components/Footer";
import Link from "../components/Link";

export const BASE_PATH = process.env.NEXT_PUBLIC_HOST_REWRITE === "true" ? "/" : "/prescripteur/";

export default function MainLayout({ children }: { children: JSX.Element }) {
  return (
    <RootLayout>
      <>
        <Title />
        <Layout header={<Header title={title} tagline={tagline} />} title={title}>
          <>
            {children}
            <Footer
              brandTop={
                <>
                  RÉPUBLIQUE
                  <br />
                  FRANÇAISE
                </>
              }
              homeLinkProps={{
                href: "/",
                title,
              }}
              accessibility="non compliant"
              contentDescription={
                <>
                  <b>C&apos;est qui le pro ?</b> est un service de la{" "}
                  <Link href="https://beta.gouv.fr/incubateurs/mission-inserjeunes.html" target="_blank">
                    Mission interministérielle InserJeunes
                  </Link>
                  , mandatée par plusieurs ministères pour développer des produits destinés à faciliter l’orientation et
                  l’insertion des jeunes de la voie professionnelle. Le code source de ce site web est disponible en
                  licence libre. Une partie du design de ce service est conçu avec le système de design de l&apos;État.
                </>
              }
              domains={[
                { name: "InserJeunes", url: "beta.gouv.fr/incubateurs/mission-inserjeunes.html" },
                { name: "ONISEP", url: "onisep.fr" },
                {
                  name: "beta.gouv.fr",
                  url: "beta.gouv.fr",
                },
              ]}
            />
          </>
        </Layout>
      </>
    </RootLayout>
  );
}
