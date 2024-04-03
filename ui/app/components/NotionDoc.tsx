"use client";
import { ExtendedRecordMap } from "notion-types";
import { Suspense } from "react";
import { NotionRenderer } from "react-notion-x";
import dynamic from "next/dynamic";
import "prismjs/themes/prism-tomorrow.css";
import "./NotionDoc.css";

const Code = dynamic(() => import("react-notion-x/build/third-party/code").then((m) => m.Code));

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
        components={{
          Code,
        }}
      />
    </Suspense>
  );
};

export default NotionDoc;
