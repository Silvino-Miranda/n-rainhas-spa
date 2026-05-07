import { Observable } from 'rxjs';
import type { WorkerMessage, WorkerRequest } from '../../features/queens-solver/workers/protocol';

export function runInWorker(workerFactory: () => Worker, payload: WorkerRequest): Observable<WorkerMessage> {
  return new Observable<WorkerMessage>(subscriber => {
    const worker = workerFactory();

    const onMessage = (event: MessageEvent<WorkerMessage>) => {
      const message = event.data;
      if (message.type === 'result') {
        subscriber.next(message);
        subscriber.complete();
      } else if (message.type === 'error') {
        subscriber.error(new Error(message.error));
      } else {
        subscriber.next(message);
      }
    };

    const onError = (event: ErrorEvent) => {
      subscriber.error(event.error ?? new Error(event.message));
    };

    worker.addEventListener('message', onMessage);
    worker.addEventListener('error', onError);

    worker.postMessage(payload);

    return () => {
      try {
        worker.postMessage({ type: 'cancel' } satisfies WorkerRequest);
      } catch {
        /* worker may already be closed */
      }
      worker.removeEventListener('message', onMessage);
      worker.removeEventListener('error', onError);
      worker.terminate();
    };
  });
}
