const YOUTUBE_HOSTS = new Set([
  "youtube.com",
  "www.youtube.com",
  "m.youtube.com",
  "music.youtube.com",
  "youtu.be",
  "youtube-nocookie.com",
  "www.youtube-nocookie.com",
]);

const VIDEO_ID = /^[\w-]{11}$/;

function getVideoId(input: string): string | null {
  const value = input.trim();

  if (!value || /[\u0000-\u001f\u007f]/.test(value)) return null;

  // A URL host must be explicit and must not contain credentials or a port.
  const authority = /^https:\/\/([^/?#]+)/i.exec(value)?.[1];
  if (!authority || authority.includes("@") || authority.includes(":")) {
    return null;
  }

  let parsed: URL;
  try {
    parsed = new URL(value);
  } catch {
    return null;
  }

  if (
    parsed.protocol !== "https:" ||
    !YOUTUBE_HOSTS.has(parsed.hostname.toLowerCase()) ||
    parsed.username ||
    parsed.password ||
    parsed.port
  ) {
    return null;
  }

  const segments = parsed.pathname.split("/").filter(Boolean);
  let videoId: string | null = null;

  if (
    [
      "youtube.com",
      "www.youtube.com",
      "m.youtube.com",
      "music.youtube.com",
    ].includes(parsed.hostname.toLowerCase()) &&
    parsed.pathname === "/watch"
  ) {
    videoId = parsed.searchParams.get("v");
  } else if (parsed.hostname.toLowerCase() === "youtu.be") {
    videoId = segments.length === 1 ? segments[0] : null;
  } else if (
    [
      "youtube.com",
      "www.youtube.com",
      "m.youtube.com",
      "music.youtube.com",
    ].includes(parsed.hostname.toLowerCase()) &&
    segments.length === 2 &&
    ["shorts", "embed"].includes(segments[0])
  ) {
    videoId = segments[1];
  } else if (
    ["youtube-nocookie.com", "www.youtube-nocookie.com"].includes(
      parsed.hostname.toLowerCase(),
    ) &&
    segments.length === 2 &&
    segments[0] === "embed"
  ) {
    videoId = segments[1];
  }

  return videoId && VIDEO_ID.test(videoId) ? videoId : null;
}

export function isValidYoutubeUrl(url: string) {
  return typeof url === "string" && getVideoId(url) !== null;
}

type GetEmbedYoutubeUrlOptions = {
  url: string;
  allowFullscreen?: boolean;
  autoplay?: boolean;
  nocookie?: boolean;
  controls?: boolean;
};

export function getEmbedYoutubeUrl({
  url,
  nocookie,
  allowFullscreen,
  autoplay,
  controls,
}: GetEmbedYoutubeUrlOptions) {
  const videoId = typeof url === "string" ? getVideoId(url) : null;
  if (!videoId) return null;

  const origin = nocookie
    ? "https://www.youtube-nocookie.com/embed/"
    : "https://www.youtube.com/embed/";
  const embedUrl = new URL(`${origin}${videoId}`);

  if (!allowFullscreen) embedUrl.searchParams.set("fs", "0");
  if (autoplay) embedUrl.searchParams.set("autoplay", "1");
  if (controls === false) embedUrl.searchParams.set("controls", "0");

  return embedUrl.toString();
}

export function normalizeYoutubeWidth(width: unknown): number | null {
  if (width === null || width === undefined || width === "") return null;
  const parsed = typeof width === "number" ? width : Number(width);
  if (!Number.isFinite(parsed)) return null;
  return Math.min(100, Math.max(25, Math.round(parsed)));
}
