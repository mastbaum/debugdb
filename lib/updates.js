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

    checkboxes = {cleaned:'', refurbished:'', db0_dark_matter:'', db1_dark_matter:'', db2_dark_matter:'', db3_dark_matter:''};

    for (key in form) {
        if (form[key] == '__checkbox_true') {
            doc[key] = true;
        }
        else
            doc[key] = form[key];
    }

    for (key in checkboxes)
        if (!(key in form))
            doc[key] = false;

    var content = templates.render('final_test_saved.html', req, {
        _id: form.final_test_id,
    });

    return [doc, {content: content, title: 'Final Test Updated'}];
};

// delete a test document
exports.test_delete = function(doc, req) {
    doc._deleted = true;
    if (req.client) {
      content = templates.render('test_deleted.html', req, {});
    }
    else {
      content = templates.render('base.html', req, {
        content: content,
        title: title
      });
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

    if (req.client) {
      content = templates.render('test_archived.html', req, {});
    }
    else {
      content = templates.render('base.html', req, {
        content: content,
        title: title
      });
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
        title: title
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

exports.tag_view = function (doc, req) {

}

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

exports.tag_create = function (doc, req) {
    var form = req.form;

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


