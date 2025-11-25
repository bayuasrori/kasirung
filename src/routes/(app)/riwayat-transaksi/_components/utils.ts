const statusLabels: Record<string, string> = {
	completed: 'Selesai',
	pending: 'Menunggu',
	void: 'Dibatalkan'
};

const statusVariants: Record<string, 'default' | 'success' | 'warning' | 'destructive' | 'muted'> = {
	completed: 'success',
	pending: 'warning',
	void: 'destructive'
};

export const formatCurrency = (value: string | number) =>
	`Rp ${Number(value ?? 0).toLocaleString('id-ID', { maximumFractionDigits: 0 })}`;

export const formatDate = (value: Date) =>
	new Date(value).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' });

export const getStatusLabel = (status: string) => statusLabels[status] ?? status;
export const getStatusVariant = (status: string) => statusVariants[status] ?? 'muted';

export const canDeleteTransaction = (value: Date) => {
	const createdAt = new Date(value);
	const now = new Date();
	const startOfToday = new Date(now);
	startOfToday.setHours(0, 0, 0, 0);
	const endOfToday = new Date(now);
	endOfToday.setHours(23, 59, 59, 999);
	return createdAt >= startOfToday && createdAt <= endOfToday;
};
