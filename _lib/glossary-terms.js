const glossary = require("../_data/glossary.json");

// Text inside these elements is never wrapped: it's interactive, a heading, code or chrome.
const SKIP = new Set([
    "a", "button", "h1", "h2", "h3", "h4", "h5", "h6", "code", "pre", "script", "style",
    "svg", "title", "caption", "figcaption", "summary", "label", "textarea",
]);

const escapeHtml = (str) => str.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const slugify = (str) => str.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

// One matcher per term: its full name or its abbreviation, as a whole word.
// Matching is case-sensitive so generic phrases ("browser compatibility data") aren't mistaken for names.
const TERMS = Object.entries(glossary).map(([name, { abbreviation, definition }]) => {
    const forms = [name, abbreviation].filter(Boolean).map(escapeRegex).join("|");
    return {
        id: `term-${slugify(name)}`,
        label: abbreviation ? `${name} (${abbreviation})` : name,
        definition,
        regex: new RegExp(`(?<![\\w-])(?:${forms})(?![\\w-])`),
    };
});

function wrap(text, term) {
    return `<span class="term"><button type="button" class="term-trigger" aria-describedby="${term.id}">${text}</button>` +
        `<span class="term-tip" role="tooltip" id="${term.id}"><strong>${escapeHtml(term.label)}</strong> ` +
        `${escapeHtml(term.definition)}</span></span>`;
}

// Wrap the earliest unused term in a text node, then keep scanning the rest of it.
function wrapTerms(text, used) {
    let out = "";
    while (text) {
        let best;
        for (const term of TERMS) {
            if (used.has(term.id)) continue;
            const match = term.regex.exec(text);
            if (match && (!best || match.index < best.match.index ||
                (match.index === best.match.index && match[0].length > best.match[0].length))) {
                best = { term, match };
            }
        }
        if (!best) break;
        const { term, match } = best;
        used.add(term.id);
        out += text.slice(0, match.index) + wrap(match[0], term);
        text = text.slice(match.index + match[0].length);
    }
    return out + text;
}

// Adds a tooltip to the first appearance of each glossary term inside <main>.
module.exports = function addGlossaryTerms(html) {
    const used = new Set();
    const skipStack = [];
    let inMain = false;

    return html.split(/(<!--[\s\S]*?-->|<[^>]+>)/).map((token) => {
        if (token.startsWith("<")) {
            const [, closing, name] = token.match(/^<(\/?)([a-zA-Z0-9-]+)/) || [];
            const tag = name?.toLowerCase();
            if (tag === "main") inMain = !closing;
            if (SKIP.has(tag)) {
                if (closing) skipStack.pop();
                else skipStack.push(tag);
            }
            return token;
        }
        return inMain && !skipStack.length ? wrapTerms(token, used) : token;
    }).join("");
};
