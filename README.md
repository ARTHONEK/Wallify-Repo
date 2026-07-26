# 🎨 Wallify Repository

> **Wallify** — Create your own live wallpapers!
> Официальный открытый каталог живых обоев для Android-приложения **Wallify** от [Rooni](https://rooni.dev) ([@RnPlugins](https://t.me/RnPlugins)).

Каждый разработчик может выложить свои интерактивные живые обои на **HTML5 / CSS3 / JavaScript / Canvas / WebGL** в каталог приложения!

> [!IMPORTANT]
> 📖 **[Полное техническое руководство разработчика обоев (WALLPAPER_API.md)](WALLPAPER_API.md)**
> Для получения подробных сведений о работе движка, метаданных, локальном HTTP-сервере, Material You палитре и хранилище настроек изучите файл [`WALLPAPER_API.md`](WALLPAPER_API.md).

---

## 🚀 Как работает каталог и интеграция обоев?

Каждый комплект обоев представляет собой независимый HTML5-проект с файлом `manifest.json`.

В репозитории **Wallify-Repo** хранится единый индекс [`index.json`](index.json), откуда приложение **Wallify** загружает каталог доступных обоев, их обложки, описания и версии.

### Структура папки обоев:

```text
my-cool-wallpaper/
├── manifest.json       # Метаданные: название, автор, версия, параметры
├── index.html          # Главная страница обоев (точка входа)
├── cover.jpg           # Превью-обложка обоев (500x500 или 9:16)
├── icon.png            # Иконка обоев (если нет обложки)
└── settings/
    └── index.html      # (Опционально) Страница настроек обоев
```

---

## 📄 Формат `manifest.json`

```json
{
  "name": "Material 3 Shapes",
  "description": "Плавающие фигуры в палитре системы Monet",
  "author": "Rooni",
  "version": "1.2.0",
  "minAppVersion": ">=1.0.0",
  "cover": "cover.jpg",
  "icon": "icon.png",
  "main": "index.html",
  "settingsPath": "settings/index.html",
  "useGyroscope": false,
  "isLite": false
}
```

---

## ⚡ Доступ к API и событиям (`window.WallpaperEngine`)

После загрузки страницы движок предоставляет глобальный объект `window.WallpaperEngine` и отправляет событие `wallpaperEngineReady`:

```javascript
// 1. Инициализация при готовности движка
window.addEventListener('wallpaperEngineReady', (e) => {
    const metadata = e.detail;
    console.log(metadata.theme); // 'dark' или 'light'
    console.log(metadata.isUnlocked); // true (разблокирован) или false (экран блокировки)
    console.log(metadata.accentColors.primary); // Системный акцент Material You / Monet (#D0BCFF)
});

// 2. Работа с настройками
const engine = window.WallpaperEngine;
if (engine) {
    const speed = engine.getSetting('speed', 'normal');
    engine.saveSetting('speed', 'fast');
}

// 3. Основные события реального времени
window.addEventListener('wallpaperUpdate', (e) => {
    // Изменение темы, цветов или разблокировки
});

window.addEventListener('wallpaperGyroscope', (e) => {
    // Данные акселерометра/гироскопа (pitch, roll, x, y, z) - если в manifest.json указано "useGyroscope": true
});

window.addEventListener('wallpaperOffset', (e) => {
    // Пролистывание рабочих столов (detail.xOffset)
});

window.addEventListener('wallpaperPause', () => {
    // Обои поставлены на паузу (заморозка анимаций для сохранения заряда)
});

window.addEventListener('wallpaperResume', () => {
    // Возобновление анимации
});
```

---

## 📤 Как добавить свои обои в каталог?

1. Создайте папку со своими обоями (или репозиторий).
2. Сделайте **Fork** этого репозитория `Wallify-Repo`.
3. Добавьте свои обои в папку `wallpapers/<id-обоев>/` и внесите запись в `index.json`.
4. Отправьте **Pull Request (PR)**!

---

### 💬 Сообщество и автор
- Telegram-канал: [@RnPlugins](https://t.me/RnPlugins)
- Разработчик: [rooni.dev](https://rooni.dev)
