/**
 * Show functions to be exported from the design doc.
 */

var templates = require('kanso/templates');
var querystring = require('kanso/querystring');

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

exports.vmon = function(doc, req) {
    var fractional_error = 0.15;

    doc.temp = doc.temp.toFixed(4);
    doc.cald = doc.cald.toFixed(4);
    doc.hvt = doc.hvt.toFixed(4);

    for (var i=0; i<doc.voltages.length; i++) {
        doc.voltages[i].value = doc.voltages[i].value.toFixed(4);
        nom = doc.voltages[i].nominal;
        err = Math.abs(fractional_error * nom);
        if (doc.voltages[i].value < (nom - err) || doc.voltages[i].value > (nom + err))
            doc.voltages[i]['ok'] = false;
        else
            doc.voltages[i]['ok'] = true;
    }

    return {
        title: 'Voltage Monitoring Test Results',
        content: templates.render('vmon.html', req, doc)
    };
};

exports.cgt_test = function(doc, req) {
    return {
        title: 'CGT Test Results',
        content: templates.render('cgt_test.html', req, doc)
    };
};

exports.fifo_test = function(doc, req) {
    return {
        title: 'FIFO Test Results',
        content: templates.render('fifo_test.html', req, doc)
    };
};

exports.mb_stability_test = function(doc, req) {
    return {
        title: 'Motherboard Stability Test Results',
        content: templates.render('mb_stability_test.html', req, doc)
    };
};

exports.mem_test = function(doc, req) {
    return {
        title: 'Memory Test Results',
        content: templates.render('mem_test.html', req, doc)
    };
};

