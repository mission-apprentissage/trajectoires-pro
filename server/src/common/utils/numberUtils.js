import roundHalfEven from "round-half-even";

export function percentage(dividend, divisor) {
  // Round like mongodb, when X.5 round to the nearest even
  // Avoid having rate > 100 when additioning 2 percentages rounded
  const percent = roundHalfEven((dividend / divisor) * 100, 0);
  return percent;
}
