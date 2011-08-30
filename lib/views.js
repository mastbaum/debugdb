/**
 * Show functions to be exported from the design doc.
 */

exports.tests_by_fec = {
    map: function(doc) {
        if(doc.config) {
            emit(doc.config.fec_id, {'type': doc.type, 'pass': doc.pass});
        }
    }
};

exports.tests_by_crate = {
    map: function(doc) {
        if(doc.config) {
            emit(doc.config.crate_id, {'type': doc.type, 'pass': doc.pass});
        }
    }
};

exports.tests_by_db = {
    map: function(doc) {
        if(doc.config) {
            doc.config.db.forEach(
               function(db) {
                   emit(db.db_id, {'type': doc.type, 'pass': doc.pass});
               }
            );
        }
    }
};

