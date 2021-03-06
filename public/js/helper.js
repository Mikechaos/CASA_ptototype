Global = this; // reference to window

// Inhteritance_Manager
var Inherits = {};
Inherits = {
    log: [],

    extend: function(subClass, baseClass, inherits_static) {
	var inherit = {};
	// If not define or anything else is passed, inherits_static is true
	if (inherits_static !== true && inherits_static !== false) inherits_static = true;
	inherit.name = subClass.name;
	inherit.base_name = baseClass.name;
	inherit.sub_before = subClass.prototype;
	var merge = function(sub, sub_prototype){
	    inherit.base_before = sub;
	    // This will resolve conflicts by using the source object's properties
	    for (prop in sub_prototype){
		sub.prototype[prop] = sub_prototype[prop];
	    }
	    inherit.base_after = sub.prototype;
	}
	
	function inheritance() { }
	inheritance.prototype = baseClass.prototype;
	prototype = subClass.prototype;
	subClass.prototype = new inheritance();
	merge(subClass, prototype);
	subClass.prototype.constructor = subClass;
	subClass.baseConstructor = baseClass;
	subClass.superClass = baseClass.prototype;
	if (inherits_static === true) this.static_prop(subClass, baseClass);
	this.log.push(inherit);
    },

    skip_prop: ["baseClass", "baseConstructor"],

    static_prop: function(sub_class, base_class) {
	sub_class.parent_static = {};
	for (p in base_class) {
	    if (Inherits.skip_prop.indexOf(p) > -1) continue;
	    sub_class.parent_static[p] = base_class[p];
	    if (sub_class[p] === undefined) sub_class[p] = base_class[p];
	}
    },

    // Abstract function to inherit easily hierarchy
    // Instead of writing each line : Inheritance_Manager.extend(xxx, Element);
    extend_multiple: function (classes, defaultc) {
	forEach(classes, function (c) {
	    if (c.length === 1) c.push(defaultc);
	    Inherits.extend(Global[c[0]], Global[c[1]]);
	});
    },

    multiple: function (classes, parent) {
	forEach (classes, function (c) {
	    if (c.length === 1) c.push(parent);
	    Inherits.extend(c[0], c[1]);
	});
    },

};

// Found somewhere in the internets
// Actually is there only for comparative and study purpose
function createSpec(child, parent){
    var parentPrototype;
 
    !parent && (parent = Object);
    !parent.prototype && (parent.prototype = {});
    parentPrototype = parent.prototype;
    child.prototype = Object.create(parent.prototype);
    child.prototype.__super__ = parentPrototype;
    // Yes, This is 'bad'. However, it runs once per Spec creation.
    var spec = new Function("child", "return function " + child.name + "(){child.prototype.__super__.constructor.apply(this, arguments);return child.apply(this, arguments);}")(child);
    spec.prototype = child.prototype;
    spec.prototype.constructor = child.prototype.constructor = spec;
 
    return spec;
}


// === HELPERS ===

// higher-order foreach to abstract for (i..) statement
function forEach(array, action) {
    if (typeof array === 'undefined') return;
    else if (!(array instanceof Array)) array = [array];
    for (var i = 0; i < array.length; i++)
    {
	if (action(array[i], i) === false) break;
    }
};

function base_predicate (e, elem) {
    return (e === elem);
}

function search_index (list, elem, predicate) {
    predicate = predicate || base_predicate;
    var index = false;
    forEach(list, function (e, i) {
	// If predicate is true, will result in return false => end of loop
	// && second part (found = i) will be evaluate
	// Else second part is not evaluate and returns true => equiv to continue);
	// if (predicate(e, elem)) console.log(elem, !((index = i) === false), !(predicate(e, elem) && (index = i)));
	return !(predicate(e, elem) && !((index = i) === false));
    });
    return index;
}

function insertion_sort(array, x, predicate) {
    if (array.length < 1) {
	array.push(x);
	return;
    }
    var tmp = undefined;
    var i_tmp = undefined;
    forEach(array, function (a, i) {
	if (predicate(a, x)) {
	    i_tmp = i;
	    tmp = a;
	    return false;
	}
    });
    if (i_tmp === 0) res = array.unshift(x);
    else if(typeof tmp === "undefined") array.push(x);
    else array.splice(i_tmp, 1, x, tmp);
}


// Deep Copy all an object's properties
function deepCopy(obj) {
    if (typeof obj !== "object" || obj === null) return obj;
    if (obj.constructor === RegExp) return obj;
    var retVal = new obj.constructor();
    for (var key in obj) {
        if (!obj.hasOwnProperty(key)) continue;
        retVal[key] = deepCopy(obj[key]);
    }
    return retVal;
}

function get_params(params) {
    //parseInt(window.location.hash.substr(window.location.hash.search(/\?date=/)+ new String('?date=')
}

Date.prototype.getFullDate = function(days) {
    var date = this;
    if (days > 0) { 
	date.setDate(date.getDate() + days);
    }
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}


Date.compare = function (fst, snd) {
  var res = 0;
    fns = ["getFullYear", "getMonth", "getDate"];
    forEach (fns, function(fn) {
	if (fst[fn]() < snd[fn]()) res = -1;
	else if (fst[fn]() > snd[fn]()) res = 1;
	if (res !== 0) return false;
    });
    return res;
	    
}

Date.days = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];

Date.month = ["Janvier", "Février" , "Mars",  "Avril", "Mai", "Juin", "Juillet", "Aout", "Septembre", "Octobre", "Novembre", "Décembre"];

