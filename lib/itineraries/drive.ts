export function parseDrivePdfId(rawUrl: string): string | null {
  try {
    const url = new URL(rawUrl);

    if (
      url.hostname !== "drive.google.com" &&
      !url.hostname.endsWith(".drive.google.com")
    ) {
      return null;
    }

    const fileMatch = url.pathname.match(/\/file\/d\/([^/]+)/);

    if (fileMatch?.[1]) {
      return fileMatch[1];
    }

    const id = url.searchParams.get("id");

    return id || null;
  } catch {
    return null;
  }
}

export function drivePdfUrl(rawUrl: string): string {
  const id = parseDrivePdfId(rawUrl);

  if (!id) {
    return rawUrl;
  }

  return `https://drive.google.com/uc?export=download&id=${encodeURIComponent(id)}`;
}
