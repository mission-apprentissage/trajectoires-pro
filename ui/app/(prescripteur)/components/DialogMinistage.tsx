"use client";
import React from "react";
import { Dialog, DialogTitle } from "@mui/material";
import { Typography } from "#/app/components/MaterialUINext";
import Container from "#/app/components/Container";
import { fr } from "@codegouvfr/react-dsfr";
import Divider from "#/app/components/Divider";
import Button from "#/app/components/Button";

import { createModal } from "@codegouvfr/react-dsfr/Modal";

export const modalMinistage = createModal({
  id: "ministage-modal",
  isOpenedByDefault: false,
});

export default function DialogMinistage() {
  return (
    <>
      <modalMinistage.Component title="Qu’est ce qu’un mini-stage ?">
        <p style={{ marginBottom: fr.spacing("8v") }}>
          Le mini-stage est une <b>session d’immersion</b> destinée aux élèves de 3ème et de 2nde professionnelle, d’une
          durée généralement comprise <b>entre une demi-journée et 2 jours</b>, dans une classe de la formation choisie.
          <br />
          <br />
          Le stagiaire suit les cours, théoriques ou pratiques, de la formation professionnelle. Il peut ainsi
          rencontrer des professeurs, dispensant les ateliers ou l’enseignement général, et des élèves.
          <br />
          <br />
          Le stage est donc l’occasion d’avoir un aperçu des sujets abordés en cours, de découvrir le quotidien au sein
          de la formation et l’ambiance au sein de l’établissement.
        </p>
        <Typography variant={"h4"} style={{ marginBottom: fr.spacing("3v") }}>
          Comment s’inscrire ?
        </Typography>
        <p style={{ marginBottom: fr.spacing("3v") }}>
          L’inscription se fait exclusivement via le collège dans lequel est scolarisé l’élève. Il doit donc commencer
          par en parler avec son professeur principal, CPE ou directeur d’établissement.
        </p>
      </modalMinistage.Component>
    </>
  );
}
