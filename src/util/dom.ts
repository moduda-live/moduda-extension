// Credits: Yong Wang, https://stackoverflow.com/questions/5525071/how-to-wait-until-an-element-exists
function waitForElm(selector: string): Promise<HTMLElement> {
  return new Promise(resolve => {
    if (document.querySelector(selector)) {
      return resolve(document.querySelector(selector) as HTMLElement);
    }

    const observer = new MutationObserver(mutations => {
      if (document.querySelector(selector)) {
        resolve(document.querySelector(selector) as HTMLElement);
        observer.disconnect();
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  });
}

export async function queryVideos(
  window: Window,
  maxWaitTime: number
): Promise<Array<HTMLVideoElement>> {
  const doc = window.document;
  const videos = doc.querySelectorAll("video");

  if (!videos.length) {
    // there are no videos, wait for at least 1 to load
    return Promise.race([
      waitForElm("video").then(video => [video]),
      new Promise((resolve, reject) =>
        setTimeout(
          () => reject("No videos found after " + maxWaitTime + "ms."),
          maxWaitTime
        )
      )
    ]) as Promise<Array<HTMLVideoElement>>;
  }

  return Array.from(videos);
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

export function isPlaying(vid: HTMLVideoElement) {
  return vid.currentTime > 0 && !vid.paused && !vid.ended && vid.readyState > 2;
}
