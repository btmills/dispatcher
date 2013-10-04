(function (window) {

var Dispatcher = function () {

	var events = {};

	var filters = [];

	function match (pattern, candidate) {
		if (typeof pattern !== 'object') // No pattern, automatic match
			return true;
		if (typeof candidate !== 'object') // No data, can't match pattern
			return false;
		for (var key in pattern) {
			if (!pattern.hasOwnProperty(key)) continue;
			if (!candidate.hasOwnProperty(key)) return false;
			if (['string', 'number', 'boolean'].indexOf(typeof pattern[key]) >= 0) {
				if (pattern[key] !== candidate[key]) return false;
			} else if (pattern[key] instanceof RegExp
			           && !pattern[key].test(candidate[key])) {
				return false;
			} else if (typeof pattern[key] === 'object'
			           && typeof candidate[key] === 'object'
			           && !match(pattern[key], candidate[key])) {
				return false;
			}
		}
		return true;
	}

	/*
	 * Publish event e, with optional extra data.
	 */
	var pub = function (e, data) {
		if (events[e]) {
			events[e].forEach(function (el) {
				if (match(el.pattern, data))
					el.callback.call(null /* this value tbd */, data, e);
			});
		}
		filters.forEach(function (el) {
			if (el.test(e) && match(el.pattern, data))
				el.callback.call(null /* this value tbd */, data, e);
		});
	};


	/*
	 * Subscribe to an event.
	 * e is either a string literal, or a RegExp.
	 * pattern is an object pattern.
	 */
	var sub = function (e, pattern, cb) {
		if (arguments.length < 3) {
			cb = pattern;
			pattern = undefined;
		}

		if (typeof e === 'string') {
			if (!Array.isArray(events[e]))
				events[e] = [];
			events[e].push({
				pattern: pattern,
				callback: cb
			});
		} else if (e instanceof RegExp) {
			filters.push({
				test: function () { return e.test.apply(e, arguments); },
				pattern: pattern,
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
