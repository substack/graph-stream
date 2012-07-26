var Stream = require('stream');
var raphael = require('raphael-browserify');
var inherits = require('util').inherits;

module.exports = function (w, h) {
    return new Graph(w, h);
};

function Graph (width, height) {
    Stream.call(this);
    this.writable = true;
    
    this.buckets = {};
    this.bars = {};
    
    this.element = document.createElement('div');
    this.paper = raphael(this.element, width, height);
    this.width = width;
    this.height = height;
}

inherits(Graph, Stream);

Graph.prototype.appendTo = function (target) {
    target.appendChild(this.element);
};

Graph.prototype.write = function (name) {
    var self = this;
    if (self.buckets[name] === undefined) self.buckets[name] = 0;
    self.buckets[name] ++;
    
    if (!self._scheduled) {
        self._scheduled = setTimeout(function () {
            self._scheduled = undefined;
            self.render();
        }, 1000);
    }
};

Graph.prototype.end = function () {
    if (!this._scheduled) this.render();
};
Graph.prototype.destroy = function () {};

Graph.prototype.render = function () {
    var self = this;
    var keys = Object.keys(self.buckets);
    
    var values = keys.map(function (key) { return self.buckets[key] });
    var max = Math.max.apply(null, values);
    var min = 0;
    
    keys.forEach(function (key, ix) {
        var value = self.buckets[key];
        
        var w = (self.width - 10) / keys.length;
        var h = value / max * (self.height - 20);
        
        var x = 5 + ix * w;
        var y = self.height - 10 - h;
        
        var bar = self.bars[key];
        if (!bar) {
            bar = self.bars[key] = self.paper.rect(x, y, w, h);
            bar.attr('fill', 'red');
            bar.attr('stroke-width', 0);
        }
        else {
            self.bars[key].attr({ x : x, y : y, width : w, height : h });
        }
    });
};
