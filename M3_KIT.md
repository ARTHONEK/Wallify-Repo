# 📦 Wallify M3 UI Kit — Руководство разработчика

Привет! Это официальное руководство по **Wallify M3 Kit** — встроенному в приложение Wallify набору компонентов в стиле Material Design 3 (Material You).

M3 Kit предназначен для создания красивых, современных экранов настроек (`settings/index.html`) и элементов интерфейса ваших обоев. Он автоматически подстраивается под системную палитру устройств на Android 12+ (`accentColors`).

---

## 🚀 Как использовать M3 Kit

### ⚡ Автоматическая интеграция в приложении

**Приложение Wallify автоматически инжектирует стили `wallify-m3.css` и скрипт `wallify-m3.js` в WebView** при загрузке обоев и страницы настроек!

Это значит, что разработчику обоев **не обязательно** вручную подключать JS/CSS файлы — достаточно просто использовать в своей HTML-разметке атрибут `data-wallify-m3="..."`.

### 💻 Локальная разработка и отладка (в браузере)

Исходные файлы UI Kit доступны прямо в репозитории в папке **[`ui-kit/`](ui-kit/)**:
- [`ui-kit/wallify-m3.css`](ui-kit/wallify-m3.css) — стили компонентов и CSS-переменные
- [`ui-kit/wallify-m3.js`](ui-kit/wallify-m3.js) — JS-скрипт инициализации и обработки палитры

Если вы верстаете и тестируете страницу настроек локально в браузере на ПК, скопируйте эти два файла из папки `ui-kit/` в папку настроек вашего комплекта `settings/` и подключите их в `settings/index.html`:

```html
<!doctype html>
<html lang="ru">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <!-- Подключаем для отображения стилей при верстке в браузере -->
  <link rel="stylesheet" href="wallify-m3.css">
</head>
<body>
  <!-- Разметка настроек M3 -->
  
  <script src="wallify-m3.js"></script>
</body>
</html>
```

При открытии в самом приложении Wallify движок безопасно применит актуальную версию UI Kit, обеспечив единый вид всех настроек.

---

## 🎨 Динамические цвета Material You

Скрипт `wallify-m3.js` автоматически подписывается на события `wallpaperEngineReady` и `wallpaperUpdate`. При изменении системных цветов или переключении темы (светлая / тёмная) Kit автоматически обновляет CSS-переменные в `:root`:

| CSS-переменная | Назначение |
|---|---|
| `--wallify-m3-primary` | Главный акцентный цвет (кнопки, активные треки слайдеров, тумблеры) |
| `--wallify-m3-on-primary` | Текст и иконки поверх `primary` |
| `--wallify-m3-primary-container` | Главный контейнер (тональные кнопки) |
| `--wallify-m3-secondary-container` | Вторичный контейнер (иконки в списках, чипы) |
| `--wallify-m3-surface-container` | Фон карточек и секций настроек |
| `--wallify-m3-on-surface` | Основной цвет текста |
| `--wallify-m3-on-surface-variant` | Вторичный цвет текста (описания, сноски) |
| `--wallify-m3-outline` | Цвет границ и нейтральных рамок |
| `--wallify-m3-outline-variant` | Тонкие разделители (`divider`) |

Вы можете использовать эти переменные в собственных стилях страницы!

---

## 🧱 Компоненты интерфейса

### 1. Карточки и Секции (`card` / `card-group`)

Элементы управления группируются в скруглённые карточки в стиле настроек Android.

- **Одиночная карточка**:
  ```html
  <section data-wallify-m3="card">
    <!-- Контент настройки -->
  </section>
  ```

- **Группа карточек (`card-group`)**:
  Если нужно объединить несколько карточек в единый блок со скруглёнными внешними краями и практически незаметными зазорами (4px):
  ```html
  <div data-wallify-m3="card-group">
    <section data-wallify-m3="card">Настройка 1</section>
    <section data-wallify-m3="card">Настройка 2</section>
    <section data-wallify-m3="card">Настройка 3</section>
  </div>
  ```

---

### 2. Вспомогательная строка (`row`)

Позволяет аккуратно выровнять иконку, заголовок, описание и тумблер в одну линию:

```html
<section data-wallify-m3="card">
  <div class="row">
    <div class="row-icon">⚡</div>
    <div class="row-content">
      <div class="row-title">Анимация частиц</div>
      <div class="row-desc">Включить динамическое движение фоновых объектов</div>
    </div>
    <input type="checkbox" data-wallify-m3="switch" id="particlesToggle">
  </div>
</section>
```

---

### 3. Переключатель / Тумблер (`switch`)

Превращает обычный `<input type="checkbox">` в стилизованный Switch Material 3.

```html
<input type="checkbox" data-wallify-m3="switch" id="mySwitch">
```

**Пример логики сохранения:**
```javascript
const switchEl = document.getElementById('mySwitch');

// Загрузка
switchEl.checked = window.WallpaperEngine.getSetting('enableParticles', 'true') === 'true';

// Сохранение
switchEl.addEventListener('change', () => {
  window.WallpaperEngine.saveSetting('enableParticles', switchEl.checked);
});
```

---

### 4. Слайдер / Ползунок (`slider`)

Поддерживает стандартный ползунок Android 14/15 (с зазорами вокруг thumb) и точки деления для дискретных значений.

- **Плавный (непрерывный) слайдер**:
  ```html
  <input type="range" data-wallify-m3="slider" min="0" max="100" value="50" id="speedRange">
  ```

- **Дискретный слайдер (с точками шагов)**:
  Добавьте атрибут `step`:
  ```html
  <input type="range" data-wallify-m3="slider" min="1" max="10" step="1" value="4" id="countRange">
  ```

---

### 5. Кнопки (`button`)

Все кнопки оснащены эффектом нажатия (Material Ripple Ink).

```html
<!-- Главная акцентная кнопка -->
<button data-wallify-m3="button">Применить</button>

<!-- Тональная кнопка -->
<button data-wallify-m3="tonal-button">Сбросить</button>

<!-- Контурная кнопка -->
<button data-wallify-m3="outlined-button">Очистить кэш</button>

<!-- Третичная кнопка -->
<button data-wallify-m3="tertiary-button">Дополнительно</button>

<!-- Текстовая без рамок -->
<button data-wallify-m3="tertiary-text-button">Связаться с автором</button>
```

---

### 6. Разделитель (`divider`)

```html
<hr data-wallify-m3="divider">
```

---

## 🛠 JS API (`window.WallifyM3`)

Скрипт `wallify-m3.js` экспортирует объект `window.WallifyM3`:

- `WallifyM3.refresh(root)` — принудительно обновить и инициализировать компоненты M3 в указанном `root` (по умолчанию `document`). Обычно вызывать не требуется, так как в скрипт встроен `MutationObserver`.
- `WallifyM3.setColors(palette)` — принудительно установить свой набор HEX-цветов Material You.

---

## 💡 Как правильно верстать настройки

1. **Не задавайте белый или чёрный фон явно** (`#ffffff` / `#000000`). Используйте `var(--wallify-m3-background)` или `var(--wallify-m3-surface-container)` для `body`.
2. **Используйте `WallpaperEngine.saveSetting()`** при каждом изменении элемента интерфейса, чтобы обои на рабочем столе мгновенно обновлялись без перезагрузки.
3. **Импорт изображений**: Для загрузки пользовательских картинок используйте `window.WallpaperEngine.importFile('image/*')`.
