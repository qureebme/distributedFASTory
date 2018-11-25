/**This file contains the function definitions of 
 * the tasks that can be carried out in the
 * FASTory line.
 */

var base = 'http://localhost:3000';
var request = require('request');
var destUrl = 'http://localhost:3000';
var my_ip = 'http://127.0.0.1';

// PALLET LOADING AND UNLOADING
var functions = {
    loadPallet: function() {
        var url = '/RTU/SimROB7/services/LoadPallet';
        request.post({ url: url, json: true, baseUrl: base, body: { "destUrl": destUrl } },
            function(err, resp, body) {
                if (err) console.error(err);
            });
    },

    unloadPallet: function() {
        var url = '/RTU/SimROB7/services/UnloadPallet';
        request.post({ url: url, json: true, baseUrl: base, body: { "destUrl": destUrl } },
            function(err, resp, body) {
                if (err) console.error(err);
            });
    },

    //PAPER LOADING AND UNLOADING
    loadPaper: function() {
        var url = '/RTU/SimROB1/services/LoadPaper';
        request.post({ url: url, json: true, baseUrl: base, body: { "destUrl": destUrl } },
            function(err, resp, body) {
                if (err) console.error(err);
            });
    },

    unloadPaper: function() {
        var url = '/RTU/SimROB1/services/UnloadPaper';
        request.post({ url: url, json: true, baseUrl: base, body: { "destUrl": destUrl } },
            function(err, resp, body) {
                if (err) console.error(err);
            });
    },

    // CONVEYOR CONTROL
    /**
     * Transfer a pallet from zone 1 to zone 2
     * @param {String} rob_num - the workstation number
     */
    trans12: function(rob_num) {
        var url = '/RTU/SimCNV' + rob_num + '/services/TransZone12';
        request.post({ url: url, json: true, baseUrl: base, body: { "destUrl": destUrl } },
            function(err, resp, body) {
                if (err) console.error(err);
            });
    },

    /**
     * Transfer a pallet from zone 2 to zone 3
     * @param {String} rob_num - the workstation number
     */
    trans23: function(rob_num) {
        var url = '/RTU/SimCNV' + rob_num + '/services/TransZone23';
        request.post({ url: url, json: true, baseUrl: base, body: { "destUrl": destUrl } },
            function(err, resp, body) {
                if (err) console.error(err);
            });
    },

    /**
     * Transfer a pallet from zone 3 to zone 5
     * @param {String} rob_num - the workstation number
     */
    trans35: function(rob_num) {
        var url = '/RTU/SimCNV' + rob_num + '/services/TransZone35';
        request.post({ url: url, json: true, baseUrl: base, body: { "destUrl": destUrl } },
            function(err, resp, body) {
                if (err) console.error(err);
            });
    },

    /**
     * Transfer a pallet from zone 1 to zone 4
     * @param {String} rob_num - the workstation number
     */
    trans14: function(rob_num) {
        var url = '/RTU/SimCNV' + rob_num + '/services/TransZone14';
        request.post({ url: url, json: true, baseUrl: base, body: { "destUrl": destUrl } },
            function(err, resp, body) {
                if (err) console.error(err);
            });
    },

    /**
     * Transfer a pallet from zone 4 to zone 5
     * @param {String} rob_num - the workstation number
     */
    trans45: function(rob_num) {
        var url = '/RTU/SimCNV' + rob_num + '/services/TransZone45';
        request.post({ url: url, json: true, baseUrl: base, body: { "destUrl": destUrl } },
            function(err, resp, body) {
                if (err) console.error(err);
            });
    },


    //GET PALLET IDs

    /**
     * get the ID of a pallet in zone 1
     * @param {Number} rob_num - the workstation number
     */
    getID_Z1: function(rob_num) { //will be called if and only when a pallet arrives or leaves Z1
        var url = '/RTU/SimCNV' + rob_num + '/services/Z1';

        request.post({ url: url, json: true, baseUrl: base, body: {} },
            function(err, resp, body) {
                if (err) console.error(err);
                var palletID = res.PalletID;
                if (palletID == -1) return; //pallet left
            });
    },

    /**
     * get the ID of a pallet in zone 4
     * @param {Number} rob_num - the workstation number
     */
    getID_Z4: function(rob_num) {
        var url = '/RTU/SimCNV' + rob_num + '/services/Z4';
        request.post({ url: url, json: true, baseUrl: base, body: {} },
            function(err, resp, body) {
                if (err) console.error(err);
                // handle response
            });
    },

    /**
     * get the ID of a pallet in zone 5
     * @param {Number} rob_num - the workstation number
     */
    getID_Z5: function(rob_num) {
        var url = '/RTU/SimCNV' + rob_num + '/services/Z5';
        request.post({ url: url, json: true, baseUrl: base, body: {} },
            function(err, resp, body) {
                if (err) console.error(err);
                // handle response
            });
    },

    // DRAWING FUNCTIONS

    /**
     * draw a screen of type 1
     * @param {String} rob_num - the workstation number
     */
    screen1: function(rob_num) {
        var url = '/RTU/SimROB' + rob_num + '/services/Draw4';
        request.post({ url: url, json: true, baseUrl: base, body: { "destUrl": destUrl } },
            function(err, resp, body) {
                if (err) console.error(err);
            });
    },

    /**
     * draw a screen of type 2
     * @param {String} rob_num - the workstation number
     */
    screen2: function(rob_num) {
        var url = '/RTU/SimROB' + rob_num + '/services/Draw5';
        request.post({ url: url, json: true, baseUrl: base, body: { "destUrl": destUrl } },
            function(err, resp, body) {
                if (err) console.error(err);
            });
    },

    /**
     * draw a screen of type 3
     * @param {String} rob_num - the workstation number
     */
    screen3: function(rob_num) {
        var url = '/RTU/SimROB' + rob_num + '/services/Draw6';
        request.post({ url: url, json: true, baseUrl: base, body: { "destUrl": destUrl } },
            function(err, resp, body) {
                if (err) console.error(err);
            });
    },

    /**
     * draw a keypad of type 1
     * @param {String} rob_num - the workstation number
     */
    keypad1: function(rob_num) {
        var url = '/RTU/SimROB' + rob_num + '/services/Draw7';
        request.post({ url: url, json: true, baseUrl: base, body: { "destUrl": destUrl } },
            function(err, resp, body) {
                if (err) console.error(err);
            });
    },

    /**
     * draw a keypad of type 2
     * @param {String} rob_num - the workstation number
     */
    keypad2: function(rob_num) {
        var url = '/RTU/SimROB' + rob_num + '/services/Draw8';
        request.post({ url: url, json: true, baseUrl: base, body: { "destUrl": destUrl } },
            function(err, resp, body) {
                if (err) console.error(err);
            });
    },

    /**
     * draw a keypad of type 3
     * @param {String} rob_num - the workstation number
     */
    keypad3: function(rob_num) {
        var url = '/RTU/SimROB' + rob_num + '/services/Draw9';
        request.post({ url: url, json: true, baseUrl: base, body: { "destUrl": destUrl } },
            function(err, resp, body) {
                if (err) console.error(err);
            });
    },

    /**
     * draw a frame of type 1
     * @param {String} rob_num - the workstation number
     */
    frame1: function(rob_num) {
        var url = '/RTU/SimROB' + rob_num + '/services/Draw1';
        request.post({ url: url, json: true, baseUrl: base, body: { "destUrl": destUrl } },
            function(err, resp, body) {
                if (err) console.error(err);
            });
    },

    /**
     * draw a frame of type 2
     * @param {String} rob_num - the workstation number
     */
    frame2: function(rob_num) {
        var url = '/RTU/SimROB' + rob_num + '/services/Draw2';
        request.post({ url: url, json: true, baseUrl: base, body: { "destUrl": destUrl } },
            function(err, resp, body) {
                if (err) console.error(err);
            });
    },

    /**
     * draw a frame of type 3
     * @param {String} rob_num - the workstation number
     */
    frame3: function(rob_num) {
        var url = '/RTU/SimROB' + rob_num + '/services/Draw3';
        request.post({ url: url, json: true, baseUrl: base, body: { "destUrl": destUrl } },
            function(err, resp, body) {
                if (err) console.error(err);
            });
    },

    ///////////// PEN COLOR SELECTION  ///////////////////

    /**
     * select blue pen
     * @param {String} rob_num - the workstation number
     */
    blue: function(rob_num) {
        var url = '/RTU/SimROB' + rob_num + '/services/ChangePenBLUE';

        request.post({ url: url, json: true, baseUrl: base, body: { "destUrl": destUrl } },
            function(err, resp, body) {
                if (err) console.error(err);
            });
    },

    /**
     * select green pen
     * @param {String} rob_num - the workstation number
     */
    green: function(rob_num) {
        var url = '/RTU/SimROB' + rob_num + '/services/ChangePenGREEN';

        request.post({ url: url, json: true, baseUrl: base, body: { "destUrl": destUrl } },
            function(err, resp, body) {
                if (err) console.error(err);
            });
    },

    /**
     * select red pen
     * @param {String} rob_num - the workstation number
     */
    red: function(rob_num) {
        var url = '/RTU/SimROB' + rob_num + '/services/ChangePenRED';

        request.post({ url: url, json: true, baseUrl: base, body: { "destUrl": destUrl } },
            function(err, resp, body) {
                if (err) console.error(err);
            });
    },

    /////////////////////////// EVENT NOTIFICATIONS /////////////////////////

    /**
     * subscribe to notificaions for loading paper
     * @param {String} dest - the destination where this notification should be sent to
     */
    paperLoadedNotif: function(dest) { //paper loads in station 1 only
        var url = '/RTU/SimROB1/events/PaperLoaded/notifs';
        request.post({ url: url, json: true, baseUrl: base, body: { "destUrl": dest } },
            function(err, resp, body) {
                if (err) console.error(err);
            });
    },

    /**
     * subscribe to notificaions for unloading paper
     * @param {String} dest - the destination where this notification should be sent to
     */
    paperUnloadedNotif: function(dest) { //paper unloads in station 1 only
        var url = '/RTU/SimROB1/events/PaperUnloaded/notifs';
        request.post({ url: url, json: true, baseUrl: base, body: { "destUrl": dest } },
            function(err, resp, body) {
                if (err) console.error(err);
            });
    },

    /**
     * subscribe to notificaions for loading a pallet
     * @param {String} dest - the destination where this notification should be sent to
     */
    palletLoadedNotif: function(dest) { //pallet loads in station 7 only
        var url = '/RTU/SimROB7/events/PalletLoaded/notifs';
        request.post({ url: url, json: true, baseUrl: base, body: { "destUrl": dest } },
            function(err, resp, body) {
                if (err) console.error(err);
            });
    },

    /**
     * subscribe to notificaions for unloading pallet
     * @param {String} dest - the destination where this notification should be sent to
     */
    palletUnloadedNotif: function(dest) { //pallet unloads in station 7 only
        var url = '/RTU/SimROB7/events/PalletUnloaded/notifs';
        request.post({ url: url, json: true, baseUrl: base, body: { "destUrl": dest } },
            function(err, resp, body) {
                if (err) console.error(err);
            });
    },

    /**
     * subscribe to notificaions for changing pen (color)
     * @param {String} rob_num - the workstation number
     * @param {String} dest - the destination where this notification should be sent to
     */
    penChangedNotif: function(rob_num, dest) {
        var url = '/RTU/SimROB' + rob_num + '/events/PenChanged/notifs';
        request.post({ url: url, json: true, baseUrl: base, body: { "destUrl": dest } },
            function(err, resp, body) {
                if (err) console.error(err);
            });
    },

    /**
     * subscribe to notificaions for the start of a drawing operation
     * @param {String} rob_num - the workstation number
     * @param {String} dest - the destination where this notification should be sent to
     */
    drawStartNotif: function(rob_num, dest) {
        var url = '/RTU/SimROB' + rob_num + '/events/DrawStartExecution/notifs';
        request.post({ url: url, json: true, baseUrl: base, body: { "destUrl": dest } },
            function(err, resp, body) {
                if (err) console.error(err);
            });
    },

    /**
     * subscribe to notificaions for the end of a drawing operation
     * @param {String} rob_num - the workstation number
     * @param {String} dest - the destination where this notification should be sent to
     */
    drawEndNotif: function(rob_num, dest) {
        var url = '/RTU/SimROB' + rob_num + '/events/DrawEndExecution/notifs';
        request.post({ url: url, json: true, baseUrl: base, body: { "destUrl": dest } },
            function(err, resp, body) {
                if (err) console.error(err);
            });
    },

    /**
     * subscribe to notificaions for when ink levels are low
     * @param {String} rob_num - the workstation number
     * @param {String} dest - the destination where this notification should be sent to
     */
    lowInkNotif: function(rob_num, dest) {
        var url = '/RTU/SimROB' + rob_num + '/events/LowInkLevel/notifs';
        request.post({ url: url, json: true, baseUrl: base, body: { "destUrl": dest } },
            function(err, resp, body) {
                if (err) console.error(err);
            });
    },

    /**
     * subscribe to notificaions for when a workstation runs out of ink
     * @param {String} rob_num - the workstation number
     * @param {String} dest - the destination where this notification should be sent to
     */
    outOfInkNotif: function(rob_num, dest) {
        var url = '/RTU/SimROB' + rob_num + '/events/OutOfInk/notifs';
        request.post({ url: url, json: true, baseUrl: base, body: { "destUrl": dest } },
            function(err, resp, body) {
                if (err) console.error(err);
            });
    },

    /**
     * subscribe to notificaions for when a pallet arrives at or leaves zone 1
     * @param {String} rob_num - the workstation number
     * @param {String} dest - the destination where this notification should be sent to
     */
    Z1_changedNotif: function(rob_num, dest) { //include baseUrl arg for real line
        var url = '/RTU/SimCNV' + rob_num + '/events/Z1_Changed/notifs';
        request.post({ url: url, json: true, baseUrl: base, body: { "destUrl": dest } },
            function(err, resp, body) {
                if (err) console.error(err);
            });
    },

    /**
     * subscribe to notificaions for when a pallet arrives at or leaves zone 2
     * @param {String} rob_num - the workstation number
     * @param {String} dest - the destination where this notification should be sent to
     */
    Z2_changedNotif: function(rob_num, dest) {
        var url = '/RTU/SimCNV' + rob_num + '/events/Z2_Changed/notifs';
        request.post({ url: url, json: true, baseUrl: base, body: { "destUrl": dest } },
            function(err, resp, body) {
                if (err) console.error(err);
            });
    },

    /**
     * subscribe to notificaions for when a pallet arrives at or leaves zone 3
     * @param {String} rob_num - the workstation number
     * @param {String} dest - the destination where this notification should be sent to
     */
    Z3_changedNotif: function(rob_num, dest) {
        var url = '/RTU/SimCNV' + rob_num + '/events/Z3_Changed/notifs';
        request.post({ url: url, json: true, baseUrl: base, body: { "destUrl": dest } },
            function(err, resp, body) {
                if (err) console.error(err);
            });
    },

    /**
     * subscribe to notificaions for when a pallet arrives at or leaves zone 4
     * @param {String} rob_num - the workstation number
     * @param {String} dest - the destination where this notification should be sent to
     */
    Z4_changedNotif: function(rob_num, dest) {
        var url = '/RTU/SimCNV' + rob_num + '/events/Z4_Changed/notifs';
        request.post({ url: url, json: true, baseUrl: base, body: { "destUrl": dest } },
            function(err, resp, body) {
                if (err) console.error(err);
            });
    },

    /**
     * subscribe to notificaions for when a pallet arrives at or leaves zone 5
     * @param {String} rob_num - the workstation number
     * @param {String} dest - the destination where this notification should be sent to
     */
    Z5_changedNotif: function(rob_num, dest) {
        var url = '/RTU/SimCNV' + rob_num + '/events/Z5_Changed/notifs';
        request.post({ url: url, json: true, baseUrl: base, body: { "destUrl": dest } },
            function(err, resp, body) {
                if (err) console.error(err);
            });
    },

    /**
     * delete all subscriptions
     */
    reset: function() {
        var url = '/RTU/reset';
        request.post({ url: url, json: true, baseUrl: base, body: {} },
            function(err, resp, body) {
                if (err) console.error(err);
            });
    }
}

module.exports = functions;