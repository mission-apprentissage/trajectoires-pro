import { fr } from "@codegouvfr/react-dsfr";
import { Container, Typograhpy } from "./MaterialUINext";

export default function Card({ title, children }: { title: string; children?: JSX.Element }) {
  return (
    <Container style={{ border: "1px solid #DDDDDD", borderRadius: "10px", padding: 0, overflow: "hidden" }}>
      <Typograhpy
        style={{
          backgroundColor: "#F5F5FE",
          color: "var(--blue-france-sun-113-625)",
          padding: fr.spacing("3v"),
        }}
        variant="h4"
      >
        {title}
      </Typograhpy>
      <Container style={{ padding: fr.spacing("3v") }}>{children}</Container>
    </Container>
  );
}
