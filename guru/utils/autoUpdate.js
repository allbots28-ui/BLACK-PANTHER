'use strict';
// ╔══════════════════════════════════════════════════════════════╗
//  🐾  BLACK PANTHER MD  —  Auto-Updater
//  Pulls latest commits from origin/main on every restart.
//  Uses GITHUB_PERSONAL_ACCESS_TOKEN for authenticated access.
//  Deep fetch: full depth with all refs so nothing is missed.
// ╚══════════════════════════════════════════════════════════════╝

const { execSync, spawnSync } = require('child_process');
const path   = require('path');
const fs     = require('fs');
const logger = require('./logger');

const ROOT = path.join(__dirname, '..', '..');

function run(cmd, opts = {}) {
    return spawnSync(cmd, { shell: true, cwd: ROOT, encoding: 'utf8', ...opts });
}

function injectAuth(remoteUrl, token) {
    try {
        const url = new URL(remoteUrl);
        url.username = 'x-token';
        url.password = token;
        return url.toString();
    } catch {
        return remoteUrl;
    }
}

async function autoUpdate() {
    try {
        const token = process.env.GITHUB_PERSONAL_ACCESS_TOKEN;
        if (!token) {
            logger.warn('UPDATE', 'GITHUB_PERSONAL_ACCESS_TOKEN not set — skipping auto-update');
            return false;
        }

        // Get current remote URL
        const remoteRes = run('git remote get-url origin');
        if (remoteRes.status !== 0) {
            logger.warn('UPDATE', 'No git remote "origin" found — skipping auto-update');
            return false;
        }
        const remoteUrl = (remoteRes.stdout || '').trim();
        const authUrl   = injectAuth(remoteUrl, token);

        logger.info('UPDATE', `Fetching latest updates from ${remoteUrl} …`);

        // Set auth URL temporarily
        run(`git remote set-url origin "${authUrl}"`);

        // Deep fetch — unshallow if needed, get all refs
        const unshallow = run('git fetch --unshallow origin main 2>/dev/null || git fetch --depth=2147483647 origin main 2>/dev/null || git fetch origin main');
        
        // Restore clean URL (token out of logs)
        run(`git remote set-url origin "${remoteUrl}"`);

        if (unshallow.status !== 0 && !(unshallow.stderr || '').includes('already complete')) {
            logger.warn('UPDATE', `Fetch failed: ${(unshallow.stderr || '').slice(0, 200)}`);
            return false;
        }

        // Check if we are behind
        const revRes = run('git rev-list HEAD..origin/main --count');
        const behind = parseInt((revRes.stdout || '0').trim(), 10) || 0;

        if (behind === 0) {
            logger.success('UPDATE', '✅ Already up-to-date — no new commits');
            return false;
        }

        logger.info('UPDATE', `📦 ${behind} new commit(s) found — applying update…`);

        // Show what's coming
        const logRes = run('git log HEAD..origin/main --oneline --no-decorate');
        if (logRes.stdout) {
            for (const line of logRes.stdout.trim().split('\n').slice(0, 10)) {
                logger.info('UPDATE', `  → ${line}`);
            }
        }

        // Reset to origin/main (hard — accept all upstream changes)
        const mergeRes = run('git reset --hard origin/main');
        if (mergeRes.status !== 0) {
            logger.warn('UPDATE', `Reset failed: ${(mergeRes.stderr || '').slice(0, 200)}`);
            return false;
        }

        logger.success('UPDATE', `✅ Updated successfully (${behind} commit(s) applied)`);

        // Re-install dependencies silently if package.json changed
        const diffRes = run('git diff HEAD@{1} HEAD -- package.json 2>/dev/null');
        if (diffRes.stdout && diffRes.stdout.trim()) {
            logger.info('UPDATE', '📦 package.json changed — reinstalling dependencies…');
            const npmRes = run('npm install --legacy-peer-deps --ignore-scripts 2>&1 && npm rebuild better-sqlite3 2>&1');
            logger.info('UPDATE', npmRes.status === 0 ? '✅ Dependencies updated' : `⚠️  npm install exit ${npmRes.status}`);
        }

        return true; // signals that a restart would pick up new code

    } catch (err) {
        logger.warn('UPDATE', `Auto-update error: ${err.message}`);
        return false;
    }
}

module.exports = { autoUpdate };
