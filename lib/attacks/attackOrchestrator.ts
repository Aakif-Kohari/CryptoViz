import { WorkerPoolManager } from '../workers/workerPoolManager';
import { WorkerTask } from '../workers/types';

export class AttackOrchestrator {
  private pool: WorkerPoolManager;

  constructor(poolManager: WorkerPoolManager) {
    this.pool = poolManager;
  }

  /**
   * Partitions a key space into N non-overlapping ranges 
   * and distributes them across the worker pool.
   */
  async distributeKeySpaceSearch(
    totalKeyspace: number,
    numPartitions: number,
    onProgress: (overallProgress: number) => void
  ): Promise<any> {
    
    const partitionSize = Math.ceil(totalKeyspace / numPartitions);
    const tasks: WorkerTask[] = [];
    const progresses: number[] = new Array(numPartitions).fill(0);

    for (let i = 0; i < numPartitions; i++) {
      tasks.push({
        id: `task_${i}`,
        type: 'BRUTE_FORCE',
        payload: {
          startIdx: i * partitionSize,
          endIdx: Math.min((i + 1) * partitionSize, totalKeyspace)
        }
      });
    }

    const promises = tasks.map((task, idx) => 
      this.pool.executeTask(task, (p) => {
        progresses[idx] = p;
        const overall = progresses.reduce((a,b) => a + b, 0) / numPartitions;
        onProgress(overall);
      }).catch(e => null) // Ignore individual partition failures in demo
    );

    const results = await Promise.all(promises);
    return results.find(res => res !== null) || null;
  }
}
