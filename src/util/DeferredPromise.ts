// DeferredPromise utility class by Rico Kahler
// See https://stackoverflow.com/questions/26150232/resolve-javascript-promise-outside-function-scope

export default class DeferredPromise<T> {
  _promise: Promise<T>;
  resolve!: (value?: T | PromiseLike<T> | undefined) => void;
  reject!: (reason?: any) => void;
  then: any;
  catch: any;
  finally: any;
  [Symbol.toStringTag]: string;

  constructor() {
    this._promise = new Promise<T>((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;
    });

    this.then = this._promise.then.bind(this._promise);
    this.catch = this._promise.catch.bind(this._promise);
    this.finally = this._promise.finally.bind(this._promise);
    this[Symbol.toStringTag] = "Promise";
  }
}
