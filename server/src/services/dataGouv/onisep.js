import unzipper from "unzipper";
import { compose, transformIntoStream } from "oleoduc";
import { cloneDeep, set, get } from "lodash-es";
import config from "#src/config.js";
import { DataGouvApi } from "./DataGouvApi.js";
import XmlParser from "node-xml-stream";
import nodeStream from "stream";

function transformXmlFormationToStream() {
  const xmlParser = new XmlParser();

  let formation = {};
  let currentKey = "";
  let insideFormation = false;

  const transformXml = new nodeStream.Duplex({
    objectMode: true,
    final: () => {
      xmlParser.end();
    },
    write: (chunk, encoding, next) => {
      xmlParser.write(chunk);
      next();
    },
    read() {},
  });

  xmlParser.on("opentag", (name) => {
    if (insideFormation && name[name.length - 1] !== "/") {
      currentKey = [...currentKey, name];
    }

    if (name === "formation") {
      insideFormation = true;
    }
  });

  xmlParser.on("closetag", (name) => {
    if (name === "formation") {
      insideFormation = false;
      transformXml.push(cloneDeep(formation));
      formation = {};
    }

    if (insideFormation) {
      currentKey = currentKey.slice(0, -1);
    }
  });

  xmlParser.on("text", (text) => {
    if (!get(formation, currentKey)) {
      set(formation, currentKey, text);
    }
  });

  xmlParser.on("cdata", (cdata) => {
    set(formation, currentKey, cdata);
  });

  xmlParser.on("error", (err) => {
    throw err;
  });

  xmlParser.on("finish", () => {
    transformXml.push(null);
  });

  return transformXml;
}

export async function streamIdeoFichesFormations(options = {}) {
  const api = options.api || new DataGouvApi(options.apiOptions || {});
  const stream = await api.datasets(config.datagouv.datasets.onisepIdeoFichesFormations);

  return await compose(
    stream,
    unzipper.Parse(),
    transformIntoStream(async (entry) => {
      return entry;
    }),
    transformXmlFormationToStream()
  );
}
