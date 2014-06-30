var debug = require('debug')('metalsmith-seo-checker');
var _ = require('lodash');
var defaultsDeep = _.partialRight(_.merge, function deep(value, other) {
    return _.merge(value, other, deep);
});

module.exports = plugin;

function plugin(options) {
    options = options || {};
    defaultsDeep(options, {
        ignoreFiles: [],
        lengths: {
            title: 60,
            description: 160
        },
        seo: {
            title: true,
            robots: 'index, follow'
        },
        ogp: {
            defaultType: 'website',
            defaultImage: false,
            ignoreMissingImage: false
        }
    });

    var shouldInspect = getInspectDecider(options),
        values = options.values || {};


    return function(files, metalsmith, done) {
        var fileNames = Object.keys(files),
            file;

        for (var i = 0; i < fileNames.length; i++) {
            file = fileNames[i];

            if (!shouldInspect(file)) {
                continue;
            }

            debug('checking file: %s', file);
            var data = files[file];
            data.seo = data.seo || {};

            data.seo.canonical = options.canonicalBase + '/' + data.path + '/';

            // Make private pages noindex, nofollow
            if (!data.seo.robots && data.private) {
                data.seo.robots = 'noindex, nofollow';
            }

            var keys = Object.keys(values),
                container,
                length,
                value,
                attr,
                max,
                j;
            for (j = 0; j < keys.length; j++) {
                attr = keys[j];
                container = attr === 'title' ? data : data.seo;

                if (values[attr] === true) {
                    if (!container[attr]) {
                        return done(error(file, 'Missing required seo attribute: ' + attr));
                    }
                } else if (!container[attr]) {
                    container[attr] = values[attr];
                }
            }

            keys = Object.keys(options.lengths);
            for (j = 0; j < keys.length; j++) {
                attr = keys[j];
                if (attr === 'title') {
                    value = data.title;
                } else {
                    value = data.seo[attr];
                }
                length = value ? value.length : 0;

                max = options.lengths[attr];
                if (max && length > max) {
                    return done(error(file, attr + ' is too long, the max is '
                            + max + ', currently: ' + length + ' long.'));
                }
            }

            data.seo.ogp = data.seo.ogp || {};
            data.seo.ogp.title = data.seo.ogp.title || data.title;
            data.seo.ogp.type = data.seo.ogp.type || options.ogp.defaultType;
            data.seo.ogp.image = data.seo.ogp.image || options.ogp.defaultImage;

            if (!data.seo.ogp.image && !options.ogp.ignoreMissingImage) {
                return done(error(file, 'Missing OGP image.\n' +
                        'To ignore this error set ' +
                        'options.ogp.ignoreMissingImages to true or provide ' +
                        'a default image with options.ogp.defaultImage.'));
            }
        }

        done();
    };
}

function error(file, message) {
    return message + '\nFile: ' + file +
            '\nTo skip validation on this file add it to the ' +
            'ignoreFiles array.\n\n';
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
