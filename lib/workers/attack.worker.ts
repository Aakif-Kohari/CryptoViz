import { PaddingOracle, recoverBlock, type AttackStep, BLOCK_SIZE } from '../attacks/paddingOracle';
import { meetInTheMiddleAttack, type MitmStep } from '../attacks/meetInTheMiddle';

const workerScope = self as unknown as Worker;

function hexToBytes(hex: string): Uint8Array {
  const clean = hex.replace(/\s+/g, '');
  const out = new Uint8Array(clean.length / 2);
  for (let i = 0; i < out.length; i++) {
    out[i] = parseInt(clean.slice(i * 2, i * 2 + 2), 16);
  }
  return out;
}

workerScope.addEventListener('message', (event: MessageEvent) => {
  const { type, payload } = event.data;

  if (type === 'recoverBlock') {
    const { key, mode, prevBlockBuffer, targetBlockBuffer, blockOffset, blockIndex } = payload;
    
    try {
      const prevBlock = new Uint8Array(prevBlockBuffer);
      const targetBlock = blockOffset !== undefined
        ? new Uint8Array(targetBlockBuffer, blockOffset, BLOCK_SIZE)
        : new Uint8Array(targetBlockBuffer);
      
      const oracle = new PaddingOracle(key, mode);
      
      const plaintext = recoverBlock(
        oracle,
        prevBlock,
        targetBlock,
        (step: AttackStep) => {
          // Send progress updates back to the main thread
          workerScope.postMessage({ type: 'progress', payload: step });
        },
        blockIndex
      );

      workerScope.postMessage({
        type: 'done',
        payload: {
          plaintext: plaintext.buffer,
          queryCount: oracle.queryCount
        }
      });
    } catch (error: unknown) {
      workerScope.postMessage({
        type: 'error',
        payload: { message: error instanceof Error ? error.message : 'Unknown error' }
      });
    }
  } else if (type === 'runMitmAttack') {
    const { plaintextHex, ciphertextHex, keySpaceBits } = payload;

    try {
      const plaintext = hexToBytes(plaintextHex);
      const ciphertext = hexToBytes(ciphertextHex);

      const result = meetInTheMiddleAttack(
        plaintext,
        ciphertext,
        keySpaceBits,
        (step: MitmStep) => {
          workerScope.postMessage({ type: 'progress', payload: step });
        }
      );

      workerScope.postMessage({
        type: 'done',
        payload: result
      });
    } catch (error: unknown) {
      workerScope.postMessage({
        type: 'error',
        payload: { message: error instanceof Error ? error.message : 'Unknown error' }
      });
    }
  }
});
