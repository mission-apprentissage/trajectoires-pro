import { reduceStats, getTauxReglesDeCalcul, TAUX, VALEURS } from "../stats.js";

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
  return reduceStats(VALEURS, (statName) => $sumOf($(statName)));
}

export function $computeTauxStats() {
  const regles = getTauxReglesDeCalcul();
  return reduceStats(TAUX, (statName) => {
    const regle = regles[statName];
    return regle ? $percentage($(regle.dividend), $(regle.divisor)) : null;
  });
}
