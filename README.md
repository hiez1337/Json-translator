# Translator++ Web (Gemini Edition)

[![React](https://img.shields.io/badge/React-19-blue?logo=react)](https://react.dev/)
[![Gemini API](https://img.shields.io/badge/Google-Gemini_2.5_Flash-orange?logo=google)](https://ai.google.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org/)

<!-- LANGUAGE SWITCHER -->
<div align="center">
  <h3>
    <a href="#english">🇺🇸 English</a> | <a href="#russian">🇷🇺 Русский</a>
  </h3>
</div>

---

<a name="english"></a>
## 🇺🇸 English

**Translator++ Web** is a powerful web-based tool for game and text localization, inspired by the original Translator++ by DreamSavior. It leverages the speed and context window of **Google Gemini 2.5 Flash** to provide high-quality batch translations while preserving game-specific formatting codes.

### ✨ Key Features

*   **🚀 Batch AI Translation**
    *   Uses `gemini-2.5-flash` for high-speed processing.
    *   Sends multiple rows in a single API request to save time.
    *   **Strict Tag Preservation**: Keeps RPG Maker/Unity tags (`\V[1]`, `<br>`, `{0}`) intact via system prompting.
*   **🧠 Smart Deduplication**
    *   **Cost Efficiency**: Identifies duplicate source texts automatically. Only *unique* strings are sent to the AI, saving API tokens.
    *   **Auto-Propagation**: Editing one translation automatically updates all other rows with the same original text.
*   **📂 Complex JSON Import/Export**
    *   Supports simple Key-Value JSONs.
    *   **Column Mapper**: Automatically detects and handles complex arrays of objects (e.g., RPG Maker data). Allows you to map `ID`, `Source`, and `Target` columns.
*   **⚡ High Performance**
    *   **Virtual Scrolling**: Renders massive datasets (50,000+ lines) smoothly without lagging the browser.
*   **🛠 Tools & Utilities**
    *   **Search**: Real-time filtering by Original, Translation, or Context.
    *   **Debug Console**: Built-in logger to inspect raw API requests/responses and errors.
    *   **View Options**: Adjustable font size and text wrapping toggles.
    *   **Selection Mode**: Batch translate specific selected rows.

### 📦 Installation & Setup

1.  **Clone the repository**
2.  **Install dependencies**
    ```bash
    npm install
    ```
3.  **Configure API Key**
    Create a `.env` file in the root directory:
    ```env
    API_KEY=your_google_gemini_api_key_here
    ```
4.  **Start the app**
    ```bash
    npm start
    ```

### 📖 Usage Guide

1.  **Import**: Click the Upload icon. Select a JSON file.
    *   If the file is complex, the **Import Mapper** will appear. Select which field contains the original text and where to save the translation.
2.  **Translate**:
    *   **Auto**: Click "AI Translate" to translate all empty rows.
    *   **Manual**: Click "AI Translate" while rows are selected to translate only those.
3.  **Edit**: Click on any translation cell to edit manually. Changes propagate to duplicates.
4.  **Debug**: Click the 🐞 (Bug) icon to open the console and see what data is being sent to Gemini.
5.  **Export**: Click the Download icon to save the JSON with the same structure as the import.

---

<a name="russian"></a>
## 🇷🇺 Русский

**Translator++ Web** — это мощный веб-инструмент для локализации игр и текстов, вдохновленный оригинальным Translator++ от DreamSavior. Приложение использует скорость и контекстное окно **Google Gemini 2.5 Flash** для обеспечения качественного пакетного перевода с сохранением тегов форматирования.

### ✨ Основные возможности

*   **🚀 Пакетный AI Перевод**
    *   Использует `gemini-2.5-flash` для высокой скорости.
    *   Отправляет множество строк в одном запросе API.
    *   **Сохранение тегов**: Строго сохраняет теги RPG Maker/Unity (`\V[1]`, `<br>`, `{0}`) благодаря системным промптам.
*   **🧠 Умная Дедупликация (Smart Deduplication)**
    *   **Экономия**: Автоматически находит повторяющиеся исходные тексты. В AI отправляются только *уникальные* строки, что экономит токены и деньги.
    *   **Авто-распространение**: При ручном редактировании одной ячейки перевод автоматически применяется ко всем дубликатам.
*   **📂 Импорт/Экспорт сложного JSON**
    *   Поддержка простых Key-Value JSON файлов.
    *   **Маппер колонок**: Автоматически определяет сложные массивы объектов (например, данные RPG Maker). Позволяет выбрать поля для `ID`, `Оригинала` и `Перевода`.
*   **⚡ Высокая производительность**
    *   **Виртуальный скроллинг**: Плавная работа с огромными файлами (50,000+ строк) без зависаний браузера.
*   **🛠 Инструменты**
    *   **Поиск**: Фильтрация в реальном времени по Оригиналу, Переводу или Контексту.
    *   **Консоль отладки**: Встроенный логгер для просмотра сырых запросов/ответов API и ошибок (кнопка с жуком).
    *   **Настройки вида**: Изменение размера шрифта и перенос строк (Word Wrap).
    *   **Режим выбора**: Пакетный перевод только выделенных галочками строк.

### 📦 Установка и Запуск

1.  **Склонируйте репозиторий**
2.  **Установите зависимости**
    ```bash
    npm install
    ```
3.  **Настройка API ключа**
    Создайте файл `.env` в корневой папке:
    ```env
    API_KEY=ваш_ключ_google_gemini
    ```
4.  **Запуск**
    ```bash
    npm start
    ```

### 📖 Руководство пользователя

1.  **Импорт**: Нажмите иконку загрузки. Выберите JSON файл.
    *   Если структура файла сложная, откроется **Маппер (Import Mapper)**. Выберите, в каком поле лежит оригинал, и куда записывать перевод.
2.  **Перевод**:
    *   **Авто**: Нажмите "AI Перевод", чтобы перевести все пустые строки.
    *   **Выборочно**: Выделите галочками нужные строки и нажмите "Перевод (N)", чтобы обработать только их.
3.  **Редактирование**: Кликните по ячейке перевода для ручной правки. Изменения применятся ко всем дубликатам этого текста.
4.  **Отладка**: Нажмите иконку 🐞 (Жук), чтобы открыть консоль и проверить, какие данные уходят в Gemini.
5.  **Экспорт**: Нажмите иконку скачивания, чтобы сохранить JSON с той же структурой, что и при импорте.
