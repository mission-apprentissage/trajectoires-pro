import { flatMap } from "lodash-es";
import { etablissement } from "#src/common/db/collections/collections.js";
import { createTags, filterTag } from "./formationTag.js";
//import { dbCollection } from "#src/common/db/mongodb.js";

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
  { filtersEtablissement = [], filtersFormation = [], tag = null, millesime, codesDiplome = ["3", "4"] },
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
        from: "bcn",
        foreignField: "code_formation_diplome",
        localField: "formations.cfd",
        as: "bcn",
        pipeline: [{ $match: { type: "cfd" } }],
      },
    },
    {
      $set: {
        bcn: { $first: "$bcn" },
        formation: "$formations",
        _id: "$formation._id",
      },
    },
    {
      $match: {
        ...(codesDiplome.length > 0 ? { "bcn.diplome.code": { $in: codesDiplome } } : {}),
      },
    },
    // Create tag
    ...createTags(),
    ...filterTag(tag),
    ...flatMap(filtersFormation),
    {
      $project: {
        formation: 1,
        etablissement: 1,
        bcn: 1,
        tags: 1,
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
