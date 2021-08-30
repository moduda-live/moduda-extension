import SiteManager from "../SiteManager";
import DefaultScreenFormatter from "../default/DefaultScreenFormatter";
import DefaultVideoManager from "../default/DefaultVideoManager";

export default class YoutubeManager extends SiteManager {
  constructor() {
    super(new DefaultScreenFormatter(), new DefaultVideoManager());
  }
}
