/**
 * Update functions to be exported from the design doc.
 */

var templates = require('kanso/templates'),
    forms = require('kanso/forms'),
    utils = require('kanso/utils'),
    db = require('kanso/db'),
    types = require('./types');

// update the final_test doc with user-provided metadata
exports.final_test = function (doc, req) {
    var form = req.form;

    checkboxes = {
        cleaned: '',
        refurbished:'',
        db0_dark_matter:'',
        db1_dark_matter:'',
        db2_dark_matter:'',
        db3_dark_matter:''
    };

    for (key in form) {
        if (form[key] == '__checkbox_true') {
            doc[key] = true;
        }
        else
            doc[key] = form[key];
    }

    for (key in checkboxes) {
        if (!(key in form)) {
            doc[key] = false;
        }
    }

    var content = templates.render('final_test_saved.html', req, {
        _id: form.final_test_id,
    });

    if (!(req.client)) {
      content = templates.render('base.html', req, {
        content: content,
        title: 'Final test updated'
      });
      return [doc, content];
    }

    return [doc, {content: content, title: 'Final test updated'}];
};

// delete a test document
exports.test_delete = function(doc, req) {
    doc._deleted = true;

    var content = templates.render('test_deleted.html', req, {});

    if (!(req.client)) {
      content = templates.render('base.html', req, {
        content: content,
        title: 'Test deleted'
      });
      return [doc, content];
    }

    return [doc, {content: content, title: 'Test deleted'}];
};

// archive a test document
exports.test_archive = function(doc, req) {
    doc.archived = true;

    // archive all tests related to final_test or ecal
    if (doc.type == "final_test") {
        db.getView('final_test', {startkey: [doc._id], endkey: [doc._id, 2]}, function(err, resp) {
            for (i in resp.rows) {
                if (resp.rows[i].value.type != "final_test") {
                    resp.rows[i].value.archived = true;
                    db.saveDoc(resp.rows[i].value, {db: 'debugdb'}, function(err, resp) {});
                }
            }
        });
    }

    if (doc.type == "ecal") {
        db.getView('ecal', {startkey: [doc._id], endkey: [doc._id, 2]}, function(err, resp) {
            for (i in resp.rows) {
                if (resp.rows[i].value.type != "ecal") {
                    resp.rows[i].value.archived = true;
                    db.saveDoc(resp.rows[i].value, {db: 'debugdb'}, function(err, resp) {});
                }
            }
        });
    }

    var content = templates.render('test_archived.html', req, {});

    if (!(req.client)) {
      content = templates.render('base.html', req, {
        content: content,
        title: 'Test archived'
      });
      return [doc, content];
    }

    return [doc, {content: content, title: 'Test archived'}];
};

// unarchive a test document
exports.test_unarchive = function(doc, req) {
    doc.archived = false;

    // unarchive all tests related to final_test or ecal
    if (doc.type == "final_test") {
        db.getView('final_test', {startkey: [doc._id], endkey: [doc._id, 2]}, function(err, resp) {
            for (i in resp.rows) {
                if (resp.rows[i].value.type != "final_test") {
                    resp.rows[i].value.archived = false;
                    db.saveDoc(resp.rows[i].value, {db: 'debugdb'}, function(err, resp) {});
                }
            }
        });
    }

    if (doc.type == "ecal") {
        db.getView('ecal', {startkey: [doc._id], endkey: [doc._id, 2]}, function(err, resp) {
            for (i in resp.rows) {
                if (resp.rows[i].value.type != "ecal") {
                    resp.rows[i].value.archived = false;
                    db.saveDoc(resp.rows[i].value, {db: 'debugdb'}, function(err, resp) {});
                }
            }
        });
    }

    if (req.client) {
      content = templates.render('test_unarchived.html', req, {});
    }
    else {
      content = templates.render('base.html', req, {
        content: content,
        title: 'Test unarchived'
      });
    }

    return [doc, {content: content, title: 'Test unarchived'}];
};

// create a new logbook entry
exports.logbook_create = function (doc, req) {
    var form = req.form;

    var d = new Date();
    doc = {
        _id: req.uuid,
        type: 'log',
        created: d.toString(),
        title: form.title,
        text: form.text
    };

    var content = templates.render('logbook_saved.html', req, {});

    if (!(req.client)) {
      content = templates.render('base.html', req, {
        content: content,
        title: 'Log entry saved'
      });
      return [doc, content];
    }

    return [doc, {content: content, title: 'Log entry saved'}];
};

// save log book entry
exports.logbook_view = function (doc, req) {
    var form = req.form;

    var d = new Date();
    doc.created = d.toString();
    doc.title = form.title;
    doc.text = form.text;

    var content = templates.render('logbook_saved.html', req, {});

    if (!(req.client)) {
      content = templates.render('base.html', req, {
        content: content,
        title: 'Log entry saved'
      });
      return [doc, content];
    }

    return [doc, {content: content, title: 'Log entry saved'}];
};

// delete a logbook entry
exports.logbook_delete = function(doc, req) {
    doc._deleted = true;

    var content = templates.render('logbook_deleted.html', req, {});

    if (!(req.client)) {
      content = templates.render('base.html', req, {
        content: content,
        title: 'Log entry deleted'
      });
      return [doc, content];
    }

    return [doc, {content: content, title: 'Log Entry Deleted'}];
};

// create a tag
exports.tag_create = function (doc, req) {
    var form = req.form;

    // enforce tag conventions
    form.board = form.board.toLowerCase();

    if (form.board.substr(0,1) == 'm') {
        form.board = 'f' + form.board.substring(1, form.board.length);
    }

    if (!form.created || form.created == '') {
        form.created = (new Date('Thu Jul 4 1776')).toString();
    }

    doc = {
        _id: req.uuid,
        type: 'tag',
        created: form.created,
        author: form.author,
        board: form.board,
        setup: {
          mb: form.mb,
          db0: form.db0,
          db1: form.db1,
          db2: form.db2,
          db3: form.db3,
        },
        status: form.status,
        content: form.content
    };

    var content = templates.render('tag_saved.html', req, {board_id: doc.board});

    if (!(req.client)) {
      content = templates.render('base.html', req, {
        content: content,
        title: 'Tag saved'
      });
      return [doc, content];
    }

    return [doc, {content: content, title: 'Tag saved'}];
};

// delete a tag
exports.tag_delete = function(doc, req) {
    doc._deleted = true;

    var content = templates.render('tag_deleted.html', req, {});

    if (!(req.client)) {
      content = templates.render('base.html', req, {
        content: content,
        title: 'Tag deleted'
      });
      return [doc, content];
    }

    return [doc, {content: content, title: 'Tag deleted'}];
};

// update board metadata
exports.board = function (doc, req) {
    var form = req.form;

    doc.status = form.status;
    doc.location = form.location;
    doc.location_detail = form.location_detail;
    doc.comments = form.comments;
    if (doc.channels) {
        for (var i=0; i<8; i++) {
            doc.channels[i].good = (('channel' + String(i)) in form);
        }
    }

    return [doc, utils.redirect(req, '/board/'+ doc._id)];
};

// edit the detector configuration
exports.reconfigure = function(doc, req) {
    var form = req.form;

    var dest = form.dest.split('/').map(function(s) { return parseInt(s); });
    var old_board = form.old_board
    var board = form.new_board;
    var board_type = board.substr(0, 1);

    function InvalidLocation(msg) {
        var e = new Error(msg);
        e.name = 'InvalidLocation';
        return e;
    }

    // loop through the detector, removing references to board
    // assumes that the board can only appear once and that
    // the first letter is a valid indicator of board location
    function removeFromConfiguration(board, d) {
        var board_type = board.substr(0, 1);
        if (board_type == 'c') {
            for (idx in d.crates) {
                if (d.crates[idx].ctc == board) {
                    d.crates[idx].ctc = null;
                    return d; // String(idx);
                }
            }
        }
        else if (board_type == 'x') {
            for (idx in d.crates) {
                if (d.crates[idx].xl3 == board) {
                    d.crates[idx].xl3 = null;
                    return d; //String(idx);
                }
            }
        }
        else if (board_type == 'f') {
            for (idx in d.crates) {
                for (jdx in d.crates[idx].fecs) {
                    if (d.crates[idx].fecs[jdx].id == board) {
                        d.crates[idx].fecs[jdx].id = null;
                        return d; //[idx, jdx].join('/');
                    }
                }
            }
        }
        else if (board_type == 'e') {
            for (idx in d.crates) {
                for (jdx in d.crates[idx].pmtics) {
                    if (d.crates[idx].pmtics[jdx] == board) {
                        d.crates[idx].pmtics[jdx] = null;
                        return d; //[idx, jdx].join('/');
                    }
                }
            }
        }
        else if (board_type == 'd') {
            for (idx in d.crates) {
                for (jdx in d.crates[idx].fecs) {
                    for (kdx in d.crates[idx].fecs[jdx].dbs) {
                        if (d.crates[idx].fecs[jdx].dbs[kdx] == board) {
                            d.crates[idx].fecs[jdx].dbs[kdx] = null;
                            return d; //[idx, jdx, kdx].join('/');
                        }
                    }
                }
            }
        }
        return d;
    };

    var content;
    try {
        doc = removeFromConfiguration(old_board, doc);
        doc = removeFromConfiguration(board, doc);
        if (dest.length == 1) {
            if (board_type == 'c') {
                doc.crates[dest[0]].ctc = board;
            }
            else if (board_type == 'x') {
                doc.crates[dest[0]].xl3 = board;
            }
            else {
                throw InvalidLocation('Invalid board ' + board + ' for location ' + form.dest);
            }
        }
        else if (dest.length == 2) {
            if (board_type == 'f') {
                doc.crates[dest[0]].fecs[dest[1]].id = board;
            }
            else if (board_type == 'e') {
                doc.crates[dest[0]].pmtics[dest[1]] = board;
            }
            else {
                throw InvalidLocation('Invalid board ' + board + ' for location ' + form.dest);
            }
        }
        else if (dest.length == 3) {
            if (board_type == 'd') {
                doc.crates[dest[0]].fecs[dest[1]].dbs[dest[2]] = board;
            }
            else {
                throw InvalidLocation('Invalid board ' + board + ' for location ' + form.dest);
            }
        }
        else {
            throw InvalidLocation('Invalid location ' + form.dest);
        }

        return [doc, utils.redirect(req, '/crate/' + String(dest[0]))];
    }
    catch (e) {
        if (e.name == 'InvalidLocation') {
            var title = 'Error in reconfiguration';
            var content = templates.render('reconfigure_error.html', req, {
                crate_id: dest[0],
                error: e.message
            });

            if (!(req.client)) {
                content = templates.render('base.html', req, {
                    content: content,
                    title: title
                });
                return [null, content];
            }

            return [null, {content: content, title: title}];
        }
        else {
            throw e;
        }
    }
};

// create a new board
exports.board_create = function (doc, req) {
    var form = req.form;

    doc = {
        _id: form._id,
        type: 'board',
        board_type: {
            f: 'Front-End Card',
            d: 'Daughterboard',
            e: 'PMTIC',
            t: 'MTC/A+',
            c: 'CTC',
            x: 'XL3'
        }[form._id.substr(0,1)],
        comments: '',
        location: 'unknown',
        location_detail: '',
        status: 'none'
    };

    if (!doc._id || doc._id.length < 2 || !doc.board_type) {
        var title = 'Error creating board';
        var content = templates.render('board_create_error.html', req, {
            type: doc.board_type,
            id: doc._id
        });

        if (!(req.client)) {
            content = templates.render('base.html', req, {
                content: content,
                title: title
            });
            return [null, content];
        }

        return [null, {content: content, title: title}];
    }

    if (doc.board_type == 'Daughterboard') {
        doc.channels = [];
        for (var i=0; i<8; i++) {
            doc.channels.push({
                id: i,
                good: true
            });
        }
    }

    return [doc, utils.redirect(req, '/board/' + doc._id)];
};

