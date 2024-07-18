"use client";
import Container from "#/app/components/Container";
import SearchFormationForm from "#/app/components/form/SearchFormationForm";
import SearchFormationHomeForm from "#/app/components/form/SearchFormationHomeForm";

export default function SearchHeader() {
  return (
    <Container
      style={{ border: "1px solid #DDDDDD", boxShadow: "4px 0px 6px 0px #00000040" }}
      nopadding={true}
      maxWidth={false}
    >
      <Container>
        <SearchFormationHomeForm
          url={"/recherche"}
          defaultValues={{ address: null, distance: 10, time: 90 }}
          style={{ borderRadius: "5px", border: "2px solid var(--blue-france-sun-113-625-hover)" }}
        />
      </Container>
    </Container>
  );
}
