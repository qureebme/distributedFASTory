/*eslint-env es6*/
/**ASE-9426: DISTRIBUTED AUTOMATION SYSTEM DESIGN 
 * Assignment 2: agent-based implementation of a distributed automation system
 * 
 * Author: QUREEB HAMEED
 * email: qureeb.hameed@yahoo.com
 * April 2017
 */

var request = require('request');
var events = require('events');
var path = require('path').resolve(__dirname);
var express = require('express');

var my_ip = 'http://127.0.0.1';
var funct = require('./fastory2');

var prodReqs = []; // populates user input from front end

var ports = []; // port number registration portal for worker agents.
// every worker agent assigned a port registers it here first,
// so it can be found by the manager agent

var manifest = []; //A relational 'database' of product requirements and agents that are capable
//of fulfilling each requirement. Every agent has read/write access.

manifest[2] = []; //agents for prodReq[0]
manifest[4] = []; //agents for prodReq[1]
manifest[6] = []; //agents for prodReq[2]

var numOfActivePallets = 0; //number of pallets currently in the system
var maxNumOfPallets = 6; // Not more than 6 pallets in the system at any time
var numOfLoadedPallets = 0; //number of pallets loaded into the system so far in the current production batch

////////////////////////////////////////////////////////////////////////////
// ...because palletUnloadedEmitter isn't implemented in the simulator
var palletUnloadedEmitter = new events.EventEmitter();

palletUnloadedEmitter.on('palletUnloaded', function() {
    console.log('Pallet Unloaded', '\n');
    numOfActivePallets += -1;
    manifest[1] += 1; // number of orders fulfilled

    console.log('number of pallets loaded so far', numOfLoadedPallets);
    console.log('number of orders fulfilled:', manifest[1]);
});
////////////////////////////////////////////////////////////////////////////

//AGENT PROTOTYPE
/**
 * @class
 * @param {String} name - the name of this agent
 * @param {String} number - its workstation number
 * @param {String} capability - the tasks this agent can handle
 */
var agent = function(name, number, capability) { //agent prototype
    this.name = name;
    this.number = number; //station number
    this.capability = capability;
    this.port = undefined; //created on port assignment
    this.ownDB = []; //agent's own record of pallets and task done on them
    this.Z1_pallet = undefined; // = palletID when pallet arrives Z1, = -1 when pallet leaves Z1
    this.Z2_pallet = undefined; // = palletID when pallet arrives Z2, = -1 when pallet leaves Z2
    this.Z3_pallet = undefined; // = palletID when pallet arrives Z3, = -1 when pallet leaves Z3
    this.Z4_pallet = undefined; // = palletID when pallet arrives Z4, = -1 when pallet leaves Z4
    this.Z5_pallet = undefined; // = palletID when pallet arrives Z5, = -1 when pallet leaves Z5
};

/**
 * assign a TCP port to this agent
 * @method
 * @param {Number} portNumber - TCP port number
 */
agent.prototype.assignPort = function(portNumber) { //a comm port
    this.port = portNumber;
    ports.push(portNumber); // new port registered in ports[]!
};

/**
 * extend this agent's capabilities
 * @method
 * @param {String} need - the new capability
 */
agent.prototype.addCapability = function(need) { //add capability
    this.capability.push(need);
};

/**
 * @method
 * @param {String} color - pen color for this agent's robot
 */
agent.prototype.selectPen = function(color) { //for simplification and for faster process, 
    if (color == 'blue') { //each robot has its own pen color.
        funct.blue(this.number);

    } else if (color == 'green') {
        funct.green(this.number);

    } else {
        funct.red(this.number);
    }
};

/**
 * change robot's pen color
 * @method
 * @param {String} newPenColor - the new pen color
 */
agent.prototype.changePenColor = function(newPenColor) {
    if (newPenColor == 'blue') funct.blue(this.number);
    else if (newPenColor == 'green') funct.green(this.number);
    else if (newPenColor == 'red') funct.red(this.number);
    else(console.error('New pen color is not recognized'));
};

/**
 * take this capability away from this agent
 * @method
 * @param {String} capability - one of this agent's capabilities
 */
agent.prototype.removeCapability = function(capability) {
    var index = this.capability.indexOf(capability);
    if (index != -1) { //if the capability truly exists in the agent,
        this.capability.splice(index, 1); //only one at a time
        console.log(capability, 'deleted from:', this.name);
    } else console.log(this.name, 'does not have the capability', capability);
};

/**
 * http server for an agent
 * @method
 */
agent.prototype.createServer = function() {
    var server = require('express')();
    var bodyParser = require('body-parser');
    var request = require('request');

    var ref = this; // the calling agent

    server.use(bodyParser.json({ strict: true }));

    server.post('/whoCan', function(req, res) { //ROUTE 1

        function checkIfYouCan() { //agent responds only if it is capable

            for (var i = 0; i < ref.capability.length; i++) { //parse the request body
                if (ref.capability[i] == req.body.need) {

                    console.log(ref.name, ': I am capable');
                    console.log(ref.name, ':I can do', req.body.need, '\n');

                    if (req.body.number === 0) {
                        manifest[2].push(ref.number);
                        console.log(manifest);
                    } else if (req.body.number == 1) {
                        manifest[4].push(ref.number);
                        console.log(manifest);
                    } else if (req.body.number == 2) {
                        manifest[6].push(ref.number);
                        console.log(manifest);
                    }

                    res.end();
                }
            }
        }
        checkIfYouCan();

    });

    server.post('/what', function(req, res) { //ROUTE 2: for getting agent's parameters
        //parse req body and return properties
        console.log(ref.name, ': parameter request for', body);
        // body must be JSON object with requested parameters as keys
        function tell(body) {
            Object.keys(body).forEach(function(key) {
                console.log(ref.name, ':', key, ref.key); //or can be sent to some html <div> on front end
            });
        }
        tell(req.body);
        res.end();
    });

    server.post('/events', function(req, res) { // events handler route

        if (req.body.id == 'Z1_Changed') {
            var palletID1 = req.body.payload.PalletID;
            ref.Z1_pallet = palletID1;

            if (ref.Z1_pallet != -1) { //precisely on arrival of a pallet at Z1

                var p = manifest.indexOf(ref.Z1_pallet) + 4; // p is the index of paperLoaded variable in manifest

                if (manifest[p] === false) { // paper not loaded yet, move it on
                    if ((ref.Z4_pallet != -1) && (ref.Z4_pallet !== undefined)) { //if Z4 occupied, wait till it's free
                        poll_1 = setInterval(function() {
                            if (ref.Z4_pallet == -1) {
                                funct.trans14(ref.number);
                                clearInterval(poll_1);
                            }
                        }, 5000);
                    } else funct.trans14(ref.number); //else, just trans14

                } else { //pallet already has paper
                    //check indexes 2,4, and 6 in manifest for the needed agents

                    if ((manifest[2].indexOf(ref.number) != -1) || (manifest[4].indexOf(ref.number) != -1) || (manifest[6].indexOf(ref.number) != -1)) {
                        var t1 = manifest.indexOf(ref.Z1_pallet) + 1; //for task1 done or not
                        var t2 = manifest.indexOf(ref.Z1_pallet) + 2; //for task2 done or not
                        var t3 = manifest.indexOf(ref.Z1_pallet) + 3; //for task3 done or not

                        if (manifest[t1] === false) {
                            //task1 is not done yet, check if Z2 is free
                            var need1_index = 3; // location of the task in the manifest

                            if ((ref.Z2_pallet == -1) || (ref.Z2_pallet === undefined)) {
                                //Z2 is free. Take a record of this pallet's need, then trans12.
                                ref.ownDB.push(String(ref.Z1_pallet));
                                ref.ownDB.push(manifest[need1_index]);
                                ref.ownDB.push(1); // will be used to update manifest after drawing
                                funct.trans12(ref.number);
                            } else {
                                if ((ref.Z4_pallet != -1) && (ref.Z4_pallet !== undefined)) { //if Z4 occupied, wait till it's free
                                    poll_2 = setInterval(function() {
                                        if (ref.Z4_pallet == -1) {
                                            funct.trans14(ref.number); // move pallet to Z4
                                            clearInterval(poll_2);
                                        }
                                    }, 5000);
                                } else funct.trans14(ref.number); //else, just trans14
                            }

                        } else if (manifest[t2] === false) {
                            //task2 is not done yet, check if Z2 is free
                            var need2_index = 5; // location of the task in the manifest

                            if ((ref.Z2_pallet == -1) || (ref.Z2_pallet === undefined)) {
                                //Z2 is free. Take a record of this pallet's need, then trans12.
                                ref.ownDB.push(String(ref.Z1_pallet));
                                ref.ownDB.push(manifest[need2_index]);
                                ref.ownDB.push(2); // will be used to update manifest after drawing
                                funct.trans12(ref.number);
                            } else {
                                if ((ref.Z4_pallet != -1) && (ref.Z4_pallet !== undefined)) { //if Z4 occupied, wait till it's free
                                    poll_3 = setInterval(function() {
                                        if (ref.Z4_pallet == -1) {
                                            funct.trans14(ref.number);
                                            clearInterval(poll_3);
                                        }
                                    }, 5000);
                                } else funct.trans14(ref.number); //else, just trans14
                            }

                        } else if (manifest[t3] === false) {
                            //task3 is not done yet, check if Z2 is free
                            var need3_index = 7; // location of the task in the manifest

                            if ((ref.Z2_pallet == -1) || (ref.Z2_pallet === undefined)) {
                                //Z2 is free. Take a record of this pallet's need, then trans12.
                                ref.ownDB.push(String(ref.Z1_pallet));
                                ref.ownDB.push(manifest[need3_index]);
                                ref.ownDB.push(3); // will be used to update manifest after drawing
                                funct.trans12(ref.number);
                            } else {
                                if ((ref.Z4_pallet != -1) && (ref.Z4_pallet !== undefined)) { //if Z4 occupied, wait till it's free
                                    poll_4 = setInterval(function() {
                                        if (ref.Z4_pallet == -1) {
                                            funct.trans14(ref.number); // move pallet to Z4
                                            clearInterval(poll_4);
                                        }
                                    }, 5000);
                                } else funct.trans14(ref.number); //else, just trans14
                            }

                        } else { // all three tasks have been done!
                            if ((ref.Z4_pallet != -1) && (ref.Z4_pallet !== undefined)) { //if Z4 occupied, wait till it's free
                                poll_5 = setInterval(function() {
                                    if (ref.Z4_pallet == -1) {
                                        funct.trans14(ref.number);
                                        clearInterval(poll_5);
                                    }
                                }, 5000);
                            } else funct.trans14(ref.number); //else, just trans14
                        }
                    } else {
                        if ((ref.Z4_pallet != -1) && (ref.Z4_pallet !== undefined)) { //if Z4 occupied, wait till it's free
                            poll_6 = setInterval(function() {
                                if (ref.Z4_pallet == -1) {
                                    funct.trans14(ref.number);
                                    clearInterval(poll_6);
                                }
                            }, 5000);
                        } else funct.trans14(ref.number); //else, just trans14
                    }
                }
            }
        }

        if (req.body.id == 'Z2_Changed') {
            var palletID2 = req.body.payload.PalletID;
            ref.Z2_pallet = palletID2;

            if (ref.Z2_pallet != -1) {

                //pallet has arrived Z2. definitely gonna be serviced
                //check if Z3 is free
                //Z3 free? move Z2 pallet to Z3
                if ((ref.Z3_pallet == -1) || (ref.Z3_pallet === undefined)) funct.trans23(ref.number);
                //else {wait till you're called}
            }
        }

        if (req.body.id == 'Z3_Changed') {
            var palletID3 = req.body.payload.PalletID;
            ref.Z3_pallet = palletID3;

            if (ref.Z3_pallet != -1) {
                //pallet has definitely arrived Z3. Prepare to draw!
                //Check what to do with it in ownDB

                var p2 = ref.ownDB.indexOf(ref.Z3_pallet) + 1; //task index in ownDB
                var task = ref.ownDB[p2]; //the task this agent nedds to fulfill e.g. 'red.keypad1'
                var p3 = task.indexOf('.'); // separating component name from color.

                compo = task.substr(p3 + 1); //e.g. task = red.keypad1, compo = keypad1

                var p4 = manifest.indexOf(ref.Z3_pallet) + ref.ownDB[p2 + 1]; //needs p4 to update the manifest for the current task

                if (compo == 'keypad1') funct.keypad1(ref.number);
                if (compo == 'keypad2') funct.keypad2(ref.number);
                if (compo == 'keypad3') funct.keypad3(ref.number);
                if (compo == 'screen1') funct.screen1(ref.number);
                if (compo == 'screen2') funct.screen2(ref.number);
                if (compo == 'screen3') funct.screen3(ref.number);
                if (compo == 'frame1') funct.frame1(ref.number);
                if (compo == 'frame2') funct.frame2(ref.number);
                if (compo == 'frame3') funct.frame3(ref.number);

                manifest[p4] = true; //mark task as DONE!
                //handle what happens next at DrawExecComplete
            } else { //when pallet leaves Z3, drag in Z2 pallet after 2s
                setTimeout(function() {
                    if (ref.Z2_pallet != -1) funct.trans23(ref.number);
                }, 2000);
            }
        }

        if (req.body.id == 'Z4_Changed') {
            //check if Z5 is free. Bypass conveyor must always be free!
            //OR SIMPLY
            var palletID4 = req.body.payload.PalletID;
            ref.Z4_pallet = palletID4;

            if (ref.Z4_pallet != -1) { // pallet arrives
                //Look ahead
                //Z5 free? trans45
                if ((ref.Z5_pallet == -1) || (ref.Z5_pallet === undefined)) funct.trans45(ref.number);
            } // or wait till Z5 pallet leaves
        }

        if (req.body.id == 'Z5_Changed') {
            var palletID5 = req.body.payload.PalletID;
            ref.Z5_pallet = palletID5;

            if (req.body.payload.PalletID == -1) { //pallet leaves
                //pallet waiting in Z4, bring it on after 1s
                //console.log('A pallet leaves station', ref.number, '\n');
                if ((ref.Z4_pallet != -1) && (ref.Z4_pallet !== undefined)) {
                    setTimeout(function() {
                        funct.trans45(ref.number);
                    }, 1000);
                }
            }
        }

        if (req.body.id == 'DrawEndExecution') {
            console.log('Drawing operation has just ended in station', ref.number, '\n');
            //if Z1 and Z4 and Z5 free, trans35.(to be absolutely sure!)
            if ((ref.Z1_pallet == -1) && ((ref.Z4_pallet == -1) || (ref.Z4_pallet === undefined)) && ((ref.Z5_pallet == -1) || (ref.Z5_pallet === undefined))) {
                funct.trans35(ref.number);
            } else { //poll for the same condition

                poll_7 = setInterval(function() {
                    if ((ref.Z1_pallet == -1) && ((ref.Z4_pallet == -1) || (ref.Z4_pallet === undefined)) && ((ref.Z5_pallet == -1) || (ref.Z5_pallet === undefined))) {
                        {
                            funct.trans35(ref.number);
                            clearInterval(poll_7);
                        }
                    }
                }, 3000);
            }
        }

        if (req.body.id == 'DrawStartExecution') {
            console.log('Drawing operation has started in station', ref.number, '\n');
        }

        res.end();

    });
    server.listen(ref.port, function() { console.log(ref.name, 'is listening on port', ref.port); });

};


//AGENT CREATION

var agent1 = new agent('agent1', '1', []);
agent1.port = 4001; //not registered

agent1.createServer = function() { //unique agent1 server
    var server = require('express')();
    var bodyParser = require('body-parser');
    var request = require('request');

    var ref = this; //agent1
    server.use(bodyParser.json({ strict: true }));

    server.post('/events', function(req, res) {

        if (req.body.id == 'Z1_Changed') {
            var palletID1 = req.body.payload.PalletID;
            ref.Z1_pallet = palletID1;

            //Look ahead on arrival: if Z2 is free, move pallet there
            if (ref.Z1_pallet != -1) {
                if ((ref.Z2_pallet == -1) || (ref.Z2_pallet === undefined)) {
                    funct.trans12(ref.number);
                }
            }
        }

        if (req.body.id == 'Z2_Changed') {
            var palletID2 = req.body.payload.PalletID;
            ref.Z2_pallet = palletID2;

            //On arrival, Look ahead
            if (ref.Z2_pallet != -1) {
                //if Z3 is free, wait 2s before moving there, just in case...
                if ((ref.Z3_pallet == -1) || (ref.Z3_pallet === undefined)) {
                    setTimeout(function() {
                        funct.trans23(ref.number);
                    }, 2000);
                } //else, wait for Z3 pallet to leave

            } else { //precisely when leaving (ref.Z2_pallet = -1)
                //On departure, Look backwards
                //if a pallet was kept waiting in Z1
                if (ref.Z1_pallet != -1) funct.trans12(ref.number); //ref.Z1_pallet cannot now be undefined
            }
        }

        if (req.body.id == 'Z3_Changed') { //done
            var palletID3 = req.body.payload.PalletID;
            ref.Z3_pallet = palletID3;

            if (ref.Z3_pallet != -1) {
                //Pallet has definitely arrived Z3
                //check manifest to see if paper has been loaded
                //if no, load paper . Else, trans35

                var pp = manifest.indexOf(ref.Z3_pallet) + 4; //index of paperLoaded variable for this pallet
                if (manifest[pp] === false) { //paper not loaded, 

                    funct.loadPaper(); //there4 load paper and
                    manifest[pp] = true; // update the manifest
                    //handle what happens next at paperLoaded event

                } else if ((manifest[pp - 1] === true) && (manifest[pp - 2] === true) && (manifest[pp - 3] === true)) {
                    //check if pallet actually needs to unload paper
                    //unload paper if all 3 prodReqs have been fulfilled
                    funct.unloadPaper();
                    //update manifest for paperLoaded variable
                    manifest[pp] = false; // use this var to unload this pallet at station 7 Z3
                    //handle what happens next at paperUnloaded event

                } else { //pallet is just passing by, neither loading nor unloading
                    //trans35 if Z5 is free.
                    //if Z2 is occupied at the same time, let Z2 pallet wait for 3s
                    // so it doesn't interfere with Z3 pallet movement to Z5
                    if ((ref.Z5_pallet == -1) || (ref.Z5_pallet === undefined)) {
                        funct.trans35(ref.number);
                        /*if (ref.Z2_pallet != -1) { //if Z2 is also occupied,
                            setTimeout(function() {
                                funct.trans23(ref.number); //move Z2 pallet after 3s
                            }, 3000);
                        }*/ //z3 leaves shd handle this! check!
                    } else { //pallet wants to leave but Z5 is not free
                        var poll_x = setInterval(function() {
                            if (ref.Z5_pallet == -1) {
                                funct.trans35(ref.number);
                                clearInterval(poll_x);
                            }
                        }, 5000);
                    }
                }
            } else { //whenever a pallet leaves Z3
                //if a pallet is waiting in Z2,
                if (ref.Z2_pallet != -1) {
                    setTimeout(function() { //wait 3s before moving it to Z3
                        funct.trans23(ref.number);
                    }, 3000);
                }
            }
        }

        if (req.body.id == 'Z5_Changed') {
            var palletID5 = req.body.payload.PalletID;
            ref.Z5_pallet = palletID5;

            if (ref.Z5_pallet == -1) {
                //console.log('A pallet leaves station', ref.number, '\n');
            }
        }

        if (req.body.id == 'PaperLoaded') {
            console.log('Paper Loaded', '\n');
            //if Z5 is free, trans35 and
            //check if pallet is kept waiting in Z2
            //if waiting, delay trans23. else, do nothing

            if ((ref.Z5_pallet == -1) || (ref.Z5_pallet === undefined)) {
                funct.trans35(ref.number);

            } else { //pallet wants to leave but Z5 is not free
                var poll_x2 = setInterval(function() {
                    if (ref.Z5_pallet == -1) {
                        funct.trans35(ref.number);
                        clearInterval(poll_x2);
                    }
                }, 5000);
            }
        }

        if (req.body.id == 'PaperUnloaded') {

            console.log('Paper Unloaded');
            if ((ref.Z5_pallet == -1) || (ref.Z5_pallet === undefined)) {
                funct.trans35(ref.number);

            } else { //pallet wants to leave but Z5 is not free
                var poll_x3 = setInterval(function() {
                    if (ref.Z5_pallet == -1) {
                        funct.trans35(ref.number);
                        clearInterval(poll_x3);
                    }
                }, 5000);
            }
        }

        res.end();

    });

    server.listen(ref.port, function() { console.log(ref.name, 'is listening on port', ref.port); });
};

agent1.createServer();

var agent2 = new agent('agent2', '2', ['green.frame1', 'green.frame2', 'green.frame3']);
agent2.assignPort(4002);
agent2.createServer();
agent2.selectPen('green');

var agent3 = new agent('agent3', '3', ['green.screen1', 'green.screen2', 'green.screen3']);
agent3.assignPort(4003);
agent3.createServer();
agent3.selectPen('green');

var agent4 = new agent('agent4', '4', ['green.keypad1', 'green.keypad2', 'green.keypad3']);
agent4.assignPort(4004);
agent4.createServer();
agent4.selectPen('green');

var agent5 = new agent('agent5', '5', ['blue.frame1', 'blue.frame2', 'blue.frame3']);
agent5.assignPort(4005);
agent5.createServer();
agent5.selectPen('blue');

var agent6 = new agent('agent6', '6', ['blue.screen1', 'blue.screen2', 'blue.screen3']);
agent6.assignPort(4006);
agent6.createServer();
agent6.selectPen('blue');

var agent7 = new agent('agent7', '7', []);
agent7.port = 4007; //not registered

agent7.loadPallet = function() { //special function for agent7. Do this ONLY IF...
    //a positive number of products is ordered, and
    //num of pallets in the system is less than the allowed maximum, and
    //num of pallets loaded so far is less than num of products ordered, and
    //Z2 and Z3 must be free
    var ref = this;
    setInterval(function() {
        if (manifest[0] < 1) {
            console.log('You must order at least one product');
            return;
        }

        if (numOfActivePallets == maxNumOfPallets) return;

        if (manifest[0] == numOfLoadedPallets) return;

        if ((numOfActivePallets < maxNumOfPallets) && (numOfLoadedPallets < manifest[0]) && ((manifest[0] - numOfLoadedPallets) > 1)) {
            setTimeout(function() { //Load 2 pallets (if all's fine)
                if (((ref.Z2_pallet === undefined) || (ref.Z2_pallet === -1)) && ((ref.Z3_pallet === undefined) || (ref.Z3_pallet === -1))) {
                    // ensure Z2 and Z3 are free
                    funct.loadPallet(ref.number);
                }
            }, 2000);

            setTimeout(function() {
                // ensure Z2 and Z3 are free
                if (((ref.Z2_pallet === undefined) || (ref.Z2_pallet === -1)) && ((ref.Z3_pallet === undefined) || (ref.Z3_pallet === -1))) {
                    funct.loadPallet(ref.number);
                }
            }, 6000);

            //Load just 1!
        } else if (((manifest[0] - numOfLoadedPallets) == 1) && (numOfActivePallets < maxNumOfPallets)) {
            if (((ref.Z2_pallet === undefined) || (ref.Z2_pallet === -1)) && ((ref.Z3_pallet === undefined) || (ref.Z3_pallet === -1))) {
                funct.loadPallet(ref.number);
            }
        }
    }, 10000);
};

agent7.unloadPallet = function() {
    funct.unloadPallet();
};

agent7.createServer = function() {
    var server = require('express')();
    var bodyParser = require('body-parser');
    var request = require('request');

    var ref = this; //agent7
    server.use(bodyParser.json({ strict: true }));

    server.post('/events', function(req, res) {

        if (req.body.id == 'PalletLoaded') {

            var palletID33 = req.body.payload.PalletID;
            ref.Z3_pallet = palletID33;

            numOfActivePallets += 1;
            numOfLoadedPallets += 1;

            manifest.push(String(ref.Z3_pallet)); //register the pallet in the manifest// Strange String!!
            manifest.push(false); // prodReq[0] is yet to be fulfilled
            manifest.push(false); // prodReq[1] is yet to be fulfilled
            manifest.push(false); // prodReq[2] is yet to be fulfilled
            manifest.push(false); // paper is not loaded yet

            console.log(manifest, '\n');
            console.log('number of pallets loaded in this batch so far:', numOfLoadedPallets);
            console.log('number of orders fulfilled:', manifest[1]);
            console.log('number of active pallets:', numOfActivePallets);

            if ((ref.Z5_pallet == -1) || (ref.Z5_pallet === undefined)) funct.trans35(ref.number);
            else {
                var poll_8 = setInterval(function() {
                    if (ref.Z5_pallet == -1) {
                        funct.trans35(ref.number);
                        clearInterval(poll_8);
                    }
                }, 5000);
            }

            //if Z2 is occupied? let Z2 pallet wait 2s
            if ((ref.Z2_pallet != -1) && (ref.Z2_pallet !== undefined)) { //just maybe
                setTimeout(function() {
                    funct.trans23(ref.number);
                }, 2000);
            }
        }

        if (req.body.id == 'Z1_Changed') {
            var palletID1 = req.body.payload.PalletID;
            ref.Z1_pallet = palletID1;

            if (ref.Z1_pallet != -1) {
                //Look ahead for Z2
                if ((ref.Z2_pallet == -1) || (ref.Z2_pallet === undefined)) funct.trans12(ref.number);
            }
        }

        if (req.body.id == 'Z2_Changed') {
            var palletID2 = req.body.payload.PalletID;
            ref.Z2_pallet = palletID2;

            if (ref.Z2_pallet != -1) { //On arrival, wait 2s

                setTimeout(function() {
                    funct.trans23(ref.number);
                }, 2000);

            } else {
                //Look back when you leave
                if (ref.Z1_pallet != -1) funct.trans12(ref.number);
            }
        }

        if (req.body.id == 'Z3_Changed') {
            var palletID3 = req.body.payload.PalletID;
            ref.Z3_pallet = palletID3;

            if (ref.Z3_pallet != -1) { //On arrival, check if pallet has paper

                var p = manifest.indexOf(ref.Z3_pallet) + 4; //paper variable

                if (manifest[p] === false) { //unload pallet if paper has been taken off!
                    ref.unloadPallet();
                    palletUnloadedEmitter.emit('palletUnloaded');

                } else { //else, keep it going
                    if ((ref.Z5_pallet == -1) || ((ref.Z5_pallet === undefined))) funct.trans35(ref.number);
                }
            } else {
                //On departure: if Z2 is occupied, let Z2 pallet wait for 2s
                if (ref.Z2_pallet != -1) {
                    setTimeout(function() {
                        funct.trans23(ref.number);
                    }, 3000);
                }
            }
        }

        if (req.body.id == 'Z5_Changed') {
            var palletID5 = req.body.payload.PalletID;
            ref.Z5_pallet = palletID5;

            if (ref.Z5_pallet == -1) {
                //console.log('A pallet leaves station', ref.number, '\n');
            }
        }

        res.end();

    });

    server.listen(ref.port, function() { console.log(ref.name, 'is listening on port', ref.port); });
};

agent7.createServer();

var agent8 = new agent('agent8', '8', ['blue.keypad1', 'blue.keypad2', 'blue.keypad3']);
agent8.assignPort(4008);
agent8.createServer();
agent8.selectPen('blue');

var agent9 = new agent('agent9', '9', ['red.frame1', 'red.frame2', 'red.frame3']);
agent9.assignPort(4009);
agent9.createServer();
agent9.selectPen('red');

var agent10 = new agent('agent10', '10', ['red.screen1', 'red.screen2', 'red.screen3']);
agent10.assignPort(4010);
agent10.createServer();
agent10.selectPen('red');

var agent11 = new agent('agent11', '11', ['red.keypad1', 'red.keypad2', 'red.keypad3']);
agent11.assignPort(4011);
agent11.createServer();
agent11.selectPen('red');

var agent12 = new agent('agent12', '12', ['green.frame2', 'green.screen1', 'green.keypad1', 'green.keypad3']);
agent12.assignPort(4012);
agent12.createServer();
agent11.selectPen('green');

var manager = new agent('manager', '0', []);
manager.port = 8000;

// MANAGER SERVER
manager.createServer = function() { //'METHOD' OVERRIDE:manager server

    var server = require('express')();
    var bodyParser = require('body-parser');
    var request = require('request');

    var ref = this;
    server.use(express.static(path));
    server.use(bodyParser.json({ strict: false })); //////////is this the problem?
    server.use(bodyParser.urlencoded({ extended: true }));

    server.get('/', function(req, res) {
        res.sendFile(express.static(path));
        res.end();
    });

    server.post('/reqs', function(req, res) { //ROUTE_1
        var keypad = req.body.keypadColor + '.' + req.body.keypadType;
        var screen = req.body.screenColor + '.' + req.body.screenType;
        var frame = req.body.frameColor + '.' + req.body.frameType;

        prodReqs.push(keypad);
        prodReqs.push(screen);
        prodReqs.push(frame);

        manifest[0] = parseInt(req.body.numberOfProducts);
        manifest[1] = 0; // number of fulfilled orders
        manifest[3] = prodReqs[0];
        manifest[5] = prodReqs[1];
        manifest[7] = prodReqs[2];

        if (prodReqs) { // section 1: print requirements to console
            prodReqs.forEach(function(item) {
                var i = item.indexOf('.');
                var color = '';
                var component = '';
                for (n = i + 1; n < item.length; n++) {
                    component += item.charAt(n);
                }
                for (k = 0; k < i; k++) {
                    color += item.charAt(k);
                }
                console.log('You want a ', color, component, '\n');
            });
        } else console.log('Product requirements have not been specified'); //section1 end

        (function findCapabilities() { //section2: notify agents about the needs

            for (var i = 0; i < prodReqs.length; i++) { //for each req,
                for (var k = 0; k < ports.length; k++) { // agents 2 to 6
                    var url = my_ip + ':' + ports[k] + '/whoCan';
                    request.post({ url: url, json: true, body: { "need": prodReqs[i], "number": i } },
                        function(err, resp, body) {
                            if (err) console.error(err);
                        });
                }
            }

        })();

        res.end('You can continue to view process logs in the console');
    }); //ROUTE 1 END

    server.listen(ref.port, function() { console.log(ref.name, 'is listening on port', ref.port); });
};

manager.createServer(); //manager server

agent7.loadPallet(); //start production

console.log('Worker agents\'s ports>>>', ports);

////////////////////////////////////// EVENT SUBSCRIPTIONS ////////////////////////////////////
//PALLET LOADED/UNLOADED
funct.palletLoadedNotif('http://127.0.0.1:4007/events');

//PAPER LOADED/UNLOADED
funct.paperLoadedNotif('http://127.0.0.1:4001/events');
funct.paperUnloadedNotif('http://127.0.0.1:4001/events');

//Z1_CHANGED
funct.Z1_changedNotif('1', 'http://127.0.0.1:4001/events');
funct.Z1_changedNotif('2', 'http://127.0.0.1:4002/events');
funct.Z1_changedNotif('3', 'http://127.0.0.1:4003/events');
funct.Z1_changedNotif('4', 'http://127.0.0.1:4004/events');
funct.Z1_changedNotif('5', 'http://127.0.0.1:4005/events');
funct.Z1_changedNotif('6', 'http://127.0.0.1:4006/events');
funct.Z1_changedNotif('7', 'http://127.0.0.1:4007/events');
funct.Z1_changedNotif('8', 'http://127.0.0.1:4008/events');
funct.Z1_changedNotif('9', 'http://127.0.0.1:4009/events');
funct.Z1_changedNotif('10', 'http://127.0.0.1:4010/events');
funct.Z1_changedNotif('11', 'http://127.0.0.1:4011/events');
funct.Z1_changedNotif('12', 'http://127.0.0.1:4012/events');

//Z2_CHANGED
funct.Z2_changedNotif('1', 'http://127.0.0.1:4001/events');
funct.Z2_changedNotif('2', 'http://127.0.0.1:4002/events');
funct.Z2_changedNotif('3', 'http://127.0.0.1:4003/events');
funct.Z2_changedNotif('4', 'http://127.0.0.1:4004/events');
funct.Z2_changedNotif('5', 'http://127.0.0.1:4005/events');
funct.Z2_changedNotif('6', 'http://127.0.0.1:4006/events');
funct.Z2_changedNotif('7', 'http://127.0.0.1:4007/events');
funct.Z2_changedNotif('8', 'http://127.0.0.1:4008/events');
funct.Z2_changedNotif('9', 'http://127.0.0.1:4009/events');
funct.Z2_changedNotif('10', 'http://127.0.0.1:4010/events');
funct.Z2_changedNotif('11', 'http://127.0.0.1:4011/events');
funct.Z2_changedNotif('12', 'http://127.0.0.1:4012/events');

//Z3_CHANGED
funct.Z3_changedNotif('1', 'http://127.0.0.1:4001/events');
funct.Z3_changedNotif('2', 'http://127.0.0.1:4002/events');
funct.Z3_changedNotif('3', 'http://127.0.0.1:4003/events');
funct.Z3_changedNotif('4', 'http://127.0.0.1:4004/events');
funct.Z3_changedNotif('5', 'http://127.0.0.1:4005/events');
funct.Z3_changedNotif('6', 'http://127.0.0.1:4006/events');
funct.Z3_changedNotif('7', 'http://127.0.0.1:4007/events');
funct.Z3_changedNotif('8', 'http://127.0.0.1:4008/events');
funct.Z3_changedNotif('9', 'http://127.0.0.1:4009/events');
funct.Z3_changedNotif('10', 'http://127.0.0.1:4010/events');
funct.Z3_changedNotif('11', 'http://127.0.0.1:4011/events');
funct.Z3_changedNotif('12', 'http://127.0.0.1:4012/events');

//Z4_CHANGED
funct.Z4_changedNotif('2', 'http://127.0.0.1:4002/events');
funct.Z4_changedNotif('3', 'http://127.0.0.1:4003/events');
funct.Z4_changedNotif('4', 'http://127.0.0.1:4004/events');
funct.Z4_changedNotif('5', 'http://127.0.0.1:4005/events');
funct.Z4_changedNotif('6', 'http://127.0.0.1:4006/events');

funct.Z4_changedNotif('8', 'http://127.0.0.1:4008/events');
funct.Z4_changedNotif('9', 'http://127.0.0.1:4009/events');
funct.Z4_changedNotif('10', 'http://127.0.0.1:4010/events');
funct.Z4_changedNotif('11', 'http://127.0.0.1:4011/events');
funct.Z4_changedNotif('12', 'http://127.0.0.1:4012/events');

//Z5_CHANGED
funct.Z5_changedNotif('1', 'http://127.0.0.1:4001/events');
funct.Z5_changedNotif('2', 'http://127.0.0.1:4002/events');
funct.Z5_changedNotif('3', 'http://127.0.0.1:4003/events');
funct.Z5_changedNotif('4', 'http://127.0.0.1:4004/events');
funct.Z5_changedNotif('5', 'http://127.0.0.1:4005/events');
funct.Z5_changedNotif('6', 'http://127.0.0.1:4006/events');
funct.Z5_changedNotif('7', 'http://127.0.0.1:4007/events');
funct.Z5_changedNotif('8', 'http://127.0.0.1:4008/events');
funct.Z5_changedNotif('9', 'http://127.0.0.1:4009/events');
funct.Z5_changedNotif('10', 'http://127.0.0.1:4010/events');
funct.Z5_changedNotif('11', 'http://127.0.0.1:4011/events');
funct.Z5_changedNotif('12', 'http://127.0.0.1:4012/events');

//DRAW START
funct.drawStartNotif('2', 'http://127.0.0.1:4002/events');
funct.drawStartNotif('3', 'http://127.0.0.1:4003/events');
funct.drawStartNotif('4', 'http://127.0.0.1:4004/events');
funct.drawStartNotif('5', 'http://127.0.0.1:4005/events');
funct.drawStartNotif('6', 'http://127.0.0.1:4006/events');
funct.drawStartNotif('8', 'http://127.0.0.1:4008/events');
funct.drawStartNotif('9', 'http://127.0.0.1:4009/events');
funct.drawStartNotif('10', 'http://127.0.0.1:4010/events');
funct.drawStartNotif('11', 'http://127.0.0.1:4011/events');
funct.drawStartNotif('12', 'http://127.0.0.1:4012/events');

//DRAW END
funct.drawEndNotif('2', 'http://127.0.0.1:4002/events');
funct.drawEndNotif('3', 'http://127.0.0.1:4003/events');
funct.drawEndNotif('4', 'http://127.0.0.1:4004/events');
funct.drawEndNotif('5', 'http://127.0.0.1:4005/events');
funct.drawEndNotif('6', 'http://127.0.0.1:4006/events');
funct.drawEndNotif('8', 'http://127.0.0.1:4008/events');
funct.drawEndNotif('9', 'http://127.0.0.1:4009/events');
funct.drawEndNotif('10', 'http://127.0.0.1:4010/events');
funct.drawEndNotif('11', 'http://127.0.0.1:4011/events');
funct.drawEndNotif('12', 'http://127.0.0.1:4012/events');