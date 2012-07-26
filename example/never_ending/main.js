var request = require('request');

var graph = require('../')(800, 600);
graph.appendTo(document.body);

var JSONStream = require('JSONStream');
var parser = JSONStream.parse([ 'data', true, '17' ]);
parser.pipe(graph);

var u = 'http://' + window.location.host + '/data.json';
request(u).pipe(parser);
