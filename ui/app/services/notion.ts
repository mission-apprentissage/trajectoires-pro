import "server-only";
import { Client } from "@notionhq/client";

const { NOTION_TOKEN = "" } = process.env;

export const notion = new Client({
  auth: NOTION_TOKEN,
});
