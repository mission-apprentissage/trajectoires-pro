export function percentage(dividend, divisor) {
  // Round like mongodb, when X.5 round to the nearest even
  // Avoid having rate > 100 when additioning 2 percentages rounded
  const percent = Math.round((dividend / divisor) * 100);
  return percent - (percent % 2);
}
