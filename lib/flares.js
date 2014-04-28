/*jslint node: true*/
var phantom = require ('phantom');

exports.load = function load (url) {
    url = url || 'http://www.google.com';
    if (!url.match(/^https?:\/\//)) {
        url = 'http://' + url;
    }
    console.log('Loading "%s"...', url);
    phantom.create(function(ph) {
        ph.createPage(function(page) {
            /*page.set('onResourceRequested', function (requestData, networkRequest) {
                console.log('Request (#' + requestData.id + '): ' + JSON.stringify(requestData));
            });*/
            page.set('onResourceReceived', function(response) {
                console.log('Response (#' + response.id + ', stage "' + response.stage + '"): ' + JSON.stringify(response));
            });
            page.open(url, function(status) {
                console.log('Status "%s": %s', url, status);
                ph.exit();
            });
        });
    });
};