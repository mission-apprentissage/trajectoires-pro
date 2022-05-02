module.exports = {
  number: (custom = {}) => ({ bsonType: "number", ...custom }),
  integer: (custom = {}) => ({ bsonType: "int", ...custom }),
  objectId: (custom = {}) => ({ bsonType: "objectId", ...custom }),
  string: (custom = {}) => ({ bsonType: "string", ...custom }),
  boolean: (custom = {}) => ({ bsonType: "bool", ...custom }),
  date: (custom = {}) => ({ bsonType: "date", ...custom }),
  arrayOf: (items, custom = {}) => {
    return {
      bsonType: "array",
      ...custom,
      items,
    };
  },
  array: (custom = {}) => {
    return {
      bsonType: "array",
      ...custom,
    };
  },
  object: (properties, custom = {}) => {
    return {
      bsonType: "object",
      additionalProperties: false,
      ...custom,
      properties,
    };
  },
};
