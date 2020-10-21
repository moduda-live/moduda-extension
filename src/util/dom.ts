export function recursiveQueryVideos(
  doc: Document,
  results: Array<HTMLVideoElement>
): Array<HTMLVideoElement> {
  const videos = doc.querySelectorAll("video");
  videos.forEach(video => results.push(video));

  // ignore movens-iframe since its CORS disabled
  doc.querySelectorAll("iframe:not(#movens-iframe)").forEach(iframe => {
    const framedoc = (iframe as HTMLIFrameElement).contentWindow?.document;
    if (!framedoc) {
      return;
    }
    results.concat(recursiveQueryVideos(framedoc, results));
  });

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
