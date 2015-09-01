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
        // console.log("mqttwsProvider")
        // Method for instantiating
        this.$get = function ($q, $window) {
            // console.log("$get");

            return function socketFactory(options) {
                var host;
                var port;
                var useTLS = false;
                var username = null;
                var password = null;
                var cleansession = true;
                var mqtt;
                var reconnectTimeout = 2000;
                var events = {};

                var wrappedSocket = {
                    on: function (event, func) {
                        events[event] = func;
                    },
                    addListener: function () { },
                    subscribe: function (topic, opts) {
                        opts = opts || { qos: 0 };
                        return function _subscribe() {
                            var defer = $q.defer();
                            var subscribed = function () {
                                defer.resolve(mqtt);
                            };

                            opts.onSuccess = subscribed;
                            mqtt.subscribe(topic, opts);
                            return defer.promise;
                        };
                    },
                    connect: function () {
                        var defer = $q.defer();

                        var onSuccess = function () {
                            var ev = events.connected || function () { };
                            ev.call(null, arguments);
                            defer.resolve(arguments);
                        };

                        var onFailure = function (message) {
                            $window.setTimeout(wrappedSocket.connect, reconnectTimeout);
                        };

                        var options = {
                            timeout: 3,
                            useSSL: useTLS,
                            cleanSession: cleansession,
                            onSuccess: onSuccess,
                            onFailure: onFailure
                        };

                        if (username !== null) {
                            options.userName = username;
                            options.password = password;
                        }

                        mqtt.connect(options);

                        mqtt.onMessageArrived = function (message) {
                            var topic = message.destinationName;
                            var payload = message.payloadString;
                            var ev = events.message || function () { };
                            ev.apply(null, [topic, payload, message]);

                            var ev2 = events[topic.toString()] || function () { };
                            // console.log("EV", ev);
                            // console.log("EV2", ev2);
                            ev2.apply(null, [payload, message]);
                        };

                        return defer.promise;
                    }
                };

                options = options || {};

                host = options.host;
                port = options.port;

                mqtt = new Paho.MQTT.Client(host, port, "web_" + parseInt(Math.random() * 100, 10));

                // var callback = options.callback;


                return wrappedSocket;
            };
        };


    });
