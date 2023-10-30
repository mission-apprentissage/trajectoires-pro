import "server-only";
import "#/app/(documentation)/styles/notion.scss";
import NotionWrapper from "#/app/components/wrapper/NotionWrapper";
import NotionDoc from "#/app/components/NotionDoc";
import React from "react";
export const revalidate = 0;

export default function NotionPage({ pageId }: { pageId: string }) {
  const BASE_PATH = process.env.NEXT_PUBLIC_HOST_REWRITE === "true" ? "/" : "/documentation/";

  return (
    <>
      <NotionWrapper pageId={pageId}>
        {(recordMap) => {
          return (
            <NotionDoc
              urlBasePath={BASE_PATH + "page/"}
              pageTitle="Centre de documentation InserJeunes"
              recordMap={recordMap}
            />
          );
        }}
      </NotionWrapper>
    </>
  );
}
