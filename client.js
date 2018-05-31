var xinput = require('xinput.js');
var io = require("socket.io-client");

const socket = io("http://192.168.0.50:3001");

var previousState, currentState;

setInterval(sendUpdate, 50);

function sendUpdate() {
	if (xinput.IsConnected(0)) {
		let state = xinput.GetState(0);
		console.log(state);
		socket.emit("update", state);
	}
}

//setInterval(checkForChanges, 50);

function checkForChanges() {
	if (xinput.IsConnected(0)) {
		var changedState;
		
		currentState = xinput.GetState(0);
		changedState = getChangedState(currentState, previousState);
		previousState = currentState;
		
		console.log(changedState);
		socket.emit("update", changedState);
	}
}

function getChangedState(currentState, previousState) {
	var changedState = {};
	if (previousState) {
		changedState = checkPropsForChanges(currentState, previousState);
		return changedState;
	}
	// Previous state is still null (first cycle)
	// so the whole state has changed
	return currentState;
}

function checkPropsForChanges(object1, object2) {
	if (object1 === Object(object1)) {
		var currentLevelObject = {};
		for (var prop in object1) {
			currentLevelObject[prop] = checkPropsForChanges(object1[prop], object2[prop]);
		}
		return currentLevelObject;
	} else {
		if (object1 !== object2) {
			return object1;
		} else {
			return null;
		}
	}	
}

[0].forEach(controllerNum => {
	console.log("Controller %d connected:", controllerNum, xinput.IsConnected(controllerNum));
	// -> Connected: true

	if(xinput.IsConnected(controllerNum)) {
		// Dump the current state
		console.log("Controller %d state:", controllerNum, xinput.GetState(controllerNum));
		/* -> {
		  // Digital inputs
		  buttons: { a: false, b: false, x: false, y: false },
		  dpad: { left: false, right: false, up: false, down: false },
		  shoulder: { left: false, right: false },
		  thumb: { left: false, right: false },
		  control: { back: false, start: false },

		  // Analog inputs
		  trigger: { left: 0, right: 0 },
		  leftstick: { x: -1679, y: 1514 },
		  rightstick: { x: -296, y: -3893 }
		} */

		// Vibrate and stop after 1s
		xinput.Vibrate(controllerNum, 0.5, 0.5);
		setTimeout(() => xinput.Vibrate(controllerNum, 0.0, 0.0), 100);
	}
});

/*
[0, 1, 2, 3]
.filter(n => xinput.IsConnected(n))
.map(n => xinput.WrapController(n, {
	interval: 20,
	deadzone: {
		x: 0.20,
		y: 0.15
	},
	holdtime: 500
}))
.forEach(gamepad => {
	var n = gamepad.deviceNumber;

	gamepad.addListener("button-long", (button, elapsed) => {
		console.log("[%d] Hold button %s for %dms", n, button, elapsed);
		// [1] Hold button buttons.a for 501ms
		socket.emit("button-long", n, button, elapsed);
	});

	gamepad.addListener("button-short", (button, elapsed) => {
		console.log("[%d] Pressed button %s for %dms", n, button, elapsed);
		// [1] Pressed button control.start for 101ms
		socket.emit("button-short", n, button, elapsed);
	});

	gamepad.addListener("button-changed", (button, state) => {
		console.log("[%d] Button %s changed: %s", n, button, state);
		socket.emit("button-changed", n, button, state);
	});

	gamepad.addListener("analog-input", (input, data) => {
		console.log("[%d] Holding %s at:", n, input, data);
		// [1] Holding leftstick at: { x: -0.04042176580095827, y: 0 }
		// [1] Holding trigger at: { left: 0.2235294133424759, right: 0 }
		socket.emit("analog-input", n, input, data);
	});

	gamepad.addListener("connection-changed", (isConnected) => {
		console.log("[%d] Connection state changed: %s", n, isConnected ? "Connected!" : "Disconnected!");
		// [1] Connection state changed: Disconnected!
		// [1] Connection state changed: Connected!
		socket.emit("connection-changed", n, isConnected);
	});
});
*/
