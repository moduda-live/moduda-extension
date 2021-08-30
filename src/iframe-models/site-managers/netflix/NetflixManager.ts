import SiteManager from "../SiteManager";
import NetflixVideoManager from "./NetflixVideoManager";
import NetflixFormatter from "./NetflixFormatter";

export default class NetflixManager extends SiteManager {
  constructor() {
    super(new NetflixFormatter(), new NetflixVideoManager());
  }
}
