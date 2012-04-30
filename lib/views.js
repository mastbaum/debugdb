/**
 * Show functions to be exported from the design doc.
 */

exports.tests_by_fec = {
    map: function(doc) {
        if(doc.config) {
            var c = new Date(doc.created);
            var created = -c.getTime();
            emit([doc.config.fec_id, created], {'type': doc.type, 'pass': doc.pass, 'created': doc.created, 'config': doc.config, 'archived': doc.archived});
        }
    }
};

exports.tests_by_crate = {
    map: function(doc) {
        if(doc.config) {
            var c = new Date(doc.created);
            var created = -c.getTime();
            emit([doc.config.crate_id, created], {'type': doc.type, 'pass': doc.pass, 'created': doc.created, 'config': doc.config, 'archived': doc.archived});
        }
    }
};

exports.tests_by_slot = {
    map: function(doc) {
        if(doc.config) {
            var c = new Date(doc.created);
            var created = -c.getTime();
            emit([{"crate": doc.config.crate_id, "slot": doc.config.slot}, created], {'type': doc.type, 'pass': doc.pass, 'created': doc.created, 'config': doc.config, 'archived': doc.archived});
        }
    }
};

exports.tests_by_db = {
    map: function(doc) {
        if(doc.config) {
            doc.config.db.forEach(
               function(db) {
                   var c = new Date(doc.created);
                   var created = -c.getTime();
                   emit([db.db_id, created], {'type': doc.type, 'pass': doc.pass, 'created': doc.created, 'config': doc.config, 'archived': doc.archived});
               }
            );
        }
    }
};

exports.tests_by_name = {
    map: function(doc) {
        if(doc.config) {
            var c = new Date(doc.created);
            var created = -c.getTime();
            emit([doc.type, created], {'type': doc.type, 'pass': doc.pass, 'created': doc.created, 'config': doc.config, 'archived': doc.archived});
        }
    }
};

exports.tests_by_created = {
    map: function(doc) {
        if(doc.config) {
            var c = new Date(doc.created);
            var created = c.getTime();
            var short_created = c.toLocaleString();
            emit(-created, {'type': doc.type, 'pass': doc.pass, 'created': created, 'short_created': short_created, 'config': doc.config, 'archived': doc.archived});
        }
    }
};

exports.ecals_by_created = {
    map: function(doc) {
        if(doc.type == "ecal") {
            var c = new Date(doc.created);
            var created = c.getTime();
            var short_created = c.toLocaleString();
            emit(-created, {'type': doc.type, 'pass': doc.pass, 'created': created, 'short_created': short_created, 'archived': doc.archived, crates: doc.crates});
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
    }
};

// ecal page shows all related tests inline
exports.ecal = {
    map: function (doc) {
        if(doc.type == 'ecal')
            emit([doc._id, 0], doc);
        else if(doc.ecal_id)
            emit([doc.ecal_id, 1], doc);
    }
};

// debugging log book
exports.logs_by_created = {
    map: function(doc) {
        if(doc.type == 'log') {
          var d = new Date(doc.created);
          emit(-d, doc);
        }
    }
};

exports.logbook_search_keys = {
  map: function(doc) {
    if(doc.type == 'log') {
      words = doc.title.split(' ');
      for (word in words)
        emit([words[word]], {id: doc._id, title: doc.title});
    }
  }
}

exports.tags = {
    map: function(doc) {
        if(doc.type == 'tag')
            emit(doc.board, 1);
    },
    reduce: function(keys, values) {
        return sum(values);
    }
};

exports.tags_by_board = {
    map: function(doc) {
        if(doc.type == 'tag') {
            var c = new Date(doc.created);
            var created = -c.getTime();
            emit([doc.board, created], {'setup': doc.setup, 'author': doc.author, 'content': doc.content, 'created': doc.created, 'id': doc._id});
        }
    }
};


