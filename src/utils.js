

// 适配requestAnimFrame
window.requestAnimFrame = window.requestAnimationFrame 
    || window.webkitRequestAnimationFrame 
    || window.mozRequestAnimationFrame 
    || window.oRequestAnimationFrame 
    || window.msRequestAnimationFrame;

var _ = module.exports = {
    /**
     * @return {Boolean} 
     */
    isFunction: function(fn) {
        return typeof fn === 'function';
    },

    /**
     * @return {Boolean} 
     */
    isArray: function(obj) {
        return Object.prototype.toString.call(obj) === '[object Array]';
    },

    /**
     * @return {Boolean} 
     */
    isObject: function(obj) {
        return obj && typeof obj === 'object' && !_.isArray(obj);
    },

    /**
     * extend
     * @param {?Boolean} clone
     * @param {Object} target 
     * @param {...Object} args 
     */
    extend: function(clone, target) {
        var args;
        if (clone === true) {
            target = _.clone(target);
            args = [].slice.call(arguments, 2);
        } else {
            args = [].slice.call(arguments, 1);
            target = clone;
        }
        for (var i in args) {
            var obj2 = args[i];
            for (var k in obj2) {
                target[k] = obj2[k];
            }
        }
        return target;
    },

    /**
     * clone object
     * @param {Object} obj 
     */
    clone: function(obj) {
        return JSON.parse(JSON.stringify(obj));
    },

    /**
     * sort a number array
     * @param {Array.<Number>} array
     * @return {Array.<Number>} 
     */
    sort: function(array) {
        return array
            .map(function(a) {
                return +a;
            })
            .sort(function(a, b) {
                return a > b ? 1 : (a === b ? 0 : -1);
            });
    },

    /**
     * 列表去重
     * @param {Array} array 
     */
    uniq: function(array) {
        var used = {};
        return array.filter(function(item) {
            return !used[item] && (used[item] = true);
        });
    },

    /**
     * css
     * @param {HTMLElement} ele
     * @param {String|Object} styles 
     * @param {String} value 
     */
    css: function(ele, styles, value) {
        if (typeof styles === 'object') {
            _.extend(ele.style, styles || {});
        } else if (value !== undefined) {
            ele.style[styles] = value;
        } else {
            // TODO
        }
    },

    /**
     * 根据html创建元素
     * @param {String} html
     * @return {HTMLElement} 
     */
    create: function(html) {
        var tmp = document.createElement('div');
        tmp.innerHTML = (html || '').trim();
        return tmp.childNodes[0] || null;
    }
};

module.exports =  _;

