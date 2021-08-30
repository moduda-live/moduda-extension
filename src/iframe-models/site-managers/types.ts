export enum VideoEvent {
  PLAY,
  PAUSE,
  SEEKED,
  CHANGE_SPEED,
  PLAY_BLOCKED,
  PAUSE_BLOCKED,
  SEEKED_BLOCKED,
  CHANGE_SPEED_BLOCKED,
  AUTO_SYNC
}

// export interface NetflixCadiumPlayer {
//   addEventListener(
//     type: string,
//     listener: EventListenerOrEventListenerObject,
//     options?: boolean | AddEventListenerOptions
//   ): void;
//   seek: Function;
//   play: Function;
//   pause: Function;
//   setPlaybackRate: Function;
// }
