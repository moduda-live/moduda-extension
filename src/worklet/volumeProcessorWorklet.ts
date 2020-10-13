class VolumeProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
  }

  process(
    inputlist: Float32Array[][],
    outputlist: Float32Array[][],
    params: Record<string, Float32Array>
  ) {
    const input = inputlist[0];

    if (input.length > 0) {
      const channel = input[0];
      const rms = this.rootMeanSquare(channel);
      this.port.postMessage({ volume: rms });
    }

    return true;
  }

  rootMeanSquare(channel: Float32Array) {
    const squareSum = channel.reduce(
      (sum, currentVal) => sum + currentVal ** 2,
      0
    );
    return Math.sqrt(squareSum / channel.length);
  }
}

registerProcessor("volumeProcessor", VolumeProcessor);
