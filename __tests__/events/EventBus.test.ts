import { EventBus } from '../../src/events/EventBus';
import { InMemoryAdapter } from '../../src/events/adapters/InMemoryAdapter';
import { LuminaEvent } from '../../src/events/EventBus';

describe('EventBus with InMemoryAdapter', () => {
  let bus: EventBus;
  let adapter: InMemoryAdapter;

  beforeEach(async () => {
    adapter = new InMemoryAdapter();
    bus = new EventBus(adapter);
    await bus.connect();
  });

  afterEach(async () => {
    await bus.disconnect();
  });

  it('should route events to subscribers', async () => {
    const handler = jest.fn();
    bus.subscribe('test.event', handler);

    const event: LuminaEvent = { type: 'test.event', payload: { foo: 'bar' } };
    await bus.publish(event);

    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'test.event',
        payload: { foo: 'bar' }
      })
    );
  });

  it('should assign id and timestamp if missing', async () => {
    const handler = jest.fn();
    bus.subscribe('test.event', handler);

    await bus.publish({ type: 'test.event', payload: {} });

    expect(handler).toHaveBeenCalledWith(
      expect.objectContaining({
        id: expect.any(String),
        timestamp: expect.any(Number)
      })
    );
  });

  it('should support wildcard subscribers', async () => {
    const handler = jest.fn();
    bus.subscribe('*', handler);

    await bus.publish({ type: 'test.random', payload: {} });
    await bus.publish({ type: 'test.another', payload: {} });

    expect(handler).toHaveBeenCalledTimes(2);
  });
});
