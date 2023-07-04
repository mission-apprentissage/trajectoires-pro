export type MetabaseQueryParams = string | string[];

export type MetabaseConfig = {
  dashboards: {
    [key: string]: {
      id: number;
      defaultQueryParams: {
        [key: string]: MetabaseQueryParams;
      };
    };
  };
};
