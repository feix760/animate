
var _ = require('./utils');

// 变换函数
var defaultTransform = {
    /**
     * 线性变换
     * (x1, y1) (x2, y2) 起始结束点
     * x3 
     * @return {Number} y3
     */
    line: function(x1, y1, x2, y2, x3) {
        if (_.isArray(y1)) {
            var rt = [];
            y1.forEach(function(m, i) {
                rt.push((y2[i] - y1[i]) / (x2 - x1) * (x3 - x1) + y1[i]);
            });
            return rt;
        } else {
            return (y2 - y1) / (x2 - x1) * (x3 - x1) + y1;
        }
    },
    // 抛物线
    para: function(x1, y1, x2, y2, x3) {
        var conf = this.conf,
            x = defaultTransform.line(x1, y1[0], x2, y2[0], x3),
            x1 = y1[0], y1 = y1[1],
            x2 = y2[0], y2 = y2[1],
            // 中心点x坐标
            x0 = conf && conf.paramX && conf.paramX[0] 
                ? conf.paramX[0] 
                : x1 + (x2 - x1) / 3.5,
            p = function(v) {
                return v * v;
            },
            y = y2 + (y1 - y2) 
                * (p(x - x0) - p(x2 - x0)) / (p(x1 - x0) - p(x2 - x0));
        return [x, y];
    }
};

/**
 * @class Element
 * @param {Object} options 
 */
function Element(options) {
    options = options || {};
    ['opacity', 'xy', 'scale'].forEach(function(type) {
        options[type] && (options[type] = transformConf(options[type]));
    });
    this.options = options;
    this.transform = _.extend({}, options.transform || {}, defaultTransform);
    this._createTransform();
}

function transformConf(conf) {
    if (_.isObject(conf)) {
        Object.keys(conf).forEach(function(key) {
            var item = conf[key];
            if (_.isObject(item)) {
                item.type = item.type || 'line';
            } else {
                conf[key] = {
                    type: 'line',
                    value: item
                };
            }
        });
    }
    return conf;
}

var p = Element.prototype;

p._createTransform = function() {
    var self = this;
    Object.keys(self.options).forEach(function(type) {
        switch (type) {
            case 'opacity':
            case 'xy':
            case 'scale':
                self[type] = self._getTransform(self.options[type]);
                break;
        }
    });
};

/**
 * @param {Object} conf
 * {
 *      344: {
 *          type: 'line',
 *          value: 234
 *      },
 *      400: 33
 * }
 * @return {Function(Number):Object} 
 */
p._getTransform = function(conf) {
    var transform = this.transform;
    // const
    if (!_.isObject(conf)) {
        return function() {
            return conf;
        };
    }
    var keys = _.sort(Object.keys(conf)),
        fn = function(delta) {
            var pos = getPosition(keys, delta);
            if (pos < 0) {
                return conf[keys[0]].value;
            } else if (pos >= keys.length - 1) {
                return conf[keys[keys.length - 1]].value;
            } else {
                var start = keys[pos],
                    end = keys[pos + 1],
                    data = {
                        conf: conf[start]
                    };
                return transform[conf[start].type].call(
                    data,
                    start, conf[start].value, end, conf[end].value, delta
                );
            }
        };

    // add keys
    fn.keys = keys;
    
    return fn;
};

function getPosition(keys, delta) {
    for (var i = 0; i < keys.length; i++) {
        if (keys[i] > delta) {
            return i - 1;
        }
    }
    return keys.length - 1;
}

/**
 * 获取某一帧的状态
 * @param {Number} point
 * @return {Object} 
 */
p.frameAt = function(point) {
    var xy = this.xy(point);
    return {
        xy: [parseInt(xy[0]), parseInt(xy[1])],
        scale: this.scale ? this.scale(point) : 1,
        opacity: this.opacity ? this.opacity(point) : 1
    };
}

/**
 * gen css frames
 */
p.toFrames = function() {
    var points = [],
        self = this;

    ['opacity', 'scale', 'xy'].forEach(function(type) {
        var conf = self.options[type];
        if (conf) {
            var keys = self[type].keys;
            keys.forEach(function(start, i) {
                // 插入关键帧
                points.push(+start);
                // 非线性帧
                if (i !== keys.length - 1 && conf[start].type !== 'line') {
                    for (var j = start + 1; j < keys[+i + 1]; j++) {
                        points.push(+j);
                    }
                }
            });
        }
    });

    points = _.uniq(_.sort(points));

    // empty
    if (!points.length) {
        return null;
    }

    var frames = {};
    function getCent(p) {
        return toFixed(p / self.options.duration * 100);
    }

    points.forEach(function(p) {
        frames[getCent(p)] = self.getStyleAt(p);
    });

    if (!frames[0]) {
        frames[0] = _.clone(frames[getCent(points[0])]);
        frames[0].opacity = 0;
    }
    if (points[0]) {
        frames[getCent(points[0] - 0.5)] = frames[0];
    }

    if (!frames[100]) {
        frames[100] = _.clone(frames[getCent(points[points.length - 1])]);
        frames[100].opacity = 0;
    }
    if (points[points.length - 1] < self.options.duration) {
        frames[getCent(points[points.length - 1] + 0.5)] = frames[100];
    }
    return frames;
};

p.getStyleAt = function(n) {
    var f = this.frameAt(n);
    return {
        '-webkit-transform': [
            'translate3d(' + toFixed(f.xy[0]) + 'px,' + toFixed(f.xy[1]) + 'px,0px)',
            'scale3d(' + [toFixed(f.scale), toFixed(f.scale), 1].join(',') + ')', 
        ].join(' '),
        opacity: toFixed(f.opacity)
    };
};

function toFixed(n) {
    return n.toFixed(2).replace(/\.?0+$/, '');
}

module.exports = Element;

