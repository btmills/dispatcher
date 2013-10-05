do (window = this) ->

	Dispatcher = () ->

		events = {}

		filters = []

		match = (pattern, candidate) ->
			# No pattern, automatic success
			return true unless typeof pattern == 'object'
			# No data, can't possibly match pattern
			return false unless typeof candidate == 'object'

			for key of pattern
				continue unless pattern.hasOwnProperty key
				return false unless candidate.hasOwnProperty key

				if ['string', 'number', 'boolean'].indexOf typeof pattern[key]  >= 0
					return false unless pattern[key] == candidate[key]
				else if pattern[key] instanceof RegExp and not pattern[key].test candidate[key]
					return false
				else if typeof pattern[key] == 'object' and
				        typeof candidate[key] == 'object' and
				        not match pattern[key], candidate[key]
					return false

			return true

		###
		Publish event e, with optional data
		###
		pub = (e, data) ->
			if events[e] then events[e].forEach (el) ->
				el.callback.call null, data, e if match el.pattern, data
			filters.forEach (el) ->
				el.callback.call null, data, e if el.test e and match el.pattern, data

		###
		Subscribe to an event
		e is either a string literal, or a RegExp.
		pattern is an object pattern.
		###
		sub = (e, pattern, cb) ->
			if arguments.length < 3
				cb = pattern
				pattern = undefined

			if typeof e == 'string'
				events[e] = [] unless Array.isArray events[e]
				events[e].push
					pattern: pattern
					callback: cb
			else if e instanceof RegExp
				filters.push
					test: -> e.test.apply e, arguments
					pattern: pattern
					callback: cb

		###
		No unsub function because I don't anticipate needing it.
		This has changed. I will add one. Eventually.
		###

		return {
			pub: pub
			sub: sub
		}

	window.Dispatcher = Dispatcher
