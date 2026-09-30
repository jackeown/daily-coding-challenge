# Daily Coding Challenge

A static daily interview practice site. One problem appears each day. Monday is a warm-up; Sunday is the hardest day. The 42-problem schedule repeats every six weeks. The page shows today's difficulty and has an **Explore past puzzles** dialog for revisiting previous days. Light and dark modes are saved in the browser.

## Problem provenance

The problem statements, wording, and visible test cases in `problems.js` were written for this project. Most are adaptations of familiar LeetCode interview problems; `contracts.js` records the corresponding LeetCode problem number for each adaptation, and `challenge-data.js` provides direct links to the official problems. Two problems are original variations. The app does **not** pull LeetCode's daily challenge, statements, private tests, or submission API. It is a curated, finite problem set, not the full LeetCode catalog.

Each challenge has a named function and typed arguments. `contracts.js` converts the authored examples into function calls. `runtimes.js` provides starter code and in-editor test harnesses for Python, C++, C, Java, JavaScript, and Rust. C arrays use small `IntArray` / `StringArray` structs with `.data` and `.size`; matrices use `.rows` and `.size`. The tests are visible, so this is practice feedback rather than secure competition judging.

Every problem has an individual 1–5 chili rating. Seven challenges where a common naive approach is quadratic include a generated 50,000-item performance case in **Check all tests**. The harness measures the function call and marks it `TIMEOUT` after 1.2 seconds. The page stops waiting after 20 seconds overall. These are practice limits rather than a secure or perfectly calibrated judge; results can vary with OneCompiler's shared runners.

## Code execution and cost

The site uses the [OneCompiler embedded editor](https://onecompiler.com/apis/embed-editor), which OneCompiler currently says is **free to embed with unlimited code runs**. The site's selector offers only the six languages with guided tests. Code runs on OneCompiler's service, so an internet connection and its availability are required. There is no Judge0 integration, account, API key, backend, or billing integration in this project.

Browser drafts and solved days are stored locally in `localStorage`. The external editor loads from OneCompiler.

## Run and publish

Serve the folder over HTTP for local development:

```sh
python3 -m http.server 8000
```

Open `http://localhost:8000`. To publish on GitHub Pages, push the files to a repository and choose **Settings → Pages → Deploy from a branch → root**. No build step is needed.

## Files

- `index.html`, `style.css` — responsive interface
- `app.js` — schedule, editor messages, results, and local progress
- `problems.js` — original problem descriptions and visible tests
- `contracts.js` — function signatures, argument conversion, and inspiration numbers
- `challenge-data.js` — ratings, LeetCode links, and performance cases
- `runtimes.js` — language-specific stubs and test harnesses
