# Trivia Quiz

A quiz built with React and TypeScript. Questions come from [Open Trivia DB](https://opentdb.com/api_config.php) (no API key needed).

## Features

- Choose a category, difficulty, question type and number of questions
- Loading and error screens, with retry
- Shuffled answers, correct and wrong answers are highlighted
- A countdown timer for every question
- Score and a result screen at the end

## Getting started

```bash
npm install
npm run dev
```

## Scripts

- `npm run dev` - start the Vite dev server
- `npm run build` - type-check and build for production
- `npm run typecheck` - type-check only
- `npm test` - run the tests once
- `npm run test:watch` - run the tests in watch mode

## Project structure

- `src/types` - shared types (API responses, questions, game state and actions)
- `src/utils` - pure helpers: `shuffle`, `decodeHtml`, `buildAnswers`
- `src/game` - pure game logic: `gameReducer`, `gameState`, `scoring`, `gameConfig`
- `src/api` - requests to Open Trivia DB and `TriviaApiError`
- `src/hooks` - `useCategories`, `useQuestions`, `useCountdown`
- `src/components` - screens: setup, loading, error, question, result, and `AnswerButton`
- `src/test` - test setup and factories shared by the tests

## How it works

All game state lives in one reducer (`gameReducer`) in `App`. The status is one of `setup`, `loading`, `question`, `finished` or `error`, and `App` renders the screen for the current status. Components only show data and dispatch actions. The network request is started by `useQuestions` when the status becomes `loading`.
