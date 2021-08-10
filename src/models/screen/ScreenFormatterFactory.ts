import YoutubeFormatter from "./YoutubeFormatter";
import DefaultScreenFormatter from "./DefaultScreenFormatter";
import ScreenFormatter from "./ScreenFormatter";
import NetflixFormatter from "./NetflixFormatter";

export default class ScreenFormatterFactory {
  static createScreenFormatter(currentUrl: string): ScreenFormatter {
    if (currentUrl.includes("youtube")) {
      return new YoutubeFormatter();
    }

    if (currentUrl.includes("netflix")) {
      return new NetflixFormatter();
    }

    return new DefaultScreenFormatter();
  }
}
