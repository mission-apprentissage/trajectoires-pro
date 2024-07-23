import { schema as schemaFormation } from "#/app/components/form/SearchFormationForm";
import { paramsToString, searchParamsToObject } from "#/app/utils/searchParams";
import { FormationDomaine, FormationTag } from "#/types/formation";
import { useRouter, useSearchParams } from "next/navigation";
import { createContext, useContext, useCallback } from "react";

type FormationsSearchParams = {
  address: string;
  distance: number;
  time: number;
  tag?: FormationTag;
  domaine?: FormationDomaine;
};

const FormationsSearchContext = createContext<{
  params?: FormationsSearchParams | null;
  updateParams: (params: FormationsSearchParams) => void;
  getUrlParams: () => string;
}>({
  params: null,
  updateParams: (params: FormationsSearchParams) => {},
  getUrlParams: () => "",
});

const FormationsSearchProvider = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = searchParamsToObject(
    searchParams,
    { address: null, distance: 10, time: null, tag: null, domaine: null },
    schemaFormation
  );

  const getUrlParams = useCallback(() => {
    const urlSearchParams = paramsToString(params);
    return `${urlSearchParams}`;
  }, [params]);

  const updateParams = useCallback(
    (params: FormationsSearchParams) => {
      const urlSearchParams = paramsToString(params);
      router.push(`?${urlSearchParams}`);
    },
    [router, params]
  );

  return (
    <FormationsSearchContext.Provider
      value={{
        updateParams,
        getUrlParams,
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
