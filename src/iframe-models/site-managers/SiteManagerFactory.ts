import YoutubeManager from "./youtube/YoutueManager";
import DefaultManager from "./default/DefaultManager";
import SiteManager from "./SiteManager";
import NetflixManager from "./netflix/NetflixManager";
import AmazonPrimeManager from "./amazon-prime/AmazonPrimeManager";

export class SiteManagerFactory {
  static createSiteManager(currentUrl: string): SiteManager {
    if (currentUrl.includes("youtube")) return new YoutubeManager();
    if (currentUrl.includes("netflix")) return new NetflixManager();
    if (currentUrl.includes("amazon")) return new AmazonPrimeManager();

    return new DefaultManager();
  }
}
