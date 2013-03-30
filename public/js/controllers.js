'use strict';

/* Controllers */


(function (ng, app, $http, fetch_all) {

    // CASA CONTROLLER
    function CasaCtrl($scope, fetch_all)
    {
	$scope.elements = App.elems;
	this.scope = $scope;
	

	$scope.safeApply = function(fn) {
	    var phase = this.$root.$$phase;
	    if(phase == '$apply' || phase == '$digest') {
		if(fn && (typeof(fn) === 'function')) {
		    fn();
		}
	    } else {
		this.$apply(fn);
	    }
	};
	this.scope.root = '/#/';
	this.scope.fetched_all = fetch_all;
	this.scope.showingDayDetails = false;
	// this.scope.data_promise = fetch_all_data;
	// console.log(this.scope.data_promise);
	// fetch_all_data.then(function () { console.log("hmm"); affectation_data().success(function () {console.log('wooh!')})});
	return (this);
	
    }
    
    CasaCtrl.prototype = {
	
	// Method definition
	
    };


    // DISPATCH CONTROLLER
    // Will need to refactor usage of services here
    function DispatchCtrl($scope, $http) {

	$scope.elems = [];
	//$scope.jobs = job_data;

	$scope.date = {
	    today: new Date(),
	    fstDate: new Date(),
	    sndDate: 0,
	}
	$scope.elements_class = [{name: "Supervisor", screen: "Superviseurs"},
				{name: "Employee", screen: "Employés"},
				{name: "Truck", screen: "Camions"},
				{name: "Box", screen: "Coffres"}];
	$scope.date.sndDate = new Date($scope.date.today.getFullYear(), $scope.date.today.getMonth(), $scope.date.today.getDate() + 7),
	$scope.newAffectation = new Affectation();
	$scope.save_affectation = ng.bind(this, this.save_affectation);
	$scope.affected_elems = App.affected_today
	$scope.attributed_given_day = App.attributed;
	$scope.$watch('newAffectation.date', function () {
	    forEach(Date.days, function (d) {
		$scope.days[d] = false;
	    });
	    $scope.days[$scope.newAffectation.week_day()] = true;
	    App.verify_day($scope.newAffectation.date);
	    
	});
	
	$scope.clear_affectation = ng.bind(this, this.clear_affectation);
	/*
	$scope.validation_error = false;
	$scope.alert: {	
	    "type": "error",
	    "title": "Erreur de validation!",
	    "content": "Dans l'état actuel des choses, vous essayez d'attribuer des employés déjà attribués à cette affectaction. Essayez de déselectionner certaines journées"
	};
	$scope.$watch('days', function () {
	    
	};*/
	this.scope = $scope;
	this.http = $http;
	this.init();
	
	return (this);

    };
    
    DispatchCtrl.prototype = {
	save_affectation: function () {
	    // Copy affectation over other date selected
	    //this.scope.days[this.scope.newAffectation.week_day()] = false;
	    var diff = -(Date.days.indexOf(this.scope.newAffectation.week_day()));
	    var diff_array = [];
	    for (var i = 0; i < 7; ++i) {
		diff_array[i] = diff + i;
	    }

	    var $scope = this.scope
	    var self = this;
	    forEach (Date.days, function (d, i) {
	    	if ($scope.days[d] === true) {
		    var affect = new Affectation();
		    affect.copy($scope.newAffectation);
	    	    affect.date.setDate($scope.newAffectation.date.getDate() + diff_array[i]);
		    affect.id = self.post_affectation(affect);
	    	    App.insert_affect(affect);
	    	}
	    	++i;
	    });
	    App.verify_today();
	    this.clean();
	    this.init();
	},
    	
	post_affectation: function (a) {
	    this.http({method: 'POST',  url: '/affectations', params: new PostAffectation(a), headers: "application/x-www-form-urlencoded"})
		.success(function (data, status) {console.log(data);})
		.error(function () {console.log('error')});
	},

	init: function () {
	    this.scope.newAffectation = new Affectation();
	    this.scope.days = {
		Dimanche: false,
		Lundi: false,
		Mardi: false,
		Mercredi: false,
		Jeudi: false,
		Vendredi: false,
		Samedi: false,
	    };
	    this.scope.elems = [];
	    this.scope.$watch('newAffectation', this.scope.newAffectation.render());
	},

	clean: function () {
	    forEach(this.scope.elements.list, function(e, i) {
		e.selected = false;
	    });
	},

	clear_affectation: function () {
	    this.clean();
	    this.init();
	},
    };

    
    function DateSelecterCtrl($scope) {

	// adm_ prefix => add mode
	this.addm_height = 45;

	// selectm_ => select mode
	this.selectm_height = 100;

	// Date ui
	$scope.today = function () {
	    this.date.fstDate = new Date();
	}

	$scope.nextWeek = function () {
	    this.date.sndDate = new Date();
	    this.date.sndDate.setDate(this.date.sndDate.getDate() + 7);
	};
	$scope.mode_enum = {
	    ADD : "add_mode",
	    SELECT : "select_mode",
	};

	$scope.set_mode = ng.bind( this, this.set_mode );

	this.scope = $scope;
	this.set_select_mode();
	// this.set_add_mode();


	return (this);

    };

    DateSelecterCtrl.prototype = { 
	
	set_mode : function (mode) {
	    (mode === this.scope.mode_enum.ADD) ? this.set_add_mode() : this.set_select_mode();
	},
	
	set_add_mode : function () { 
	    this.scope.pane_height = this.addm_height;
	    this.scope.$parent.affectation = true;
	},

	set_select_mode : function () {
	    this.scope.pane_height = this.selectm_height;
	    this.scope.$parent.affectation = false;
	},

    };
    
    function ElementsSelectionCtrl($scope) {

	$scope.opts = {
	    backdropFade: true,
	    dialogFade:true
	};

	$scope.open  = ng.bind(this, this.open);
	$scope.close = ng.bind(this, this.close);
	$scope.change = ng.bind(this, this.change);
	$scope.process = ng.bind(this, this.process);
	// Hack. Needed because of the way I create the DOM with ng-repeat
	$scope.hack = [{active: "active"}, {active: ""}, {active: ""}, {active: ""}];
	$scope.ids = ["supervisor", "employee", "truck", "box"];
	
	this.scope = $scope;
	return this;

    }

    ElementsSelectionCtrl.prototype = {

	change: function (e) {
	    e.selected === true ? this.add(e) : this.delete(e);
	},
	
	add: function (e) {
	    this.scope.elems.push(e); 
	},
	
	delete: function (e) {
	    this.scope.elems.splice(search_index(this.scope.elems, e), 1);
	},
	
	process: function () {
	    this.scope.newAffectation.elems.list = [].concat(this.scope.elems)
	},
	
	open: function () {
	    this.scope.shouldBeOpen = true;
	},

	close: function () {
	    this.scope.shouldBeOpen = false;
	},

    };

    function RenderCtrl($scope) {
	$scope.affectations = App.affectations;
	
    }

    function AddElems ($scope, $http) {

	//console.log($http.post('/nimporrteou', 'test'));
	$scope.submit = ng.bind(this, this.submit($scope, $http));
	this.scope = $scope;
    }

    AddElems.prototype = { 
	submit: function ($scope, $http) {
	    return function () {
		var self = this;
		$http({method: 'POST',  url: this.scope.newElem.route, params: this.scope.newElem, headers: "application/x-www-form-urlencoded"})
		    .success(function (data, status) {self.save();})
		    .error(function () {console.log('error')});
	    }
	},

	save: function () {
	    App.elems.push(this.scope.newElem);
	    this.scope.newElem = new Global[this.scope.newElem.strElem];
	    // console.log("superClass called");
	},

    };

    function EmployeesCtrl ($scope, $http) {
	AddElems.call(this, $scope, $http);
	$scope.newElem = new Employee;
	$scope.employeesTypes = {};
	// $scope.employeesTypes
	$scope.fetched_all.then(function () {
	    $scope.employeesTypes = App.elems.filter_elements("EmployeesType");
	    $scope.safeApply();	    
	});

	$scope.refresh_employees = function () {
	    $scope.employeesTypes = App.elems.filter_elements("EmployeesType");
	    $scope.safeApply();
	};

	this.scope = $scope;
    }

    EmployeesCtrl.prototype = {
	save: function () {
	    this.scope.newElem.set_string_type();
	    App.elems.push(this.scope.newElem.employees_type_id === 0 ? new Supervisor(this.scope.newElem) : this.scope.newElem);
	    this.scope.newElem = new Employee;
	},
	// submit: function () {
	//     this.superClass.submit.call(this)
	//     this.scope.newElem = new Employee;
	// },
    };
    

    function EmployeesTypesCtrl ($scope, $http) {
	AddElems.call(this, $scope, $http);
	$scope.newElem = new EmployeesType;
	this.scope = $scope;
    }

    EmployeesTypesCtrl.prototype = {
	save: function () {
	    this.constructor.superClass.save.call(this);
	    this.scope.refresh_employees();
	}
    };

    function JobsCtrl ($scope, $http) {
	AddElems.call(this, $scope, $http);
	$scope.newElem = new Job;
	$scope.clients = App.elems.filter_elements("Client");
    }

    JobsCtrl.prototype = {

    };
	
				   
    function ClientsCtrl ($scope, $http) {
	AddElems.call(this, $scope, $http);
	$scope.newElem = new Client;
    }
    
    ClientsCtrl.prototype = {
 
    };

    function TrucksCtrl ($scope, $http) {
	AddElems.call(this, $scope, $http);
	$scope.newElem = new Truck;
    }

    TrucksCtrl.prototype = {

    };
	
    function BoxesCtrl ($scope, $http) {
	AddElems.call(this, $scope, $http);
	$scope.newElem = new Box;
    }

    BoxesCtrl.prototype = {

    };

    Inherits.multiple([[EmployeesCtrl], [EmployeesTypesCtrl], [JobsCtrl], [ClientsCtrl], [TrucksCtrl], [BoxesCtrl]], AddElems);

    function DayDetailsCtrl ($scope) {
	console.log('triggered');
	$scope.$parent.showingDayDetails = true;
	$scope.day_affectations = [];
	$scope.fetched_all.then(function () { $scope.safeApply(function () { $scope.day_affectations = App.affectations.get_todays()})});
	
    }

    
    ng.module('casaApp.controllers', [])
	.controller('CasaCtrl', CasaCtrl)
	.controller('DispatchCtrl', DispatchCtrl)
	.controller('ElementsSelectionCtrl', ElementsSelectionCtrl)
	.controller('DateSelecterCtrl', DateSelecterCtrl)
	.controller('RenderCtrl', RenderCtrl)
	.controller('AddElems', AddElems)
	.controller('ClientsCtrl', ClientsCtrl)
	.controller('JobsCtrl', JobsCtrl)
	.controller('TrucksCtrl', TrucksCtrl)
	.controller('BoxesCtrl', BoxesCtrl)
	.controller('EmployeesCtrl', EmployeesCtrl)
	.controller('EmployeesTypesCtrl', EmployeesTypesCtrl)
	.controller('UsersCtrl', function(){})
	.controller('DayDetailsCtrl', DayDetailsCtrl);
    
}(angular, casaApp));

