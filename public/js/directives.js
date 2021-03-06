'use strict';

/* Directives */


angular.module('casaApp.directives', []).
    directive('header', function factory() {
	return {
	    replace: true,
	    transclude: false,
	    restrict: 'C',
	    scope: false,
	    templateUrl: 'partials/_header.html',
	};
    })
    .directive('csRenderSchedule', function() {
	return {
	    require: 'ngModel',
	    templateUrl: 'partials/render_schedule.html',
	    compile: function(element, attrs) {
		return function postLink(scope, element, attrs, controller) {
		    scope.affect = scope[attrs.ngModel];

		    // TODO remove this setTimeout
		    setTimeout(function () {
			element.find('td#emp0').attr('style', 'border-top:3px solid #dddddd;');
			element.find('td#truck0').attr('style', 'border-top:3px solid #dddddd;');
			element.find('td#box0').attr('style', 'border-top:3px solid #dddddd;');
		    }, 1000);
		};
	    },
	}
    })
    .directive('csRenderAffectation', function() {
	return {
	    require: 'ngModel',
	    templateUrl: 'partials/render_affectation.html',
	    compile: function(element, attrs) {
		return function postLink(scope, element, attrs, controller) {
		    scope.affect = scope[attrs.ngModel];
		};
	    },

	};
    })
    .directive('csAddAffectation', function() {
	return {
	    templateUrl: 'partials/add_affectation.html',
	    compile: function(element, attrs) {
		return function postLink(scope, element, attrs, controller) {
		};
	    },

	};
    })
    .directive('csTeamSelection', function() {
	return {
	    templateUrl: 'partials/team_selection.html',
	    compile: function(element, attrs) {
		return function postLink(scope, element, attrs, controller) {
		};
	    },

	};
    })
    .directive('csTeamDisplay', function() {
	return {
	    template:
		'<div class="span3" ng-show="(newAffectation.elems | elems:type.strElem).length > 0">'
		+ '<legend style="width:185px;">{{type.title}}</legend>'
		+ '<div style="margin-left:75px;" class="pane well well-large employeeOnJob">'
		    + '<div class="row modal-checkboxes" ng-repeat="elem in newAffectation.elems | elems:type.strElem">'
		      + '<div class="span2 modal-label" style="margin-top:0px; margin-left:-15px;">{{elem.name}}</div>'
		    + '</div>'
   		  + '</div>'
		+ '</div>',
	    scope: true, // Isolated scope -> not shared between all components
	    compile: function(element, attrs) {
		return function postLink(scope, element, attrs, controller) {
		    scope.type = {};
		    attrs.$observe('csTeamDisplay', function (obj) {
			scope.type = angular.fromJson(obj);
		    });
		};
	    },

	};
    })
   
    .directive('autoComplete', function($timeout) {
	return function(scope, iElement, iAttrs) {
            iElement.autocomplete({
                source: scope[iAttrs.uiItems],
                select: function() {
                    $timeout(function() {
			iElement.trigger('input');
                    }, 0);
                }
            });
	};
    })
    .directive('csUnavailableList', function() {
	return {
	    scope: true,
	    templateUrl: 'partials/unavailable_table.html',
	        link: function(scope, element, attrs, controller) {
		    console.log(attrs);
		    scope.strElem = attrs.strElem;
		    scope.screen_strElem = attrs.screenStrElem;
		},
	};
    })

// .directive('paneElem' function factory() {

    // 	return function (

    // };// .
    // directive('header', function factory() {
    // 	return {
    // 	    replace: true,
    // 	    transclude: false,
    // 	    restrict: 'C',
    // 	    scope: false,
    // 	    template: '<select ng-model="emp"  ng-options="emp.name for emp in emps"></select>',
    // 	};
    // });
