/**
 * List functions to be exported from the design doc.
 */

var templates = require('kanso/templates');
var cookies = require('kanso/cookies');
var forms = require('kanso/forms');
var querystring = require('kanso/querystring');
var database = require('kanso/db');
var utils = require('kanso/utils');

// get the detector configuration for a board
function getConfig(board, d) {
    var board_type = board.substr(0, 1);
    if (board_type == 'c') {
        for (idx in d.crates) {
            if (d.crates[idx].ctc == board) {
                return {
                    crate: idx
                };
            }
        }
    }
    else if (board_type == 'x') {
        for (idx in d.crates) {
            if (d.crates[idx].xl3 == board) {
                return {
                    crate: idx
                };
            }
        }
    }
    else if (board_type == 'f') {
        for (idx in d.crates) {
            for (jdx in d.crates[idx].fecs) {
                if (d.crates[idx].fecs[jdx].id == board) {
                    return {
                        crate: idx,
                        slot: jdx,
                        fec: board,
                        pmtic: d.crates[idx].pmtics[jdx],
                        dbs: d.crates[idx].fecs[jdx].dbs.reverse()
                    };
                }
            }
        }
    }
    else if (board_type == 'e') {
        for (idx in d.crates) {
            for (jdx in d.crates[idx].pmtics) {
                if (d.crates[idx].pmtics[jdx] == board) {
                    return {
                        crate: idx,
                        slot: jdx,
                        fec: d.crates[idx].fecs[jdx].id,
                        pmtic: board,
                        dbs: d.crates[idx].fecs[jdx].dbs.reverse()
                    };
                }
            }
        }
    }
    else if (board_type == 'd') {
        for (idx in d.crates) {
            for (jdx in d.crates[idx].fecs) {
                for (kdx in d.crates[idx].fecs[jdx].dbs) {
                    if (d.crates[idx].fecs[jdx].dbs[kdx] == board) {
                        return {
                            crate: idx,
                            slot: jdx,
                            fec: d.crates[idx].fecs[jdx].id,
                            pmtic: d.crates[idx].pmtics[jdx],
                            dbs: d.crates[idx].fecs[jdx].dbs.reverse()
                        };
                    }
                }
            }
        }
    }

    return {};
}

// unique list of fecs, dbs, ...
exports.listing = function (head, req) {
    start({code: 200, headers: {'Content-Type': 'text/html'}});

    var listing_name;
    var listing_template = "listing.html";
    var type;
    var title;
    if (req.path[2] == 'fecs') {
        listing_name = "FECs";
        type = "fec";
    }
    if (req.path[2] == 'crates') {
        listing_name = "Crates";
        type = "crate";
    }
    if (req.path[2] == 'dbs') {
        listing_name = "Daughterboards";
        type = "db";
    }
    if (req.path[2] == 'tests') {
        listing_name = "Tests";
        type = "test";
    }
    title = 'All ' + listing_name;

    var rows = [];
    var row;
    while (row = getRow()) {
        var id = row.key;
        var count = row.value;
        var d = {'id': id, 'count': count, 'type': type};
        rows.push(d);
    }

    var content = templates.render(listing_template, req, {
        listing_name: listing_name,
        rows: rows,
    });

    if (req.client) {
        $('#content').html(content);
        document.title = title;
    }
    else {
        return templates.render('base.html', req, {
            content: content,
            title: title
        });
    }
};

// lists all tests for a given fec, db, ...
exports.tests = function (head, req) {
    start({code: 200, headers: {'Content-Type': 'text/html'}});

    // "system" is a FEC, DB, etc.
    var system_name;
    var system_id;
    var isaboard = true;
    var list_template = "index.html";
    var title = "SNO+ Electronics Debugging";

    var skip_prev = ((req.query.skip) ? Number(req.query.skip) : 0) - 25;
    var enable_prev = (skip_prev > -25);
    skip_prev = Math.max(skip_prev, 0);
    var skip_next = ((req.query.skip) ? Number(req.query.skip) : 0) + 25;

    if (req.query.startkey) {
        list_template = "test_list.html";
        if(req.query.startkey[1] == "{") {
            // match a crate and slot
            var r = req.query.startkey;
            r = r.toString().split(',');
            var crate = r[0].toString().substring(10);
            var slot = r[1].toString().substring(7, r[1].length-2);
            system_name = "Crate " + crate + ', Slot ' + slot;
            system_id = "";
        }
        else {
            system_id = req.query.startkey.toString();
            if (system_id.substr(0,1) == '[') {
                system_id = system_id.toString().substring(1, system_id.length-1);
            }
            if (system_id.substr(0,1) == '\"') {
                system_id = system_id.substring(1, system_id.length-1);
            }
            if (req.path[2] == 'tests_by_fec')
                system_name = "FEC";
            if (req.path[2] == 'tests_by_crate'){
                isaboard = false;
                system_name = "Crate";
            }
            if (req.path[2] == 'tests_by_db')
                system_name = "Daughterboard";
            if (req.path[2] == 'tests_by_name'){
              isaboard = false;
              system_name = "Test";
            }
            title = 'Tests on ' + system_name + ' ' + system_id;
        }
    }

    var ee;
    if(req.query.summery == "true")
        ee = "true";

    var row, rows = [];
    var nrows = 0;
    while (row = getRow()) {
        nrows = nrows + 1;
        rows.push(row);
    }

    var content = templates.render(list_template, req, {
        rows: rows,
        isaboard: isaboard,
        system_name: system_name,
        system_id: system_id,
        req: req,
        ee: ee,
        enable_prev: enable_prev,
        skip_prev: skip_prev,
        skip_next: skip_next,
    });

    if (req.client) {
        $('#content').html(content);
        document.title = title;
    }
    else {
        return templates.render('base.html', req, {
            content: content,
            title: title
        });
    }

    if (req.client && list_template == 'index.html') {
        database.getView('board_stats', {group_level: 1}, function(err, data) {
            var n = 0;
            var d = {}
            for (row in data.rows) {
                key = data.rows[row].key;
                key = (key == 'none' ? 'unknown' : key);
                n = n + data.rows[row].value;
                d[key] = data.rows[row].value;
            }
            for (key in d) {
                var pct = 100.0 * d[key] / n;
                $('#board-status-' + key).css('width', String(pct)+'%');
                if (pct > 3) {
                    $('#board-status-' + key).html(d[key]);
                }
                $('#board-status-' + key).attr('title',key + ": " + d[key]);
            }
            $('#board-status-total').html(n);
        });

        database.getView('fec_stats', {group_level: 1}, function(err, data) {
            var n = 0;
            var d = {}
            for (row in data.rows) {
                key = data.rows[row].key;
                key = (key == 'none' ? 'unknown' : key);
                n = n + data.rows[row].value;
                d[key] = data.rows[row].value;
            }
            for (key in d) {
                var pct = 100.0 * d[key] / n;
                $('#fec-status-' + key).css('width', String(pct)+'%');
                if (pct > 3) {
                    $('#fec-status-' + key).html(d[key]);
                }
                $('#fec-status-' + key).attr('title',key + ": " + d[key]);
            }
            $('#fec-status-total').html(n);
        });

        database.getView('db_stats', {group_level: 1}, function(err, data) {
            var n = 0;
            var d = {}
            for (row in data.rows) {
                key = data.rows[row].key;
                key = (key == 'none' ? 'unknown' : key);
                n = n + data.rows[row].value;
                d[key] = data.rows[row].value;
            }
            for (key in d) {
                var pct = 100.0 * d[key] / n;
                $('#db-status-' + key).css('width', String(pct)+'%');
                if (pct > 3) {
                    $('#db-status-' + key).html(d[key]);
                }
                $('#db-status-' + key).attr('title',key + ": " + d[key]);
            }
            $('#db-status-total').html(n);
        });

        database.getView('location_stats', {group_level: 1}, function(err, data) {
            var n = 0;
            var d = {}
            for (row in data.rows) {
                key = data.rows[row].key;
                key = (key == 'none' ? 'unknown' : key);
                n = n + data.rows[row].value;
                d[key] = data.rows[row].value;
            }
            for (key in d) {
                var pct = 100.0 * d[key] / n;
                $('#board-location-' + key).css('width', String(pct)+'%');
                if (pct > 3) {
                    $('#board-location-' + key).html(d[key]);
                }
                $('#board-location-' + key).attr('title',key + ": " + d[key]);
            }
            $('#board-location-total').html(n);
        });
    }
};

// all tests, chronologically
exports.testhistory = function (head, req) {
    start({code: 200, headers: {'Content-Type': 'text/html'}});

    var list_template = "test_history.html";
    var title = "Test History";

    var skip_prev = ((req.query.skip) ? Number(req.query.skip) : 0) - 25;
    var enable_prev = (skip_prev > -25);
    skip_prev = Math.max(skip_prev, 0);
    var skip_next = ((req.query.skip) ? Number(req.query.skip) : 0) + 25;

    var row, rows = [];
    while (row = getRow()) {
        rows.push(row);
    }

    var content = templates.render(list_template, req, {
        rows: rows,
        enable_prev: enable_prev,
        skip_prev: skip_prev,
        skip_next: skip_next,
    });

    if (req.client) {
        $('#content').html(content);
        document.title = title;
    }
    else {
        return templates.render('base.html', req, {
            content: content,
            title: title
        });
    }
};

// all ecals, chronologically
// barely different from other tests, but different enough
exports.ecalhistory = function (head, req) {
    start({code: 200, headers: {'Content-Type': 'text/html'}});

    var list_template = "ecal_history.html";
    var title = "ECAL History";

    var row, rows = [];
    while (row = getRow()) {
        var c = [];
        for (crate in row.value.crates) {
            c.push({
                crate_id: row.value.crates[crate].crate_id,
                mask: row.value.crates[crate].slot_mask
            });
        }
        row.crate_meta = c;
        rows.push(row);
    }

    var content = templates.render(list_template, req, {
        rows: rows,
    });

    if (req.client) {
        $('#content').html(content);
        document.title = title;
    }
    else {
        return templates.render('base.html', req, {
            content: content,
            title: title
        });
    }
};

// final_test shows related tests inline
// originally done with a reduce, but it was flaky since reduction is small
exports.final_test = function (head, req) {
    start({code: 200, headers: {'Content-Type': 'text/html'}});

    var title = 'Final Test Results';

    // first row is final test document
    var record = getRow().value;

    // subsequent are related tests
    var test;
    var tests = [];
    while (test = getRow()) {
        tests.push({
            id: test.value._id,
            type: test.value.type,
            pass: test.value.pass,
            created: test.value.created
        });
    }    

    var content = templates.render("final_test.html", req, {
        record: record,
        tests: tests
    });

    if (req.client) {
        $('#content').html(content);
        document.title = title;
    }
    else {
        return templates.render('base.html', req, {
            content: content,
            title: title
        });
    }
};

// ecal
// shows related tests inline, like a final_test
exports.ecal = function (head, req) {
    start({code: 200, headers: {'Content-Type': 'text/html'}});

    var title = 'ECAL Results';
    var bad_tests = false;
    var bad_test_list = {};

    // first row is ecal document
    var record = getRow().value;

    // subsequent are related tests
    var test;
    var tests = [];
    while (test = getRow()) {
        if (!test.value.config) {
            bad_tests = true;
            bad_test_list[test.value._id] = true;
        }
        tests.push({
            id: test.value._id,
            type: test.value.type,
            pass: test.value.pass,
            created: test.value.created,
            crate_id: test.value.config ? test.value.config.crate_id : "-",
            slot_id: test.value.config ? test.value.config.slot : "-"
        });
    }

    record.settings.scmos_ids = [];
    for (var j=0; j<record.settings.scmos.length; j++) {
       record.settings.scmos_ids.push(j);
    }

    var crate_id_to_index = {};
    for (var i=0; i<record.crates.length; i++) {
        crate_id_to_index[record.crates[i].crate_id] = i;
        var islot = 0;
        for (var j=0; j<16; j++) {
            if (record.crates[i].slots.length-1 < j) {
                record.crates[i].slots.push({slot_id: j, enabled: false});
            }
            else if (record.crates[i].slots[j].slot_id != j) {
                record.crates[i].slots.splice(j, 0, {slot_id: j, enabled: false});
            }
            else {
                record.crates[i].slots[j].enabled = true;
            }
            islot++;
        }
    }

    for (var j=0; j<tests.length; j++) {
        if (!(record.crates[crate_id_to_index[tests[j].crate_id]])) {
            bad_tests = true;
            bad_test_list[tests[j].id] = true;
            continue;
        }
        if (!(record.crates[crate_id_to_index[tests[j].crate_id]].slots[tests[j].slot_id].tests)) {
            record.crates[crate_id_to_index[tests[j].crate_id]].slots[tests[j].slot_id].tests = [tests[j]];
        }
        else {
            record.crates[crate_id_to_index[tests[j].crate_id]].slots[tests[j].slot_id].tests.push(tests[j]);
        }
    }

    var content = templates.render("ecal.html", req, {
        record: record,
        bad_tests: bad_tests,
        bad_test_list: bad_test_list
    });

    if (req.client) {
        $('#content').html(content);
        document.title = title;
    }
    else {
        return templates.render('base.html', req, {
            content: content,
            title: title
        });
    }

    if (req.client) {
        // check if the configuration has changed since the ecal
        database.getDoc('configuration_snoplus', function(err, config) {
            for (var i=0; i<config.crates.length; i++) {
                var crate = config.crates[i]
                for (var j=0; j<crate.fecs.length; j++) {
                    var elem = $("#fec_id__" + String(i) + "_" + String(j));
                    if (elem) {
                        var fec = crate.fecs[j];
                        var ecal_fec = elem.text();
                        if (fec.id !== ecal_fec) {
                            elem.prepend('<a href="/debugdb/board/' + fec.id + '"><span class="ui-icon ui-icon-alert" style="display:inline-block;vertical-align:middle" title="Board ID is now ' + fec.id + '\""></span></a>&nbsp;');
                            elem.css('white-space', 'nowrap');
                            var link = elem.children("a");
                            link.css('font-weight', 'bold');
                            link.css('color', '#ffaaaa');
                        }

                        for (var k=0; k<fec.dbs.length; k++) {
                            elem = $("#db_id__" + String(i) + "_" + String(j) + "_" + String(k));
                            if (elem) {
                                var dboard = fec.dbs[k];
                                var ecal_db = elem.text();
                                if (dboard !== ecal_db) {
                                    elem.prepend('<a href="/debugdb/board/' + dboard + '"><span class="ui-icon ui-icon-alert" style="display:inline-block;vertical-align:middle" title="Board ID is now ' + dboard + '\""></span></a>&nbsp;');
                                    elem.css('white-space', 'nowrap');
                                    var link = elem.children("a");
                                    link.css('font-weight', 'bold');
                                    link.css('color', '#ffaaaa');
                                }
                            }
                        }
                    }
                }
            }
        });
    }
};

// log book entry list
exports.logbook = function (head, req) {
    start({code: 200, headers: {'Content-Type': 'text/html'}});

    var title = 'Debugging Log Book';

    var entry, entries = [];
    while (entry = getRow()) {
        entries.push({
            id: entry.value._id,
            created: entry.value.created,
            title: entry.value.title,
            clip: entry.value.clip
        });
    }    

    var content = templates.render("logbook_list.html", req, {
        rows: entries
    });

    if (req.client) {
        $('#content').html(content);
        document.title = title;
    }
    else {
        return templates.render('base.html', req, {
            content: content,
            title: title
        });
    }
};

exports.logbook_search = function(head, req) {
    start({code: 200, headers: {'Content-Type': 'text/html'}});

    var title = 'Log Book Search';

    var result, results = [];
    while (result = getRow()) {
        results.push({
            id: result.value.id,
            title: result.value.title,
        });
    }    

    var content = templates.render("logbook_search.html", req, {
        key: req.id,
        rows: results
    });

    if (req.client) {
        $('#content').html(content);
        document.title = title;
    }
    else {
        return templates.render('base.html', req, {
            content: content,
            title: title
        });
    }
};

exports.tags = function (head, req) {
    start({code: 200, headers: {'Content-Type': 'text/html'}});

    var board_name;

    if (req.query.startkey) {
        board_name = req.query.startkey.toString();
        if (board_name.substr(0,1) == "\"") {
            board_name = board_name.toString().substring(1,board_name.length-1);
        }
    }

    var title = 'Tags for board ' + board_name;

    var current_status = "None";
    var status_set = false;

    var row, rows = [];
    while (row = getRow()) {
        if (row.value.status != null && row.value.status != "none"){
            if (!status_set){
                status_set = true;
                current_status = row.value.status;
            }
            row.showstatus = true;
        }

        if (row.value.setup.mb.toString().length == 4 ||
          row.value.setup.db0.toString().length == 4 ||
          row.value.setup.db1.toString().length == 4 ||
          row.value.setup.db2.toString().length == 4 || 
          row.value.setup.db3.toString().length == 4) {
            row.showsetup = true;
        }

        if (row.value.author.toString().length > 0) {
          row.showauthor = true;
        }

        rows.push(row);
    }

    var content = templates.render("tag_list.html", req, {
        rows: rows,
        board_name: board_name,
        current_status: current_status,
        req: req,
    });

    if (req.client) {
        $('#content').html(content);
        document.title = title;
    }
    else {
        return templates.render('base.html', req, {
            content: content,
            title: title
        });
    }
};

exports.tag_list = function (head, req) {
    start({code: 200, headers: {'Content-Type': 'text/html'}});

    var listing_template = "all_tags_list.html";
    var title = "All tags by board";

    var rows = [];
    var row;
    while (row = getRow()) {
        var status = row.value[0];

        if (status == "bad") {
            status = '<span style="color:red"><b>bad</b></span>';
        }
        else if (status == "gold") {
            status = '<span style="color:gold"><b>gold</b></span>';
        }
        else if (status == "silver") {
            status = '<span style="color:silver"><b>silver</b></span>';
        }
        else if (status == "bone") {
            status = "<del>bone</del>";
        }

        rows.push({
            id: row.key,
            status: status,
            count: row.value[1]
        });
    }

    var content = templates.render(listing_template, req, {
        rows: rows,
    });

    if (req.client) {
        $('#content').html(content);
        document.title = title;
    }
    else {
        return templates.render('base.html', req, {
            content: content,
            title: title
        });
    }
};

exports.boards = function (head, req) {
    start({code: 200, headers: {'Content-Type': 'text/html'}});

    var listing_template = "boards.html";
    var title = "All boards";

    var rows = [];
    var row;
    while (row = getRow()) {
        var status = row.value[0];

        if (status == "bad") {
            status = '<span style="color:red"><b>bad</b></span>';
        }
        else if (status == "gold") {
            status = '<span style="color:gold"><b>gold</b></span>';
        }
        else if (status == "silver") {
            status = '<span style="color:silver"><b>silver</b></span>';
        }
        else if (status == "bone") {
            status = '<span style="font-size:16pt;">&#9760;</span>';
        }

        var d = {
            id: row.key,
            status: status,
            location: row.value[1],
            assigned: (row.value[2] != 20)
        };

        rows.push(d);
    }

    var content = templates.render(listing_template, req, {
        rows: rows
    });

    if (req.client) {
        $('#content').html(content);
        document.title = title;
    }
    else {
        return templates.render('base.html', req, {
            content: content,
            title: title
        });
    }
};

exports.board = function (head, req) {
    start({code: 200, headers: {'Content-Type': 'text/html'}});

    // first row is board
    var row = getRow();

    if (!row || !row.value || row.value.type != 'board') {
        var title = 'Add new board'
        var board_id = req.query.startkey[0];
        var content = templates.render("board_new.html", req, {
            board: board_id,
            type: {
                f: 'FEC',
                d: 'DB',
                e: 'PMTIC',
                t: 'MTC/A+',
                c: 'CTC',
                x: 'XL3'
            }[board_id.substr(0, 1)]
        });

        return templates.render('base.html', req, {
            content: content,
            title: title
        });
    }
    var board = row.value;

    if (board.board_type == 'Front-End Card') {
        board.board_type_short = 'fec';
    }
    if (board.board_type == 'Daughterboard') {
        board.board_type_short = 'db';
    }

    if (board.board_type == "PMTIC") {
        var channels = [];
        for (var i=0; i<board.channels.length; i++) {
            channels.push({id: i, good: board.channels[i]});
        }
        board.channels = channels;

        var relays = [];
        for (var i=0; i<board.relays.length; i++) {
            relays.push({id: i, good: board.relays[i]});
        }
        board.relays = relays;
    }

    var title = board.board_type + ' ' + board._id;

    var s = board.status;
    board.status = {
        gold: s == 'gold',
        silver: s == 'silver', 
        bad: s == 'bad', 
        bone: s == 'bone', 
        none: s == 'none' 
    }; 

    var l = board.location;
    board.location = {
        unknown: l == 'unknown' || s == '' || !s,
        surface: l == 'surface', 
        underground: l == 'underground', 
        penn: l == 'penn',
        other: l == 'other' 
    };

    var final_tests = [];
    var ecals = [];
    var fec_docs = [];
    var tags = [];
    var last_tag_status_datetime = new Date('12/31/1769');
    var tag_status = 'none';

    var row;
    while (row = getRow()) {
        var doc = row.value;
        if (doc.type == 'final_test') {
            final_tests.push({
                id: doc._id,
                pass: doc.pass,
                created: doc.created
            });
        }
        else if (doc.type == 'ecal') {
            var c = [];
            for (crate in doc.crates) {
                c.push({
                    crate_id: doc.crates[crate].crate_id,
                    mask: doc.crates[crate].slot_mask
                });
            }
            ecals.push({
                id: doc._id,
                archived: doc.archived,
                config: c,
                created: doc.created
            });
        }
        else if (row.key[1] == 3) {
            var created = (doc.created ? (new Date(doc.created)).toString() : null);
            fec_docs.push({
                id: doc._id,
                created: created
            });
        }
        else if (doc.type == 'tag') {
            doc.board_name = doc.board;
            if (doc.setup.db0 || doc.setup.db1 || doc.setup.db2 || doc.setup.db3) {
                doc.showdbs = true;
            }

            var s = doc.status;
            doc.sdict = {
                gold: s == 'gold',
                silver: s == 'silver', 
                bad: s == 'bad', 
                bone: s == 'bone', 
                none: s == 'none' 
            };

            if ((new Date(doc.created) > last_tag_status_datetime) && doc.status && doc.status != 'none') {
                tag_status = doc.status;
                last_tag_status_datetime = new Date(doc.created);
            }
            tags.push(doc);
        }
    }    

    // sort by date
    function date_sort(a, b) { return ((new Date(b.created)) - (new Date(a.created))); }
    final_tests.sort(date_sort);
    ecals.sort(date_sort);
    fec_docs.sort(date_sort);
    tags.sort(date_sort);

    var content = templates.render("board.html", req, {
        channels: (board.channels ? board.channels : null),
        relays: (board.relays ? board.relays : null),
        queens_id: (board.queens_id ? board.queens_id : null),
        board: board,
        final_tests: final_tests,
        ecals: ecals,
        fec_docs: fec_docs,
        tags: tags,
        tag_status: tag_status
    });

    if (req.client) {
        $('#content').html(content);
        document.title = title;
    }
    else {
        return templates.render('base.html', req, {
            content: content,
            title: title
        });
    }

    // load configurations from config doc
    if (req.client) {
        database.getDoc('configuration_snoplus', function(err, data) {
            var config = getConfig(board._id, data);
            $('#config-snoplus').html(templates.render("board_config.html", req, config));
        });

        database.getDoc('configuration_sno', function(err, data) {
            var config = getConfig(board._id, data);
            $('#config-sno').html(templates.render("board_config.html", req, config));
        });
    }
};

exports.crate = function (head, req) {
    start({code: 200, headers: {'Content-Type': 'text/html'}});

    var row = getRow();
    var crate_id = parseInt(row.key[1]);
    var crate = row.value;

    for (idx in crate.fecs) {
        crate.fecs[idx].slot = idx;
        crate.pmtics[idx] = {
            id: crate.pmtics[idx],
            slot: idx
        };
        for (jdx in crate.fecs[idx].dbs) {
            crate.fecs[idx].dbs[jdx] = {
                id: crate.fecs[idx].dbs[jdx],
                slot: jdx
            };
        }
        crate.fecs[idx].dbs = crate.fecs[idx].dbs.reverse();
    }

    var title = 'Crate ' + crate_id;

    var content = templates.render("crate.html", req, {
        crate_id: crate_id,
        experiement: row.key[0],
        xl3: crate.xl3,
        ctc: crate.ctc,
        lv_supply: crate.lv_supply,
        hv_supply: crate.hv_supply,
        fecs: crate.fecs.reverse(),
        pmtics: crate.pmtics.reverse()
    });

    if (req.client) {
        $('#content').html(content);
        document.title = title;
    }
    else {
        return templates.render('base.html', req, {
            content: content,
            title: title
        });
    }

    if (req.client) {
        var all_boards = [
            crate.ctc,
            crate.xl3,
            crate.hv_supply,
            crate.lv_supply
        ];

        for (var slot in crate.fecs) {
            all_boards.push(crate.fecs[slot].id);
            all_boards.push(crate.pmtics[slot].id);
            for (db in crate.fecs[slot].dbs) {
                all_boards.push(crate.fecs[slot].dbs[db].id);
            }
        }

        database.getView('tags_with_status', {group_level: 1}, function(err, data) {
            for (var row in data.rows) {
                var board = data.rows[row].key;
                if (all_boards.indexOf(board) >= 0) {
                    status = data.rows[row].value[1] ? data.rows[row].value[1] : 'none';
                    var tag = {
                        none: 'tag_unknown.png',
                        gold: 'tag_gold.png',
                        silver: 'tag_silver.png',
                        bad: 'tag_bad.png',
                        bone: 'tag_bone.png'
                    }[status];
                    $('#tag-' + board.toLowerCase()).attr('src', utils.getBaseURL() + '/static/images/' + tag);
                }
            }
        });

        database.getView('boards', function(err, data) {
            for (var row in data.rows) {
                var board = data.rows[row].key.toLowerCase();
                if (all_boards.indexOf(board) >= 0) {
                    var status = data.rows[row].value[0] ? data.rows[row].value[0] : 'none';
                    var loc = '@' + {
                        none: '?',
                        unknown: '?',
                        penn: 'penn',
                        underground: 'ug',
                        surface: 'surf',
                        other: 'other'
                    }[data.rows[row].value[1]];
                    $('#location-' + board).html(loc);
                    $('#location-' + board).closest('td').addClass(status);

                    // show channel status for DBs
                    if (board.substr(0,1) == 'd') {
                        var html = '<div style="display:block">';
                        for (var i=0; i<8; i++) {
                            html += '<span style="margin-right:1px;display:inline-block;height:4px;width:4px;background:' + (data.rows[row].value[2][i].good ? 'green' : 'red') + ';"></span>';
                        }
                        html += '</div>';
                        $('#location-' + board).parent().append(html);
                    }
                }
            }
        });
    }
};

exports.parts = function (head, req) {
    start({code: 200, headers: {'Content-Type': 'text/html'}});

    var parts = [];
    var row;
    while (row = getRow()) {
        var name = row.key;
        var part = row.value;
        var l = part.locations;
        part.locations = [];
        for (k in l) {
            part.locations.push({
                name: k,
                quantity: l[k]
            });
        }
        part.name = name;
        parts.push(part);
    }

if (req.client)
console.log(parts)
    var title = 'Spare Parts';
    var content = templates.render('parts.html', req, {
        parts: parts
    });

    if (req.client) {
        $('#content').html(content);
        document.title = title;
    }
    else {
        return templates.render('base.html', req, {
            content: content,
            title: title
        });
    }
};

