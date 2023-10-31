import "server-only";
import "#/app/(documentation)/styles/notion.scss";
import React from "react";
import NotionPage from "../../NotionPage";
export const revalidate = 0;

export default function Page({ params }: { params: { pageId: string } }) {
  return <NotionPage disableHeader={params.pageId === "eb8fc2c1-4348-440c-b934-eef4c7ee0b4e"} pageId={params.pageId} />;
}
