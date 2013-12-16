/**
 * Rewrite settings to be exported from the design doc
 */

module.exports = [
    {from: '/static/*', to: 'static/*'},
    {from: '/', to: '_list/tests/tests_by_created', query: {
        limit: '10'
    }},
    {from: '', to: '_list/tests/tests_by_created', query: {
        limit: '10'
    }},

    // special pages
    {from: '/history', to: '_list/testhistory/tests_by_created', query: {
        limit: '25'
    }},
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
    {from: '/part/new', to: '_update/part_create', method: 'POST'},
    {from: '/part/new', to: '_show/part_create'},
    {from: '/part/:id', to: '_update/part/:id', method: 'POST'},
    {from: '/parts', to: '_list/parts/parts'},

    // detector view
    {from: '/reconfigure/:id', to: '_update/reconfigure/:id'},
    {from: '/detector', to: '_show/detector/configuration_snoplus'},
    {from: '/sno', to: '_show/detector/configuration_sno'},

    // fec documents
    {from: '/fecdoc/:id', to: '_update/fec/:id', method: 'POST'},
    {from: '/fecdoc/:id', to: '_show/fec/:id'},

    // tags
    {from: '/tags', to: '_list/tag_list/tags_with_status', query: {
        group_level: "1"
    }},
    {from: '/tag/new', to: '_update/tag_create', method: 'POST'},
    {from: '/tag/new', to: '_show/tag_new'},
    {from: '/tag_delete/:id', to: '_update/tag_delete/:id'},

    // boards
    {from: '/spares', to: '_show/spares/configuration_snoplus'},
    {from: '/boards', to: '_list/boards/boards'},
    {from: '/board/new', to: '_update/board_create', method: 'POST'},
    {from: '/board/:id', to: '_update/board/:id', method: 'POST'},
    {from: '/board/:id', to: '_list/board/board', query: {
        startkey: [':id'],
        endkey: [':id', {}]
    }},

    // crate
    {from: '/crates', to: '_show/crates'},
    {from: '/crate/:id', to: '_list/crate/crater', query: {
        startkey: ['snoplus', ':id'],
        endkey: ['snoplus', ':id', {}]
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
    {from: '/fecs', to: '_list/listing/fecs', query: {
        group_level: "1"
    }},
    {from: '/dbs', to: '_list/listing/dbs', query: {
        group_level: "1"
    }},
    {from: '/tests', to: '_list/listing/tests', query: {
        group_level: "1"
    }},
    {from: '/ecals', to: '_list/ecalhistory/ecals_by_created'},

    // all tests for a particular fec, crate, ...
    {from: '/fec/:id', to: '_list/tests/tests_by_fec', query: {
        startkey: [':id'],
        endkey: [':id', {}],
        limit: '25'
    }},
    {from: '/db/:id', to: '_list/tests/tests_by_db', query: {
        startkey: [':id'],
        endkey: [':id', {}],
        limit: '25'
    }},
    {from: '/test/:id', to: '_list/tests/tests_by_name', query: {
        startkey: [':id'],
        endkey: [':id', {}],
        limit: '25'
    }},

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
    {from: '/find_noise_2/:id', to: '_show/find_noise_2/:id'},

    // catch unmatched urls
    {from: '*', to: '_show/not_found'}
];

