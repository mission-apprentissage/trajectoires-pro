"use client";
import { ExtendedRecordMap } from "notion-types";
import { Suspense } from "react";
import { NotionRenderer } from "react-notion-x";

const NotionDoc = ({ pageTitle, recordMap }: { pageTitle: string; recordMap: ExtendedRecordMap }) => {
  return (
    <Suspense>
      <NotionRenderer
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
