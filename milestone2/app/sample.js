var fs = require('fs');
var esprima = require('esprima');

/**
 * 
 * Adds all the numbers in the array
 *
 * @params {array} base - array of numbers
 * @return {number} The sum of all the numbers
 */
function addNumbers (base) {
    var sum = 0;
	for (var i = 0; i < arguments.length; i++) {
		if (typeof arguments[i] === 'number') {
			sum += arguments[i];
		} else {
			return undefined;
		}
	}
	return sum;
}

/**
 * Add two positive numbers
 *
 * @params {number} a - First number
 * @params {number} b - Second number
 * @return {number} The addition of the two numbers if they are positive
 */
function simpleAddPos (a, b) {
	if (a === undefined) {
		return undefined;
	}

	if (b === undefined) {
		return undefined;
	}

	if (a > 0) {
		if (b > 0) {
			return a + b;
		} else {
			return undefined;
		}
	} else {
		return undefined;
	}
}

/*
 * Return the absolute difference between two numbers
 *
 * @params {number} a - First number
 * @params {number} b - Second number
 * @return {number} The absolute difference between the numbers
 */
function absolute (a, b) {
	if (a > b) {
		return a - b;
	} else {
		if (b > a) {
			return b - a;
		} else {
			return 0;
		}
	}
}

function checkRange (a) {
	if (a > 100) {
		return 1;
	} else {
		if (a < 50) {
			return -1;
		} else {
			return 0;
		}
	}
}

function divideNumbers (base) {
	if (arguments.length > 2) {
		return 0;
	} else if (arguments.length === 2) {
		if (arguments[0] > arguments[1]) {
			return arguments[0]/arguments[1];
		} else if (arguments[0] < arguments[1]) {
			return arguments[1]/arguments[0];
		} else if (arguments[0] === arguments[1]) {
			return 1;
		}
	} else {
		return undefined;
	}
}

function compareNumbers (base) {
	if (arguments.length < 2) {
		return -2;
	}
	if (arguments.length === 2) {
		if (arguments[0] > arguments[1]) {
			return -1;
		} else if (arguments[1] > arguments[0]) {
			return 1;
		} else {
			return 0;
		}
	} else {
		return 2;
	}
}

exports.addNumbers = addNumbers;
exports.divideNumbers = divideNumbers;
exports.compareNumbers = compareNumbers;
exports.simpleAddPos = simpleAddPos;
exports.absolute = absolute;
exports.checkRange = checkRange;
