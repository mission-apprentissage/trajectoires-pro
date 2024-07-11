import RootLayout from "../components/RootLayout";
import Layout from "../components/Layout";
import Header from "#/app/components/Header";
import { title, tagline } from "./constants/constants";
import "./style.scss";
import Title from "./components/Title";
import Footer from "../components/Footer";

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
                  <b>C&apos;est qui le PRO</b> est un produit financé et appuyé par l..., porté et potentiellement
                  repris par
                  <b>l&apos;ONISEP</b>, appuyé méthodologiquement par la <b>Mission interministérielle InserJeunes</b>.
                  Le code source de ce site web est disponible en licence libre. Une partie du design de ce service est
                  conçu avec le système de design de l&apos;État.
                </>
              }
              domains={[
                { name: "DGEFP", url: "travail-emploi.gouv.fr" },
                { name: "ONISEP", url: "onisep.fr" },
                {
                  name: "InserJeunes",
                  url: "www.education.gouv.fr/inserjeunes-un-service-d-aide-l-orientation-des-jeunes-en-voie-professionnelle-309485",
                },
              ]}
            />
          </>
        </Layout>
      </>
    </RootLayout>
  );
}
