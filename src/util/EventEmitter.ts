type Handler = (...args: any[]) => void

export default class EventEmitter<T> {
  events: Map<T, Set<Handler>>;

  constructor() {
    this.events = new Map();
  }

  on(event: T, handler: Handler) {
    this.events.set(event, (this.events.get(event) ?? new Set()).add(handler));
  }

  emit(event: T) {
    this.events.get(event)?.forEach(handler => handler())
  }

  off(event: T, handler: Handler){
      this.events.get(event)?.delete(handler);
  }
}
