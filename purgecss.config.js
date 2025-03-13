module.exports = {
  content: ["public/**/*.html"],
  css: ["public/assets/css/output.css"],
  extractors: [
    {
      extractor: (content) => content.match(/[\w-/:]+(?<!:)/g) || [],
      extensions: ["html"],
    },
  ],
};
