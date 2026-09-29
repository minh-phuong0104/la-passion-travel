export function itineraryDownloadUrl(rawUrl: string) {
  try {
    const url = new URL(rawUrl);

    if (
      url.hostname === "drive.google.com" ||
      url.hostname.endsWith(".drive.google.com")
    ) {
      const fileMatch = url.pathname.match(/\/file\/d\/([^/]+)/);
      const id = fileMatch?.[1] || url.searchParams.get("id");

      if (id) {
        return `https://drive.google.com/uc?export=download&id=${encodeURIComponent(id)}`;
      }
    }

    return rawUrl;
  } catch {
    return rawUrl;
  }
}
