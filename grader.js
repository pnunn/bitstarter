#!/usr/bin/env node
/*
Automatically grade files for the presence of specific HTML tags/attributes.
Use commander.js and cheerio. Teaches command line application development
and basic DOM parsing.

References:

 + cheerio
  - https://github.com/MatthewMueller/cheerio
  - http://encosia.com/cheerio-faster-windows-friendly-alternative-jsdom/
  - http://maxogden.com/scraping-with-node-html

 + commander.js
  - https://github.com/visionmedia/commander.js
  - http://tjholowaychuk.compost/9103188408/commander-js-nodejs-command-line-interfaces-made-easy

 + JSON
  - http://en.wikipedia.org/wiki/JSON
  - https://developer.mozilla.org/en-US/docs/JSON
  - https://developer.mozilla.org/en-US/docs/JSON#JSON_in_Firefox_2
*/

var fs = require('fs');
var program = require('commander');
var cheerio = require('cheerio');
var util = require('util');
var rest = require('restler');
var HTMLFILE_DEFAULT = "index.html";
var CHECKSFILE_DEFAULT = "checks.json";
var URL_DEFAULT = "http://fathomless-island-9854.herokuapp.com/";
var checksfile;
var checkJson;
var out;

var assertFileExists = function(infile) {
	var instr = infile.toString();
	if(!fs.existsSync(instr)) {
		console.log("%s does not exist. Exiting.", instr);
		process.exit(1); // http://nodejs.org/api/process.html#process_process_exit_code
	}
	return instr;
};

var cheerioHtmlFile = function(htmlfile) {
	return cheerio.load(fs.readFileSync(htmlfile));
};

var loadChecks = function(checksfile) {
	return JSON.parse(fs.readFileSync(checksfile));
};

var restlerHtmlFile = function(url) {
	rest.get(url).on('complete', function(result) {
		checkURL(result);
	});
};

var checkURL = function(result) {
	if(result instanceof Error) {
		console.error('Error: ' + util.format(response.message));
	} else {
		//console.log('Result: ' + result);
		$ = cheerio.load(result);
		var checks = loadChecks(checksfile).sort();
		//console.log($);
		//console.log(checks);
	
		out = {};
		for(var ii in checks) {
			var present = $(checks[ii]).length > 0;
			out[checks[ii]] = present;
		}
		//console.log(out);
		outRes(out);

	}
	
	
}


var checkHtmlFile = function(htmlfile, checksfile) {
	$ = cheerioHtmlFile(htmlfile);
	var checks = loadChecks(checksfile).sort();
	var out = {};
	for(var ii in checks) {
		var present = $(checks[ii]).length > 0;
		out[checks[ii]] = present;
	}
	return out;
};

var clone = function(fn) {
	// Workaround for commander.js issue.
	// http://stackoverflow.com/a/6772648
	return fn.bind({});
};

var outRes = function(checkJson) {
	var outJson = JSON.stringify(checkJson, null, 4);
	console.log(outJson);
}

if(require.main == module) {
	program
		.option('-c, --checks <check_file>', 'Path to checks.json', clone(assertFileExists), CHECKSFILE_DEFAULT)
		.option('-f, --file <html_file>', 'Path to index.html', clone(assertFileExists), HTMLFILE_DEFAULT)
		.option('-u, --url <url>', 'URL to index.html')
		.parse(process.argv);
	checksfile = program.checks;
	if(program.url) {
		restlerHtmlFile(program.url);
	} else {
		outRes(checkHtmlFile(program.file, checksfile));
	}	
} else {
	exports.checkHtmlFile = checkHtmlFile;
}

