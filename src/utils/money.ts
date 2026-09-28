const CENTS_PER_UNIT = 100;

export function toCents(amount: number): number {
  return Math.round(amount * CENTS_PER_UNIT);
}

export function sumPrices(prices: readonly number[]): number {
  const totalCents = prices.reduce((total, price) => total + toCents(price), 0);
  return totalCents / CENTS_PER_UNIT;
}

export function formatPrice(amount: number): string {
  const cents = toCents(amount);
  const value =
    cents % CENTS_PER_UNIT === 0
      ? String(cents / CENTS_PER_UNIT)
      : (cents / CENTS_PER_UNIT).toFixed(2);

  return `${value} EUR`;
}
