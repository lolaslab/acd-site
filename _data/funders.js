const ENDPOINTS = [
    "https://opencollective.com/lolas-lab/backers.svg?width=600&button=false",
    "https://opencollective.com/acd/backers.svg?width=600&button=false",
    "https://opencollective.com/lolas-lab/sponsors.svg?width=600&button=false",
];

// params: svg String
// return: attribute Object
// Return attribute object parsed from SVG element
function parseAttrs(svg) {
    const attrs = {};
    const attrRe = /([\w:-]+)="([^"]*)"/g;
    let match;
    while (match = attrRe.exec(svg)) {
        attrs[match[1]] = match[2];
    }
    console.log(attrs)
    return attrs;
}

// param: url String
// return: avatars Array of Objects
// Iterate through SVG items in given endpoint and return
// avatar details.
async function fetchAvatars(url) {
    const res = await fetch(url);
    if (!res.ok) {
        console.warn(`funders data: ${url} responded ${res.status}`);
        return [];
    }
    const svg = await res.text();
    const avatars = [];
    const tagRegex = /<a\s+([^>]*)>/g;
    let match;
    while (match = tagRegex.exec(svg)) {
        const attrs = parseAttrs(match[1]);
        if (attrs.class !== "opencollective-svg" || !attrs.id) continue;
        avatars.push({
            name: attrs.id.replace(/-/g, " "),
            avatar: `https://images.opencollective.com/${attrs.id}/avatar/64.png`,
        });
    }
    return avatars;
}

module.exports = async function () {
    const results = await Promise.allSettled(ENDPOINTS.map(fetchAvatars));

    const funders = [];
    for (const result of results) {
        if (result.status !== "fulfilled") {
            console.warn("funders data: fetch failed", result.reason);
            continue;
        }
        for (const avatar of result.value) {
            funders.push(avatar);
        }
    }
    return funders;
};
