
/**
 * 加载资源文件
 * @param {Array.<String>} urls
 * @return {Promise.then(Object.<String,Image>)} 
 */
module.exports = function(urls) {
    return new Promise(function(resolve, reject) {
        var totalCount = 0,
            completeCount = 0,
            source = {};
        function check() {
            if (++completeCount === totalCount) {
                resolve(source);
            }
        }
        urls.forEach(function(url) {
            totalCount++;
            var img = new Image();
            img.onload = function() {
                source[url] = img;
                check();
            };
            img.onerror = function() {
                source[url] = null;
                check();
            };
            img.src = url;
        });
    });
};

