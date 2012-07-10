/**
 * List functions to be exported from the design doc.
 */

var templates = require('kanso/templates');
var cookies = require('kanso/cookies');
var forms = require('kanso/forms');
var querystring = require('kanso/querystring');
var database = require('kanso/db');
var utils = require('kanso/utils');

// unique list of fecs, dbs, ...
exports.listing = function (head, req) {
    start({code: 200, headers: {'Content-Type': 'text/html'}});

    //req.query['group_level'] = 1

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
        // tell the template not to quote integer keys
        if (type == "crate")
            d["noquotes"] = true;
        rows.push(d);
    }

    var content = templates.render(listing_template, req, {
        listing_name: listing_name,
        rows: rows,
    });

    if (req.client) {
        $('#content').html(content);
        document.title = title;
        req.cookie = cookies.readBrowserCookies();
        document.cookies = cookies.readBrowserCookies();
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

    // grab active locations from cookies for filtering
    var locations = {
        'penn': (req.cookie.penn == "true") ? true : false,
        'underground': (req.cookie.underground == "true") ? true : false,
        'surface': (req.cookie.surface == "true") ? true : false
    }

    // "system" is a FEC, DB, etc.
    var system_name;
    var system_id;
    var isaboard = true;
    var list_template = "index.html";
    var title = "SNO+ Electronics Debugging";
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
            system_id = req.query.startkey;
            system_id = system_id.toString().substring(1, system_id.length-1);
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
        // filter locations. not as good as filtering the view...
        //if (!locations[row.value.loc])
        //    continue;
        // limit index page to 10 most recent. also should be done on the view.
        if (list_template == "index.html" && nrows>10)
            break;
        nrows = nrows + 1;
        rows.push(row);
    }

    var content = templates.render(list_template, req, {
        rows: rows,
        isaboard: isaboard,
        system_name: system_name,
        system_id: system_id,
        req: req,
        ee: ee
    });

    if (req.client) {
        $('#content').html(content);
        document.title = title;
        req.cookie = cookies.readBrowserCookies();
        document.cookies = cookies.readBrowserCookies();
    }
    else {
        return templates.render('base.html', req, {
            content: content,
            title: title
        });
    }
};

// all tests, chronologically
exports.testhistory = function (head, req) {
    start({code: 200, headers: {'Content-Type': 'text/html'}});

    var list_template = "test_history.html";
    var title = "Test History";

    var row, rows = [];
    while (row = getRow()) {
        rows.push(row);
    }

    var content = templates.render(list_template, req, {
        rows: rows,
    });

    if (req.client) {
        $('#content').html(content);
        document.title = title;
        req.cookie = cookies.readBrowserCookies();
        document.cookies = cookies.readBrowserCookies();
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
        req.cookie = cookies.readBrowserCookies();
        document.cookies = cookies.readBrowserCookies();
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

    // first row is record
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

    // first row is record
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
        if (!(record.crates[crate_id_to_index[tests[j].crate_id]].slots[tests[j].slot_id].tests))
            record.crates[crate_id_to_index[tests[j].crate_id]].slots[tests[j].slot_id].tests = [tests[j]];
        else
            record.crates[crate_id_to_index[tests[j].crate_id]].slots[tests[j].slot_id].tests.push(tests[j]);
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
            clip: (entry.value.text.length < 50 ? entry.value.text : entry.value.text.substring(0,47) + '...')
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

    title = 'Tags for board ' + board_name;

    var row, rows = [];
    var nrows = 0;
    var current_status = "None";
    var status_set = 0;
    while (row = getRow()) {
        nrows = nrows + 1;
        if (row.value.status != null && row.value.status != "none"){
          if (status_set == 0){
            status_set = 1;
            current_status = row.value.status;
          }
          row.showstatus = true;
        }
        if (row.value.setup.mb.toString().length == 4 ||
            row.value.setup.db0.toString().length == 4 ||
            row.value.setup.db1.toString().length == 4 ||
            row.value.setup.db2.toString().length == 4 || 
            row.value.setup.db3.toString().length == 4)
          row.showsetup = true;
        if (row.value.author.toString().length > 0)
          row.showauthor = true;
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

    req.query['group_level'] = 1

    var listing_template = "all_tags_list.html";
    var title = "All tags by board";

    var rows = [];
    var row;
    while (row = getRow()) {
        var id = row.key;
        var status = row.value[0];
        if (status == "bad"){
          status = '<span style="color:red"><b>bad</b></span>';
        }else if(status == "gold"){
          status = '<span style="color:gold"><b>gold</b></span>';
        }else if(status == "silver"){
          status = '<span style="color:silver"><b>silver</b></span>';
        }else if(status == "bone"){
          status = "<del>bone</del>";
        }
        var count = row.value[1];
        var d = {'id': id, 'status': status, 'count': count};
        rows.push(d);
    }

    var content = templates.render(listing_template, req, {
        rows: rows,
    });

    if (req.client) {
        $('#content').html(content);
        document.title = title;
        req.cookie = cookies.readBrowserCookies();
        document.cookies = cookies.readBrowserCookies();
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
            location: row.value[1]
        };

        rows.push(d);
    }

    var content = templates.render(listing_template, req, {
        rows: rows
    });

    if (req.client) {
        $('#content').html(content);
        document.title = title;
        req.cookie = cookies.readBrowserCookies();
        document.cookies = cookies.readBrowserCookies();
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
    var board = getRow().value;

    if (board.board_type == 'Front-End Card')
        board.board_type_short = 'fec';
    if (board.board_type == 'Daughterboard')
        board.board_type_short = 'db';

    var title = board['board_type'] + ' ' + board['_id'];

    var s = board['status'];
    board['status'] = {
        gold: s == 'gold',
        silver: s == 'silver', 
        bad: s == 'bad', 
        bone: s == 'bone', 
        none: s == 'none' 
    }; 

    var l = board['location'];
    board['location'] = {
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
    var last_tag_status_datetime = new Date(null);
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
        else if (doc.name == 'FEC') {
            fec_docs.push({
                id: doc._id,
                created: (new Date(doc.timestamp_generated)).toString()
            });
        }
        else if (doc.type == 'tag') {
            doc.board_name = doc.board;
            if ((new Date(doc.created) > last_tag_status_datetime) && doc.status) {
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
};

exports.crate = function (head, req) {
    start({code: 200, headers: {'Content-Type': 'text/html'}});

    var crate_id;
    var boards = {fecs:[], pmtics: []};
    for (var slot=0; slot<16; slot++) {
        boards.fecs.push({dbs: [], fec: {}});
        boards.pmtics.push({});
    }

    var row;
    while (row = getRow()) {
        crate_id = parseInt(row.key[0]);

        row.value.location = {
            penn: 'penn',
            surface: 'surf',
            underground: 'ug',
            unknown: '?',
            other: 'other'
        }[row.value.location];

        if (row.key[1] == 'PMTIC') {
            var slot = parseInt(row.key[2])
            boards.pmtics[slot] = row.value;
            boards.pmtics[slot].slot = slot;
        }
        else if (row.key[1] == 'CTC')
            boards.ctc = row.value;
        else if (row.key[1] == 'Front-End Card') {
            var slot = parseInt(row.key[2])
            boards.fecs[slot].fec = row.value;
            boards.fecs[slot].fec.slot = slot;
        }
        else if (row.key[1] == 'Daughterboard') {
            var slot = parseInt(row.key[2])
            var db_slot = parseInt(row.key[3])
            boards.fecs[slot].dbs[db_slot] = row.value;
            boards.fecs[slot].dbs[db_slot].slot = db_slot;
        }
        else if (row.key[1] == 'XL3')
            boards.xl3 = row.value;
    }

    var title = 'Crate ' + crate_id;

    var content = templates.render("crate.html", req, {
        crate_id: crate_id,
        boards: boards,
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
        // if possible, fill in debugging tag status
        // make a separate query to the tags_by_crate view, which collates tags
        // and boards to map tags to crates.
        var q = {
            group_level: 2,
            startkey: [crate_id],
            endkey: [crate_id, {}]
        }
        database.getView('tags_by_crate', q, function(err, data) {
            for (row in data.rows) {
                if (data.rows[row].value && 'crate' in data.rows[row].value) {
                    var board = data.rows[row].key[1];
                    var status = data.rows[row].value.status ? data.rows[row].value.status : 'none';
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
    }
};

