import RootLayout from "../components/RootLayout";
import Layout from "../components/Layout";
import Header from "#/app/components/Header";
import { title, tagline } from "./constants/constants";
import "./style.scss";
import Title from "./components/Title";

export const BASE_PATH = process.env.NEXT_PUBLIC_HOST_REWRITE === "true" ? "/" : "/prescripteur/";

export default function MainLayout({ children }: { children: JSX.Element }) {
  return (
    <RootLayout>
      <>
        <Title />
        <Layout header={<Header title={title} tagline={tagline} />} title={title}>
          {children}
        </Layout>
      </>
    </RootLayout>
  );
}
