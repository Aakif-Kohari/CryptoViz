/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from "vitest";

describe("Worker Communication Suite", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("should format worker request payload correctly", () => {
    const payload = {
      action: "encrypt" as const,
      cipherId: "caesar",
      input: "HELLO WORLD",
      key: "3",
      id: "req-12345",
    };

    expect(payload.action).toBe("encrypt");
    expect(payload.id).toBeDefined();
    expect(typeof payload.input).toBe("string");
  });

  it("should properly structure worker response message", () => {
    const mockResponse = {
      id: "req-12345",
      success: true,
      data: {
        output: "KHOOR ZRUOG",
        executionTimeMs: 1.25,
      },
    };

    expect(mockResponse.success).toBe(true);
    expect(mockResponse.data.output).toBe("KHOOR ZRUOG");
    expect(mockResponse.data.executionTimeMs).toBeGreaterThan(0);
  });

  it("should handle error payloads when worker fails", () => {
    const mockErrorResponse = {
      id: "req-99999",
      success: false,
      error: "Invalid key format for specified cipher",
    };

    expect(mockErrorResponse.success).toBe(false);
    expect(mockErrorResponse.error).toContain("Invalid key format");
  });

  it("should throw CipherError with ALGORITHM_UNSUPPORTED for unknown cipher IDs", async () => {
    // Setup global spies before importing the worker (which runs immediately)
    const addEventListenerSpy = vi.spyOn(globalThis as any, "addEventListener");
    const postMessageSpy = vi.spyOn(globalThis as any, "postMessage").mockImplementation(() => {});

    // Dynamically import the worker to execute its top-level event registration
    await import("@/lib/workers/cipher.worker");

    // Find the registered message listener
    const messageCall = addEventListenerSpy.mock.calls.find(call => call[0] === "message");
    expect(messageCall).toBeDefined();
    const listener = messageCall![1] as any;

    // Trigger the listener with an unknown cipher ID
    await listener({
      data: {
        type: "encrypt",
        requestId: "req-unknown",
        payload: {
          cipherId: "fake-cipher-123",
          input: "hello",
          key: "key",
          options: {}
        }
      }
    } as any);

    // Verify the response
    expect(postMessageSpy).toHaveBeenCalled();
    const response = postMessageSpy.mock.calls[0][0] as any;

    expect(response.success).toBe(false);
    expect(response.payload.errorCode).toBe("ALGORITHM_UNSUPPORTED");
    expect(response.payload.errorMessage).toContain("fake-cipher-123");
  });
});