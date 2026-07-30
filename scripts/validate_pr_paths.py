#!/usr/bin/env python3
"""Не даёт PR менять файлы вне папок обоев."""

import re
import subprocess
import sys

ALLOWED_PATH = re.compile(r"^wallpapers/.+$")


def changed_paths(base_sha, head_sha):
    result = subprocess.run(
        ["git", "diff", "--name-only", "--diff-filter=ACDMRTUXB", base_sha, head_sha],
        check=True,
        capture_output=True,
        text=True,
        encoding="utf-8",
    )
    return [line.strip().replace("\\", "/") for line in result.stdout.splitlines() if line.strip()]


def main():
    if len(sys.argv) != 3:
        raise SystemExit("Запуск: validate_pr_paths.py <base-sha> <head-sha>")

    paths = changed_paths(sys.argv[1], sys.argv[2])
    forbidden = [path for path in paths if not ALLOWED_PATH.fullmatch(path)]

    if not paths:
        raise SystemExit("PR не содержит изменённых файлов.")
    if forbidden:
        print("PR может менять только файлы внутри wallpapers/<id>/.")
        print("Запрещённые пути:")
        for path in forbidden:
            print(f"  - {path}")
        raise SystemExit(1)

    folders = sorted({path.split("/", 2)[1] for path in paths})
    print(f"Пути PR разрешены. Затронуты папки: {', '.join(folders)}")


if __name__ == "__main__":
    main()
