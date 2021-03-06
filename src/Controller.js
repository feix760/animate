
var EventEmitter = require('lib/EventEmitter'),
    _ = require('./utils'),
    config = require('./config'),
    loadSource = require('./loadSource'),
    CssAnimation = require('./CssAnimation'),
    mergeElements = require('./mergeElements'),
    getControllerOpts = require('./getControllerOpts');

/**
 * @type {Object} 状态值
 */
var STATUS = {
    INIT: 1,
    CREATE: 2,
    START: 4,
    FINISH: 8
};

/**
 * @class Controller
 * @param {Object} options 
 * @param {?Number} options.duration 总帧数 默认取元素的scope最大最小值做差
 * @param {?HTMLElement} options.root  默认document.body
 * @param {Array.<Object>} options.elements 
 *
 * element 结构:
 * @param {String|HTMLElement|Object} element.source 
 *      当为Object时使用mergeElements合并, 结构参考mergeElements
 * @param {Array.<Number>} element.scope [2,34] 起始/结束范围
 * @param {?Object} element.style 附加的样式
 * @param {?Object.<String, Object|..>|Array.<Number>} element.xy
 * @param {?Object|Number} element.opacity
 * @param {?Object|Number} element.scale
 * @param {?String} element.id id标示
 * @param {?String} element.extend 继承元素id
 * @param {?Number} element.fixX x偏移
 * @param {?Number} element.fixY y偏移
 *
 * @param {Object} fix
 * @param {Number} fix.fixX 作用于所有元素的x偏移
 * @param {Number} fix.fixY 作用于所有元素的y偏移
 */
function Controller(options, fix) {
    options = getControllerOpts(options, fix);
    this.options = options;
    this.elements = options.elements;
    // set status
    this.status = STATUS.INIT;
    this.loadSource();
    this.once('sourcemerge', this.create.bind(this));
    if (options.autoStart) {
        this.once('create', this.start.bind(this));
    }
}

var p = Controller.prototype;

p.loadSource = function() {
    var self = this,
        urls = self._getAllUrlSource();
    loadSource(urls).then(function(sourceMap) {
        self.setSource(sourceMap);
        self.emit('sourceload');
        self.mergeSource();
    });
    return self;
};

/**
 * @return {Array.<String>} 
 */
p._getAllUrlSource = function() {
    var urls = {};
    this._getRecursiveElements().forEach(function(item) {
        isUrlSource(item.source) 
            && (urls[item.source] = true);
        // 依赖资源
        if (item.depSource) {
            item.depSource.forEach(function(url) {
                urls[url] = true;
            });
        }
    });
    return Object.keys(urls);
};

function isUrlSource(source) {
    return typeof source === 'string' && source.indexOf('<') !== 0;
}

p._getRecursiveElements = function() {
    var result = [];
    this.elements.forEach(function(item) {
        result.push(item);
        isMergeSource(item.source) 
            && (result = result.concat(item.source.elements));
    });
    return result;
};

function isMergeSource(source) {
    // TODO
    return typeof source === 'object' && source.elements;
}

p.setSource = function(sourceMap) {
    this._getRecursiveElements().forEach(function(item) {
        if (typeof item.source === 'string') {
            if (item.source.indexOf('<') === 0) {
                // 创建html元素
                item.source = _.create(item.source);
            } else if (isUrlSource(item.source)) {
                item.source = sourceMap[item.source];
            }
        }
        // clone source
        if (item.cloneSource) {
            item.source = cloneSource(item.source);
        }
    });
};

function cloneSource(source) {
    var oldSource = source;
    if (source.cloneNode) {
        source = source.cloneNode();
        // set width height
        source.width = oldSource.width;
        source.height = oldSource.height;
    }
    return source;
}

p.mergeSource = function() {
    this.elements.forEach(function(item) {
        isMergeSource(item.source) 
            && (item.source = mergeElements(item.source));
    });
    this.emit('sourcemerge');
};

p.create = function() {
    var self = this;
    self.drawer = new CssAnimation(_.extend({}, self.options, {
        elements: self.elements
    }));
    self.drawer
        .on('start', function() {
            self.emit('start');
        })
        .on('finish', function() {
            self.status = STATUS.FINISH;
            self.emit('finish');
        });
    this.status = STATUS.CREATE;
    self.emit('create');
};

p.start = function() {
    this._startT = Date.now();
    this.drawer.start();
    this.status = STATUS.START;
    this.tick();
};

p.tick = function() {
    if (this.status === STATUS.START) {
        var index = (Date.now() - this._startT) / config.frameInterval;
        this.elements.forEach(function(item) {
            item.tick && item.tick(index);
        });
        requestAnimFrame(this.tick.bind(this));
    }
};

/**
 * use to debug 
 * show nth frame 
 */
p.showFrameAt = function(n) {
    this.drawer.showFrameAt(n);
};

// extend
p.__proto__ = EventEmitter.prototype;

module.exports = Controller;

