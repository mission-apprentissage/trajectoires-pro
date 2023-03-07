export function $field(v) {
  return "$" + v;
}

export function $sumOf(field) {
  return { $sum: { $ifNull: [field, 0] } };
}

export function $percentage(dividend, divisor) {
  return {
    $round: {
      $multiply: [
        {
          $divide: [dividend, divisor],
        },
        100,
      ],
    },
  };
}

export function $removeNullOrZero(field, expr) {
  return {
    $cond: [{ $or: [{ $eq: [field, 0] }, { $not: [field] }] }, "$$REMOVE", expr],
  };
}
