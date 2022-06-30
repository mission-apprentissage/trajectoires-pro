import "dotenv/config";
import { generateMongodbDocumentTypes } from "./generateMongodbDocumentTypes.js";

(async function () {
  await generateMongodbDocumentTypes();
})();
