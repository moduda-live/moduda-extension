import ScreenFormatter from "./ScreenFormatter";
import VideoManager from "./VideoManager";

export default abstract class SiteManager {
  public screenFormatter: ScreenFormatter;
  public videoManager: VideoManager;

  constructor(screenFormatter: ScreenFormatter, videoManager: VideoManager) {
    this.screenFormatter = screenFormatter;
    this.videoManager = videoManager;
  }
}
