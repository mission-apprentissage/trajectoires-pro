"use client";

import React from "react";

export default function MetabaseIframe({
  title = "Metabase iframe",
  url,
  height = "600",
}: {
  title?: string;
  url: string;
  height?: string;
}) {
  return <iframe title={title} src={url} frameBorder="0" width="100%" height={height}></iframe>;
}
