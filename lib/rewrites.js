/**
 * Rewrite settings to be exported from the design doc
 */

module.exports = [
    {from: '/static/*', to: 'static/*'},
    {from: '/', to: '_show/welcome'},
    {from: '/fec', to: '_list/test_list/tests_by_fec'},
    {from: '/crate', to: '_list/test_list/tests_by_crate'},
    {from: '/db', to: '_list/test_list/tests_by_db'},
    {from: '/fec_test/:id', to: '_show/fec_test/:id'},
    {from: '*', to: '_show/not_found'}
];

