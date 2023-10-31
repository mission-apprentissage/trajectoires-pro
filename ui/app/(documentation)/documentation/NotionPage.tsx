import "server-only";
import "#/app/(documentation)/styles/notion.scss";
import NotionWrapper from "#/app/components/wrapper/NotionWrapper";
import NotionDoc from "#/app/components/NotionDoc";
import React from "react";
export const revalidate = 0;

export default function NotionPage({ pageId, disableHeader }: { pageId: string; disableHeader?: boolean }) {
  const BASE_PATH = process.env.NEXT_PUBLIC_HOST_REWRITE === "true" ? "/" : "/documentation/";

  return (
    <>
      <NotionWrapper pageId={pageId}>
        {(recordMap) => {
          const pageTitle = Object.values(recordMap.block).find(({ value }) => value.type === "page")?.value?.properties
            ?.title[0];
          return (
            <NotionDoc
              disableHeader={disableHeader}
              urlBasePath={BASE_PATH + "page/"}
              pageTitle={pageTitle}
              recordMap={recordMap}
            />
          );
        }}
      </NotionWrapper>
    </>
  );
}
