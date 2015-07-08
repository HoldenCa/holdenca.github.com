(function () {
	'use strict';
	//init context
	var canvas = document.getElementById('canvas');
	var gl = WebGLUtils.setupWebGL(canvas);
	var points = [];
	var degree = 0.5;
	var deep = 8;
	var InitPoints = [
		vec2(-0.5, -0.5),
		vec2(0.5, -0.5),
		vec2(0, 0.5)
	];
	gl.viewport(0, 0, canvas.width, canvas.height);
	gl.clearColor(0.0, 0.0, 0.0, 0.0);
	/**
	 * define rotated point
	 * @param x
	 * @param [y]
	 * @return {*[]}
	 */
	function defineRotatedPoint (x, y) {
		if (x instanceof Array) {
			y = x[1];
			x = x[0];
		}
		var newX, newY;
		newX = x * Math.cos(degree * defineDistance(x, y)) - y * Math.sin(degree * defineDistance(x, y));
		newY = x * Math.sin(degree * defineDistance(x, y)) + y * Math.cos(degree * defineDistance(x, y));
		return  [newX, newY];
	}
	/**
	 * define distance from origin
	 * @param {number} x - coordinate
	 * @param {number} y - coordinate
	 */
	function defineDistance (x, y) {
		return Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
	}
	/**
	 * generates points for triangle
	 * @param {Array} a - points [x,y]
	 * @param {Array} b - points [x,y]
	 * @param {Array} c - points [x,y]
	 * @param deep
	 */
	function generatePoints (a, b, c, deep) {
		var ab, bc, ca;
		if (--deep === 0) {
			points.push(defineRotatedPoint(a));
			points.push(defineRotatedPoint(b));
			points.push(defineRotatedPoint(c));
		} else {
			ab = mix(a, b, 0.5);
			bc = mix(b, c, 0.5);
			ca = mix(c, a, 0.5);
			generatePoints(b, ab, bc, deep);
			generatePoints(a, ab, ca, deep);
			generatePoints(ca, bc, c, deep);
			generatePoints(ab, bc, ca, deep);
		}
	}
	generatePoints(InitPoints[0], InitPoints[1], InitPoints[2], deep);
	//init program
	var program = initShaders(gl, 'vertex-shader', 'fragment-shader');
	gl.useProgram(program);
	//load data into GPU
	var bufferId = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
	gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);
	//associate shader variable with variable in js file
	var vPosition = gl.getAttribLocation(program, 'vPosition');
	gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(vPosition);
	render();
	function render () {
		gl.clear(gl.COLOR_BUFFER_BIT);
		gl.drawArrays(gl.TRIANGLES, 0,points.length);
	}
	/**
	 *
	 */
	function reRenderr () {
		points = [];
		generatePoints(InitPoints[0], InitPoints[1], InitPoints[2], deep);
		gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
		gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);
		render();
	}
	/**
	 *
	 */
	var degreeInput = document.getElementById('degree');
	degreeInput.addEventListener('change', function () {
		degree = degreeInput.value;
		reRenderr();
	});
	var deepInput = document.getElementById('deep');
	deepInput.addEventListener('change', function () {
		deep = deepInput.value;
		reRenderr();
	});
})();