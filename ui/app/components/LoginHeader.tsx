"use client";
import { Session } from "next-auth";
import withSession from "#/wrappers/withSession";
import Button from "@codegouvfr/react-dsfr/Button";
import Link from "#/app/components/Link";
import { signOut } from "next-auth/react";

function Login() {
  return (
    <Link href="/login" basePath="/inserjeunes" passHref legacyBehavior>
      <Button id="button-signin" iconId="fr-icon-account-circle-fill" priority="tertiary no outline">
        Se connecter
      </Button>
    </Link>
  );
}

export function LoginHeader({ session }: { session: Session }) {
  return (
    <Button
      id="button-signout"
      iconId="fr-icon-account-circle-fill"
      onClick={() => signOut()}
      priority="tertiary no outline"
    >
      Se déconnecter
    </Button>
  );
}

export default withSession(LoginHeader, { fallback: <Login /> });
