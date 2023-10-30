import "server-only";
import "#/app/(documentation)/styles/notion.scss";
import React from "react";
import NotionPage from "./NotionPage";
export const revalidate = 0;

export default function Page() {
  return <NotionPage pageId="eb8fc2c14348440cb934eef4c7ee0b4e" />;
}
