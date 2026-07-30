#!/usr/bin/env python3
"""Проверка каталога Wallify перед вливанием PR.

Запуск из корня репозитория:

    python3 scripts/validate_catalog.py

Код возврата 0 — ошибок нет, 1 — есть. Предупреждения не роняют сборку.
"""

import json
import os
import re
import sys
from datetime import datetime

if hasattr(sys.stdout, "reconfigure"):  # консоль Windows по умолчанию не в UTF-8
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
INDEX = os.path.join(ROOT, "index.json")

ID_RE = re.compile(r"^[^/\\]+$")
VERSION_RE = re.compile(r"^\d+\.\d+\.\d+$")
REMOTE_RE = re.compile(r"""(?:src|href)\s*=\s*["']https?://""", re.I)
COVER_NAMES = ("cover.jpg", "cover.jpeg", "cover.png", "cover.webp")
ICON_NAMES = ("icon.png", "icon.jpg", "icon.jpeg", "icon.webp")

errors = []
warnings = []


def error(where, message):
    errors.append(f"{where}: {message}")


def warn(where, message):
    warnings.append(f"{where}: {message}")


def read_json(path, where):
    try:
        with open(path, "r", encoding="utf-8") as fh:
            return json.load(fh)
    except FileNotFoundError:
        error(where, f"файл не найден: {os.path.relpath(path, ROOT)}")
    except json.JSONDecodeError as exc:
        error(where, f"невалидный JSON ({exc.lineno}:{exc.colno}) — {exc.msg}")
    return None


def check_iso(where, field, value):
    if value is None:
        return
    try:
        datetime.fromisoformat(str(value).replace("Z", "+00:00"))
    except ValueError:
        error(where, f"{field}: не разбирается как дата ISO 8601 — {value!r}")


def bundle_files(bundle_dir):
    found = []
    for current, dirs, names in os.walk(bundle_dir):
        dirs[:] = [d for d in dirs if d not in (".git", "__pycache__")]
        for name in names:
            rel = os.path.relpath(os.path.join(current, name), bundle_dir)
            found.append(rel.replace(os.sep, "/"))
    return found


def check_entry(entry, position, seen_ids):
    where = f"index.json[{position}]"

    for field in ("id", "name", "author", "version", "description", "path"):
        if not entry.get(field):
            error(where, f"нет обязательного поля {field!r}")
    if errors and not entry.get("id"):
        return

    wid = entry.get("id", "")
    where = f"index.json[{wid}]"

    if not ID_RE.match(wid):
        error(where, "id: имя папки не должно содержать '/' или '\\\\'")
    if wid in seen_ids:
        error(where, f"id повторяется, впервые встречен в позиции {seen_ids[wid]}")
    else:
        seen_ids[wid] = position

    version = entry.get("version", "")
    if version and not VERSION_RE.match(str(version)):
        error(where, f"version: ожидается MAJOR.MINOR.PATCH, получено {version!r}")

    check_iso(where, "createdAt", entry.get("createdAt"))
    check_iso(where, "updatedAt", entry.get("updatedAt"))

    if "isLite" in entry and not isinstance(entry["isLite"], bool):
        error(where, "isLite: должно быть true или false")
    if "useGyroscope" in entry and not isinstance(entry["useGyroscope"], bool):
        error(where, "useGyroscope: должно быть true или false")
    if "stars" in entry:
        warn(where, "stars: поле устарело, популярность берётся из счётчиков GitHub Releases")
    if "cover" in entry and not isinstance(entry["cover"], str):
        error(where, "cover: должно быть строкой — имя файла обложки внутри папки комплекта")

    path = entry.get("path", "")
    if not path.startswith("wallpapers/"):
        error(where, f"path: должен начинаться с 'wallpapers/', получено {path!r}")
    if path and path != f"wallpapers/{wid}":
        warn(where, f"path не совпадает с id — ожидалось 'wallpapers/{wid}'")

    bundle_dir = os.path.join(ROOT, *path.split("/"))
    if not os.path.isdir(bundle_dir):
        error(where, f"папка комплекта не найдена: {path}")
        return

    main = entry.get("main", "index.html")
    if not os.path.isfile(os.path.join(bundle_dir, *main.split("/"))):
        error(where, f"точка входа не найдена: {path}/{main}")

    manifest_path = os.path.join(bundle_dir, "manifest.json")
    manifest = read_json(manifest_path, f"{path}/manifest.json")
    if manifest is None:
        return

    mwhere = f"{path}/manifest.json"
    for field in ("name", "author", "version", "description"):
        if not manifest.get(field):
            error(mwhere, f"нет обязательного поля {field!r}")

    # Имя — ключ, по которому приложение сопоставляет установленные обои с каталогом.
    # Расхождение ломает определение обновлений, поэтому это ошибка, а не предупреждение.
    if manifest.get("name") != entry.get("name"):
        error(mwhere, f"name {manifest.get('name')!r} != index.json {entry.get('name')!r}")
    if manifest.get("version") != entry.get("version"):
        error(mwhere, f"version {manifest.get('version')!r} != index.json {entry.get('version')!r}")
    if manifest.get("author") != entry.get("author"):
        error(mwhere, f"author {manifest.get('author')!r} != index.json {entry.get('author')!r}")
    if manifest.get("description") != entry.get("description"):
        warn(mwhere, "description отличается от index.json")
    if bool(manifest.get("useGyroscope")) != bool(entry.get("useGyroscope")):
        error(mwhere, "useGyroscope не совпадает с index.json")
    if "isLite" in manifest and "isLite" in entry and manifest["isLite"] != entry["isLite"]:
        error(mwhere, "isLite не совпадает с index.json")

    if manifest.get("main", "index.html") != main:
        error(mwhere, f"main {manifest.get('main')!r} != index.json {main!r}")
    if not manifest.get("minAppVersion"):
        warn(mwhere, "нет minAppVersion — укажите минимальную версию приложения")
    if "isLite" not in manifest:
        warn(mwhere, "нет isLite — комплект попадёт в фильтр «Full»")

    settings_path = manifest.get("settingsPath")
    if settings_path and not os.path.isfile(os.path.join(bundle_dir, *settings_path.split("/"))):
        error(mwhere, f"settingsPath указывает на несуществующий файл: {settings_path}")
    if not settings_path and os.path.isfile(os.path.join(bundle_dir, "settings", "index.html")):
        # Движок найдёт файл и по запасному пути, но явное объявление надёжнее.
        warn(mwhere, "есть settings/index.html, но settingsPath не объявлен в манифесте")

    # Иконка используется только как запасной вариант, если обложки нет.
    has_art = False
    for field, fallbacks in (("cover", COVER_NAMES), ("icon", ICON_NAMES)):
        declared = manifest.get(field)
        if declared:
            if os.path.isfile(os.path.join(bundle_dir, *declared.split("/"))):
                has_art = True
            else:
                error(mwhere, f"{field} указывает на несуществующий файл: {declared}")
        elif any(os.path.isfile(os.path.join(bundle_dir, n)) for n in fallbacks):
            has_art = True
    if not has_art:
        warn(where, "нет ни обложки, ни иконки — карточка в каталоге будет пустой")

    if not os.path.isfile(os.path.join(bundle_dir, "README.md")):
        warn(where, "нет README.md — на странице комплекта нечего показать")

    # Без downloadUrl приложение забирает из репозитория только main и manifest.json.
    # Комплект из нескольких файлов приедет на устройство неполным.
    files = bundle_files(bundle_dir)
    extra = [f for f in files if f not in (main, "manifest.json", "README.md")]
    download = entry.get("downloadUrl")
    if download:
        if not str(download).startswith("https://"):
            error(where, "downloadUrl: требуется https")
        elif not str(download).endswith(".zip"):
            warn(where, "downloadUrl: ожидается ссылка на .zip")
    elif extra:
        error(
            where,
            "нет downloadUrl, а комплект содержит файлы помимо точки входа "
            f"({', '.join(sorted(extra)[:5])}) — на устройство они не попадут",
        )

    for name in files:
        if not name.endswith((".html", ".htm", ".js")):
            continue
        with open(os.path.join(bundle_dir, *name.split("/")), "r", encoding="utf-8", errors="replace") as fh:
            body = fh.read()
        if REMOTE_RE.search(body):
            warn(f"{path}/{name}", "ссылка на внешний ресурс — обои должны работать без сети")


def main():
    index = read_json(INDEX, "index.json")
    if index is None:
        report()
        return

    if not isinstance(index.get("wallpapers"), list):
        error("index.json", "поле 'wallpapers' отсутствует или не является массивом")
        report()
        return

    check_iso("index.json", "updatedAt", index.get("updatedAt"))
    if index.get("version") != 1:
        warn("index.json", f"version каталога = {index.get('version')!r}, ожидалась 1")

    seen_ids = {}
    for position, entry in enumerate(index["wallpapers"]):
        if not isinstance(entry, dict):
            error(f"index.json[{position}]", "запись не является объектом")
            continue
        check_entry(entry, position, seen_ids)

    # Папки в wallpapers/, которых нет в каталоге, никогда не увидит пользователь.
    wallpapers_dir = os.path.join(ROOT, "wallpapers")
    if os.path.isdir(wallpapers_dir):
        listed = {e.get("path") for e in index["wallpapers"] if isinstance(e, dict)}
        for name in sorted(os.listdir(wallpapers_dir)):
            if os.path.isdir(os.path.join(wallpapers_dir, name)) and f"wallpapers/{name}" not in listed:
                error("index.json", f"папка wallpapers/{name} не описана в каталоге")

    report()


def report():
    for line in warnings:
        print(f"warning  {line}")
    for line in errors:
        print(f"ERROR    {line}")

    print()
    if errors:
        print(f"Проверка не пройдена: ошибок {len(errors)}, предупреждений {len(warnings)}.")
        sys.exit(1)
    print(f"Каталог валиден. Предупреждений: {len(warnings)}.")


if __name__ == "__main__":
    main()
