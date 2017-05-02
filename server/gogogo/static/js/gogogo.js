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

