/*jslint node: true*/
var
/* node */
path = require('path'),

/* contrib */
phantom = require('phantom'),
ansi = require('ansi'),
cursor = ansi(process.stdout),
phrefs = [],

/* CONST */
RESSOURCE_NETWORK_TIMEOUT = 10000; // 10s

cursor.reset();

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
    var phOptions = [];

    //phantom.create('--debug=yes',function(ph) {

    if (option.proxy) {
        phOptions.push('--proxy=' + option.proxy);
    }
    if (option.proxyauth) {
        phOptions.push('--proxy-auth=' + option.proxyauth);
    }

    function createPage(ph) {
        ph.createPage(function(page) {

            page.set('settings.resourceTimeout', RESSOURCE_NETWORK_TIMEOUT);
            page.set('onResourceTimeout', function(e) {
                cursor.red();
                console.log('%s (%d): "%s"', e.errorString, e.errorCode, e.url);
                cursor.reset();
            });

            //page.set('settings.loadImages', false);

            page.onResourceRequested(
                function(requestData, request) { //phantom scope
                    //request.abort();
                    //console.log('PHANTOM requestData.url: ' + requestData.url);
                    return;
                },
                function(requestData) { //this scope
                    //console.log('NODE requestData.url: %s', requestData.url);
                    return;
                }
            );

            page.set('onConsoleMessage', function(msg, lineNum, sourceId) {
                console.log('CONSOLE: ' + msg + ' (from line #' + lineNum + ' in "' + sourceId + '")');
            });

            // page.onResourceRequested(function(requestData, request) {
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
            //         request.abort();
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
                return;
                //console.log('Response (#' + response.id + ', stage "' + response.stage + '"): ' + JSON.stringify(response));
            });
            page.set('onLongRunningScript', function() {
                page.stopJavaScript();
            });
            console.log('Loading "%s"...', option.url);
            page.open(option.url, function(status) {
                if (status === 'success') {
                    cursor.green();
                } else {
                    cursor.red();
                }
                console.log('Status "%s": %s', option.url, status);
                cursor.reset();
                ph.exit();
            });
        });
    }

    function onPhantomCreated(ph) {
        ph.get('version', function(v){
            console.log("Phantomjs version: %d.%d.%d", v.major, v.minor,v.patch);
            createPage(ph);
        });
        phrefs.push(ph);

    }


    phOptions.push(onPhantomCreated);
    phantom.create.apply(this, phOptions);
};