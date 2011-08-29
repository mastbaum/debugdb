/**
 * Kanso document types to export
 */

var Type = require('kanso/types').Type,
    fields = require('kanso/fields'),
    widgets = require('kanso/widgets');

exports.db = new Type('db', {
    fields: {
        db_id: fields.string(),
        db_slot: fields.number()
    }
});

exports.config = new Type('config', {
    fields: {
        crate_id: fields.number(),
        slot: fields.number(),
        fec_id: fields.string(),
        db: fields.embedList({
            type: exports.db
        })
    }
});

exports.fec_test = new Type('fec_test', {
    fields: {
        created: fields.createdTime(),
        pedestal: fields.boolean(),
        config: fields.embed({
            type: exports.config
        }),
        pass: fields.boolean(),
        chip_disable: fields.boolean(),
        cmos_prog_high: fields.boolean(),
        cmod_prog_low: fields.boolean(),
        cmos_test_reg: fields.embedList({
            type: fields.boolean()
        }),
        lgi_select: fields.boolean(),
    },
});

