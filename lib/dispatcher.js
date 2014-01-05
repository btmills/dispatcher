// Generated by CoffeeScript 1.6.3
(function() {
  'use strict';
  var factory;

  factory = function() {
    var Dispatcher;
    return Dispatcher = (function() {
      var filters, match, topics;

      function Dispatcher() {}

      topics = {};

      filters = [];

      match = function(pattern, candidate) {
        var key;
        if (typeof pattern !== 'object') {
          return true;
        }
        if (typeof candidate !== 'object') {
          return false;
        }
        for (key in pattern) {
          if (!pattern.hasOwnProperty(key)) {
            continue;
          }
          if (!candidate.hasOwnProperty(key)) {
            return false;
          }
          if (['string', 'number', 'boolean'].indexOf(typeof pattern[key] >= 0)) {
            if (pattern[key] !== candidate[key]) {
              return false;
            }
          } else if (pattern[key] instanceof RegExp && !pattern[key].test(candidate[key])) {
            return false;
          } else if (typeof pattern[key] === 'object' && typeof candidate[key] === 'object' && !match(pattern[key], candidate[key])) {
            return false;
          }
        }
        return true;
      };

      /*
      	Publish to a topic
      	pub(topic[, data])
      	topic: (String) Topic to which to publish
      	data: (Object, optional) Data to attach to the event
      */


      Dispatcher.prototype.pub = function(topic, data) {
        if (topics[topic]) {
          topics[topic].forEach(function(subscription) {
            if (!match(subscription.pattern, data)) {
              return;
            }
            return subscription.callback.call(subscription.context, data, topic);
          });
        }
        return filters.forEach(function(subscription) {
          if (!subscription.test(topic && match(subscription.pattern, data))) {
            return;
          }
          return subscription.callback.call(subscription.context, data, topic);
        });
      };

      /*
      	Subscribe to a topic
      	sub(topic[, pattern[, context]], callback)
      	topic: (String|RegExp) Topic to which to subscribe
      	pattern: (Object, optional) Filter event data to match pattern
      	context: (Object, optional) Context to be supplied to this of callback
      	callback: (Function) Callback function
      */


      Dispatcher.prototype.sub = function(topic, pattern, context, callback) {
        switch (arguments.length) {
          case 0 || 1:
            return false;
          case 2:
            callback = pattern;
            pattern = void 0;
            break;
          case 3:
            callback = context;
            context = void 0;
        }
        if (typeof topic === 'string') {
          if (!Array.isArray(topics[topic])) {
            topics[topic] = [];
          }
          return topics[topic].push({
            pattern: pattern,
            context: context,
            callback: callback
          });
        } else if (topic instanceof RegExp) {
          return filters.push({
            test: function() {
              return topic.test.apply(topic, arguments);
            },
            pattern: pattern,
            context: context,
            callback: callback
          });
        }
      };

      /*
      	No unsub function because I don't anticipate needing it.
      	This has changed. I will add one. Eventually.
      */


      return Dispatcher;

    })();
  };

  /*
  Universal Module Definition
  https://github.com/umdjs/umd/blob/master/returnExports.js
  */


  (function(root, factory) {
    if (typeof define === 'function' && define.amd) {
      return define(factory);
    } else if (typeof exports === 'object') {
      return module.exports = factory();
    } else {
      return root.Dispatcher = factory();
    }
  })(this, factory);

}).call(this);