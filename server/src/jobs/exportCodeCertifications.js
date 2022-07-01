import { oleoduc, transformData, transformIntoCSV } from "oleoduc";
import { certificationsStats } from "../common/db/collections.js";
import { findCodeCertification } from "../common/actions/findCodeCertification.js";
import { pick } from "lodash-es";
import { dateAsString } from "../common/utils/stringUtils.js";

export function exportCodeCertifications(output) {
  return oleoduc(
    certificationsStats().find().stream(),
    transformData(async (stats) => {
      let code = await findCodeCertification(stats.code_certification);

      return {
        ...pick(stats, ["code_certification", "millesime", "filiere"]),
        date_fermeture: dateAsString(code?.date_fermeture) || "",
      };
    }),
    transformIntoCSV(),
    output
  );
}
