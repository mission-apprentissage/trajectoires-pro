import "server-only";
import jwt from "jsonwebtoken";
import { MetabaseQueryParams } from "#/types/metabase";

const { METABASE_SECRET_KEY = "", METABASE_SITE_URL = "" } = process.env;

type Params = {
  [key: string]: MetabaseQueryParams;
};

export async function iframe(
  dashboard: number,
  params: Params,
  queryParams: Params = {},
  hideParams: string[] = [],
  style = { bordered: false, title: false }
) {
  // TODO: validate parameter
  const payload = {
    resource: { dashboard },
    params: params,
    exp: Math.round(Date.now() / 1000) + 60 * 60 * 24 * 30, // 1 month expiration
  };
  const token = jwt.sign(payload, METABASE_SECRET_KEY);

  const queryParamsFormatted = Object.keys(queryParams)
    .map((k: string) => {
      const val = queryParams[k];

      if (Array.isArray(val)) {
        return val.map((val) => `${k}=${encodeURIComponent(val)}`).join("&");
      }
      return `${k}=${encodeURIComponent(val)}`;
    })
    .join("&");

  const hideParamsFormatted = hideParams.join(",");

  return (
    METABASE_SITE_URL +
    "/embed/dashboard/" +
    token +
    `?${queryParamsFormatted}#hide_parameters=${hideParamsFormatted}&bordered=${
      style.bordered ? "true" : false
    }&titled=${style.title ? "true" : "false"}`
  );
}

export async function json(id: string) {
  const request = await fetch(METABASE_SITE_URL + `/public/question/${id}.json`);
  return await request.json();
}
