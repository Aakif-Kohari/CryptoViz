import { BaseCipher } from './baseCipher';

export type PipelineMode = 'FAST' | 'INSTRUMENTED';

export class InstrumentedPipeline {
  private cipher: BaseCipher;
  private mode: PipelineMode;

  constructor(cipher: BaseCipher, mode: PipelineMode = 'FAST') {
    this.cipher = cipher;
    this.mode = mode;
  }

  async execute(plaintext: Uint8Array): Promise<{ result: Uint8Array; traces?: any[] }> {
    if (this.mode === 'FAST') {
      const result = await this.cipher.encrypt(plaintext);
      return { result };
    }

    // Instrumented mode: capture step-by-step intermediate state metrics
    // In a full implementation, the cipher would emit internal state steps
    const traces = [
      { step: 'INIT', data: plaintext },
      { step: 'KEY_ADDITION', data: new Uint8Array(plaintext) }, // Mocked
      { step: 'SUBSTITUTION', data: new Uint8Array(plaintext) },
    ];
    
    const result = await this.cipher.encrypt(plaintext);
    traces.push({ step: 'FINAL', data: result });
    
    return { result, traces };
  }
}
