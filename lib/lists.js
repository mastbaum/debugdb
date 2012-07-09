/**
 * List functions to be exported from the design doc.
 */

var templates = require('kanso/templates');
var cookies = require('kanso/cookies');
var forms = require('kanso/forms');
var querystring = require('kanso/querystring');

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

// most recent tests for each crate/slot
exports.crateview = function (head, req) {
    start({code: 200, headers: {'Content-Type': 'text/html'}});
    var title = 'CrateView';

    var fec_map = {
      "f01a": {"slot": 10, "crate": 17}, "f12c": {"slot": 10, "crate": 6},
      "f11d": {"slot": 12, "crate": 7}, "f11e": {"slot": 9, "crate": 6},
      "f016": {"slot": 4, "crate": 18}, "f11a": {"slot": 7, "crate": 7},
      "f11b": {"slot": 8, "crate": 0}, "f11c": {"slot": 6, "crate": 13},
      "f08f": {"slot": 5, "crate": 17}, "f0c3": {"slot": 13, "crate": 14},
      "f0f6": {"slot": 5, "crate": 11}, "f126": {"slot": 15, "crate": 1},
      "f0f1": {"slot": 14, "crate": 1}, "f0f2": {"slot": 3, "crate": 17},
      "f0f3": {"slot": 13, "crate": 12}, "f121": {"slot": 7, "crate": 18},
      "f0f8": {"slot": 15, "crate": 4}, "f0f9": {"slot": 15, "crate": 0},
      "f120": {"slot": 0, "crate": 13}, "f204": {"slot": 11, "crate": 5},
      "f043": {"slot": 7, "crate": 9}, "f040": {"slot": 4, "crate": 11},
      "f0c0": {"slot": 13, "crate": 11}, "f046": {"slot": 4, "crate": 14},
      "f047": {"slot": 12, "crate": 10}, "f044": {"slot": 14, "crate": 5},
      "f203": {"slot": 5, "crate": 5}, "f08b": {"slot": 10, "crate": 15},
      "f049": {"slot": 3, "crate": 0}, "f08c": {"slot": 7, "crate": 16},
      "f134": {"slot": 14, "crate": 17}, "f086": {"slot": 12, "crate": 17},
      "f150": {"slot": 9, "crate": 17}, "f09c": {"slot": 9, "crate": 16},
      "f0cb": {"slot": 1, "crate": 7}, "f05e": {"slot": 6, "crate": 15},
      "f05d": {"slot": 13, "crate": 3}, "f0c8": {"slot": 9, "crate": 12},
      "f08a": {"slot": 6, "crate": 7}, "f045": {"slot": 15, "crate": 17},
      "f084": {"slot": 2, "crate": 18}, "f05c": {"slot": 2, "crate": 14},
      "f0cd": {"slot": 4, "crate": 16}, "f0fe": {"slot": 0, "crate": 9},
      "f0ff": {"slot": 1, "crate": 2}, "f0fa": {"slot": 10, "crate": 2},
      "f0fb": {"slot": 8, "crate": 14}, "f129": {"slot": 0, "crate": 18},
      "f15a": {"slot": 4, "crate": 6}, "f083": {"slot": 8, "crate": 13},
      "f118": {"slot": 11, "crate": 9}, "f080": {"slot": 5, "crate": 14},
      "f116": {"slot": 7, "crate": 17}, "f117": {"slot": 10, "crate": 9},
      "f110": {"slot": 7, "crate": 5}, "f111": {"slot": 3, "crate": 14},
      "f191": {"slot": 14, "crate": 11}, "f006": {"slot": 10, "crate": 16},
      "f059": {"slot": 0, "crate": 14}, "f058": {"slot": 14, "crate": 0},
      "f0b9": {"slot": 1, "crate": 3}, "f055": {"slot": 1, "crate": 1},
      "f054": {"slot": 1, "crate": 5}, "f057": {"slot": 2, "crate": 3},
      "f051": {"slot": 15, "crate": 18}, "f050": {"slot": 5, "crate": 8},
      "f053": {"slot": 10, "crate": 8}, "f052": {"slot": 5, "crate": 9},
      "f04b": {"slot": 0, "crate": 15}, "f0f7": {"slot": 7, "crate": 12},
      "f0d9": {"slot": 5, "crate": 15}, "f0f5": {"slot": 12, "crate": 15},
      "f04e": {"slot": 7, "crate": 6}, "f148": {"slot": 2, "crate": 16},
      "f0dc": {"slot": 9, "crate": 15}, "f0ee": {"slot": 6, "crate": 16},
      "f0ed": {"slot": 8, "crate": 6}, "f0ef": {"slot": 7, "crate": 15},
      "f0ea": {"slot": 2, "crate": 1}, "f0ec": {"slot": 2, "crate": 9},
      "f13e": {"slot": 10, "crate": 5}, "f0d2": {"slot": 13, "crate": 15},
      "f0d3": {"slot": 4, "crate": 9}, "f0d0": {"slot": 3, "crate": 12},
      "f0d1": {"slot": 4, "crate": 10}, "f0d6": {"slot": 8, "crate": 4},
      "f0d4": {"slot": 12, "crate": 14}, "f108": {"slot": 12, "crate": 5},
      "f107": {"slot": 6, "crate": 5}, "f106": {"slot": 4, "crate": 2},
      "f0d8": {"slot": 8, "crate": 15}, "f104": {"slot": 6, "crate": 11},
      "f103": {"slot": 6, "crate": 12}, "f102": {"slot": 8, "crate": 2},
      "f101": {"slot": 12, "crate": 9}, "f100": {"slot": 6, "crate": 0},
      "f011": {"slot": 15, "crate": 15}, "f223": {"slot": 2, "crate": 2},
      "f122": {"slot": 15, "crate": 13}, "f224": {"slot": 12, "crate": 6},
      "f020": {"slot": 12, "crate": 18}, "f021": {"slot": 6, "crate": 1},
      "f022": {"slot": 7, "crate": 8}, "f024": {"slot": 7, "crate": 0},
      "f025": {"slot": 2, "crate": 8}, "fffd": {"slot": 1, "crate": 8},
      "f027": {"slot": 9, "crate": 2}, "f04a": {"slot": 1, "crate": 13},
      "f0b6": {"slot": 1, "crate": 14}, "f03c": {"slot": 10, "crate": 10},
      "f03b": {"slot": 15, "crate": 9}, "f03a": {"slot": 15, "crate": 14},
      "f0b7": {"slot": 8, "crate": 7}, "f03f": {"slot": 14, "crate": 12},
      "f03e": {"slot": 14, "crate": 14}, "f03d": {"slot": 1, "crate": 4},
      "f0db": {"slot": 7, "crate": 4}, "f042": {"slot": 9, "crate": 11},
      "f0da": {"slot": 8, "crate": 3}, "f0df": {"slot": 3, "crate": 13},
      "f04d": {"slot": 1, "crate": 16}, "f0dd": {"slot": 12, "crate": 13},
      "f0de": {"slot": 11, "crate": 4}, "f151": {"slot": 8, "crate": 17},
      "f10e": {"slot": 13, "crate": 9}, "f10d": {"slot": 14, "crate": 10},
      "f10c": {"slot": 13, "crate": 0}, "f10b": {"slot": 0, "crate": 2},
      "f009": {"slot": 7, "crate": 10}, "f0e9": {"slot": 15, "crate": 5},
      "f0e8": {"slot": 8, "crate": 18}, "f0e5": {"slot": 11, "crate": 1},
      "f133": {"slot": 3, "crate": 3}, "f0e7": {"slot": 10, "crate": 4},
      "f0e6": {"slot": 13, "crate": 1}, "f0e1": {"slot": 11, "crate": 17},
      "f0e0": {"slot": 0, "crate": 4}, "f0e3": {"slot": 4, "crate": 5},
      "f135": {"slot": 14, "crate": 4}, "f039": {"slot": 5, "crate": 1},
      "f038": {"slot": 1, "crate": 12}, "f239": {"slot": 8, "crate": 16},
      "f033": {"slot": 14, "crate": 9}, "f032": {"slot": 12, "crate": 4},
      "f031": {"slot": 0, "crate": 1}, "f030": {"slot": 1, "crate": 0},
      "f037": {"slot": 10, "crate": 0}, "f036": {"slot": 8, "crate": 10},
      "f035": {"slot": 11, "crate": 11}, "f034": {"slot": 3, "crate": 15},
      "f109": {"slot": 6, "crate": 17}, "f02a": {"slot": 11, "crate": 7},
      "f02b": {"slot": 11, "crate": 12}, "f02c": {"slot": 15, "crate": 7},
      "f02e": {"slot": 4, "crate": 15}, "f02f": {"slot": 4, "crate": 17},
      "f14f": {"slot": 13, "crate": 13}, "f125": {"slot": 7, "crate": 3},
      "f124": {"slot": 9, "crate": 1}, "f127": {"slot": 5, "crate": 4},
      "f01b": {"slot": 12, "crate": 0}, "f01e": {"slot": 0, "crate": 5},
      "f01d": {"slot": 5, "crate": 10}, "f088": {"slot": 8, "crate": 1},
      "f089": {"slot": 5, "crate": 3}, "f0cc": {"slot": 1, "crate": 9},
      "f087": {"slot": 1, "crate": 6}, "f0ca": {"slot": 7, "crate": 13},
      "f085": {"slot": 13, "crate": 18}, "f082": {"slot": 0, "crate": 17},
      "f0cf": {"slot": 0, "crate": 8}, "f0ce": {"slot": 5, "crate": 13},
      "f081": {"slot": 2, "crate": 4}, "f0b8": {"slot": 7, "crate": 11},
      "f132": {"slot": 3, "crate": 1}, "f004": {"slot": 11, "crate": 10},
      "f002": {"slot": 13, "crate": 10}, "f000": {"slot": 5, "crate": 0},
      "f001": {"slot": 10, "crate": 14}, "f09a": {"slot": 2, "crate": 5},
      "f0b1": {"slot": 3, "crate": 10}, "f0b2": {"slot": 5, "crate": 12},
      "f09b": {"slot": 11, "crate": 0}, "f09e": {"slot": 12, "crate": 8},
      "f0b5": {"slot": 9, "crate": 14}, "f008": {"slot": 1, "crate": 10},
      "f09f": {"slot": 0, "crate": 7}, "f131": {"slot": 2, "crate": 12},
      "f007": {"slot": 15, "crate": 8}, "f137": {"slot": 3, "crate": 9},
      "f15b": {"slot": 12, "crate": 16}, "f0e2": {"slot": 11, "crate": 6},
      "f00f": {"slot": 9, "crate": 7}, "f098": {"slot": 15, "crate": 12},
      "f00d": {"slot": 13, "crate": 17}, "f00e": {"slot": 4, "crate": 1},
      "f00b": {"slot": 2, "crate": 15}, "f00c": {"slot": 9, "crate": 4},
      "f156": {"slot": 15, "crate": 11}, "f00a": {"slot": 15, "crate": 6},
      "f158": {"slot": 13, "crate": 4}, "f090": {"slot": 11, "crate": 8},
      "f093": {"slot": 9, "crate": 9}, "f0bc": {"slot": 8, "crate": 8},
      "f095": {"slot": 5, "crate": 2}, "f0be": {"slot": 4, "crate": 3},
      "f097": {"slot": 14, "crate": 2}, "f096": {"slot": 10, "crate": 7},
      "f12e": {"slot": 0, "crate": 3}, "f12d": {"slot": 14, "crate": 6},
      "f0c9": {"slot": 3, "crate": 2}, "f012": {"slot": 14, "crate": 3},
      "f015": {"slot": 12, "crate": 1}, "f014": {"slot": 10, "crate": 13},
      "f017": {"slot": 12, "crate": 2}, "f12b": {"slot": 13, "crate": 2},
      "f019": {"slot": 3, "crate": 7}, "f0c2": {"slot": 8, "crate": 12},
      "f0c1": {"slot": 11, "crate": 3}, "f08e": {"slot": 15, "crate": 3},
      "f0c7": {"slot": 2, "crate": 11}, "f0c6": {"slot": 2, "crate": 0},
      "f0c5": {"slot": 9, "crate": 0}, "f0c4": {"slot": 6, "crate": 6},
      "f258": {"slot": 3, "crate": 6}, "f026": {"slot": 7, "crate": 14},
      "f128": {"slot": 11, "crate": 14}, "f01c": {"slot": 14, "crate": 13},
      "f05f": {"slot": 5, "crate": 18}, "f0a2": {"slot": 11, "crate": 16},
      "f099": {"slot": 6, "crate": 10}, "f141": {"slot": 3, "crate": 4},
      "f146": {"slot": 11, "crate": 15}, "f145": {"slot": 2, "crate": 6},
      "f144": {"slot": 0, "crate": 16}, "f08d": {"slot": 9, "crate": 10},
      "f0d5": {"slot": 9, "crate": 8}, "f0aa": {"slot": 6, "crate": 14},
      "f07f": {"slot": 5, "crate": 16}, "f0ac": {"slot": 10, "crate": 12},
      "f0ab": {"slot": 8, "crate": 9}, "f0ae": {"slot": 14, "crate": 16},
      "f0ad": {"slot": 10, "crate": 18}, "f13f": {"slot": 1, "crate": 17},
      "f154": {"slot": 2, "crate": 17}, "f105": {"slot": 6, "crate": 18},
      "f155": {"slot": 0, "crate": 11}, "f064": {"slot": 0, "crate": 10},
      "f065": {"slot": 1, "crate": 18}, "f066": {"slot": 13, "crate": 7},
      "f067": {"slot": 4, "crate": 8}, "f060": {"slot": 12, "crate": 12},
      "f061": {"slot": 1, "crate": 15}, "f062": {"slot": 7, "crate": 1},
      "f063": {"slot": 12, "crate": 3}, "f157": {"slot": 2, "crate": 13},
      "f068": {"slot": 13, "crate": 6}, "f069": {"slot": 0, "crate": 0},
      "f018": {"slot": 4, "crate": 13}, "f091": {"slot": 11, "crate": 13},
      "f07e": {"slot": 14, "crate": 18}, "f07d": {"slot": 3, "crate": 5},
      "f07c": {"slot": 0, "crate": 6}, "f07b": {"slot": 4, "crate": 4},
      "f07a": {"slot": 1, "crate": 11}, "f159": {"slot": 8, "crate": 11},
      "f0bb": {"slot": 2, "crate": 10}, "f0a1": {"slot": 14, "crate": 15},
      "f0a0": {"slot": 4, "crate": 0}, "f0a3": {"slot": 11, "crate": 2},
      "f092": {"slot": 10, "crate": 11}, "f0a5": {"slot": 2, "crate": 7},
      "f0a4": {"slot": 3, "crate": 11}, "f0a7": {"slot": 9, "crate": 5},
      "f0a6": {"slot": 13, "crate": 5}, "f0bd": {"slot": 15, "crate": 16},
      "f094": {"slot": 3, "crate": 8}, "f14c": {"slot": 8, "crate": 5},
      "f14b": {"slot": 13, "crate": 16}, "f14a": {"slot": 9, "crate": 18},
      "f0bf": {"slot": 14, "crate": 7}, "f14e": {"slot": 6, "crate": 4},
      "f14d": {"slot": 6, "crate": 9}, "f077": {"slot": 6, "crate": 2},
      "f076": {"slot": 6, "crate": 8}, "f075": {"slot": 4, "crate": 7},
      "f074": {"slot": 5, "crate": 6}, "f073": {"slot": 3, "crate": 18},
      "f072": {"slot": 6, "crate": 3}, "f071": {"slot": 9, "crate": 3},
      "f010": {"slot": 14, "crate": 8}, "f029": {"slot": 15, "crate": 10},
      "f013": {"slot": 15, "crate": 2}, "f079": {"slot": 10, "crate": 1},
      "f078": {"slot": 3, "crate": 16}, "f06d": {"slot": 0, "crate": 12},
      "f06e": {"slot": 9, "crate": 13}, "f06f": {"slot": 12, "crate": 11},
      "f12f": {"slot": 13, "crate": 8}, "f06a": {"slot": 5, "crate": 7},
      "f06b": {"slot": 7, "crate": 2}, "f06c": {"slot": 10, "crate": 3},
      "f12a": {"slot": 4, "crate": 12}, "f0ba": {"slot": 11, "crate": 18}
    };

    // use a dictionary to include index since everything is
    // an iterator in the dust template
    var crates = [];
    var crates_pos = []; // crates, in real slots in the detector
    for (var i=0; i<19; i++) {
        crates[i] = {'slots': []};
        crates[i]['crate_id'] = i.toString();
        crates_pos[i] = {'slots': []};
        crates_pos[i]['crate_id'] = i.toString();
        for (var j=0; j<16; j++) {
            crates[i]['slots'][j] = {};
            crates[i]['slots'][j]['slot'] = j.toString();
            crates_pos[i]['slots'][j] = {};
            crates_pos[i]['slots'][j]['slot'] = j.toString();
        }
    }

    var row;
    var unmatched = []; // list of fec ids not in our real location map
    while (row = getRow()) {
        var crate_id = row.value.config.crate_id;
        var slot = row.value.config.slot;
        if (fec_map[row.value.config.fec_id]) {
          var crate_id_real = fec_map[row.value.config.fec_id]['crate'];
          var slot_real = fec_map[row.value.config.fec_id]['slot'];
        }
        else {
          unmatched.push(row.value.config.fec_id);
        }
        if (crate_id >= 0 && crate_id < 19 && slot >= 0 && slot < 16) {
            if ('row' in crates[crate_id]['slots'][slot]) {
                if (row.value.created > crates[crate_id]['slots'][slot]['row'].value.created)
                    crates[crate_id]['slots'][slot]['row'] = row;
            }
            else {
                crates[crate_id]['slots'][slot]['row'] = row;
            }
        }

        if (crate_id_real >= 0 && crate_id_real < 19 && slot_real >= 0 && slot_real < 16) {
            if ('row' in crates_pos[crate_id_real]['slots'][slot_real]) {
                if (row.value.created > crates_pos[crate_id_real]['slots'][slot_real]['row'].value.created)
                    crates_pos[crate_id_real]['slots'][slot_real]['row'] = row;
            }
            else {
                crates_pos[crate_id_real]['slots'][slot_real]['row'] = row;
            }
        }
    }

    var content = templates.render("crate_view.html", req, {
        rows: crates,
        rows_pos: crates_pos,
        unmatched: unmatched
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
    var list_template = "index.html";
    var title = "SNO+ Electronics Debugging";
    if (req.query.startkey) {
        list_template = "tag_list.html";
        board_name = req.query.startkey;
        board_name = board_name.toString().substring(1,board_name.length-1);
        title = 'Tags for board ' + board_name;
    }
    var ee;
    if(req.query.summery == "true")
        ee = "true";

    var row, rows = [];
    var nrows = 0;
    var current_status = "None";
    var status_set = 0;
    while (row = getRow()) {
        // filter locations. not as good as filtering the view...
        //if (!locations[row.value.loc])
        //    continue;
        // limit index page to 10 most recent. also should be done on the view.
        if (list_template == "index.html" && nrows>10)
            break;
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

    var content = templates.render(list_template, req, {
        rows: rows,
        board_name: board_name,
        current_status: current_status,
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

exports.crater = function (head, req) {
    start({code: 200, headers: {'Content-Type': 'text/html'}});

    var crate_id;
    var boards = {fecs:[], pmtics: []};
    for (var slot=0; slot<16; slot++) {
        var fec = {xid: slot, dbs: []};
        for (var db=0; db<4; db++) {
            fec.dbs.push({idx: db});
        }
        boards.fecs.push(fec);
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
        if (row.key[1] == 'PMTIC')
            boards.pmtics[parseInt(row.key[2])] = row.value;
        else if (row.key[1] == 'CTC')
            boards.ctc = row.value;
        else if (row.key[1] == 'Front-End Card')
            boards.fecs[parseInt(row.key[2])].fec = row.value;
        else if (row.key[1] == 'Daughterboard')
            boards.fecs[parseInt(row.key[2])].dbs[parseInt(row.key[3])] = row.value;
        else if (row.key[1] == 'XL3')
            boards.xl3 = row.value;
    }

    var title = 'Crate ' + crate_id;

/*
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
*/
    var content = templates.render("crater.html", req, {
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
};
