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

    if (!('snoplus' in doc.config))
        doc.config.snoplus = {};
    if (!('db' in doc.config.snoplus))
        doc.config.snoplus.db = [];

    doc.config.snoplus.crate = form['config_snoplus_crate'];
    doc.config.snoplus.slot = form['config_snoplus_slot'];
    doc.config.snoplus.fec_id = form['config_snoplus_fec_id'];
    doc.config.snoplus.pmtic = form['config_snoplus_pmtic'];
    doc.config.snoplus.db[0] = {slot: 0, db_id: form['config_snoplus_db_0'] }
    doc.config.snoplus.db[1] = {slot: 1, db_id: form['config_snoplus_db_1'] }
    doc.config.snoplus.db[2] = {slot: 2, db_id: form['config_snoplus_db_2'] }
    doc.config.snoplus.db[3] = {slot: 3, db_id: form['config_snoplus_db_3'] }

    return [doc, utils.redirect(req, '/board/'+ doc._id)];
};

// edit the detector configuration
exports.reconfigure = function(doc, req) {
    var form = req.form;
    if (req.client) {
        console.log(form);
    }
    doc.foo = 'baz';
    return [doc, utils.redirect(req, '/crate/' + form.dest[0])];
};
