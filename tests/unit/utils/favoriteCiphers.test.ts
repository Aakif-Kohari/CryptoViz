import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  normalizeFavoriteCipherIds,
  loadFavoriteCipherIds,
  saveFavoriteCipherIds,
  toggleFavoriteCipher,
  clearFavoriteCipherIds,
  FAVORITE_CIPHERS_STORAGE_KEY,
  MAX_FAVORITE_CIPHERS,
  FAVORITE_CIPHERS_CHANGED_EVENT,
} from "@/lib/utils/favoriteCiphers";

describe("favorite cipher utilities", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  describe("normalizeFavoriteCipherIds", () => {
    it("removes duplicates and unsupported ids", () => {
      const result = normalizeFavoriteCipherIds(
        ["aes", "aes", "rsa", "invalid"],
        new Set(["aes", "rsa"]),
      );

      expect(result).toEqual(["aes", "rsa"]);
    });

    it("returns empty array for invalid input", () => {
      expect(normalizeFavoriteCipherIds(null)).toEqual([]);
      expect(normalizeFavoriteCipherIds("aes")).toEqual([]);
    });

    it("respects maximum favorite limit", () => {
      const ids = Array.from(
        { length: MAX_FAVORITE_CIPHERS + 5 },
        (_, index) => `cipher-${index}`,
      );

      const result = normalizeFavoriteCipherIds(
        ids,
        new Set(ids),
      );

      expect(result).toHaveLength(MAX_FAVORITE_CIPHERS);
    });
  });

  describe("loadFavoriteCipherIds", () => {
    it("loads favorites from localStorage", () => {
      localStorage.setItem(
        FAVORITE_CIPHERS_STORAGE_KEY,
        JSON.stringify(["aes", "rsa"]),
      );

      expect(loadFavoriteCipherIds()).toEqual([
        "aes",
        "rsa",
      ]);
    });

    it("returns empty array for invalid storage data", () => {
      localStorage.setItem(
        FAVORITE_CIPHERS_STORAGE_KEY,
        "invalid-json",
      );

      expect(loadFavoriteCipherIds()).toEqual([]);
    });
  });

  describe("saveFavoriteCipherIds", () => {
    it("normalizes and saves favorites and dispatches event", () => {
      const dispatchSpy = vi.spyOn(window, "dispatchEvent");
      const result = saveFavoriteCipherIds([
        "aes",
        "aes",
        "invalid",
      ]);

      expect(result).toEqual(["aes"]);

      expect(
        JSON.parse(
          localStorage.getItem(
            FAVORITE_CIPHERS_STORAGE_KEY,
          )!,
        ),
      ).toEqual(["aes"]);

      expect(dispatchSpy).toHaveBeenCalledTimes(1);
      const event = dispatchSpy.mock.calls[0][0] as CustomEvent;
      expect(event.type).toBe(FAVORITE_CIPHERS_CHANGED_EVENT);
      expect(event.detail).toEqual(["aes"]);
    });

    it("handles unavailable localStorage and does not dispatch event", () => {
      const dispatchSpy = vi.spyOn(window, "dispatchEvent");
      vi.spyOn(Storage.prototype, "setItem")
        .mockImplementation(() => {
          throw new Error("Storage unavailable");
        });

      let result: string[] = [];
      expect(() => {
        result = saveFavoriteCipherIds(["aes"]);
      }).not.toThrow();

      // normalized IDs are still returned
      expect(result).toEqual(["aes"]);
      // no change event is dispatched when storage fails
      expect(dispatchSpy).not.toHaveBeenCalled();
    });
  });

  describe("toggleFavoriteCipher", () => {
    it("adds a cipher when not already favorite", () => {
      expect(
        toggleFavoriteCipher(["aes"], "rsa"),
      ).toEqual([
        "aes",
        "rsa",
      ]);
    });

    it("removes a cipher when already favorite", () => {
      expect(
        toggleFavoriteCipher(
          ["aes", "rsa"],
          "rsa",
        ),
      ).toEqual(["aes"]);
    });

    it("ignores unsupported cipher ids", () => {
      expect(
        toggleFavoriteCipher(
          ["aes"],
          "invalid",
        ),
      ).toEqual(["aes"]);
    });
  });

  describe("clearFavoriteCipherIds", () => {
    it("clears favorites from localStorage", () => {
      localStorage.setItem(
        FAVORITE_CIPHERS_STORAGE_KEY,
        JSON.stringify(["aes"]),
      );

      clearFavoriteCipherIds();

      expect(
        localStorage.getItem(
          FAVORITE_CIPHERS_STORAGE_KEY,
        ),
      ).toBeNull();
    });

    it("handles unavailable localStorage", () => {
      vi.spyOn(Storage.prototype, "removeItem")
        .mockImplementation(() => {
          throw new Error("Storage unavailable");
        });

      expect(() =>
        clearFavoriteCipherIds(),
      ).not.toThrow();
    });
  });
});