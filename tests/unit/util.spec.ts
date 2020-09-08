import EventEmitter from "@/util/EventEmitter";

describe("Utilities", () => {
  describe("EventEmitter", () => {
    it("should invoke callback when event is emitted", () => {
      const emitter = new EventEmitter();
      const onTest = jest.fn();
      emitter.on("test", onTest);
      emitter.emit("test");
      expect(onTest).toHaveBeenCalledTimes(1);
    });

    it("should call all callbacks upon emit if more than one callback is registered for the given event", () => {
      const emitter = new EventEmitter();
      const firstCallback = jest.fn();
      const secondCallback = jest.fn();
      emitter.on("test", firstCallback);
      emitter.on("test", secondCallback);
      emitter.emit("test");
      expect(firstCallback).toHaveBeenCalledTimes(1);
      expect(secondCallback).toHaveBeenCalledTimes(1);
    });

    it("should not invoke wrong callback on emit", () => {
      const emitter = new EventEmitter();
      const onTest = jest.fn();
      emitter.on("test", onTest);
      emitter.emit("test-different");
      expect(onTest).not.toHaveBeenCalled();
    });

    it("should invoke the callback as many times as the event is emitted", () => {
      const emitter = new EventEmitter();
      const onTest = jest.fn();
      emitter.on("test", onTest);
      emitter.emit("test");
      emitter.emit("test");
      expect(onTest).toHaveBeenCalledTimes(2);
    });

    it("should not invoke registered callback after off()", () => {
      const emitter = new EventEmitter();
      const onTest = jest.fn();
      emitter.on("test", onTest);
      emitter.off("test", onTest);
      emitter.emit("test");
      expect(onTest).not.toHaveBeenCalled();
    });

    it("should not do anything when unregistering non-existent events", () => {
      const emitter = new EventEmitter();
      const onTest = jest.fn();
      emitter.on("test", onTest);
      emitter.off("test-different", onTest);
      emitter.emit("test");
      expect(onTest).toHaveBeenCalled();
    });
  });
});
