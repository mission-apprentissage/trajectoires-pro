import { redirect } from "next/navigation";
import React from "react";
import { authOptions } from "#/app/api/inserjeunes/auth/[...nextauth]/route";
import { useSession } from "next-auth/react";
import Loader from "#/app/components/Loader";

function withSession<T>(
  Component: React.FunctionComponent<T>,
  options?: { fallback: React.ReactNode | null | undefined }
) {
  const SessionComponent = (props: any) => {
    const { status, data: session } = useSession();
    const fallback = options?.fallback;

    if (status === "loading") {
      return fallback ? fallback : <Loader />;
    }

    if (status === "unauthenticated") {
      !fallback && redirect(authOptions.pages?.signIn || "/");
      return fallback || <></>;
    }

    return (
      <>
        <Component session={session} {...props} />
      </>
    );
  };

  SessionComponent.displayName = "SessionComponent";
  return SessionComponent;
}

export default withSession;
