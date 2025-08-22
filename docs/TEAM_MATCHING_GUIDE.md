# Team Matching Guide

## 🚨 CRITICAL: DO NOT "FIX" TEAM ABBREVIATIONS!

**The system has comprehensive fuzzy matching logic in `src/features/uploads/services/game-matcher.service.ts`**

## How Team Matching Works

The system can automatically match teams even when different data sources use different abbreviations or names. This is handled by the `teamMatches()` function in the GameMatcher service.

### Supported Variations

The system recognizes all these variations and MORE:

| Database | ESPN    | Other Variations      | Full Names                                      |
| -------- | ------- | --------------------- | ----------------------------------------------- |
| **LVR**  | **LV**  | OAK, Vegas, Raiders   | Las Vegas Raiders, Oakland Raiders              |
| **WAS**  | **WSH** | DC, Commander         | Washington Commanders, Washington Football Team |
| **TB**   | **TB**  | TPA, TAM, Tampa, Bucs | Tampa Bay Buccaneers                            |
| **TEN**  | **TEN** | Titans, Oilers        | Tennessee Titans                                |

### Matching Logic Features

1. **Exact Match**: Direct abbreviation comparison
2. **Variation Mapping**: Comprehensive list of known abbreviations per team
3. **Normalization**: Removes punctuation, common words ("team", "football", "the")
4. **Fuzzy Matching**: Partial string matching for 3+ character strings
5. **Levenshtein Distance**: Handles typos (1-character differences)
6. **Bidirectional**: Checks both directions of matching

### Examples That Work

✅ **These all match correctly:**

- `LV` ↔ `LVR` ↔ `Las Vegas` ↔ `Raiders` ↔ `Vegas` ↔ `OAK`
- `WSH` ↔ `WAS` ↔ `Washington` ↔ `Commanders` ↔ `DC`
- `TB` ↔ `TPA` ↔ `TAM` ↔ `Tampa` ↔ `Bucs` ↔ `Tampa Bay`
- `SF` ↔ `SFO` ↔ `San Francisco` ↔ `49ers` ↔ `Niners`

## When Adding New Data Sources

### ✅ DO:

1. Use the existing fuzzy matching logic
2. Add new variations to the `variations` object if needed
3. Test that matching works before "fixing" abbreviations
4. Trust the fuzzy matching system

### ❌ DON'T:

1. Change database team abbreviations to match external APIs
2. Create duplicate teams with different abbreviations
3. Assume exact matching is required
4. "Fix" abbreviations without checking fuzzy logic first

## Code Location

**Primary fuzzy matching logic:**

```typescript
// src/features/uploads/services/game-matcher.service.ts
private teamMatches(dbTeam: string, uploadTeam: string): boolean
```

**Variation mappings:**

```typescript
// Lines 146-267 in game-matcher.service.ts
const variations: Record<string, string[]> = {
  LV: ['Las Vegas', 'Raiders', 'NV', 'LVR', 'Oakland', 'Raider', 'LV', 'Vegas', 'OAK', ...],
  WAS: ['Washington', 'Commanders', 'DC', 'WSH', 'Commander', 'WFT', ...],
  TB: ['Tampa Bay', 'Buccaneers', 'Bucs', 'FL', 'TBB', 'TPA', 'TAM', 'Tampa', ...],
  // ... all 32 teams
}
```

## Testing Team Matching

To test if team matching works:

```typescript
import { gameMatcherService } from '@/features/uploads/services/game-matcher.service'

// This should return true for all valid variations
const result = gameMatcherService.teamMatches('LVR', 'LV') // true
const result2 = gameMatcherService.teamMatches('WAS', 'WSH') // true
const result3 = gameMatcherService.teamMatches('TB', 'Tampa') // true
```

## Adding New Variations

If you encounter a new variation that doesn't match:

1. **First**: Test with existing logic to confirm it doesn't work
2. **Add** the variation to the appropriate team's array in `variations`
3. **Don't** change the database or create new teams

Example:

```typescript
TB: [
  'Tampa Bay', 'Buccaneers', 'Bucs', 'FL', 'TBB', 'TPA', 'TAM', 'Tampa',
  'NEW_VARIATION_HERE', // Add new variations here
],
```

## Common Mistakes to Avoid

1. **Changing seed data** to match external APIs
2. **Creating multiple team records** for the same team
3. **Assuming exact matching** is needed
4. **Not checking fuzzy logic** before making changes
5. **Forgetting this documentation exists** 😉

## Remember

> **The fuzzy matching system is designed to handle abbreviation differences automatically. Trust it first, then enhance it if needed.**
