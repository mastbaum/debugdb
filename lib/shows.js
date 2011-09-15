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
    var d = doc;

    for (channel in d.channels)
        if (d.channels[channel].gtvalid0) {
            d['channels'][channel]['gtvalid0'] = d['channels'][channel]['gtvalid0'].toFixed(1);
            d['channels'][channel]['gtvalid1'] = d['channels'][channel]['gtvalid1'].toFixed(1);
        }

    return {
        title: 'CMOS M GTVALID Test Results',
        content: templates.render('cmos_m_gtvalid.html', req, d)
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

exports.chinj_scan = function(doc, req) {
    var d = doc;

    var qhl_even_plot = [];
    var qhl_odd_plot = [];
    var qhs_even_plot = [];
    var qhs_odd_plot = [];
    var qlx_even_plot = [];
    var qlx_odd_plot = [];
    var tac_even_plot = [];
    var tac_odd_plot = [];

    var tables = [];

    for(var i=0; i<d.QHL_even.length; i++) {
        // for plotting
        qhl_even_plot.push({id: i, value: d.QHL_even[i][0]})
        qhl_odd_plot.push({id: i, value: d.QHL_odd[i][0]})
        qhs_even_plot.push({id: i, value: d.QHS_even[i][0]})
        qhs_odd_plot.push({id: i, value: d.QHS_odd[i][0]})
        qlx_even_plot.push({id: i, value: d.QLX_even[i][0]})
        qlx_odd_plot.push({id: i, value: d.QLX_odd[i][0]})
        tac_even_plot.push({id: i, value: d.TAC_even[i][0]})
        tac_odd_plot.push({id: i, value: d.TAC_odd[i][0]})

        // for tables
        var table = []
        for(var j=0; j<d.QHL_even[i].length; j++) {
            t = {
                channel: i,
                val: j,
                qhl_even: d.QHL_even[i][j].toFixed(2),
                qhl_odd: d.QHL_odd[i][j].toFixed(2),
                qhs_even: d.QHS_even[i][j].toFixed(2),
                qhs_odd: d.QHS_odd[i][j].toFixed(2),
                qlx_even: d.QLX_even[i][j].toFixed(2),
                qlx_odd: d.QLX_odd[i][j].toFixed(2),
                tac_even: d.TAC_even[i][j].toFixed(2),
                tac_odd: d.TAC_odd[i][j].toFixed(2),
                errors_even: d.errors_even[i][j],
                errors_odd: d.errors_odd[i][j]
            };
            table.push(t);
        }
        tables.push(table);
    }

    d['qhl_even_plot'] = qhl_even_plot;
    d['qhl_odd_plot'] = qhl_odd_plot;
    d['qhs_even_plot'] = qhs_even_plot;
    d['qhs_odd_plot'] = qhs_odd_plot;
    d['qlx_even_plot'] = qlx_even_plot;
    d['qlx_odd_plot'] = qlx_odd_plot;
    d['tac_even_plot'] = tac_even_plot;
    d['tac_odd_plot'] = tac_odd_plot;
    d['tables'] = tables;

    return {
        title: 'Charge Injection Scan Results',
        content: templates.render('chinj_scan.html', req, d)
    };
};

exports.zdisc = function(doc, req) {
    var d = doc;
    var rows = []

    for(var i=0; i<d.max_dac.length; i++) {
        t = {
            channel: i,
            max_rate: d.max_rate[i],
            upper_rate: d.upper_rate[i],
            lower_rate: d.lower_rate[i],
            max_dac: d.max_dac[i],
            upper_dac: d.upper_dac[i],
            lower_dac: d.lower_dac[i],
            zero_dac: d.zero_dac[i],
            errors: d.errors[i],
        };
        rows.push(t);
    }

    d['rows'] = rows;

    return {
        title: 'ZDISC Test Results',
        content: templates.render('zdisc.html', req, d)
    };
};

exports.get_ttot = function(doc, req) {
    return {
        title: 'Get Ttot Test Results',
        content: templates.render('get_ttot.html', req, doc)
    };
};

exports.set_ttot = function(doc, req) {
    d = doc;
    for (row in d.chips) {
        if (row % 2 == 0)
            d.chips[row]['color'] = '#a0ffa0';
        else
            d.chips[row]['color'] = 'white'; 
    }
    return {
        title: 'Set Ttot Test Results',
        content: templates.render('set_ttot.html', req, d)
    };
};

exports.ped_run = function(doc, req) {
    var d = doc;

    var flag_hints = ['Passed', 'bad Q pedestal channel', 'Wrong number of pedestals', 'Bad Q and wrong number of pedestals'];

    var channels = []
    for (var i=0; i<d.errors.length; i++) {
        channels.push({
            id: i,
            errors: d.errors[i],
            flag: d.error_flags[i],
            hint: flag_hints[d.error_flags[i]]
        });
    }

    var tables = [];

    for(var i=0; i<d.num.length; i++) {
        var table = []
        for(var j=0; j<d.num[i].length; j++) {
            table.push({
                channel: i,
                errors: channels[i].errors,
                num: d.num[i][j].toFixed(1),
                qhl: d.qhl[i][j].toFixed(1),
                qhl_rms: d.qhl_rms[i][j].toFixed(1),
                qhs: d.qhs[i][j].toFixed(1),
                qhs_rms: d.qhs_rms[i][j].toFixed(1),
                qlx: d.qlx[i][j].toFixed(1),
                qlx_rms: d.qlx_rms[i][j].toFixed(1),
                tac: d.tac[i][j].toFixed(1),
                tac_rms: d.tac_rms[i][j].toFixed(1),
            });
        }
        tables.push(table);
    }

    d['channels'] = channels;
    d['tables'] = tables;

    return {
        title: 'Pedestal Run Results',
        content: templates.render('ped_run.html', req, d)
    };
};

