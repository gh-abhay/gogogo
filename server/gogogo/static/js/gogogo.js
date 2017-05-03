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


_A.controller('goController', function($scope, $http){

    var map_style_definition = [{"featureType":"administrative","elementType":"geometry.stroke","stylers":[{"color":"#e4e1e1"}]},{"featureType":"administrative","elementType":"labels.text.fill","stylers":[{"color":"#3f3f3f"}]},{"featureType":"administrative.land_parcel","elementType":"geometry","stylers":[{"visibility":"on"},{"color":"#ffffff"}]},{"featureType":"administrative.land_parcel","elementType":"geometry.fill","stylers":[{"visibility":"on"},{"color":"#ff0000"}]},{"featureType":"landscape","elementType":"all","stylers":[{"color":"#f2f2f2"}]},{"featureType":"landscape","elementType":"geometry.fill","stylers":[{"hue":"#ff0000"}]},{"featureType":"landscape.man_made","elementType":"geometry.fill","stylers":[{"color":"#82fd88"}]},{"featureType":"landscape.natural","elementType":"geometry.fill","stylers":[{"color":"#46eba7"}]},{"featureType":"poi","elementType":"all","stylers":[{"visibility":"off"}]},{"featureType":"poi","elementType":"geometry.fill","stylers":[{"color":"#caffd2"},{"visibility":"on"}]},{"featureType":"poi","elementType":"geometry.stroke","stylers":[{"color":"#ffffff"},{"visibility":"on"}]},{"featureType":"road","elementType":"all","stylers":[{"saturation":-100},{"lightness":45}]},{"featureType":"road","elementType":"geometry.fill","stylers":[{"color":"#4da39a"}]},{"featureType":"road.highway","elementType":"all","stylers":[{"visibility":"simplified"}]},{"featureType":"road.highway","elementType":"labels.text","stylers":[{"color":"#ff0000"}]},{"featureType":"road.highway","elementType":"labels.text.fill","stylers":[{"visibility":"on"},{"color":"#ffffff"}]},{"featureType":"road.highway","elementType":"labels.text.stroke","stylers":[{"visibility":"off"}]},{"featureType":"road.arterial","elementType":"geometry.fill","stylers":[{"visibility":"on"}]},{"featureType":"road.arterial","elementType":"labels.text","stylers":[{"visibility":"on"}]},{"featureType":"road.arterial","elementType":"labels.text.fill","stylers":[{"visibility":"on"},{"color":"#ffffff"}]},{"featureType":"road.arterial","elementType":"labels.text.stroke","stylers":[{"visibility":"off"}]},{"featureType":"road.arterial","elementType":"labels.icon","stylers":[{"visibility":"off"}]},{"featureType":"road.local","elementType":"labels.text.fill","stylers":[{"color":"#ffffff"}]},{"featureType":"road.local","elementType":"labels.text.stroke","stylers":[{"visibility":"off"}]},{"featureType":"transit","elementType":"all","stylers":[{"visibility":"off"}]},{"featureType":"water","elementType":"all","stylers":[{"color":"#5abbec"},{"visibility":"on"}]},{"featureType":"water","elementType":"geometry.fill","stylers":[{"color":"#2594e4"},{"weight":"1"},{"visibility":"on"}]}];

    $scope.settings = {
	speed: 4.98897
    };
    $scope.transit = {
	distance: 0.0,
	in_transit: false,
	ready: false
    };
    
    var map_style = new google.maps.StyledMapType(map_style_definition, {name: 'Go Map Style'});

    var map;
    var device;
    var destination;
    var directions_display;
    var directionsService = new google.maps.DirectionsService();
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
	directions_display.setMap(map);
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
			$scope.$apply(function(){
			    $scope.transit.ready = true;
			    $scope.transit.distance = _dist/100.0;
			    $scope.transit.steps = steps;
			});
		    } else {
			console.log('Could not fetch directions!');
			destination.setPosition(device.getPosition());
			destination.setAnimation(google.maps.Animation.DROP);
		    }
		});
	    }
	});
	
    }


    $scope.startTransit = function(){
	var start = $scope.transit.steps[0].start_point;
	var end = $scope.transit.steps[0].end_point;
	var distance = $scope.transit.steps[0].distance.value;
	var speed = $scope.settings.speed * 0.277778;
	var time = 555;
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
	    console.log(position);
	    console.log(destination.getPosition());
	    if (position == destination.getPosition()){
		destination.setAnimation(google.maps.Animation.DROP);
	    }
	}, function(response){
	    console.log('Could not update location!');
	});
    };
    
});


_A.controller('navbarController', function($scope, $location){

    $scope.current_section = 'go';

    $scope.changeSection = function(section){
	$scope.current_section = section;
    };

});

