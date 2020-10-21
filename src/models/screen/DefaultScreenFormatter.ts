import ScreenFormatter from "./ScreenFormatter";

export default class DefaultScreenFormatter extends ScreenFormatter {
  constructor() {
    super();
  }

  adjustScreenFormat() {
    console.log("default screen adjuster");
  }

  adjustScreenFormatOnFullScreenChange(): void {
    throw new Error("Method not implemented.");
  }
  adjustScreenFormatOnResize(): void {
    throw new Error("Method not implemented.");
  }
}
