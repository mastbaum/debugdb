/**
 * Show functions to be exported from the design doc.
 */

exports.tests_by_fec = {
    map: function(doc) {
        if (doc.config && doc.type != 'board') {
            var created = -(new Date(doc.created)).getTime();
            var d = {
                type: doc.type,
                pass: doc.pass,
                created: doc.created,
                config: doc.config,
                archived: doc.archived
            };
            emit([doc.config.fec_id, created], d);
        }
    }
};

exports.tests_by_crate = {
    map: function(doc) {
        if (doc.config && doc.type != 'board') {
            var created = -(new Date(doc.created)).getTime();
            var d = {
                type: doc.type,
                pass: doc.pass,
                created: doc.created,
                config: doc.config,
                archived: doc.archived
            };
            emit([doc.config.crate_id, created], d);
        }
    }
};

exports.tests_by_slot = {
    map: function(doc) {
        if (doc.config && doc.type != 'board') {
            var created = -(new Date(doc.created)).getTime();
            var d = {
                type: doc.type,
                pass: doc.pass,
                created: doc.created,
                config: doc.config,
                archived: doc.archived
            };
            emit([{"crate": doc.config.crate_id, "slot": doc.config.slot}, created], d);
        }
    }
};

exports.tests_by_db = {
    map: function(doc) {
        if (doc.config && doc.type != 'board') {
            doc.config.db.forEach(
                function(db) {
                    var created = -(new Date(doc.created)).getTime();
                    var d = {
                        type: doc.type,
                        pass: doc.pass,
                        created: doc.created,
                        config: doc.config,
                        archived: doc.archived
                     };
                    emit([db.db_id, created], d);
                }
            );
        }
    }
};

exports.tests_by_name = {
    map: function(doc) {
        if (doc.config && doc.type != 'board') {
            var created = -(new Date(doc.created)).getTime();
            var d = {
                type: doc.type,
                pass: doc.pass,
                created: doc.created,
                config: doc.config,
                archived: doc.archived
            };
            emit([doc.type, created], d);
        }
    }
};

exports.tests_by_created = {
    map: function(doc) {
        if (doc.config && doc.type != 'board') {
            var c = new Date(doc.created);
            var created = c.getTime();
            var short_created = c.toLocaleString();
            var d = {
                type: doc.type,
                pass: doc.pass,
                created: doc.created,
                short_created: short_created,
                config: doc.config,
                archived: doc.archived
            };
            emit(-created, d);
        }
    }
};

exports.ecals_by_created = {
    map: function(doc) {
        if (doc.type == "ecal") {
            var c = new Date(doc.created);
            var created = c.getTime();
            var short_created = c.toLocaleString();
            var d = {
                type: doc.type,
                pass: doc.pass,
                created: doc.created,
                short_created: short_created,
                archived: doc.archived,
                crates: doc.crates
            };
            emit(-created, d);
        }
    }
};

exports.fecs = {
    map: function(doc) {
        if (doc.config && doc.type != 'board') {
            emit(doc.config.fec_id, 1);
        }
    },
    reduce: function(keys, values) {
        return sum(values);
    }
};

exports.crates = {
    map: function(doc) {
        if (doc.config && doc.type != 'board')
            emit(doc.config.crate_id, 1);
    },
    reduce: function(keys, values) {
        return sum(values);
    }
};

exports.dbs = {
    map: function(doc) {
        if (doc.config && doc.type != 'board') {
            doc.config.db.forEach(
                function(db) {
                    emit(db.db_id, 1);
                }
            );
        }
    },
    reduce: function(keys, values) {
        return sum(values);
    }
};

exports.tests = {
    map: function(doc) {
        if (doc.config && doc.type != 'board') {
            emit(doc.type, 1);
        }
    },
    reduce: function(keys, values) {
        return sum(values);
    }
};

// final_test page shows all related tests inline
// use view collation
exports.final_test = {
    map: function (doc) {
        if (doc.config && doc.type != 'board') {
            if (doc.type == 'final_test') {
                emit([doc._id, 0], doc);
            }
            else if (doc.final_test_id) {
                var d = {
                    _id: doc._id,
                    type: doc.type,
                    pass: doc.pass,
                    created: doc.created
                };
                emit([doc.final_test_id, 1], d);
            }
        }
    }
};

// ecal page shows all related tests inline
exports.ecal = {
    map: function (doc) {
        if (doc.type == 'ecal') {
            emit([doc._id, 0], doc);
        }
        else if (doc.ecal_id) {
            var d = {
                _id: doc._id,
                type: doc.type,
                pass: doc.pass,
                created: doc.created,
                config: doc.config
            };
            emit([doc.ecal_id, 1], d);
        }
    }
};

// debugging log book
exports.logs_by_created = {
    map: function(doc) {
        if (doc.type == 'log') {
          var t = new Date(doc.created);
          var clip = (doc.text.length < 50 ? doc.text : doc.text.substring(0,47) + '...');
          var d = {
              _id: doc._id,
              created: doc.created,
              title: doc.title,
              clip: clip
          };
          emit(-t, d);
        }
    }
};

exports.logbook_search_keys = {
  map: function(doc) {
    if (doc.type == 'log') {
      words = doc.title.split(' ');
      for (word in words) {
        emit([words[word]], {
            id: doc._id,
            title: doc.title
        });
      }
    }
  }
}

exports.tags = {
    map: function(doc) {
        if (doc.type == 'tag') {
            emit(doc.board, 1);
        }
    },
    reduce: function(keys, values) {
        return sum(values);
    }
};

exports.tags_with_status = {
    map: function(doc) {
        if (doc.type == 'tag') {
            emit(doc.board, [doc.created, doc.status, 1]);
        }
    },
    reduce: function(keys, values) {
        var maxdate = (new Date('12/31/1769')).getTime();
        var status = "none";
        var summed = 0;
        for (var i=0; i<values.length; i++) {
            summed += values[i][2];
            var d = new Date(values[i][0]);
            var thisdate = d.getTime();
            if (thisdate > maxdate && values[i][1] != "none") {
                maxdate = thisdate;
                status = values[i][1];
            }
        }
        return [status, summed];
    }
}

exports.tags_by_board = {
    map: function(doc) {
       if (doc.type == 'tag') {
         var created = -(new Date(doc.created)).getTime();
         var d = {
             id: doc._id,
             status: doc.status,
             setup: doc.setup,
             author: doc.author,
             content: doc.content,
             created: doc.created,
         };
         emit([doc.board, created], d);
       }
     }
};

exports.boards = {
    map: function(doc) {
        if (doc.type == 'board') {
          emit(doc._id, [doc.status, doc.location, doc.channels]);
        }
    }
};

exports.board = {
    map: function (doc) {
        if (doc.type == 'board') {
            emit([doc._id, 0], doc);
        }
        else if (doc.type == 'final_test') {
            var d = {
                _id: doc._id,
                type: doc.type,
                pass: doc.pass,
                created: doc.created
            };
            emit([doc.config.fec_id, 1], d);
            emit([doc.config.db[0].db_id, 1], d);
            emit([doc.config.db[1].db_id, 1], d);
            emit([doc.config.db[2].db_id, 1], d);
            emit([doc.config.db[3].db_id, 1], d);
        }
        else if (doc.type == 'ecal') {
            for (crate in doc.crates) {
                for (slot in doc.crates[crate].slots) {
                    var s = doc.crates[crate].slots[slot];
                    var d = {
                        _id: doc._id,
                        type: doc.type,
                        archived: doc.archived,
                        created: doc.created,
                        crates: doc.crates,
                        config: doc.config
                    };
                    emit([s.mb_id, 2], d);
                    emit([s.db0_id, 2], d);
                    emit([s.db1_id, 2], d);
                    emit([s.db2_id, 2], d);
                    emit([s.db3_id, 2], d);
                }
            }
        }
        else if (doc.name == 'FEC') {
            var d = {
                _id: doc._id,
                type: doc.type,
                created: doc.timestamp_generated
            };
            emit([doc.board_id, 3], d);
            emit([doc.id.hv, 3], d);
            emit([doc.id.db0, 3], d);
            emit([doc.id.db1, 3], d);
            emit([doc.id.db2, 3], d);
            emit([doc.id.db3, 3], d);
        }
        else if (doc.type == 'tag') {
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
        if (doc.type == 'detector_config') {
            for (var idx in doc.crates) {
                emit([doc.experiment, idx], doc.crates[idx]);
            }
        }
    }
};

exports.board_stats = {
    map: function(doc) {
        if (doc.type == "board") {
            emit(doc.status, 1);
        }
    },
    reduce: function(keys, values) {
        return sum(values);
    }
};

exports.fec_stats = {
    map: function(doc) {
        if (doc.type == "board" && doc.board_type == "Front-End Card") {
            emit(doc.status, 1);
        }
    },
    reduce: function(keys, values) {
        return sum(values);
    }
};

exports.db_stats = {
    map: function(doc) {
        if (doc.type == "board" && doc.board_type == "Daughterboard") {
            emit(doc.status, 1);
        }
    },
    reduce: function(keys, values) {
        return sum(values);
    }
};

exports.location_stats = {
    map: function(doc) {
        if (doc.type == "board") {
            emit(doc.location, 1);
        }
    },
    reduce: function(keys, values) {
        return sum(values);
    }
};

exports.parts = {
    map: function(doc) {
        if (doc.type == "part") {
            emit(doc.name, doc);
        }
    }
};

exports.location_and_status = {
    map: function(doc) {
      if (doc.type == "board"){
        emit([doc.board_type,doc.location,doc.status],1);
      }
    },
    reduce: function(keys, values) {
        return sum(values);
    }
};

