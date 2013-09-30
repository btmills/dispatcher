(function (window) {

var Dispatcher = function () {

	var events = {};

	var filters = [];

	/*
	 * Publish event e, with optional extra data.
	 */
	var pub = function (e, data) {
		if (events[e]) {
			events[e].forEach(function (cb) {
				cb.call(null /* this value tbd */, data, e);
			});
		}
		filters.forEach(function (filter) {
			if (filter.test(e)) {
				filter.callback.call(null /* this value tbd */, data, e);
			}
		});
	};


	/*
	 * Subscribe to an event.
	 * e is either a string literal, a RegExp, or a function returning bool.
	 */
	var sub = function (e, cb) {
		if (typeof e === 'string') {
			if (!Array.isArray(events[e])) {
				events[e] = [cb];
			} else {
				events[e].push(cb);
			}
		} else if (typeof e === 'function' || e instanceof RegExp) {
			filters.push({
				test: e instanceof RegExp
				      ? function () { return e.test.apply(e, arguments); }
				      : e,
				callback: cb
			});
		}
	};

	// No unsub function because I don't anticipate needing it

	return {
		pub: pub,
		sub: sub
	};

};

window.Dispatcher = Dispatcher;

})(this);
