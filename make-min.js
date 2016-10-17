var start = Date.now();
var log          = require('frozor-logger');

log.info(`Loading requirements...`);
var loadingStart = Date.now();

var fs           = require('fs');
var minify       = require('html-minifier').minify;

log.info(`Done in ${log.chalk.cyan(Date.now() - loadingStart)} ms. Reading index.html...`);
var readingStart = Date.now();

var indexPage    = fs.readFileSync(`${__dirname}/assets/html/index.html`);

log.info(`Done in ${log.chalk.cyan(Date.now() - readingStart)} ms. Minifying file...`);
var minifyingStart = Date.now();

var indexMini    = minify(indexPage.toString(), {
    collapseWhitespace: true,
    collapseInlineTagWhitespace: true,
    useShortDoctype: true
});

log.debug(indexMini);

log.info(`Done in ${log.chalk.cyan(Date.now() - minifyingStart)} ms. Saving file...`);
var savingStart = Date.now();

fs.writeFileSync(`${__dirname}/assets/html/index-min.html`, indexMini, {flag: 'a+'});

log.info(`Done in ${log.chalk.cyan(Date.now() - savingStart)} ms! Total time: ${log.chalk.cyan(Date.now() - start)} ms.`);
process.exit(0);