'use strict';

/**
 * @ngdoc service
 * @name myNewProjectApp.mqttwsProvider
 * @description
 * # mqttwsProvider
 * Provider in the myNewProjectApp.
 */
angular.module('CMMCDevices.providers', [])
    .provider('mqttwsProvider', function () {
        // Method for instantiating
        this.$get = function ($q, $window) {

            return function socketFactory(options) {
                var host;
                var port;
                var useTLS = false;
                var username = null;
                var password = null;
                var cleansession = true;
                var mqtt;
                var _mqtt = require("mqtt")
                var reconnectTimeout = 2000;
                var events = {};

                var _options = { };
                var wrappedSocket = {
                    on: function (event, func) {
                        events[event] = func;
                    },
                    end: function(callback) {
                        mqtt.on('close', function() {
                            if (callback) {
                                callback();
                            }
                        });
                        mqtt.end();
                    },
                    addListener: function () { },
                    subscribe: function (topic, opts) {
                        opts = opts || { qos: 0 };
                        return function _subscribe() {
                            var defer = $q.defer();
                            var subscribed = function () {
                                defer.resolve(mqtt);
                            };

                            console.log("connected")
                            opts.onSuccess = subscribed;
                            mqtt.subscribe(topic, opts);
                            return defer.promise;
                        };
                    },
                    connect: function (config) {
                        console.log ("connecting..");

                        config = config || {};

                        if (config.username == "") {

                            delete (config.username);
                            delete (config.password);

                        }

                        var defer = $q.defer();
 
                        var onSuccess = function () {
                            var ev = events.connected || function () { };
                            ev.call(null, arguments);
                            defer.resolve(arguments);
                        };

                        var onFailure = function (message) {
                            $window.setTimeout(wrappedSocket.connect, reconnectTimeout);
                        };

                        _options = angular.extend({ }, options);
                        _options = angular.extend(_options, config);
                        _options.clientId = "";
                        _options.host = 'cmmc.xyz';
                        _options.port = 1883;
                        _options.username = "";
                        _options.clientId = "";
                        _options.password = "";
                        console.log (_options);
                        mqtt = _mqtt.connect('mqtt://'+ _options.host, _options);
                        mqtt.on('connect', onSuccess);

                        mqtt.on('error', function(error) {
                            console.log('error')
                            console.log(error)
                            onFailure(error);
                        });

                        mqtt.on('message', function (topic, message) {
                            var topic = topic.toString();
                            var payload = message.toString();
                            var ev = events.message || function () { };
                            var ev2 = events[topic.toString()] || function () { };                            
                            ev.apply(null, [topic, payload, message]);
                            ev2.apply(null, [payload, message]);
                        });

                        return defer.promise;
                    }
                };

                options = options || {};


                // mqtt = new Paho.MQTT.Client(host, port, "web_" + parseInt(Math.random() * 100, 10));
                // mqtt.conn

                // var callback = options.callback;



                return wrappedSocket;
            };
        };


    });
