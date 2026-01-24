import { createMessage } from '@/submodule/suit/types';

export class MessageHelper {
  static freeze(remainingTime?: number) {
    return createMessage({
      action: {
        type: 'operation',
        handler: 'client',
      },
      payload: {
        type: 'Operation',
        action: 'freeze',
        remainingTime,
      },
    });
  }

  static defrost(remainingTime?: number) {
    return createMessage({
      action: {
        type: 'operation',
        handler: 'client',
      },
      payload: {
        type: 'Operation',
        action: 'defrost',
        remainingTime,
      },
    });
  }
}
