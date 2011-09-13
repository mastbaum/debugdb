/**
 * Show functions to be exported from the design doc.
 */

exports.tests_by_fec = {
    map: function(doc) {
        if(doc.config) {
            emit(doc.config.fec_id, {'type': doc.type, 'pass': doc.pass, 'created': doc.created, 'loc': doc.config.loc});
        }
    }
};

exports.tests_by_crate = {
    map: function(doc) {
        if(doc.config) {
            emit(doc.config.crate_id, {'type': doc.type, 'pass': doc.pass, 'created': doc.created, 'loc': doc.config.loc});
        }
    }
};

exports.tests_by_slot = {
    map: function(doc) {
        if(doc.config) {
            emit({"crate": doc.config.crate_id, "slot": doc.config.slot}, {'type': doc.type, 'pass': doc.pass, 'created': doc.created, 'loc': doc.config.loc});
        }
    }
};

exports.tests_by_db = {
    map: function(doc) {
        if(doc.config) {
            doc.config.db.forEach(
               function(db) {
                   emit(db.db_id, {'type': doc.type, 'pass': doc.pass, 'created': doc.created, 'loc': doc.config.loc});
               }
            );
        }
    }
};

exports.tests_by_name = {
    map: function(doc) {
        if(doc.config) {
            emit(doc.type, {'type': doc.type, 'pass': doc.pass, 'created': doc.created, 'config': doc.config, 'loc': doc.config.loc});
        }
    }
};

exports.tests_by_created = {
    map: function(doc) {
        if(doc.config) {
            var c = new Date(doc.created);
            var created = c.getTime();
            var short_created = c.getMonth() + '/' + c.getDate() + '/' + c.getFullYear() + ' ' + c.getHours() + ':' + c.getMinutes() + ':' + c.getSeconds();
            emit(-created, {'type': doc.type, 'pass': doc.pass, 'created': created, 'short_created': short_created, 'config': doc.config, 'loc': doc.config.loc});
        }
    }
};

exports.fecs = {
    map: function(doc) {
        if(doc.config)
            emit(doc.config.fec_id, 1);
    },
    reduce: function(keys, values) {
        return sum(values);
    }
};

exports.crates = {
    map: function(doc) {
        if(doc.config)
            emit(doc.config.crate_id, 1);
    },
    reduce: function(keys, values) {
        return sum(values);
    }
};

exports.dbs = {
    map: function(doc) {
        if(doc.config)
            doc.config.db.forEach(
                function(db) {
                    emit(db.db_id, 1);
                }
            );
    },
    reduce: function(keys, values) {
        return sum(values);
    }
};

exports.tests = {
    map: function(doc) {
        if(doc.config)
            emit(doc.type, 1);
    },
    reduce: function(keys, values) {
        return sum(values);
    }
};

// final_test page shows all related tests inline
// use view collation
exports.final_test = {
    map: function (doc) {
        if(doc.config)
            if(doc.type == 'final_test')
                emit([doc._id, 0], doc);
            else if(doc.final_test_id)
                emit([doc.final_test_id, 1], doc);
    },
    reduce: function (keys, values) {
        output = {doc: {}, tests: []};
        for (idx in values) {
            if (values[idx].type == "final_test")
                output.doc = values[idx];
            else {
                output.tests.push({
                    id: values[idx]._id,
                    type: values[idx].type,
                    pass: values[idx].pass,
                    created: values[idx].created
                });
            }
        }
        return output;
    }
};

