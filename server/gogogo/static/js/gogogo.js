/**
 * Author: Abhay Arora
 * https://github.com/dumbstark
 */

(function(_W, _D){



})(window, window.document);

_A = angular.module('gogogo', ['ngRoute']);

var viewBase = '/view/';

_A.config(function ($routeProvider, $locationProvider) {
    $routeProvider.when('/', {
        redirectTo: '/go'
    }).when('/go', {
        controller: 'goController',
        templateUrl: viewBase + 'go'
    }).otherwise({
        redirectTo: '/'
    });
});


_A.controller('goController', function($scope, $http, $q, $interval, $timeout){

    var map_style_definition = [{"featureType":"administrative","elementType":"geometry.stroke","stylers":[{"color":"#e4e1e1"}]},{"featureType":"administrative","elementType":"labels.text.fill","stylers":[{"color":"#3f3f3f"}]},{"featureType":"administrative.land_parcel","elementType":"geometry","stylers":[{"visibility":"on"},{"color":"#ffffff"}]},{"featureType":"administrative.land_parcel","elementType":"geometry.fill","stylers":[{"visibility":"on"},{"color":"#ff0000"}]},{"featureType":"landscape","elementType":"all","stylers":[{"color":"#f2f2f2"}]},{"featureType":"landscape","elementType":"geometry.fill","stylers":[{"hue":"#ff0000"}]},{"featureType":"landscape.man_made","elementType":"geometry.fill","stylers":[{"color":"#82fd88"}]},{"featureType":"landscape.natural","elementType":"geometry.fill","stylers":[{"color":"#46eba7"}]},{"featureType":"poi","elementType":"all","stylers":[{"visibility":"off"}]},{"featureType":"poi","elementType":"geometry.fill","stylers":[{"color":"#caffd2"},{"visibility":"on"}]},{"featureType":"poi","elementType":"geometry.stroke","stylers":[{"color":"#ffffff"},{"visibility":"on"}]},{"featureType":"road","elementType":"all","stylers":[{"saturation":-100},{"lightness":45}]},{"featureType":"road","elementType":"geometry.fill","stylers":[{"color":"#4da39a"}]},{"featureType":"road.highway","elementType":"all","stylers":[{"visibility":"simplified"}]},{"featureType":"road.highway","elementType":"labels.text","stylers":[{"color":"#ff0000"}]},{"featureType":"road.highway","elementType":"labels.text.fill","stylers":[{"visibility":"on"},{"color":"#ffffff"}]},{"featureType":"road.highway","elementType":"labels.text.stroke","stylers":[{"visibility":"off"}]},{"featureType":"road.arterial","elementType":"geometry.fill","stylers":[{"visibility":"on"}]},{"featureType":"road.arterial","elementType":"labels.text","stylers":[{"visibility":"on"}]},{"featureType":"road.arterial","elementType":"labels.text.fill","stylers":[{"visibility":"on"},{"color":"#ffffff"}]},{"featureType":"road.arterial","elementType":"labels.text.stroke","stylers":[{"visibility":"off"}]},{"featureType":"road.arterial","elementType":"labels.icon","stylers":[{"visibility":"off"}]},{"featureType":"road.local","elementType":"labels.text.fill","stylers":[{"color":"#ffffff"}]},{"featureType":"road.local","elementType":"labels.text.stroke","stylers":[{"visibility":"off"}]},{"featureType":"transit","elementType":"all","stylers":[{"visibility":"off"}]},{"featureType":"water","elementType":"all","stylers":[{"color":"#5abbec"},{"visibility":"on"}]},{"featureType":"water","elementType":"geometry.fill","stylers":[{"color":"#2594e4"},{"weight":"1"},{"visibility":"on"}]}];

    $scope.settings = {
	speed: 4.98897
    };
    $scope.transit = {
	distance: 0.0,
	in_transit: false,
	paused: false,
	ready: false
    };

    $scope.gps_update_interval = 1000;
    $scope.simulator_daemon = function(){
	if ( $scope.transit.current_point_index == $scope.transit.waypoints.length - 1 ){
	    $interval.cancel($scope.daemon_process);
	    $scope.transit.in_transit = false;
	    $scope.transit.paused = false;
	    $scope.updateCurrentLocation($scope.transit.destination);
	}
	$scope.updateCurrentLocation($scope.transit.waypoints[$scope.transit.current_point_index]);
	$scope.transit.current_point_index++;
    };
    
    var map_style = new google.maps.StyledMapType(map_style_definition, {name: 'Go Map Style'});

    var map;
    var device;
    var destination;
    var directions_display;
    var directionsService = new google.maps.DirectionsService();

    var map_initialized = $q.defer();
    
    function initMap() {
	directions_display = new google.maps.DirectionsRenderer({
	    polylineOptions: {
		strokeColor: '#FFFFFF'
	    },
	    suppressMarkers: true,
	    markerOptions: {
		visible: false
	    }
	});
      map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: -34.397, lng: 150.644},
        zoom: 16
      });
	map.mapTypes.set('styled_map', map_style);
        map.setMapTypeId('styled_map');
	device = new google.maps.Marker({
          map: map,
          animation: google.maps.Animation.DROP,
            position: {lat: -34.397, lng: 150.644},
	    icon: '/static/img/pokeball-marker.png'
        });
	destination = new google.maps.Marker({
          map: map,
          draggable: true,
          animation: google.maps.Animation.DROP,
            position: {lat: -34.397, lng: 150.644},
	    icon: '/static/img/pokeball-marker-trans65.png'
        });
	google.maps.event.addListener(destination, "dragend", function() {
	    var position = destination.getPosition();
	    if(device.getPosition() != destination.getPosition()){
		destination.setAnimation(google.maps.Animation.BOUNCE);
		var request = {
		    origin: device.getPosition(),
		    destination: destination.getPosition(),
		    travelMode: google.maps.TravelMode.WALKING
		}
		directionsService.route(request, function(response, status){
		    if ( status == 'OK' ){
			directions_display.setMap(map);
			directions_display.setDirections(response);
			_dist = 0;
			var steps = [];
			var legs = response.routes[0].legs;
			for ( var i = 0; i < legs.length; i ++ ){
			    _dist += legs[i].distance.value;
			    for ( j = 0; j < legs[i].steps.length; j ++ ){
				steps[steps.length] = legs[i].steps[j];
			    }
			}
			map_initialized.resolve({
			    dist: _dist,
			    steps: steps,
			    origin: device.getPosition(),
			    destination: destination.getPosition()
			});
		    } else {
			map_initialized.reject({});
			console.log('Could not fetch directions!');
		    }
		});
	    }
	});
	
    }


    var reset_map_initialized_event = function(){
	map_initialized = $q.defer();
	map_initialized.promise.then(function(resolve){
	    $scope.transit.ready = true;
	    $scope.transit.distance = resolve.dist/1000.0;
	    $scope.transit.steps = resolve.steps;
	    $scope.transit.origin = resolve.origin;
	    $scope.transit.destination = resolve.destination;
	    reset_map_initialized_event();
	}, function(reject){
	    destination.setPosition(device.getPosition());
	    destination.setAnimation(google.maps.Animation.DROP);
	});
    };
    
    reset_map_initialized_event();

    $scope.startTransit = function(){

	if (! $scope.transit.paused){
	    var waypoints = [];

       	    for ( var k = 0; k < $scope.transit.steps.length; k++ ){
		var start = $scope.transit.steps[k].start_point;
		var end = $scope.transit.steps[k].end_point;
		var distance = $scope.transit.steps[k].distance.value;
		var speed = $scope.settings.speed * 0.277778;
    		var time = distance / speed;
		
		
		// Digital Differential Analyzer
    		// Line drawing algorith.
		
    		var difLat = end.lat() - start.lat();
		var difLng = end.lng() - start.lng();
		var dist = Math.abs(time);
		
		var dx = difLat / dist;
		var dy = difLng / dist;
		
		for (var i = 0, x, y; i <= Math.ceil(dist); i++) {
                    x = start.lat() + dx * i;
                    y = start.lng() + dy * i;
        	    waypoints[waypoints.length] = new google.maps.LatLng(x, y);
		}
	    }
	    $scope.transit.waypoints = waypoints;
	    $scope.transit.current_point_index = 0;
	    $scope.transit.in_transit = true;
	    $scope.transit.paused = false;
	}
	$scope.daemon_process = $interval($scope.simulator_daemon, $scope.gps_update_interval);
	$scope.transit.paused = false;
	$scope.transit.in_transit = true;
    };

    $scope.pauseTransit = function(){
	$interval.cancel($scope.daemon_process);
	$scope.transit.in_transit = false;
	$scope.transit.paused = true;
    };

    $scope.stopTransit = function(){
	$interval.cancel($scope.daemon_process);
	var current_loc = $scope.transit.waypoints[$scope.transit.current_point_index];
	destination.setPosition(current_loc);
	device.setPosition(current_loc);
	destination.setAnimation(google.maps.Animation.DROP);
	directions_display.setMap(null);
	$scope.updateCurrentLocation(current_loc);
	$scope.transit.in_transit = false;
	$scope.transit.ready = false;
	$scope.transit.paused = false;
    };
    
    var setMapHeight = function(){
	var height = document.documentElement.clientHeight;
	$('#map').css({'height': height + 'px'});
    };
    window.addEventListener('resize', function(e){
	setMapHeight();
    });
    setMapHeight();    
    initMap();

    $scope.refreshCurrentLocation = function(){
	$http({
	    method: 'GET',
	    url: '/api/gps/location'
	}).then(function(response){
	    var position = new google.maps.LatLng(response.data.location.lat,
					      response.data.location.lng);
	    map.setCenter(position);
	    device.setPosition(position);
	    destination.setPosition(position);
	    destination.setAnimation(google.maps.Animation.DROP);
	}, function(response){
	    console.log('Could not update current location!');
	});
    };    
    $scope.refreshCurrentLocation();

    $scope.updateCurrentLocation = function(position){
	$http({
	    method: 'POST',
	    url: '/api/gps/update',
	    data: {
		lat: position.lat(),
		lng: position.lng()
	    }
	}).then(function(response){
	    device.setPosition(position);
	    if (position == destination.getPosition()){
		destination.setPosition(position);
		destination.setAnimation(google.maps.Animation.DROP);
		directions_display.setMap(null);
		$scope.transit.ready = false;
		$scope.transit.pasued = false;
	    }
	}, function(response){
	    console.log('Could not update location!');
	});
    };


    $scope.saveLocationTitle = 'Save Location';
    $scope.saveCurrentLocation = function(){
	sessionStorage.setItem('location', JSON.stringify(device.getPosition()));
	$scope.saveLocationTitle = 'Saved';
	$timeout(function(){
	    $scope.saveLocationTitle = 'Save Location';
	}, 3000);
    };

    $scope.loadLocationTitle = 'Load Saved Location';
    $scope.injectSavedLocation = function(){
	var location = JSON.parse(sessionStorage.getItem('location'));
	$scope.loadLocationTitle = 'Loading ...';
	destination.setPosition(new google.maps.LatLng(location.lat, location.lng));
	$scope.updateCurrentLocation(new google.maps.LatLng(location.lat, location.lng));
	$timeout(function(){
	    $scope.loadLocationTitle = 'Load Saved Location';
	}, 3000);
    };
    
});


_A.controller('navbarController', function($scope, $location){

    $scope.current_section = 'go';

    $scope.changeSection = function(section){
	$scope.current_section = section;
    };

});

