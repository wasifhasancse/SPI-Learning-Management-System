/**
 * Converts various video URL formats (YouTube, Vimeo, direct MP4) into an embeddable format
 */
export function getEmbedVideoUrl(url: string): { type: 'youtube' | 'vimeo' | 'direct' | 'iframe'; embedUrl: string } {
  if (!url) {
    return { type: 'direct', embedUrl: '' };
  }

  const trimmed = url.trim();
  const withoutAutoplay = (videoUrl: string) => {
    const hashIndex = videoUrl.indexOf("#");
    const hash = hashIndex >= 0 ? videoUrl.slice(hashIndex) : "";
    const urlWithoutHash = hashIndex >= 0 ? videoUrl.slice(0, hashIndex) : videoUrl;
    const queryIndex = urlWithoutHash.indexOf("?");
    if (queryIndex < 0) return videoUrl;
    const path = urlWithoutHash.slice(0, queryIndex);
    const query = urlWithoutHash
      .slice(queryIndex + 1)
      .split("&")
      .filter((parameter) => parameter.split("=")[0].toLowerCase() !== "autoplay")
      .join("&");
    return `${path}${query ? `?${query}` : ""}${hash}`;
  };

  // 1. YouTube watch URLs: https://www.youtube.com/watch?v=VIDEO_ID
  const youtubeWatchMatch = trimmed.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/);
  if (youtubeWatchMatch && youtubeWatchMatch[1]) {
    return {
      type: 'youtube',
      embedUrl: `https://www.youtube.com/embed/${youtubeWatchMatch[1]}?rel=0&autoplay=0`
    };
  }

  // 2. Vimeo URLs: https://vimeo.com/VIDEO_ID
  const vimeoMatch = trimmed.match(/vimeo\.com\/([0-9]+)/);
  if (vimeoMatch && vimeoMatch[1]) {
    return {
      type: 'vimeo',
      embedUrl: `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=0`
    };
  }

  // 3. Direct video file (mp4, webm, ogg)
  if (trimmed.match(/\.(mp4|webm|ogg)($|\?)/i)) {
    return {
      type: 'direct',
      embedUrl: withoutAutoplay(trimmed)
    };
  }

  // 4. Default: fallback to iframe embed
  return {
    type: 'iframe',
    embedUrl: withoutAutoplay(trimmed)
  };
}

