export function $sumOf(field) {
  return { $sum: { $ifNull: [field, 0] } };
}

export function $percentage(dividend, divisor) {
  return {
    $round: { $multiply: [{ $divide: [dividend, divisor] }, 100] },
  };
}
