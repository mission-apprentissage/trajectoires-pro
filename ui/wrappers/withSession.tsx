import { redirect } from "next/navigation";
import React from "react";
import { authOptions } from "#/app/api/inserjeunes/auth/[...nextauth]/route";
import { useSession } from "next-auth/react";
import Loader from "#/app/components/Loader";

function withSession<T>(Component: React.FunctionComponent<T>) {
  const SessionComponent = (props: any) => {
    const { status, data: session } = useSession();

    if (status === "loading") {
      return <Loader />;
    }

    if (status === "unauthenticated") {
      redirect(authOptions.pages?.signIn || "/");
    }

    return <Component session={session} {...props} />;
  };

  SessionComponent.displayName = "SessionComponent";
  return SessionComponent;
}

export default withSession;
