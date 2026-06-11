'use strict';
const fs     = require('fs');
const path   = require('path');
const config = require('../config/settings');

const PLUGINS_DIR = path.join(__dirname, '../../guruh/plugins');

const commands = new Map();
const triggers  = [];

function addCmd({ name, aliases = [], handler, desc = '', usage = '', category = 'misc', ownerOnly = false, groupOnly = false, adminOnly = false }) {
    const entry = { name, aliases, handler, desc, usage, category, ownerOnly, groupOnly, adminOnly };
    if (!commands.has(name.toLowerCase())) {
        commands.set(name.toLowerCase(), entry);
    }
    for (const alias of aliases) {
        if (!commands.has(alias.toLowerCase())) {
            commands.set(alias.toLowerCase(), entry);
        }
    }
}

function addTrigger({ pattern, handler }) {
    triggers.push({ pattern, handler });
}

// ═══════════════════════════════════════════════════════════
//  CONTEXT BRIDGE — maps BLACK PANTHER MD ctx → Toxic-MD ctx
// ═══════════════════════════════════════════════════════════

function buildToxicCtx(ctx) {
    const m = ctx.m || {};
    const toxicM = new Proxy(m, {
        get(target, prop) {
            // Toxic-MD aliases
            if (prop === 'chat')     return target.from || target.key?.remoteJid;
            if (prop === 'reactKey') return target.key;
            return target[prop];
        }
    });

    return {
        // Toxic-MD primary fields
        client:        ctx.sock,
        m:             toxicM,
        text:          ctx.text   || '',
        prefix:        config.BOT_PREFIX || '.',
        groupMetadata: ctx.groupMeta || null,
        toxicspeed:    0.0094,
        // Owner/admin flags Toxic-MD middleware uses
        Owner:         ctx.m?.isOwner || ctx.m?.fromMe || false,
        isOwner:       ctx.m?.isOwner || ctx.m?.fromMe || false,
        isBotAdmin:    ctx.m?.isBotAdmin || false,
        isAdmin:       ctx.m?.isAdmin || false,
        isGroup:       ctx.m?.isGroup || false,
        // Pass-through BLACK PANTHER MD fields as well
        sock:          ctx.sock,
        from:          ctx.from,
        sender:        ctx.sender,
        pushName:      ctx.pushName,
        args:          ctx.args,
        body:          ctx.body,
        command:       ctx.command,
        quoted:        ctx.quoted,
        reply:         ctx.reply,
        send:          ctx.send,
        react:         ctx.react,
        config,
    };
}

// ═══════════════════════════════════════════════════════════
//  FLAT PLUGIN LOADER — CJS files in guruh/plugins/ root
// ═══════════════════════════════════════════════════════════

function loadPlugins() {
    const files = fs.readdirSync(PLUGINS_DIR).filter(f => f.endsWith('.js'));
    let loaded = 0;
    for (const file of files) {
        try {
            require(path.join(PLUGINS_DIR, file));
            loaded++;
        } catch (err) {
            console.error(`[LOADER] Failed to load plugin ${file}:`, err.message);
        }
    }
    console.log(`[LOADER] ${loaded}/${files.length} flat plugins loaded`);

    // Fire-and-forget: load ESM subdirectory plugins after CJS plugins are done
    loadSubdirPlugins().catch(e => console.error('[LOADER] Subdir load error:', e.message));
}

// ═══════════════════════════════════════════════════════════
//  SUBDIR PLUGIN LOADER — ESM files in guruh/plugins/*/
// ═══════════════════════════════════════════════════════════

async function loadSubdirPlugins() {
    const subdirs = fs.readdirSync(PLUGINS_DIR, { withFileTypes: true })
        .filter(d => d.isDirectory())
        .map(d => d.name);

    let loaded = 0, failed = 0, skipped = 0;

    for (const dir of subdirs) {
        const dirPath = path.join(PLUGINS_DIR, dir);
        const files   = fs.readdirSync(dirPath).filter(f => f.endsWith('.js'));

        for (const file of files) {
            const filePath = path.join(dirPath, file);
            const cmdName  = path.basename(file, '.js').toLowerCase().trim();
            if (!cmdName) { skipped++; continue; }

            try {
                const mod      = await import(`file://${filePath}`);
                const exported = mod.default;

                if (!exported) { skipped++; continue; }

                // Pattern A: export default { name, aliases, run, description }
                if (typeof exported === 'object' && typeof exported.run === 'function') {
                    const name    = (exported.name    || cmdName).toLowerCase().trim();
                    const aliases = (exported.aliases || []).map(a => a.toLowerCase().trim());
                    addCmd({
                        name,
                        aliases,
                        desc:     exported.description || exported.desc || '',
                        category: dir.toLowerCase(),
                        handler:  (ctx) => exported.run(buildToxicCtx(ctx)),
                    });
                    loaded++;
                    continue;
                }

                // Pattern B: export default async (context) => {}
                if (typeof exported === 'function') {
                    addCmd({
                        name:     cmdName,
                        aliases:  [],
                        category: dir.toLowerCase(),
                        handler:  (ctx) => exported(buildToxicCtx(ctx)),
                    });
                    loaded++;
                    continue;
                }

                skipped++;
            } catch (err) {
                // Graceful degradation — one bad plugin never blocks others
                if (process.env.DEBUG === 'true') {
                    console.error(`[LOADER] ${dir}/${file}: ${err.message}`);
                }
                failed++;
            }
        }
    }

    console.log(`[LOADER] Subdir plugins: ${loaded} loaded, ${failed} failed, ${skipped} skipped`);
}

function findCmd(name) {
    return commands.get(name?.toLowerCase()) || null;
}

function getAllCmds() {
    const seen = new Set();
    return [...commands.values()].filter(c => {
        if (seen.has(c.name)) return false;
        seen.add(c.name);
        return true;
    });
}

module.exports = { addCmd, addTrigger, loadPlugins, findCmd, getAllCmds, commands, triggers };
