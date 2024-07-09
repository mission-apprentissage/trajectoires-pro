import moment from "#src/common/utils/dateUtils.js";

export function parseJourneesPortesOuvertes(journeesPortesOuvertes) {
  const dateFormat = "DD/MM/YYYY";
  const hourFormat = "hh:mm";
  const dateHourFormat = dateFormat + " " + hourFormat;

  const defaultMatch = (rule, str) => str.match(rule.regex);
  const optionalRegex = "(?: en virtuel)?( \\([^\\)]+\\))?( voir [^\\s]+)?";
  const rules = {
    date: {
      regex: `^le ([0-9]{2}/[0-9]{2}/[0-9]{4})${optionalRegex}$`,
      match: defaultMatch,
      transform: (rule, str) => {
        const match = str.match(rule.regex);
        return {
          dates: [
            {
              from: moment(match[1], dateFormat).startOf("day").toDate(),
              to: moment(match[1], dateFormat).endOf("day").toDate(),
              fullDay: true,
            },
          ],
        };
      },
    },

    dateHour: {
      regex: `^le ([0-9]{2}/[0-9]{2}/[0-9]{4}) de ([0-9]{2}h[0-9]{2}) à ([0-9]{2}h[0-9]{2})${optionalRegex}$`,
      match: defaultMatch,
      transform: (rule, str) => {
        const match = str.match(rule.regex);
        return {
          dates: [
            {
              from: moment(match[1] + " " + match[2], dateHourFormat).toDate(),
              to: moment(match[1] + " " + match[3], dateHourFormat).toDate(),
              ...(match[4] ? { details: match[4].trim() } : {}),
              fullDay: false,
            },
          ],
        };
      },
    },

    period: {
      regex: `^du ([0-9]{2}/[0-9]{2}/[0-9]{4}) au ([0-9]{2}/[0-9]{2}/[0-9]{4})${optionalRegex}$`,
      match: defaultMatch,
      transform: (rule, str) => {
        const match = str.match(rule.regex);
        return {
          dates: [
            {
              from: moment(match[1], dateHourFormat).startOf("day").toDate(),
              to: moment(match[2], dateHourFormat).endOf("day").toDate(),
              ...(match[3] ? { details: match[3].trim() } : {}),
              fullDay: true,
            },
          ],
        };
      },
    },

    periodHour: {
      regex: `^du ([0-9]{2}/[0-9]{2}/[0-9]{4}) au ([0-9]{2}/[0-9]{2}/[0-9]{4}) de ([0-9]{2}h[0-9]{2}) à ([0-9]{2}h[0-9]{2})${optionalRegex}$`,
      match: defaultMatch,
      transform: (rule, str) => {
        const match = str.match(rule.regex);
        return {
          dates: [
            {
              from: moment(match[1] + " " + match[3], dateHourFormat)
                .startOf("day")
                .toDate(),
              to: moment(match[2] + " " + match[4], dateHourFormat)
                .endOf("day")
                .toDate(),
              ...(match[5] ? { details: match[5].trim() } : {}),
              fullDay: false,
            },
          ],
        };
      },
    },
  };

  const multiLines = (str) => {
    const rulesToDo = Object.keys(rules);
    const split = str.split("|").map((s) => s.trim());

    const dates = [];

    const applyRule = (str) => {
      for (const key of rulesToDo) {
        if (rules[key].match(rules[key], str)) {
          return rules[key].transform(rules[key], str);
        }
      }
      return null;
    };

    for (const part of split) {
      const parsed = applyRule(part);
      if (!parsed) {
        return null;
      }

      dates.push(...parsed.dates);
    }

    return {
      dates,
    };
  };

  journeesPortesOuvertes = journeesPortesOuvertes.trim();
  if (journeesPortesOuvertes === "") {
    return null;
  }

  const multiLinesResult = multiLines(journeesPortesOuvertes);
  if (multiLinesResult) {
    return multiLinesResult;
  }

  return {
    dates: [],
    details: journeesPortesOuvertes,
  };
}
