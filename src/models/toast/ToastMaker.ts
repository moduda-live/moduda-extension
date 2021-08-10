import Toastify from "toastify-js";
import "toastify-js/src/toastify.css";

export default class ToastMaker {
  makeToast(toastMsg: string, isWarning = false) {
    Toastify({
      text: toastMsg,
      duration: 2500,
      className: isWarning ? "moduda-toast-warning" : "moduda-toast",
      gravity: "top",
      position: "center"
    }).showToast();
  }
}
