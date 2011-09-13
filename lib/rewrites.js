/**
 * Rewrite settings to be exported from the design doc
 */

module.exports = [
    {from: '/static/*', to: 'static/*'},
    {from: '/', to: '_list/tests/tests_by_created'},

    // special listings
    {from: '/history', to: '_list/testhistory/tests_by_created'},
    {from: '/crateview', to: '_list/crateview/tests_by_created'},

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

    // catch unmatched urls
    {from: '*', to: '_show/not_found'}
];

