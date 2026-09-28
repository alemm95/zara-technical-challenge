// The API serves image URLs over http although its host also supports https.
export function toHttps(url: string): string {
  return url.replace(/^http:\/\//i, "https://");
}
