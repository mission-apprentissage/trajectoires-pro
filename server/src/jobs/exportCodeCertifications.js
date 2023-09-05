import { oleoduc, transformData, transformIntoCSV } from "oleoduc";
import { bcn, certificationsStats } from "#src/common/db/collections/collections.js";
import { dateAsString } from "#src/common/utils/stringUtils.js";

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
    transformData(
      async ({ code_certification, filiere }) => {
        let code = await bcn().findOne({ code_certification });

        return {
          code_certification,
          filiere,
          date_fermeture: dateAsString(code?.date_fermeture) || "",
        };
      },
      { parallel: 10 }
    ),
    transformIntoCSV(),
    output
  );
}
