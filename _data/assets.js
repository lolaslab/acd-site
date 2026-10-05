// Cache busting: a short hash of each asset's contents, added to its URL as ?v=…
// The URL only changes when the file does, so browsers and CDNs refetch it after a change.
const { createHash } = require("node:crypto");
const { readFileSync } = require("node:fs");

const hash = (path) => createHash("sha256").update(readFileSync(path)).digest("hex").slice(0, 8);

module.exports = {
    css: hash("css/styles.css"),
    js: hash("js/terms.js"),
};
