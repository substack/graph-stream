var Stream = require('stream');
var raphael = require('raphael-browserify');
var inherits = require('util').inherits;
var mrcolor = require('mrcolor');
var fort = require('fort');

module.exports = function (w, h, o) {
    return new Graph(w, h, o);
};

function Graph (width, height, opts) {
    if (typeof width === 'object') {
        opts = width;
        width = opts.width;
        height = opts.height;
    }
    else if (Array.isArray(width)) {
        opts = height;
        height = width[1];
        width = width[0];
    }
    if (!opts) opts = {};
    if (opts.autoAxes === undefined) opts.autoAxes = true;
    if (opts.autoAxes && opts.axisSize === undefined) {
        opts.axisSize = {};
    }
    if (opts.axisSize.y === undefined) {
        opts.axisSize.y = 50;
    }
    
    this.nextColor = mrcolor();
    this.opts = opts;
    
    Stream.call(this);
    this.writable = true;
    
    this.buckets = {};
    this.colors = {};
    this.bars = {};
    this.axes = { x : [], y : [] };
    
    this.element = document.createElement('div');
    this.paper = raphael(this.element, width, height);
    this.width = width;
    this.height = height;
}

inherits(Graph, Stream);

Graph.prototype.resize = function (width, height) {
    if (Array.isArray(width)) {
        height = width[1];
        width = width[0];
    }
    this.paper.setSize(width, height);
    this.width = width;
    this.height = height;
};

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
        }, 100);
    }
};

Graph.prototype.end = function () {
    if (!this._scheduled) this.render();
};
Graph.prototype.destroy = function () {};

Graph.prototype.render = function () {
    var self = this;
    var keys = Object.keys(self.buckets);
    if (self.opts.sort) {
        var algo = self.opts.sort;
        if (algo === true) algo = 'descend';
        algo = algo.replace(/ing$/, '');
        
        var algos = [ 'ascend', 'descend' ];
        if (algos.indexOf(algo) < 0) {
            throw new Error('sorting algorithm not supported');
        }
        
        keys = fort[algo](keys, function (key) {
            return self.buckets[key];
        });
    }
    
    if (self.opts.limit) {
        var other = self.opts.other === false ? false : true;
        var lim = self.opts.limit + (other ? -1 : 0);
        if (self.opts.sort) {
            keys.slice(lim).forEach(function (key) {
                if (!self.bars[key]) return;
                self.bars[key].attr('fill', 'transparent');
            });
            keys = keys.slice(0, lim);
        }
        else {
            var sorted = fort.descend(keys, function (key) {
                return self.buckets[key];
            });
            
            sorted.slice(lim).forEach(function (key) {
                if (!self.bars[key]) return;
                self.bars[key].attr('fill', 'transparent');
            });
            
            var hasKey = sorted.slice(0, lim)
                .reduce(function (acc, key) {
                    acc[key] = true;
                    return acc;
                }, {})
            ;
            
            keys = keys.filter(function (key) { return hasKey[key] });
        }
    }
    
    var values = keys.map(function (key) { return self.buckets[key] });
    if (self.opts.other) (function () {
        keys.push('other');
        
        var hasKey = keys.reduce(function (acc, key) {
            acc[key] = true;
            return acc;
        }, {});
        
        values.push(Object.keys(self.buckets).reduce(function (sum, key) {
            return sum + (hasKey[key] ? 0 : 1);
        }, 0));
    })();
    
    var max = Math.max.apply(null, values);
    var min = 0;
    
    var spacing = { x : 0, y : 0 };
    if (self.opts.autoAxes) {
        spacing.x += self.opts.axisSize.y;
    }
    
    if (self.opts.autoAxes && (self.axes.y.length === 0
    || max !== self.axes.y[0].value
    || min !== self.axes.y[self.axes.y.length - 1].value)) {
        self.axes.y.splice(0).forEach(function (label) {
            label.element.remove();
        });
        
        self.axes.y = [];
        var labelCount = 5;
        for (var i = 0; i < labelCount; i++) {
            var y = (self.height - 20) * (1 - i / (labelCount - 1)) + 10;
            var value = (max - min) * i / (labelCount - 1);
            if (max - min > 100) value = Math.round(value);
            
            var label = {
                element : self.paper.text(self.opts.axisSize.y - 10, y, value),
                value : value
            };
            label.element.attr('text-anchor', 'end');
            self.axes.y.push(label);
        }
    }
    
    keys.forEach(function (key, ix) {
        var value = values[ix];
        
        if (!self.colors[key]) self.colors[key] = self.nextColor();
        var color = self.colors[key];
        
        var w = (self.width - spacing.x) / keys.length;
        var h = value / max * (self.height - spacing.y);
        
        var x = spacing.x + 5 + ix * w;
        var y = self.height - 10 - h;
        
        var bar = self.bars[key];
        if (!bar) {
            bar = self.bars[key] = self.paper.rect(x, y, w, h);
            bar.attr('fill', 'rgba(' + color.rgb().join(',') + ',1)');
            bar.attr('stroke', 'transparent');
            bar.attr('stroke-width', 0);
        }
        else {
            self.bars[key].attr({
                fill : 'rgba(' + color.rgb().join(',') + ',1)',
                x : x,
                y : y,
                width : w,
                height : h
            });
        }
    });
};
