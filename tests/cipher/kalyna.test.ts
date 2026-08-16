import { KalynaEngine } from '../../lib/cipher/kalyna/kalynaEngine';
import { InstrumentedPipeline } from '../../lib/cipher/instrumentedPipeline';

describe('Kalyna Cipher & Pipeline', () => {
  it('should run encryption in fast-path mode without traces', async () => {
    const kalyna = new KalynaEngine();
    kalyna.setKey(new Uint8Array([0x01, 0x02, 0x03, 0x04]));
    
    const pipeline = new InstrumentedPipeline(kalyna, 'FAST');
    const { result, traces } = await pipeline.execute(new Uint8Array([0x0A, 0x0B, 0x0C]));
    
    expect(result).toBeDefined();
    expect(traces).toBeUndefined();
  });

  it('should run encryption in instrumented mode and collect traces', async () => {
    const kalyna = new KalynaEngine();
    kalyna.setKey(new Uint8Array([0x01, 0x02, 0x03, 0x04]));
    
    const pipeline = new InstrumentedPipeline(kalyna, 'INSTRUMENTED');
    const { result, traces } = await pipeline.execute(new Uint8Array([0x0A, 0x0B, 0x0C]));
    
    expect(result).toBeDefined();
    expect(traces).toBeDefined();
    expect(traces?.length).toBeGreaterThan(0);
  });
});
