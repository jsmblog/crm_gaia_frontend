export const toIdArray = (val: any): string[] =>
  (Array.isArray(val) ? val : [])
    .map((c: any) => typeof c === 'string' ? c : c?.id)
    .filter(Boolean);