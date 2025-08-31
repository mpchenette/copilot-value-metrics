## Copilot Value Metrics Explorer

A tiny vanilla web app to explore SDLC metrics and how well they capture the impact of AI coding assistants across four categories: Ease of Gathering, Signal Strength, Resistance to Gaming, and Objectivity.

Features:
- Metric (word) wheel sorted by total score (descending)
- Four score wheels (1–10) displayed alongside category labels
- Inline total of the four category scores
- Per-category explanations in a consolidated details panel
- Accessible roles/labels with ARIA attributes

### Run locally

Open `index.html` directly in your browser or serve the folder. On macOS you can use Python’s simple server:

```zsh
python3 -m http.server --directory . 5173
```

Then visit:

```
http://localhost:5173/
```

Alternatively, in VS Code, use the Live Server extension and click “Go Live”.

### Files

- `index.html` – markup and containers
- `styles.css` – layout and visuals
- `script.js` – behavior, sorting, accessibility
- `words.js` – list of metrics with 4 scores (1–10) and explanations

### Configure metrics and scores

Edit `words.js` to control the selectable metrics and their four category scores. Example entry:

```
{
  word: 'PR Cycle Time',
  digits: [8, 7, 6, 8], // [Ease of Gathering, Signal Strength, Resistance to Gaming, Objectivity]
  explanations: [
    'Easily pulled from Git provider APIs.',
    'Shorter cycles typically reflect higher delivery velocity.',
    'Harder to game without broader process changes.',
    'Objective timestamps from system of record.'
  ]
}
```

Scores are clamped to the 1–10 range. You can add/remove entries; the UI adapts automatically.
