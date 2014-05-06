/*jslint node: true*/
var
/* node */
path = require('path'),

/* contrib */
phantom = require('phantom'),
mime = require('mime'),
ansi = require('ansi'),
cursor = ansi(process.stdout),
phrefs = [],

RESSOURCE_NETWORK_TIMEOUT = 10000, // 10s
DL_MEDIA = {
    'application': true,
    'audio': false,
    'chemical': false,
    'image': false,
    'message': true,
    'model': false,
    'text': true,
    'video': false,
    'x-conference': false
};

process.on('uncaughtException', function(err) {
    var error = err.stack || err;
    console.log('Caught exception: ' + error);
    phrefs.forEach(function(ph){
        ph.exit();
    });
    process.exit(1);
});

exports.load = function load (option) {
    option = option || {};
    option.url = option.url || 'http://www.google.com';
    if (!option.url.match(/^https?:\/\//)) {
        option.url = 'http://' + option.url;
    }
    console.log('Loading "%s"...', option.url);
    //phantom.create('--debug=yes',function(ph) {
    phantom.create(function(ph) {
        phrefs.push(ph);
        ph.createPage(function(page) {
            /*var
            media,
            basename,
            extname;*/
            page.set('settings.resourceTimeout', RESSOURCE_NETWORK_TIMEOUT);
            page.set('settings.loadImages', false);

            // page.set('onResourceRequested', function (requestData, request) {
            //     request.abort();
            //     debugger;
            //     basename = path.basename(requestData.url);
            //     basename = basename.replace(/\?.*/,'');
            //     extname = path.extname(basename);
            //     media = mime.lookup(basename).replace(/\/.*/, '');
            //     if (!DL_MEDIA[media]) {
            //         if(option.verbose) {
            //             cursor.red();
            //             console.log('dl aborted: %s (%s)', basename, media);
            //             cursor.reset();
            //         }
            //         //request.abort();
            //     } else {
            //         if(option.verbose) {
            //             if (extname === '') {
            //                 console.log('dl allowed: %s (%s) > no ext: %s', basename, media, requestData.url);
            //             } else {
            //                 console.log('dl allowed: %s (%s)', basename, media);
            //             }
            //         }
            //     }
            // });
            page.set('onResourceReceived', function(response) {
                //console.log('Response (#' + response.id + ', stage "' + response.stage + '"): ' + JSON.stringify(response));
            });
            page.set('onLongRunningScript', function() {
                page.stopJavaScript();
            });
            page.open(option.url, function(status) {
                if (status == 'success') {
                    cursor.green();
                } else {
                    cursor.red();
                }
                console.log('Status "%s": %s', option.url, status);
                cursor.reset();
                ph.exit();
            });
        });
    });
};