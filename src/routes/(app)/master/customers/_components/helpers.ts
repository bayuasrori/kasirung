export const formatCurrency = (value: number | string) =>
  `Rp ${Number(value ?? 0).toLocaleString('id-ID', { maximumFractionDigits: 0 })}`;
