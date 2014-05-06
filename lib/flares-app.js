/*jslint node: true*/
var
// node
vm = require('vm'),
fs = require('fs'),
util = require('util'),
path = require('path'),
flares = require('./flares'),

// contrib
program = require('commander'),

// lib
flares = require('../lib/flares'),

FlaresApp = (function() {

    function FlaresApp (){
        this.verbose = false;
        this.quiet = false;
        this.urls = [];

        this.getProcessParams(function(){
            this.run();
        }.bind(this));
    }

    /**
    * Display help
    * @static
    */
    FlaresApp.displayHelp = function() {
        program.outputHelp();
    };


    FlaresApp.prototype = {
        // Log
        _verbose: function() {
            if (!this.verbose) {
                return;
            }
            console.log.apply(console, arguments);
        },

        // Error log
        _error: function() {
            if (this.quiet) {
                return;
            }
            console.error.apply(console, arguments);
        },


        getProcessParams: function(cb) {
            /*jslint stupid: true*/

            program
                .version(JSON.parse(fs.readFileSync(path.resolve(__dirname, '../package.json'))).version)
                .usage('[options]')
                .option('-q, --quiet', 'disable writing to std*. Ex: to use flares in shell script')
                .option('-v, --verbose', 'enable verbose mode')
                .parse(process.argv);

            // Args number test
            if (process.argv.length <= 2) {
                FlaresApp.displayHelp();
                return process.exit(1);
            }
            this.urls = program.args;
            // nothing to lint
            if (this.urls.length === 0) {
                this._error('Nothing to load!');
                return process.exit(1);
            }
            if (program.verbose) {
                this.verbose = program.verbose;
            }
            if (program.quiet) {
                this.quiet = program.quiet;
            }
            cb();
        },


        run: function() {
            this.urls.forEach(function(url){
                flares.load({
                    url: url,
                    verbose: this.verbose
                });
            }.bind(this));
        }
    };

    return FlaresApp;
}()),

app = new FlaresApp();
