import Toastify from "toastify-js";
import "toastify-js/src/toastify.css";

export default class ToastMaker {
  makeToast(toastMsg: string, isWarning = false) {
    Toastify({
      text: toastMsg,
      duration: 1000,
      className: isWarning ? "movens-toast-warning" : "movens-toast",
      gravity: "top",
      position: "center"
    }).showToast();
  }
}
