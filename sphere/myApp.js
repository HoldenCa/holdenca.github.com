(function () {
	function LineInfoConstructor (start, color) {
		this.start = start;
		this.count = 0;
		this.color = color;
	}
	LineInfoConstructor.prototype.addPoint = function (point) {
		points.push(point);
		this.count++;
	};
	var show = 'all';
	/**
	 *
	 */
	var figures = {
		currentFigure: null,
		currentElement: null,
		figures: [],
		createFigure: function (type, arg) {
			this.endFigure();
			this.currentFigure = {
				drawingMode: 'LINE_STRIP',
				type: type,
				elements: [],
				translate: [0, 0, 0],
				rotate: [0, 0, 0],
				scale: [1, 1, 1],
				arguments: arg,
				perspective: Number
			}
		},
		createElement: function (color) {
			this.currentElement = new LineInfoConstructor(points.length, color);
			this.currentFigure.elements.push(this.currentElement);
		},
		addPoint: function (point) {
			this.currentElement.addPoint(point);
		},
		endFigure: function () {
			if (this.currentFigure !== null) {
				this.figures.push(this.currentFigure);
				this.currentFigure = null;
				return this.figures.length - 1;
			}
		}
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
	function drawFigures () {
		gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
		if (show === 'all' || true) {
			figures.figures.forEach(function (elementsInfo) {
				setFolatVec3Uniform(program, elementsInfo.translate, 'translation');
				setFolatVec3Uniform(program, elementsInfo.rotate, 'theta');
				setFolatVec3Uniform(program, elementsInfo.scale, 'scaling');
				elementsInfo.elements.forEach(function (element) {
					setFolatVec4Uniform(program, element.color, 'fLineColour');
					gl.drawArrays(gl[elementsInfo.drawingMode], element.start, element.count);
				})
			});
		} else {
			setFolatVec3Uniform(program, figures.figures[show].translate, 'translation');
			figures.figures[show].elements.forEach(function (element) {
				setFolatVec4Uniform(program, element.color, 'fLineColour');
				gl.drawArrays(gl[figures.figures[show].drawingMode], element.start, element.count);
			});
		}

	}
	function modelingConec (xo, yo, zo, r, topr, h, step) {
		var i, len, lLineInfo;
		//generateBase
		figures.createFigure(topr === 0 ? 'cone' : 'cylinder', arguments);
		figures.createElement(vec4(Math.random(), 0,  1, 1));
		for (i = 0, len = 360; i <= len; i += step) {
			figures.addPoint(vec3(
				xo + r * Math.cos(radians(i)),
				yo,
				zo + r * Math.sin(radians(i))
			));
			figures.addPoint(vec3(
				xo + r * Math.cos(radians(i + step)),
				yo,
				zo + r * Math.sin(radians(i + step))
			));
			figures.addPoint(vec3(xo, yo, zo));
		}
		//top base
		figures.createElement(vec4(Math.random(), 0,  1, 1));
		for (i = 0, len = 360; i <= len; i += step) {
			figures.addPoint(vec3(
				xo + topr * Math.cos(radians(i)),
				yo + h,
				zo + topr * Math.sin(radians(i))
			));
			figures.addPoint(vec3(
				xo + topr * Math.cos(radians(i + step)),
				yo + h,
				zo + topr * Math.sin(radians(i + step))
			));
			figures.addPoint(vec3(xo, yo + h, zo));

		}
		//generateSides
		figures.createElement(vec4(Math.random(), 0,  1, 1));
		for (i = 0, len = 360; i <= len; i += step) {
			figures.addPoint(vec3(
				xo + r * Math.cos(radians(i)),
				yo,
				zo + r * Math.sin(radians(i))
			));
			figures.addPoint(vec3(
				xo + r * Math.cos(radians(i + step)),
				yo,
				zo + r * Math.sin(radians(i + step))
			));
			figures.addPoint(vec3(
				xo + topr * Math.cos(radians(i)),
				yo + h,
				zo + topr * Math.sin(radians(i))
			));
			figures.addPoint(vec3(
				xo + topr * Math.cos(radians(i + step)),
				yo + h,
				zo + topr * Math.sin(radians(i + step))
			));
		}
		return figures.endFigure();
	}
	/**
	 *
	 */
	function modelingSphere (xo, zo, yo, r, logCount, latCount, step) {
		var lat, long;
		logCount  = logCount || 360;
		latCount = latCount || 180;
		figures.createFigure('sphere', arguments);
		for (long = 0; long < logCount; long += step) {
			figures.createElement(vec4(Math.random(), 0,  1, 1));
			for(lat = 0; lat < latCount; lat += step) {
				figures.addPoint(vec3(
					xo + r * Math.sin(radians(lat)) * Math.cos(radians(long)),
					zo + r * Math.cos(radians(lat)),
					yo + r * Math.sin(radians(lat)) * Math.sin(radians(long))

				));
				figures.addPoint(vec3(
					xo + r * Math.sin(radians(lat + step)) * Math.cos(radians(long)),
					zo + r * Math.cos(radians(lat + step)),
					yo + r * Math.sin(radians(lat + step)) * Math.sin(radians(long))

				));
				figures.addPoint(vec3(
					xo + r * Math.sin(radians(lat)) * Math.cos(radians(long + step)),
					zo + r * Math.cos(radians(lat)),
					yo + r * Math.sin(radians(lat)) * Math.sin(radians(long + step))

				));
				figures.addPoint(vec3(
					xo + r * Math.sin(radians(lat + step)) * Math.cos(radians(long + step)),
					zo + r * Math.cos(radians(lat + step)),
					yo + r * Math.sin(radians(lat + step)) * Math.sin(radians(long + step))

				));
			}
		}
		return figures.endFigure();
	}
	/**
	 *
	 */
	var bufferId = applyDataToShaderAttribute(program, 'vPosition', points, 3).bufferId;
	setFolatVec3Uniform(program, rotateAngels, 'theta');
	/**
	 *
	 */
	(function animloop(){
		rotateAngels[axesY] += 1;
		//setFolatVec3Uniform(program, rotateAngels, 'theta');
		drawFigures();
		requestAnimFrame(animloop, canvas);
	})();
	/**
	 * interaction part
	 */
	var updateAvailableFigures = function () {
		var optionTemplate = '<option value="index">index - type</option>';
		var buffer = '';
		var selectionHtml = '';
		buffer = optionTemplate.replace(/index/g, 'all');
		buffer = buffer.replace(/type/g, 'none');
		selectionHtml+= buffer;
		figures.figures.forEach(function (figure, index) {
			buffer = optionTemplate.replace(/index/g, index);
			buffer = buffer.replace(/type/g,' - ' + figure.type);
			selectionHtml+= buffer;
		});
		console.info(selectionHtml);
		showFigure.innerHTML = selectionHtml;
		show = 'all';
	};
	var addButton = document.getElementById('addButton');
	var showFigure = document.getElementById('showFigure');
	var drawingMode = document.getElementById('drawingMode');
	var translateX = document.getElementById('trx');
	var translateY = document.getElementById('try');
	var translateZ = document.getElementById('trz');
	var rotateX = document.getElementById('rx');
	var rotateY = document.getElementById('ry');
	var rotateZ = document.getElementById('rz');
	var scaleX = document.getElementById('sx');
	var scaleY = document.getElementById('sy');
	var scaleZ = document.getElementById('sz');
	var approximationStep = document.getElementById('approximationStep');
	var figureType = document.getElementById('figureType');
	showFigure.addEventListener('change', function () {
		show = showFigure.value;
	});
	addButton.addEventListener('click', function () {
		switch(figureType.value) {
			case 'sphere':
				modelingSphere(0, 0, 0, 0.5, 360, 180, 5);
				break;
			case 'cylinder':
				modelingConec(0, -0.5, 0, 0.5, 0.5, 1, 5);
				break;
			case 'cone':
				modelingConec(0, -0.5, 0, 0.5, 0, 1, 5);
				break;
		}
		bidDataWithBuffer(bufferId, points);
		updateAvailableFigures();
	});
	drawingMode.addEventListener('change', function () {
		if (show !== 'all') {
			console.info(drawingMode.value);
			figures.figures[show].drawingMode = drawingMode.value;
		}
	});
	translateX.addEventListener('change', function () {
		if (show !== 'all') {
			figures.figures[show].translate[0] = translateX.value;
		}
	});
	translateY.addEventListener('change', function () {
		if (show !== 'all') {
			figures.figures[show].translate[1] = translateY.value;
		}
	});
	translateZ.addEventListener('change', function () {
		if (show !== 'all') {
			figures.figures[show].translate[2] = translateZ.value;
		}
	});

	rotateX.addEventListener('change', function () {
		if (show !== 'all') {
			figures.figures[show].rotate[0] = rotateX.value;
		}
	});
	rotateY.addEventListener('change', function () {
		if (show !== 'all') {
			figures.figures[show].rotate[1] = rotateY.value;
		}
	});
	rotateZ.addEventListener('change', function () {
		if (show !== 'all') {
			figures.figures[show].rotate[2] = rotateZ.value;
		}
	});



	scaleX.addEventListener('change', function () {
		if (show !== 'all') {
			figures.figures[show].scale[0] = scaleX.value;
		}
	});
	scaleY.addEventListener('change', function () {
		if (show !== 'all') {
			figures.figures[show].scale[1] = scaleY.value;
		}
	});
	scaleZ.addEventListener('change', function () {
		if (show !== 'all') {
			figures.figures[show].scale[2] = scaleZ.value;
		}
	});
})();