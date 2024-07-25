import { FormationDetail } from "#/types/formation";
import { useSearchParams } from "next/navigation";
import { useFormationsSearch } from "../context/FormationsSearchContext";

export const useFormationLink = ({
  formation,
  longitude,
  latitude,
}: {
  formation?: FormationDetail;
  longitude?: string;
  latitude?: string;
}) => {
  const searchParams = useSearchParams();
  const longitudeParams = longitude ?? searchParams.get("longitude");
  const latitudeParams = latitude ?? searchParams.get("latitude");
  const { getUrlParams } = useFormationsSearch();

  if (!formation) {
    return null;
  }

  const key = `${formation.cfd}-${formation.codeDispositif}-${formation.uai}-${formation.voie}`;
  return `/details/${key}?latitude=${latitudeParams || ""}&longitude=${longitudeParams || ""}&${getUrlParams()}`;
};
