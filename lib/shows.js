/**
 * Show functions to be exported from the design doc.
 */

var templates = require('kanso/templates');

// special shows
exports.welcome = function (doc, req) {
    return {
        title: 'SNO+ Electronics Debugging!',
        content: templates.render('index.html', req, {})
    };
};

exports.not_found = function (doc, req) {
    return {
        title: '404 - Not Found',
        content: templates.render('404.html', req, {})
    };
};

// test shows
exports.fec_test = function(doc, req) {
    return {
        title: 'FEC Test Results',
        content: templates.render('fec_test.html', req, doc)
    };
};

exports.cald_test = function(doc, req) {
    return {
        title: 'CALD Test Results',
        content: templates.render('cald_test.html', req, doc)
    };
};

