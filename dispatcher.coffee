'use strict'

factory = -> return class Dispatcher
	topics = {}
	filters = []

	match = (pattern, candidate) ->
		# No pattern, automatic success
		return true unless typeof pattern == 'object'
		# No data, can't possibly match pattern
		return false unless typeof candidate == 'object'

		for key of pattern
			continue unless pattern.hasOwnProperty key
			return false unless candidate.hasOwnProperty key

			if ['string', 'number', 'boolean'].indexOf typeof pattern[key] >= 0
				return false unless pattern[key] == candidate[key]
			else if pattern[key] instanceof RegExp and
			        not pattern[key].test candidate[key]
				return false
			else if typeof pattern[key] == 'object' and
			        typeof candidate[key] == 'object' and
			        not match pattern[key], candidate[key]
				return false

		return true

	###
	Publish to a topic
	pub(topic[, data])
	topic: (String) Topic to which to publish
	data: (Object, optional) Data to attach to the event
	###
	pub: (topic, data) ->
		if topics[topic] then topics[topic].forEach (subscription) ->
			return unless match subscription.pattern, data
			subscription.callback.call subscription.context, data, topic
		filters.forEach (subscription) ->
			return unless subscription.test topic and
			              match subscription.pattern, data
			subscription.callback.call subscription.context, data, topic

	###
	Subscribe to a topic
	sub(topic[, pattern[, context]], callback)
	topic: (String|RegExp) Topic to which to subscribe
	pattern: (Object, optional) Filter event data to match pattern
	context: (Object, optional) Context to be supplied to this of callback
	callback: (Function) Callback function
	###
	sub: (topic, pattern, context, callback) ->
		switch arguments.length
			when 0 or 1 or 2
				return false
			when 2
				callback = pattern
				pattern = undefined
			when 3
				callback = context
				context = undefined

		if typeof topic == 'string'
			topics[topic] = [] unless Array.isArray topics[topic]
			topics[topic].push
				pattern: pattern
				context: context
				callback: callback
		else if topic instanceof RegExp
			filters.push
				test: -> topic.test.apply topic, arguments
				pattern: pattern
				context: context
				callback: callback

	###
	No unsub function because I don't anticipate needing it.
	This has changed. I will add one. Eventually.
	###

###
Universal Module Definition
https://github.com/umdjs/umd/blob/master/returnExports.js
###
do (root = this, factory) ->
	if typeof define == 'function' && define.amd
		define factory
	else if typeof exports == 'object'
		module.exports = factory()
	else
		root.Dispatcher = factory()
