import { describe, it, expect } from "vitest";
import {
  HarmonizedReleaseSchema,
  HarmonizedTrackSchema,
  HarmonizedArtistSchema,
  ProviderSourceSchema,
} from "../types/harmonized.types.js";

describe("Zod schemas", () => {
  describe("ProviderSourceSchema", () => {
    it("validates valid provider source", () => {
      const source = {
        provider: "musicbrainz",
        id: "abc-123",
        url: "https://musicbrainz.org/release/abc-123",
        fetchedAt: new Date(),
      };

      const result = ProviderSourceSchema.safeParse(source);
      expect(result.success).toBe(true);
    });

    it("allows optional url and snapshotId", () => {
      const source = {
        provider: "test",
        id: "123",
        fetchedAt: new Date(),
      };

      const result = ProviderSourceSchema.safeParse(source);
      expect(result.success).toBe(true);
    });

    it("coerces date strings", () => {
      const source = {
        provider: "test",
        id: "123",
        fetchedAt: "2024-01-01T00:00:00Z",
      };

      const result = ProviderSourceSchema.safeParse(source);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.fetchedAt).toBeInstanceOf(Date);
      }
    });
  });

  describe("HarmonizedTrackSchema", () => {
    it("validates valid track", () => {
      const track = {
        title: "Test Track",
        position: 1,
        artists: [{ name: "Artist" }],
        externalIds: { musicbrainz: "track-id" },
        sources: [
          { provider: "musicbrainz", id: "track-id", fetchedAt: new Date() },
        ],
      };

      const result = HarmonizedTrackSchema.safeParse(track);
      expect(result.success).toBe(true);
    });

    it("rejects invalid position", () => {
      const track = {
        title: "Test Track",
        position: 0, // Must be positive
        artists: [],
        externalIds: {},
        sources: [],
      };

      const result = HarmonizedTrackSchema.safeParse(track);
      expect(result.success).toBe(false);
    });
  });

  describe("HarmonizedReleaseSchema", () => {
    it("validates valid release", () => {
      const release = {
        title: "Test Album",
        artists: [{ name: "Artist" }],
        releaseType: "album",
        media: [
          {
            position: 1,
            tracks: [
              {
                title: "Track 1",
                position: 1,
                artists: [{ name: "Artist" }],
                externalIds: {},
                sources: [],
              },
            ],
          },
        ],
        externalIds: { musicbrainz: "release-id" },
        sources: [
          { provider: "musicbrainz", id: "release-id", fetchedAt: new Date() },
        ],
        mergedAt: new Date(),
        confidence: 0.95,
      };

      const result = HarmonizedReleaseSchema.safeParse(release);
      expect(result.success).toBe(true);
    });

    it("validates all release types", () => {
      const releaseTypes = [
        "album",
        "single",
        "ep",
        "compilation",
        "soundtrack",
        "live",
        "remix",
        "other",
      ];

      for (const type of releaseTypes) {
        const release = {
          title: "Test",
          artists: [],
          releaseType: type,
          media: [],
          externalIds: {},
          sources: [],
          mergedAt: new Date(),
          confidence: 1,
        };

        const result = HarmonizedReleaseSchema.safeParse(release);
        expect(result.success).toBe(true);
      }
    });

    it("rejects invalid confidence", () => {
      const release = {
        title: "Test",
        artists: [],
        releaseType: "album",
        media: [],
        externalIds: {},
        sources: [],
        mergedAt: new Date(),
        confidence: 1.5, // Must be 0-1
      };

      const result = HarmonizedReleaseSchema.safeParse(release);
      expect(result.success).toBe(false);
    });
  });

  describe("HarmonizedArtistSchema", () => {
    it("validates valid artist", () => {
      const artist = {
        name: "Test Artist",
        type: "person",
        country: "US",
        aliases: ["Alias 1"],
        genres: ["rock"],
        externalIds: { musicbrainz: "artist-id" },
        sources: [
          { provider: "musicbrainz", id: "artist-id", fetchedAt: new Date() },
        ],
        mergedAt: new Date(),
        confidence: 1.0,
      };

      const result = HarmonizedArtistSchema.safeParse(artist);
      expect(result.success).toBe(true);
    });

    it("validates all artist types", () => {
      const artistTypes = [
        "person",
        "group",
        "orchestra",
        "choir",
        "character",
        "other",
      ];

      for (const type of artistTypes) {
        const artist = {
          name: "Test",
          type,
          externalIds: {},
          sources: [],
          mergedAt: new Date(),
          confidence: 1,
        };

        const result = HarmonizedArtistSchema.safeParse(artist);
        expect(result.success).toBe(true);
      }
    });
  });
});
