/// <reference lib="webworker" />

import type { WorkerRequest, WorkerMessage } from './protocol';
import { solveBacktracking } from './_solvers/backtracking';

const ctx = self as unknown as DedicatedWorkerGlobalScope;

ctx.addEventListener('message', (event: MessageEvent<WorkerRequest>) => {
  const message = event.data;
  if (message.type !== 'solve') return;
  try {
    const result = solveBacktracking(message.n);
    post({ type: 'progress', value: 100 });
    post({ type: 'result', data: result });
  } catch (err) {
    post({ type: 'error', error: err instanceof Error ? err.message : String(err) });
  }
});

function post(message: WorkerMessage): void {
  ctx.postMessage(message);
}
