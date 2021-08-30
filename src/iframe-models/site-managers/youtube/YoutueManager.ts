import SiteManager from "../SiteManager";
import DefaultVideoManager from "../default/DefaultVideoManager";
import YoutubeScreenFormatter from "./YoutubeScreenFormatter";

export default class YoutubeManager extends SiteManager {
  constructor() {
    super(new YoutubeScreenFormatter(), new DefaultVideoManager());
  }
}
