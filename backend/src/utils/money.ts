/** Rounds to 2 decimals using "half away from zero", avoiding binary float artefacts (1.005 → 1.01). */
export const round2 = (value: number): number => {
  const sign = value < 0 ? -1 : 1;
  return (sign * Math.round((Math.abs(value) + Number.EPSILON) * 100)) / 100;
};

export interface LineAmounts {
  netAmount: number;
  vatAmount: number;
  totalAmount: number;
}

export const calculateLine = (quantity: number, unitPrice: number, vatRate: number): LineAmounts => {
  const netAmount = round2(quantity * unitPrice);
  const vatAmount = round2((netAmount * vatRate) / 100);
  return { netAmount, vatAmount, totalAmount: round2(netAmount + vatAmount) };
};
