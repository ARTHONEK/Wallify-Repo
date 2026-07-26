## 🎨 Заявка на добавление обоев в каталог

### 📋 Информация об обоях:
- **Название (`name`, одинаковое в `manifest.json` и `index.json`):**
- **Идентификатор (`id` / имя папки):**
- **Автор (Никнейм / Telegram):**
- **Версия:**
- **Краткое описание:**

---

### ✅ Чек-лист перед отправкой PR:

**Каталог**
- [ ] Комплект лежит в `wallpapers/<id>/`, запись добавлена в `index.json`.
- [ ] `name`, `author`, `version` и `useGyroscope` совпадают в `manifest.json` и `index.json`.
- [ ] Указан `downloadUrl` вида `https://github.com/YouRooni/Wallify-Repo/releases/download/bundles/<id>.zip`.
- [ ] Заполнены `createdAt`, `updatedAt` и `isLite`, обновлён `updatedAt` в корне `index.json`.
- [ ] Локально прошла проверка `python3 scripts/validate_catalog.py`.

**Комплект**
- [ ] Есть `manifest.json` с `minAppVersion`.
- [ ] Есть обложка `cover.png` (или `cover.jpg` / `cover.webp`).
- [ ] Есть `README.md` комплекта.
- [ ] Если есть страница настроек — она объявлена в `settingsPath`.

**Код**
- [ ] Нет майнинг-скриптов, обфускации, сбора данных и обращений к сети.
- [ ] Обрабатываются события `wallpaperPause` и `wallpaperResume`.
- [ ] Канвас не уменьшается собственным коэффициентом поверх настройки «Качество рендеринга».
- [ ] Если обои зависят от касаний или гироскопа — это написано в `README.md` комплекта.
- [ ] Проверено на реальном устройстве (особенно если используется WebGL).
