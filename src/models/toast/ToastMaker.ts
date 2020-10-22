import Toastify from "toastify-js";
import "toastify-js/src/toastify.css";

export default class ToastMaker {
  makeToast(toastMsg: string) {
    console.log("Making toast: ", toastMsg);
    Toastify({
      text: toastMsg,
      duration: 1000,
      className: "movens-toast",
      gravity: "top",
      position: "center"
    }).showToast();
  }
}
