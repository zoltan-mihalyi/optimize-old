var fs = require('fs');
var optimize = require('../dist/optimize');
var assert = require('assert');

module.exports.assertMatch = function ensureMatch(filename) {
    assert.equal(optimize(fs.readFileSync(`${__dirname}/samples/${filename}.js`, 'UTF-8')), fs.readFileSync(__dirname + '/samples/' + filename + '.optimized.js', 'UTF-8'));
};