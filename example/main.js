var request = require('request');

var graph = require('../')(400, 300);
graph.appendTo(document.body);

var JSONStream = require('JSONStream');
var parser = JSONStream.parse([ 'data', true, '17' ]);
parser.pipe(graph);

request('http://' + window.location.host + '/data.json').pipe(parser);
//request('http://' + window.location.host + '/small.json').pipe(parser);
