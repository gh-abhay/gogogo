/**
 * Author: Abhay Arora
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

    var map_style_definition = [{"featureType":"administrative","elementType":"labels.text.fill","stylers":[{"color":"#444444"}]},{"featureType":"landscape","elementType":"all","stylers":[{"color":"#f2f2f2"}]},{"featureType":"poi","elementType":"all","stylers":[{"visibility":"off"}]},{"featureType":"road","elementType":"all","stylers":[{"saturation":-100},{"lightness":45}]},{"featureType":"road.highway","elementType":"all","stylers":[{"visibility":"simplified"}]},{"featureType":"road.arterial","elementType":"labels.icon","stylers":[{"visibility":"off"}]},{"featureType":"transit","elementType":"all","stylers":[{"visibility":"off"}]},{"featureType":"water","elementType":"all","stylers":[{"color":"#46bcec"},{"visibility":"on"}]}];

    var map_style = new google.maps.StyledMapType(map_style_definition, {name: 'Go Map Style'});

    var map;
    var device;
    function initMap() {
      map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: -34.397, lng: 150.644},
        zoom: 16
      });
	map.mapTypes.set('styled_map', map_style);
        map.setMapTypeId('styled_map');
	device = new google.maps.Marker({
          map: map,
          draggable: true,
          animation: google.maps.Animation.DROP,
            position: {lat: -34.397, lng: 150.644},
	    icon: '/static/img/pokeball-marker.png'
        });
	google.maps.event.addListener(device, "dragend", function() {
	    var position = device.getPosition();
	    $scope.updateCurrentLocation(position);
	});
    }
    
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
	    // PASS
	}, function(response){
	    console.log('Could not update location!');
	});
    };

    // marker.setAnimation(google.maps.Animation.BOUNCE);
    
});


_A.controller('navbarController', function($scope, $location){

    $scope.current_section = 'go';

    $scope.changeSection = function(section){
	$scope.current_section = section;
    };

});

