import { createMessage } from '@/submodule/suit/types';

export class MessageHelper {
  static sound(id: string) {
    return createMessage({
      action: {
        type: 'effect',
        handler: 'client',
      },
      payload: {
        type: 'SoundEffect',
        soundId: id,
      },
    });
  }

  static freeze() {
    return createMessage({
      action: {
        type: 'operation',
        handler: 'client',
      },
      payload: {
        type: 'Operation',
        action: 'freeze',
      },
    });
  }

  static defrost() {
    return createMessage({
      action: {
        type: 'operation',
        handler: 'client',
      },
      payload: {
        type: 'Operation',
        action: 'defrost',
      },
    });
  }
}
