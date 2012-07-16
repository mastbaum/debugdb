/**
 * Show functions to be exported from the design doc.
 */

var templates = require('kanso/templates');
var database = require('kanso/db');

// special shows
exports.welcome = function(doc, req) {
    return {
        title: 'SNO+ Electronics Debugging!',
        content: templates.render('index.html', req, {})
    };
};

exports.not_found = function(doc, req) {
    return {
        title: '404 - Not Found',
        content: templates.render('404.html', req, {})
    };
};

// logbook
exports.logbook_new = function(doc, req) {
    return {
        title: 'New Logbook Entry',
        content: templates.render('logbook_new.html', req, {})
    };
}

exports.logbook_view = function(doc, req) {
    var d = doc;

    d.text_nobreaks = d.text.replace(/\r\n|\n|\r/gm, ' ');
    d.text_nobreaks = d.text_nobreaks.replace(/[\.,-\/#!$%\^&\*;:{}=\-`~()'"]/gm, ' ');

    return {
        title: 'Logbook Entry: ' + doc.title,
        content: templates.render('logbook_view.html', req, d)
    };
}

exports.logbook_saved = function(doc, req) {
    return {
        title: 'Logbook Entry Saved',
        content: templates.render('logbook_saved.html', req, {})
    };
}

exports.logbook_deleted = function(doc, req) {
    return {
        title: 'Logbook Entry Deleted',
        content: templates.render('logbook_deleted.html', req, {})
    };
}

// test shows
exports.fec_test = function(doc, req) {
    doc.title = 'FEC Test';
    return {
        title: doc.title,
        content: templates.render('fec_test.html', req, doc)
    };
};

exports.cald_test = function(doc, req) {
    doc.title = 'CALD Test';
    return {
        title: doc.title,
        content: templates.render('cald_test.html', req, doc)
    };
};

exports.cmos_m_gtvalid = function(doc, req) {
    var d = doc;
    d.title = 'CMOS M GTVALID Test';

    d.slot_error = false;
    if (d.slot_errors & 0x1) {
        d.slot_error = true;
        d['slot_error_hint'] = 'Bad ISETM values';
    }
    else if (d.slot_errors & 0x2) {
        d.slot_error = true;
        d['slot_error_hint'] = 'Bad channel(s)';
    }
    else {
        d['slot_error_hint'] = '';
    }

    for (channel in d.channels)
        if (d.channels[channel].gtvalid0) {
            d['channels'][channel]['gtvalid0'] = d['channels'][channel]['gtvalid0'].toFixed(1);
            d['channels'][channel]['gtvalid1'] = d['channels'][channel]['gtvalid1'].toFixed(1);
        }

    return {
        title: d.title,
        content: templates.render('cmos_m_gtvalid.html', req, d)
    };
};

exports.crate_cbal = function(doc, req) {
    var d = doc;
    d.title = 'Crate CBAL';

    if (d.pass == false) {
        d.hints = [];
        for (i in d.channels) {
            if (d.channels[i].vbal_low == 225 || d.channels[i].vbal_high == 225) {
                d.hints.push({
                    issue: 'One of more channel set to 225',
                    advice: 'Could not bring the charges into balance. Check the pre- and post-balance ped_run to see if one of the charges is crazy.'
                });
            }
        }
    }

    return {
        title: d.title,
        content: templates.render('crate_cbal.html', req, d)
    };
};

exports.disc_check = function(doc, req) {
    var d = doc;
    d.title = 'Discriminator Check';

    if (d.pass == false) {
        d.hints = [];
        for (var i=0; i<d.channels.length-3; i++) {
            if (i % 4 == 0 &&
                d.channels[i].errors &&
                d.channels[i+1].errors &&
                d.channels[i+2].errors &&
                d.channels[i+3].errors) {
                d.hints.push({
                    issue: 'A block of 4 channels is broken',
                    advice: 'The corresponding discriminator is probably dead.'
                });
            }
        }
    }

    return {
        title: d.title,
        content: templates.render('disc_check.html', req, d)
    };
};

exports.see_refl = function(doc, req) {
    doc.title = 'See Reflections Test';
    return {
        title: doc.title,
        content: templates.render('see_refl.html', req, doc)
    };
};

exports.vmon = function(doc, req) {
    var d = doc;
    d.title = 'Voltage Monitoring';

    d.temp = d.temp.toFixed(4);
    d.cald = d.cald.toFixed(4);
    d.hvt = d.hvt.toFixed(4);
    var v_all_bad = true;
    var v_bad_count = 0;
    for (var i=0; i<d.voltages.length; i++) {
       d.voltages[i].value = d.voltages[i].value.toFixed(4);
       if (d.voltages[i].ok == true) {
          v_all_bad = false;
       }
       v_bad_count++;
    }

    // debugging hints
    if (d.pass == false) {
        d.hints = [];
        if (d.voltages[0].value <= -43 &&
            d.voltages[1].value <= -24 && 
            d.voltages[17].value <= -24) {
            d.hints.push({
                issue: 'Voltages are railed',
                advice: 'Check voltages with multimeter. If okay, ensure R208 is 100K.'
            });
        }
        if (v_all_bad) {
            d.hints.push({
                issue: 'All voltages are bad',
                advice: 'Check blue wire to U130 pin 4. It may have detached.'
            });
        }
        if (v_bad_count == 1) {
            d.hints.push({
                issue: 'One voltage is bad',
                advice: 'Check page 20A of schematics to find the correct regulator, then check all resistor values.'
            });
        }
    }

    return {
        title: d.title,
        content: templates.render('vmon.html', req, d)
    };
};

exports.cgt_test = function(doc, req) {
    doc.title = 'CGT Test';
    return {
        title: doc.title,
        content: templates.render('cgt_test.html', req, doc)
    };
};

exports.fifo_test = function(doc, req) {
    doc.title = 'FIFO Test';
    return {
        title: doc.title,
        content: templates.render('fifo_test.html', req, doc)
    };
};

exports.mb_stability_test = function(doc, req) {
   doc.title = 'Motherboard Stability Test';
    return {
        title: doc.title,
        content: templates.render('mb_stability_test.html', req, doc)
    };
};

exports.mem_test = function(doc, req) {
   doc.title = 'Memory Test';
    return {
        title: doc.title,
        content: templates.render('mem_test.html', req, doc)
    };
};

exports.chinj_scan = function(doc, req) {
    var d = doc;
    d.title = 'Charge Injection Scan';

    var qhl_even_plot = [];
    var qhl_odd_plot = [];
    var qhs_even_plot = [];
    var qhs_odd_plot = [];
    var qlx_even_plot = [];
    var qlx_odd_plot = [];
    var tac_even_plot = [];
    var tac_odd_plot = [];

    for (var i=0; i<d.QHL_even[0].length; i++) {
        qhl_even_plot.push({id: i, value: d.QHL_even[0][i]})
        qhl_odd_plot.push({id: i, value: d.QHL_odd[0][i]})
        qhs_even_plot.push({id: i, value: d.QHS_even[0][i]})
        qhs_odd_plot.push({id: i, value: d.QHS_odd[0][i]})
        qlx_even_plot.push({id: i, value: d.QLX_even[0][i]})
        qlx_odd_plot.push({id: i, value: d.QLX_odd[0][i]})
        tac_even_plot.push({id: i, value: d.TAC_even[0][i]})
        tac_odd_plot.push({id: i, value: d.TAC_odd[0][i]})
    }

    var tables = [];
    for(var i=0; i<d.QHL_even.length; i++) {
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
        title: d.title,
        content: templates.render('chinj_scan.html', req, d)
    };
};

exports.find_noise = function(doc, req) {
    var d = doc;
    d.title = 'Noise Finder';

    for (var i=0; i<d.channels.length; i++) {
        if (i%2 == 0) {
            d.channels[i].color = "#eee";
        }
        // calculate dac value to use to be above the noise, & delta from noise peak center
        d.channels[i].dac_delta = d.channels[i].points[d.channels[i].points.length-1].thresh_above_zero;
        d.channels[i].dac_setting = d.channels[i].zero_used + d.channels[i].dac_delta;
        var baseline_plot_data = [];
        var readout_plot_data = [];
        for (var j=0; j<d.channels[i].points.length; j++) {
            var x = d.channels[i].zero_used + d.channels[i].points[j].thresh_above_zero;
            baseline_plot_data.push({id: x, value: d.channels[i].points[j].base_noise});
            readout_plot_data.push({id: x, value: d.channels[i].points[j].readout_noise});
        }
        d.channels[i].baseline_noise_profile = baseline_plot_data;
        d.channels[i].readout_noise_profile = readout_plot_data;
    }

    return {
        title: d.title,
        content: templates.render('find_noise.html', req, d)
    };
};

exports.zdisc = function(doc, req) {
    var d = doc;
    d.title = 'Discriminator Zero';

    var rows = []
    for(var i=0; i<d.max_dac.length; i++) {
        t = {
            channel: i,
            max_rate: d.max_rate[i].toFixed(2),
            upper_rate: d.upper_rate[i].toFixed(2),
            lower_rate: d.lower_rate[i].toFixed(2),
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
        title: d.title,
        content: templates.render('zdisc.html', req, d)
    };
};

exports.get_ttot = function(doc, req) {
    var d = doc;
    d.title = 'Get Ttot';

    var flag_hints = ['Passed', 'GTVALID time < target time', 'Lost peds when channel enabled']

    for (channel in d.channels) {
        d.channels[channel]['error'] = (d.channels[channel].errors != 0);
        d.channels[channel]['hint'] = flag_hints[d.channels[channel].errors];
    }
    return {
        title: d.title,
        content: templates.render('get_ttot.html', req, d)
    };
};

exports.set_ttot = function(doc, req) {
    var d = doc;
    d.title = 'Set Ttot';

    var flag_hints = ['Passed', 'Ttot too large for DAC', 'No TUB triggers at minimum Ttot']

    var chip_id = 0;
    for (row in d.chips) {
        d.chips[row]['id'] = chip_id;
        chip_id = chip_id + 1;
        if (row % 2 == 0)
            d.chips[row]['color'] = '#a0ffa0';
        else
            d.chips[row]['color'] = 'white';
        for (channel in d.chips[row]['channels']) {
            d.chips[row]['channels'][channel]['error'] = (d.chips[row]['channels'][channel].errors != 0);
            d.chips[row]['channels'][channel]['hint'] = flag_hints[d.chips[row]['channels'][channel].errors];
        }
    }
    return {
        title: d.title,
        content: templates.render('set_ttot.html', req, d)
    };
};

exports.ped_run = function(doc, req) {
    var d = doc;
    d.title = 'Pedestal Run';

    var flag_hints = ['Passed', 'Wrong number of pedestals', 'bad Q pedestal channel', 'Bad Q and wrong number of pedestals'];

    var channels = [];
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
                cell: j,
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
        title: d.title,
        content: templates.render('ped_run.html', req, d)
    };
};

exports.find_noise_2 = function(doc, req) {
    var d = doc;
    d.title = 'Find Noise 2';
    for (idx in d.channels) {
        d.channels[idx].difference = d.channels[idx].noiseless - d.channels[idx].zero_used;
    }
    return {
        title: doc.title,
        content: templates.render('find_noise_2.html', req, doc)
    };
};

exports.tags = function(doc, req) {
    var d = doc;

    if (!d.status) {
        d.status = "None";
    }

    return {
        title: 'Debugging Tag',
        content: templates.render('tags.html', req, d)
    };
};

exports.tag_new = function(doc, req) {
    var board_id = "";

    var d = new Date();

    if (req.query.board) {
        board_id = req.query.board.toString();
        if (board_id.substr(0,1) == "\"") {
            board_id = board_id.toString().substring(1, board_id.length-1);
        }
    }

    return {
        title: 'New Tag',
        content: templates.render('tag_new.html', req, {
            board_id: board_id,
            created: d.toString()
        })
    };
};

exports.crates = function(doc, req) {
    var crates = [];
    for (var i=0; i<19; i++) {
        crates.push(i);
    }

    return {
        title: 'All crates',
        content: templates.render('crates.html', req, {crates: crates})
    };
};

exports.detector = function(doc, req) {
    if (req.client) {
        database.getView('boards', function(err, data) {
            for (var row in data.rows) {
                var board = data.rows[row].key.toLowerCase();
                var status = data.rows[row].value[0] ? data.rows[row].value[0] : 'none';
                var background = {
                    none: 'white',
                    gold: '#ffdd00',
                    silver: 'silver',
                    bad: 'f66',
                    bone: 'black'
                }[status];
                $('#' + board).css('background', background);

                if (board.substr(0,1) == 'd') {
                    var html = '';
                    for (var i=0; i<8; i++) {
                        html += '<div style="height:2px;width:2px;background:' + (data.rows[row].value[2][i].good ? 'green' : 'red') + ';"></div>';
                    }
                    $('#' + board).append(html);
                }
             }
        });
    }

    return {
        title: 'Detector',
        content: templates.render('detector.html', req, doc)
    };
};

