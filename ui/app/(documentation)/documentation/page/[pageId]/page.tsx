import "server-only";
import "#/app/(documentation)/styles/notion.scss";
import React from "react";
import NotionPage from "../../NotionPage";
export const revalidate = 0;

export default function Page({ params }: { params: { pageId: string } }) {
  return <NotionPage pageId={params.pageId} />;
}
