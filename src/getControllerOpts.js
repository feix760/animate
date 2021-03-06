
var _ = require('./utils');

/**
 * 适配选项
 * @param {Object} opt
 * @param {Object} fix 
 * @return {Object} 
 */
module.exports = function(opt, fix) {
    opt = opt || {};

    // default root
    opt.root = document.querySelector('body');

    var elements = opt.elements = opt.elements || [];

    // extend
    extend(elements);

    var scopes = getScopes(opt);

    // 帧偏移, 默认减去最小帧
    fixIndex(elements, fix.fixIndex !== undefined ? fix.fixIndex : -scopes.min);

    fixXY(elements, fix);

    scaleXY(elements, fix.scaleXY !== undefined ? fix.scaleXY : 0.5);

    fix.fixOpacity !== false && fixOpacity(elements);

    fix.fixScale !== false && fixScale(elements);

    opt.duration = opt.duration || scopes.max - scopes.min;

    return opt;
};

/**
 * 实现元素的继承
 */
function extend(elements) {
    var idMap = {};

    elements.forEach(function(item) {
        item.id && (idMap[item.id] = item);
    });

    elements.forEach(function(item) {
        if (item.extend && idMap[item.extend]) {
            var extend = idMap[item.extend];
            ['scopes', 'xy', 'opacity', 'scale'].forEach(function(p) {
                if (extend[p]) {
                    item[p] = item[p] || _.clone(extend[p]);
                }
            });
        }
    });
}

/**
 * 帧偏移
 */
function fixIndex(elements, fixIndex) {
    elements.forEach(function(ele) {
        ['xy', 'opacity', 'scale'].forEach(function(item) {
            if (_.isObject(ele[item])) {
                var fixed = {};
                Object.keys(ele[item]).forEach(function(name) {
                    fixed[+name + (fixIndex || 0)] = ele[item][name];
                });
                ele[item] = fixed;
            }
        });
        if (_.isArray(ele.scope)) {
            ele.scope[0] += fixIndex;
            ele.scope[1] += fixIndex;
        }
    });
}

/**
 * x, y偏移
 */
function fixXY(elements, fix) {
    fix.fixX = fix.fixX || 0;
    fix.fixY = fix.fixY || 0;
    elements.forEach(function(ele) {
        ele.fixX = ele.fixX || 0;
        ele.fixY = ele.fixY || 0;
        if (_.isObject(ele.xy)) {
            Object.keys(ele.xy).forEach(function(name) {
                var f = ele.xy[name];
                if (_.isObject(f)) {
                    if (_.isArray(f.paramX)) {
                        for (var i = 0; i < f.paramX.length; i++) {
                            f.paramX[i] += ele.fixX + fix.fixX;
                        }
                    }
                    f = f.value;
                }
                f[0] += ele.fixX + fix.fixX;
                f[1] += ele.fixY + fix.fixY;
            });
        } else if (_.isArray(ele.xy)) {
            ele.xy[0] += ele.fixX + fix.fixX;
            ele.xy[1] += ele.fixY + fix.fixY;
        }
    });
}

/**
 * 640设计稿 -> 高清屏
 */
function scaleXY(elements, scale) {
    elements.forEach(function(ele) {
        if (_.isObject(ele.xy)) {
            Object.keys(ele.xy).forEach(function(name) {
                var f = ele.xy[name];
                if (_.isObject(f)) {
                    // set param
                    if (_.isArray(f.paramX)) {
                        for (var i = 0; i < f.paramX.length; i++) {
                            f.paramX[i] *= scale;
                        }
                    }
                    f = f.value;
                }
                for (var i = 0; i < f.length; i++) {
                    f[i] *= scale;
                }
            });
        } else if (_.isArray(ele.xy)) {
            for (var i = 0; i < ele.xy.length; i++) {
                ele.xy[i] *= scale;
            }
        }
    });
}

/**
 * 100单位的opacity转化为1单位
 */
function fixOpacity(elements) {
    elements.forEach(function(ele) {
        if (_.isObject(ele.opacity)) {
            Object.keys(ele.opacity).forEach(function(name) {
                ele.opacity[name] = ele.opacity[name] / 100;
            });
        } else if (typeof ele.opacity === 'number') {
            ele.opacity = ele.opacity / 100;
        }
    });
}

/**
 * 100单位的scale转化为1单位
 */
function fixScale(elements) {
    elements.forEach(function(ele) {
        if (_.isObject(ele.scale)) {
            Object.keys(ele.scale).forEach(function(name) {
                ele.scale[name] = ele.scale[name] / 100;
            });
        } else if (typeof ele.scale === 'number') {
            ele.scale = ele.scale / 100;
        }
    });
}

/**
 * 获取所有元素最大最小帧
 */
function getScopes(opt) {
    var scopes = [];
    opt.elements.forEach(function(ele) {
        scopes = scopes.concat(ele.scope || []);
    });
    return {
        max: Math.max.apply(Math, scopes),
        min: Math.min.apply(Math, scopes)
    };
}

