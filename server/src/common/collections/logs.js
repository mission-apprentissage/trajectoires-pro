const { object, objectId, string, date, integer } = require("./schemas/jsonSchemaTypes");
module.exports = {
  name: "logs",
  schema: () => {
    return object(
      {
        _id: objectId(),
        name: string(),
        hostname: string(),
        pid: integer(),
        level: integer(),
        msg: string(),
        time: date(),
        v: integer(),
      },
      { required: ["time"], additionalProperties: true }
    );
  },
  indexes: () => {
    return [[{ time: 1 }]];
  },
};
