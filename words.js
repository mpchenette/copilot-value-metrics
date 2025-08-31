// SDLC metrics with four category scores per metric:
// [Ease of Gathering, Signal Strength, Resistance to Gaming, Objectivity]
// 1–10 scale where higher is better for each dimension.
window.WORDS_DATA = [
  {
    word: 'PR Cycle Time',
    digits: [8, 7, 6, 8],
    explanations: [
      'Easily pulled from Git provider APIs.',
      'Shorter cycles typically reflect higher delivery velocity.',
      'Harder (but possible) to game without broader process changes.',
      'Objective timestamps from system of record.'
    ]
  },
  {
    word: 'Lead Time for Changes',
    digits: [7, 8, 6, 8],
    explanations: [
      'Derivable from commit-to-deploy timestamps.',
      'Captures end-to-end delivery acceleration.',
      'Requires multi-stage gaming to manipulate.',
      'Based on automated system clocks.'
    ]
  },
  {
    word: 'Deployment Frequency',
    digits: [8, 6, 7, 9],
    explanations: [
      'Simple to count via CI/CD.',
      'Suggests flow efficiency but can mask batch size.',
      'Gaming requires risky behavior and is visible.',
      'Fully objective pipeline data.'
    ]
  },
  {
    word: 'MTTR (Recovery Time)',
    digits: [6, 7, 7, 8],
    explanations: [
      'Needs incident tracking integration.',
      'Reflects resilience and response speed.',
      'Difficult to game without falsifying incidents.',
      'Time-based from incident systems.'
    ]
  },
  {
    word: 'Review Iterations per PR',
    digits: [7, 6, 6, 8],
    explanations: [
      'Count comments/updates from PR history.',
      'Fewer iterations can correlate with quality and clarity.',
      'Moderately gameable by merging prematurely.',
      'Objective from PR metadata.'
    ]
  },
  {
    word: 'Suggestion Acceptance Rate',
    digits: [6, 7, 5, 6],
    explanations: [
      'Needs IDE telemetry or plugin data.',
      'Good proxy for usefulness of AI suggestions.',
      'Can be gamed by accepting low-value suggestions.',
      'Mostly objective counts, some client noise.'
    ]
  },
  {
    word: 'Time in Flow (Focus)',
    digits: [5, 7, 6, 5],
    explanations: [
      'Requires editor/OS signals; harder to gather.',
      'Strong signal for productivity and reduced context switching.',
      'Possible to game by staying active without output.',
      'Semi-objective; heuristics involved.'
    ]
  },
  {
    word: 'Bug Fix Rate',
    digits: [6, 7, 6, 7],
    explanations: [
      'Combine issue tracker + PR links.',
      'Captures throughput on corrective work.',
      'Gaming requires labeling tricks; detectable.',
      'Objective when linked properly.'
    ]
  },
  {
    word: 'Defect Escape Rate',
    digits: [5, 8, 8, 7],
    explanations: [
      'Needs reliable prod incident/bug tagging.',
      'Strong indicator of quality impact.',
      'Hard to hide; customer impact surfaces issues.',
      'Objective if taxonomy is consistent.'
    ]
  },
  {
    word: 'Test Coverage Delta',
    digits: [8, 6, 7, 8],
    explanations: [
      'Read from coverage reports each PR.',
      'Improving coverage often correlates with safety nets.',
      'Gaming via trivial tests is possible but reviewable.',
      'Reported by tooling; objective numbers.'
    ]
  },
  {
    word: 'Rework Percentage',
    digits: [5, 7, 6, 6],
    explanations: [
      'Requires diff/ownership analysis over time.',
      'Signals churn reduction from better first-pass quality.',
      'Could be gamed by splitting work unnaturally.',
      'Mostly objective but needs attribution logic.'
    ]
  },
  {
    word: 'Onboarding Time',
    digits: [5, 6, 7, 6],
    explanations: [
      'Mix of HR/manager input + system access logs.',
      'Reflects knowledge capture and self-serve docs aided by AI.',
      'Hard to game at scale; small sample risk.',
      'Semi-objective with some survey input.'
    ]
  },
  {
    word: 'PR Size (LOC) Delta',
    digits: [8, 5, 6, 8],
    explanations: [
      'Directly computed from diffs.',
      'Smaller, focused changes improve flow but signal is indirect.',
      'Gaming by splitting/combining changes is visible.',
      'Objective from git metadata.'
    ]
  },
  {
    word: 'Time to First Review',
    digits: [7, 6, 7, 8],
    explanations: [
      'Pull from PR event timestamps.',
      'Faster feedback loops correlate with higher throughput.',
      'Hard to game without reviewer buy-in.',
      'Objective from system of record.'
    ]
  },
  {
    word: 'Documented Decision Rate',
    digits: [4, 6, 7, 5],
    explanations: [
      'Requires ADRs or linking PRs to decisions.',
      'Better traceability is a positive signal.',
      'Difficult to game if enforced via templates.',
      'Semi-objective; presence vs. quality nuance.'
    ]
  }
];
