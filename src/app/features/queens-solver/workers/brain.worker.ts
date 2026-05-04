/// <reference lib="webworker" />

import type { WorkerRequest, WorkerMessage } from './protocol';
import { solveBrain } from './_solvers/brain';

const ctx = self as unknown as DedicatedWorkerGlobalScope;
let cancelled = false;

ctx.addEventListener('message', async (event: MessageEvent<WorkerRequest>) => {
  const message = event.data;
  if (message.type === 'cancel') {
    cancelled = true;
    return;
  }
  if (message.type !== 'solve') return;
  cancelled = false;
  try {
    const result = await solveBrain(message.n, {
      onTick: point => post({ type: 'brain-tick', point }),
      onProgress: (value, iteration, error) => post({ type: 'progress', value, iteration, energy: error }),
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
