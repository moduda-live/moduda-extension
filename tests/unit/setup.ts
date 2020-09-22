const mockMediaStream = {
  getAudioTracks: jest.fn(),
  getVideoTracks: jest.fn(),
  getTracks: jest.fn(),
  getTrackById: jest.fn(),
  addTrack: jest.fn(),
  removeTrack: jest.fn(),
  clone: jest.fn()
};

const mockMediaDevices = {
  getUserMedia: jest.fn().mockImplementation(() => {
    return Promise.resolve(mockMediaStream);
  })
};

Object.defineProperty(global.navigator, "mediaDevices", {
  configurable: true,
  enumerable: true,
  value: mockMediaDevices,
  writable: true
});
