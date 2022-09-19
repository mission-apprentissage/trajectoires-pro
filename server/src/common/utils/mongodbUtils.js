import { computeTauxStats, reduceStats, VALEURS } from "../stats.js";

function $(v) {
  return "$" + v;
}

export function $sumOf(field) {
  return { $sum: { $ifNull: [field, 0] } };
}

export function $percentage(dividend, divisor) {
  return {
    $cond: [
      { $or: [{ $eq: [divisor, 0] }, { $not: [divisor] }] },
      "$$REMOVE",
      {
        $round: {
          $multiply: [
            {
              $divide: [dividend, divisor],
            },
            100,
          ],
        },
      },
    ],
  };
}

export function $sumValeursStats() {
  return reduceStats(VALEURS, (statName) => {
    return {
      [statName]: $sumOf($(statName)),
    };
  });
}

export function $computeTauxStats() {
  return computeTauxStats((regle) => $percentage($(regle.dividend), $(regle.divisor)));
}
