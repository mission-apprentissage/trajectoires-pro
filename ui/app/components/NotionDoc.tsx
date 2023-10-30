"use client";
import { ExtendedRecordMap } from "notion-types";
import { Suspense } from "react";
import { NotionRenderer } from "react-notion-x";

const NotionDoc = ({
  urlBasePath,
  pageTitle,
  recordMap,
}: {
  urlBasePath?: string;
  pageTitle: string;
  recordMap: ExtendedRecordMap;
}) => {
  return (
    <Suspense>
      <NotionRenderer
        mapPageUrl={
          urlBasePath
            ? (pageId) => {
                return urlBasePath + pageId;
              }
            : undefined
        }
        pageTitle={pageTitle}
        disableHeader={true}
        recordMap={recordMap}
        fullPage={true}
        darkMode={false}
      />
    </Suspense>
  );
};

export default NotionDoc;
