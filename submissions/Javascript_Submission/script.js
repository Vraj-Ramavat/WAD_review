/**
 * CodeGalaxy — Interactive Form Handling & Validation Script
 * Web Application Development (WAD) Submission
 */

document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const form = document.getElementById('repoAnalyzeForm');
    const repoUrlInput = document.getElementById('repoUrl');
    const emailInput = document.getElementById('developerEmail');
    const branchInput = document.getElementById('branchName');
    const scanDepthSelect = document.getElementById('scanDepth');
    const includeDepsCheckbox = document.getElementById('includeDependencies');

    const repoUrlError = document.getElementById('repoUrlError');
    const emailError = document.getElementById('emailError');
    const livePreview = document.getElementById('repoLivePreview');
    const liveStatusTag = document.getElementById('liveStatusTag');

    const submitBtn = document.getElementById('submitBtn');
    const btnText = document.getElementById('btnText');
    const btnSpinner = document.getElementById('btnSpinner');
    const resetBtn = document.getElementById('resetBtn');

    const progressContainer = document.getElementById('progressContainer');
    const progressBarFill = document.getElementById('progressBarFill');
    const progressStatusText = document.getElementById('progressStatusText');
    const progressPercentage = document.getElementById('progressPercentage');

    const successCard = document.getElementById('successCard');
    const resultRepoName = document.getElementById('resultRepoName');
    const resultBranch = document.getElementById('resultBranch');
    const resultPlanets = document.getElementById('resultPlanets');
    const resultMoons = document.getElementById('resultMoons');
    const analyzeAnotherBtn = document.getElementById('analyzeAnotherBtn');

    // Regular Expressions
    const GITHUB_REGEX = /^(?:https?:\/\/github\.com\/)?([a-zA-Z0-9_.-]+)\/([a-zA-Z0-9_.-]+?)(?:\.git|\/)?$/;
    const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    /**
     * Parse GitHub URL or Slug to extract owner/repo
     */
    function parseGitHubRepo(input) {
        const trimmed = input.trim();
        const match = trimmed.match(GITHUB_REGEX);
        if (match) {
            return {
                owner: match[1],
                repo: match[2],
                fullName: `${match[1]}/${match[2]}`
            };
        }
        return null;
    }

    /**
     * Real-time validation for GitHub Repo Input
     */
    function validateRepoUrl() {
        const val = repoUrlInput.value.trim();
        if (!val) {
            repoUrlError.textContent = 'Repository URL or slug is required.';
            repoUrlInput.classList.add('error');
            repoUrlInput.classList.remove('success');
            livePreview.innerHTML = 'Parsed Repo: <em>None</em>';
            return false;
        }

        const parsed = parseGitHubRepo(val);
        if (!parsed) {
            repoUrlError.textContent = 'Invalid format. Use "owner/repo" or "https://github.com/owner/repo".';
            repoUrlInput.classList.add('error');
            repoUrlInput.classList.remove('success');
            livePreview.innerHTML = 'Parsed Repo: <span style="color: #ef4444;">Invalid target</span>';
            return false;
        }

        repoUrlError.textContent = '';
        repoUrlInput.classList.remove('error');
        repoUrlInput.classList.add('success');
        livePreview.innerHTML = `Parsed Repo: <em>${parsed.fullName}</em>`;
        liveStatusTag.textContent = 'Ready to Analyze';
        liveStatusTag.style.borderColor = 'var(--accent-green)';
        liveStatusTag.style.color = 'var(--accent-green)';
        return true;
    }

    /**
     * Real-time validation for Developer Email
     */
    function validateEmail() {
        const val = emailInput.value.trim();
        if (!val) {
            emailError.textContent = 'Email address is required for telemetry alerts.';
            emailInput.classList.add('error');
            emailInput.classList.remove('success');
            return false;
        }

        if (!EMAIL_REGEX.test(val)) {
            emailError.textContent = 'Please enter a valid email address.';
            emailInput.classList.add('error');
            emailInput.classList.remove('success');
            return false;
        }

        emailError.textContent = '';
        emailInput.classList.remove('error');
        emailInput.classList.add('success');
        return true;
    }

    // Event Listeners for real-time validation
    repoUrlInput.addEventListener('input', validateRepoUrl);
    repoUrlInput.addEventListener('blur', validateRepoUrl);

    emailInput.addEventListener('input', validateEmail);
    emailInput.addEventListener('blur', validateEmail);

    /**
     * Clear and Reset Form
     */
    function resetForm() {
        form.reset();
        repoUrlInput.classList.remove('error', 'success');
        emailInput.classList.remove('error', 'success');
        repoUrlError.textContent = '';
        emailError.textContent = '';
        livePreview.innerHTML = 'Parsed Repo: <em>None</em>';
        liveStatusTag.textContent = 'Awaiting Input';
        liveStatusTag.style.borderColor = 'var(--border-subtle)';
        liveStatusTag.style.color = 'var(--accent-amber)';
        progressContainer.classList.add('hidden');
        successCard.classList.add('hidden');
        form.style.display = 'block';
    }

    resetBtn.addEventListener('click', resetForm);
    analyzeAnotherBtn.addEventListener('click', resetForm);

    /**
     * Form Submission Handler
     */
    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const isRepoValid = validateRepoUrl();
        const isEmailValid = validateEmail();

        if (!isRepoValid || !isEmailValid) {
            liveStatusTag.textContent = 'Validation Errors';
            liveStatusTag.style.borderColor = 'var(--accent-red)';
            liveStatusTag.style.color = 'var(--accent-red)';
            return;
        }

        const repoData = parseGitHubRepo(repoUrlInput.value);
        const branch = branchInput.value.trim() || 'main';
        const depth = scanDepthSelect.value;
        const includeDeps = includeDepsCheckbox.checked;

        // UI Loading State
        submitBtn.disabled = true;
        btnSpinner.classList.remove('hidden');
        btnText.textContent = 'Analyzing...';
        liveStatusTag.textContent = 'Analysis In Progress';
        progressContainer.classList.remove('hidden');
        successCard.classList.add('hidden');

        // Simulated Multistage Analysis Steps
        const stages = [
            { pct: 20, text: 'Fetching GitHub AST & Commit Telemetry...' },
            { pct: 50, text: 'Executing ML Defect Prediction Algorithms...' },
            { pct: 80, text: 'Generating 3D Planetary Coordinates & Moons...' },
            { pct: 100, text: 'Cosmic Solar System Synthesized!' }
        ];

        let currentStage = 0;
        const interval = setInterval(() => {
            if (currentStage < stages.length) {
                const stage = stages[currentStage];
                progressBarFill.style.width = `${stage.pct}%`;
                progressPercentage.textContent = `${stage.pct}%`;
                progressStatusText.textContent = stage.text;
                currentStage++;
            } else {
                clearInterval(interval);
                setTimeout(() => {
                    // Completed
                    submitBtn.disabled = false;
                    btnSpinner.classList.add('hidden');
                    btnText.textContent = 'Launch Galaxy Analysis →';
                    progressContainer.classList.add('hidden');

                    // Compute simulated counts based on repo string length
                    const baseSeed = repoData.fullName.length;
                    const folderCount = Math.max(6, Math.floor(baseSeed * 0.8));
                    const fileCount = Math.max(45, Math.floor(baseSeed * 18.5));

                    resultRepoName.textContent = repoData.fullName;
                    resultBranch.textContent = branch;
                    resultPlanets.textContent = `${folderCount} Folder Planets`;
                    resultMoons.textContent = `${fileCount} File Moons`;

                    form.style.display = 'none';
                    successCard.classList.remove('hidden');
                    liveStatusTag.textContent = 'Analysis Complete';
                    liveStatusTag.style.borderColor = 'var(--accent-green)';
                    liveStatusTag.style.color = 'var(--accent-green)';
                }, 500);
            }
        }, 600);
    });
});
