# FocusFlow

A small cross-platform task manager built for the Cross Platform Development (CPD) Tiny Project. One Expo/React Native codebase runs on Android, iOS and the web.

## Features

- Dashboard with total, pending, completed, due-today and overdue counts
- Create, edit, complete and delete tasks
- Search and filter tasks by status, category and priority
- Optional due dates, notes and priorities
- Local persistence with AsyncStorage; no account or backend needed
- Empty states and input validation

## Requirements

- Node.js 20.19+ and npm
- Expo Go for phone testing, or a modern browser for web testing

## Run

```bash
npm install
npm run start
```

Scan the QR code with Expo Go. For a browser, press `w` in the Expo terminal or run `npm run web`. Android and iOS emulator shortcuts are available through Expo when configured.

## Demo walkthrough

1. Open **Home** and review the initial empty dashboard.
2. Tap **New task**. Add a title, category, priority, notes and an optional date in `YYYY-MM-DD` format.
3. Open **Tasks**. Search, filter, edit, mark complete and delete the task.
4. Return to **Home** to see the counts update. Relaunch the app to show local persistence.

## Structure

```text
focusflow/
  App.tsx             Screens and UI components
  src/tasks.ts        Task model, validation and statistics
  src/storage.ts      AsyncStorage persistence
  app.json            Expo configuration
  package.json        Dependencies and scripts
  README.md           Setup and demo guide
```

## Data flow

User action -> React state -> AsyncStorage -> restored state at launch. All data stays on the current device/browser. No network connection is required after dependencies are installed.

## Verification

Run `npm run typecheck`. Manually test the demo walkthrough on your target device. The project report lists detailed test cases. Actual device screenshots can be added to `assets/` after running the app.

## GitHub submission

Create a public repository, upload the entire `focusflow` folder contents (excluding ignored generated files), and confirm the repository can be opened while logged out. Add the accompanying PDF report to the repository or submission form as requested by faculty. This package does not include a live repository URL or claim that it has been submitted.

## References

- [Expo documentation](https://docs.expo.dev/)
- [React Native documentation](https://reactnative.dev/docs/getting-started)
- [AsyncStorage documentation](https://react-native-async-storage.github.io/async-storage/)
