(function () {
	function LineInfoConstructor (start, count, color) {
		this.start = start;
		this.count = count;
		this.color = color;
	}
	LineInfoConstructor.prototype.addPoint = function () {
		this.count++;
	};
	var canvas = document.getElementById('canvas');
	var colorPicker = document.getElementById('colorPicker');
	var gl = WebGLUtils.setupWebGL(canvas);
	gl.viewport(0, 0, canvas.width, canvas.height);
	gl.viewport( 0, 0, canvas.width, canvas.height );
	gl.clearColor( 1.0, 1.0, 1.0, 1.0 );
	gl.enable(gl.DEPTH_TEST);
	var rotateAngels = [0, 0, 0];
	var axesX = 0;
	var axesY = 1;
	var axesZ = 2;
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
	 * @param program
	 * @param vector
	 * @param name
	 */
	function setFolatVec3Uniform (program, vector, name) {
		var uniformLocation = gl.getUniformLocation(program, name);
		gl.uniform3fv(uniformLocation, flatten(vector));
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
		gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
		for (i = 0, len = linesInfo.length; i < len; i++) {
			setFolatVec4Uniform(program, linesInfo[i].color, 'fLineColour');
			gl.drawArrays(gl.LINE_STRIP, linesInfo[i].start, linesInfo[i].count);
		}
	}
	/**
	 *
	 */
	function modelingSphere (xo, yo, zo, r, logCount, latCount, step) {
		var lat, long;
		logCount  = logCount || 360;
		latCount = latCount || 180;
		for (long = 0; long < logCount; long += step) {
			var lLineInfo = new LineInfoConstructor(points.length, 0 , vec4(Math.random(), 0,  1, 1));
			linesInfo.push(lLineInfo);
			for(lat = 0; lat < latCount; lat += step) {
				points.push(vec3(
					xo + r * Math.sin(radians(lat)) * Math.cos(radians(long)),
					zo + r * Math.cos(radians(lat)),
					yo + r * Math.sin(radians(lat)) * Math.sin(radians(long))

				));
				points.push(vec3(
					xo + r * Math.sin(radians(lat + step)) * Math.cos(radians(long)),
					zo + r * Math.cos(radians(lat + step)),
					yo + r * Math.sin(radians(lat + step)) * Math.sin(radians(long))

				));
				points.push(vec3(
					xo + r * Math.sin(radians(lat)) * Math.cos(radians(long + step)),
					zo + r * Math.cos(radians(lat)),
					yo + r * Math.sin(radians(lat)) * Math.sin(radians(long + step))

				));
				points.push(vec3(
					xo + r * Math.sin(radians(lat + step)) * Math.cos(radians(long + step)),
					zo + r * Math.cos(radians(lat + step)),
					yo + r * Math.sin(radians(lat + step)) * Math.sin(radians(long + step))

				));
				lLineInfo.addPoint();
				lLineInfo.addPoint();
				lLineInfo.addPoint();
				lLineInfo.addPoint();
			}
		}
	}
	modelingSphere(0, 0, 0, 1, 360, 160, 5);
	/**
	 *
	 */
	applyDataToShaderAttribute(program, 'vPosition', points, 3);
	setFolatVec3Uniform(program, rotateAngels, 'theta');
	/**
	 *
	 */
	draw();
	setInterval(function () {
		rotateAngels[axesY] += 0.1;
		rotateAngels[axesX] += 0.1;
		setFolatVec3Uniform(program, rotateAngels, 'theta');
		//modelingSphere(0, 0, 0, 1);
		//applyDataToShaderAttribute(program, 'vPosition', points, 3);
		draw();
	}, 1000/60);
})();