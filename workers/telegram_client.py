import asyncio
import json
import os
import tempfile
import urllib.request
from typing import Any

from telethon import TelegramClient
from telethon.errors import FloodWaitError
from telethon.sessions import StringSession
from telethon.tl.functions.channels import CreateChannelRequest, EditPhotoRequest
from telethon.tl.functions.messages import (
    CreateChatRequest,
    ExportChatInviteRequest,
    UpdatePinnedMessageRequest,
)
from telethon.tl.types import InputPeerChannel, InputPeerChat

SUPABASE_URL = os.environ["NEXT_PUBLIC_SUPABASE_URL"].rstrip("/")
SUPABASE_SERVICE_ROLE_KEY = os.environ["SUPABASE_SERVICE_ROLE_KEY"]

TELEGRAM_API_ID = int(os.environ["TELEGRAM_API_ID"])
TELEGRAM_API_HASH = os.environ["TELEGRAM_API_HASH"]
TELEGRAM_SESSION_STRING = os.getenv("TELEGRAM_SESSION_STRING")
TELEGRAM_SESSION_FILE = os.getenv("TELEGRAM_SESSION_FILE", "sesion")

BATCH_SIZE = min(max(int(os.getenv("TELEGRAM_BATCH_SIZE", "20")), 1), 20)
CREATE_PAUSE_SECONDS = int(os.getenv("TELEGRAM_CREATE_PAUSE_SECONDS", "30"))
PHOTO_PAUSE_SECONDS = int(os.getenv("TELEGRAM_PHOTO_PAUSE_SECONDS", "90"))
MESSAGE_PAUSE_SECONDS = int(os.getenv("TELEGRAM_MESSAGE_PAUSE_SECONDS", "10"))


def rpc(name: str, payload: dict[str, Any]) -> Any:
    body = json.dumps(payload).encode("utf-8")
    request = urllib.request.Request(
        f"{SUPABASE_URL}/rest/v1/rpc/{name}",
        data=body,
        method="POST",
        headers={
            "apikey": SUPABASE_SERVICE_ROLE_KEY,
            "Authorization": f"Bearer {SUPABASE_SERVICE_ROLE_KEY}",
            "Content-Type": "application/json",
        },
    )
    with urllib.request.urlopen(request, timeout=60) as response:
        raw = response.read()
        return json.loads(raw) if raw else None


def session():
    if TELEGRAM_SESSION_STRING:
        return StringSession(TELEGRAM_SESSION_STRING)
    return TELEGRAM_SESSION_FILE


def extract_chat_id(result: Any) -> int | None:
    try:
        return result.updates.chats[0].id
    except Exception:
        pass
    try:
        return result.chats[0].id
    except Exception:
        pass
    try:
        for update in result.updates.updates:
            if hasattr(update, "chat_id"):
                return update.chat_id
    except Exception:
        pass
    return None


def avatar_url(payload: dict[str, Any]) -> str | None:
    value = payload.get("avatar")
    if isinstance(value, str):
        return value
    if isinstance(value, dict):
        for key in ("url", "src", "value"):
            if isinstance(value.get(key), str):
                return value[key]
    return None


def download_temp_image(url: str) -> str:
    suffix = ".jpg"
    path = ""
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as f:
            path = f.name
        request = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(request, timeout=60) as response, open(path, "wb") as out:
            out.write(response.read())
        return path
    except Exception:
        if path and os.path.exists(path):
            os.unlink(path)
        raise


async def create_group(client: TelegramClient, payload: dict[str, Any]) -> dict[str, Any]:
    title = str(payload["title"]).strip()
    result = await client(CreateChatRequest(users=[], title=title))
    chat_id = extract_chat_id(result)
    if chat_id is None:
        raise RuntimeError("Telegram group created but chat_id could not be resolved")

    invite = await client(ExportChatInviteRequest(peer=InputPeerChat(chat_id=chat_id)))
    return {
        "external_id": str(chat_id),
        "external_url": invite.link,
        "resource_type": "telegram_group",
        "state": {"title": title, "peer_type": "chat"},
    }


async def create_channel(client: TelegramClient, payload: dict[str, Any]) -> dict[str, Any]:
    title = str(payload["title"]).strip()
    about = str(payload.get("about") or "")
    result = await client(CreateChannelRequest(title=title, about=about, megagroup=False))
    channel = result.chats[0]
    invite = await client(
        ExportChatInviteRequest(
            peer=InputPeerChannel(channel_id=channel.id, access_hash=channel.access_hash)
        )
    )
    return {
        "external_id": str(channel.id),
        "external_url": invite.link,
        "resource_type": "telegram_channel",
        "state": {
            "title": title,
            "peer_type": "channel",
            "access_hash": str(channel.access_hash),
        },
    }


async def set_channel_photo(client: TelegramClient, payload: dict[str, Any]) -> dict[str, Any]:
    target = payload.get("dependency_external_url")
    image = avatar_url(payload)
    if not target:
        raise RuntimeError("telegram_channel dependency is missing")
    if not image:
        raise RuntimeError("creator avatar_url is missing")

    path = download_temp_image(image)
    try:
        channel = await client.get_entity(target)
        uploaded = await client.upload_file(path)
        await client(EditPhotoRequest(channel=channel, photo=uploaded))
    finally:
        if os.path.exists(path):
            os.unlink(path)

    return {
        "external_id": str(payload["dependency_external_id"]),
        "external_url": target,
        "resource_type": "telegram_channel",
        "state": {"photo_updated": True},
    }


async def send_pinned_message(client: TelegramClient, payload: dict[str, Any]) -> dict[str, Any]:
    target = payload.get("dependency_external_url")
    message = payload.get("message")
    if not target:
        raise RuntimeError("telegram_channel dependency is missing")
    if not isinstance(message, str) or not message.strip():
        raise RuntimeError("message option is required")

    channel = await client.get_entity(target)
    sent = await client.send_message(channel, message)
    await client(
        UpdatePinnedMessageRequest(peer=channel, id=sent.id, silent=True)
    )

    return {
        "external_id": str(payload["dependency_external_id"]),
        "external_url": target,
        "resource_type": "telegram_channel",
        "state": {"message_id": sent.id, "message_pinned": True},
    }


async def execute_job(client: TelegramClient, job: dict[str, Any]) -> dict[str, Any]:
    action = job["action"]
    payload = job.get("desired_payload") or {}

    if action == "create_group":
        return await create_group(client, payload)
    if action == "create_channel":
        return await create_channel(client, payload)
    if action == "set_channel_photo":
        return await set_channel_photo(client, payload)
    if action == "send_pinned_message":
        return await send_pinned_message(client, payload)

    raise RuntimeError(f"unsupported action: {action}")


def complete(job_id: str, success: bool, result: dict[str, Any] | None = None, error: str | None = None) -> None:
    result = result or {}
    rpc(
        "complete_telegram_job",
        {
            "p_job_id": job_id,
            "p_success": success,
            "p_external_id": result.get("external_id"),
            "p_external_username": result.get("external_username"),
            "p_external_url": result.get("external_url"),
            "p_resource_type": result.get("resource_type"),
            "p_state": result.get("state") or {},
            "p_error": error,
        },
    )


def pause_for(action: str) -> int:
    if action in ("create_group", "create_channel"):
        return CREATE_PAUSE_SECONDS
    if action == "set_channel_photo":
        return PHOTO_PAUSE_SECONDS
    return MESSAGE_PAUSE_SECONDS


async def main() -> None:
    jobs = rpc("claim_telegram_jobs", {"p_limit": BATCH_SIZE}) or []
    if not jobs:
        print("No queued Telegram jobs.")
        return

    client = TelegramClient(session(), TELEGRAM_API_ID, TELEGRAM_API_HASH)

    async with client:
        for index, job in enumerate(jobs, start=1):
            job_id = job["job_id"]
            action = job["action"]

            while True:
                try:
                    result = await execute_job(client, job)
                    complete(job_id, True, result=result)
                    print(f"[{index}/{len(jobs)}] {action}: succeeded -> {result.get('external_url')}")
                    break
                except FloodWaitError as exc:
                    wait = exc.seconds + 5
                    print(f"[{index}/{len(jobs)}] Telegram FloodWait: {wait}s")
                    await asyncio.sleep(wait)
                except Exception as exc:
                    complete(job_id, False, error=str(exc))
                    print(f"[{index}/{len(jobs)}] {action}: failed -> {exc}")
                    break

            if index < len(jobs):
                await asyncio.sleep(pause_for(action))


if __name__ == "__main__":
    asyncio.run(main())
