# Trivia Quiz

Викторина на React и TypeScript. Вопросы берутся из [Open Trivia DB](https://opentdb.com/api_config.php) (ключ не нужен).

## Запуск

```bash
npm install
npm run dev
```

## Команды

- `npm run dev` — dev-сервер Vite
- `npm run build` — проверка типов и production-сборка
- `npm run typecheck` — только проверка типов
- `npm test` — тесты один раз
- `npm run test:watch` — тесты в режиме наблюдения

## Структура

- `src/api` — запросы к Open Trivia DB, обработка сетевых ошибок
- `src/game` — чистая логика: состояние, очки, порядок вопросов
- `src/utils` — перемешивание ответов, декодирование HTML-сущностей
- `src/components` — React-компоненты экранов
- `src/test` — общая настройка тестов
