var debug = require('debug')('metalsmith-seo-checker');
var _ = require('lodash');

module.exports = plugin;

function plugin(options) {
    options = options || {};
    _.defaults(options, {
        titleMaxLength: 60,
    });

    var shouldInspect = getInspectDecider(options),
        values = options.values || {};


    return function(files, metalsmith, done) {
        setImmediate(done);

        Object.keys(files).forEach(function(file) {
            debug('checking file: %s', file);

            if (!shouldInspect(file)) {
                return;
            }
            var data = files[file];

            if (values.title === true) {
                if (!data.title) {
                    throw new Error(decorate(file, 'Missing required title.'));
                }
            } else if (values.title && !data.title) {
                data.title = values.title;
            }

            if (options.titleMaxLength && data.title.length > options.titleMaxLength) {
                throw new Error(decorate(file,
                        'Title is too long, the max is ' +
                        options.titleMaxLength + ', currently: ' +
                        data.title.length + ' long.'));
            }

            Object.keys(values).forEach(function(value) {
                if (value === 'title') {
                    return;
                }

                if (values[value] === true) {
                    if (!data.seo[value]) {
                        throw new Error(decorate(file,
                                'Missing required seo value: ' + value));
                    }
                } else if (!data.seo[value]) {
                    data.seo[value] = values[value];
                }

                var max = options[value+'MaxLength'];
                if (max && data.seo[value].length > max) {
                    throw new Error(decorate(file,
                            value + ' is too long, the max is ' + max +
                            ', currently: ' + data.seo[value].length +
                            ' long.'));
                }
            });
        });
    };
}

function decorate(file, message) {
    return message + '\nFile: ' + file +
            '\n\nTo skip validation on this file add it to the ' +
            'ignoreFiles array.';
}

function getInspectDecider(options) {
    var toInspectRegexs = [/.md$|.markdown$|.html$/];
    if (options.toInspect &&
                Object.prototype.toString.call(options.toInspect) === '[object Array]') {
        toInspectRegexs = options.toInspect;
    } else if (options.toInspect) {
        toInspectRegexs = [options.toInspect];
    }

    return function (file) {
        if (options.ignoreFiles.indexOf(file) !== -1) {
            return false;
        }

        for (var i = 0; i < toInspectRegexs.length; i++) {
            if (toInspectRegexs[i].test(file)) {
                return true;
            }
        }

        return false;
    };
}
