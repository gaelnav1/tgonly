# OnlySearch data contract v1

OnlySearch is treated as a discovery/observation source. It can create a canonical creator when a stable OnlyFans handle is present, but volatile or descriptive fields do not participate in identity.

## Data classes

### Identity
Stable enough to resolve the platform account.

- `username`, `handle`, `onlyfans_username`, `onlyfans_handle` -> `onlyfans_handle`
- `onlyfans_url`, OnlyFans-valued `profile_url` -> `onlyfans_profile_url`
- canonical identity key: `onlyfans:<normalized_handle>`

Identity fields may create/upsert `core.creators` and `core.platform_accounts`.

### Observed attributes
Time-varying or descriptive values. These are append-only observations in `core.creator_attributes`.

- display name
- bio
- avatar/profile image URL
- free-text location
- explicit country code
- listed subscription price

Location text is not automatically converted into a canonical country.

Subscription price is stored as an observation object with raw value, parsed amount, currency, and free/not-free state.

### Taxonomy observations
Source-provided classifications. They do not automatically become canonical taxonomy.

Stored in `core.creator_taxonomy_observations`:

- category/categories
- tags
- gender
- ethnicity

### Metrics
Volatile numeric observations. Never participate in identity.

Stored in `core.metric_observations`:

- followers
- likes
- posts
- rank

Compact values such as `1.2K`, `3.4M`, and comma-separated integers are parsed into numeric observations.

## Provenance

Every attribute, taxonomy observation, and metric retains:

- source
- raw record
- observation timestamp

The original source payload remains in `ingest.raw_records.payload`.

## Rule

**Identity answers “which account/entity is this?”**

**Attributes, taxonomy, and metrics answer “what did this source observe about it at this time?”**
