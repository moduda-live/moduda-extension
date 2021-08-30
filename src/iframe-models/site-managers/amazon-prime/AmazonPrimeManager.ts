import SiteManager from "../SiteManager";
import AmazonPrimeScreenFormatter from "./AmazonPrimeScreenFormatter";
import AmazonPrimeVideoManager from "./AmazonPrimeVideoManager";

export default class AmazonPrimeManager extends SiteManager {
  constructor() {
    super(new AmazonPrimeScreenFormatter(), new AmazonPrimeVideoManager());
  }
}
