export function queryVideos(
  window: Window,
  results: Array<HTMLVideoElement>
): Array<HTMLVideoElement> {
  const doc = window.document;
  const videos = doc.querySelectorAll("video");
  videos.forEach(video => results.push(video));

  return results;
}
export function getLargestVideo(
  videos: Array<HTMLVideoElement>
): HTMLVideoElement {
  let largestVideoArea = videos[0].offsetHeight * videos[0].offsetWidth;

  const largestVideo = videos.reduce((prev, current) => {
    const currentVideoArea = current.offsetHeight * current.offsetWidth;
    if (currentVideoArea > largestVideoArea) {
      largestVideoArea = currentVideoArea;
      return current;
    }
    return prev;
  });

  return largestVideo;
}

export function getViewportWidth() {
  return Math.max(
    document.documentElement.clientWidth || 0,
    window.innerWidth || 0
  );
}
