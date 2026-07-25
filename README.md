# 🎨 Wallify Repository

> **Wallify** — Create your own live wallpapers!
> Официальный открытый каталог живых обоев для Android-приложения **Wallify** от [RnPlugins](https://t.me/RnPlugins) и [Rooni](https://rooni.dev).

Здесь любой разработчик может опубликовать свой интерактивный комплект обоев на **HTML5 / CSS3 / JavaScript / Canvas / WebGL**, с доступом к системной теме Material You (Monet) и внешним API (погода, нейросети, часы, курсы валют и музыка).

---

## 🚀 Как устроен комплект обоев?

Каждый комплект обоев представляет собой отдельную папку или ZIP-архив со следующей структурой:

```text
my-cool-wallpaper/
├── manifest.json       # Описание, автор, версия и точки входа
├── index.html          # Главная страница обоев
├── cover.jpg           # Обложка для каталога в приложении (500x500 или 9:16)
├── icon.png            # Миникарточка / Иконка обоев
└── settings/
    └── index.html      # (Опционально) Страница кастомных настроек обоев
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
  "settingsPath": "settings/index.html"
}
```

---

## ⚡ Доступ к API и Метаданным (`window.WallpaperEngine`)

В ваше HTML5 приложение автоматически внедряется объект `window.WallpaperEngine`:

```javascript
// 1. Получить текущие системные метаданные (Monet цвета, замок экрана, тема)
const metadata = window.WallpaperEngine.getMetadata();
console.log(metadata.theme); // 'dark' или 'light'
console.log(metadata.isUnlocked); // true (разблокирован) или false (экран блокировки)
console.log(metadata.accentColors.primary); // Системный акцентный цвет Monet (#6750A4)

// 2. Сохранить пользовательскую настройку обоев
window.WallpaperEngine.saveSetting('fps_limit', '60');

// 3. Считать сохранённую настройку
const myFps = window.WallpaperEngine.getSetting('fps_limit', '60');

// 4. События обновления в реальном времени:
window.addEventListener('wallpaperUpdate', (e) => {
    const data = e.detail;
    // Данные обновились (смена темы или цвета)
});

window.addEventListener('wallpaperScreenOn', () => {
    // Дисплей включился (отличный момент для прилёта элементов!)
});

window.addEventListener('wallpaperScreenOff', () => {
    // Дисплей выключился
});

window.addEventListener('wallpaperUnlock', (e) => {
    // Экран только что разблокировали пальцем/паролем
});

window.addEventListener('wallpaperPause', () => {
    // Обои поставлены на паузу (остановите анимации для экономии батареи)
});

window.addEventListener('wallpaperResume', () => {
    // Обои сняты с паузы
});
```

---

## 📤 Как добавить свои обои в этот каталог?

1. Сделайте **Fork** этого репозитория.
2. Создайте папку со своими обоями в директории `wallpapers/your-wallpaper-name/`.
3. Добавьте запись о своих обоях в `index.json`.
4. Отправьте **Pull Request (PR)**!

При отправке PR наш автоматический бот (GitHub Actions) быстро проверит корректность `manifest.json` и отсутствие опасных вызовов, после чего PR будет принят и опубликован в каталоге приложения!

---

### 💬 Сообщество и контакты
- Telegram канал: [@RnPlugins](https://t.me/RnPlugins)
- Автор: [rooni.dev](https://rooni.dev)
