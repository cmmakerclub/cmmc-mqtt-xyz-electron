(function () {
  'use strict';
  var options = {
    host: 'iot.eclipse.org',
    port: 1883,
  };
  angular
	.module('CMMCDevices.controllers', [])
    .factory("myMqtt", function (mqttwsProvider) {
      var MQTT = mqttwsProvider(options);
      return MQTT;
    })
    .factory("mqttLWT", function (mqttwsProvider) {
      var MQTT = mqttwsProvider(options);
      return MQTT;
    })
    .factory("mqttXYZ", function (mqttwsProvider) {
      var MQTT = mqttwsProvider(options);
      return MQTT;
    })
    .filter('status', function() {
      return function(input, status) {

        if (status == "ALL") {
          return input;
        }

        var result = {};
        angular.forEach(input, function(value, key) {
          if (value.status == status) {
            result[key] = value;
          }
        });
        return result;
      };
    })
    .filter('name', function() {
      return function(input, name) {

        var result = {};
        angular.forEach(input, function(value, key) {
          if (value.d.myName.toLowerCase().indexOf(name.toLowerCase()) > -1) {
            result[key] = value;
          }
        });
        return result;
      };
    })
    .filter('isEmpty', function () {
      var bar;
      return function (obj) {
        for (bar in obj) {
          if (obj.hasOwnProperty(bar)) {
            return false;
          }
        }
        return true;
      };
    })
    .controller('AppCtrl', AppCtrl);

  /** @ngInject */
  function AppCtrl($scope, $timeout, myMqtt, mqttXYZ, mqttLWT, 
    $localStorage, $sessionStorage, $mdSidenav, $mdUtil, $mdDialog, $log) {
    var vm = this;
    vm.devices = {};
    vm.LWT = {};

    var buildToggler = function buildToggler(navID) {
      var debounceFn =  $mdUtil.debounce(function(){
            $mdSidenav(navID)
              .toggle()
              .then(function () {
                //console.log("toggle " + navID + " is done");
              });
          },200);
      return debounceFn;
    }

    // load config
    $scope.storage = $localStorage.$default({
      config: {
        host: 'cmmc.xyz',
        port: 1883,
        // username: "GaBH7sxFDUEX0hl",
        // clientId: "MpViO02hLwk8czi9",
        // password: "5dNmPIAVAvmDpK+Wd9/4m5nzbNw="
      }
    });

    $scope.toggleRight = buildToggler('right');

    $scope.config = {};
    $scope.config = $scope.storage.config;
    $scope.onlineStatus = "ALL";
    $scope.filterDevice = {};
    $scope.filterDevice.name = "";

    var onMsg = function (topic, payload) {
      try {
      var topics = topic.split("/");
      // console.log(topics)
      var max_depth = topics.length -1;

      var incomming_topic  = topics[max_depth];



      if (incomming_topic == "online") {
        console.log("online", topics); 
        var values = payload.split("|");

        var status = values[0];
        var id = values[1];
        var mac = values[1];
        $log.debug('id', id, "mac", mac, "status", status, new Date());

        if (mac && mac === status) {
          status = "online";
        }

        vm.LWT[mac || id] = status;
        // vm.devices[mac || id] .status = status;
        if (vm.devices[mac || id]) {
          vm.devices[mac || id].status = status;
          console.log(vm);
          $scope.$apply();
        }
      }
      else {
        var _payload = JSON.parse(payload);
        var _id2 = _payload.info && _payload.info.id;
        var _id = _payload.d && _payload.d.id;
        _payload.status = vm.LWT[_id || _id2] || "ONLINE" || "UNKNOWN";
        _payload.online = _payload.status !== "DEAD";
        vm.devices[_id || _id2] = _payload;
        delete vm.devices.undefined;
        $scope.$apply();
      }
    }
    catch (ex) {
      console.log("EXCEPTION!!!", ex);
      console.log("EXCEPTION!!!", ex);
      console.log("EXCEPTION!!!", ex);
    }
    };

    var addListener = function() {
      myMqtt.on("message", onMsg);
      mqttXYZ.on("message", onMsg);
    }
    
    $scope.showDetail = function(ev, deviceUUIDuuid) {
      $mdDialog.show({
        controller: DialogController,
        templateUrl: 'app/client/templates/Detail.html',
        parent: angular.element(document.body),
        targetEvent: ev,
        clickOutsideToClose:true,
        locals: {
           deviceUUID: deviceUUIDuuid,
           devices: $scope.allDevices
         },
      })
      .then(function(answer) {
        $scope.status = 'You said the information was "' + answer + '".';
      }, function() {
        $scope.status = 'You cancelled the dialog.';
      });
    };

    var remmoveDevices = function() {
      vm.devices = {};
    }

    $scope.allDevices = function () {
        return vm.devices;
    }

    //asynchronously
    $scope.connect = function () {

      addListener();
      vm.devices = {};

      // mqttLWT.connect($scope.config).then(mqttLWT.subscribe("/HelloChiangMaiMakerClub/gearname/#/status"));
      myMqtt.connect($scope.config)
       .then(
          myMqtt.subscribe("/NatWeerawan/gearname/#")
        );

      // myMqtt.connect($scope.config)));
      // myMqtt.connect($scope.config).then(myMqtt.subscribe("esp8266/+/status"));
      // mqttXYZ.connect($scope.config).then(mqttXYZ.subscribe("esp8266/+/status"));      
    }

    $scope.disconnect = function () {
      myMqtt.end(remmoveDevices);
    }

    function DialogController($scope, $mdDialog, deviceUUID, devices) {

      $scope.devices = devices;

      $scope.deviceUUID = deviceUUID;
      $scope.hide = function() {
        $mdDialog.hide();
      };
      $scope.cancel = function() {
        $mdDialog.cancel();
      };
      $scope.answer = function(answer) {
        $mdDialog.hide(answer);
      };
    }

    $scope.connect();

  }
})();