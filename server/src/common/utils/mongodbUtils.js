export function $field(v) {
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
