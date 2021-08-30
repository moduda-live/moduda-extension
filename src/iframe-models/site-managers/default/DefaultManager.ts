import SiteManager from "../SiteManager";
import DefaultScreenFormatter from "./DefaultScreenFormatter";
import DefaultVideoManager from "./DefaultVideoManager";

export default class DefaultManager extends SiteManager {
  constructor() {
    super(new DefaultScreenFormatter(), new DefaultVideoManager());
  }
}
