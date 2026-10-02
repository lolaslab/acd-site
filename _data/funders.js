const ENDPOINTS = [
    "https://opencollective.com/lolas-lab/backers.svg?width=600&button=false",
    "https://opencollective.com/acd/backers.svg?width=600&button=false",
    "https://opencollective.com/lolas-lab/sponsors.svg?width=600&button=false",
];

// Parse `key="value"` pairs from an SVG tag's attribute string into an object.
function parseAttrs(str) {
    return Object.fromEntries(
        [...str.matchAll(/([\w:-]+)="([^"]*)"/g)].map(([, key, value]) => [key, value])
    );
}

// Fetch an Open Collective SVG and return the { name, avatar } of each backer in it.
async function fetchAvatars(url) {
    const res = await fetch(url);
    if (!res.ok) {
        console.warn(`funders data: ${url} responded ${res.status}`);
        return [];
    }
    const svg = await res.text();
    return [...svg.matchAll(/<a\s+([^>]*)>/g)]
        .map(([, attrs]) => parseAttrs(attrs))
        .filter((attrs) => attrs.class === "opencollective-svg" && attrs.id)
        .map(({ id }) => ({
            name: id.replace(/-/g, " "),
            avatar: `https://images.opencollective.com/${id}/avatar/64.png`,
        }));
}

module.exports = async function () {
    const results = await Promise.allSettled(ENDPOINTS.map(fetchAvatars));
    return results.flatMap((result) => {
        if (result.status === "fulfilled") return result.value;
        console.warn("funders data: fetch failed", result.reason);
        return [];
    });
};
