/**
 * Rewrite settings to be exported from the design doc
 */

module.exports = [
    {from: '/static/*', to: 'static/*'},
    {from: '/', to: '_list/tests/tests_by_created'},

    // special pages
    {from: '/history', to: '_list/testhistory/tests_by_created'},
    {from: '/crateview', to: '_list/crateview/tests_by_created'},
    {from: '/logbook', to: '_list/logbook/logs_by_created'},
    {from: '/logbook/search/:id', to: '_list/logbook_search/logbook_search_keys', query: {
        startkey: [':id'],
        endkey: [':id', {}]
    }},
    {from: '/logbook/new', to: '_update/logbook_create', method: 'POST'},
    {from: '/logbook/new', to: '_show/logbook_new'},
    {from: '/logbook/:id', to: '_update/logbook_view/:id', method: 'POST'},
    {from: '/logbook/:id', to: '_show/logbook_view/:id'},
    {from: '/logbook/delete/:id', to: '_show/logbook_delete/:id'},
    {from: '/final_test/:id', to: '_update/final_test/:id', method: 'POST'},
    {from: '/final_test/:id', to: '_list/final_test/final_test', query: {
        startkey: [':id'],
        endkey: [':id', 2],
    }},
    {from: '/test_delete/:id', to: '_show/test_delete/:id'},

    // all fecs, crates, ...
    {from: '/fecs', to: '_list/listing/fecs'},
    {from: '/dbs', to: '_list/listing/dbs'},
    {from: '/crates', to: '_list/listing/crates'},
    {from: '/tests', to: '_list/listing/tests'},

    // all tests for a particular fec, crate, ...
    {from: '/fec', to: '_list/tests/tests_by_fec'},
    {from: '/db', to: '_list/tests/tests_by_db'},
    {from: '/crate', to: '_list/tests/tests_by_crate'},
    {from: '/slot', to: '_list/tests/tests_by_slot'},
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

    // catch unmatched urls
    {from: '*', to: '_show/not_found'}
];

