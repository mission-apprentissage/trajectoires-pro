"use client";
import React from "react";
import { Dialog, DialogTitle } from "@mui/material";
import { Typography } from "#/app/components/MaterialUINext";
import Container from "#/app/components/Container";
import { fr } from "@codegouvfr/react-dsfr";
import Divider from "#/app/components/Divider";
import Button from "#/app/components/Button";

export default function DialogMinistage({ onClose, open }: { onClose: () => void; open: boolean }) {
  const handleClose = () => {
    onClose();
  };

  return (
    <Dialog onClose={handleClose} open={open} fullWidth={true} maxWidth={"md"}>
      <DialogTitle>Information</DialogTitle>
      <Button
        style={{
          position: "absolute",
          right: 8,
          top: 8,
        }}
        onClick={handleClose}
        priority="tertiary no outline"
      >
        Fermer X
      </Button>

      <Divider noMargin></Divider>
      <Container>
        <Typography variant={"h4"} style={{ marginBottom: fr.spacing("3v") }}>
          Qu’est ce qu’un mini-stage dans un lycée ?
        </Typography>
        <Typography variant={"body1"} style={{ marginBottom: fr.spacing("12v") }}>
          C’est une immersion dans une formation proposer par le lycée.
          <br />
          Une solution idéale pour rencontrer sur courte durée les professeurs d’atelier et d’enseignement général ainsi
          que pour découvrir l’ambiance d’un lycée.
        </Typography>
        <Typography variant={"h4"} style={{ marginBottom: fr.spacing("3v") }}>
          Comment s’inscrire à un mini-stage ?
        </Typography>
        <Typography variant={"body1"} style={{ marginBottom: fr.spacing("3v") }}>
          L’inscription se fait exclusivement par votre collège ou votre établissement:
        </Typography>
        <Typography variant={"body1"} style={{ marginBottom: fr.spacing("3v") }}>
          <ul>
            <li style={{ fontWeight: 700 }}>
              Contacter le professeur principal, la C.P.E ou la direction de l’établissement de scolarisation actuel;
            </li>
            <li style={{ fontWeight: 700 }}>Inscription par votre collège ou votre Lycée.</li>
            <li>
              Signature d’une convention par les responsables légaux, le principal du collège et le proviseur du Lycée.
            </li>
            <li>Le lycée retourne cette convention remplie et signée à l’établissement de scolarisation actuel;</li>
            <li>
              L’établissement de scolarisation actuel fait signer la convention par sa direction et par la famille.
            </li>
          </ul>
        </Typography>
        <Typography variant={"body1"} style={{ marginBottom: fr.spacing("12v") }}>
          Les formulaires d’inscription et les conventions ne sont en aucun cas à renvoyer aux lycées par les familles.
        </Typography>

        <Typography variant={"h4"} style={{ marginBottom: fr.spacing("3v") }}>
          Quelle durée du mini-stage ?
        </Typography>
        <Typography variant={"body1"} style={{ marginBottom: fr.spacing("12v") }}>
          Une demi-journée, ou une journée voire deux.
        </Typography>
      </Container>
    </Dialog>
  );
}
