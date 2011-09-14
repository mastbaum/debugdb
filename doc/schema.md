Schemas for DebugDB Documents
=============================

* All documents have an optional key 'final_test_id' with any final_test document`s UUID as a value.
* All documents require a boolean key 'pass'
* All documents require a unique string key '_id'; a user-generated UUID is recommended.
* All documents require a string datetime key 'created' (e.g. 'Tue Jul 12 12:34:11 2011')
* All documents require a key 'config', the value of which is a dictionary with the follwing keys:
  * db: array of dictionaries with keys 'db_id' (string) and 'slot' (integer)
  * fec_id: string
  * crate_id: integer
  * slot: integer
  * loc: string ("penn" | "underground" | "surface")

Example config:

    {
        "db": [
            {
                "db_id": "d071",
                "slot": 0
            },
            {
                "db_id": "d0c3",
                "slot": 1
            },
            {
                "db_id": "d2d8",
                "slot": 2
            },
            {
                "db_id": "d214",
                "slot": 3
            }
        ],
        "fec_id": "f09f",
        "crate_id": 12,
        "slot": 13,
        "loc": "penn"
    }

cald_test
---------
* type: 'cald_test'
* adc_0: integer array, length 550
* adc_1: integer array, length 550
* adc_2: integer array, length 550
* adc_3: integer array, length 550
* dac_value: integer array, length 550

cgt_test
--------
* type: 'cgt_test'
* printout: string
* missing_bundles: boolean

chinj_scan
----------
* type: 'chinj_scan'
* QHL_even: (length 32) array of (length 26) integer arrays
* QHL_odd: (length 32) array of (length 26) integer arrays
* QHS_even: (length 32) array of (length 26) integer arrays
* QHS_odd: (length 32) array of (length 26) integer arrays
* QLX_even: (length 32) array of (length 26) integer arrays
* QLX_odd: (length 32) array of (length 26) integer arrays
* TAC_even: (length 32) array of (length 26) integer arrays
* TAC_odd: (length 32) array of (length 26) integer arrays
* errors_even: (length 32) array of (length 26) boolean arrays
* errors_odd: (length 32) array of (length 26) boolean arrays

cmos_m_gtvalid
--------------
* type: 'cmos_m_gtvalid'
* iseta: number array (length 2)
* isetm: number array (length 2)
* tacref: number
* vmax: number
* channels: array of dictionaries with keys 'id' (integer), 'tac_shift' (integer), 'errors' (boolean)

crate_cbal
----------
* type: 'crate_cbal'
* channels: array of dictionaries with keys 'id' (integer), 'vbal_low' (integer), vbal_high (integer), 'errors' (boolean)

disc_check
----------
* type: 'disc_check'
* channels: array of dictionaries with keys 'id' (integer), 'count_minus_peds' (integer), 'errors' (boolean)

fec_test
--------
* type: 'fec_test'
* lgi_select: boolean
* pedestal: boolean
* chip_disable: boolean
* cmos_prog_high: boolean
* cmos_prog_low: boolean
* cmos_test_reg: boolean array (length 32)

fifo_test
---------
* type: 'fifo_test'
* printout: string

final_test
----------
* type: 'final_test'
* fec_comments: string
* cleaned: boolean
* refurbished: boolean
* dc_offset_n100: number
* dc_offset_n20: number
* dc_offset_esumhi: number
* dc_offset_esumlo: number
* db0_comments: string
* db0_dark_matter: boolean
* db1_comments: string
* db1_dark_matter: boolean
* db2_comments: string
* db2_dark_matter: boolean
* db3_comments: string
* db3_dark_matter: boolean

get_ttot
--------
* type: 'get_ttot'
* target_time: number
* channels: array of dictionaries with keys 'id' (integer), 'time' (integer), 'errors' (boolean)

mb_stability_test
-----------------
* type: 'mb_stability_test'
* printout: string

mem_test
--------
* type: 'mem_test'
* address_test: string
* pattern test: array of strings

ped_run
-------
* type: 'ped_run'
* errors: boolean array (length 32)
* num: (length 32) array of (length 16) integer arrays
* qhl: (length 32) array of (length 16) number arrays
* qhl_rms: (length 32) array of (length 16) number arrays
* qhs: (length 32) array of (length 16) number arrays
* qhs_rms: (length 32) array of (length 16) number arrays
* qlx: (length 32) array of (length 16) number arrays
* qlx_rms: (length 32) array of (length 16) number arrays
* tac: (length 32) array of (length 16) number arrays
* tac_rms: (length 32) array of (length 16) number arrays

vmon
----
* type: 'vmon'
* hvt: number
* temp: number
* cald: number
* voltages: array of dictionaries with keys 'name' (string), 'nominal' (number), 'value' (number)

zdisc
-----
* type: 'zdisc'
* errors: boolean array (length 32)
* lower_dac: number array (length 32)
* upper_dac: number array (length 32)
* max_dac: number array (length 32)
* zero_dac: number array (length 32)
* lower_rate: number array (length 32)
* upper_rate: number array (length 32)
* max_rate: number array (length 32)

