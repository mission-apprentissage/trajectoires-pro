import NextLink, { LinkProps } from "next/link";
const NEXT_PUBLIC_HOST_REWRITE = process.env.NEXT_PUBLIC_HOST_REWRITE;

export default function Link({
  children,
  basePath,
  ...props
}: LinkProps & { children: JSX.Element; basePath: string }) {
  return (
    <NextLink {...props} href={NEXT_PUBLIC_HOST_REWRITE === "false" ? basePath + props.href : props.href}>
      {children}
    </NextLink>
  );
}
