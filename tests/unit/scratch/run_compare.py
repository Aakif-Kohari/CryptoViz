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
        block[i] = ((buffr[buf_cnt + 0] & 0xff) << 56) ^ \
                   ((buffr[buf_cnt + 1] & 0xff) << 48) ^ \
                   ((buffr[buf_cnt + 2] & 0xff) << 40) ^ \
                   ((buffr[buf_cnt + 3] & 0xff) << 32) ^ \
                   ((buffr[buf_cnt + 4] & 0xff) << 24) ^ \
                   ((buffr[buf_cnt + 5] & 0xff) << 16) ^ \
                   ((buffr[buf_cnt + 6] & 0xff) << 8) ^ \
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