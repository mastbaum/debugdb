/**
 * Rewrite settings to be exported from the design doc
 */

module.exports = [
    {from: '/static/*', to: 'static/*'},
    {from: '/', to: '_list/test_list/tests'},

    // all tests for a particular fec, crate, ...
    {from: '/fec', to: '_list/test_list/tests_by_fec'},
    {from: '/crate', to: '_list/test_list/tests_by_crate'},
    {from: '/crateview', to: '_list/crate/tests'},
    {from: '/db', to: '_list/test_list/tests_by_db'},
    {from: '/slot', to: '_list/test_list/tests_by_slot'},
    {from: '/test', to: '_list/test_list/tests_by_name'},

    // all fecs, crates, ...
    {from: '/fecs', to: '_list/systems/fecs'},
    {from: '/dbs', to: '_list/systems/dbs'},
    {from: '/crates', to: '_list/systems/crates'},
    {from: '/tests', to: '_list/systems/testlist'},

    // test shows
    {from: '/fec_test/:id', to: '_show/fec_test/:id'},

    // catch unmatched urls
    {from: '*', to: '_show/not_found'}
];

