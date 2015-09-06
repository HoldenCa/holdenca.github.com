var canvas = document.getElementById('canvas');
var gl = WebGLUtils.setupWebGL(canvas);
var program = initShaders(gl, 'vertexShader', 'fragmentShader');
var POINTS = [];
var NORMALS = POINTS;
var angleY = 0;
var TEXTURES = [];
var angels = [0.0, 0.0, 0.0];
var acceleration = [0.0, -2.0, 0.0];
var resistance = [0.01, 0.008, 0.01];
gl.useProgram(program);
gl.viewport(0, 0, canvas.width, canvas.height);
gl.clearColor( 0.0, 0.0,0.0, 1.0 );
gl.enable(gl.DEPTH_TEST);
/**
 * method that bind data to buffer
 */
function assignDataToBuffer (bufferId, data) {
	gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
	gl.bufferData(gl.ARRAY_BUFFER, flatten(data), gl.STATIC_DRAW);
}
/**
 * create and link buffer with shader's attribute
 * @param {object} program - webgl program
 * @param {string} attrName - name of attribute
 * @param {number} dim - what is dimantion  of data
 */
function createLinkedBuffer (program, attrName, dim) {
	var buffer = gl.createBuffer();
	assignDataToBuffer(buffer, []);
	var attributeLocation = gl.getAttribLocation(program, attrName);
	gl.vertexAttribPointer(attributeLocation, dim, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(attributeLocation);
	return buffer;
}
/**
 *
 * @param xo
 * @param zo
 * @param yo
 * @param r
 * @param logCount
 * @param latCount
 * @param step
 * @return {*}
 */
(function modelingSphere (xo, zo, yo, r, logCount, latCount, step) {
	var lat, long;
	logCount  = logCount || 360;
	latCount = latCount || 180;
	for (long = 0; long <= logCount; long += step) {
		for(lat = 0; lat <= latCount; lat += step) {
			TEXTURES.push(vec2(long / logCount, lat / latCount));
			POINTS.push(vec3(
				xo + r * Math.sin(radians(lat)) * Math.cos(radians(long)),
				zo + r * Math.cos(radians(lat)),
				yo + r * Math.sin(radians(lat)) * Math.sin(radians(long))
			));
			TEXTURES.push(vec2(long / logCount, (lat + step) / latCount));
			POINTS.push(vec3(
				xo + r * Math.sin(radians(lat + step)) * Math.cos(radians(long)),
				zo + r * Math.cos(radians(lat + step)),
				yo + r * Math.sin(radians(lat + step)) * Math.sin(radians(long))

			));
			TEXTURES.push(vec2((long + step) / logCount, lat / latCount));
			POINTS.push(vec3(
				xo + r * Math.sin(radians(lat)) * Math.cos(radians(long + step)),
				zo + r * Math.cos(radians(lat)),
				yo + r * Math.sin(radians(lat)) * Math.sin(radians(long + step))

			));
			TEXTURES.push(vec2((long + step) / logCount, (lat + step) / latCount));
			POINTS.push(vec3(
				xo + r * Math.sin(radians(lat + step)) * Math.cos(radians(long + step)),
				zo + r * Math.cos(radians(lat + step)),
				yo + r * Math.sin(radians(lat + step)) * Math.sin(radians(long + step))
			));

		}
	}
})(0, 0, 0, 0.6, 360, 180, 1);
/**
 *
 * @param texture
 * @param image
 */
function setupTexture (texture, image, filter) {
	gl.bindTexture( gl.TEXTURE_2D, texture );
	gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
	gl.generateMipmap( gl.TEXTURE_2D );
	gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl[filter]);
	gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl[filter]);
}
/**
 * init textures
 * @type {Image}
 */
var texture1;
var image1 = new Image();
image1.src = 'texture1.jpg';
image1.onload =function () {
	texture1 = gl.createTexture();
	setupTexture(texture1, image1, 'LINEAR');
	gl.activeTexture( gl.TEXTURE0 );
	gl.bindTexture( gl.TEXTURE_2D, texture1);
	gl.uniform1i(gl.getUniformLocation( program, "Tex0"), 0);
	animLoop();
};
/**
 * initialize buffer
 */
var vPosition = createLinkedBuffer(program, 'vPosition', 3);
var vNormal = createLinkedBuffer(program, 'vNormal', 3);
var fTexturesInfo = createLinkedBuffer(program, 'fTexturesInfo', 2);
assignDataToBuffer(vPosition, POINTS);
assignDataToBuffer(vNormal, NORMALS);
assignDataToBuffer(fTexturesInfo, TEXTURES);
gl.uniform1f(gl.getUniformLocation(program, 'vRotateY'), angleY);
gl.uniform3fv(gl.getUniformLocation(program, 'vAngels'), angels);
/**
 * draw
 */
function draw () {
	angleY -= 0.2;
	angels[0] += acceleration[0];
	angels[1] += acceleration[1];
	angels[2] += acceleration[2];
	countAngels();
	gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	gl.uniform1f(gl.getUniformLocation(program,'vRotateY'), angleY);
	gl.uniform3fv(gl.getUniformLocation(program, 'vAngels'), angels);
	gl.drawArrays(gl.TRIANGLE_STRIP, 0, POINTS.length);
}
function countAngels () {
	var len = 3, i, abs, multiplier;
	for (i = 0; i < len; i ++) {
		abs = Math.abs(acceleration[i]);
		multiplier = acceleration[i] < 0 ? -1 : 1;
		abs -= resistance[i];
		if (abs < 0) {
			abs = 0;
		} else {
			acceleration[i] = multiplier * abs;
		}
	}
}
/**
 * animation loop
 */
function animLoop () {
	draw();
	window.requestAnimFrame(animLoop, canvas);
}
var useTouch;
var listeners = {
	click: 'click',
	mouseDown: 'mousedown',
	mouseMove: 'mousemove',
	mouseUp: 'mouseup'
};
if (!document.body.onclick) {
	useTouch = true
	listeners = {
		click: 'touchstart',
		mouseDown: 'touchstart',
		mouseMove: 'touchmove',
		mouseUp: 'touchend'
	}
}
var menu = document.getElementById('menu');
var radioButtons = document.getElementsByClassName('texture-filter');
canvas.addEventListener(listeners.mouseDown, function (event) {
	if (useTouch) {
		event.pageX = event.touches[0].pageX;
		event.pageY = event.touches[0].pageY;
	}
	event.preventDefault();
	event.stopPropagation();
	var prevX = event.pageX,
		prevY = event.pageY;
	var sensitivity = 180 / canvas.width;
	acceleration = [0, 0, 0];
	var onMouseUp = function () {
		event.preventDefault();
		event.stopPropagation();
		if (useTouch) {
			event.pageX = event.touches[0].pageX;
			event.pageY = event.touches[0].pageY;
		}
		var dX = prevX - event.pageX;
		var dY = prevY - event.pageY;
		if (Math.abs(dX) > 200) {
			acceleration[1] = dX / 200;
		}
		if (Math.abs(dY) > 200) {
			acceleration[0] = -(dY / 200);
		}
		window.removeEventListener(listeners.mouseUp, onMouseUp);
		window.removeEventListener(listeners.mouseMove, onMove);
	};
	var onMove = function (event) {
		event.preventDefault();
		event.stopPropagation();
		if (useTouch) {
			event.pageX = event.touches[0].pageX;
			event.pageY = event.touches[0].pageY;
		}
		var dX = prevX - event.pageX;
		var dY = prevY - event.pageY;
		angels[1] -= dX * sensitivity;
		angels[0] += dY * sensitivity;
		prevX = event.pageX;
		prevY = event.pageY;
	};
	window.addEventListener(listeners.mouseMove, onMove);
	window.addEventListener(listeners.mouseUp, onMouseUp);
});
menu.addEventListener(listeners.click, function () {
	var i, len;
	for (i = 0, len = radioButtons.length; i < len; i++) {
		if (radioButtons[i].checked === true) {
			setupTexture(texture1, image1, radioButtons[i].value);
			break;
		}
	}
});