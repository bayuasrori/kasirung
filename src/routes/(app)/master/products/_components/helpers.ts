export const formatCurrency = (value: string) =>
  `Rp ${Number(value ?? 0).toLocaleString('id-ID', { maximumFractionDigits: 0 })}`;
