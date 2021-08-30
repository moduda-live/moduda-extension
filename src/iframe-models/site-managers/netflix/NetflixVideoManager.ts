import VideoManager from "../VideoManager";

export default class NetflixVideoManager extends VideoManager {
  videoTargetSelector = "video";

  constructor() {
    super();
    const customScript = document.createElement("script");
    customScript.type = "text/javascript";
    customScript.innerHTML = `
        const videoPlayer = window.netflix.appContext.state.playerApp.getAPI().videoPlayer;
        const player = videoPlayer.getVideoPlayerBySessionId(videoPlayer.getAllPlayerSessionIds()[0]);
        console.log("window loaded")
        window.addEventListener("message", (event) => {
            const msg = event.data;
            if(!msg) return;
            if(!msg.payload) return;

            switch(msg.type) {
                case 'seek': {
                    player.seek(msg.payload.time);
                    break;
                }
                case 'play': {
                    player.play();
                    break;
                }
                case 'pause': {
                    player.pause();
                    break;
                }
                case 'changeSpeed': {
                    player.setPlaybackRate(msg.payload.speed);
                    break;
                }
            }
        });
    `;
    document.head.appendChild(customScript);
  }

  playVideoHook(): void {
    const playMsg = {
      type: "play",
      payload: {}
    };
    window.postMessage(playMsg, window.location.origin);
  }

  pauseVideoHook(): void {
    const pauseMsg = {
      type: "pause",
      payload: {}
    };
    window.postMessage(pauseMsg, window.location.origin);
  }

  seekVideoHook(time: number): void {
    const seekMsg = {
      type: "seek",
      payload: {
        time
      }
    };
    window.postMessage(seekMsg, window.location.origin);
  }

  changeSpeedVideoHook(speed: number): void {
    const changeSpeedMsg = {
      type: "speed",
      payload: {
        speed
      }
    };
    window.postMessage(changeSpeedMsg, window.location.origin);
  }
}
