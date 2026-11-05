# Ελληνικά — Impara il Greco

A lightweight web application for learning **Modern Greek**, designed primarily for Italian speakers. It combines structured lessons, vocabulary practice, listening exercises, reading activities, and progress tracking in an installable Progressive Web App (PWA).

🔗 **Live repository:** https://github.com/kellocs02/ImparareIlGreco

## Features

- **Structured learning path** — lessons are organised into five progressive levels, from the Greek alphabet and pronunciation to verb tenses and more advanced sentence structures.
- **Greek alphabet and pronunciation** — explore the letters, their sounds, and common letter combinations (digraphs).
- **Vocabulary practice** — learn words grouped by topic, with Greek spelling, pronunciation guidance, and Italian translations.
- **Interactive exercises** — practise with multiple-choice questions, written answers, listening exercises, and sentence-ordering activities.
- **Spaced repetition** — review vocabulary using a Leitner-style system, with review intervals that increase as words become more familiar.
- **Reading practice** — short, level-based Greek texts with Italian translations.
- **Audio support** — use available audio recordings, with the device's Greek text-to-speech voice as a fallback.
- **Personal progress** — track daily goals, study streaks, completed units, test results, and achievements.
- **Personal vocabulary tools** — save favourite words, keep personal notes, and revisit difficult vocabulary.
- **Offline support** — the service worker caches the application so that core features remain available without an internet connection after the first successful load. Audio files are cached separately when available.
- **Installable PWA** — add the application to a compatible mobile device or desktop for an app-like experience.

## Technology

The project is built with standard web technologies and does not require a JavaScript framework or a build step.

- **HTML5** — application structure.
- **CSS3** — responsive interface and styling.
- **Vanilla JavaScript** — lessons, exercises, vocabulary, and application logic.
- **Web APIs** — Local Storage, Service Workers, Cache API, Web Audio / HTML Audio, and browser speech synthesis where supported.
- **Progressive Web App** — web app manifest, icons, and offline caching.

## Getting started

### Requirements

- A modern web browser.
- Python 3 (for the simple local development server), or another static HTTP server.

### Run locally

1. Clone the repository:

   ```bash
   git clone https://github.com/kellocs02/ImparareIlGreco.git
   ```

2. Move into the project directory:

   ```bash
   cd ImparareIlGreco
   ```

3. Start a local HTTP server:

   ```bash
   python -m http.server 8000
   ```

   On some systems, use `python3` instead of `python`.

4. Open the application in your browser:

   ```text
   http://localhost:8000
   ```

> **Note:** Open the app through `localhost` or an HTTPS host rather than directly opening `index.html`. Service Workers and PWA functionality require a secure context (with `localhost` treated as secure by browsers).

No dependency installation or compilation step is currently required.

## Project structure

```text
ImparareIlGreco/
├── audio/                 # Audio assets and audio index, when present
├── index.html             # Main HTML page and navigation
├── style.css              # Application styles
├── app.js                 # Main application logic and vocabulary/audio handling
├── data.js                # Alphabet, digraphs, and vocabulary data
├── lessons.js              # Lesson content organised by level
├── units.js                # Learning units and lesson grouping
├── path.js                 # Learning path and progression logic
├── progress.js             # Goals, statistics, achievements, and progress backup
├── ripasso.js              # Review exercises, favourites, and sentence ordering
├── letture.js              # Reading activities
├── extra.js                # Greek keyboard and update notification helpers
├── genera_audio.py         # Utility for generating audio assets
├── genera_lista.js         # Utility for generating the audio file list
├── manifest.webmanifest    # PWA metadata
├── sw.js                   # Service Worker and offline caching
├── icon.svg                # Application icon
├── icon-192.png            # PWA icon (192 × 192)
└── icon-512.png            # PWA icon (512 × 512)
```

## How progress is stored

Learning data is saved locally in the browser using **Local Storage**. This includes review history, vocabulary status, daily goals, streaks, achievements, and other learning preferences.

This means that progress is associated with the browser and device being used. Clearing browser data or switching browsers/devices may remove or make that progress unavailable. There is no account or cloud synchronisation layer in the current implementation.

## Offline behaviour

The Service Worker caches the main application files after the first successful visit. Audio assets use a separate cache so they do not need to be downloaded again whenever the application is updated.

For the best offline experience:

1. Open the application while connected to the internet.
2. Allow the initial load and caching process to finish.
3. Reopen the application after disconnecting from the internet.

Some browser-dependent features, such as speech synthesis, may behave differently depending on the device and installed Greek voices.

## Contributing

Suggestions, bug reports, and improvements are welcome. If you would like to contribute:

1. Fork the repository.
2. Create a feature branch.
3. Make and test your changes.
4. Open a pull request describing what changed.

When adding lessons or vocabulary, keep the existing data structures and level progression consistent.

## License

No license is currently specified in this repository. Unless a license is added, the default copyright rules apply: do not assume that the code or other project assets can be reused, modified, or redistributed.
