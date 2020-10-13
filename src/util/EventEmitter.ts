type Handler = (...args: any[]) => void;

export default class EventEmitter<T> {
  events: Map<T, Set<Handler>>;

  constructor() {
    this.events = new Map();
  }

  on(event: T, handler: Handler) {
    this.events.set(event, (this.events.get(event) ?? new Set()).add(handler));
    return this;
  }

  emit(event: T, ...data: any[]) {
    this.events.get(event)?.forEach(handler => handler(...data));
    return this;
  }

  off(event: T, handler: Handler) {
    this.events.get(event)?.delete(handler);
    return this;
  }

  offAll() {
    this.events.clear();
    return this;
  }
}
