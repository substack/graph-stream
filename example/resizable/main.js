var request = require('request');

var graph = require('../')(400, 300, { sort : false, limit : 20, other : true });
graph.appendTo(document.body);

var JSONStream = require('JSONStream');
var parser = JSONStream.parse([ 'data', true, '17' ]);
parser.pipe(graph);

var u = 'http://localhost:9005/data.json';
request(u).pipe(parser);

window.addEventListener('resize', function () {
    graph.resize(getSize());
});

window.addEventListener('load', function () {
    graph.resize(getSize());
});

function getSize () {
    return [
        Math.max(50, window.innerWidth - 15),
        Math.max(50, window.innerHeight - 20),
    ];
}
