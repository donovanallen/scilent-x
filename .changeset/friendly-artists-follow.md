---
"@scilent-one/harmony-engine": minor
---

Add followed artists API support

- Add `PaginatedCollection<T>` and `CollectionParams` types for paginated user collections
- Add `getFollowedArtists(accessToken, params)` method to `BaseProvider` class
- Implement `_getFollowedArtists` in `TidalProvider` using `/userCollections/{id}/relationships/artists` endpoint
- Support cursor-based pagination with `page[cursor]` parameter
- Return harmonized artist data with total count and pagination info
