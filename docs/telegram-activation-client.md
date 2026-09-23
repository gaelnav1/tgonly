# Telegram activation client

This worker replaces the old Excel-driven Telegram scripts with Stage 3 jobs.

Flow:

```
core.creators
  -> activation.jobs (client=telegram)
  -> workers/telegram_client.py
  -> Telegram
  -> activation.external_resources
```

Supported actions:

- `create_group`
- `create_channel`
- `set_channel_photo`
- `send_pinned_message`

The worker never uses an Excel file as operational state.

## Environment

```bash
NEXT_PUBLIC_SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
TELEGRAM_API_ID=
TELEGRAM_API_HASH=

# Use either a local Telethon session file:
TELEGRAM_SESSION_FILE=sesion

# or a StringSession:
TELEGRAM_SESSION_STRING=
```

Optional:

```bash
TELEGRAM_BATCH_SIZE=20
TELEGRAM_CREATE_PAUSE_SECONDS=30
TELEGRAM_PHOTO_PAUSE_SECONDS=90
TELEGRAM_MESSAGE_PAUSE_SECONDS=10
```

Do not commit Telegram API credentials or session data.
