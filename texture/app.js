var canvas = document.getElementById('canvas');
var gl = WebGLUtils.setupWebGL(canvas);
var program = initShaders(gl, 'vertexShader', 'fragmentShader');
var POINTS = [];
var NORMALS = POINTS;
var angleY = 0;
var TEXTURES = [];
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
	for (long = 0; long < logCount; long += step) {
		for(lat = 0; lat < latCount; lat += step) {
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
})(0, 0, 0, 0.6, 360, 180, 5);
/**
 * init textures
 * @type {Image}
 */
var texture1;
var image1 = new Image();
image1.src = 'texture1.jpg';
image1.onload =function () {
	texture1 = gl.createTexture();
	gl.bindTexture( gl.TEXTURE_2D, texture1 );
	gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image1);
	//gl.generateMipmap( gl.TEXTURE_2D );
	gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR );
	gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

	gl.activeTexture( gl.TEXTURE0 );
	gl.bindTexture( gl.TEXTURE_2D, texture1 );
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
/**
 * draw
 */
function draw () {
	angleY -= 0.2;
	gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	console.info(angleY);
	gl.uniform1f(gl.getUniformLocation(program,'vRotateY'), angleY);
	gl.drawArrays(gl.TRIANGLE_STRIP, 0, POINTS.length);
}
/**
 * animation loop
 */
function animLoop () {
	draw();
	window.requestAnimFrame(animLoop, canvas);
}