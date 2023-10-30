import "server-only";
import "react-notion-x/src/styles.css";
import "#/app/(documentation)/styles/notion.css";
import NotionWrapper from "#/app/components/wrapper/NotionWrapper";
import NotionDoc from "#/app/components/NotionDoc";
import React from "react";
export const revalidate = 0;

export default function Page() {
  return (
    <>
      <NotionWrapper pageId="eb8fc2c14348440cb934eef4c7ee0b4e">
        {(recordMap) => {
          return <NotionDoc pageTitle="Centre de documentation InserJeunes" recordMap={recordMap} />;
        }}
      </NotionWrapper>
    </>
  );
}
