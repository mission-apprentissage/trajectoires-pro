const NEXT_PUBLIC_HOST_REWRITE = process.env.NEXT_PUBLIC_HOST_REWRITE;

export function getPath(url: string) {
  const rewriteUrl = NEXT_PUBLIC_HOST_REWRITE === "false" ? url : url.replace(/^(\/[^\/]+)/, "");
  return rewriteUrl;
}
