
var EventEmitter = require('lib/EventEmitter'),
    _ = require('./utils'),
    keyframesTmpl = require('./keyframes'),
    Element = require('./Element'),
    config = require('./config');

/**
 * 使用css3播放动画
 * {
 *      elements: [],
 *      duration: 40, // 总帧数
 *      root: document.body, // 容器
 * }
 */
function CssAnimation(options) {
    options = options || {};

    this.duration = options.duration;
    this.durationTime = options.duration * config.frameInterval;
    this.root = options.root || document.querySelector('body');
    this.options = options;
    this.elements = [];

    // 批量添加元素
    this.addAllElements(options.elements || []);
}

var p = CssAnimation.prototype;

// 批量添加元素
p.addAllElements = function (elements) {
    var self = this;
    elements.forEach(function(conf) {
        self.addElement(conf);
    });
}

/**
 * 添加元素
 */
p.addElement = function(conf) {
    var element = new Element(_.extend({
        duration: this.duration
    }, conf));
    element.dom = getDom(conf);
    setTransition(element.dom, {
        duration: this.durationTime,
        frames: element.toFrames()
    });
    this.elements.push(element);
};

function getDom(ele) {
    _.css(ele.source, _.extend({
        width: parseInt((ele.width || ele.source.width) / 2) + 'px',
        height: parseInt((ele.height || ele.source.height) / 2) + 'px',
        position: 'absolute',
        opacity: 0,
        top: 0,
        left: 0
    }, ele.style || {}));
    return ele.source;
}

/**
 * 插入动画
 * @param {Object} keyframes
 *  {
 *      name: '',
 *      frames: {
 *          10: {
 *              opacity: 0
 *          },
 *          100: {
 *              opacity: 1
 *          }
 *      }
 *  }
 */
function insertKeyframes(frames) {
    frames = keyframesTmpl(frames);
    //console.log(frames);
    if (document.styleSheets && document.styleSheets.length) {
        document.styleSheets[0].insertRule(frames, 0);
    } else {
        var s = document.createElement('style');
        s.innerHTML = frames;
        document.getElementsByTagName('head')[0].appendChild(s);
    }
};

/**
 * 设置animation
 * @param {Object} el dom元素
 * @param {Object} frames 同insertKeyframes参数
 */
function setTransition(el, frames) {
    frames = _.extend({
        name: 'keyframe' + Math.random().toString().replace('.', '')
    }, frames);

    insertKeyframes(frames);

    el.style['-webkit-animation'] = [
        frames.name, frames.duration + 'ms', 
        frames.timing || 'linear', '0s', 
        frames.count || 1
    ].join(' ');
}

p._appendDom = function() {
    var self = this;
    self.elements.forEach(function(element) {
        self.root.appendChild(element.dom);
    });
};

p.start = function() {
    var self = this;
    self._appendDom();
    self.emit('start');
    // emit finish event
    setTimeout(function() {
        self.emit('finish');
    }, self.durationTime);
};

p.showFrameAt = function(n) {
    var self = this;
    self.elements.forEach(function(element) {
        _.css(element.dom, _.extend(element.getStyleAt(n), {
            '-webkit-animation': 'none'
        }));
    });
    self._appendDom();
};

// extend
p.__proto__ = EventEmitter.prototype;

module.exports = CssAnimation;

