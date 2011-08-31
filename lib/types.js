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
        loc: fields.string(),
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
        created: fields.string(),
        pass: fields.boolean(),
        config: fields.embed({
            type: exports.config
        }),
        pedestal: fields.boolean(),
        chip_disable: fields.boolean(),
        cmos_prog_high: fields.boolean(),
        cmod_prog_low: fields.boolean(),
        cmos_test_reg: fields.embedList({
            type: fields.boolean
        }),
        lgi_select: fields.boolean(),
    },
});

exports.cald_test = new Type('cald_test', {
    fields: {
        created: fields.string(),
        pass: fields.boolean(),
        config: fields.embed({
            type: exports.config
        }),
        dac_value: fields.embedList({
            type: fields.number
        }),
        adc0: fields.embedList({
            type: fields.number
        }),
        adc1: fields.embedList({
            type: fields.number
        }),
        adc2: fields.embedList({
            type: fields.number
        }),
        adc3: fields.embedList({
            type: fields.number
        }),
    },
});

exports.cmos_m_gtvalid = new Type('cmos_m_gtvalid', {
    fields: {
        created: fields.string(),
        pass: fields.boolean(),
        config: fields.embed({
            type: exports.config
        }),
        tacref: fields.number(),
        vmax: fields.number(),
        errors: fields.embedList({
            type: fields.boolean
        }),
        iseta: fields.embedList({
            type: fields.number
        }),
        isetm: fields.embedList({
            type: fields.number
        }),
        tac_shift: fields.embedList({
            type: fields.number
        }),
    },
});

