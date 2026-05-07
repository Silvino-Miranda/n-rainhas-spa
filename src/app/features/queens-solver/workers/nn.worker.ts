/// <reference lib="webworker" />

import type { WorkerRequest, WorkerMessage } from './protocol';
import { solveNN } from './_solvers/nn';

const ctx = self as unknown as DedicatedWorkerGlobalScope;
let cancelled = false;

ctx.addEventListener('message', (event: MessageEvent<WorkerRequest>) => {
  const message = event.data;
  if (message.type === 'cancel') {
    cancelled = true;
    return;
  }
  if (message.type !== 'solve') return;
  cancelled = false;
  try {
    const result = solveNN(message.n, {
      onTick: point => post({ type: 'training-tick', point }),
      onProgress: (value, iteration, energy) => post({ type: 'progress', value, iteration, energy }),
      shouldCancel: () => cancelled
    });
    post({ type: 'progress', value: 100 });
    post({ type: 'result', data: result });
  } catch (err) {
    post({ type: 'error', error: err instanceof Error ? err.message : String(err) });
  }
});

function post(message: WorkerMessage): void {
  ctx.postMessage(message);
}
