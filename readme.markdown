# graph-stream

Pipe a stream of data into a graph in the browser.

# example

Pull down a static json file from the server
with [request](http://github.com/mikeal/request),
parse it with [JSONStream](http://github.com/dominictarr/JSONStream),
then pipe the records you want to graph to graph-stream:

``` js
var graph = require('graph-stream')(400, 300);
graph.appendTo(document.body);

var JSONStream = require('JSONStream');
var parser = JSONStream.parse([ 'data', true, '17' ]);
parser.pipe(graph);

var request = require('request');
var u = 'http://' + window.location.host + '/data.json';
request(u).pipe(parser);
```

[browserify](https://github.com/substack/node-browserify) this file:

```
$ browserify main.js -o bundle.js
```

then view it in a web browser:

![graph output](http://substack.net/images/screenshots/graph-stream.png)

as new data arrives, the graph updates automatically.

Your stream need not even end to be graphable. There's an example of a
never-ending stream in example/

# methods

``` js
var graphStream = require('graph-stream')
```

## var graph = graphStream(width, height, opts)
## var graph = graphStream([ width, height ], opts)

Create a new readable stream `graph` that you can `.pipe()` data into.

When you pipe data it will be rendered as a simple bar graph.

The bar graph counts the number of times each string of data has been seen.

Options:

* opts.sort - Set an ordering algorithm to rank the bars in the graph.
Set as a string value of `'ascend'` or `'descend'`. If true, uses `'descend'`.
If `false`, doesn't sort. Default value: `false`.

* opts.axisSize.x - Set the size of the x axis.
* opts.axisSize.y - Set the size of the y axis.

* opts.limit - how many bars to show
* opts.other - whether to show a bar with the sum of all the bars not shown

## graph.appendTo(target)

Append the `graph.element` html element to `target`.

## graph.resize(width, height)
## graph.resize([ width, height ])

Resize the graph.

# install

With [npm](http://npmjs.org) do:

```
npm install graph-stream
```

# license

MIT
