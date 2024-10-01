import "server-only";
import { notion } from "#/app/services/notion";
import * as Metabase from "#/app/(statistiques)/statistiques/api/metabase";
import Config from "#/app/(statistiques)/statistiques/config";

export async function plateformesInfo() {
  const plateformes = await notion.databases.query({
    database_id: "0f5d9ee58bf247a1b5f4a1e75fddb551",
  });
  if (!plateformes.results) {
    return null;
  }

  const results = plateformes.results;
  const production = results.filter((r) => (r as any).properties?.Statut?.select?.name === "Production");
  const waiting = results.filter((r) =>
    ["Développement", "Intégration envisagée"].includes((r as any).properties?.Statut?.select?.name)
  );

  return {
    production,
    waiting,
  };
}

export async function statsInfo() {
  const metabaseViews = await Metabase.json(Config.METABASE.metrics.views);

  return {
    views: metabaseViews[0]["Nombre de lignes"],
  };
}

export async function couverturesInfo() {
  const result = await notion.databases.query({
    database_id: "824d2ead9cd843b8a444625814a26a01",
  });
  const couvertures = result?.results?.map((r) => (r as any).properties);

  if (!couvertures) {
    return null;
  }

  const couverturesSort = couvertures
    .sort((a, b) => {
      const aYear = a["Année"].rich_text[0].plain_text;
      const bYear = b["Année"].rich_text[0].plain_text;
      if (aYear < bYear) {
        return -1;
      }
      if (aYear > bYear) {
        return 1;
      }

      return 0;
    })
    .reverse();

  const totalLastYear = couverturesSort.find((d) => d["Nom"].title[0].plain_text === "Total");
  const totalVoiePro = couverturesSort.find((d) => d["Nom"].title[0].plain_text === "dont filière pro");
  const totalApprentissage = couverturesSort.find((d) =>
    d["Nom"].title.find((t: any) => t.plain_text === "dont filière apprentissage")
  );

  return {
    couverte: {
      national: totalLastYear["Nationale"].number,
      regional: totalLastYear["Région"].number,
      etablissement: totalLastYear["Etablissement"].number,
    },
    couverteVoiePro: {
      national: totalVoiePro["Nationale"].number,
      regional: totalVoiePro["Région"].number,
      etablissement: totalVoiePro["Etablissement"].number,
    },
    couverteApprentissage: {
      national: totalApprentissage["Nationale"].number,
      regional: totalApprentissage["Région"].number,
      etablissement: totalApprentissage["Etablissement"].number,
    },
    couverteBetween: {
      date: totalLastYear["Année"].rich_text[0].plain_text - 1,
      count: {
        national: totalLastYear["Evolution nationale"].number,
        regional: totalLastYear["Evolution Région"].number,
        etablissement: totalLastYear["Evolution établissement"].number,
      },
    },
  };
}
