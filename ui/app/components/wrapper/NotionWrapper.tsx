import "server-only";
import { NotionAPI } from "notion-client";
import { ExtendedRecordMap } from "notion-types";

export const revalidate = 60;

const fetchData = async (pageId: string) => {
  const notion = new NotionAPI();
  const recordMap = await notion.getPage(pageId);
  return recordMap;
};

export default async function NotionWrapper({
  pageId,
  children,
}: {
  pageId: string;
  children: (recordMap: ExtendedRecordMap) => JSX.Element;
}) {
  const recordMap = await fetchData(pageId);
  return <>{children(recordMap)}</>;
}
