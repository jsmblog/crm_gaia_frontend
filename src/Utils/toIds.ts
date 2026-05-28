export const toIds = (val: unknown): string[] => {
  if (!Array.isArray(val)) return [];
  return val.map((v) => (typeof v === 'string' ? v : (v as any)?.id ?? '')).filter(Boolean);
};