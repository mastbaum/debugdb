/**
 * List functions to be exported from the design doc.
 */

var templates = require('kanso/templates');

exports.test_list = function (head, req) {
    start({code: 200, headers: {'Content-Type': 'text/html'}});

    var system_name;
    var system_id;
    var list_template = "index.html";
    var title = "SNO+ Electronics Debugging";
    system_id = req.query.key;
    if (system_id) {
        list_template = "test_list.html";
        if (req.path[2] == 'tests_by_fec')
            system_name = "FEC";
        if (req.path[2] == 'tests_by_crate')
            system_name = "Crate";
        if (req.path[2] == 'tests_by_db')
            system_name = "Daughterboard";
        title = 'Tests on ' + system_name + ' ' + system_id;
    }
    var ee;
    if(req.query.summery == "true")
        ee = "true";

    var row, rows = [];
    while (row = getRow()) {
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
    }
    else {
        return templates.render('base.html', req, {
            content: content,
            title: title
        });
    }
};

