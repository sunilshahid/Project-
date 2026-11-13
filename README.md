# Skeptic's Vault: Zero-Knowledge Epistemic Notes & Fallacy Toolkit

A private, client-side, zero-knowledge markdown note-taking environment and rationalist analysis workbench.

## Core Features

- **Zero-Knowledge Encryption:** Master-passphrase authenticated encryption using PBKDF2 (600,000 iterations) and AES-256-GCM. Note titles, content, tags, and fallacy checks are encrypted locally before persisting in localStorage.
- **Client-Side Rationalist Toolkit:** Offline heuristic detection for 21 cognitive biases, informal fallacies, deductive traps, and epistemic razors (Ad Hominem, Straw Man, Post Hoc, Affirming the Consequent, Occam's Razor, etc.).
- **Rich Markdown Editor:** Formatting, lists, quotes, code blocks, live tag bubbles, and markdown file export.
- **Epistemic Check Tracker:** Systematic premise logging, counter-evidence documentation, and category-level fallacy distribution metrics.
- **Zero Tracking:** 100% offline, zero telemetry, zero external network requests.

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run the development server (configured for port 2998):
   ```bash
   npm run dev
   ```

3. Open [http://localhost:2998](http://localhost:2998) in your browser.
