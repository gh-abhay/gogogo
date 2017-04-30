/**
 * Author: Abhay Arora
 */

angular.module('angucomplete', [] )
    .directive('angucomplete', function ($parse, $http, $sce, $timeout) {
    return {
        restrict: 'EA',
        scope: {
            "id": "@id",
            "placeholder": "@placeholder",
            "selectedObject": "=selectedobject",
            "url": "@url",
            "dataField": "@datafield",
            "titleField": "@titlefield",
            "descriptionField": "@descriptionfield",
            "imageField": "@imagefield",
            "imageUri": "@imageuri",
            "inputClass": "@inputclass",
            "userPause": "@pause",
            "localData": "=localdata",
            "searchFields": "@searchfields",
            "minLengthUser": "@minlength",
            "matchClass": "@matchclass"
        },
        template: '<div class="angucomplete-holder"><input id="{{id}}_value" ng-model="searchStr" type="text" placeholder="{{placeholder}}" class="{{inputClass}}" onmouseup="this.select();" ng-focus="resetHideResults()" ng-blur="hideResults()" /><div id="{{id}}_dropdown" class="angucomplete-dropdown" ng-if="showDropdown"><div class="angucomplete-searching" ng-show="searching">Searching...</div><div class="angucomplete-searching" ng-show="!searching && (!results || results.length == 0)">No results found</div><div class="angucomplete-row" ng-repeat="result in results" ng-mousedown="selectResult(result)" ng-mouseover="hoverRow()" ng-class="{\'angucomplete-selected-row\': $index == currentIndex}"><div ng-if="imageField" class="angucomplete-image-holder"><img ng-if="result.image && result.image != \'\'" ng-src="{{result.image}}" class="angucomplete-image"/><div ng-if="!result.image && result.image != \'\'" class="angucomplete-image-default"></div></div><div class="angucomplete-title" ng-if="matchClass" ng-bind-html="result.title"></div><div class="angucomplete-title" ng-if="!matchClass">{{ result.title }}</div><div ng-if="result.description && result.description != \'\'" class="angucomplete-description">{{result.description}}</div></div></div></div>',

        link: function($scope, elem, attrs) {
            $scope.lastSearchTerm = null;
            $scope.currentIndex = null;
            $scope.justChanged = false;
            $scope.searchTimer = null;
            $scope.hideTimer = null;
            $scope.searching = false;
            $scope.pause = 500;
            $scope.minLength = 3;
            $scope.searchStr = null;

            if ($scope.minLengthUser && $scope.minLengthUser != "") {
                $scope.minLength = $scope.minLengthUser;
            }

            if ($scope.userPause) {
                $scope.pause = $scope.userPause;
            }

            isNewSearchNeeded = function(newTerm, oldTerm) {
                return newTerm.length >= $scope.minLength && newTerm != oldTerm
            }

            $scope.processResults = function(responseData, str) {
                if (responseData && responseData.length > 0) {
                    $scope.results = [];

                    var titleFields = [];
                    if ($scope.titleField && $scope.titleField != "") {
                        titleFields = $scope.titleField.split(",");
                    }

                    for (var i = 0; i < responseData.length; i++) {
                        // Get title variables
                        var titleCode = [];

                        for (var t = 0; t < titleFields.length; t++) {
                            titleCode.push(responseData[i][titleFields[t]]);
                        }

                        var description = "";
                        if ($scope.descriptionField) {
                            description = responseData[i][$scope.descriptionField];
                        }

                        var imageUri = "";
                        if ($scope.imageUri) {
                            imageUri = $scope.imageUri;
                        }

                        var image = "";
                        if ($scope.imageField) {
                            image = imageUri + responseData[i][$scope.imageField];
                        }

                        var text = titleCode.join(' ');
                        if ($scope.matchClass) {
                            var re = new RegExp(str, 'i');
                            var strPart = text.match(re)[0];
                            text = $sce.trustAsHtml(text.replace(re, '<span class="'+ $scope.matchClass +'">'+ strPart +'</span>'));
                        }

                        var resultRow = {
                            title: text,
                            description: description,
                            image: image,
                            originalObject: responseData[i]
                        }

                        $scope.results[$scope.results.length] = resultRow;
                    }


                } else {
                    $scope.results = [];
                }
            }

            $scope.searchTimerComplete = function(str) {
                // Begin the search

                if (str.length >= $scope.minLength) {
                    if ($scope.localData) {
                        var searchFields = $scope.searchFields.split(",");

                        var matches = [];

                        for (var i = 0; i < $scope.localData.length; i++) {
                            var match = false;

                            for (var s = 0; s < searchFields.length; s++) {
                                match = match || (typeof $scope.localData[i][searchFields[s]] === 'string' && typeof str === 'string' && $scope.localData[i][searchFields[s]].toLowerCase().indexOf(str.toLowerCase()) >= 0);
                            }

                            if (match) {
                                matches[matches.length] = $scope.localData[i];
                            }
                        }

                        $scope.searching = false;
                        $scope.processResults(matches, str);

                    } else {
                        $http.get($scope.url + str, {}).
                            success(function(responseData, status, headers, config) {
                                $scope.searching = false;
                                $scope.processResults((($scope.dataField) ? responseData[$scope.dataField] : responseData ), str);
                            }).
                            error(function(data, status, headers, config) {
                                console.log("error");
                            });
                    }
                }
            }

            $scope.hideResults = function() {
                $scope.hideTimer = $timeout(function() {
                    $scope.showDropdown = false;
                }, $scope.pause);
            };

            $scope.resetHideResults = function() {
                if($scope.hideTimer) {
                    $timeout.cancel($scope.hideTimer);
                };
            };

            $scope.hoverRow = function(index) {
                $scope.currentIndex = index;
            }

            $scope.keyPressed = function(event) {
                if (!(event.which == 38 || event.which == 40 || event.which == 13)) {
                    if (!$scope.searchStr || $scope.searchStr == "") {
                        $scope.showDropdown = false;
                        $scope.lastSearchTerm = null
                    } else if (isNewSearchNeeded($scope.searchStr, $scope.lastSearchTerm)) {
                        $scope.lastSearchTerm = $scope.searchStr
                        $scope.showDropdown = true;
                        $scope.currentIndex = -1;
                        $scope.results = [];

                        if ($scope.searchTimer) {
                            $timeout.cancel($scope.searchTimer);
                        }

                        $scope.searching = true;

                        $scope.searchTimer = $timeout(function() {
                            $scope.searchTimerComplete($scope.searchStr);
                        }, $scope.pause);
                    }
                } else {
                    event.preventDefault();
                }
            }

            $scope.selectResult = function(result) {
                if ($scope.matchClass) {
                    result.title = result.title.toString().replace(/(<([^>]+)>)/ig, '');
                }
                $scope.searchStr = $scope.lastSearchTerm = result.title;
                $scope.selectedObject = result;
                $scope.showDropdown = false;
                $scope.results = [];
                //$scope.$apply();
            }

            var inputField = elem.find('input');

            inputField.on('keyup', $scope.keyPressed);

            elem.on("keyup", function (event) {
                if(event.which === 40) {
                    if ($scope.results && ($scope.currentIndex + 1) < $scope.results.length) {
                        $scope.currentIndex ++;
                        $scope.$apply();
                        event.preventDefault;
                        event.stopPropagation();
                    }

                    $scope.$apply();
                } else if(event.which == 38) {
                    if ($scope.currentIndex >= 1) {
                        $scope.currentIndex --;
                        $scope.$apply();
                        event.preventDefault;
                        event.stopPropagation();
                    }

                } else if (event.which == 13) {
                    if ($scope.results && $scope.currentIndex >= 0 && $scope.currentIndex < $scope.results.length) {
                        $scope.selectResult($scope.results[$scope.currentIndex]);
                        $scope.$apply();
                        event.preventDefault;
                        event.stopPropagation();
                    } else {
                        $scope.results = [];
                        $scope.$apply();
                        event.preventDefault;
                        event.stopPropagation();
                    }

                } else if (event.which == 27) {
                    $scope.results = [];
                    $scope.showDropdown = false;
                    $scope.$apply();
                } else if (event.which == 8) {
                    $scope.selectedObject = null;
                    $scope.$apply();
                }
            });

        }
    };
});


(function(_W, _D){



})(window, window.document);

_A = angular.module('neosurvey', ['ngRoute', 'highcharts-ng', 'angucomplete']);

var viewBase = '/view/';

_A.config(function ($routeProvider, $locationProvider) {
    $routeProvider.when('/', {
        redirectTo: '/dashboard'
    }).when('/dashboard', {
        controller: 'dashboardController',
        templateUrl: viewBase + 'dashboard'
    }).when('/survey', {
        controller: 'surveyController',
        templateUrl: viewBase + 'survey'
    }).when('/verified', {
        controller: 'verifiedController',
        templateUrl: viewBase + 'verified'
    }).when('/resolve/:id', {
        controller: 'resolveController',
        templateUrl: viewBase + 'resolve'
    }).when('/potential', {
        controller: 'potentialController',
        templateUrl: viewBase + 'potential'
    }).otherwise({
        redirectTo: '/'
    });
});

_A.controller('surveyController', function ($http, $scope) {

    $scope.selections = [];
    $scope.visibles = [];
    $scope.selected = {};
    $scope.step = 1;


    $scope.fetch_data = function(){
        $http({
            method: 'GET',
            url: '/api/survey/questions?city=' + ($scope.city ? $scope.city.title : '') + '&zip_code=' + ($scope.postal_code ? $scope.postal_code.title : '') + '&wholesaler=' + ($scope.wholesaler ? $scope.wholesaler.title : '')
        }).then(function (response) {
            $scope.questions = response.data;
            for ( var i = 0; i < $scope.questions.length; i ++ ){
                $scope.visibles[i] = true;
            }
            $scope.step = 2;
        }, function (response) {
            $scope.error = 'Could not fetch data from server!'
        });
    };

    $scope.selectWholesaler = function (customer_code, wholesaler_index) {
        var customer = null;
        var index = -1;
        for ( var i = 0; i < $scope.questions.length; i ++ ){
            if ($scope.questions[i].customer.customer_code == customer_code){
                customer = $scope.questions[i].customer;
                index = i;
                break;
            }
        }
        var wholesaler = $scope.questions[index].wholesalers[wholesaler_index];
        $scope.selections[$scope.selections.length] = {'wholesaler': wholesaler, 'customer': customer}
        //$scope.visibles[index] = false;
        $scope.selected[customer_code] = wholesaler_index;
    };

    $scope.noneOfThese = function (customer_code) {
        var index = -1;
        for ( var i = 0; i < $scope.questions.length; i ++ ){
            if ($scope.questions[i].customer.customer_code == customer_code){
                index = i;
                break;
            }
        }
        //$scope.visibles[index] = false;
        $scope.selected[customer_code] = 'none';
    };

    $scope.finish = function () {
        var selections = $scope.selections;
        $http({
            method: 'POST',
            url: '/api/survey/submit',
            data: selections,
            headers: {
                'Content-Type': 'application/json'
            }
        }).then(function (response) {
            for ( var i = 0; i < $scope.visibles.length; i++ ){
                $scope.visibles[i] = false;
            }
            $scope.success = 'Your data was submitted to Neo4j!';
            $scope.step = 3;
        }, function (response) {
            $scope.error='ERROR ENCOUNTERED: Could not submit your results!';
        });
    };

});


_A.controller('verifiedController', function ($http, $scope) {
    $http({
        method: 'GET',
        url: '/api/survey/verified',
        headers: {
            'Content-Type': 'application/json'
        }
    }).then(function (response) {
        $scope.records = response.data.data;
    }, function (response) {
        $scope.error='ERROR ENCOUNTERED: Could not fetch data!';
    });
});


_A.controller('dashboardController', function ($http, $scope, $location) {
    $scope.graphData = [];
    $scope.chartConfig = {
	options:{
	    chart: {
		plotBackgroundColor: null,
		plotBorderWidth: null,
		plotShadow: false,
		type: 'pie'
	    },
	    title: {
		text: 'Entities Summary'
	    },
	    tooltip: {
		pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
	    },
	    plotOptions: {
		pie: {
		    allowPointSelect: true,
		    cursor: 'pointer',
		    dataLabels: {
			enabled: true,
			format: '<b>{point.name}</b>: {point.percentage:.1f} %'
		    }
		}
	    }
	},
	title:{
	    text: 'Entities Summary'
	},
	series: $scope.graphData
    };
    $http({
        method: 'GET',
        url: '/api/survey/dashboard-stats',
        headers: {
            'Content-Type': 'application/json'
        }
    }).then(function (response) {
        $scope.stats = response.data.data;
        $scope.graphData[$scope.graphData.length] = {
	name: 'Accounts Resolution Summary',
	    colorByPoint: true,
	    data: [
		{
		    name: 'Resolved',
		    y: $scope.stats.matched
		},
		{
		    name: 'Unresolved',
		    y: $scope.stats.pending
		}
	    ]
	};
    }, function (response) {
        $scope.error='ERROR ENCOUNTERED: Could not fetch data!';
    });

    $http({
    	method: 'GET',
    	url: '/api/survey/unresolved-entities'
    }).then(function(response){
    	$scope.unresolved_entites = response.data.data;
    }, function(response){
    	console.log('Could not fetch unresolved entities!');
    	$scope.error = 'Could not fetch unresolved entities!';
    });

    $scope.resolve = function(id){
	$location.path('/resolve/' + id);
    };
    
});


_A.controller('resolveController', function ($http, $scope, $routeParams) {

    $scope.selections = [];
    $scope.selected = {};

    $http({
        method: 'GET',
        url: '/api/survey/questions?code=' + $routeParams.id
    }).then(function (response) {
        $scope.questions = response.data;
    }, function (response) {
        $scope.error = 'Could not fetch data from server!'
    }); 

    $scope.selectWholesaler = function (customer_code, wholesaler_index) {
        var customer = null;
        var index = -1;
        for ( var i = 0; i < $scope.questions.length; i ++ ){
            if ($scope.questions[i].customer.customer_code == customer_code){
                customer = $scope.questions[i].customer;
                index = i;
                break;
            }
        }
        var wholesaler = $scope.questions[index].wholesalers[wholesaler_index];
        $scope.selections[$scope.selections.length] = {'wholesaler': wholesaler, 'customer': customer}
        $scope.selected[customer_code] = wholesaler_index;
    };

    $scope.noneOfThese = function (customer_code) {
        var index = -1;
        for ( var i = 0; i < $scope.questions.length; i ++ ){
            if ($scope.questions[i].customer.customer_code == customer_code){
                index = i;
                break;
            }
        }
        $scope.selected[customer_code] = 'none';
    };

    $scope.finish = function () {
        var selections = $scope.selections;
        $http({
            method: 'POST',
            url: '/api/survey/submit',
            data: selections,
            headers: {
                'Content-Type': 'application/json'
            }
        }).then(function (response) {
            $scope.success = 'Your data was submitted to Neo4j!';
            $scope.step = 3;
        }, function (response) {
            $scope.error='ERROR ENCOUNTERED: Could not submit your results!';
        });
    };

});


_A.controller('navbarController', function($scope, $location){

    $scope.current_section = 'dashboard';

    $scope.changeSection = function(section){
	$scope.current_section = section;
    };

});

