/**
 * Show functions to be exported from the design doc.
 */

exports.tests_by_fec = {
    map: function(doc) {
        if(doc.config) {
            emit(doc.config.fec_id, {'type': doc.type, 'pass': doc.pass, 'created': doc.created});
        }
    }
};

exports.tests_by_crate = {
    map: function(doc) {
        if(doc.config) {
            emit(doc.config.crate_id, {'type': doc.type, 'pass': doc.pass, 'created': doc.created});
        }
    }
};

exports.tests_by_db = {
    map: function(doc) {
        if(doc.config) {
            doc.config.db.forEach(
               function(db) {
                   emit(db.db_id, {'type': doc.type, 'pass': doc.pass, 'created': doc.created});
               }
            );
        }
    }
};

exports.tests = {
    map: function(doc) {
        if(doc.config)
            var created = new Date(doc.created);
            var short_created = created.getMonth() + '/' + created.getDate() + '/' + created.getFullYear() + ' ' + created.getHours() + ':' + created.getMinutes() + ':' + created.getSeconds();
            emit([doc.config.crate_id, doc.config.slot, doc.created], {'pass': doc.pass, 'short_created': short_created, 'config': doc.config});
    }
};

