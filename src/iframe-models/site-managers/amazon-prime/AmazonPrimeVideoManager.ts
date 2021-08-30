import DefaultVideoManager from "../default/DefaultVideoManager";

export default class AmazonPrimeVideoManager extends DefaultVideoManager {
  // override
  videoTargetSelector = ".rendererContainer video";
}
