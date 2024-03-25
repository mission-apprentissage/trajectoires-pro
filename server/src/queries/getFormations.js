import { etablissement } from "#src/common/db/collections/collections.js";

export async function getFormations(
  { coordinate, millesime, maxDistance = 1000, codesDiplome = ["3", "4"] },
  pagination = { page: 1, limit: 100 }
) {
  let page = pagination.page || 1;
  let limit = pagination.limit || 100;
  let skip = (page - 1) * limit;

  const query = [
    {
      $geoNear: {
        near: { type: "Point", coordinates: [coordinate.longitude, coordinate.latitude] },
        distanceField: "distance.calculated",
        maxDistance,
        includeLocs: "distance.location",
        key: "coordinate",
        spherical: true,
      },
    },
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
        _id: "$formation._id",
      },
    },
    {
      $replaceRoot: {
        newRoot: { $mergeObjects: ["$$ROOT", "$formations"] },
      },
    },
    {
      $match: {
        ...(codesDiplome.length > 0 ? { "bcn.diplome.code": { $in: codesDiplome } } : {}),
      },
    },
    {
      $project: {
        formations: 0,
      },
    },
  ];

  const countRequest = await etablissement()
    .aggregate([
      ...query,
      {
        $count: "total",
      },
    ])
    .toArray();

  const total = countRequest.length > 0 ? countRequest[0].total : 0;

  const formationsStream = await etablissement()
    .aggregate([...query, { $skip: skip }, { $limit: limit }])
    .stream();

  return {
    pagination: {
      page,
      items_par_page: limit,
      nombre_de_page: Math.ceil(total / limit) || 1,
      total: total,
    },
    formations: formationsStream,
  };
}
