import { isValidatedEvent } from './eventRegistry.js';

export function assertAnalyticsSink(sink) {
  if (!sink || typeof sink.publish !== 'function') {
    throw new Error('AnalyticsSink must implement publish(event)');
  }
  return sink;
}

export function assertTelemetrySink(sink) {
  if (!sink || typeof sink.emit !== 'function') {
    throw new Error('TelemetrySink must implement emit(signal)');
  }
  return sink;
}

export function assertFeatureFlagPort(port) {
  if (!port || typeof port.evaluate !== 'function') {
    throw new Error('FeatureFlagPort must implement evaluate(flag, context)');
  }
  return port;
}

export function createGuardedAnalyticsSink(sink) {
  const delegate = assertAnalyticsSink(sink);

  return Object.freeze({
    async publish(event) {
      if (!isValidatedEvent(event)) {
        throw new Error('Analytics event must be validated by the event registry');
      }
      return delegate.publish(event);
    }
  });
}
