/**
 * Update functions to be exported from the design doc.
 */

var templates = require('kanso/templates'),
    forms = require('kanso/forms'),
    utils = require('kanso/utils'),
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

