"use client";
import { ErrorBoundary as RErrorBoundary } from "react-error-boundary";

export default function ErrorBoundary({ children }: { children: React.ReactNode }) {
  return <RErrorBoundary fallback={<div>There was an error!</div>}>{children}</RErrorBoundary>;
}
