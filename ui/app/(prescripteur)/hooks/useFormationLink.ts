import { FormationDetail } from "#/types/formation";
import { useSearchParams } from "next/navigation";
import { useFormationsSearch } from "../context/FormationsSearchContext";

export const useFormationLink = ({ formation }: { formation?: FormationDetail }) => {
  const searchParams = useSearchParams();
  const longitude = searchParams.get("longitude");
  const latitude = searchParams.get("latitude");
  const { getUrlParams } = useFormationsSearch();

  if (!formation) {
    return null;
  }

  const key = `${formation.cfd}-${formation.codeDispositif}-${formation.uai}-${formation.voie}`;
  return `/details/${key}?latitude=${latitude || ""}&longitude=${longitude || ""}&${getUrlParams()}`;
};
