// Global
const pluginBundle = require("@11ty/eleventy-plugin-bundle");
const pluginWebc = require("@11ty/eleventy-plugin-webc");
const pluginDrafts = require("./eleventy.config.drafts.js");
const pluginImages = require("./eleventy.config.images.js");
const pluginRss = require("@11ty/eleventy-plugin-rss");
const { EleventyHtmlBasePlugin } = require("@11ty/eleventy");
const { DateTime } = require("luxon");

// Blue Ball Machine
const pluginSpritesheets = require("./eleventy.config.spritesheets.js")


module.exports = function (eleventyConfig) {

	// GLOBAL CONFIGS
	eleventyConfig.setServerOptions({
		domDiff: false,
	});
	eleventyConfig.addPassthroughCopy({ "./public/": "/" });
	eleventyConfig.addWatchTarget("content/**/*.{svg,webp,png,jpeg}");
	eleventyConfig.addPlugin(pluginDrafts);
	eleventyConfig.addPlugin(pluginImages);
	eleventyConfig.addPlugin(pluginRss);
	eleventyConfig.addPlugin(EleventyHtmlBasePlugin);
	eleventyConfig.addPlugin(pluginBundle);
	eleventyConfig.addPlugin(pluginWebc, {
		components: [
			"_includes/components/**/*.webc",
			"npm:@11ty/eleventy-img/*.webc",
		],
	});
	eleventyConfig.addFilter('htmlDateString', (dateObj) => {
		// dateObj input: https://html.spec.whatwg.org/multipage/common-microsyntaxes.html#valid-date-string
		return DateTime.fromJSDate(dateObj, { zone: 'utc' }).toFormat('yyyy-LL-dd');
	});
	eleventyConfig.addFilter('stringify', (json) => {
		return JSON.stringify(json);
	});

	// BLUE BALL MACHINE CONFIGS
	eleventyConfig.addPassthroughCopy("./content/blueballmachine/tiles/");
	eleventyConfig.addPassthroughCopy("./content/blueballmachine/fragments/");
	eleventyConfig.addPassthroughCopy("./content/blueballmachine/music/");
	eleventyConfig.addPassthroughCopy("./content/blueballmachine/ui/");
	eleventyConfig.addPlugin(pluginSpritesheets, {
		"blueballmachine": {
			"input": "./content/blueballmachine/tiles/",
			"output": "./blueballmachine/spritesheets/",
			"animated": true
		},
		"openfragments": {
			"input": "./content/blueballmachine/fragments/open",
			"output": "./blueballmachine/spritesheets/",
			"animated": true
		},
		"closedfragments": {
			"input": "./content/blueballmachine/fragments/closed",
			"output": "./blueballmachine/spritesheets/",
			"animated": true
		},
		"underconstructionfragments": {
			"input": "./content/blueballmachine/fragments/underconstruction",
			"output": "./blueballmachine/spritesheets/",
			"animated": true
		},
		"icons": {
			"input": "./content/blueballmachine/icons",
			"output": "./blueballmachine/spritesheets/",
		},
	});
	eleventyConfig.addFilter('year', (date) => {
		return (new Date(date)).getFullYear();
	});
	eleventyConfig.addFilter('sortEntriesNumerically', (obj) => {
		return Object.entries(obj).sort((a, b) => parseFloat(a[0]) - parseFloat(b[0]));
	});

	// eleventyConfig.setServerPassthroughCopyBehavior("passthrough");

	return {
		// Control which files Eleventy will process
		// e.g.: *.md, *.njk, *.html, *.liquid
		templateFormats: [
			"md",
			"njk",
			"html",
			"liquid",
		],

		// Pre-process *.md files with: (default: `liquid`)
		markdownTemplateEngine: "njk",

		// Pre-process *.html files with: (default: `liquid`)
		htmlTemplateEngine: "njk",

		dir: {
			input: "content",
			includes: "../_includes",
			data: "../_data",
			output: "_site"
		},

		pathPrefix: "/",
	};
};
