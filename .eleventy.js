require("dotenv").config();
const syntaxHighlight = require("@11ty/eleventy-plugin-syntaxhighlight");
const rfc822Date = require('rfc822-date');
const addGlossaryTerms = require("./_lib/glossary-terms");

module.exports = function(eleventyConfig) {
    eleventyConfig.addPassthroughCopy("css/");
    eleventyConfig.addPassthroughCopy("images/");
    eleventyConfig.addPassthroughCopy("js/");

    // Tooltip definitions for the first use of each glossary term
    eleventyConfig.addTransform("glossary-terms", function(content) {
        return this.page.outputPath?.endsWith(".html") ? addGlossaryTerms(content) : content;
    });

    // Allow draft blog posts
    eleventyConfig.addPreprocessor("drafts", "*", (data, content) => {
        if (data.draft && ["build", "serve"].includes(process.env.ELEVENTY_RUN_MODE)) {
            return false;
        }
    });

    eleventyConfig.addPlugin(syntaxHighlight);

    // Newest date in the collection
    eleventyConfig.addFilter('collectionLastUpdatedDate', (collection) => {
        if (!collection?.length) {
            throw new Error('Collection is empty in collectionLastUpdatedDate filter.');
        }
        return rfc822Date(new Date(Math.max(...collection.map((item) => item.date))));
    });
};
