# 🎨 Wallify Repository

> **Wallify** — Create your own live wallpapers!
> Официальный открытый каталог живых обоев для Android-приложения **Wallify** от [Rooni](https://rooni.dev) ([@RnPlugins](https://t.me/RnPlugins)).

Каждый разработчик может выложить свои интерактивные живые обои на **HTML5 / CSS3 / JavaScript / Canvas** в каталог приложения.

> [!IMPORTANT]
> 📖 **[Полное техническое руководство разработчика обоев (WALLPAPER_API.md)](WALLPAPER_API.md)**
> Движок, метаданные, события, локальный HTTP-сервер, палитра Material You, хранилище настроек — всё описано там. Этот файл рассказывает только про устройство каталога.
>
> 📝 **[Как отправить свои обои (CONTRIBUTING.md)](CONTRIBUTING.md)**

---

## 🚀 Как устроен каталог

Комплект обоев — это независимый HTML5-проект с файлом `manifest.json`. Все комплекты лежат в папке `wallpapers/`, а корневой [`index.json`](index.json) — единственный индекс, откуда приложение Wallify берёт список обоев, версии, описания и ссылки на архивы.

```text
Wallify-Repo/
├── index.json                      # Индекс каталога — его читает приложение
├── wallpapers/
│   └── my-cool-wallpaper/
│       ├── manifest.json           # Метаданные комплекта
│       ├── index.html              # Точка входа
│       ├── README.md               # Показывается на странице комплекта
│       ├── cover.png               # Обложка карточки (9:16 или 500x500)
│       └── settings/
│           └── index.html          # (Опционально) страница настроек
└── scripts/
    ├── validate_catalog.py         # Проверка каталога, её же гоняет CI
    └── make_covers.py              # Генератор обложек-заглушек
```

---

## 📇 Формат `index.json`

Этот файл генерирует GitHub Actions из папок `wallpapers/*/` и их `manifest.json`.
Авторам PR редактировать его не нужно. Одна запись — один комплект.

```json
{
  "version": 1,
  "updatedAt": "2026-07-26T23:45:00Z",
  "wallpapers": [
    {
      "id": "my-cool-wallpaper",
      "name": "My Cool Wallpaper",
      "author": "Nickname",
      "version": "1.0.0",
      "description": "Короткое описание для карточки в каталоге.",
      "path": "wallpapers/my-cool-wallpaper",
      "main": "index.html",
      "useGyroscope": false,
      "isLite": true,
      "cover": "cover.png",
      "createdAt": "2026-07-26T00:00:00Z",
      "updatedAt": "2026-07-26T00:00:00Z",
      "downloadUrl": "https://github.com/YouRooni/Wallify-Repo/releases/download/bundles/my-cool-wallpaper.zip"
    }
  ]
}
```

| Поле | Обязательно | Описание |
|---|---|---|
| `id` | да | Уникальный идентификатор: строчные латинские буквы, цифры, дефис. Совпадает с именем папки |
| `name` | да | Название. По нему приложение сопоставляет установленные обои с каталогом, поэтому оно **обязано совпадать** с `name` в манифесте |
| `author` | да | Автор, совпадает с манифестом |
| `version` | да | `MAJOR.MINOR.PATCH`, совпадает с манифестом. По ней определяется наличие обновления |
| `description` | да | Краткое описание для карточки |
| `path` | да | Путь к папке комплекта: `wallpapers/<id>` |
| `main` | нет | Точка входа, по умолчанию `index.html` |
| `useGyroscope` | нет | Должно совпадать с манифестом, иначе сенсор не зарегистрируется |
| `isLite` | нет | Пометка «энергоэффективные», влияет на фильтр в каталоге |
| `cover` | нет | Имя файла обложки внутри папки комплекта, по умолчанию `cover.png` |
| `createdAt` / `updatedAt` | нет | ISO 8601. Без них сортировка «Сначала новые» превращается в порядок строк файла |
| `downloadUrl` | генерируется | Стабильная ссылка на ZIP в релизе `bundles` |

Поля `stars` больше нет: приложение показывает настоящие счётчики скачиваний из GitHub
Releases, сопоставляя их с именем файла из `downloadUrl`. В старых записях оно игнорируется.

### Про `downloadUrl`

Если ссылки нет, приложение может забрать из репозитория **только `main` и `manifest.json`**. Комплект со страницей настроек, обложкой, шрифтами или отдельными скриптами приедет на устройство неполным — например, кнопка настроек в карточке просто не появится.

Архивы и ссылки собираются автоматически: воркфлоу [`package-bundles.yml`](.github/workflows/package-bundles.yml) после merge пакует каждую папку в ZIP, обновляет постоянный релиз `bundles` и генерирует ссылку:

```text
https://github.com/YouRooni/Wallify-Repo/releases/download/bundles/<id>.zip
```

---

## 📄 Формат `manifest.json`

```json
{
  "name": "My Cool Wallpaper",
  "description": "Короткое описание для карточки в каталоге.",
  "author": "Nickname",
  "version": "1.0.0",
  "minAppVersion": ">=1.0.0",
  "cover": "cover.png",
  "main": "index.html",
  "settingsPath": "settings/index.html",
  "useGyroscope": false,
  "isLite": false
}
```

Поля `name`, `author`, `version` и `useGyroscope` обязаны совпадать с записью в `index.json` — CI это проверяет. Подробное описание каждого поля — в [WALLPAPER_API.md, раздел 3](WALLPAPER_API.md).

---

## ⚡ API движка

Движок отдаёт странице объект `window.WallpaperEngine` и события `wallpaperEngineReady`, `wallpaperUpdate`, `wallpaperGyroscope`, `wallpaperOffset`, `wallpaperPause`, `wallpaperResume` и другие.

Полное описание с примерами — **[WALLPAPER_API.md](WALLPAPER_API.md)**. Дублировать его здесь мы не будем: два описания одного API разъедутся на первом же изменении движка.

> [!WARNING]
> **Про WebGL.** По умолчанию страница растеризуется процессором. DOM, CSS-анимации, 2D-канвас и SVG работают надёжно, а вот WebGL, `backdrop-filter` и `mix-blend-mode` идут через композитор и могут не попасть в кадр — вплоть до чёрного экрана на части прошивок. Если строите обои на WebGL, обязательно проверьте их на реальном устройстве и предусмотрите запасной вариант. Подробности — в [разделе 12 руководства](WALLPAPER_API.md).

---

## 📤 Как добавить свои обои в каталог

1. Сделайте **Fork** репозитория.
2. Положите комплект в `wallpapers/<id>/`. `index.json` трогать не нужно.
3. Прогоните проверку локально:

```bash
python3 scripts/generate_index.py
python3 scripts/validate_catalog.py
```

4. Отправьте **Pull Request**.

Полный список требований и частые ошибки — в [CONTRIBUTING.md](CONTRIBUTING.md).

---

## 📜 Лицензия

Код каталога и документация — под [MIT](LICENSE). Авторские права на каждый комплект остаются за его автором; отправляя PR, автор публикует свои обои на условиях MIT, чтобы приложение и пользователи могли их скачивать и устанавливать.

---

### 💬 Сообщество и автор
- Telegram-канал: [@RnPlugins](https://t.me/RnPlugins)
- Разработчик: [rooni.dev](https://rooni.dev)
