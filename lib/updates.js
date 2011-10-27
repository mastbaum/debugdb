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

