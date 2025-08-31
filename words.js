// Static word-to-digits mapping. Edit this file to change labels or codes.
// Each entry: { word: string, digits: [d1, d2, d3, d4] } where each d is 0–9.
// You can add/remove entries; the UI adapts automatically.
// Optional `explanations: [e1,e2,e3,e4]` provide per‑digit context for the selected word.
// If omitted, the UI will show a simple fallback.
window.WORDS_DATA = [
  { word: 'Alpha',   digits: [1, 5, 3, 7], explanations: [
    'Baseline productivity uplift for the team.',
    'Confidence in suggested code quality.',
    'Adoption/usage consistency across repos.',
    'Developer sentiment and satisfaction level.'
  ] },
  { word: 'Bravo',   digits: [9, 2, 8, 4], explanations: [
    'Time saved on repetitive tasks.',
    'Review effort needed post-suggestion.',
    'Breadth of feature coverage.',
    'Onboarding acceleration for new devs.'
  ] },
  { word: 'Charlie', digits: [4, 6, 1, 9], explanations: [
    'Automation impact on delivery speed.',
    'Defect rate trends vs. baseline.',
    'Compliance with team conventions.',
    'Perceived cognitive load reduction.'
  ] },
  { word: 'Delta',   digits: [2, 7, 5, 3], explanations: [
    'Setup friction minimized by templates.',
    'Accuracy on complex refactors.',
    'Coverage of common workflows.',
    'Meeting flow interruptions avoided.'
  ] },
  { word: 'Echo',    digits: [8, 1, 0, 2], explanations: [
    'Reduced context switching during tasks.',
    'Edge case awareness in outputs.',
    'Manual steps still required.',
    'Editing iterations per change.'
  ] },
  { word: 'Foxtrot', digits: [3, 9, 7, 6], explanations: [
    'Learning curve for advanced usage.',
    'End‑to‑end task acceleration.',
    'Discovery of relevant examples.',
    'Stability of generated code.'
  ] },
  { word: 'Golf',    digits: [5, 4, 2, 1], explanations: [
    'Flow efficiency in IDE.',
    'Refinement needed after insert.',
    'Blocked time due to gaps.',
    'Dependency on human review.'
  ] },
  { word: 'Hotel',   digits: [7, 3, 9, 8], explanations: [
    'Throughput improvement in sprints.',
    'Complexity tolerance of suggestions.',
    'Reusable snippet library growth.',
    'Consistency across contributors.'
  ] },
  { word: 'India',   digits: [0, 8, 6, 5], explanations: [
    'Manual effort before using Copilot.',
    'Impact on review cycle time.',
    'Integration with existing tools.',
    'Resilience to ambiguous prompts.'
  ] },
  { word: 'Juliet',  digits: [6, 0, 4, 0], explanations: [
    'Test authoring speed boost.',
    'Security concerns introduced.',
    'Code reuse opportunities found.',
    'Rework caused by hallucinations.'
  ] }
];
