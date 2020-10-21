import YoutubeFormatter from "./YoutubeFormatter";
import DefaultScreenFormatter from "./DefaultScreenFormatter";
import ScreenFormatter from "./ScreenFormatter";

export default class ScreenFormatterFactory {
  static createScreenFormatter(currentUrl: string): ScreenFormatter {
    if (currentUrl.includes("youtube")) {
      return new YoutubeFormatter();
    } else {
      return new DefaultScreenFormatter();
    }
  }
}
