# 🎨 Wallify Repository

> **Wallify** — Create your own live wallpapers!
> Официальный открытый каталог живых обоев для Android-приложения **Wallify** от [Rooni](https://rooni.dev) ([@RnPlugins](https://t.me/RnPlugins)).

Каждый разработчик может выложить свои интерактивные живые обои на **HTML5 / CSS3 / JavaScript / Canvas / WebGL** в каталог приложения!

---

## 🚀 Как работает каталог и интеграция обоев?

Каждый комплект обоев может быть как отдельным веб-проектом, так и создаваться в **вашем собственном GitHub-репозитории** (например: `github.com/username/my-cool-wallpaper`).

В каталоге **Wallify-Repo** хранится единый индекс `index.json`, откуда приложение **Wallify** загружает список доступных обоев, их иконки, описания и ссылки на загрузку.

### Структура папки обоев:

```text
my-cool-wallpaper/
├── manifest.json       # Метаданные: название, автор, версия, логика
├── index.html          # Главная страница обоев
├── cover.jpg           # Превью-обложка (500x500 или 9:16)
├── icon.png            # Иконка обоев
└── settings/
    └── index.html      # (Опционально) Страница настроек обоев
```

---

## 📄 Формат `manifest.json`

```json
{
  "name": "Cyberpunk AI Clock",
  "author": "Rooni",
  "version": "1.0.0",
  "minAppVersion": "1.0.0",
  "description": "Интерактивные живые часы в стиле киберпанк с динамическими цветами Monet.",
  "main": "index.html",
  "cover": "cover.jpg",
  "icon": "icon.png",
  "useGyroscope": false,
  "settingsPath": "settings/index.html"
}
```

---

## ⚡ Доступ к API и событиям (`window.WallpaperEngine`)

Приложению доступен объект `window.WallpaperEngine` и следующие события:

```javascript
// 1. Системные цвета Monet и состояние замка
const metadata = window.WallpaperEngine.getMetadata();
console.log(metadata.theme); // 'dark' или 'light'
console.log(metadata.isUnlocked); // true (разблокирован) или false (экран блокировки)
console.log(metadata.accentColors.primary); // Системный акцент Monet (#6750A4)

// 2. События реального времени
window.addEventListener('wallpaperUpdate', (e) => {
    // Цвета или темы обновились
});

window.addEventListener('wallpaperGyroscope', (e) => {
    // Данные гироскопа (roll, pitch, x, y, z) - только если в manifest.json указан "useGyroscope": true
});

window.addEventListener('wallpaperOffset', (e) => {
    // Смещение рабочих столов лаунчера (detail.xOffset)
});

window.addEventListener('wallpaperScreenOn', () => {
    // Дисплей включился (отличный момент для прилёта элементов!)
});

window.addEventListener('wallpaperScreenOff', () => {
    // Дисплей выключился
});

window.addEventListener('wallpaperUnlock', (e) => {
    // Экран разблокирован
});

window.addEventListener('wallpaperPause', () => {
    // Анимации заморожены для экономии батареи
});

window.addEventListener('wallpaperResume', () => {
    // Анимации возобновлены
});
```

---

## 📤 Как добавить свои обои в каталог?

1. Создайте свой открытый GitHub-репозиторий с обоями (или папочку со своими обоями).
2. Сделайте **Fork** этого репозитория `Wallify-Repo`.
3. Добавьте запись о своих обоях в `index.json`.
4. Отправьте **Pull Request (PR)**!

### Как модерируются PR?
- Наш GitHub Actions бот автоматически проверит валидность `manifest.json`.
- После проверки PR одобряется и обои мгновенно появляются в приложении Wallify!
- Для обновления ваших обоев достаточно отправить короткий PR с новым номером версии `version` в `index.json`.

---

### 💬 Сообщество и автор
- Telegram канал: [@RnPlugins](https://t.me/RnPlugins)
- Автор: [rooni.dev](https://rooni.dev)
