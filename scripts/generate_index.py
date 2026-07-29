#!/usr/bin/env python3
"""Собирает index.json из манифестов в wallpapers/."""

import json
import os
import subprocess
import sys
from datetime import datetime, timezone
from pathlib import Path

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

ROOT = Path(__file__).resolve().parent.parent
INDEX_PATH = ROOT / "index.json"
WALLPAPERS_PATH = ROOT / "wallpapers"


def load_json(path):
    with path.open("r", encoding="utf-8") as source:
        return json.load(source)


def repository_name():
    from_env = os.environ.get("GITHUB_REPOSITORY")
    if from_env:
        return from_env

    try:
        remote = subprocess.check_output(
            ["git", "remote", "get-url", "origin"],
            cwd=ROOT,
            text=True,
            encoding="utf-8",
        ).strip()
    except (OSError, subprocess.CalledProcessError):
        return "YouRooni/Wallify-Repo"

    remote = remote.removesuffix(".git").replace("\\", "/")
    if remote.startswith("git@github.com:"):
        return remote.split(":", 1)[1]
    if "github.com/" in remote:
        return remote.split("github.com/", 1)[1]
    return "YouRooni/Wallify-Repo"


def current_index():
    if not INDEX_PATH.exists():
        return {"version": 1, "wallpapers": []}
    try:
        return load_json(INDEX_PATH)
    except json.JSONDecodeError as error:
        print(
            f"Предупреждение: повреждённый index.json будет собран заново ({error})",
            file=sys.stderr,
        )
        return {"version": 1, "wallpapers": []}


def find_art(manifest, folder, field, fallbacks, fallback_field, fallback_names):
    declared = manifest.get(field)
    if declared:
        return declared
    for name in fallbacks:
        if (folder / name).is_file():
            return name
    fallback_declared = manifest.get(fallback_field)
    if fallback_declared:
        return fallback_declared
    for name in fallback_names:
        if (folder / name).is_file():
            return name
    return None


def comparable(entry):
    ignored = {"createdAt", "updatedAt", "downloadUrl"}
    return {key: value for key, value in entry.items() if key not in ignored}


def build_entry(folder, manifest, old_entry, timestamp, repository):
    wallpaper_id = folder.name
    entry = {
        "id": wallpaper_id,
        "name": manifest["name"],
        "author": manifest["author"],
        "version": manifest["version"],
        "description": manifest["description"],
        "path": f"wallpapers/{wallpaper_id}",
        "main": manifest.get("main", "index.html"),
        "useGyroscope": bool(manifest.get("useGyroscope", False)),
        "isLite": bool(manifest.get("isLite", False)),
        "cover": find_art(
            manifest,
            folder,
            "cover",
            ("cover.png", "cover.jpg", "cover.webp"),
            "icon",
            ("icon.png", "icon.jpg", "icon.webp"),
        ),
        "icon": find_art(
            manifest,
            folder,
            "icon",
            ("icon.png", "icon.jpg", "icon.webp"),
            "cover",
            ("cover.png", "cover.jpg", "cover.webp"),
        ),
    }
    for field in ("orientations", "themeSupport", "supportsMonet", "tags"):
        if field in manifest:
            entry[field] = manifest[field]

    created_at = old_entry.get("createdAt", timestamp)
    updated_at = old_entry.get("updatedAt", timestamp)
    old_comparable = comparable(old_entry)
    new_comparable = comparable(entry)
    # Первое появление отдельного icon в схеме индекса — миграция каталога,
    # а не обновление содержимого каждого существующего комплекта.
    if old_entry and "icon" not in old_comparable:
        new_comparable.pop("icon", None)
    if old_entry and old_comparable != new_comparable:
        updated_at = timestamp

    entry["createdAt"] = created_at
    entry["updatedAt"] = updated_at
    entry["downloadUrl"] = (
        f"https://github.com/{repository}/releases/download/bundles/{wallpaper_id}.zip"
    )
    return entry


def main():
    old_index = current_index()
    old_entries = {
        item.get("id"): item
        for item in old_index.get("wallpapers", [])
        if isinstance(item, dict) and item.get("id")
    }
    timestamp = datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z")
    repository = repository_name()
    entries = []
    folders = {path.name: path for path in WALLPAPERS_PATH.iterdir() if path.is_dir()}
    old_order = [item_id for item_id in old_entries if item_id in folders]
    new_ids = sorted(item_id for item_id in folders if item_id not in old_entries)

    for wallpaper_id in old_order + new_ids:
        folder = folders[wallpaper_id]
        manifest_path = folder / "manifest.json"
        if not manifest_path.is_file():
            raise SystemExit(f"Нет manifest.json: {manifest_path.relative_to(ROOT)}")
        manifest = load_json(manifest_path)
        entry = build_entry(folder, manifest, old_entries.get(folder.name, {}), timestamp, repository)
        entries.append(entry)

    generated = {
        "version": 1,
        "updatedAt": timestamp if entries != old_index.get("wallpapers", []) else old_index.get("updatedAt", timestamp),
        "wallpapers": entries,
    }
    INDEX_PATH.write_text(
        json.dumps(generated, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    print(f"index.json собран: {len(entries)} обоев")


if __name__ == "__main__":
    main()
