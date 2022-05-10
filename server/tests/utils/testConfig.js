const uuid = require("uuid");
process.env.TRAJECTOIRES_PRO_OVH_STORAGE_URI = "https://ovh.com";
process.env.TRAJECTOIRES_PRO_INSERJEUNES_USERNAME = "test";
process.env.TRAJECTOIRES_PRO_INSERJEUNES_PASSWORD = uuid.v4();
process.env.TRAJECTOIRES_PRO_INSERJEUNES_API_KEY = uuid.v4();
