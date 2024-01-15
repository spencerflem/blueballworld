module.exports = function(eleventyConfig) {
    // Output directory is the default '_site/'
    
    eleventyConfig.addPassthroughCopy("bundle.css");
    eleventyConfig.addPassthroughCopy({ "images": "images" });
}
