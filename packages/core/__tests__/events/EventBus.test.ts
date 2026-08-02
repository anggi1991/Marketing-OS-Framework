import { EventBus } from '../../src/events/EventBus';
import { InMemoryAdapter } from '../../src/events/adapters/InMemoryAdapter';
import { RuntimeEvent } from '../../src/events/EventBus';

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

    const event: RuntimeEvent = { name: 'test.event', payload: { foo: 'bar' } };
    await bus.publish(event);

    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'test.event',
        payload: { foo: 'bar' }
      })
    );
  });

  it('should assign id and timestamp if missing', async () => {
    const handler = jest.fn();
    bus.subscribe('test.event', handler);

    await bus.publish({ name: 'test.event', payload: {} });

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

    await bus.publish({ name: 'test.random', payload: {} });
    await bus.publish({ name: 'test.another', payload: {} });

    expect(handler).toHaveBeenCalledTimes(2);
  });
});
