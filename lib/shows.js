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

exports.cmos_m_gtvalid = function(doc, req) {
    return {
        title: 'CMOS M GTVALID Test Results',
        content: templates.render('cmos_m_gtvalid.html', req, doc)
    };
};

exports.crate_cbal = function(doc, req) {
    return {
        title: 'Crate CBAL Test Results',
        content: templates.render('crate_cbal.html', req, doc)
    };
};

exports.disc_check = function(doc, req) {
    return {
        title: 'Disc Check Test Results',
        content: templates.render('disc_check.html', req, doc)
    };
};

