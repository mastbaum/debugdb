/**
 * Show functions to be exported from the design doc.
 */

exports.tests_by_fec = {
    map: function(doc) {
        if(doc.config && doc.type != 'board') {
            var c = new Date(doc.created);
            var created = -c.getTime();
            emit([doc.config.fec_id, created], {'type': doc.type, 'pass': doc.pass, 'created': doc.created, 'config': doc.config, 'archived': doc.archived});
        }
    }
};

exports.tests_by_crate = {
    map: function(doc) {
        if(doc.config && doc.type != 'board') {
            var c = new Date(doc.created);
            var created = -c.getTime();
            emit([doc.config.crate_id, created], {'type': doc.type, 'pass': doc.pass, 'created': doc.created, 'config': doc.config, 'archived': doc.archived});
        }
    }
};

exports.tests_by_slot = {
    map: function(doc) {
        if(doc.config && doc.type != 'board') {
            var c = new Date(doc.created);
            var created = -c.getTime();
            emit([{"crate": doc.config.crate_id, "slot": doc.config.slot}, created], {'type': doc.type, 'pass': doc.pass, 'created': doc.created, 'config': doc.config, 'archived': doc.archived});
        }
    }
};

exports.tests_by_db = {
    map: function(doc) {
        if(doc.config && doc.type != 'board') {
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
        if(doc.config && doc.type != 'board') {
            var c = new Date(doc.created);
            var created = -c.getTime();
            emit([doc.type, created], {'type': doc.type, 'pass': doc.pass, 'created': doc.created, 'config': doc.config, 'archived': doc.archived});
        }
    }
};

exports.tests_by_created = {
    map: function(doc) {
        if(doc.config && doc.type != 'board') {
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
        if(doc.config && doc.type != 'board')
            emit(doc.config.fec_id, 1);
    },
    reduce: function(keys, values) {
        return sum(values);
    }
};

exports.crates = {
    map: function(doc) {
        if(doc.config && doc.type != 'board')
            emit(doc.config.crate_id, 1);
    },
    reduce: function(keys, values) {
        return sum(values);
    }
};

exports.dbs = {
    map: function(doc) {
        if(doc.config && doc.type != 'board')
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
        if(doc.config && doc.type != 'board')
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
        if(doc.config && doc.type != 'board')
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

exports.tags_with_status = {
    map: function(doc) {
        if (doc.type == 'tag')
          emit(doc.board,[doc.created,doc.status,1]);
    },
    reduce: function (keys, values) {
        var maxdate = -1;
        var status = "none";
        var summed = 0;
        for(var i = 0; i < values.length; i++){
          summed += values[i][2];
          var d = new Date(values[i][0]);
          var thisdate = d.getTime();
          if (thisdate > maxdate && values[i][1] != "none"){
            maxdate = thisdate;
            status = values[i][1];
          }
        }
        return [status,summed];
    }
}

exports.tags_by_board = {
    map: function(doc) {
       if(doc.type == 'tag') {
         var c = new Date(doc.created);
         var created = -c.getTime();
         emit([doc.board, created], {'setup': doc.setup, 'author': doc.author, 'content': doc.content, 'created': doc.created, 'id': doc._id, 'status': doc.status});
       }
     }
};

exports.boards = {
    map: function(doc) {
        if (doc.type == 'board')
          emit(doc._id, [doc.status, doc.location]);
    }
}

exports.board = {
    map: function (doc) {
        if (doc.type == 'board')
            emit([doc._id, 0], doc);
        else if(doc.type == 'final_test') {
            emit([doc.config.fec_id, 1], doc);
            emit([doc.config.db[0].db_id, 1], doc);
            emit([doc.config.db[1].db_id, 1], doc);
            emit([doc.config.db[2].db_id, 1], doc);
            emit([doc.config.db[3].db_id, 1], doc);
        }
        else if (doc.type == 'ecal') {
            for (crate in doc.crates) {
                for (slot in doc.crates[crate].slots) {
                    var s = doc.crates[crate].slots[slot];
                    emit([s.mb_id, 2], doc);
                    emit([s.db0_id, 2], doc);
                    emit([s.db1_id, 2], doc);
                    emit([s.db2_id, 2], doc);
                    emit([s.db3_id, 2], doc);
                }
            }
        }
        else if (doc.name == 'FEC') {
            emit([doc.board_id, 3], doc);
            emit([doc.id.hv, 3], doc);
            emit([doc.id.db0, 3], doc);
            emit([doc.id.db1, 3], doc);
            emit([doc.id.db2, 3], doc);
            emit([doc.id.db3, 3], doc);
        }
        else if (doc.type == 'tag') {
            var created = -(new Date(doc.created)).getTime();
            var board = doc.board.toLowerCase();
            if (board.substring(0,1) == 'm') {
                board = 'f' + board.substring(1, board.length);
            }
            emit([board, 4], doc);
        }
    }
};

exports.crater = {
    map: function(doc) {
        if (doc.type == 'board') {
            var crate = doc.config.snoplus.crate;
            var type = doc.board_type;
            var slot = doc.config.snoplus.slot;
            var db_slot = null;

            // if daughterboard, figure out which db slot
            if (doc._id.substr(0,1).toLowerCase() == 'd') {
                for (var i=0; i<4; i++) {
                    if ('db' in doc.config.snoplus) {
                        if (doc.config.snoplus.db[i].db_id == doc._id) {
                            db_slot = i;
                            break;
                        }
                    }
                }
            }

           emit([String(crate), type, String(slot), String(db_slot)], {id: doc._id, type: doc.board_type, config: doc.config, status: doc.status});
        }
    }
};

