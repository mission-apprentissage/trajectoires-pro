export function $field(v) {
  return "$" + v;
}

export function $sumOf(field) {
  return { $sum: { $ifNull: [field, 0] } };
}

export function $sumOfArray(field) {
  return {
    $cond: [
      {
        $eq: [
          {
            $size: {
              $filter: {
                input: field,
                cond: {
                  $ne: ["$$this", null],
                },
              },
            },
          },
          0,
        ],
      },
      null,
      $sumOf(field),
    ],
  };
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

export function $removeWhenAllNull(fields, expr, replacementValue = undefined) {
  return {
    $cond: [
      {
        $and: [
          ...fields.map((field) => ({
            $not: [field],
          })),
        ],
      },
      replacementValue === undefined ? "$$REMOVE" : null,
      expr,
    ],
  };
}
