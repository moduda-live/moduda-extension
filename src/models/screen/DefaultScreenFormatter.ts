import ScreenFormatter from "./ScreenFormatter";

export default class DefaultScreenFormatter extends ScreenFormatter {
  constructor() {
    super();
  }

  adjustScreenFormat() {
    console.log("default screen adjuster");
  }

  adjustScreenFormatOnFullScreenChange(): void {
    console.log("default screen adjuster");
  }
  adjustScreenFormatOnResize(): void {
    console.log("default screen adjuster");
  }
}
