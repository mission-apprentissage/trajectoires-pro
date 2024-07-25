import { merge } from "lodash-es";

export class ErrorFetchingJson extends Error {
  data: any;
  status: number;

  constructor(data: any, status: number) {
    super("Error fetching Json");
    this.data = data;
    this.status = status;
  }
}

export async function fetchJson(url: string, options?: RequestInit | undefined) {
  const res = await fetch(
    url,
    merge(
      {},
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
      options || {}
    )
  );

  if (!res.ok) {
    let jsonError = null;
    try {
      jsonError = await res.json();
    } catch (err) {
      throw new ErrorFetchingJson(await res.text(), res.status);
    }
    throw new ErrorFetchingJson(jsonError, res.status);
  }

  return await res.json();
}
