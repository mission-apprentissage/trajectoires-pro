"use client";
import Container from "#/app/components/Container";
import SearchFormationForm from "#/app/components/form/SearchFormationForm";

export default function SearchHeader() {
  return (
    <Container style={{ border: "1px solid #DDDDDD" }} nopadding={true} maxWidth={false}>
      <Container>
        <SearchFormationForm url={"/"} defaultValues={{ address: null, distance: 10, time: 90 }} />
      </Container>
    </Container>
  );
}
