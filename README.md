# FocusFlow

A cross-platform task manager for the CPD Tiny Project. One Expo and React Native codebase runs on Android, iOS and web.

## Features

- Dashboard for total, pending, completed, due-today and overdue tasks
- Create, edit, complete and delete tasks
- Search and filter by status, category and priority
- Optional notes and due dates, with input validation
- Local task storage with AsyncStorage; no account or backend

## Requirements

Node.js 20.19 or newer, npm, and Expo Go for phone testing or a modern web browser.

## Run

1. Run `npm install` in the project directory.
2. Run `npm run start`.
3. Scan the QR code with Expo Go, or press `w` to open the web app.
4. Run `npm run typecheck` to check the TypeScript source.

## Demo

Create a task with a title, category, priority and due date. Search and filter it on the Tasks screen, edit it, mark it complete, and confirm that dashboard counts change. Relaunch the app to demonstrate local persistence.

## Project files

- `App.tsx`: screens, task cards, forms and navigation
- `src/tasks.ts`: task model, date validation and statistics
- `src/storage.ts`: AsyncStorage read and write
- `app.json`: Expo settings
- `package.json` and `package-lock.json`: dependencies and scripts

## GitHub submission

Source code: https://github.com/krzshnz/focusflow-cpd . The PDF project report is kept out of this repository. Submit it separately if faculty requests it.

## References

- https://docs.expo.dev/
- https://reactnative.dev/docs/getting-started
- https://react-native-async-storage.github.io/async-storage/
