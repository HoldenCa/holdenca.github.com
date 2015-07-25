var ELEMENTS = {
	Curve: function curve () {
		var curves = {};
		var id = 0;
		/**
		 * @param {Object} curveInfo
		 */
		function addCurve(curveInfo) {
			curves[id] = curveInfo;
			if (curveInfo)
				return id++;
		}
		/**
		 *
		 */
		function getCurveById (id) {
			return curves[id];
		}
		/**
		 *
		 */
		function removeCurveById () {
			return delete(curves[id]);
		}
		/**
		 *
		 */
		return {
			addCurve: addCurve,
			getCurveById: getCurveById,
			removeCurveById: removeCurveById
		}
	}
}