import RootLayout from "../components/RootLayout";
import Layout from "../components/Layout";
import Header from "#/app/components/Header";

import "./style.scss";

export const BASE_PATH = process.env.NEXT_PUBLIC_HOST_REWRITE === "true" ? "/" : "/prescripteur/";

export default function MainLayout({ children }: { children: JSX.Element }) {
  const title = "C’EST QUI LE PRO";
  const tagline = "Toute l’info sur la voie Pro d’aujourdhui et de demain";
  return (
    <RootLayout title={title}>
      <Layout header={<Header title={title} tagline={tagline} />} title={title}>
        {children}
      </Layout>
    </RootLayout>
  );
}
