import { describe, expect, it } from "vitest"
import {
  CRYPTOGRAPHY_VIDEOS,
  DEFAULT_VIDEO_LIBRARY_FILTER,
  buildVideoLibraryManualChecklist,
  buildVideoLibraryResult,
  filterCryptoVideos,
  getVideoTags,
  getVideoTopics,
  matchesSearch,
} from "../../../lib/resources/cryptographyVideoLibrary"

describe("cryptography video library utilities", () => {
  it("contains curated video entries with embedded previews", () => {
    expect(CRYPTOGRAPHY_VIDEOS.length).toBeGreaterThanOrEqual(8)
    expect(CRYPTOGRAPHY_VIDEOS.every((video) => video.embedUrl.includes("youtube-nocookie.com/embed"))).toBe(true)
    expect(CRYPTOGRAPHY_VIDEOS.every((video) => video.tags.length > 0)).toBe(true)
  })

  it("builds topic and tag filters", () => {
    expect(getVideoTopics()[0]).toBe("All")
    expect(getVideoTopics()).toContain("Hashing")
    expect(getVideoTags()[0]).toBe("All")
    expect(getVideoTags()).toContain("AES")
  })

  it("matches search across title, topic, tags, and descriptions", () => {
    const video = CRYPTOGRAPHY_VIDEOS.find((item) => item.id === "rsa-public-key")
    expect(video).toBeDefined()
    expect(matchesSearch(video!, "modular")).toBe(true)
    expect(matchesSearch(video!, "not-present")).toBe(false)
  })

  it("filters videos by topic, difficulty, tag, and search", () => {
    expect(filterCryptoVideos({ ...DEFAULT_VIDEO_LIBRARY_FILTER, topic: "Hashing" })).toHaveLength(1)
    expect(filterCryptoVideos({ ...DEFAULT_VIDEO_LIBRARY_FILTER, difficulty: "Advanced" }).length).toBeGreaterThan(0)
    expect(filterCryptoVideos({ ...DEFAULT_VIDEO_LIBRARY_FILTER, tag: "RSA" })).toHaveLength(1)
    expect(filterCryptoVideos({ ...DEFAULT_VIDEO_LIBRARY_FILTER, search: "side" })).toHaveLength(1)
  })

  it("builds complete library result", () => {
    const result = buildVideoLibraryResult(DEFAULT_VIDEO_LIBRARY_FILTER)

    expect(result.videos).toHaveLength(CRYPTOGRAPHY_VIDEOS.length)
    expect(result.featuredVideo).toBeTruthy()
    expect(result.summary.total).toBe(CRYPTOGRAPHY_VIDEOS.length)
    expect(result.difficulties).toEqual(["All", "Beginner", "Intermediate", "Advanced"])
  })

  it("returns no featured video when filters have no results", () => {
    const result = buildVideoLibraryResult({
      ...DEFAULT_VIDEO_LIBRARY_FILTER,
      search: "definitely-no-match",
    })

    expect(result.videos).toHaveLength(0)
    expect(result.featuredVideo).toBeNull()
  })

  it("builds manual testing checklist", () => {
    const checklist = buildVideoLibraryManualChecklist()

    expect(checklist[0]).toMatch(/open the curated cryptography video library/i)
    expect(checklist).toContain("Search for AES and confirm matching videos are filtered.")
  })
})
