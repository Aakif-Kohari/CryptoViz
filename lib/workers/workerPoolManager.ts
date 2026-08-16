import { WorkerTask, WorkerResponse } from './types';

export class WorkerPoolManager {
  private pool: Worker[] = [];
  private taskQueue: WorkerTask[] = [];
  private activeTasks: Map<string, Worker> = new Map();
  private maxConcurrency: number;

  constructor(maxConcurrency?: number) {
    this.maxConcurrency = maxConcurrency || (navigator.hardwareConcurrency || 4);
  }

  public initPool(workerScriptPath: string) {
    for (let i = 0; i < this.maxConcurrency; i++) {
      const worker = new Worker(workerScriptPath);
      this.pool.push(worker);
    }
  }

  public async executeTask(task: WorkerTask, onProgress?: (progress: number) => void): Promise<any> {
    return new Promise((resolve, reject) => {
      const availableWorker = this.pool.find(w => !Array.from(this.activeTasks.values()).includes(w));
      
      if (!availableWorker) {
        this.taskQueue.push(task);
        // Basic queuing, actual implementation requires advanced scheduling
        reject(new Error('Pool exhausted, task queued.'));
        return;
      }

      this.activeTasks.set(task.id, availableWorker);

      availableWorker.onmessage = (e: MessageEvent<WorkerResponse>) => {
        const response = e.data;
        if (response.taskId !== task.id) return;

        if (response.status === 'PROGRESS' && onProgress) {
          onProgress(response.progress || 0);
        } else if (response.status === 'SUCCESS') {
          this.activeTasks.delete(task.id);
          resolve(response.result);
        } else if (response.status === 'ERROR') {
          this.activeTasks.delete(task.id);
          reject(new Error(response.error));
        }
      };

      availableWorker.postMessage(task);
    });
  }

  public terminate() {
    this.pool.forEach(worker => worker.terminate());
    this.pool = [];
    this.activeTasks.clear();
  }
}
