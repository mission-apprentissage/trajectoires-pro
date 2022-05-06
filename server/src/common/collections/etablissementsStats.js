const { object, objectId } = require("./schemas/jsonSchemaTypes");
module.exports = {
  name: "etablissementsStats",
  schema: () => {
    return object(
      {
        _id: objectId(),
      },
      { additionalProperties: true }
    );
  },
  indexes: () => {
    return [[{ uai: 1 }, { unique: true }]];
  },
};
