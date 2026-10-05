// Site-wide settings. Set SITE_URL (e.g. in .env or your host's settings) once the site has a live domain;
// social previews need absolute URLs.
module.exports = {
    name: "Accessibility Compatibility Data",
    url: (process.env.SITE_URL || "http://localhost:8080").replace(/\/$/, ""),
};
