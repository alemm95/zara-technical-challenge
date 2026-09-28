const MAX_SEARCH_LENGTH = 80;

export type CatalogSearchParam = string | string[] | undefined;

export function normalizeCatalogSearch(
  value: CatalogSearchParam | null,
): string {
  const first = Array.isArray(value) ? value[0] : value;

  return (first ?? "").trim().replace(/\s+/g, " ").slice(0, MAX_SEARCH_LENGTH);
}

function withSearch(path: string, search: string): string {
  const term = normalizeCatalogSearch(search);

  return term ? `${path}?${new URLSearchParams({ search: term })}` : path;
}

export function buildCatalogHref(search = ""): string {
  return withSearch("/", search);
}

export function buildProductHref(id: string, search = ""): string {
  return withSearch(`/product/${encodeURIComponent(id)}`, search);
}
