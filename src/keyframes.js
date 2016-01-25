
module.exports = function(data) {
    var str = '@-webkit-keyframes ' + data.name + '{';
    Object.keys(data.frames).forEach(function(cent) {
        str += '\n' + cent + '% {';
        Object.keys(data.frames[cent]).forEach(function(k) {
            str += k + ':' + data.frames[cent][k] + ';';
        });
        str += '}';
    });
    str += '\n}';
    return str;
};

