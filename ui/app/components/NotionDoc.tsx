"use client";
import { ExtendedRecordMap } from "notion-types";
import { Suspense } from "react";
import { NotionRenderer } from "react-notion-x";

const NotionDoc = ({
  urlBasePath,
  pageTitle,
  recordMap,
  disableHeader,
}: {
  urlBasePath?: string;
  pageTitle: string;
  recordMap: ExtendedRecordMap;
  disableHeader?: boolean;
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
        disableHeader={disableHeader}
        recordMap={recordMap}
        fullPage={true}
        darkMode={false}
      />
    </Suspense>
  );
};

export default NotionDoc;
