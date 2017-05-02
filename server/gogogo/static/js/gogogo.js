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


_A.controller('goController', function($scope){

    var map_style_definition = [{"featureType":"administrative","elementType":"labels.text.fill","stylers":[{"color":"#444444"}]},{"featureType":"landscape","elementType":"all","stylers":[{"color":"#f2f2f2"}]},{"featureType":"poi","elementType":"all","stylers":[{"visibility":"off"}]},{"featureType":"road","elementType":"all","stylers":[{"saturation":-100},{"lightness":45}]},{"featureType":"road.highway","elementType":"all","stylers":[{"visibility":"simplified"}]},{"featureType":"road.arterial","elementType":"labels.icon","stylers":[{"visibility":"off"}]},{"featureType":"transit","elementType":"all","stylers":[{"visibility":"off"}]},{"featureType":"water","elementType":"all","stylers":[{"color":"#46bcec"},{"visibility":"on"}]}];

    var map_style = new google.maps.StyledMapType(map_style_definition, {name: 'Go Map Style'});
    
    var map;
    function initMap() {
      map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: -34.397, lng: 150.644},
        zoom: 8
      });
	map.mapTypes.set('styled_map', map_style);
        map.setMapTypeId('styled_map');
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
});


_A.controller('navbarController', function($scope, $location){

    $scope.current_section = 'go';

    $scope.changeSection = function(section){
	$scope.current_section = section;
    };

});

