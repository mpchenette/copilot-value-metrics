// Copilot value metrics data with effectiveness scores and detailed information
const copilotMetrics = [
    {
        id: 1,
        title: "Developer Velocity",
        score: 10,
        category: "Productivity",
        shortDescription: "Measures code completion acceptance rate and time savings per developer",
        fullDescription: "Developer velocity tracks how much faster developers can write code with Copilot's assistance. This includes measuring code completion acceptance rates, time to complete coding tasks, and overall productivity improvements.",
        whyValuable: "This is the most direct measure of Copilot's immediate impact. High acceptance rates and measurable time savings clearly demonstrate value and ROI.",
        howToMeasure: [
            "Track code completion acceptance percentage",
            "Measure time to complete specific coding tasks",
            "Compare coding speed before and after Copilot adoption",
            "Monitor lines of code written per hour/day"
        ],
        limitations: "Velocity alone doesn't account for code quality. Fast code that introduces bugs may not provide real value."
    },
    {
        id: 2,
        title: "Code Quality Metrics",
        score: 9,
        category: "Quality",
        shortDescription: "Tracks bugs per line of code, code complexity, and maintainability scores",
        fullDescription: "Code quality metrics evaluate whether Copilot-assisted code maintains or improves overall code standards. This includes bug density, cyclomatic complexity, code duplication, and maintainability indices.",
        whyValuable: "Ensures that increased velocity doesn't come at the cost of quality. High-quality code reduces long-term maintenance costs and technical debt.",
        howToMeasure: [
            "Calculate bugs per 1000 lines of code",
            "Measure cyclomatic complexity scores",
            "Track code duplication percentages",
            "Monitor technical debt ratios",
            "Analyze code review feedback quality"
        ],
        limitations: "Quality metrics can be subjective and may not capture all aspects of code maintainability. Some quality issues only emerge over time."
    },
    {
        id: 3,
        title: "Time to First Commit",
        score: 8,
        category: "Onboarding",
        shortDescription: "Measures how quickly new developers make their first meaningful contribution",
        fullDescription: "Time to first commit tracks how Copilot accelerates new developer onboarding by helping them understand codebases faster and make productive contributions sooner.",
        whyValuable: "Reduced onboarding time has significant cost implications and improves team productivity. Copilot can help new hires become productive faster by providing contextual code suggestions.",
        howToMeasure: [
            "Track days from hire date to first merged PR",
            "Measure time to complete onboarding tasks",
            "Compare onboarding metrics before/after Copilot",
            "Survey new developers on confidence levels"
        ],
        limitations: "Onboarding speed varies greatly by individual and role complexity. External factors like team mentorship also significantly impact this metric."
    },
    {
        id: 4,
        title: "Pull Request Lead Time",
        score: 8,
        category: "Delivery",
        shortDescription: "Tracks time from PR creation to merge, indicating delivery speed",
        fullDescription: "PR lead time measures the complete cycle from when a developer creates a pull request to when it's merged into the main branch. Copilot can reduce this by improving initial code quality and reducing review cycles.",
        whyValuable: "Faster PR cycles mean faster feature delivery and reduced work-in-progress. This directly impacts business value delivery and team efficiency.",
        howToMeasure: [
            "Calculate average hours/days from PR creation to merge",
            "Track number of review cycles per PR",
            "Measure time spent in different PR states",
            "Monitor PR approval rates"
        ],
        limitations: "Lead time can be affected by many factors outside of code quality, including reviewer availability, complexity of changes, and organizational processes."
    },
    {
        id: 5,
        title: "Code Coverage",
        score: 7,
        category: "Quality",
        shortDescription: "Percentage of code covered by automated tests",
        fullDescription: "Code coverage measures what percentage of your codebase is covered by automated tests. Copilot can help developers write tests more efficiently and maintain high coverage standards.",
        whyValuable: "Higher test coverage generally correlates with fewer production bugs and easier refactoring. Copilot can make test writing faster and more comprehensive.",
        howToMeasure: [
            "Track overall test coverage percentage",
            "Monitor coverage trends over time",
            "Measure coverage for new code vs existing code",
            "Analyze coverage by component/module"
        ],
        limitations: "High coverage doesn't guarantee good tests. Coverage metrics can be gamed, and 100% coverage isn't always practical or valuable."
    },
    {
        id: 6,
        title: "Documentation Quality",
        score: 7,
        category: "Knowledge",
        shortDescription: "Measures completeness and quality of code documentation",
        fullDescription: "Documentation quality tracks how well code is documented, including inline comments, README files, and API documentation. Copilot can help generate and maintain better documentation.",
        whyValuable: "Good documentation reduces onboarding time, improves maintainability, and helps knowledge transfer. Copilot can make documentation creation less burdensome.",
        howToMeasure: [
            "Track percentage of functions with documentation",
            "Measure documentation completeness scores",
            "Monitor README and API doc updates",
            "Survey developers on documentation usefulness"
        ],
        limitations: "Documentation quality is highly subjective. Metrics may not capture whether documentation is actually helpful or just extensive."
    },
    {
        id: 7,
        title: "Feature Delivery Frequency",
        score: 6,
        category: "Delivery",
        shortDescription: "How often new features are shipped to production",
        fullDescription: "Feature delivery frequency measures how often your team ships new features or improvements to production. Copilot should enable faster feature development and more frequent releases.",
        whyValuable: "Frequent delivery enables faster feedback loops, reduced risk per release, and better responsiveness to user needs.",
        howToMeasure: [
            "Count features/releases per week/month",
            "Track time from feature request to production",
            "Measure deployment frequency",
            "Monitor feature flag usage and rollouts"
        ],
        limitations: "Delivery frequency can be limited by factors outside of development speed, such as business processes, compliance requirements, and market timing."
    },
    {
        id: 8,
        title: "Developer Satisfaction",
        score: 6,
        category: "Experience",
        shortDescription: "Survey-based metric measuring developer happiness and tool satisfaction",
        fullDescription: "Developer satisfaction surveys measure how developers feel about their tools, productivity, and overall work experience. Copilot should improve developer satisfaction by reducing tedious work.",
        whyValuable: "Happy developers are more productive, stay longer, and produce better work. Developer satisfaction directly impacts retention and recruitment.",
        howToMeasure: [
            "Regular developer satisfaction surveys",
            "Net Promoter Score for development tools",
            "Retention rates and turnover analysis",
            "Exit interview feedback about tools"
        ],
        limitations: "Satisfaction is subjective and influenced by many factors beyond tools. Survey responses may not always correlate with actual productivity improvements."
    },
    {
        id: 9,
        title: "API Design Consistency",
        score: 5,
        category: "Quality",
        shortDescription: "Measures consistency in API design patterns and conventions",
        fullDescription: "API design consistency tracks how well your codebase follows established patterns and conventions for APIs. Copilot can help maintain consistency by suggesting patterns it has learned.",
        whyValuable: "Consistent APIs are easier to use, understand, and maintain. They reduce cognitive load for developers and improve overall system architecture.",
        howToMeasure: [
            "Automated analysis of API patterns",
            "Style guide compliance checking",
            "Review feedback on API consistency",
            "Documentation pattern adherence"
        ],
        limitations: "Consistency metrics may prioritize conformity over innovation. Copilot might perpetuate existing patterns rather than suggesting improvements."
    },
    {
        id: 10,
        title: "Mean Time to Recovery (MTTR)",
        score: 4,
        category: "Reliability",
        shortDescription: "Average time to fix production issues and restore service",
        fullDescription: "MTTR measures how quickly your team can identify, diagnose, and fix production issues. Copilot might help with faster debugging and issue resolution.",
        whyValuable: "Faster recovery times reduce business impact of outages and improve customer satisfaction. Quick issue resolution is critical for system reliability.",
        howToMeasure: [
            "Track time from incident detection to resolution",
            "Measure time to identify root causes",
            "Monitor time spent on debugging vs fixing",
            "Analyze incident response effectiveness"
        ],
        limitations: "MTTR is heavily influenced by system architecture, monitoring capabilities, and operational processes. Copilot's impact on incident response may be limited."
    },
    {
        id: 11,
        title: "Technical Debt Ratio",
        score: 4,
        category: "Maintenance",
        shortDescription: "Ratio of effort needed to fix problems vs adding new features",
        fullDescription: "Technical debt ratio measures how much development effort goes toward fixing existing problems versus building new features. Copilot could help reduce debt by improving initial code quality.",
        whyValuable: "Lower technical debt means more resources available for innovation and new features. High debt slows down development and increases maintenance costs.",
        howToMeasure: [
            "Track time spent on bug fixes vs new features",
            "Monitor code complexity trends",
            "Analyze refactoring frequency and scope",
            "Measure effort required for system changes"
        ],
        limitations: "Technical debt is often accumulated over long periods and influenced by business pressures. Copilot's impact may not be immediately visible in this metric."
    },
    {
        id: 12,
        title: "Security Vulnerability Rate",
        score: 3,
        category: "Security",
        shortDescription: "Number of security issues found per lines of code written",
        fullDescription: "Security vulnerability rate tracks how many security issues are introduced in code. While Copilot might help with some security patterns, it could also suggest vulnerable code from its training data.",
        whyValuable: "Fewer security vulnerabilities reduce risk, compliance costs, and potential business impact from security incidents.",
        howToMeasure: [
            "Security scan results per KLOC",
            "Vulnerability discovery rates",
            "Time to patch security issues",
            "Security review feedback trends"
        ],
        limitations: "Copilot may sometimes suggest code patterns that contain security vulnerabilities from its training data. This metric requires careful analysis of Copilot's security impact."
    }
];

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    renderMetrics();
    setupModal();
});

function renderMetrics() {
    const container = document.getElementById('metricsContainer');
    
    // Sort metrics by score (highest first)
    const sortedMetrics = [...copilotMetrics].sort((a, b) => b.score - a.score);
    
    sortedMetrics.forEach(metric => {
        const metricCard = createMetricCard(metric);
        container.appendChild(metricCard);
    });
}

function createMetricCard(metric) {
    const card = document.createElement('div');
    card.className = 'metric-card';
    card.dataset.metricId = metric.id;
    
    card.innerHTML = `
        <div class="metric-header">
            <div class="metric-title">${metric.title}</div>
            <div class="metric-score score-${metric.score}">${metric.score}</div>
        </div>
        <div class="metric-description">${metric.shortDescription}</div>
        <div class="metric-category">${metric.category}</div>
    `;
    
    card.addEventListener('click', () => openMetricModal(metric));
    
    return card;
}

function openMetricModal(metric) {
    const modal = document.getElementById('metricModal');
    const modalBody = document.getElementById('modalBody');
    
    const effectivenessColor = getScoreColor(metric.score);
    const effectivenessWidth = (metric.score / 10) * 100;
    
    modalBody.innerHTML = `
        <h2>${metric.title}</h2>
        <div class="effectiveness-indicator">
            <strong>Effectiveness Score: ${metric.score}/10</strong>
            <div class="effectiveness-bar">
                <div class="effectiveness-fill" style="width: ${effectivenessWidth}%; background-color: ${effectivenessColor};"></div>
            </div>
        </div>
        
        <h3>Overview</h3>
        <p>${metric.fullDescription}</p>
        
        <h3>Why This Metric Is Valuable</h3>
        <p>${metric.whyValuable}</p>
        
        <h3>How to Measure</h3>
        <ul>
            ${metric.howToMeasure.map(item => `<li>${item}</li>`).join('')}
        </ul>
        
        <h3>Limitations</h3>
        <p>${metric.limitations}</p>
    `;
    
    modal.style.display = 'block';
}

function setupModal() {
    const modal = document.getElementById('metricModal');
    const closeBtn = document.querySelector('.close');
    
    closeBtn.addEventListener('click', () => {
        modal.style.display = 'none';
    });
    
    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
    
    // Close modal with Escape key
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && modal.style.display === 'block') {
            modal.style.display = 'none';
        }
    });
}

function getScoreColor(score) {
    const colors = {
        10: '#10b981', 9: '#34d399', 8: '#6ee7b7', 7: '#84cc16', 6: '#a3e635',
        5: '#fbbf24', 4: '#f59e0b', 3: '#f97316', 2: '#ef4444', 1: '#dc2626'
    };
    return colors[score] || '#6b7280';
}