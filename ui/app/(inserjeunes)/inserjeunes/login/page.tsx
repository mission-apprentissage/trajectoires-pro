"use client";
import React from "react";
import { Typography, Grid } from "@mui/material";
import { fr } from "@codegouvfr/react-dsfr";
import { Input } from "@codegouvfr/react-dsfr/Input";
import { PasswordInput } from "@codegouvfr/react-dsfr/blocks/PasswordInput";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { Alert } from "@codegouvfr/react-dsfr/Alert";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import Container from "#/app/components/Container";
import { loginSchema } from "#/services/inserjeunes/validators";
import { LoginRequest } from "#/services/inserjeunes/types";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";

const NEXT_PUBLIC_HOST_REWRITE = process.env.NEXT_PUBLIC_HOST_REWRITE;
export const revalidate = 0;

export default function Login() {
  const searchParams = useSearchParams();
  const loginError = searchParams.get("error");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginRequest>({
    resolver: yupResolver(loginSchema),
  });

  const onSubmit = (data: LoginRequest) => {
    signIn(
      "credentials",
      { callbackUrl: NEXT_PUBLIC_HOST_REWRITE === "false" ? "/inserjeunes/etablissement/" : "/etablissement/" },
      data
    );
  };

  return (
    <Grid container justifyContent="center">
      <Grid item xs={10} md={8} lg={8}>
        <Container variant={"content"} maxWidth={false} sx={{ mt: 4 }}>
          <Container variant={"content"} maxWidth={"xs"}>
            <Typography variant="h3" sx={{ mb: 4 }}>
              Se connecter à Inserjeunes
            </Typography>
            {loginError === "CredentialsSignin" && (
              <Alert severity="error" title="Siret/Uai ou mot de passe invalide." />
            )}
            <form onSubmit={handleSubmit(onSubmit)}>
              <Input
                state={errors.login && "error"}
                stateRelatedMessage={errors.login && "Veuillez entrer un Siret/UAI valide"}
                label="Identifiant"
                hintText="Siret ou UAI"
                nativeInputProps={register("login")}
              />
              <PasswordInput
                messages={
                  errors.password && [
                    {
                      message: "Veuillez entrer un mot de passe",
                      severity: "error",
                    },
                  ]
                }
                label="Mot de passe"
                nativeInputProps={register("password")}
              />
              <Button style={{ width: "100%", justifyContent: "center", marginTop: fr.spacing("3v") }} type="submit">
                Se connecter
              </Button>
            </form>
          </Container>
        </Container>
      </Grid>
    </Grid>
  );
}
