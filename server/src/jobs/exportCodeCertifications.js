import { oleoduc, transformData, transformIntoCSV } from "oleoduc";
import { certificationsStats } from "../common/db/collections/collections.js";
import { findCodeCertification } from "../common/actions/findCodeCertification.js";
import { dateAsString } from "../common/utils/stringUtils.js";

export function exportCodeCertifications(output) {
  return oleoduc(
    certificationsStats()
      .aggregate([
        {
          $group: {
            _id: "$code_certification",
            code_certification: { $first: "$code_certification" },
            filiere: { $first: "$filiere" },
          },
        },
      ])
      .stream(),
    transformData(async ({ code_certification, filiere }) => {
      let code = await findCodeCertification(code_certification);

      return {
        code_certification,
        filiere,
        date_fermeture: dateAsString(code?.date_fermeture) || "",
      };
    }),
    transformIntoCSV(),
    output
  );
}
