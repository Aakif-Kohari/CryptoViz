import { describe, it } from 'vitest'
import { execSync } from 'child_process'
import fs from 'fs'
import path from 'path'
import { whirlpoolHash } from '../../../lib/cipher/hash/whirlpool'

const SBOX = new Uint8Array([
  0x18, 0x23, 0xc6, 0xe8, 0x87, 0xb8, 0x01, 0x4f, 0x36, 0xa6, 0xd2, 0xf5, 0x79, 0x6f, 0x91, 0x52,
  0x60, 0xbc, 0x9b, 0x8e, 0xa3, 0x0c, 0x7b, 0x35, 0x1d, 0xe0, 0xd7, 0xc2, 0x2e, 0x4b, 0xfe, 0x57,
  0x15, 0x77, 0x37, 0xe5, 0x9f, 0xf0, 0x4a, 0xda, 0x58, 0xc9, 0x29, 0x0a, 0xb1, 0xa0, 0x6b, 0x85,
  0xbd, 0x5d, 0x10, 0xf4, 0xcb, 0x3e, 0x05, 0x67, 0xe4, 0x27, 0x41, 0x8b, 0xa7, 0x7d, 0x95, 0xd8,
  0xfb, 0xee, 0x7c, 0x66, 0xdd, 0x17, 0x47, 0x9e, 0xca, 0x2d, 0xbf, 0x07, 0xad, 0x5a, 0x83, 0x33,
  0x63, 0x02, 0xaa, 0x71, 0xc8, 0x19, 0x49, 0xd9, 0xf2, 0xe3, 0x5b, 0x88, 0x9a, 0x26, 0x32, 0xb0,
  0xe9, 0x0f, 0xd5, 0x80, 0xbe, 0xcd, 0x34, 0x48, 0xff, 0x7a, 0x90, 0x5f, 0x20, 0x68, 0x1a, 0xae,
  0xb4, 0x54, 0x93, 0x22, 0x64, 0xf1, 0x73, 0x12, 0x40, 0x08, 0xc3, 0xec, 0xdb, 0xa1, 0x8d, 0x3d,
  0x97, 0x00, 0xcf, 0x2b, 0x76, 0x82, 0xd6, 0x1b, 0xb5, 0xaf, 0x6a, 0x50, 0x45, 0xf3, 0x30, 0xef,
  0x3f, 0x55, 0xa2, 0xea, 0x65, 0xba, 0x2f, 0xc0, 0xde, 0x1c, 0xfd, 0x4d, 0x92, 0x75, 0x06, 0x8a,
  0xb2, 0xe6, 0x0e, 0x1f, 0x62, 0xd4, 0xa8, 0x96, 0xf9, 0xc5, 0x25, 0x59, 0x84, 0x72, 0x39, 0x4c,
  0x5e, 0x78, 0x38, 0x8c, 0xd1, 0xa5, 0xe2, 0x61, 0xb3, 0x21, 0x9c, 0x1e, 0x43, 0xc7, 0xfc, 0x04,
  0x51, 0x99, 0x6d, 0x0d, 0xfa, 0xdf, 0x7e, 0x24, 0x3b, 0xab, 0xce, 0x11, 0x8f, 0x4e, 0xb7, 0xeb,
  0x3c, 0x81, 0x94, 0xf7, 0xb9, 0x13, 0x2c, 0xd3, 0xe7, 0x6e, 0xc4, 0x03, 0x56, 0x44, 0x7f, 0xa9,
  0x2a, 0xbb, 0xc1, 0x53, 0xdc, 0x0b, 0x9d, 0x6c, 0x31, 0x74, 0xf6, 0x46, 0xac, 0x89, 0x14, 0xe1,
  0x16, 0x3a, 0x69, 0x09, 0x70, 0xb6, 0xd0, 0xed, 0xcc, 0x42, 0x98, 0x28, 0x5c, 0xf8, 0x86, 0x07,
])

function rotateRight64(hiVal: number, loVal: number, shift: number): { hi: number; lo: number } {
  const val = (BigInt(hiVal >>> 0) << 32n) | BigInt(loVal >>> 0)
  const n = BigInt(shift)
  const rotated = ((val >> n) | (val << (64n - n))) & 0xffffffffffffffffn
  return {
    hi: Number(rotated >> 32n) | 0,
    lo: Number(rotated & 0xffffffffn) | 0,
  }
}

describe('Compare States', () => {
  it('compares TS and Python on empty string', () => {
    const pythonScript = `
import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), '..', '..', 'scratch'))
import whirlpool_ref

ctx = whirlpool_ref.WhirlpoolStruct()

# Modify whirlpool_ref to print intermediate state after Round 1
orig_process = whirlpool_ref.processBuffer
def new_process(ctx):
    # Call original but log values after Round 1
    # We copy the processBuffer logic here to hook it
    i, r = 0, 0
    K = [0] * 8
    block = [0] * 8
    state = [0] * 8
    L = [0] * 8
    buffr = ctx.buffer

    buf_cnt = 0
    for i in range(8):
        block[i] = ((buffr[buf_cnt + 0] & 0xff) << 56) ^ \\
                   ((buffr[buf_cnt + 1] & 0xff) << 48) ^ \\
                   ((buffr[buf_cnt + 2] & 0xff) << 40) ^ \\
                   ((buffr[buf_cnt + 3] & 0xff) << 32) ^ \\
                   ((buffr[buf_cnt + 4] & 0xff) << 24) ^ \\
                   ((buffr[buf_cnt + 5] & 0xff) << 16) ^ \\
                   ((buffr[buf_cnt + 6] & 0xff) << 8) ^ \\
                   ((buffr[buf_cnt + 7] & 0xff) << 0)
        buf_cnt += 8
    for i in range(8):
        K[i] = ctx.hash[i]
        state[i] = block[i] ^ K[i]

    print("PYTHON START K:    ", [f"{x:016x}" for x in K])
    print("PYTHON START STATE:", [f"{x:016x}" for x in state])

    # Round 1
    r = 1
    L[0] = whirlpool_ref.CDo(K, 0, 7, 6, 5, 4, 3, 2, 1) ^ whirlpool_ref.rc[r]
    L[1] = whirlpool_ref.CDo(K, 1, 0, 7, 6, 5, 4, 3, 2)
    L[2] = whirlpool_ref.CDo(K, 2, 1, 0, 7, 6, 5, 4, 3)
    L[3] = whirlpool_ref.CDo(K, 3, 2, 1, 0, 7, 6, 5, 4)
    L[4] = whirlpool_ref.CDo(K, 4, 3, 2, 1, 0, 7, 6, 5)
    L[5] = whirlpool_ref.CDo(K, 5, 4, 3, 2, 1, 0, 7, 6)
    L[6] = whirlpool_ref.CDo(K, 6, 5, 4, 3, 2, 1, 0, 7)
    L[7] = whirlpool_ref.CDo(K, 7, 6, 5, 4, 3, 2, 1, 0)
    for i in range(8):
        K[i] = L[i]
    L[0] = whirlpool_ref.CDo(state, 0, 7, 6, 5, 4, 3, 2, 1) ^ K[0]
    L[1] = whirlpool_ref.CDo(state, 1, 0, 7, 6, 5, 4, 3, 2) ^ K[1]
    L[2] = whirlpool_ref.CDo(state, 2, 1, 0, 7, 6, 5, 4, 3) ^ K[2]
    L[3] = whirlpool_ref.CDo(state, 3, 2, 1, 0, 7, 6, 5, 4) ^ K[3]
    L[4] = whirlpool_ref.CDo(state, 4, 3, 2, 1, 0, 7, 6, 5) ^ K[4]
    L[5] = whirlpool_ref.CDo(state, 5, 4, 3, 2, 1, 0, 7, 6) ^ K[5]
    L[6] = whirlpool_ref.CDo(state, 6, 5, 4, 3, 2, 1, 0, 7) ^ K[6]
    L[7] = whirlpool_ref.CDo(state, 7, 6, 5, 4, 3, 2, 1, 0) ^ K[7]
    for i in range(8):
        state[i] = L[i]

    print("PYTHON R1 K:       ", [f"{x:016x}" for x in K])
    print("PYTHON R1 STATE:   ", [f"{x:016x}" for x in state])
    
    # Continue normally for rest of rounds
    for r in range(2, 11):
        L[0] = whirlpool_ref.CDo(K, 0, 7, 6, 5, 4, 3, 2, 1) ^ whirlpool_ref.rc[r]
        L[1] = whirlpool_ref.CDo(K, 1, 0, 7, 6, 5, 4, 3, 2)
        L[2] = whirlpool_ref.CDo(K, 2, 1, 0, 7, 6, 5, 4, 3)
        L[3] = whirlpool_ref.CDo(K, 3, 2, 1, 0, 7, 6, 5, 4)
        L[4] = whirlpool_ref.CDo(K, 4, 3, 2, 1, 0, 7, 6, 5)
        L[5] = whirlpool_ref.CDo(K, 5, 4, 3, 2, 1, 0, 7, 6)
        L[6] = whirlpool_ref.CDo(K, 6, 5, 4, 3, 2, 1, 0, 7)
        L[7] = whirlpool_ref.CDo(K, 7, 6, 5, 4, 3, 2, 1, 0)
        for i in range(8):
            K[i] = L[i]
        L[0] = whirlpool_ref.CDo(state, 0, 7, 6, 5, 4, 3, 2, 1) ^ K[0]
        L[1] = whirlpool_ref.CDo(state, 1, 0, 7, 6, 5, 4, 3, 2) ^ K[1]
        L[2] = whirlpool_ref.CDo(state, 2, 1, 0, 7, 6, 5, 4, 3) ^ K[2]
        L[3] = whirlpool_ref.CDo(state, 3, 2, 1, 0, 7, 6, 5, 4) ^ K[3]
        L[4] = whirlpool_ref.CDo(state, 4, 3, 2, 1, 0, 7, 6, 5) ^ K[4]
        L[5] = whirlpool_ref.CDo(state, 5, 4, 3, 2, 1, 0, 7, 6) ^ K[5]
        L[6] = whirlpool_ref.CDo(state, 6, 5, 4, 3, 2, 1, 0, 7) ^ K[6]
        L[7] = whirlpool_ref.CDo(state, 7, 6, 5, 4, 3, 2, 1, 0) ^ K[7]
        for i in range(8):
            state[i] = L[i]
        print(f"PYTHON Round {r} K:     ", [f"{x:016x}" for x in K])
        print(f"PYTHON Round {r} STATE: ", [f"{x:016x}" for x in state])

    for i in range(8):
        ctx.hash[i] ^= state[i] ^ block[i]

whirlpool_ref.processBuffer = new_process

w = whirlpool_ref.whirlpool(b"")
print("PYTHON_HASH:", w.hexdigest())
`
    const pyPath = path.join(__dirname, '../scratch/run_compare.py')
    fs.mkdirSync(path.dirname(pyPath), { recursive: true })
    fs.writeFileSync(pyPath, pythonScript.trim())

    try {
      const out = execSync(`python "${pyPath}"`, { encoding: 'utf8' })
      console.log(out.trim())
    } catch (e: any) {
      throw new Error(`Python script failed: ${e.message}\nStdout: ${e.stdout}\nStderr: ${e.stderr}`)
    }

    // Now, run TS hash and print intermediate values in console log
    const K_ts = new Int32Array(16)
    const stateWords_ts = new Int32Array(16)
    const block = new Uint8Array(64)
    block[0] = 0x80
    
    for (let i = 0; i < 16; i++) {
      K_ts[i] = 0
      stateWords_ts[i] = (block[i * 4] << 24) | (block[i * 4 + 1] << 16) | (block[i * 4 + 2] << 8) | block[i * 4 + 3]
    }

    const toHex64 = (arr: Int32Array) => {
      const res: string[] = []
      for (let i = 0; i < 8; i++) {
        const hi = (arr[i * 2] >>> 0).toString(16).padStart(8, '0')
        const lo = (arr[i * 2 + 1] >>> 0).toString(16).padStart(8, '0')
        res.push(hi + lo)
      }
      return res
    }
    // Rebuild the exact tables locally to ensure no discrepancy
    const u_local = Array.from({ length: 8 }, () => Array.from({ length: 256 }, () => new Int32Array(2)))
    const w_local = Array.from({ length: 11 }, () => new Int32Array(2))

    for (let p = 0; p < 256; p++) {
      const f = SBOX[p]
      let e = f << 1
      if (e >= 256) e ^= 285
      let b = e << 1
      if (b >= 256) b ^= 285
      const a = b ^ f
      let G = b << 1
      if (G >= 256) G ^= 285
      const F = G ^ f

      u_local[0][p][0] = (f << 24) | (f << 16) | (b << 8) | f
      u_local[0][p][1] = (G << 24) | (a << 16) | (e << 8) | F

      for (let q = 1; q < 8; q++) {
        const rot = rotateRight64(u_local[0][p][0], u_local[0][p][1], q << 3)
        u_local[q][p][0] = rot.hi
        u_local[q][p][1] = rot.lo
      }
    }

    w_local[0][0] = 0
    w_local[0][1] = 0
    const python_rc = [
      0n,
      0x1823c6e887b8014fn,
      0x36a6d2f5796f9152n,
      0x60bc9b8ea30c7b35n,
      0x1de0d7c22e4bfe57n,
      0x157737e59ff04adan,
      0x58c9290ab1a06b85n,
      0xbd5d10f4cb3e0567n,
      0xe427418ba77d95d8n,
      0xfbee7c66dd17479en,
      0xca2dbf07ad5a8333n
    ]
    for (let v = 1; v <= 10; v++) {
      const A = 8 * (v - 1)
      w_local[v][0] = (u_local[0][A][0] & 0xff000000) ^ (u_local[1][A + 1][0] & 0x00ff0000) ^ (u_local[2][A + 2][0] & 0x0000ff00) ^ (u_local[3][A + 3][0] & 0x000000ff)
      w_local[v][1] = (u_local[4][A + 4][1] & 0xff000000) ^ (u_local[5][A + 5][1] & 0x00ff0000) ^ (u_local[6][A + 6][1] & 0x0000ff00) ^ (u_local[7][A + 7][1] & 0x000000ff)
      console.log(`v=${v}: TS=0x${(w_local[v][0] >>> 0).toString(16).padStart(8, '0')}${(w_local[v][1] >>> 0).toString(16).padStart(8, '0')} Python=0x${python_rc[v].toString(16).padStart(16, '0')}`)
    }

    const L_ts = new Int32Array(16)

    for (let r = 1; r <= 10; r++) {
      // Key schedule Round r
      for (let i = 0; i < 8; i++) {
        L_ts[i * 2] = 0
        L_ts[i * 2 + 1] = 0
        for (let t = 0; t < 8; t++) {
          const s = 56 - t * 8
          const j = s < 32 ? 1 : 0
          const byte = (K_ts[((i - t) & 7) * 2 + j] >>> (s % 32)) & 255
          L_ts[i * 2] ^= u_local[t][byte][0]
          L_ts[i * 2 + 1] ^= u_local[t][byte][1]
        }
      }
      for (let i = 0; i < 16; i++) {
        K_ts[i] = L_ts[i]
      }
      K_ts[0] ^= w_local[r][0]
      K_ts[1] ^= w_local[r][1]

      // State transformation Round r
      for (let i = 0; i < 8; i++) {
        L_ts[i * 2] = K_ts[i * 2]
        L_ts[i * 2 + 1] = K_ts[i * 2 + 1]
        for (let t = 0; t < 8; t++) {
          const s = 56 - t * 8
          const j = s < 32 ? 1 : 0
          const byte = (stateWords_ts[((i - t) & 7) * 2 + j] >>> (s % 32)) & 255
          L_ts[i * 2] ^= u_local[t][byte][0]
          L_ts[i * 2 + 1] ^= u_local[t][byte][1]
        }
      }
      for (let i = 0; i < 16; i++) {
        stateWords_ts[i] = L_ts[i]
      }

      console.log(`TS Round ${r} K:       `, toHex64(K_ts))
      console.log(`TS Round ${r} STATE:   `, toHex64(stateWords_ts))
    }
  })
})
