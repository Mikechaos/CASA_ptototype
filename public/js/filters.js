'use strict';

/* Filters */

angular.module('casaApp.filters', []).
    filter('interpolate', ['version', function(version) {
	return function(text) {
	    return String(text).replace(/\%VERSION\%/mg, version);
	}
    }]).
    filter('cmOnly', function () {
	return function (emps) {
	    var supervisor = [];
	    forEach(emps, function (emp) {
		if (emp.empClass <= 2)
		{
		    supervisor.push(emp);
		}
	    });
	    return supervisor;
	};	
    }).
    filter('subset_emp', function () {
	return function (emps, wantSupervisor) {
	    var filtered_emp = [];
	    forEach(emps, function (emp) {
		var predicate = (wantSupervisor) ? emp.empClass <= 2 : emp.empClass > 2;
		if (predicate)
		{
		    filtered_emp.push(emp);
		}
	    });
	    return filtered_emp;
	};	
    }).
    filter('elemsSeparation', function () {
	return function (elems, obj_class) {
	    var filtered_elems = [];
	    forEach(elems, function (e) {
		if (e.strElem === obj_class)
		{
		    filtered_elems.push(e);
		}
	    });
	    return filtered_elems;
	};	
    }).
    filter('elems', function () {
	return function (elems, strClass) {
	    return elems.filter_elements(strClass);
	};
    }).
    filter('supervisors', function () {
	return function (elems) {
	    //console.log(elems.filter_supervisors());
	    return elems.list
	};

    }).
    filter('already_attr_elems', function () {
	    return function (elems, days, date, use_already_affected, supervisor) {
		if (use_already_affected) return elems;
		var ret = App.test(elems, days, date, supervisor);
		if (ret.length === 0 && supervisor !== undefined) ret = [{id:-1, name:"Plus de superviseur disponible", strElem: 'Supervisor'}];
		return ret;
		
	    };
    }).
    filter('remove_supervisor', function () {
	return function (elems, supervisor_id) {
	    var supervisor = App.elems.get_by_id({id: supervisor_id, strElem: "Supervisor"})
	    // if (supervisor.selected) supervisor.selected = false;
	    var index;
	    if ((index = search_index(elems, {id:supervisor_id, strElem:"Supervisor"}, function (current, searched) {return current.eql(searched)})) !== false) {
		elems.splice(index, 1);
	    }
	    return elems;
	};
    }).
    filter('remove_affected', function () {
	return function (elems, affected) {
	    if (affected.list.length === 0) return elems;
	    var filtered = elems.filter((function (e) {
		var found = false;

		affected.forEach(function (a) {
		    return !((a.strElem === e.strElem && a.id === e.id)
			     && (found = true))
		});
		// inverted because we want to filter it only if we find (true) it (false = filtered)
		return !found;
	    }));
	    return filtered;
	};
    }).
    filter('between', function () {
    	return function (affectations, fst_date, snd_date) {return affectations.filter_affectations(fst_date, snd_date)};
    })
    .filter('affect_by_fields', function () {
	return function (affectations, supervisor, element, client, link_number) {
	    // (function filter_by_field (array) {
	    if (supervisor !== undefined && supervisor.length !== 0) {
		affectations = affectations.filter(function (a) {
		    return new RegExp('(^|\\s)' + supervisor, 'i').test(a.get_supervisor().name);
		});
	    }
	    if (link_number !== undefined && link_number.length !== 0) {
		affectations = affectations.filter(function (a) {
		    return new RegExp('(^|\\s)' + link_number, 'i').test(a["link_number"]);
		});
	    }
	    // })(affectations);
	    // (function filter_by_client (array) {
	    if (client !== undefined && client.length !== 0) {
	    	affectations = affectations.filter(function (a) {
	    	    return new RegExp('(^|\\s)' + client, 'i').test(a.get_client().name);
	    	});
	    }
	    // })(affectations);
	    // (function filter_by_elems(array) {
	    if (element !== undefined && element.length !== 0) {
	    	affectations = affectations.filter(function (a) {
	    	    return a.elems.is_include(element, function (elem, elem_name) {
	    		return new RegExp('(^|\\s)' + elem_name, 'i').test(elem.name);
	    	    });
	    	});
	    }
	    // })(affectations);
	    return affectations;
	}
    })
    .filter('filter_deliverer', function () {
	return function (element) {
	    var types = ['Livreur'];
	    var elems = [];
	    var emp_t = App.elems.filter_elements('EmployeesType')
	    forEach(types, function (t) {
		var id = emp_t[search_index(emp_t, t, function (e, t) { return e.type === t})].id
		elems = element.list.filter(function (e) {return e.employees_type_id === id});
	    });

	    return elems;
	};
    })
    .filter('affect_by_elements', function () {
	return function (element) {
	    
	};
    })
    .filter('active_element', function () {
	return function (elems, affect_date, days) {
	    // console.log('FILTER', elems, affect_date, days);
	    var diff_array = create_diff_array(affect_date);
	    forEach(elems, function (e) {
		
	    });
	    elems = elems || [];
	    return elems.filter(function (e) {
		var vacation_active = false;
		if (e.state > 2) return !(vacation_active = true); // State greater than 2 => element isn't available at all
		forEach(Date.days, function (d, i) {
		    if (days[d] === true) {
			var date = new Date(affect_date.getFullYear(), affect_date.getMonth(), affect_date.getDate() + diff_array[i]);
			vacation_active = are_vacation_active({start_day: e.vacationStart, end_day: e.vacationEnd}, date);
			return !vacation_active; // so it breaks if vacation_active is true
		    }
		});
		return !vacation_active;
	    });
	};
    })
    .filter('active_vacation', function () {
	return function (vac) {
	    vac = vac || [];
	    return vac.filter(function (v) {return are_vacation_active({start_day: v.vacationStart, end_day: v.vacationEnd})});
	};
    })
    .filter('upcoming_vacation', function () {
	return function (vac) {
	    vac = vac || [];
	    console.log(vac);
	    return vac.filter(function (v) {return !are_vacation_active({start_day: v.vacationStart, end_day: v.vacationEnd})});
	};
    })
;
