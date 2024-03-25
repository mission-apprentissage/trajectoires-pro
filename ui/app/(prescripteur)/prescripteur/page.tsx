"use client";
import Container from "#/app/components/Container";
import SearchFormationForm, { schema as schemaFormation } from "#/app/components/form/SearchFormationForm";
import { useSearchParams } from "next/navigation";
import ResearchFormationsResult from "./ResearchFormationsResult";
import { searchParamsToObject } from "#/app/utils/searchParams";
import { fetchAddress } from "#/app/services/address";
import { useEffect, useState } from "react";
import { fr } from "@codegouvfr/react-dsfr";

function SearchHeader() {
  return (
    <Container
      style={{ border: "1px solid #DDDDDD", marginBottom: fr.spacing("3v") }}
      nopadding={true}
      maxWidth={false}
    >
      <Container>
        <SearchFormationForm url={"/prescripteur/"} defaultValues={{ address: null, distance: null }} />
      </Container>
    </Container>
  );
}

export default function Page() {
  const searchParams = useSearchParams();
  const [coordinate, setCoordinate] = useState(null);
  const { address, distance } = searchParamsToObject(searchParams, { address: null, distance: 1 }, schemaFormation);

  useEffect(() => {
    (async () => {
      if (!address) {
        return;
      }

      const addressCoordinate = await fetchAddress(address);
      if (!addressCoordinate?.features) {
        // TODO: manage address fetch error
        throw new Error("Addresse invalide.");
      }
      setCoordinate(addressCoordinate.features[0].geometry.coordinates);
    })();
  }, [address]);

  return (
    <>
      <SearchHeader />
      {coordinate && (
        <Container>
          <ResearchFormationsResult
            longitude={coordinate[0]}
            latitude={coordinate[1]}
            distance={distance * 1000}
            page={1}
          />
        </Container>
      )}
    </>
  );
}
