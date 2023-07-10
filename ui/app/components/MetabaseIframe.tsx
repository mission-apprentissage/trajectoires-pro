"use client";

import React from "react";

export default function MetabaseIframe({ url }: { url: string }) {
  return <iframe title={"Metabase iframe"} src={url} frameBorder="0" width="100%" height="600"></iframe>;
}
