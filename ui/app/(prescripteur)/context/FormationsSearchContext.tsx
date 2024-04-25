import { schema as schemaFormation } from "#/app/components/form/SearchFormationForm";
import { searchParamsToObject } from "#/app/utils/searchParams";
import { FormationTag } from "#/types/formation";
import { mapValues, isNil } from "lodash-es";
import { useRouter, useSearchParams } from "next/navigation";
import { createContext, useContext, useCallback } from "react";

type FormationsSearchParams = {
  address: string;
  distance: number;
  time: number;
  tag?: FormationTag;
};

const FormationsSearchContext = createContext<{
  params?: FormationsSearchParams | null;
  updateParams: (params: FormationsSearchParams) => void;
}>({
  params: null,
  updateParams: (params: FormationsSearchParams) => {},
});

const FormationsSearchProvider = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = searchParamsToObject(
    searchParams,
    { address: null, distance: 10, time: null, tag: null },
    schemaFormation
  );

  const updateParams = useCallback((params: FormationsSearchParams) => {
    const urlSearchParams = new URLSearchParams(mapValues(params, (v) => (!isNil(v) ? v.toString() : "")));
    router.push(`?${urlSearchParams}`);
  }, []);

  return (
    <FormationsSearchContext.Provider
      value={{
        updateParams,
        params,
      }}
    >
      {children}
    </FormationsSearchContext.Provider>
  );
};

export const useFormationsSearch = () => {
  return useContext(FormationsSearchContext);
};

export default FormationsSearchProvider;
