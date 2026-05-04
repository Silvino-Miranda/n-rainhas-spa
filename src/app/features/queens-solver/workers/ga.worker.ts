/// <reference lib="webworker" />

import type { WorkerRequest, WorkerMessage } from './protocol';
import { solveGA } from './_solvers/ga';

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
    const result = solveGA(message.n, {
      seed: message.seed,
      onTick: point => post({ type: 'evolution-tick', point }),
      onProgress: (value, generation, bestFitness) =>
        post({ type: 'progress', value, generation, bestFitness }),
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
