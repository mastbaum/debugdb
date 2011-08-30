/**
 * List functions to be exported from the design doc.
 */

var templates = require('kanso/templates');

exports.test_list = function (head, req) {
    start({code: 200, headers: {'Content-Type': 'text/html'}});

    var system_name;
    var system_id;
    if (req.path[2] == 'tests_by_fec')
        system_name = "FEC";
    if (req.path[2] == 'tests_by_crate')
        system_name = "Crate";
    if (req.path[2] == 'tests_by_db')
        system_name = "Daughterboard";
    system_id = req.query.key;

    var row, rows = [];
    while (row = getRow()) {
        rows.push(row);
    }

    var content = templates.render("test_list.html", req, {
        rows: rows,
        system_name: system_name,
        system_id: system_id,
        req: req
    });

    if (req.client) {
        $('#content').html(content);
        document.title = 'Tests on ' + system_name + ' ' + system_id;
    }
    else {
        return templates.render('base.html', req, {
            content: content,
            title: 'Tests on ' + system_name + ' ' + system_id
        });
    }
};

