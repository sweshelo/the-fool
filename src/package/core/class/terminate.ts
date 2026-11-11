export class Terminate {
  cause: 'game-set';
  constructor(cause: Terminate['cause']) {
    this.cause = cause;
  }
}
