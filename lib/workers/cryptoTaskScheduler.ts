export class CryptoTaskScheduler {
  private isCanceled = false;

  /**
   * Executes a heavy computational loop using time-slicing
   * to yield to the main event loop, preventing UI freezes.
   */
  public async executeYielding<T>(
    totalIterations: number,
    batchSize: number,
    taskStep: (startIdx: number, endIdx: number) => T | null,
    onProgress: (progress: number) => void
  ): Promise<T | null> {
    
    return new Promise((resolve) => {
      let currentIdx = 0;

      const processBatch = () => {
        if (this.isCanceled) {
          resolve(null);
          return;
        }

        const endIdx = Math.min(currentIdx + batchSize, totalIterations);
        const result = taskStep(currentIdx, endIdx);

        if (result) {
          resolve(result);
          return;
        }

        currentIdx = endIdx;
        onProgress((currentIdx / totalIterations) * 100);

        if (currentIdx < totalIterations) {
          // Yield to event loop
          setTimeout(processBatch, 0);
        } else {
          resolve(null); // Not found
        }
      };

      processBatch();
    });
  }

  public cancel() {
    this.isCanceled = true;
  }
}
