export const knowledgeListPath = '/knowledge/info';

export function asKnowledgeId(value: unknown) {
  return typeof value === 'string' && /^[1-9]\d{0,18}$/.test(value)
    ? value
    : undefined;
}
