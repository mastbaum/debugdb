/**
 * Rewrite settings to be exported from the design doc
 */

module.exports = [
    {from: '/static/*', to: 'static/*'},
    {from: '/', to: '_list/tests/tests_by_created'},
    {from: '', to: '_list/tests/tests_by_created'},

    // special pages
    {from: '/history', to: '_list/testhistory/tests_by_created'},
    {from: '/final_test/:id', to: '_update/final_test/:id', method: 'POST'},
    {from: '/final_test/:id', to: '_list/final_test/final_test', query: {
        startkey: [':id'],
        endkey: [':id', 2],
    }},
    {from: '/ecal/:id', to: '_list/ecal/ecal', query: {
        startkey: [':id'],
        endkey: [':id', 2],
    }},
    {from: '/test_delete/:id', to: '_update/test_delete/:id'},
    {from: '/test_archive/:id', to: '_update/test_archive/:id'},
    {from: '/test_unarchive/:id', to: '_update/test_unarchive/:id'},

    // tags
    {from: '/tags', to: '_list/tag_list/tags_with_status', query: {
        group_level: "1"
    }},
    {from: '/tag/new', to: '_update/tag_create', method: 'POST'},
    {from: '/tag/new', to: '_show/tag_new'},
    {from: '/tag/:id', to: '_list/tags/tags_by_board', query: {
        startkey: [':id'],
        endkey: [':id', {}]
    }},

    // boards
    {from: '/boards', to: '_list/boards/boards'},
    {from: '/board/:id', to: '_update/board/:id', method: 'POST'},
    {from: '/board/:id', to: '_list/board/board', query: {
        startkey: [':id'],
        endkey: [':id', {}]
    }},

    // crate
    {from: '/crates', to: '_show/crates'},
    {from: '/crate/:id', to: '_list/crate/crater', query: {
        startkey: [':id'],
        endkey: [':id', {}]
    }},

    // logbook
    {from: '/logbook', to: '_list/logbook/logs_by_created'},
    {from: '/logbook/search/:id', to: '_list/logbook_search/logbook_search_keys', query: {
        startkey: [':id'],
        endkey: [':id', {}]
    }},
    {from: '/logbook/new', to: '_update/logbook_create', method: 'POST'},
    {from: '/logbook/new', to: '_show/logbook_new'},
    {from: '/logbook/:id', to: '_update/logbook_view/:id', method: 'POST'},
    {from: '/logbook/:id', to: '_show/logbook_view/:id'},
    {from: '/logbook/delete/:id', to: '_update/logbook_delete/:id', method: 'POST'},

    // all fecs, crates, ...
    {from: '/fecs', to: '_list/listing/fecs'},
    {from: '/dbs', to: '_list/listing/dbs'},
    {from: '/tests', to: '_list/listing/tests'},
    {from: '/ecals', to: '_list/ecalhistory/ecals_by_created'},

    // all tests for a particular fec, crate, ...
    {from: '/fec', to: '_list/tests/tests_by_fec'},
    {from: '/db', to: '_list/tests/tests_by_db'},
    {from: '/test/:id', to: '_list/tests/tests_by_name', query: {
        startkey: [':id'],
        endkey: [':id', {}]
    }},
    {from: '/test', to: '_list/tests/tests_by_name'},

    // test shows
    {from: '/fec_test/:id', to: '_show/fec_test/:id'},
    {from: '/cald_test/:id', to: '_show/cald_test/:id'},
    {from: '/cmos_m_gtvalid/:id', to: '_show/cmos_m_gtvalid/:id'},
    {from: '/crate_cbal/:id', to: '_show/crate_cbal/:id'},
    {from: '/disc_check/:id', to: '_show/disc_check/:id'},
    {from: '/vmon/:id', to: '_show/vmon/:id'},
    {from: '/cgt_test/:id', to: '_show/cgt_test/:id'},
    {from: '/fifo_test/:id', to: '_show/fifo_test/:id'},
    {from: '/mb_stability_test/:id', to: '_show/mb_stability_test/:id'},
    {from: '/mem_test/:id', to: '_show/mem_test/:id'},
    {from: '/chinj_scan/:id', to: '_show/chinj_scan/:id'},
    {from: '/zdisc/:id', to: '_show/zdisc/:id'},
    {from: '/get_ttot/:id', to: '_show/get_ttot/:id'},
    {from: '/set_ttot/:id', to: '_show/set_ttot/:id'},
    {from: '/ped_run/:id', to: '_show/ped_run/:id'},
    {from: '/see_refl/:id', to: '_show/see_refl/:id'},
    {from: '/find_noise/:id', to: '_show/find_noise/:id'},

    // catch unmatched urls
    {from: '*', to: '_show/not_found'}
];

