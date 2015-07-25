(function () {
	var canvas = document.getElementById('canvas');
	var colorPicker = document.getElementById('colorPicker');
	var gl = WebGLUtils.setupWebGL(canvas);
	gl.viewport(0, 0, canvas.width, canvas.height);
	gl.clearColor(0, 0, 0, 1);
	var points = [];
	var width = 2;
	var program = initShaders(gl, 'vertex', 'fragment');
	gl.useProgram(program);
	var linesInfo = [];
	var usedColor = [
		vec4(1 ,1, 0, 1)
	];
	/**
	 *
	 */
	gl.viewport(0, 0, canvas.width, canvas.height);
	/**
	 *
	 */
	function bidDataWithBuffer (bufferId, data) {
		gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
		gl.bufferData(gl.ARRAY_BUFFER, flatten(data), gl.STATIC_DRAW);
	}
	/**
	 *
	 */
	function setFolatVec4Uniform (program, vector, name) {
		var uniformLocation = gl.getUniformLocation(program, name);
		gl.uniform4fv(uniformLocation, flatten(vector));
	}
	/**
	 *
	 * @param program
	 * @param attributeName
	 * @param data
	 * @param dimention
	 * @return {{bufferId: WebGLBuffer, attributeLocation: *}}
	 */
	function applyDataToShaderAttribute (program, attributeName, data, dimention) {
		/**
		 *
		 * @type {WebGLBuffer}
		 */
		var bufferId = gl.createBuffer();
		bidDataWithBuffer(bufferId, data);
		/**
		 *
		 */
		var attributeLocation = gl.getAttribLocation(program, attributeName);
		gl.vertexAttribPointer(attributeLocation, dimention, gl.FLOAT, false, 0, 0);
		gl.enableVertexAttribArray(attributeLocation);
		return {
			bufferId: bufferId,
			attributeLocation: attributeLocation
		}
	}
	/**
	 * @param hex
	 * @param opacity
	 * @return {string|*}
	 */
	function getColor (hex,opacity){
		var r, g, b;
		hex = hex.replace('#','');
		r = parseInt(hex.substring(0,2), 16);
		g = parseInt(hex.substring(2,4), 16);
		b = parseInt(hex.substring(4,6), 16);
		return vec4(r/255, g/255, b/255, opacity);
	}

	/**
	 *
	 */
	function draw () {
		var i, len;
		for (i = 0, len = linesInfo.length; i < len; i++) {
			setFolatVec4Uniform(program, linesInfo[i].color, 'fLineColour');
			gl.drawArrays(gl.LINE_STRIP, linesInfo[i].start, linesInfo[i].count);
		}
	}
	/**
	 *
	 */
	var bufferId = applyDataToShaderAttribute(program, 'vPosition', points, 2).bufferId;
	window.addEventListener('mousedown', function () {
		var line = {
			start: points.length,
			color: getColor(colorPicker.value, 1),
			count: 0
		};
		linesInfo.push(line);
		var onMouseMove = function (mmEvent) {
			var x = mmEvent.offsetX,
				y = mmEvent.offsetY,i;
			points.push(vec2(x / canvas.width * 2 - 1, -1 * (y / canvas.height * 2 - 1)));
			bidDataWithBuffer(bufferId, points);
			line.count++;
			draw();
		};
		var onMouseUp = function () {
			canvas.removeEventListener('mousemove', onMouseMove)
		};
		canvas.addEventListener('mousemove', onMouseMove, false);
		window.addEventListener('mouseup', onMouseUp, false);

	});
})();