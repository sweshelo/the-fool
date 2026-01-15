import { createMessage } from '@/submodule/suit/types';

export class MessageHelper {
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
