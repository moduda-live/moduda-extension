import SiteManager from "../SiteManager";
import NetflixVideoManager from "./NetflixVideoManager";
import NetflixFormatter from "./NetflixScreenFormatter";

export default class NetflixManager extends SiteManager {
  constructor() {
    super(new NetflixFormatter(), new NetflixVideoManager());
  }
}
