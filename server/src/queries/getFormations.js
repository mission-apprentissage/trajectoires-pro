import { flatMap } from "lodash-es";
import { GraphHopperApi } from "#src/services/graphHopper/graphHopper.js";
import * as Cache from "#src/common/cache.js";
import { etablissement } from "#src/common/db/collections/collections.js";
import { filterTag } from "./formationTag.js";
import moment from "#src/common/utils/dateUtils.js";
//import { dbCollection } from "#src/common/db/mongodb.js";

export function getRouteDate() {
  return moment().startOf("isoWeek").add(1, "week").set({ hour: 8, minute: 30, second: 0, millisecond: 0 }).toDate();
}

export async function buildFiltersEtablissement({ timeLimit, distance, latitude, longitude, uais }) {
  let filtersEtablissement = [];

  if (uais.length > 0) {
    filtersEtablissement.push({
      $match: {
        uai: { $in: uais },
      },
    });
  }

  if (latitude === null || longitude === null) {
    return filtersEtablissement;
  }

  if (timeLimit) {
    const buckets = [7200, 5400, 3600, 2700, 1800, 900];
    const graphHopperApi = new GraphHopperApi();
    try {
      const graphHopperParameter = {
        point: `${latitude},${longitude}`,
        departureTime: getRouteDate(),
        buckets: buckets.filter((b) => b <= timeLimit),
        reverse_flow: true,
      };
      const isochroneBuckets = await Cache.getOrSet(JSON.stringify(graphHopperParameter), () =>
        graphHopperApi.fetchIsochronePTBuckets(graphHopperParameter)
      );

      filtersEtablissement.push(getTimeFilter({ coordinate: { longitude, latitude }, isochroneBuckets }));
      //  filter = testTimeFilter({ coordinate: { longitude, latitude } });
    } catch (err) {
      console.error(err);
      // TODO : gestion des erreurs de récupération de l'isochrone
      filtersEtablissement.push(getDistanceFilter({ coordinate: { longitude, latitude }, maxDistance: distance }));
    }
    return filtersEtablissement;
  }

  if (distance) {
    filtersEtablissement.push(getDistanceFilter({ coordinate: { longitude, latitude }, maxDistance: distance }));
  }

  return filtersEtablissement;
}

export async function buildFiltersFormation({ cfds, domaine }) {
  let filtersFormation = [];

  if (cfds.length > 0) {
    filtersFormation.push({
      $match: {
        "formation.cfd": { $in: cfds },
      },
    });
  }

  if (domaine) {
    filtersFormation.push({
      $match: {
        "formationInfo.domaines.domaine": { $in: [domaine] },
      },
    });
  }

  return filtersFormation;
}

export function testTimeFilter({ coordinate }) {
  return [
    {
      $match: {
        polygons: {
          $geoIntersects: {
            $geometry: {
              type: "Point",
              coordinates: coordinate,
            },
          },
        },
      },
    },
    {
      $lookup: {
        from: "etablissement",
        foreignField: "uai",
        localField: "uai",
        as: "etablissements",
      },
    },
    {
      $unwind: { path: "$etablissements" },
    },
    {
      $replaceRoot: {
        newRoot: "$etablissements",
      },
    },
  ];
}

export function getTimeFilter({ coordinate, isochroneBuckets }) {
  const facets = {};
  isochroneBuckets.forEach((result, index) => {
    const next = isochroneBuckets[index + 1]
      ? {
          coordinate: {
            $not: {
              $geoWithin: {
                $geometry: isochroneBuckets[index + 1].feature.geometry,
              },
            },
          },
        }
      : null;

    facets[result.time] = [
      {
        $match: {
          $and: [
            {
              coordinate: {
                $geoWithin: {
                  $geometry: result.feature.geometry,
                },
              },
            },
            ...(next ? [next] : []),
          ],
        },
      },
      {
        $set: {
          accessTime: result.time,
        },
      },
    ];
  });

  const filter = [
    {
      $geoNear: {
        near: { type: "Point", coordinates: coordinate },
        distanceField: "distance",
        query: {
          coordinate: {
            $geoWithin: {
              $geometry: isochroneBuckets[0].feature.geometry,
            },
          },
        },
        spherical: true,
      },
    },
    {
      $facet: facets,
    },
    {
      $project: {
        etablissements: { $setUnion: isochroneBuckets.map((v) => "$" + v.time) },
        _id: 0,
      },
    },
    {
      $unwind: { path: "$etablissements" },
    },
    {
      $replaceRoot: {
        newRoot: "$etablissements",
      },
    },
    {
      $sort: {
        accessTime: 1,
        distance: 1,
      },
    },
  ];

  return filter;
}

export function getDistanceFilter({ coordinate, maxDistance = 1000 }) {
  const filter = [
    {
      $geoNear: {
        near: { type: "Point", coordinates: [coordinate.longitude, coordinate.latitude] },
        distanceField: "distance",
        maxDistance,
        key: "coordinate",
        spherical: true,
      },
    },
  ];

  return filter;
}

export async function getFormations(
  { filtersEtablissement = [], filtersFormation = [], tag = null, millesime },
  pagination = { page: 1, limit: 100 }
) {
  let page = pagination.page || 1;
  let limit = pagination.limit || 100;
  let skip = (page - 1) * limit;

  const query = [
    ...flatMap(filtersEtablissement),
    {
      $set: {
        etablissement: "$$ROOT",
      },
    },
    {
      $project: {
        etablissement: 1,
      },
    },
    {
      $lookup: {
        from: "formationEtablissement",
        foreignField: "uai",
        localField: "etablissement.uai",
        as: "formations",
        pipeline: [
          {
            $match: {
              millesime: { $in: millesime },
            },
          },
        ],
      },
    },
    {
      $unwind: {
        path: "$formations",
        preserveNullAndEmptyArrays: false,
      },
    },
    {
      $lookup: {
        from: "formation",
        foreignField: "cfd",
        localField: "formations.cfd",
        as: "formationInfo",
      },
    },
    {
      $set: {
        formation: "$formations",
        _id: "$formation._id",
      },
    },
    {
      $set: {
        "formation.libelle": { $first: "$formationInfo.libelle" },
      },
    },
    ...filterTag(tag),
    ...flatMap(filtersFormation),
    {
      $project: {
        formation: 1,
        formationInfo: 1,
        etablissement: 1,
        inserjeunes: 1,
      },
    },
  ];

  const queryStart = Date.now();
  const formationsStream = await etablissement()
    //await dbCollection("testGeoJson")
    .aggregate([
      ...query,
      {
        $facet: {
          pagination: [
            { $count: "total" },
            {
              $set: {
                page,
                items_par_page: limit,
                nombre_de_page: { $ceil: { $divide: ["$total", limit] } }, //Math.ceil(total / limit) || 1,
              },
            },
          ],
          formations: [{ $skip: skip }, { $limit: limit }],
        },
      },
      {
        $project: {
          pagination: {
            $ifNull: [
              { $first: "$pagination" },
              {
                total: 0,
                page,
                items_par_page: limit,
                nombre_de_page: 0,
              },
            ],
          },
          formations: "$formations",
        },
      },
    ])
    .next();

  console.log("QUERY TIME", Date.now() - queryStart);
  return formationsStream;
}
