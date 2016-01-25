
var _ = module.exports = {
    isFunction: function(fn) {
        return typeof fn === 'function';
    },
    isArray: function(obj) {
        return Object.prototype.toString.call(obj) === '[object Array]';
    },
    isObject: function(obj) {
        return obj && typeof obj === 'object' && !_.isArray(obj);
    },
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

    uniq: function(array) {
        var used = {};
        return array.filter(function(item) {
            return !used[item] && (used[item] = true);
        });
    },

    css: function(ele, styles, value) {
        if (typeof styles === 'object') {
            _.extend(ele.style, styles || {});
        } else if (value !== undefined) {
            ele.style[styles] = value;
        } else {
            // TODO
        }
    }
};

module.exports =  _;

