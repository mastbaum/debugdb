/**
 * List functions to be exported from the design doc.
 */

var templates = require('kanso/templates');
var cookies = require('kanso/cookies');

// unique list of fecs, dbs, ...
exports.listing = function (head, req) {
    start({code: 200, headers: {'Content-Type': 'text/html'}});

    req.query['group_level'] = 1

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
    var list_template = "index.html";
    var title = "SNO+ Electronics Debugging";
    if (req.query.key) {
        list_template = "test_list.html";
        if(req.query.key[0] == "{") {
            // match a crate and slot
            r = jQuery.parseJSON(req.query.key);
            system_name = "Crate " + r['crate'] + ', Slot ' + r['slot'];
            system_id = "";
        }
        else {
            system_id = req.query.key;
            if (req.path[2] == 'tests_by_fec')
                system_name = "FEC";
            if (req.path[2] == 'tests_by_crate')
                system_name = "Crate";
            if (req.path[2] == 'tests_by_db')
                system_name = "Daughterboard";
            if (req.path[2] == 'tests_by_name')
                system_name = "Test";
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

// most recent tests for each crate/slot
exports.crateview = function (head, req) {
    start({code: 200, headers: {'Content-Type': 'text/html'}});
    var title = 'CrateView';

    // use a dictionary to include index since everything is
    // an interator in the dust template
    var crates = [];
    for (var i=0; i<19; i++) {
        crates[i] = {'slots': []};
        crates[i]['crate_id'] = i.toString();
        for (var j=0; j<16; j++) {
            crates[i]['slots'][j] = {};
            crates[i]['slots'][j]['slot'] = j.toString();
        }
    }

    var row;
    while (row = getRow()) {
        var crate_id = row.value.config.crate_id;
        var slot = row.value.config.slot;
        if ('row' in crates[crate_id]['slots'][slot]) {
            if (row.value.created > crates[crate_id]['slots'][slot]['row'].value.created)
                crates[crate_id]['slots'][slot]['row'] = row;
        }
        else
            crates[crate_id]['slots'][slot]['row'] = row;
    }

    var content = templates.render("crate_view.html", req, {
        rows: crates,
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
