(function () {
	var vertices = [
		vec3(0, 0.5, 0),
		vec3(-0.5, -0.5, 0.5),
		vec3(0.5, -0.5, 0.5),
		vec4(0, 0, -0.5)
	];
	var indexes = [
		1,2,3,0,1,2
	];
	var canvas = document.getElementById('canvas');
	var gl = WebGLUtils.setupWebGL(canvas);
	var program = initShaders(gl, 'vertex', 'fragment');

	gl.useProgram(program);
	gl.viewport(0, 0, canvas.width, canvas.height);
	gl.enable(gl.DEPTH_TEST);
	gl.clearColor(1, 1, 1, 1);

	function render () {

	}


})();