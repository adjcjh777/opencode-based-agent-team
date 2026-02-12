import { describe, expect, it } from 'vitest';

import { MessageBus } from '../../../src/teams/message-bus.js';

describe('MessageBus', () => {
  it('delivers direct message to target member queue', () => {
    const bus = new MessageBus();

    bus.registerMember('leader');
    bus.registerMember('worker-1');
    bus.registerMember('worker-2');

    bus.send({
      id: 'm1',
      from: 'leader',
      to: 'worker-1',
      content: 'focus auth module',
      timestamp: 1,
      type: 'message'
    });

    expect(bus.readInbox('worker-1').map((item) => item.id)).toEqual(['m1']);
    expect(bus.readInbox('worker-2')).toEqual([]);
  });

  it('broadcasts message to all members except sender', () => {
    const bus = new MessageBus();

    bus.registerMember('leader');
    bus.registerMember('worker-1');
    bus.registerMember('worker-2');

    bus.send({
      id: 'b1',
      from: 'leader',
      to: 'broadcast',
      content: 'sync update',
      timestamp: 2,
      type: 'notification'
    });

    expect(bus.readInbox('worker-1').map((item) => item.id)).toEqual(['b1']);
    expect(bus.readInbox('worker-2').map((item) => item.id)).toEqual(['b1']);
    expect(bus.readInbox('leader')).toEqual([]);
  });
});
