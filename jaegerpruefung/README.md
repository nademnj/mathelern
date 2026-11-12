# Jägerprüfung Trainer

A study app for the German hunting licence exam (Jägerprüfung). It is built for a learner who reads German slowly:

- **Sections**: the six written-exam subject areas (Sachgebiete). Each has lessons and a quiz.
- **Bilingual lessons**: the German original and an aligned English translation, paragraph by paragraph. There are four reading modes: side by side, German first (tap to reveal the English), German only, and English only. Key terms are underlined (hover for the English), and you can listen to the German.
- **Tutor chat**: Claude, with the lesson or quiz question you are on as context. Click "Ask the tutor about this" on any paragraph.
- **Quiz**: exam-style multiple choice where more than one answer can be correct. Questions you haven't seen or got wrong come first. The **mock exam** draws questions from every section and gives no feedback until you hand in.
- **Collector agent**: Claude with web search and web fetch. For one section it finds material (laws, the Landesjagdverband, DJV, FLI and similar sources), writes new German lessons with an English translation and source links, and adds quiz questions.

Progress is stored in your browser (localStorage). Content lives in `content/sections/*.json`.

## Setup

```bash
cd jaegerpruefung
npm install
cp .env.local.example .env.local   # add ANTHROPIC_API_KEY
npm run dev                        # http://localhost:3100
```

Lessons and quizzes work without a key. The tutor chat and the agent need `ANTHROPIC_API_KEY`.

## Collecting material with the agent

From the terminal:

```bash
npm run collect -- --section wildtierkunde --state Bayern --lessons 2
npm run collect -- --section waffen --focus "Ballistik und Zielfernrohre"
npm run collect -- --all --state Niedersachsen
```

You can also run it from the **Collector agent** page in the app. That page only works when `ALLOW_WEB_COLLECTOR=true` is set, because it writes files on the server. Leave it off on any public deployment. The page also needs a server with a writable disk, such as `npm run dev` or a self-hosted `npm start`; serverless hosts will not keep the new files.

Section ids: `wildtierkunde`, `jagdbetrieb`, `waffen`, `jagdhunde`, `wildbrethygiene`, `jagdrecht`.

How the agent works (`lib/agent/collector.ts`):

1. The agent receives the section, its research topics, the lessons that already exist, and your federal state.
2. It uses the server-side `web_search` and `web_fetch` tools to find and read sources.
3. It calls `save_lesson`, then `save_quiz_questions`. Their schemas are strict, and every input is checked again with zod before anything is written.
4. A lesson with an existing id replaces the old one. Quiz questions whose German text duplicates an existing question are skipped. Each write is atomic.

On copyright: statutes are public domain in Germany (§ 5 UrhG), so the agent quotes them verbatim and marks them as such. For every other source it writes its own German study text and links the original.

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Dev server on port 3100 |
| `npm run build` / `npm start` | Production build / server |
| `npm run collect -- …` | Run the collector agent |
| `npm run validate` | Validate all content files |
| `npm test` | Unit tests (quiz scoring, merge logic, agent loop with a mocked client, content files) |

## About the starter content

The starter lessons (`"origin": "seed"`) cover the core of each section. They were written from the Bundesjagdgesetz, the federal Jagdzeitenverordnung, the Waffengesetz/AWaffV and food-hygiene law. They follow **federal** law. Your state's Landesjagdgesetz may differ, for example on seasons, minimum district sizes, lead-free ammunition or night-vision devices. Run the agent with your `--state` to get state-specific material, and always check legal details against the official texts.
