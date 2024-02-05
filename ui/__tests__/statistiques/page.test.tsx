import { render, screen } from "@testing-library/react";
import { act } from "react-dom/test-utils";
import Page from "#/app/(statistiques)/statistiques/page";
import config from "#/app/(statistiques)/statistiques/config";
import * as Stats from "#/app/(statistiques)/statistiques/stats";
import * as Overview from "#/app/(statistiques)/statistiques/overview";

describe("Page", () => {
  beforeEach(async () => {
    jest.spyOn(Stats, "plateformesInfo").mockReturnValue(
      new Promise((resolve) =>
        resolve({
          production: [],
          waiting: [],
        })
      )
    );

    jest.spyOn(Stats, "statsInfo").mockReturnValue(
      new Promise((resolve) =>
        resolve({
          views: 1,
        })
      )
    );

    jest.spyOn(Stats, "couverturesInfo").mockReturnValue(
      new Promise((resolve) =>
        resolve({
          couverte: {
            national: 0,
            regional: 0,
            etablissement: 0,
          },
          couverteVoiePro: {
            national: 0,
            regional: 0,
            etablissement: 0,
          },
          couverteApprentissage: {
            national: 0,
            regional: 0,
            etablissement: 0,
          },
          couverteBetween: {
            date: 2022,
            count: {
              national: 0,
              regional: 0,
              etablissement: 0,
            },
          },
        })
      )
    );

    const originalOverview = Overview.default;
    // React testing library does not support async component
    // @ts-ignore
    jest.spyOn(Overview, "default").mockReturnValue(await originalOverview());
  });

  it("renders a page", async () => {
    await act(async () => render(await Page()));

    const headingPartenaires = screen.getByRole("heading", {
      name: /Nos partenaires/i,
    });
    expect(headingPartenaires).toBeInTheDocument();

    const headingData = screen.getByRole("heading", {
      name: /Nos données/i,
    });
    expect(headingData).toBeInTheDocument();

    const headingStats = screen.getByRole("heading", {
      name: /Statistiques détaillées du projet Exposition d'InserJeunes/i,
    });
    expect(headingStats).toBeInTheDocument();

    expect(screen.getByTitle("Vue metabase des appels d'API")).toBeInTheDocument();
    expect(screen.getByTitle("Vue metabase des appels d'API")).toHaveAttribute(
      "src",
      expect.stringContaining(process.env.METABASE_SITE_URL || "")
    );

    expect(screen.getByTitle("Vue metabase des appels par région")).toBeInTheDocument();
    expect(screen.getByTitle("Vue metabase des appels par région")).toHaveAttribute(
      "src",
      expect.stringContaining(process.env.METABASE_SITE_URL || "")
    );
  });
});
