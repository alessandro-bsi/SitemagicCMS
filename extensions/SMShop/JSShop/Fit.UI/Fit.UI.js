
(function (factory)
{
	// UMD module (AMD, CommonJS, and Global).
	// Good documentation on modules:
	// http://2ality.com/2015/12/babel-commonjs.html
	// http://davidbcalhoun.com/2014/what-is-amd-commonjs-and-umd

	// CommonJS module.
	// Enables support for bundlers such as WebPack.
	if (typeof module === "object" && typeof module.exports === "object")
	{
		// Register module the same way Babel does:
		// http://2ality.com/2015/12/babel-commonjs.html#how-babel-compiles-es6-modules-to-commonjs

		var fit = factory();

		// Export as one large module (Fit)
		// module.exports.Fit = fit;

		// Export each namespace of Fit.UI as individual modules (Array, Core, Dom, etc.)
		// This way we can do this: import { Controls as c, Dom as d } from "fit-ui"
		module.exports = fit;
		// module.exports.default = fit; // DISABLED, breaks IE8

		Object.defineProperty(module.exports, "__esModule", { value: true });
	}

	// AMD module for runtime loading.
	// Usage: require(["libs/Fit.UI/Fit.UI.js"], function(fit) { console.log("Loaded", fit); });
	// Make sure to load RequireJS first - demo: https://codepen.io/anon/pen/KvMGNa?editors=0010
	else if (typeof define === "function" && define.amd)
	{
		define(["require", "exports"], factory);
	}

	// Global instance
	else if (window)
	{
		var src = document.scripts[document.scripts.length-1].src;
		var paramSeparatorPos = src.indexOf("?");

		if (paramSeparatorPos > -1)
		{
			// Argument(s) found in src reference - add instance to custom global variable name.
			// First argument is expected to be the name of the Fit instance.

			var name = src.substring(paramSeparatorPos + 1, (src.indexOf("&") === -1 ? src.length : src.indexOf("&")));

			if (name.indexOf("=") === -1) // Make sure name was defined in the form of e.g. ?Fit and not ?arg=val
			{
				window[name] = factory();
			}
			else // Name was not valid, it was in the form of ?arg=val
			{
				window.Fit = factory();
			}
		}
		else
		{
			window.Fit = factory();
		}
	}
})(function()
{
	//"use strict"; // Not supported by IE9 and below - may cause different runtime behaviour - https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Strict_mode
	var fitInstance =

(function(){

;(function() // Terminate script if browser is not capable of running Fit.UI
{
	if (!window.JSON || !window.NodeList) // JSON and NodeList are not available on IE7 and older
	{
		if (navigator.userAgent.indexOf("MSIE") > -1)
			throw new Error("Browser not supported - Internet Explorer 8 or newer is required - make sure Compatibility View is not enabled");
		else
			throw new Error("Browser not supported");
	}

	return true;
})();

;(function() // Prevent Legacy IE from choking if e.g. console.log(..) is called without developer tools open
{
	if (!window.console)
		window.console = {};

	var shims = [ "log", "debug", "info", "error", "warn", "trace" ];

	for (var i = 0 ; i < shims.length ; i++)
	{
		if (!console[shims[i]])
			console[shims[i]] = function() {};
	}
})();


/// <container name="Fit.Core">
/// 	Core features extending the capabilities of native JS
/// </container>
var Fit = {};
Fit.Core = {};

/// <function container="Fit.Core" name="Extend" access="public" static="true" returns="object">
/// 	<description>
/// 		Extend any object with the public members of a super class.
///
/// 		MyClass = function(controlId)
/// 		{
/// 			&#160;&#160;&#160;&#160; Fit.Core.Extend(this, MySuperClass).Apply();
/// 		}
///
/// 		The code above defines a class called MyClass which extends from MySuperClass.
/// 		Use Apply() to pass variables to the super class constructor as shown below:
///
/// 		Male = function(name, age)
/// 		{
/// 			&#160;&#160;&#160;&#160; Fit.Core.Extend(this, Person).Apply("Male", name, age);
/// 		}
///
/// 		Notice that calling just Extend(..) without calling Apply() on the object returned,
/// 		will not cause extension to occure. Apply() must be called, with or without parameters.
///
/// 		Notice that Fit.UI supports multiple inheritance. Be careful not to extend from multiple
/// 		classes implementing functions with identical names, or at least be aware that the last
/// 		class from which the derivative extends, takes precedence.
/// 	</description>
/// 	<param name="subInstance" type="object"> Instance of sub class to extend </param>
/// 	<param name="superType" type="function"> Class (function) to extend from </param>
/// </function>
Fit.Core.Extend = function(subInstance, superType)
{
	Fit.Validation.ExpectIsSet(subInstance);
	Fit.Validation.ExpectFunction(superType);

	// Notice that we support multiple inheritance. For that reason we
	// cannot do something like the code below to support instanceof:
	// Human.prototype = Object.create(Creature.prototype);
	// Human.prototype.constructor = Creature;
	// As an alternative to instanceof, use Fit.Core.InstanceOf(..).

	var binder =
	{
		Apply: function()
		{
			superType.apply(subInstance, arguments);

			// Support for Fit.Core.Extends(..)

			if (!subInstance._internal)
				subInstance._internal = {};

			if (!subInstance._internal.Extends)
				subInstance._internal.Extends = [];

			Fit.Array.Add(subInstance._internal.Extends, superType);
		}
	}
	return binder;
}

/// <function container="Fit.Core" name="Extends" access="public" static="true" returns="boolean">
/// 	<description>
/// 		Returns boolean indicating whether given object is an extension of a given super type - see Fit.Core.Extend(..).
/// 		Also look into Fit.Core.InstanceOf(..) which may provide the desired behaviour.
/// 	</description>
/// 	<param name="instance" type="object"> Object instance </param>
/// 	<param name="superType" type="function"> Reference to super class (function) </param>
/// </function>
Fit.Core.Extends = function(instance, superType)
{
	Fit.Validation.ExpectIsSet(instance);
	Fit.Validation.ExpectFunction(superType);

	return (instance._internal !== undefined && instance._internal.Extends !== undefined && Fit.Array.Contains(instance._internal.Extends, superType) === true);
}

/// <function container="Fit.Core" name="InstanceOf" access="public" static="true" returns="boolean">
/// 	<description>
/// 		Returns boolean indicating whether given object is an instance or extension of a given class type - see Fit.Core.Extend(..).
/// 		This is equivalent of: var result = (obj instanceof MyType || Fit.Core.Extends(obj, MyType));
/// 	</description>
/// 	<param name="instance" type="object"> Object instance </param>
/// 	<param name="type" type="function"> Reference to class (function) </param>
/// </function>
Fit.Core.InstanceOf = function(instance, type)
{
	return (instance instanceof type || Fit.Core.Extends(instance, type) === true);
}

/// <function container="Fit.Core" name="CreateOverride" access="public" static="true" returns="function">
/// 	<description>
/// 		Create a function override for any given function using the approach below.
///
/// 		this.SayHello = function(name) { alert("Hello " + name); }
/// 		this.SayHello = Fit.Core.CreateOverride(this.SayHello, function(name)
/// 		{
/// 			console.log(name + " logged in");
/// 			console.log(name + " is using the following browser: " + navigator.userAgent);
///
/// 			base(name); // Call original SayHello function
/// 		});
///
/// 		Notice how base(..) allows us to call the original function.
/// 	</description>
/// 	<param name="originalFunction" type="function"> Reference to function to override </param>
/// 	<param name="newFunction" type="function"> Reference to replacement function </param>
/// </function>
Fit.Core.CreateOverride = function(originalFunction, newFunction)
{
	Fit.Validation.ExpectFunction(originalFunction);
	Fit.Validation.ExpectFunction(newFunction);

	return function()
	{
		var orgBase = window.base; // May already exist
		window.base = originalFunction; // Globally accessible base function

		var error = null;
		var result = undefined;

		try // Make sure we can clean up globally accessible base function in case of errors
		{
			// The arguments variable is actually not an ordinary array
			// (see https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Functions/arguments).
			// Browsers implementing ECMAScript prior to version 5 (e.g. IE8) require apply(..) to be
			// called with an ordinary array containing the arguments.
			var args = [];

			for (var i = 0 ; i < arguments.length ; i++)
				args[i] = arguments[i];

			if (args.length > 0)
				result = newFunction.apply(this, args);
			else
				result = newFunction.apply(this);
		}
		catch (err)
		{
			error = err;
		}

		if (orgBase)
		{
			window.base = orgBase;
		}
		else
		{
			try
			{
				delete window.base; // Fails in IE8 with "Object doesn't support this action"
			}
			catch (err)
			{
				window.base = undefined;
			}
		}

		if (error !== null)
			Fit.Validation.ThrowError(error);

		if (result !== undefined)
			return result;
	}
}

/// <function container="Fit.Core" name="IsEqual" access="public" static="true" returns="boolean">
/// 	<description>
/// 		Compare two JavaScript objects to determine whether they are identical.
/// 		Returns True if objects are identical (equal), otherwise False.
/// 		Functions are compared by reference, not by value.
/// 		Custom properties set on native JS objects (e.g. Array.XYZ) are not compared, only
/// 		values are. Naturally JSON objects will be fully compared, including all properties.
/// 		Be aware of self referencing variables and circular structures, which
/// 		will cause an infinite loop, and eventually a stack overflow exception.
/// 		DOM objects and window/frame instances are not supported.
/// 	</description>
/// 	<param name="jsObj1" type="object"> JS object to compare agains second JS object </param>
/// 	<param name="jsObj2" type="object"> JS object to compare agains first JS object </param>
/// </function>
Fit.Core.IsEqual = function(jsObj1, jsObj2)
{
	// TEST CASE: Example below is supposed to return: TRUE!
	/*var f1 = function() { alert("Hello"); }
	var f2 = f1;
	Fit.Core.IsEqual(
	{
		str: "Hello world",
		num: 123,
		dec: 123.321,
		date: new Date("2014-12-01 13:02:23"),
		bool: true,
		bool2: false,
		arr: [100, 200, 250, 400],
		arr2: ["Hello", "world"],
		arr3: [123, "hello", true, false, new Date("1990-01-20"), [1,2,3], { x: { "hapsen": f1, "hello": new Array(1,2,3) } }],
		obj: { a: 123, b: 123.321, c: true, d: false, e: new Date("1993-06-25"), f: "hello", g: null, h: undefined }
	},
	{
		str: "Hello world",
		num: 123,
		dec: 123.321,
		date: new Date("2014-12-01 13:02:23"),
		bool: true,
		bool2: false,
		arr: [100, 200, 250, 400],
		arr2: ["Hello", "world"],
		arr3: [123, "hello", true, false, new Date("1990-01-20"), [1,2,3], { x: { "hapsen": f2, "hello": new Array(1,2,3) } }],
		obj: { a: 123, b: 123.321, c: true, d: false, e: new Date("1993-06-25"), f: "hello", g: null, h: undefined }
	});*/

	if (typeof(jsObj1) !== typeof(jsObj2))
		return false;

	if ((jsObj1 === undefined && jsObj2 === undefined) || (jsObj1 === null && jsObj2 === null))
	{
		return true;
	}
	else if (typeof(jsObj1) === "string" || typeof(jsObj1) === "boolean")
	{
		return (jsObj1 === jsObj2);
	}
	else if (typeof(jsObj1) === "number")
	{
		if (isNaN(jsObj1) === true && isNaN(jsObj2) === true) // NaN variables are not comparable!
			return true;
		else
			return (jsObj1 === jsObj2);
	}
	else if (jsObj1 instanceof Date && jsObj2 instanceof Date)
	{
		return (jsObj1.getTime() === jsObj2.getTime());
	}
	else if (jsObj1 instanceof Array && jsObj2 instanceof Array)
	{
		if (jsObj1.length !== jsObj2.length)
			return false;

		for (var i = 0 ; i < jsObj1.length ; i++)
		{
			if (Fit.Core.IsEqual(jsObj1[i], jsObj2[i]) === false)
				return false;
		}

		return true;
	}
	else if (typeof(jsObj1) === "object" && typeof(jsObj2) === "object" && jsObj1 !== null && jsObj2 !== null) // typeof(null) returns "object"
	{
		var identical = true;
		var keys = Fit.Array.Merge(Fit.Array.GetKeys(jsObj1), Fit.Array.GetKeys(jsObj2));

		Fit.Array.ForEach(keys, function(k)
		{
			if (Fit.Core.IsEqual(jsObj1[k], jsObj2[k]) === false)
			{
				identical = false;
				return false;
			}
		});

		return identical;
	}
	else if (typeof(jsObj1) === "function" && typeof(jsObj2) === "function")
	{
		// Returns True in the following situation:
		// var f1 = function() { alert("Hello"); }
		// var f2 = f1;
		// Fit.Core.IsEqual(f1, f2);

		// Returns False in the following situation:
		// var f1 = function() { alert("Hello"); }
		// var f2 = function() { alert("Hello"); }
		// Fit.Core.IsEqual(f1, f2);

		return (jsObj1 === jsObj2);
	}

	return false;
}

/// <function container="Fit.Core" name="Merge" access="public" static="true" returns="object">
/// 	<description>
/// 		Deep merges two objects and returns the resulting object.
/// 		Take notice of the behaviour and restriction of Fit.Core.Clone(..) since
/// 		the target object is first cloned using that function. The resulting object is
/// 		then enriched with the data from the merge object.
/// 		Property values on the merge object takes precedence over property values on the
/// 		target object. Arrays are not merged but merely replaced if defined on the merge object.
/// 	</description>
/// 	<param name="targetObject" type="object"> Target object </param>
/// 	<param name="mergeObject" type="object"> Merge object </param>
/// </function>
Fit.Core.Merge = function(targetObject, mergeObject)
{
	Fit.Validation.ExpectObject(targetObject);
	Fit.Validation.ExpectObject(mergeObject);

	/* // Test data
	f1 = function() { alert("Hello"); };
	f2 = function() { alert("Hello2"); };
	x = {
		str: "Hello world",
		num: 123,
		dec: 123.321,
		num2: 1,
		num3: parseFloat("abc"),
		date: new Date("2014-12-01 13:02:23"),
		bool: true,
		bool2: false,
		arr: [100, 200, 250, 400],
		arr2: ["Hello", "world"],
		arr3: [123, "hello", true, false, new Date("1990-01-20"), [1,2,3], { x: { "hapsen": f1, "hello": new Array(1,2,3) } }],
		obj: { a: 123, b: 123.321, c: true, d: false, e: new Date("1993-06-25"), f: "hello", g: null, h: undefined, propNotFoundOnMergeObj: { name: "one", age: 11 } },
		specialProp: { x: true, y: undefined, z: null, date: new Date() },
		oneUn: undefined
	};
	y = {
		str: "Hello world 2",
		num: 222,
		dec: 222.222,
		num2: parseInt("abc"),
		num3: 22.2,
		date: new Date("2222-02-02 22:22:22"),
		bool: false,
		bool2: true,
		arr: [2, 22, 222, 2222, 22222, 2222222222],
		arr2: ["Hello2", "world2"],
		arr3: [222, "hello2", false, true, new Date("2002-02-02"), [2], { x: { "hapsen2": f2, "hello2": new Array(2,2,2,2,2,2,2,2,2,2) } }],
		obj: { a: 2, b: 2.2, c: false, d: true, e: new Date("2202-02-22"), f: "hello2", g: {}, h: null, newProp: { name: "two", age: 22, gender: "female" } },
		two: { x: 2, y: true, z: undefined },
		twoUn: undefined
	};
	var backupX = Fit.Core.Clone(x);
	var backupY = Fit.Core.Clone(y);
	var merged1 = Fit.Core.Merge(x, y);
	var merged2 = Fit.Core.Merge(y, x);
	console.log(merged1);
	console.log(merged2);
	console.log("Merges equal:", Fit.Core.IsEqual(merged1, merged2)); // Expecting False
	console.log("X untouched:", Fit.Core.IsEqual(x, backupX)); // Expecting True
	console.log("Y untouched:", Fit.Core.IsEqual(y, backupY)); // Expecting True*/

	var isObject = function(val)
	{
		return (val !== undefined && val !== null && typeof(val) === "object" && (val instanceof Date) === false && (val instanceof Array) === false);
	}

	var newObject = Fit.Core.Clone(targetObject);

	Fit.Array.ForEach(mergeObject, function(prop)
	{
		if (isObject(newObject[prop]) && isObject(mergeObject[prop]))
		{
			newObject[prop] = Fit.Core.Merge(newObject[prop], mergeObject[prop]);
		}
		else
		{
			newObject[prop] = mergeObject[prop];
		}
	});

	return newObject;
}

/// <function container="Fit.Core" name="Clone" access="public" static="true" returns="object">
/// 	<description>
/// 		Clone JavaScript object. Supported object types and values:
/// 		String, Number, Boolean, Date, Array, (JSON) Object, Function, Undefined, Null, NaN,
/// 		Infinity.
/// 		Variables defined as undefined are left out of clone,
/// 		since an undefined variable is equal to a variable defined as undefined.
/// 		Notice that Arrays and Objects can contain supported object types and values only.
/// 		Functions are considered references, and as such the cloned object will reference
/// 		the same functions.
/// 		Custom properties set on native JS objects (e.g. Array.XYZ) are not cloned, only
/// 		values are. Naturally custom (JSON) objects will be fully cloned, including all
/// 		properties. Both arrays and custom (JSON) objects are cloned recursively.
/// 		Be aware of self referencing variables and circular structures, which
/// 		will cause an infinite loop, and eventually a stack overflow exception.
/// 		DOM objects and window/frame instances are not supported.
/// 	</description>
/// 	<param name="obj" type="object"> JS object to clone </param>
/// </function>
Fit.Core.Clone = function(obj)
{
	// TODO - Known problem:
	// var a = new SomeClass();
	// var b = (a instanceOf SomeClass);
	// var c = (SMCore.Clone(a) instanceOf SomeClass);
	// Variable b is True as expected, while variable c is False!
	// TODO: Restore/preserve support for instanceof!

	// TEST CASE: Example below is supposed to return: TRUE!
	/*var f1 = function() { alert("Hello"); }
	var x =
	{
		str: "Hello world",
		num: 123,
		dec: 123.321,
		date: new Date("2014-12-01 13:02:23"),
		bool: true,
		bool2: false,
		arr: [100, 200, 250, 400],
		arr2: ["Hello", "world"],
		arr3: [123, "hello", true, false, new Date("1990-01-20"), [1,2,3], { x: { "hapsen": f1, "hello": new Array(1,2,3) } }],
		obj: { a: 123, b: 123.321, c: true, d: false, e: new Date("1993-06-25"), f: "hello", g: null, h: undefined }
	};
	var y = SMCore.Clone(x);
	console.log("Is equal: " + SMCore.IsEqual(x, y));*/

	// Clone object by serializing it into a JSON string, and parse it back into a JS object

	var serialized = JSON.stringify(obj); // Returns undefined if obj is either undefined or a function (these are not serialized)
	var clone = ((serialized !== undefined) ? JSON.parse(serialized) : serialized); // parse(..) throws error if argument is undefined

	// Fixes
	//  - Dates are serialized into strings - turn back into Date instances.
	//  - Functions are not serialized (discarded) - add function reference to clone
	//  - Number variables with a value of NaN is serialized into Null - convert to NaN

	var fixClone = null;
	fixClone = function(org, clo)
	{
		if (org instanceof Date) // Dates are turned into string representations - turn back into Date instances
		{
			return new Date(org.getTime());
		}
		else if (typeof(org) === "function") // Functions are not serialized - use same reference as original object
		{
			return org;
		}
		else if (typeof(org) === "number" && isNaN(org) === true) // NaN is turned into Null - turn back into NaN
		{
			return parseInt("");
		}
		else if (typeof(org) === "number" && org === Infinity) // Infinity is turned into Null - turn back into Infinity
		{
			return Infinity;
		}
		else if (org instanceof RegExp)
		{
			var flags = "";

			if (org.ignoreCase)
				flags += "i";
			if (org.global)
				flags += "g";
			if (org.multiline)
				flags += "m";
			if (org.sticky) // Notice that sticky is not supported in legacy IE
				flags += "y";
			
			return new RegExp(org.source, flags);
		}
		else if (org && typeof(org) === "object") // Recursively fix children (object/array)
		{
			for (var p in org)
				clo[p] = fixClone(org[p], clo[p]);
		}

		return clo;
	};

	clone = fixClone(obj, clone);

	// Done, clone is now identical to original object - SMCore.IsEqual(obj, clone) should return True

	return clone;
}


// INTERNAL

Fit._internal =
{
	Core:
	{
		VersionInfo: { Major: 1, Minor: 9, Patch: 6 } // Do NOT modify format - version numbers are programmatically changed when releasing new versions - MUST be on a separate line!
	}
};

Fit._internal.Core.EnsureStyles = function()
{
	if (Fit._internal.Core.StylesEnsured === true)
		return;

	Fit._internal.Core.StylesEnsured = true;

	Fit.Events.OnDomReady(function() // In case function is called too early in which case document.body will be null
	{
		var elm = Fit.Dom.CreateElement("<div class='FitUiStyleCheck'></div>");
		Fit.Dom.Add(document.body, elm);

		if (Fit.Dom.GetComputedStyle(elm, "width") !== "20px")
		{
			Fit.Browser.Log("Lazy loading Fit.UI stylesheet. It is recommended to add a stylesheet reference to Fit.UI.min.css to prevent temporarily unstyled content.");
			Fit.Loader.LoadStyleSheet(Fit.GetUrl() + "/Fit.UI.min.css");
		}

		Fit.Dom.Remove(elm);
	});
}

;(function()
{
	// Find Base URL - e.g. http://server.com/libs/fitui

	var src = document.scripts[document.scripts.length - 1].src;

	if (!src)
	{
		// Fit.UI was loaded dynamically as a module or bundled with e.g. WebPack.
		src = location.href;
	}

	Fit._internal.BaseUrl = src.substring(0, src.lastIndexOf("/"));

	// Calculate Base Path - e.g. / (unlikely scenario having Fit.UI located at the root though) or /libs/fitui

	var path = Fit._internal.BaseUrl.replace("http://", "").replace("https://", "");
	Fit._internal.BasePath = ((path.indexOf("/") !== -1) ? path.substring(path.indexOf("/")) : "/");
})();

/// <function container="Fit" name="GetVersion" access="public" static="true" returns="object">
/// 	<description>
/// 		Get Fit.UI version object containing the following properties:
///			Major (integer), Minor (integer), Patch (integer), Version (string representing Major.Minor.Patch).
/// 	</description>
/// </function>
Fit.GetVersion = function()
{
	var info = Fit.Core.Clone(Fit._internal.Core.VersionInfo);
	info.Version = info.Major + "." + info.Minor + "." + info.Patch;

	return info;
}

/// <function container="Fit" name="GetUrl" access="public" static="true" returns="string">
/// 	<description> Get fully qualified URL to Fit.UI on server - e.g. http://server.com/libs/fitui </description>
/// </function>
Fit.GetUrl = function()
{
	if (Fit._internal.BaseUrlOverride !== undefined)
		return Fit._internal.BaseUrlOverride;

	return Fit._internal.BaseUrl;
}

/// <function container="Fit" name="GetPath" access="public" static="true" returns="string">
/// 	<description> Get absolute path to Fit.UI on server - e.g. /libs/fitui </description>
/// </function>
Fit.GetPath = function()
{
	if (Fit._internal.BasePathOverride !== undefined)
		return Fit._internal.BasePathOverride;

	return Fit._internal.BasePath;
}

/// <function container="Fit" name="SetPath" access="public" static="true">
/// 	<description>
/// 		Set path to Fit.UI on server - e.g. libs/fitui.
/// 		This may be necessary if Fit.UI is loaded dynamically
/// 		using RequireJS or bundled using e.g. WebPack.
/// 		Changing the path affects the return value of both
/// 		GetUrl() and GetPath(), and from where Fit.UI will
/// 		load resources dynamically.
/// 	</description>
/// 	<param name="basePath" type="string"> Absolute or relative path to folder containing Fit.UI </param>
/// </function>
Fit.SetPath = function(basePath)
{
	Fit.Validation.ExpectStringValue((basePath === null ? "-" : basePath));

	if (basePath === null)
	{
		delete Fit._internal.BasePathOverride;
		delete Fit._internal.BaseUrlOverride;

		return;
	}

	// Remove trailing slash if found
	if (basePath !== "/" && basePath.lastIndexOf("/") === basePath.length - 1)
	{
		basePath = basePath.substring(0, basePath.length - 1);
	}

	var rootUrl = location.protocol + "//" + location.host; // E.g. http://my-domain.com

	// Both GetPath() and GetUrl() return values without trailing slashes.
	// E.g. libs/fitui and http://host/libs/fitui.
	// However, when installed to the root, this is indicated by a slash returned
	// from GetPath() while GetUrl() keeps returning a URL without a trailing slash.
	// E.g. / and http://my-domain.com.

	Fit._internal.BasePathOverride = basePath;

	if (basePath === "/")
	{
		Fit._internal.BaseUrlOverride = rootUrl; //curUrl;
	}
	else if (basePath.indexOf("/") === 0) // Absolute path
	{
		Fit._internal.BaseUrlOverride = rootUrl + basePath;
	}
	else // Relative path
	{
		var curPath = location.pathname.substring(0, location.pathname.lastIndexOf("/")); // E.g. "" (empty for root) or /path/to/folder
		Fit._internal.BaseUrlOverride = rootUrl + curPath + "/" + basePath;
	}
}

/// <function container="Fit" name="SetUrl" access="public" static="true">
/// 	<description>
/// 		Set URL to Fit.UI on server - e.g. http://cdn/libs/fitui/.
/// 		This may be necessary if Fit.UI is loaded dynamically
/// 		from a foreign domain such as a CDN (Content Delivery Network).
/// 		Changing the URL affects the return value of both
/// 		GetUrl() and GetPath(), and from where Fit.UI will
/// 		load resources dynamically.
/// 	</description>
/// 	<param name="baseUrl" type="string"> Full URL to folder containing Fit.UI </param>
/// </function>
Fit.SetUrl = function(baseUrl) // E.g. http://foreign-host/path/to/Fit.UI/
{
	Fit.Validation.ExpectStringValue((baseUrl === null ? "-" : baseUrl));

	if (baseUrl === null)
	{
		Fit.SetPath(null); // Reset Path and URL overriding
		return;
	}

	var url = Fit.Browser.ParseUrl(baseUrl);

	Fit.SetPath(url.FullPath); // Using FullPath rather than Path in case URL has been specified using http://host/path/to/Fit.UI (without trailing slash which makes Fit.UI a resource and not a folder, resulting in it being excluded from Path)
	
	var newUrl = (url.Url.lastIndexOf("/") === url.Url.length - 1 ? url.Url.substring(0, url.Url.length - 1) : url.Url); // Both GetPath() and GetUrl() return values without trailing slashes - e.g. libs/fitui and http://host/libs/fitui - so make sure no trailing slash is present
	Fit._internal.BaseUrlOverride = newUrl;
}

/// <container name="Fit.Validation">
/// 	Validation logic
/// </container>
Fit.Validation = {};

Fit._internal.Validation = {};
Fit._internal.Validation.DebugMode = true;
Fit._internal.Validation.Clone = null;

// Ensure object types not found in all browsers
(function()
{
	// window.event is of type MSEventObj in IE9 and above.
	// Type used by Fit.Validation.ExpectEvent.
	if (!window.MSEventObj)
		window.MSEventObj = function() {};

	// StaticNodeList type is produced by document.querySelectorAll(..) in Legacy IE.
	// FileList type is not defined in Legacy IE.
	// These types are used by Fit._internal.Validation.IsCollectionType.
	if (!window.StaticNodeList)
		window.StaticNodeList = function() {};
	if (!window.FileList)
		window.FileList = function() {};

	// File type not defined in Legacy IE.
	// Make sure we can use Fit.Validation.ExpectInstance(selectedFileFromInput, File, true)
	if (!window.File)
		window.File = function() {};
})();

// ==========================================================
// Type checking
// ==========================================================

/// <function container="Fit.Validation" name="ExpectObject" access="public" static="true">
/// 	<description> Throws error if passed object is not a valid object such as { Name: 'Jimmy', Age: 34 } </description>
/// 	<param name="val" type="object"> Object to validate </param>
/// 	<param name="allowNotSet" type="boolean" default="false"> Set True to allow object to be Null or Undefined </param>
/// </function>
Fit.Validation.ExpectObject = function(val, allowNotSet)
{
	if (allowNotSet === true && (val === undefined || val === null))
		return;

	if (!val || val.constructor !== Object)
		Fit.Validation.ThrowError("Value '" + val + "' is not a valid object");
}

/// <function container="Fit.Validation" name="ExpectNumber" access="public" static="true">
/// 	<description> Throws error if passed object is not a number </description>
/// 	<param name="val" type="object"> Object to validate </param>
/// 	<param name="allowNotSet" type="boolean" default="false"> Set True to allow object to be Null or Undefined </param>
/// </function>
Fit.Validation.ExpectNumber = function(val, allowNotSet)
{
	if (allowNotSet === true && (val === undefined || val === null))
		return;

	if (typeof(val) !== "number" || isNaN(val) === true)
		Fit.Validation.ThrowError("Value '" + val + "' is not a valid number");
}

/// <function container="Fit.Validation" name="ExpectInteger" access="public" static="true">
/// 	<description> Throws error if passed object is not an integer </description>
/// 	<param name="val" type="object"> Object to validate </param>
/// 	<param name="allowNotSet" type="boolean" default="false"> Set True to allow object to be Null or Undefined </param>
/// </function>
Fit.Validation.ExpectInteger = function(val, allowNotSet)
{
	if (allowNotSet === true && (val === undefined || val === null))
		return;

	if (typeof(val) !== "number" || val % 1 !== 0)
		Fit.Validation.ThrowError("Value '" + val + "' is not a valid integer");
}

/// <function container="Fit.Validation" name="ExpectString" access="public" static="true">
/// 	<description> Throws error if passed object is not a string </description>
/// 	<param name="val" type="object"> Object to validate </param>
/// 	<param name="allowNotSet" type="boolean" default="false"> Set True to allow object to be Null or Undefined </param>
/// </function>
Fit.Validation.ExpectString = function(val, allowNotSet)
{
	if (allowNotSet === true && (val === undefined || val === null))
		return;

	if (typeof(val) !== "string")
		Fit.Validation.ThrowError("Value '" + val + "' is not a valid string");
}

/// <function container="Fit.Validation" name="ExpectStringValue" access="public" static="true">
/// 	<description> Same as Fit.Validation.ExpectString(..), but string must contain an actual value if set (not be empty) </description>
/// 	<param name="val" type="object"> Object to validate </param>
/// 	<param name="allowNotSet" type="boolean" default="false"> Set True to allow object to be Null or Undefined </param>
/// </function>
Fit.Validation.ExpectStringValue = function(val, allowNotSet)
{
	if (allowNotSet === true && (val === undefined || val === null))
		return;

	Fit.Validation.ExpectString(val);

	if (val === "")
		Fit.Validation.ThrowError("String cannot be empty");
}

/// <function container="Fit.Validation" name="ExpectBoolean" access="public" static="true">
/// 	<description> Throws error if passed object is not a boolean </description>
/// 	<param name="val" type="object"> Object to validate </param>
/// 	<param name="allowNotSet" type="boolean" default="false"> Set True to allow object to be Null or Undefined </param>
/// </function>
Fit.Validation.ExpectBoolean = function(val, allowNotSet)
{
	if (allowNotSet === true && (val === undefined || val === null))
		return;

	if (typeof(val) !== "boolean")
		Fit.Validation.ThrowError("Value '" + val + "' is not a valid boolean");
}

/// <function container="Fit.Validation" name="ExpectDate" access="public" static="true">
/// 	<description> Throws error if passed object is not an instance of Date </description>
/// 	<param name="val" type="object"> Object to validate </param>
/// 	<param name="allowNotSet" type="boolean" default="false"> Set True to allow object to be Null or Undefined </param>
/// </function>
Fit.Validation.ExpectDate = function(val, allowNotSet)
{
	if (allowNotSet === true && (val === undefined || val === null))
		return;

	if ((val instanceof Date) === false)
		Fit.Validation.ThrowError("Value '" + val + "' is not an instance of Date");
}

/// <function container="Fit.Validation" name="ExpectArray" access="public" static="true">
/// 	<description> Throws error if passed object is not an instance of Array </description>
/// 	<param name="val" type="object"> Object to validate </param>
/// 	<param name="allowNotSet" type="boolean" default="false"> Set True to allow object to be Null or Undefined </param>
/// </function>
Fit.Validation.ExpectArray = function(val, allowNotSet)
{
	if (allowNotSet === true && (val === undefined || val === null))
		return;

	if ((val instanceof Array) === false)
		Fit.Validation.ThrowError("Value '" + val + "' is not an instance of Array");
}

/// <function container="Fit.Validation" name="ExpectTypeArray" access="public" static="true">
/// 	<description>
/// 		Throws error if passed object is not an instance of Array
/// 		contaning only objects/values of type given by validation callback.
/// 		Example: Fit.Validation.ExpectTypeArray(arr, Fit.Validation.ExpectString)
/// 	</description>
/// 	<param name="val" type="object"> Object to validate </param>
/// 	<param name="typeValCallback" type="function"> Value validation callback </param>
/// 	<param name="allowNotSet" type="boolean" default="false"> Set True to allow object to be Null or Undefined </param>
/// </function>
Fit.Validation.ExpectTypeArray = function(val, typeValCallback, allowNotSet)
{
	if (allowNotSet === true && (val === undefined || val === null))
		return;

	if ((val instanceof Array) === false)
		Fit.Validation.ThrowError("Value '" + val + "' is not an instance of Array");

	// Validate types within array

	Fit.Validation.ExpectFunction(typeValCallback); // Make sure callback is valid

	Fit.Array.ForEach(val, function(v)
	{
		typeValCallback(v);
	});
}

/// <function container="Fit.Validation" name="ExpectInstanceArray" access="public" static="true">
/// 	<description>
/// 		Throws error if passed object is not an instance of Array
/// 		contaning only instances of specified type. Example:
/// 		Fit.Validation.ExpectInstanceArray(arr, Fit.Controls.TreeViewNode)
/// 	</description>
/// 	<param name="val" type="object"> Object to validate </param>
/// 	<param name="instanceType" type="object"> Instance type (constructor, e.g. Fit.Http.Request) </param>
/// 	<param name="allowNotSet" type="boolean" default="false"> Set True to allow object to be Null or Undefined </param>
/// </function>
Fit.Validation.ExpectInstanceArray = function(val, instanceType, allowNotSet)
{
	if (allowNotSet === true && (val === undefined || val === null))
		return;

	if ((val instanceof Array) === false)
		Fit.Validation.ThrowError("Value '" + val + "' is not an instance of Array");

	// Validate types within array

	Fit.Array.ForEach(val, function(v)
	{
		Fit.Validation.ExpectInstance(v, instanceType);
	});
}

/// <function container="Fit.Validation" name="ExpectCollection" access="public" static="true">
/// 	<description> Throws error if passed object is not a collection that can be iterated </description>
/// 	<param name="val" type="object"> Object to validate </param>
/// 	<param name="allowNotSet" type="boolean" default="false"> Set True to allow object to be Null or Undefined </param>
/// </function>
Fit.Validation.ExpectCollection = function(val, allowNotSet)
{
	if (allowNotSet === true && (val === undefined || val === null))
		return;

	if (Fit._internal.Validation.IsCollectionType(val) === false)
		Fit.Validation.ThrowError("Value '" + val + "' is not a valid collection");
}

/// <function container="Fit.Validation" name="ExpectRegExp" access="public" static="true">
/// 	<description> Throws error if passed object is not an instance of RegExp </description>
/// 	<param name="val" type="object"> Object to validate </param>
/// 	<param name="allowNotSet" type="boolean" default="false"> Set True to allow object to be Null or Undefined </param>
/// </function>
Fit.Validation.ExpectRegExp = function(val, allowNotSet)
{
	if (allowNotSet === true && (val === undefined || val === null))
		return;

	if (val instanceof RegExp === false)
		Fit.Validation.ThrowError("Value '" + val + "' is not an instance of RegExp");
}

/// <function container="Fit.Validation" name="ExpectElement" access="public" static="true">
/// 	<description> Throws error if passed object is not an instance of HTMLElement </description>
/// 	<param name="val" type="object"> Object to validate </param>
/// 	<param name="allowNotSet" type="boolean" default="false"> Set True to allow object to be Null or Undefined </param>
/// </function>
Fit.Validation.ExpectElement = function(val, allowNotSet) // DOMElement (actually HTMLElement)
{
	// All elements within the HTML DOM tree inherits from Element except for Comments, CDATA, and Text nodes.
	// But most elements from an XML document (also excluding Comments, CDATA, and Text nodes) also
	// inherit from Element.
	// (new DOMParser()).parseFromString("<root></root>", "text/xml").getElementsByTagName("root")[0] instanceof Element; // Returns true
	// However, Fit.UI is for building HTML applications, and is therefore not expected to handle XML elements.
	// Therefore, despite the function name ExpectElement, it actually ensures that the passed element is an instance of HTMLElement.
	// (new DOMParser()).parseFromString("<root></root>", "text/xml").getElementsByTagName("root")[0] instanceof HTMLElement; // Returns false

	// More about HTMLElement vs Element vs Node, as well as the nodeType property:
	// https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement
	// https://developer.mozilla.org/en-US/docs/Web/API/Element
	// https://developer.mozilla.org/en-US/docs/Web/API/Node
	// https://developer.mozilla.org/en-US/docs/Web/API/Node/nodeType
	// The inheritance chain looks like this: EventTarget <= Node <= Element <= HTMLElement

	if (allowNotSet === true && (val === undefined || val === null))
		return;

	// The HTMLElement interface is not available in legacy IE, in which case we use feature detection instead
	if ((window.HTMLElement && (val instanceof HTMLElement) === false) || (val instanceof Element) === false || (val.style instanceof CSSStyleDeclaration) === false)
		Fit.Validation.ThrowError("Value '" + val + "' is not an HTMLElement");
}
Fit.Validation.ExpectDomElement = Fit.Validation.ExpectElement;		// Backward compatibility
Fit.Validation.ExpectElementNode = Fit.Validation.ExpectElement;	// Backward compatibility

// DISABLED - not in use internally, and not supported by legacy IE
// <function container="Fit.Validation" name="ExpectTextNode" access="public" static="true">
// 	<description> Throws error if passed object is not an instance of Text </description>
// 	<param name="val" type="object"> Object to validate </param>
// 	<param name="allowNotSet" type="boolean" default="false"> Set True to allow object to be Null or Undefined </param>
// </function>
/*Fit.Validation.ExpectTextNode = function(val, allowNotSet) // DOMText
{
	if (allowNotSet === true && (val === undefined || val === null))
		return;

	if ((val instanceof Text) === false)
		Fit.Validation.ThrowError("Value '" + val + "' is not a Text node");
}*/

// DISABLED - not in use internally, and not supported by legacy IE
// <function container="Fit.Validation" name="ExpectCommentNode" access="public" static="true">
// 	<description> Throws error if passed object is not an instance of Comment </description>
// 	<param name="val" type="object"> Object to validate </param>
// 	<param name="allowNotSet" type="boolean" default="false"> Set True to allow object to be Null or Undefined </param>
// </function>
/*Fit.Validation.ExpectCommentNode = function(val, allowNotSet) // DOMComment
{
	if (allowNotSet === true && (val === undefined || val === null))
		return;

	if ((val instanceof Comment) === false)
		Fit.Validation.ThrowError("Value '" + val + "' is not a Comment node");
}*/

/// <function container="Fit.Validation" name="ExpectNode" access="public" static="true">
/// 	<description> Throws error if passed object is not an instance of Element, Text, or Comment </description>
/// 	<param name="val" type="object"> Object to validate </param>
/// 	<param name="allowNotSet" type="boolean" default="false"> Set True to allow object to be Null or Undefined </param>
/// </function>
Fit.Validation.ExpectNode = function(val, allowNotSet) // DOMNode
{
	if (allowNotSet === true && (val === undefined || val === null))
		return;

	// The Text and Comment interfaces are not available in legacy IE so we use feature detection instead.
	// We assume we have a valid Node instance if it exposes common functions and properties of a Node instance,
	// and has the appropriate nodeType: 1 = Element, 3 = Text, 8 = Comment. More on node types here:
	// https://developer.mozilla.org/en-US/docs/Web/API/Node/nodeType
	if (!val.cloneNode || !val.nodeName || !val.nodeType || (val.nodeType !== 1 && val.nodeType !== 3 && val.nodeType !== 8))
		Fit.Validation.ThrowError("Value '" + val + "' is not a Node (Element, Text, or Comment)");
}

// <function container="Fit.Validation" name="ExpectTextNode" access="public" static="true">
// 	<description> Throws error if passed object is not an instance of Text </description>
// 	<param name="val" type="object"> Object to validate </param>
// 	<param name="allowNotSet" type="boolean" default="false"> Set True to allow object to be Null or Undefined </param>
// </function>
Fit.Validation.ExpectTextNode = function(val, allowNotSet)
{
	if (allowNotSet === true && (val === undefined || val === null))
		return;

	// The Text interface is not available in legacy IE so we use feature detection instead.
	// We assume we have a valid Node instance if it exposes common functions and properties of a Node instance,
	// and has the appropriate nodeType: 1 = Element, 3 = Text, 8 = Comment. More on node types here:
	// https://developer.mozilla.org/en-US/docs/Web/API/Node/nodeType
	if (!val.cloneNode || !val.nodeName || val.nodeType !== 3)
		Fit.Validation.ThrowError("Value '" + val + "' is not a Text node");
}

// <function container="Fit.Validation" name="ExpectContentNode" access="public" static="true">
// 	<description> Throws error if passed object is not an instance of Element or Text </description>
// 	<param name="val" type="object"> Object to validate </param>
// 	<param name="allowNotSet" type="boolean" default="false"> Set True to allow object to be Null or Undefined </param>
// </function>
/*Fit.Validation.ExpectContentNode = function(val, allowNotSet)
{
	if (allowNotSet === true && (val === undefined || val === null))
		return;

	if ((val instanceof Element) === false && (val instanceof Text) === false)
		Fit.Validation.ThrowError("Value '" + val + "' is not a Content Node (Element or Text)");
}*/

/// <function container="Fit.Validation" name="ExpectWindow" access="public" static="true">
/// 	<description> Throws error if passed object is not an instance of Window </description>
/// 	<param name="val" type="object"> Object to validate </param>
/// 	<param name="allowNotSet" type="boolean" default="false"> Set True to allow object to be Null or Undefined </param>
/// </function>
Fit.Validation.ExpectWindow = function(val, allowNotSet)
{
	if (allowNotSet === true && (val === undefined || val === null))
		return;

	if ((val instanceof Window) === false)
		Fit.Validation.ThrowError("Value '" + val + "' is not an instance of Window");
}

/// <function container="Fit.Validation" name="ExpectFunction" access="public" static="true">
/// 	<description> Throws error if passed object is not a valid function </description>
/// 	<param name="val" type="object"> Object to validate </param>
/// 	<param name="allowNotSet" type="boolean" default="false"> Set True to allow object to be Null or Undefined </param>
/// </function>
Fit.Validation.ExpectFunction = function(val, allowNotSet)
{
	if (allowNotSet === true && (val === undefined || val === null))
		return;

	if (typeof(val) !== "function")
		Fit.Validation.ThrowError("Value '" + val + "' is not a valid function");
}

/// <function container="Fit.Validation" name="ExpectEventTarget" access="public" static="true">
/// 	<description> Throws error if passed object is not an instance of EventTarget </description>
/// 	<param name="val" type="object"> Object to validate </param>
/// 	<param name="allowNotSet" type="boolean" default="false"> Set True to allow object to be Null or Undefined </param>
/// </function>
Fit.Validation.ExpectEventTarget = function(val, allowNotSet)
{
	if (allowNotSet === true && (val === undefined || val === null))
		return;

	if (typeof(EventTarget) !== "undefined" && (val instanceof EventTarget) === false)
		Fit.Validation.ThrowError("Value '" + val + "' is not an instance of EventTarget");
	else if (!val.removeEventListener && !val.attachEvent) // IE8
		Fit.Validation.ThrowError("Value '" + val + "' is not an instance of EventTarget");
}

/// <function container="Fit.Validation" name="ExpectEvent" access="public" static="true">
/// 	<description> Throws error if passed object is not an instance of Event </description>
/// 	<param name="val" type="object"> Object to validate </param>
/// 	<param name="allowNotSet" type="boolean" default="false"> Set True to allow object to be Null or Undefined </param>
/// </function>
Fit.Validation.ExpectEvent = function(val, allowNotSet)
{
	if (allowNotSet === true && (val === undefined || val === null))
		return;

	// IE9 and above: window.event is now of type MSEventObj (legacy),
	// while an actual Event instance is passed to handlers as specified by W3C.
	if ((val instanceof Event) === false && (val instanceof MSEventObj) === false)
		Fit.Validation.ThrowError("Value '" + val + "' is not an instance of Event");
}

/// <function container="Fit.Validation" name="ExpectInstance" access="public" static="true">
/// 	<description> Throws error if passed object is not an instance of specified type </description>
/// 	<param name="val" type="object"> Object to validate </param>
/// 	<param name="instanceType" type="object"> Instance type (constructor, e.g. Fit.Http.Request) </param>
/// 	<param name="allowNotSet" type="boolean" default="false"> Set True to allow object to be Null or Undefined </param>
/// </function>
Fit.Validation.ExpectInstance = function(val, instanceType, allowNotSet)
{
	if (allowNotSet === true && (val === undefined || val === null))
		return;

	if ((val instanceof instanceType) === true || Fit.Core.Extends(val, instanceType) === true)
		return;

	Fit.Validation.ThrowError("Unsupported object type passed");
}

/// <function container="Fit.Validation" name="ExpectIsSet" access="public" static="true">
/// 	<description> Throws error if passed object is either Null or Undefined </description>
/// 	<param name="val" type="object"> Object to validate </param>
/// </function>
Fit.Validation.ExpectIsSet = function(val)
{
	if (Fit.Validation.IsSet(val) === false)
		Fit.Validation.ThrowError("Value not set");
}

// ==========================================================
// Misc.
// ==========================================================

/// <function container="Fit.Validation" name="IsSet" access="public" static="true">
/// 	<description> Returns True if specified object is set (not Null or Undefined), otherwise False </description>
/// 	<param name="val" type="object"> Object to validate </param>
/// </function>
Fit.Validation.IsSet = function(obj)
{
	return (obj !== null && obj !== undefined);
}

/// <function container="Fit.Validation" name="ThrowError" access="public" static="true">
/// 	<description> Throw error and provide stack trace to browser console </description>
/// 	<param name="msg" type="object"> Object to validate </param>
/// </function>
Fit.Validation.ThrowError = function(msg)
{
	if (Fit._internal.Validation.DebugMode === true)
	{
		var stackTrace = Fit.Validation.GetStackTrace();
		alert("ThrowError: " + msg + ((stackTrace !== "") ? "\n\n" : "") + stackTrace);

		if (window.console && console.trace)
			console.trace();
	}

	throw new Error(msg); // Never change this behaviour - we should always re-throw the error to terminate execution
}

Fit.Validation.GetStackTrace = function()
{
	if (window.Error === undefined || Error.captureStackTrace === undefined)
		return "";

	var obj = {};
	Error.captureStackTrace(obj, Fit.Validation.GetStackTrace);
	return obj.stack;
}

// ==========================================================
// DebugMode (enable/disable type checking)
// ==========================================================

/// <function container="Fit.Validation" name="Enabled" access="public" static="true">
/// 	<description> Set or get flag indicating whether type checking should take place (DebugMode) </description>
/// 	<param name="val" type="boolean"> True enables DebugMode, False disables DebugMode </param>
/// </function>
Fit.Validation.Enabled = function(val)
{
	if (Fit.Validation.IsSet(val) === true)
	{
		if (val === true)
		{
			Fit._internal.Validation.DebugMode = true;

			if (Fit._internal.Validation.Clone !== null) // Null if Debug Mode is already enabled
				Fit.Validation = Fit.Core.Clone(Fit._internal.Validation.Clone);
		}
		else
		{
			Fit._internal.Validation.DebugMode = false;

			if (Fit._internal.Validation.Clone === null)
				Fit._internal.Validation.Clone = Fit.Core.Clone(Fit.Validation);

			// Replace all type checking functions when Debug Mode is disabled
			for (var f in Fit.Validation)
				if (f.indexOf("Expect") === 0)
					Fit.Validation[f] = function() {}
		}
	}

	return (Fit._internal.Validation.DebugMode === true);
}

// ==========================================================
// Internal
// ==========================================================

Fit._internal.Validation.IsCollectionType = function(val) // Used by Fit.Validation and Fit.Array
{
	if (val === null || val === undefined)
		return false;
	else if (val instanceof Array)
		return true;
	else if (val instanceof NodeList)
		return true;
	else if (val instanceof StaticNodeList)
		return true;
	else if (val instanceof HTMLCollection)
		return true;
	else if (val instanceof FileList)
		return true;
	else if (val instanceof StyleSheetList)
		return true;
	else if (val instanceof CSSRuleList)
		return true;
	else if (val.callee && val.length !== null && val.length !== undefined) // Arguments array - https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Functions/arguments
		return true;

	return false;

	/*if (val === null || val === undefined)
		return false;
	if ((val instanceof NodeList) === false && (val instanceof StaticNodeList) === false && (val instanceof FileList) === false && (val instanceof HTMLCollection) === false && (val instanceof Array) === false && (!val.callee && (val.length === undefined || val.length === null)))
		return false;
	return true;*/
}

/// <container name="Fit.Array">
/// 	Functionality extending the capabilities of native JS arrays
/// </container>
Fit.Array = {};

/// <function container="Fit.Array" name="ForEach" access="public" static="true" returns="boolean">
/// 	<description>
/// 		Iterates through elements in array and passes each value to the provided callback function.
/// 		Returns boolean indicating whether iteration was carried through (True) or interrupted (False).
/// 	</description>
/// 	<param name="arr" type="array"> Array containing values to iterate through </param>
/// 	<param name="callback" type="function">
/// 		Callback function accepting values from the array, passed in turn.
/// 		Return False from callback to break loop.
/// 	</param>
/// </function>
/// <function container="Fit.Array" name="ForEach" access="public" static="true" returns="boolean">
/// 	<description>
/// 		Iterates through object properties and passes each property name to the provided callback function.
/// 		Returns boolean indicating whether iteration was carried through (True) or interrupted (False).
/// 	</description>
/// 	<param name="obj" type="object"> Object containing properties to iterate through </param>
/// 	<param name="callback" type="function">
/// 		Callback function accepting properties from the object, passed in turn.
/// 		Return False from callback to break loop.
/// 	</param>
/// </function>
Fit.Array.ForEach = function(obj, callback) // obj not validated - passing null/undefined is allowed - no iteration is performed in this case
{
	Fit.Validation.ExpectFunction(callback);

	if (Fit._internal.Validation.IsCollectionType(obj) === true)
	{
		var count = obj.length;
		var res = false;

		for (var i = 0 ; i < obj.length ; i++)
		{
			res = callback(obj[i]);

			if (obj.length !== count)
				Fit.Validation.ThrowError("Collection was modified while iterating objects");

			if (res === false)
				return false;
		}
	}
	else if (typeof(obj) === "object")
	{
		for (var i in obj) // Object array is not vulnerable to changes in callback - properties removed or added are not iterated
			if (callback(i) === false)
				return false;
	}

	return true;
}

/// <function container="Fit.Array" name="Count" access="public" static="true" returns="integer">
/// 	<description> Returns number of elements in collection </description>
/// 	<param name="arr" type="array"> Collection to count elements within </param>
/// </function>
/// <function container="Fit.Array" name="Count" access="public" static="true" returns="integer">
/// 	<description> Returns number of elements in object array </description>
/// 	<param name="obj" type="object"> Object array to count elements within </param>
/// </function>
Fit.Array.Count = function(obj)
{
	if (Fit._internal.Validation.IsCollectionType(obj) === true)
	{
		return obj.length;
	}
	else if (typeof(obj) === "object")
	{
		var count = 0;

		for (var i in obj)
			count++;

		return count;
	}

	Fit.Validation.ThrowError("Unsupported collection type passed - unable to determine number of contained elements");
}

/// <function container="Fit.Array" name="HasItems" access="public" static="true" returns="boolean">
/// 	<description> Returns True if collection has items, otherwise False </description>
/// 	<param name="arr" type="array"> Collection to investigate </param>
/// </function>
/// <function container="Fit.Array" name="HasItems" access="public" static="true" returns="boolean">
/// 	<description> Returns True if collection has items, otherwise False </description>
/// 	<param name="obj" type="object"> Object array to investigate </param>
/// </function>
Fit.Array.HasItems = function(obj)
{
	if (Fit._internal.Validation.IsCollectionType(obj) === true)
	{
		return obj.length > 0;
	}
	else if (typeof(obj) === "object")
	{
		for (var i in obj)
		{
			return true;
		}

		return false;
	}

	Fit.Validation.ThrowError("Unsupported collection type passed - unable to determine number of contained elements");
}

/// <function container="Fit.Array" name="Recurse" access="public" static="true" returns="boolean">
/// 	<description>
/// 		Recursively iterates through objects in array and passes each object to the provided callback function.
/// 		Returns boolean indicating whether recursion was carried through (True) or interrupted (False).
/// 	</description>
/// 	<param name="arr" type="array"> Array containing objects to iterate through </param>
/// 	<param name="childrenProperty" type="string">
/// 		Name of property or argumentless getter function returning children (e.g. "Children" or "GetChildren")
/// 	</param>
/// 	<param name="callback" type="function">
/// 		Callback function accepting objects from the array, passed in turn.
/// 		Return False from callback to break loop.
/// 	</param>
/// </function>
Fit.Array.Recurse = function(arr, childrenProperty, callback)
{
	Fit.Validation.ExpectCollection(arr, true);
	Fit.Validation.ExpectStringValue(childrenProperty);
	Fit.Validation.ExpectFunction(callback);

	if (Fit.Validation.IsSet(arr) === false)
		return true;

	var count = arr.length;

	for (var i = 0 ; i < arr.length ; i++)
	{
		if (arr.length !== count)
			Fit.Validation.ThrowError("Collection was modified while iterating objects");

		if (callback(arr[i]) === false)
			return false;

		if (Fit.Validation.IsSet(arr[i][childrenProperty]) === false)
			continue;

		if (arr[i][childrenProperty] instanceof Function)
		{
			if (Fit.Array.Recurse(arr[i][childrenProperty](), childrenProperty, callback) === false)
				return false;
		}
		else
		{
			if (Fit.Array.Recurse(arr[i][childrenProperty], childrenProperty, callback) === false)
				return false;
		}
	}

	return true;
}

/// <function container="Fit.Array" name="CustomRecurse" access="public" static="true" returns="boolean">
/// 	<description>
/// 		Iterate objects in collection and pass each object to provided callback.
/// 		Callback is expected to return any children supposed to be iterated too, or Null
/// 		if further/deeper iteration is not necessary.
/// 	</description>
/// 	<param name="arr" type="array"> Array containing objects to iterate through </param>
/// 	<param name="callback" type="function">
/// 		Callback function accepting objects from the array, passed in turn.
/// 		Function must return children collection to continue recursive operation,
/// 		or Null to prevent further processing.
/// 	</param>
/// </function>
Fit.Array.CustomRecurse = function(arr, callback) // arr not validated - passing null/undefined is allowed - no iteration is performed in this case
{
	Fit.Validation.ExpectFunction(callback);

	if (arr !== undefined && arr !== null && Fit._internal.Validation.IsCollectionType(arr) === false)
		Fit.Validation.ThrowError("Unexpected collection type passed"); // CustomRecurse does not support iterating object arrays like ForEach does

	Fit.Array.ForEach(arr, function(o)
	{
		Fit.Array.CustomRecurse(callback(o), callback);
	});
}

/// <function container="Fit.Array" name="Add" access="public" static="true">
/// 	<description> Add object to array </description>
/// 	<param name="arr" type="array"> Array to which object is added </param>
/// 	<param name="obj" type="object"> Object to add to array </param>
/// </function>
Fit.Array.Add = function(arr, obj) // obj not validated - passing any object or undefined/null is allowed
{
	Fit.Validation.ExpectArray(arr);
    arr.push(obj);
}

/// <function container="Fit.Array" name="Insert" access="public" static="true">
/// 	<description> Insert object into array at specified index </description>
/// 	<param name="arr" type="array"> Array into which object is inserted </param>
/// 	<param name="idx" type="integer"> Index to insert object at </param>
/// 	<param name="obj" type="object"> Object to insert into array </param>
/// </function>
Fit.Array.Insert = function(arr, idx, obj) // obj not validated - passing any object or undefined/null is allowed
{
	Fit.Validation.ExpectArray(arr);
	Fit.Validation.ExpectInteger(idx);
    arr.splice(idx, 0, obj);
}

/// <function container="Fit.Array" name="Move" access="public" static="true">
/// 	<description> Move object within array from one position to another </description>
/// 	<param name="arr" type="array"> Array to manipulate </param>
/// 	<param name="fromIdx" type="integer"> Position of object to move </param>
/// 	<param name="ToIdx" type="integer"> New object position </param>
/// </function>
Fit.Array.Move = function(arr, fromIdx, toIdx)
{
	Fit.Validation.ExpectArray(arr);
	Fit.Validation.ExpectInteger(fromIdx);
	Fit.Validation.ExpectInteger(toIdx);

	if (fromIdx < arr.length)
	{
		// If toIdx is below 0 (zero) the object will be added at the beginning of the array.
		// If toIdx is greater than the length of the array, the object will be added at the end of the array.

		var obj = arr[fromIdx];
		Fit.Array.RemoveAt(arr, fromIdx);
		Fit.Array.Insert(arr, toIdx > 0 ? toIdx : 0, obj);
	}
}

/// <function container="Fit.Array" name="Merge" access="public" static="true" returns="array">
/// 	<description> Merge/join two arrays </description>
/// 	<param name="arr1" type="array"> Array 1 to merge with array 2 </param>
/// 	<param name="arr2" type="array"> Array 2 to merge with array 1 </param>
/// </function>
Fit.Array.Merge = function(arr1, arr2)
{
	Fit.Validation.ExpectArray(arr1);
	Fit.Validation.ExpectArray(arr2);
    return arr1.concat(arr2);
}

/// <function container="Fit.Array" name="Remove" access="public" static="true">
/// 	<description> Remove object from array </description>
/// 	<param name="arr" type="array"> Array from which object is remove </param>
/// 	<param name="obj" type="object"> Object to remove from array </param>
/// </function>
Fit.Array.Remove = function(arr, obj) // obj not validated - passing any object or undefined/null is allowed
{
	Fit.Validation.ExpectArray(arr);

    var idx = Fit.Array.GetIndex(arr, obj);
    if (idx !== -1)
        arr.splice(idx, 1);
}

/// <function container="Fit.Array" name="RemoveAt" access="public" static="true">
/// 	<description> Remove object from array at specified index </description>
/// 	<param name="arr" type="array"> Array from which object is remove </param>
/// 	<param name="idx" type="integer"> Object index in array </param>
/// </function>
Fit.Array.RemoveAt = function(arr, idx)
{
	Fit.Validation.ExpectArray(arr);
	Fit.Validation.ExpectInteger(idx);
    arr.splice(idx, 1);
}

/// <function container="Fit.Array" name="Clear" access="public" static="true">
/// 	<description> Clear all items from array </description>
/// 	<param name="arr" type="array"> Array from which all objects are remove </param>
/// </function>
Fit.Array.Clear = function(arr)
{
	Fit.Validation.ExpectArray(arr);
    arr.length = 0; // http://jsperf.com/array-destroy/151
}

/// <function container="Fit.Array" name="GetIndex" access="public" static="true" returns="integer">
/// 	<description> Returns index of object in array if found, otherwise a value of -1 is returned </description>
/// 	<param name="arr" type="array"> Array to search through </param>
/// 	<param name="obj" type="object"> Object to obtain index for </param>
/// </function>
Fit.Array.GetIndex = function(arr, obj) // obj not validated - passing any object or undefined/null is allowed
{
	Fit.Validation.ExpectCollection(arr);

    for (var i = 0 ; i < arr.length ; i++)
        if (arr[i] === obj)
            return i;

    return -1;
}

/// <function container="Fit.Array" name="GetKeys" access="public" static="true" returns="array">
/// 	<description> Returns all keys in array (indices) - 0, 1, 2, 3, ... </description>
/// 	<param name="arr" type="array"> Array to get keys from </param>
/// </function>
/// <function container="Fit.Array" name="GetKeys" access="public" static="true" returns="array">
/// 	<description> Returns all keys (property names) in object </description>
/// 	<param name="obj" type="object"> Object to get keys from </param>
/// </function>
Fit.Array.GetKeys = function(obj)
{
	var keys = [];

	if (Fit._internal.Validation.IsCollectionType(obj) === true)
	{
		for (var i = 0 ; i < obj.length ; i++)
		{
			keys.push(i);
		}
	}
	else if (typeof(obj) === "object")
	{
		for (var i in obj)
		{
			keys.push(i);
		}
	}

	return keys;
}

/// <function container="Fit.Array" name="Contains" access="public" static="true" returns="boolean">
/// 	<description> Returns True if given object is contained in array, otherwise False </description>
/// 	<param name="arr" type="array"> Array to search through </param>
/// 	<param name="obj" type="object"> Object to look for </param>
/// </function>
Fit.Array.Contains = function(arr, obj) // obj not validated - passing any object or undefined/null is allowed
{
	Fit.Validation.ExpectCollection(arr);
    return (Fit.Array.GetIndex(arr, obj) > -1);
}

/// <function container="Fit.Array" name="Copy" access="public" static="true" returns="array">
/// 	<description>
/// 		Returns a shallow copy of the array. Notice that collection type is not preserved,
/// 		meaning e.g. a NodeList or FileList will be returned as a traditional array holding
/// 		references to the objects - just like Fit.Array.ToArray(..) does.
/// 		For a deep copy see Fit.Core.Clone(..)
/// 	</description>
/// 	<param name="arr" type="array"> Array to copy </param>
/// </function>
Fit.Array.Copy = function(arr)
{
	Fit.Validation.ExpectCollection(arr);

	var newArr = [];
	Fit.Array.ForEach(arr, function(item)
	{
		newArr.push(item);
	});
	return newArr;
}

/// <function container="Fit.Array" name="ToArray" access="public" static="true" returns="array">
/// 	<description> Convert collection (NodeList, StaticNodeList, or HTMLCollection) to JS array </description>
/// 	<param name="coll" type="object"> Collection to convert to array </param>
/// </function>
Fit.Array.ToArray = function(coll)
{
	Fit.Validation.ExpectCollection(coll);

	var arr = [];

	for (var i = 0 ; i < coll.length ; i++)
		arr.push(coll[i]);

	return arr;
}

/// <function container="Fit.Array" name="Join" access="public" static="true" returns="string">
/// 	<description> Join objects from an array into a string </description>
/// 	<param name="arr" type="array"> Array containing objects </param>
/// 	<param name="separator" type="string"> String used to glue values together </param>
/// 	<param name="callback" type="function"> Callback returning string representation of objects passed from array in turn </param>
/// </function>
Fit.Array.Join = function(arr, separator, callback)
{
	Fit.Validation.ExpectCollection(arr);

	var result = "";

	Fit.Array.ForEach(arr, function(obj)
	{
		result += (result !== "" ? separator : "") + callback(obj);
	});

	return result;
}

/*
// Difference between using ordinary for loop and Fit.Array.ForEach
// can be easily demonstrated with the code below.
// Fit.Array.ForEach creates a new execution scope (closure) which
// ensure the expected array value is used, while an ordinary loop
// results in the same index (i) variable being used, which will
// have the value 3 when all setTimeout callbacks finally fire.

// Will output 1, 3, 6, 8 as expected
Fit.Array.ForEach([1,3,6,8], function(val)
{
	setTimeout(function() { console.log(val); }, 100);
});

// Will output "8" 4 times
for (var i in vals = [1,3,6,8])
{
	setTimeout(function() { console.log(vals[i]); }, 100);
}
*/

/// <container name="Fit.Browser">
/// 	Provides access to various browser information.
///
/// 	// Example code
///
/// 	var browserName = Fit.Browser.GetBrowser();
/// 	var browserVersion = Fit.Browser.GetVersion();
/// 	var browserLanguage = Fit.Browser.GetLanguage();
///
/// 	if (browserName === &quot;MSIE&quot; &amp;&amp; browserVersion &lt; 7)
/// 	{
/// 		&#160;&#160;&#160;&#160; if (browserLanguage === &quot;da&quot;)
/// 		&#160;&#160;&#160;&#160;&#160;&#160;&#160;&#160; alert(&quot;Opgrader venligst til IE7 eller nyere&quot;);
/// 		&#160;&#160;&#160;&#160; else
/// 		&#160;&#160;&#160;&#160;&#160;&#160;&#160;&#160; alert(&quot;Please upgrade to IE7 or newer&quot;);
/// 	}
/// </container>
Fit.Browser = {};
Fit._internal.Browser = {};

/// <function container="Fit.Browser" name="GetBrowser" access="public" static="true" returns="string">
/// 	<description> Returns browser name. Possible values are: Chrome, Safari, Edge, MSIE, Firefox, Opera, Unknown </description>
/// </function>
Fit.Browser.GetBrowser = function()
{
	var agent = navigator.userAgent;

	if (agent.indexOf("Edge/") > -1) // Check Edge first, it contain portions from Chrome's and Safari's user agent strings
		return "Edge";
	if (agent.indexOf("Chrome") > -1)
		return "Chrome";
	if (agent.indexOf("Safari") > -1)
		return "Safari";
	if (agent.indexOf("MSIE") > -1 || agent.indexOf("Trident") > -1)
		return "MSIE";
	if (agent.indexOf("Firefox") > -1)
		return "Firefox";
	if (agent.indexOf("Opera") > -1)
		return "Opera";

	return "Unknown";
}

/// <function container="Fit.Browser" name="GetVersion" access="public" static="true" returns="integer">
/// 	<description> Returns major version number for known browsers, -1 for unknown browsers </description>
/// </function>
Fit.Browser.GetVersion = function()
{
	var start = 0;
	var end = 0;
	var agent = navigator.userAgent;

	if (Fit.Browser.GetBrowser() === "Edge")
	{
		start = agent.indexOf("Edge/");
		start = (start !== -1 ? start + 5 : 0);
		end = agent.indexOf(".", start);
		end = (end !== -1 ? end : 0);
	}
	if (Fit.Browser.GetBrowser() === "Chrome")
	{
		start = agent.indexOf("Chrome/");
		start = (start !== -1 ? start + 7 : 0);
		end = agent.indexOf(".", start);
		end = (end !== -1 ? end : 0);
	}
	if (Fit.Browser.GetBrowser() === "Safari")
	{
		start = agent.indexOf("Version/");
		start = (start !== -1 ? start + 8 : 0);
		end = agent.indexOf(".", start);
		end = (end !== -1 ? end : 0);
	}
	if (Fit.Browser.GetBrowser() === "MSIE")
	{
		if (agent.indexOf("MSIE") > -1)
		{
			start = agent.indexOf("MSIE ");
			start = (start !== -1 ? start + 5 : 0);
			end = agent.indexOf(".", start);
			end = (end !== -1 ? end : 0);
		}
		else if (agent.indexOf("Trident") > -1) // IE11+
		{
			start = agent.indexOf("rv:");
			start = (start !== -1 ? start + 3 : 0);
			end = agent.indexOf(".", start);
			end = (end !== -1 ? end : 0);
		}
	}
	if (Fit.Browser.GetBrowser() === "Firefox")
	{
		start = agent.indexOf("Firefox/");
		start = (start !== -1 ? start + 8 : 0);
		end = agent.indexOf(".", start);
		end = (end !== -1 ? end : 0);
	}
	if (Fit.Browser.GetBrowser() === "Opera")
	{
		start = agent.indexOf("Version/");
		start = (start !== -1 ? start + 8 : -1);

		if (start === -1)
		{
			start = agent.indexOf("Opera/");
			start = (start !== -1 ? start + 6 : -1);
		}

		if (start === -1)
		{
			start = agent.indexOf("Opera ");
			start = (start !== -1 ? start + 6 : -1);
		}

		end = agent.indexOf(".", start);
		end = (end !== -1 ? end : 0);
	}

	if (start !== 0 && start !== 0)
		return parseInt(agent.substring(start, end));

	return -1;
}

/// <function container="Fit.Browser" name="GetQueryString" access="public" static="true" returns="object">
/// 	<description>
/// 		Returns query string object containing the following properties:
/// 		 - Url:string (Full URL)
/// 		 - Parameters:object (associative object array with URL parameters as keys)
/// 		 - Anchor:string (anchor if set, otherwise Null)
/// 	</description>
/// 	<param name="alternativeUrl" type="string" default="undefined"> Alternative URL to parse </param>
/// </function>
Fit.Browser.GetQueryString = function(alternativeUrl)
{
	Fit.Validation.ExpectString(alternativeUrl, true);

	var qs = { Url: null, Parameters: {}, Anchor: null };

	var url = ((alternativeUrl !== undefined) ? alternativeUrl : location.href);
	var params = ((url.indexOf("?") > -1) ? url.split("?")[1] : "");
	var anchor = null;

	params = ((params.indexOf("#") > -1) ? params.split("#")[0] : params);
	anchor = ((url.indexOf("#") > -1) ? url.split("#")[1] : null);

	qs.Url = url;
	qs.Anchor = anchor;

	Fit.Array.ForEach(((params !== "") ? params.split("&") : []), function(p)
	{
		var keyval = p.split("=");

		try
		{
			// Notice: decodeURIComponent(..) throws an error in case invalid encoding is used
			qs.Parameters[decodeURIComponent(keyval[0])] = ((keyval.length > 1) ? decodeURIComponent(keyval[1]) : "");
		}
		catch (err)
		{
			// An error occurred decoding parameter - use raw value instead
			qs.Parameters[keyval[0]] = ((keyval.length > 1) ? keyval[1] : "");
		}
	});

	return qs;
}

/// <function container="Fit.Browser" name="ParseUrl" access="public" static="true" returns="object">
/// 	<description>
/// 		Parses well-formed URLs and returns an object containing the following properties:
/// 		 - Url:string (URL passed to function)
/// 		 - Protocol:string (e.g. ftp, http, https)
/// 		 - Port:integer (returns -1 if not defined in URL)
/// 		 - Auth:string (e.g. accessToken or user:pass)
/// 		 - Host:string (e.g. localhost or fitui.org)
/// 		 - Path:string (e.g. /path/to/)
/// 		 - Resource:string (e.g. resource.php)
/// 		 - FullPath:string (e.g. /path/to/resource.php)
/// 		 - Parameters:object (associative object array with URL parameters as keys)
/// 		 - Anchor:string
/// 	</description>
/// 	<param name="url" type="string"> Well-formed URL to parse </param>
/// </function>
Fit.Browser.ParseUrl = function(url)
{
	Fit.Validation.ExpectString(url);

	// URLs are often concatenated incorrectly with double forward slashes.
	// E.g. http://localhost//path/to//file.php
	// Compensate for this problem to reduce risk of runtime parse errors.
	// https://regex101.com/r/DMQs9A/1/
	var doubleSlashes = /(^.*:\/\/.*?)\/\/(.*)/;
	while (doubleSlashes.test(url) === true)
	{
		url = url.replace(doubleSlashes, "$1/$2");
	}

	// This function is not perfect.
	// It will parse well-formed URLs properly
	// but may be fooled by incorrecly formatted URLs,
	// and does not currently support IPv6 addresses.
	// But for a solution using Regular Expression it
	// is works quite well and is very simple in its
	// implementation.

	// Using JS is possible although known to give slightly
	// different results across different browsers - example:
	//    var a = document.createElement("a");
	//    console.log(a.pathname, a.host, a.port, a.protocol, a.username, a.password); // etc.
	// On top of differences across browsers it also depends on DOM which is not available in Workers,
	// it will automatically canonicalize the URL to the page (relative to domain, protocol, etc.),
	// and some browsers (e.g. Legacy IE) does not parse IPv6 addresses either.
	// See comments here: https://gist.github.com/jlong/2428561
	// Solution must be cross browser and support Legacy IE !

	// It is impossible to produce a perfect solution using a one-liner
	// regular expression. Inventer of WWW, Tim Burners-Lee (TimBL / TBL),
	// among many others, solves parsing programmatically: https://www.w3.org/wiki/UriTesting
	// Such solutions tend to be much more complex though.
	// Another example: https://github.com/unshiftio/url-parse

	/* RegEx fiddle: https://regex101.com/r/poWR2S/14
	0 = Full match
	1 = Protocol (http/https/ftp/etc)
	2 = Group used to exclude @ from auth in #3
	3 = Auth
	5 = Host followed by port in #7
	6 = Group used to exclude / from port in #7
	7 = Port
	8 = Host NOT followed by port
	9 = Host NOT followed by anything (end of string)
	10 = Group used to wrap #11 #12 #13 #14 #15
	11 = Path followed by QS (and possibly #hash) in #12
	12 = QS (and possibly #hash)
	13 = Path followed by #hash in #14
	14 = #hash value
	15 = Path NOT followed by anything (end of string) */
	var regEx = /(.+):\/\/((.+)@)?((.+):((\d+)\/?)?|(.+?)\/|(.+?)$)((.*)\?(.+)|(.*)#(.*)|(.*)$)/;
	var match = regEx.exec(url);
	var result = { Url: null, Protocol: null, Port: null, Auth: null, Host: null, FullPath: null, Path: null, Resource: null, Parameters: {}, Anchor: null };

	if (match === null)
	{
		Fit.Validation.ThrowError("Unable to parse invalid URL - valid example: schema://[auth@]host[:port][/path/resource[?parm=val[#hash]]]");
	}

	if (match.length !== 16) // RegExp should produce this amount of capture group results!
	{
		Fit.Validation.ThrowError("Unexpected parse error - internal error"); // Happens if RegExp is changed without adjusting code using it
	}

	var fullPath = (match[11] || match[13] || match[15] || ""); //var fullPath = (match[11] || match[13] || (match[15] && match[15] !== "?" ? match[15] : "") || "");
	var qs = Fit.Browser.GetQueryString(url);

	result.Url = url;
	result.Protocol = match[1].toLowerCase();
	result.Auth = match[3] || null;
	result.Host = match[5] || match[8] || match[9];
	result.Port = (match[7] ? parseInt(match[7]) : -1);
	result.FullPath = "/" + fullPath;
	result.Parameters = qs.Parameters;
	result.Anchor = qs.Anchor;

	result.Path = "/";
	
	if (fullPath !== "")
	{
		var pathInfo = fullPath.split("/");

		// Construct path without resource (/path/to/resource.php => /path/to/)
		result.Path += pathInfo.slice(0, -1).join("/") + (pathInfo.length > 0 ? "/" : "");

		// Add resource (e.g. resource.php) if found in URL
		if (pathInfo[pathInfo.length - 1] !== "")
		{
			result.Resource = pathInfo[pathInfo.length - 1];
		}
	}
	
	return result;
}

/// <function container="Fit.Browser" name="GetLanguage" access="public" static="true" returns="string">
/// 	<description> Returns browser language - e.g. &quot;da&quot; (Danish), &quot;en&quot; (English) etc. </description>
/// </function>
Fit.Browser.GetLanguage = function()
{
	var lang = null;

	if (navigator.language)
		lang = navigator.language.toLowerCase();
	else if (navigator.browserLanguage)
		lang = navigator.browserLanguage.toLowerCase();

	if (lang === null || lang === "")
		return "en";

	if (lang.length === 2)
		return lang;

	if (lang.length === 5)
		return lang.substring(0, 2);

	return "en";
}

/// <function container="Fit.Browser" name="GetPageWidth" access="public" static="true" returns="integer">
/// 	<description> Returns page width in pixels </description>
/// </function>
Fit.Browser.GetPageWidth = function()
{
	var w = 0;

	if (window.innerWidth) // W3C
		w = window.innerWidth;
	else if (document.documentElement && document.documentElement.clientWidth) // IE 6-8 (not quirks mode)
		w = document.documentElement.clientWidth;

	return w;
}

/// <function container="Fit.Browser" name="GetPageHeight" access="public" static="true" returns="integer">
/// 	<description> Returns page height in pixels </description>
/// </function>
Fit.Browser.GetPageHeight = function()
{
	var h = 0;

	if (window.innerHeight) // W3C
		h = window.innerHeight;
	else if (document.documentElement && document.documentElement.clientHeight) // IE 6-8 (not quirks mode)
		h = document.documentElement.clientHeight;

	return h;
}

/// <function container="Fit.Browser" name="GetViewPortDimensions" access="public" static="true" returns="object">
/// 	<description> Returns object with Width and Height properties specifying dimensions of viewport </description>
/// </function>
Fit.Browser.GetViewPortDimensions = function()
{
	return { Width: Fit.Browser.GetPageWidth(), Height: Fit.Browser.GetPageHeight() };
}

/// <function container="Fit.Browser" name="GetScrollPosition" access="public" static="true" returns="object">
/// 	<description> Returns object with X and Y properties specifying scroll position </description>
/// </function>
Fit.Browser.GetScrollPosition = function()
{
	var x = document.body.scrollLeft || document.documentElement.scrollLeft || window.pageXOffset || 0;
	var y = document.body.scrollTop || document.documentElement.scrollTop || window.pageYOffset || 0;

	return { X: x, Y: y };
}

/// <function container="Fit.Browser" name="GetScreenWidth" access="public" static="true" returns="integer">
/// 	<description> Get screen width </description>
/// 	<param name="onlyAvailable" type="boolean" default="false">
/// 		Set True to return only available space (may be reduced by e.g. start menu (Windows) or Dock (Linux/OSX)
/// 	</param>
/// </function>
Fit.Browser.GetScreenWidth = function(onlyAvailable)
{
	Fit.Validation.ExpectBoolean(onlyAvailable, true);

	if (onlyAvailable === true)
		return window.screen.availWidth;

	return window.screen.width;
}

/// <function container="Fit.Browser" name="GetScreenHeight" access="public" static="true" returns="integer">
/// 	<description> Get screen height </description>
/// 	<param name="onlyAvailable" type="boolean" default="false">
/// 		Set True to return only available space (may be reduced by e.g. start menu (Windows) or Dock (Linux/OSX)
/// 	</param>
/// </function>
Fit.Browser.GetScreenHeight = function(onlyAvailable)
{
	Fit.Validation.ExpectBoolean(onlyAvailable, true);

	if (onlyAvailable === true)
		return window.screen.availHeight;

	return window.screen.height;
}

/// <function container="Fit.Browser" name="GetScreenDimensions" access="public" static="true" returns="object">
/// 	<description> Returns object with Width and Height properties specifying screen dimensions </description>
/// 	<param name="onlyAvailable" type="boolean" default="false">
/// 		Set True to return only available space (may be reduced by e.g. Start menu (Windows) or Dock (Linux/OSX)
/// 	</param>
/// </function>
Fit.Browser.GetScreenDimensions = function(onlyAvailable)
{
	Fit.Validation.ExpectBoolean(onlyAvailable, true);
	return { Width: Fit.Browser.GetScreenWidth(onlyAvailable), Height: Fit.Browser.GetScreenHeight(onlyAvailable) };
}

/// <function container="Fit.Browser" name="IsMobile" access="public" static="true" returns="boolean">
/// 	<description> Returns value indicating whether devices currently being used is a mobile device or not </description>
/// 	<param name="includeTablets" type="boolean" default="true"> Value indicating whether tablets are considered mobile devices or not </param>
/// </function>
Fit.Browser.IsMobile = function(includeTablets)
{
	Fit.Validation.ExpectBoolean(includeTablets, true);

	// Based on http://detectmobilebrowsers.com
	// See About section for Tablet support: http://detectmobilebrowsers.com/about

	var nav = navigator.userAgent || navigator.vendor;

	if (includeTablets !== false && /android|ipad|playbook|silk/i.test(nav))
		return true;

	return (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(nav) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(nav.substr(0,4)));
}


/// <function container="Fit.Browser" name="Log" access="public" static="true">
/// 	<description> Log message or object </description>
/// 	<param name="msg" type="object"> Message or object to log </param>
/// </function>
Fit.Browser.Log = function(msg) // msg not validated - any object or value (including null/undefined) can be logged
{
	if (window.console)
		console.log(msg);
}

Fit.Browser.Debug = function(msg) // msg not validated - any object or value (including null/undefined) can be logged
{
	if (window.console && Fit._internal.Validation.DebugMode === true)
		console.log(msg);
}

/// <function container="Fit.Browser" name="LogDeprecated" access="public" static="true">
/// 	<description> Log message about use of deprecated feature </description>
/// 	<param name="msg" type="string"> Message to log </param>
/// </function>
Fit.Browser.LogDeprecated = function(msg)
{
	Fit.Validation.ExpectString(msg);
	
	if (window.console && console.warn)
		console.warn(msg);
	else
		Fit.Browser.Log(msg);
	
	//if (window.console && console.trace)
		//console.trace();
}

/// <function container="Fit.Browser" name="GetInfo" access="public" static="true" returns="object">
/// 	<description> Returns cached object with browser information available through Name, Version, and Language properties </description>
/// </function>
Fit.Browser.GetInfo = function()
{
	if (!Fit._internal.Browser.Info)
	{
		Fit._internal.Browser.Info = {};

		Fit._internal.Browser.Info.Name = Fit.Browser.GetBrowser();
		Fit._internal.Browser.Info.Version = Fit.Browser.GetVersion();
		Fit._internal.Browser.Info.Language = Fit.Browser.GetLanguage();
		Fit._internal.Browser.Info.IsMobile = Fit.Browser.IsMobile();
		Fit._internal.Browser.Info.IsPhone = Fit.Browser.IsMobile(false); // Phone only
		Fit._internal.Browser.Info.IsTablet = (Fit.Browser.IsMobile() === true && Fit.Browser.IsMobile(false) === false); // Tablet only
	}

	return Fit.Core.Clone(Fit._internal.Browser.Info); // Clone to ensure values are not shared and potentially changed
}

/// <function container="Fit.Browser" name="IsStorageSupported" access="public" static="true" returns="boolean">
/// 	<description> Returns value indicating whether Session and Local storage is supported or not </description>
/// </function>
Fit.Browser.IsStorageSupported = function()
{
	if (Fit._internal.Browser.StorageSupported === undefined)
	{
		Fit._internal.Browser.StorageSupported = false;

		try
		{
			if (window.localStorage && window.sessionStorage)
			{
				var x = "__FITUITEST__";

				localStorage.setItem(x, x);
				localStorage.removeItem(x);

				sessionStorage.setItem(x, x);
				sessionStorage.removeItem(x);

				Fit._internal.Browser.StorageSupported = true;
			}
		}
		catch (err)
		{
		}
	}

	return Fit._internal.Browser.StorageSupported;
}

Fit.Controls = {};
Fit._internal.Controls = {}
Fit._internal.ControlBase = { Controls: {} };

/// <container name="Fit.Controls.Component">
/// 	Class from which all UI components extend
/// </container>
Fit.Controls.Component = function(controlId)
{
	Fit.Validation.ExpectStringValue(controlId, true);

	var me = this;
	var id = null;
	var container = null;

	var isIe8 = (Fit.Browser.GetInfo().Name === "MSIE" && Fit.Browser.GetInfo().Version === 8);

	function init()
	{
		Fit._internal.Core.EnsureStyles();

		id = (Fit.Validation.IsSet(controlId) === true ? controlId : "Ctl" + Fit.Data.CreateGuid());

		if (Fit._internal.ControlBase.Controls[id] !== undefined)
			Fit.Validation.ThrowError("Control with ID '" + id + "' has already been defined - Control IDs must be unique!");

		Fit._internal.ControlBase.Controls[id] = me;

		container = document.createElement("div");
		container.id = id;
		container._internal = { Instance: me };
	}

	/// <function container="Fit.Controls.Component" name="GetId" access="public" returns="string">
	/// 	<description> Get unique Control ID </description>
	/// </function>
	this.GetId = function()
	{
		return id;
	}

   	/// <function container="Fit.Controls.Component" name="GetDomElement" access="public" returns="DOMElement">
	/// 	<description> Get DOMElement representing control </description>
	/// </function>
	this.GetDomElement = function()
	{
		return container;
	}
	
	/// <function container="Fit.Controls.Component" name="Render" access="public">
	/// 	<description> Render control, either inline or to element specified </description>
	/// 	<param name="toElement" type="DOMElement" default="undefined"> If defined, control is rendered to this element </param>
	/// </function>
	this.Render = function(toElement)
	{
		Fit.Validation.ExpectDomElement(toElement, true);

		if (Fit.Validation.IsSet(toElement) === true)
		{
			Fit.Dom.Add(toElement, me.GetDomElement()); // Using GetDomElement() which may have been overridden, e.g. by ControlBase which does some validation when GetDomElement() is called, or by ContextMenu which returns a different element
		}
		else
		{
			var script = document.scripts[document.scripts.length - 1];
			Fit.Dom.InsertBefore(script, me.GetDomElement()); // Using GetDomElement() which may have been overridden, e.g. by ControlBase which does some validation when GetDomElement() is called, or by ContextMenu which returns a different element
		}
	}

	/// <function container="Fit.Controls.Component" name="Dispose" access="public">
	/// 	<description>
	/// 		Destroys control to free up memory.
	/// 		Make sure to call Dispose() on Component which can be done like so:
	/// 		this.Dispose = Fit.Core.CreateOverride(this.Dispose, function()
	/// 		{
	/// 			&#160;&#160;&#160;&#160; // Add control specific dispose logic here
	/// 			&#160;&#160;&#160;&#160; base(); // Call Dispose on Component
	/// 		});
	/// 	</description>
	/// </function>
	this.Dispose = function()
	{
		// This will destroy control - it will no longer work!

		Fit.Dom.Remove(container); // Dispose 'container' rather than object returned from GetDomElement() which may have been overridden and potentially returning a different object, in which case the derivative should dispose the object
		delete container._internal; // Removed in case external code holds a reference to DOMElement. Also allows us to internally determine whether control has been disposed or not (e.g. in Fit.Template), since it will always be presented unless disposed.
		delete Fit._internal.ControlBase.Controls[id];
		me = id = container = isIe8 = null;
	}

	// Internals

	this._internal = (this._internal ? this._internal : {});

	this._internal.Repaint = function(f) // Use callback function if a repaint is required both before and after a given operation, which often requires JS thread to be released on IE
	{
		Fit.Validation.ExpectFunction(f, true);

		var cb = ((Fit.Validation.IsSet(f) === true) ? f : function() {});

		if (isIe8 === false)
		{
			cb();
		}
		else
		{
			// Flickering may occure on IE8 when updating UI over time
			// (UI update + JS thread released + UI updates again "later").

			Fit.Dom.AddClass(me.GetDomElement(), "FitUi_Non_Existing_ControlBase_Class");
			Fit.Dom.RemoveClass(me.GetDomElement(), "FitUi_Non_Existing_ControlBase_Class");

			setTimeout(function()
			{
				if (me === null)
					return; // Control has been disposed

				cb();

				Fit.Dom.AddClass(me.GetDomElement(), "FitUi_Non_Existing_ControlBase_Class");
				Fit.Dom.RemoveClass(me.GetDomElement(), "FitUi_Non_Existing_ControlBase_Class");
			}, 0);
		}
	}

	init();
}

/// <container name="Fit.Controls.ControlBase" extends="Fit.Controls.Component">
/// 	Class from which all editable controls extend
/// </container>
Fit.Controls.ControlBase = function(controlId)
{
	Fit.Validation.ExpectStringValue(controlId, true);
	Fit.Core.Extend(this, Fit.Controls.Component).Apply(controlId);

	// ============================================
	// Interface - must be overridden
	// ============================================

	/// <function container="Fit.Controls.ControlBase" name="Value" access="public" returns="string">
	/// 	<description>
	/// 		Get/set control value.
	/// 		For controls supporting multiple selections: Set value by providing a string in one the following formats:
	/// 		title1=val1[;title2=val2[;title3=val3]] or val1[;val2[;val3]].
	/// 		If Title or Value contains reserved characters (semicolon or equality sign), these most be URIEncoded.
	/// 		Selected items are returned in the first format described, also with reserved characters URIEncoded.
	/// 		Providing a new value to this function results in OnChange being fired.
	/// 	</description>
	/// 	<param name="val" type="string" default="undefined"> If defined, items are selected </param>
	/// </function>
	this.Value = function(val)
	{
		// Function MUST remember to fire OnChange event when
		// value is changed, both programmatically and by user.

		Fit.Validation.ThrowError("Not implemented");
	}

	/// <function container="Fit.Controls.ControlBase" name="IsDirty" access="public" returns="boolean">
	/// 	<description> Get value indicating whether user has changed control value </description>
	/// </function>
	this.IsDirty = function()
	{
		Fit.Validation.ThrowError("Not implemented");
	}

	/// <function container="Fit.Controls.ControlBase" name="Clear" access="public">
	/// 	<description> Clear control value </description>
	/// </function>
	this.Clear = function()
	{
		// Function MUST remember to fire OnChange event when
		// value is clear, both programmatically and by user.

		Fit.Validation.ThrowError("Not implemented");
	}

	/// <function container="Fit.Controls.ControlBase" name="Focused" access="public" returns="boolean">
	/// 	<description> Get/set value indicating whether control has focus </description>
	/// 	<param name="value" type="boolean" default="undefined"> If defined, True assigns focus, False removes focus (blur) </param>
	/// </function>
	this.Focused = function(val)
	{
		Fit.Validation.ThrowError("Not implemented");
	}

	// ============================================
	// Init
	// ============================================

	var me = this;
	var container = me.GetDomElement();
	var width = { Value: 200, Unit: "px" }; // Any changes to this line must be dublicated to Width(..)
	var height = { Value: -1, Unit: "px" };
	var scope = null;
	var required = false;
	var orgDirtyFunction = null;
	var validationExpr = null;
	var validationError = null;
	var validationErrorType = -1; // 0 = Required, 1 = RegEx validation, 2 = Callback validation
	var validationCallbackFunc = null;	// Obsolete - used by SetValidationCallback
	var validationCallbackError = null;	// Obsolete - used by SetValidationCallback
	var validationHandlerFunc = null;
	var validationHandlerError = null;
	var lazyValidation = false;
	var hasValidated = false;
	var blockAutoPostBack = false; // Used by AutoPostBack mechanism to prevent multiple postbacks, e.g on double click
	var onChangeHandlers = [];
	var onFocusHandlers = [];
	var onBlurHandlers = [];
	var hasFocus = false;			// Used by OnFocusIn and OnFocusOut handlers
	var onBlurTimeout = null;		// Used by OnFocusIn and OnFocusOut handlers
	var ensureFocusFires = false;	// Used by OnFocusIn and OnFocusOut handlers
	var waitingForFocus = false;	// Used by OnFocusIn and OnFocusOut handlers
	var txtValue = null;
	var txtDirty = null;
	var txtValid = null;

	function init()
	{
		container.style.width = width.Value + width.Unit;
		Fit.Dom.AddClass(container, "FitUiControl");

		me._internal.Data("focused", "false");
		me._internal.Data("valid", "true");
		me._internal.Data("dirty", "false");

		me._internal.Data("device", ((Fit.Browser.GetInfo().IsMobile === false) ? "Desktop" : (Fit.Browser.GetInfo().IsPhone === true) ? "Phone" : "Tablet"));

		// Add hidden inputs which are automatically populated with
		// control value and state information when control is updated.

		txtValue = document.createElement("textarea"); // Using Textarea to allow HTML content
		txtValue.style.display = "none";
		txtValue.name = "FitUIValue" + me.GetId();
		Fit.Dom.Add(container, txtValue);

		txtDirty = document.createElement("input");
		txtDirty.type = "hidden";
		txtDirty.name = "FitUIDirty" + me.GetId();
		Fit.Dom.Add(container, txtDirty);

		txtValid = document.createElement("input");
		txtValid.type = "hidden";
		txtValid.name = "FitUIValid" + me.GetId();
		Fit.Dom.Add(container, txtValid);

		me.OnChange(function(sender)
		{
			if (blockAutoPostBack === false && me.AutoPostBack() === true && document.forms.length > 0)
			{
				setTimeout(function() // Postpone to allow other handlers to execute before postback
				{
					blockAutoPostBack = true;
					document.forms[0].submit();

					setTimeout(function() { blockAutoPostBack = false; }, 500); // Enable AutoPostBack again in case OnBeforeUnload handler was used to cancel postback
				}, 0);
			}
		});

		if (Fit.Browser.GetBrowser() !== "MSIE" || Fit.Browser.GetVersion() >= 9)
		{
			// Notice: Using Capture (true argument) for these handlers,
			// meaning they are fired before the event reach its target.
			Fit.Events.AddHandler(container, "focus", true, onFocusIn);
			Fit.Events.AddHandler(container, "blur", true, onFocusOut);
		}
		else // Legacy IE does not support event capturing used above
		{
			container.onfocusin = onFocusIn;
			container.onfocusout = onFocusOut;
		}

		me.OnBlur(function(sender)
		{
			if (lazyValidation === true)
				me._internal.Validate(true);
		});

		Fit.Internationalization.OnLocaleChanged(localize);
	}

	// ============================================
	// Public
	// ============================================

	/// <function container="Fit.Controls.ControlBase" name="AutoPostBack" access="public" returns="boolean">
	/// 	<description> Set flag indicating whether control should post back changes automatically when value is changed </description>
	/// 	<param name="val" type="boolean" default="undefined"> If defined, True enables auto post back, False disables it </param>
	/// </function>
	this.AutoPostBack = function(val)
	{
		Fit.Validation.ExpectBoolean(val, true);

		if (Fit.Validation.IsSet(val) === true)
		{
			me._internal.Data("autopost", val.toString());
		}

		return (me._internal.Data("autopost") === "true");
	}

	this.GetDomElement = Fit.Core.CreateOverride(this.GetDomElement, function()
	{
		if (hasValidated === false)
		{
			hasValidated = true;
			me._internal.Validate();
			updateInternalState(); // Make sure state posted to server is up to date (Dirty and Valid flags) in case a control value has not been assigned
		}

		return base();
	});

	this.Dispose = Fit.Core.CreateOverride(this.Dispose, function()
	{
		Fit.Internationalization.RemoveOnLocaleChanged(localize);
		me = container = width = height = scope = required = validationExpr = validationError = validationErrorType = validationCallbackFunc = validationCallbackError = validationHandlerFunc = validationHandlerError = lazyValidation = hasValidated = blockAutoPostBack = onChangeHandlers = onFocusHandlers = onBlurHandlers = hasFocus = onBlurTimeout = ensureFocusFires = waitingForFocus = txtValue = txtDirty = txtValid = null;
		base();
	});


	/// <function container="Fit.Controls.ControlBase" name="Width" access="public" returns="object">
	/// 	<description> Get/set control width - returns object with Value and Unit properties </description>
	/// 	<param name="val" type="number" default="undefined"> If defined, control width is updated to specified value. A value of -1 resets control width. </param>
	/// 	<param name="unit" type="string" default="px"> If defined, control width is updated to specified CSS unit </param>
	/// </function>
	this.Width = function(val, unit)
	{
		Fit.Validation.ExpectNumber(val, true);
		Fit.Validation.ExpectStringValue(unit, true);

		if (Fit.Validation.IsSet(val) === true)
		{
			if (val > -1)
			{
				width = { Value: val, Unit: ((Fit.Validation.IsSet(unit) === true) ? unit : "px") };
				container.style.width = width.Value + width.Unit;
			}
			else
			{
				width = { Value: 200, Unit: "px" }; // Any changes to this line must be dublicated to line declaring the width variable !
				container.style.width = "";
			}
		}

		return width;
	}

	/// <function container="Fit.Controls.ControlBase" name="Height" access="public" returns="object">
	/// 	<description> Get/set control height - returns object with Value and Unit properties </description>
	/// 	<param name="val" type="number" default="undefined"> If defined, control height is updated to specified value. A value of -1 resets control height. </param>
	/// 	<param name="unit" type="string" default="px"> If defined, control height is updated to specified CSS unit </param>
	/// </function>
	this.Height = function(val, unit)
	{
		Fit.Validation.ExpectNumber(val, true);
		Fit.Validation.ExpectStringValue(unit, true);

		if (Fit.Validation.IsSet(val) === true)
		{
			height = { Value: val, Unit: ((Fit.Validation.IsSet(unit) === true && val !== -1) ? unit : "px") };

			if (height.Value > -1)
				container.style.height = height.Value + height.Unit;
			else
				container.style.height = "";
		}

		return height;
	}

	/// <function container="Fit.Controls.ControlBase" name="AddCssClass" access="public">
	/// 	<description> Add CSS class to DOMElement representing control </description>
	/// 	<param name="val" type="string"> CSS class to add </param>
	/// </function>
	this.AddCssClass = function(val)
	{
		Fit.Validation.ExpectStringValue(val);
		Fit.Dom.AddClass(container, val);
	}

	/// <function container="Fit.Controls.ControlBase" name="RemoveCssClass" access="public">
	/// 	<description> Remove CSS class from DOMElement representing control </description>
	/// 	<param name="val" type="string"> CSS class to remove </param>
	/// </function>
	this.RemoveCssClass = function(val)
	{
		Fit.Validation.ExpectStringValue(val);
		Fit.Dom.RemoveClass(container, val);
	}

	/// <function container="Fit.Controls.ControlBase" name="HasCssClass" access="public" returns="boolean">
	/// 	<description> Check whether CSS class is found on DOMElement representing control </description>
	/// 	<param name="val" type="string"> CSS class to check for </param>
	/// </function>
	this.HasCssClass = function(val)
	{
		Fit.Validation.ExpectStringValue(val);
		return Fit.Dom.HasClass(container, val);
	}

	/// <function container="Fit.Controls.ControlBase" name="Visible" access="public" returns="boolean">
	/// 	<description> Get/set value indicating whether control is visible </description>
	/// 	<param name="val" type="boolean" default="undefined"> If defined, control visibility is updated </param>
	/// </function>
	this.Visible = function(val)
	{
		Fit.Validation.ExpectBoolean(val, true);

		if (Fit.Validation.IsSet(val) === true)
			container.style.display = ((val === true) ? "" : "none");

		return (container.style.display !== "none");
	}

	/// <function container="Fit.Controls.ControlBase" name="Required" access="public" returns="boolean">
	/// 	<description> Get/set value indicating whether control is required to be set </description>
	/// 	<param name="val" type="boolean" default="undefined"> If defined, control required feature is enabled/disabled </param>
	/// </function>
	this.Required = function(val)
	{
		Fit.Validation.ExpectBoolean(val, true);

		if (Fit.Validation.IsSet(val) === true)
		{
			required = val;
			me._internal.Validate(); // Update error indicator
		}

		return required;
	}

	/// <function container="Fit.Controls.ControlBase" name="Scope" access="public" returns="string">
	/// 	<description>
	/// 		Get/set scope to which control belongs - this is used to validate multiple
	/// 		controls at once using Fit.Controls.ValidateAll(scope) or Fit.Controls.DirtyCheckAll(scope).
	/// 	</description>
	/// 	<param name="val" type="string" default="undefined"> If defined, control scope is updated </param>
	/// </function>
	this.Scope = function(val)
	{
		Fit.Validation.ExpectString(val, true);

		if (Fit.Validation.IsSet(val) === true)
		{
			if (val === "")
				scope = null;
			else
				scope = val;
		}

		return scope;
	}

	/// <function container="Fit.Controls.ControlBase" name="AlwaysDirty" access="public" returns="boolean">
	/// 	<description>
	/// 		Get/set value indicating whether control is always considered dirty. This
	/// 		comes in handy when programmatically changing a value of a control on behalf
	/// 		of the user. Some applications may choose to only save values from dirty controls.
	/// 	</description>
	/// 	<param name="val" type="boolean" default="undefined"> If defined, Always Dirty is enabled/disabled </param>
	/// </function>
	this.AlwaysDirty = function(val)
	{
		Fit.Validation.ExpectBoolean(val, true);

		if (Fit.Validation.IsSet(val) === true)
		{
			if (val === true && orgDirtyFunction === null)
			{
				orgDirtyFunction = this.IsDirty;
				this.IsDirty = function() { return true; };
				updateInternalState();
			}
			else if (val === false && orgDirtyFunction !== null)
			{
				this.IsDirty = orgDirtyFunction;
				orgDirtyFunction = null;
				updateInternalState();
			}
		}

		return (orgDirtyFunction !== null);
	}

	/// <function container="Fit.Controls.ControlBase" name="SetValidationExpression" access="public">
	/// 	<description> Set regular expression used to perform on-the-fly validation against control value </description>
	/// 	<param name="regEx" type="RegExp" nullable="true"> Regular expression to validate against </param>
	/// 	<param name="errorMsg" type="string" default="undefined">
	/// 		If defined, specified error message is displayed when user clicks or hovers validation error indicator
	/// 	</param>
	/// </function>
	this.SetValidationExpression = function(regEx, errorMsg)
	{
		Fit.Validation.ExpectRegExp(regEx, true); // Allow Null/undefined which disables validation
		Fit.Validation.ExpectString(errorMsg, true);

		validationExpr = (regEx ? regEx : null);
		validationError = (errorMsg ? errorMsg : null);

		me._internal.Validate();
	}

	/// <function container="Fit.Controls.ControlBase" name="SetValidationCallback" access="public">
	/// 	<description>
	/// 		DEPRECATED! Please use SetValidationHandler(..) instead.
	/// 		Set callback function used to perform on-the-fly validation against control value.
	/// 	</description>
	/// 	<param name="cb" type="function" nullable="true"> Function receiving control value - must return True if value is valid, otherwise False </param>
	/// 	<param name="errorMsg" type="string" default="undefined">
	/// 		If defined, specified error message is displayed when user clicks or hovers validation error indicator
	/// 	</param>
	/// </function>
	this.SetValidationCallback = function(cb, errorMsg)
	{
		Fit.Validation.ExpectFunction(cb, true); // Allow Null/undefined which disables validation
		Fit.Validation.ExpectString(errorMsg, true);

		Fit.Browser.LogDeprecated("Use of deprecated function SetValidationCallback - please use SetValidationHandler instead");

		validationHandlerFunc = null;
		validationCallbackFunc = (cb ? cb : null);;
		validationCallbackError = (errorMsg ? errorMsg : null);

		me._internal.Validate();
	}

	/// <function container="Fit.Controls.ControlBase" name="SetValidationHandler" access="public">
	/// 	<description> Set callback function used to perform on-the-fly validation against control value </description>
	/// 	<param name="cb" type="function" nullable="true">
	/// 		Function receiving an instance of the control and its value.
	/// 		An error message string must be returned if value is invalid,
	/// 		otherwise Null or an empty string if the value is valid.
	/// 	</param>
	/// </function>
	this.SetValidationHandler = function(cb)
	{
		Fit.Validation.ExpectFunction(cb, true); // Allow Null/undefined which disables validation

		validationCallbackFunc = null;
		validationHandlerFunc = (cb ? cb : null);
		validationHandlerError = null;

		me._internal.Validate();
	}

	/// <function container="Fit.Controls.ControlBase" name="IsValid" access="public" returns="boolean">
	/// 	<description>
	/// 		Get value indicating whether control value is valid.
	/// 		Control value is considered invalid if control is required, but no value is set,
	/// 		or if control value does not match regular expression set using SetValidationExpression(..).
	/// 	</description>
	/// </function>
	this.IsValid = function()
	{
		validationErrorType = -1;

		if (validationExpr === null && validationCallbackFunc === null && validationHandlerFunc === null && required === false)
			return true;

		var obj = me.Value();
		var val = ((Fit.Validation.IsSet(obj) === true) ? obj.toString() : "");

		if (required === true && val === "")
		{
			validationErrorType = 0;
			return false;
		}

		if (validationExpr !== null && validationExpr.test(val) === false)
		{
			validationErrorType = 1;
			return false;
		}

		if (validationHandlerFunc !== null)
		{
			validationHandlerError = null;
			var errorMessage = validationHandlerFunc(me, val);

			if (errorMessage !== null && errorMessage !== "" && typeof(errorMessage) === "string")
			{
				validationErrorType = 2;
				validationHandlerError = errorMessage;
				return false;
			}
		}
		else if (validationCallbackFunc !== null && validationCallbackFunc(val) === false)
		{
			validationErrorType = 3;
			return false;
		}

		return true;
	}

	/// <function container="Fit.Controls.ControlBase" name="LazyValidation" access="public" returns="boolean">
	/// 	<description>
	/// 		Get/set value indicating whether control initially appears as valid, even
	/// 		though it is not. It will appear invalid once the user touches the control,
	/// 		or when control value is validated using Fit.Controls.ValidateAll(..).
	/// 	</description>
	/// 	<param name="val" type="boolean" default="undefined"> If defined, Lazy Validation is enabled/disabled </param>
	/// </function>
	this.LazyValidation = function(val)
	{
		Fit.Validation.ExpectBoolean(val, true);

		if (Fit.Validation.IsSet(val) === true)
		{
			lazyValidation = val;

			if (lazyValidation === true)
			{
				me._internal.Data("valid", "true");
				me._internal.Data("errormessage", null);
			}
			else
			{
				this._internal.Validate();
			}
		}

		return lazyValidation;
	}

	// ============================================
	// Events
	// ============================================

	/// <function container="Fit.Controls.ControlBase" name="OnChange" access="public">
	/// 	<description> Register OnChange event handler which is invoked when control value is changed either programmatically or by user </description>
	/// 	<param name="cb" type="function"> Event handler function which accepts Sender (ControlBase) </param>
	/// </function>
	this.OnChange = function(cb)
	{
		Fit.Validation.ExpectFunction(cb);
		Fit.Array.Add(onChangeHandlers, cb);
	}

	/// <function container="Fit.Controls.ControlBase" name="OnFocus" access="public">
	/// 	<description> Register OnFocus event handler which is invoked when control gains focus </description>
	/// 	<param name="cb" type="function"> Event handler function which accepts Sender (ControlBase) </param>
	/// </function>
	this.OnFocus = function(cb)
	{
		Fit.Validation.ExpectFunction(cb);
		Fit.Array.Add(onFocusHandlers, cb);
	}

	/// <function container="Fit.Controls.ControlBase" name="OnBlur" access="public">
	/// 	<description> Register OnBlur event handler which is invoked when control loses focus </description>
	/// 	<param name="cb" type="function"> Event handler function which accepts Sender (ControlBase) </param>
	/// </function>
	this.OnBlur = function(cb)
	{
		Fit.Validation.ExpectFunction(cb);
		Fit.Array.Add(onBlurHandlers, cb);
	}

	// ============================================
	// Private
	// ============================================

	function onFocusIn(e)
	{
		// Note on how OnFocus and OnBlur is handled:
		// OnFocus in JS fires for focusable elements only, meaning
		// elements with tabIndex set.
		// If an element within a control is clicked, and that
		// particular element is not focusable, <body> will be
		// focused by the browser, causing the control to lose focus
		// and fire OnBlur.
		// Programmatically re-assigning focus within a control
		// will not cause OnBlur to fire since onFocusIn cancels
		// onFocusOut.
		// Notice that onFocusOut is triggered for an element losing
		// focus before onFocusIn is triggered for an element gaining focus.
		// See http://fiddle.jshell.net/2eha07qt/33 to understand how
		// onFocusIn/Out fires internally and how OnFocus and OnBlur
		// fires externally.

		// Cancel OnBlur
		if (onBlurTimeout !== null)
		{
			clearTimeout(onBlurTimeout);
			onBlurTimeout = null;
		}

		if (waitingForFocus === true) // Ensure FIFO execution of OnFocus and OnBlur - see onFocusOut handler for details
		{
			// Control regained focus while waiting for OnFocus and OnBlur to fire.
			// OnBlur timer was canceled above, so we'll just let the initial FocusIn timer fire.
			// This happens if FIFO execution for timers are not honored.
			// See onFocusOut handler for details.

			waitingForFocus = false;
			return;
		}

		// Make sure OnFocus only fires once when control is initially given
		// focus - prevent it from firing when focus is changed internally.
		if (hasFocus === true)
			return;

		hasFocus = true;

		// Make sure control does in fact fire initial OnFocus event,
		// in case control is only assigned focus shortly - otherwise
		// OnBlur may fire without OnFocus firing first if FIFO execution
		// of timers are not honored. See onFocusOut handler for details.
		ensureFocusFires = true;

		// Queue, event has not reached target yet (using Capture instead of event bubbling).
		// Target must have focus before firing OnFocus. This approach also allow for control
		// to internally change focus (e.g. in TreeView where focus may change from one node
		// to another) which may fire both Focus and Blur multiple times.
		setTimeout(function()
		{
			if (me === null)
				return; // Control was disposed

			ensureFocusFires = false;

			me._internal.FireOnFocus();
		}, 0);
	}

	function onFocusOut(e)
	{
		// See comments in onFocusIn(..)

		var fireBlur = null;
		fireBlur = function()
		{
			if (me === null)
				return; // Control was disposed

			if (ensureFocusFires === true) // Make absolutely sure initial OnFocus has fired before firing OnBlur
			{
				// Browsers can, in some situations, disregard FIFO execution for timers, for instance when attaching
				// a debugger, or if the browser suspends JS execution due to power management, especially on mobile devices.
				// Since the control has already lost focus at this point, it's safe to schedule another
				// timer to fire OnBlur once OnFocus has been fired. We will keep checking to make sure OnFocus fires first.
				// OnFocusOut should not be called again since the control no longer has focus, and if the control regains focus
				// while waiting for OnFocus and OnBlur to fire, then onFocusIn will cancel the OnBlur timer and let the
				// initial OnFocus timer execute (see the use of waitingForFocus in onFocusIn).
				// To simulate the FIFO problem, set the OnFocus timer to timeout late, e.g. after 1500 ms.
				// Then focus the control and immediately remove focus from it again. Register an OnFocus
				// and OnBlur handler to observe that OnFocus does in fact fire before OnBlur.
				waitingForFocus = true;

				onBlurTimeout = setTimeout(fireBlur, 0);
				return;
			}

			onBlurTimeout = null;
			waitingForFocus = false;
			hasFocus = false; // Control has lost focus, allow OnFocus to fire again when it regains focus

			me._internal.FireOnBlur();
		};

		onBlurTimeout = setTimeout(fireBlur, 0);
	}

	function updateInternalState()
	{
		txtValue.value = me.Value().toString(); // TBD: Why .toString() ? It always returns a string!
		txtDirty.value = ((me.IsDirty() === true) ? "1" : "0");
		txtValid.value = ((me.IsValid() === true) ? "1" : "0");

		me._internal.Data("dirty", ((me.IsDirty() === true) ? "true" : "false"));
	}

	function localize()
	{
		if (validationErrorType === 0 /*&& me._internal.Data("errormessage") !== null*/)
		{
			var locale = Fit.Internationalization.GetSystemLocale();
			me._internal.Data("errormessage", locale.Translations.Required);
		}
	}

	// Private members (must be public in order to be accessible to controls extending from ControlBase)

	this._internal.FireOnChange = function()
	{
		hasValidated = true;
		me._internal.Validate();
		updateInternalState();

		Fit.Array.ForEach(onChangeHandlers, function(cb)
		{
			cb(me);
		});
	},

	this._internal.FireOnFocus = function()
	{
		me._internal.Data("focused", "true");
		me._internal.Repaint();

		Fit.Array.ForEach(onFocusHandlers, function(cb)
		{
			cb(me);
		});
	},

	this._internal.FireOnBlur = function()
	{
		me._internal.Data("focused", "false");
		me._internal.Repaint();

		Fit.Array.ForEach(onBlurHandlers, function(cb)
		{
			cb(me);
		});
	},

	this._internal.ExecuteWithNoOnChange = function(cb)
	{
		Fit.Validation.ExpectFunction(cb);

		var onChangeHandler = me._internal.FireOnChange;
		me._internal.FireOnChange = function() {};

		var error = null;

		try // Try/catch to make absolutely sure OnChange handler is restored!
		{
			cb();
		}
		catch (err)
		{
			error = err.message;
		}

		me._internal.FireOnChange = onChangeHandler;

		if (error !== null)
			Fit.Validation.ThrowError(error);
	}

	this._internal.Data = function(key, val)
	{
		Fit.Validation.ExpectStringValue(key);
		Fit.Validation.ExpectString(val, true);

		if (Fit.Validation.IsSet(val) === true || val === null)
			Fit.Dom.Data(container, key, val);

		return Fit.Dom.Data(container, key);
	},

	this._internal.AddDomElement = function(elm)
	{
		Fit.Validation.ExpectDomElement(elm);
		Fit.Dom.InsertBefore(txtValue, elm); //Fit.Dom.Add(container, elm);
	},

	this._internal.RemoveDomElement = function(elm)
	{
		Fit.Validation.ExpectDomElement(elm);
		Fit.Dom.Remove(elm);
	},

	this._internal.Validate = function(force)
	{
		Fit.Validation.ExpectBoolean(force, true);

		// For LazyValidation the UI is only updated if control has focus, unless force is true
		if (lazyValidation === true && me.Focused() === false && force !== true)
			return;

		var valid = me.IsValid();

		me._internal.Data("valid", valid.toString());

		if (valid === false)
		{
			if (validationErrorType === 0)
				me._internal.Data("errormessage", Fit.Internationalization.GetSystemLocale().Translations.Required);
			else if (validationErrorType === 1 && validationError !== null)
				me._internal.Data("errormessage", validationError.replace("\r", "").replace(/<br.*>/i, "\n"));
			else if (validationErrorType === 2 && validationHandlerError !== null)
				me._internal.Data("errormessage", validationHandlerError.replace("\r", "").replace(/<br.*>/i, "\n"));
			else if (validationErrorType === 3 && validationCallbackError !== null)
				me._internal.Data("errormessage", validationCallbackError.replace("\r", "").replace(/<br.*>/i, "\n"));
		}
		else
		{
			me._internal.Data("errormessage", null);
		}

		me._internal.Repaint();
	}

	init();
}

// ============================================
// Public static
// ============================================

/// <function container="Fit.Controls" name="Find" access="public" static="true" returns="object">
/// 	<description> Get control by unique Control ID - returns Null if not found </description>
/// 	<param name="id" type="string"> Unique Control ID </param>
/// </function>
Fit.Controls.Find = function(id)
{
	Fit.Validation.ExpectStringValue(id);
	return ((Fit._internal.ControlBase.Controls[id] !== undefined) ? Fit._internal.ControlBase.Controls[id] : null);
}

/// <function container="Fit.Controls" name="ValidateAll" access="public" static="true" returns="boolean">
/// 	<description>
/// 		Validate all controls - either all controls on page, or within specified scope.
/// 		Returns True if all controls contain valid values, otherwise False.
/// 	</description>
/// 	<param name="scope" type="string" default="undefined">
/// 		If specified, validate controls only within this scope.
/// 		See Fit.Controls.ControlBase.Scope(..)
/// 		for details on configurering scoped validation.
/// 	</param>
/// </function>
Fit.Controls.ValidateAll = function(scope)
{
	Fit.Validation.ExpectStringValue(scope, true);

	var result = true;

	Fit.Array.ForEach(Fit._internal.ControlBase.Controls, function(controlId)
	{
		var control = Fit._internal.ControlBase.Controls[controlId];

		if (Fit.Core.InstanceOf(control, Fit.Controls.ControlBase) === false)
			return;

		if (Fit.Validation.IsSet(scope) === true && control.Scope() !== scope)
			return;

		control._internal.Validate(true);

		if (control.IsValid() === false)
			result = false;
	});

	return result;
}

/// <function container="Fit.Controls" name="DirtyCheckAll" access="public" static="true" returns="boolean">
/// 	<description>
/// 		Check dirty state for all controls - either all controls on page, or within specified scope.
/// 		Returns True if one or more controls are dirty, otherwise False.
/// 	</description>
/// 	<param name="scope" type="string" default="undefined">
/// 		If specified, dirty check controls only within this scope.
/// 		See Fit.Controls.ControlBase.Scope(..)
/// 		for details on configurering scoped validation.
/// 	</param>
/// </function>
Fit.Controls.DirtyCheckAll = function(scope)
{
	Fit.Validation.ExpectStringValue(scope, true);

	var result = false;

	Fit.Array.ForEach(Fit._internal.ControlBase.Controls, function(controlId)
	{
		var control = Fit._internal.ControlBase.Controls[controlId];

		if (Fit.Core.InstanceOf(control, Fit.Controls.ControlBase) === false)
			return;

		if (Fit.Validation.IsSet(scope) === true && control.Scope() !== scope)
			return;

		if (control.IsDirty() === true)
		{
			result = true;
			return false; // Break loop
		}
	});

	return result;
}

/// <container name="Fit.Cookies">
/// 	Cookie functionality.
/// 	Set/Get/Remove functions can be invoked as static members, or an instance of Fit.Cookies
/// 	can be created to isolate cookies to either the current path or a custom path.
/// </container>

/// <function container="Fit.Cookies" name="Cookies" access="public">
/// 	<description> Create instance of cookie container isolated to either current path or a custom path </description>
/// </function>
Fit.Cookies = function()
{
	var me = this;
	var path = location.pathname.match(/^.*\//)[0]; // Examples: / OR /sub/ OR /sub/sub/sub/
	var prefix = "";

	function init()
	{
		// Remove trailing slash for path determined automatically,
		// to prevent double slashes when doing this: cookieContainer.Path() + "/sub"
		// Actually a trailing slash should be used for the path, but fortunately
		// Fit.Cookies.Set(..) makes sure to add it if missing.
		path = path.substring(0, path.length - 1);
	}

	/// <function container="Fit.Cookies" name="Path" access="public" returns="string">
	/// 	<description> Get/set path to which cookies are isolated </description>
	/// 	<param name="val" type="string" default="undefined"> If defined, changes isolation to specified path </param>
	/// </function>
	this.Path = function(val)
	{
		Fit.Validation.ExpectStringValue(val, true);

		if (Fit.Validation.IsSet(val) === true)
		{
			path = val;
		}

		return path;
	}

	/// <function container="Fit.Cookies" name="Prefix" access="public" returns="string">
	/// 	<description>
	/// 		Get/set prefix added to all cookies - useful for grouping related cookies and to avoid naming conflicts.
	/// 		Notice that Set/Get/Remove functions automatically apply the prefix to cookie names, so the use of a prefix
	/// 		is completely transparent.
	/// 	</description>
	/// 	<param name="val" type="string" default="undefined"> If defined, changes cookie prefix to specified value </param>
	/// </function>
	this.Prefix = function(val)
	{
		Fit.Validation.ExpectString(val, true);

		if (Fit.Validation.IsSet(val) === true)
		{
			prefix = val;
		}

		return prefix;
	}

	/// <function container="Fit.Cookies" name="Set" access="public">
	/// 	<description> Create or update cookie </description>
	/// 	<param name="name" type="string"> Unique cookie name </param>
	/// 	<param name="value" type="string"> Cookie value (cannot contain semicolon!) </param>
	/// 	<param name="seconds" type="integer" default="undefined">
	/// 		Optional expiration time in seconds. Creating a cookie with
	/// 		no expiration time will cause it to expire when session ends.
	/// 	</param>
	/// </function>
	this.Set = function(name, value, seconds)
	{
		Fit.Validation.ExpectStringValue(name);
		Fit.Validation.ExpectString(value);
		Fit.Validation.ExpectInteger(seconds, true);

		Fit.Cookies.Set(prefix + name, value, seconds, (path !== "" ? path : null));
	}

	/// <function container="Fit.Cookies" name="Get" access="public" returns="string">
	/// 	<description> Returns cookie value if found, otherwise Null </description>
	/// 	<param name="name" type="string"> Unique cookie name </param>
	/// </function>
	this.Get = function(name)
	{
		Fit.Validation.ExpectStringValue(name);
		return Fit.Cookies.Get(prefix + name);
	}

	/// <function container="Fit.Cookies" name="Remove" access="public">
	/// 	<description> Remove cookie </description>
	/// 	<param name="name" type="string"> Unique cookie name </param>
	/// </function>
	this.Remove = function(name)
	{
		Fit.Validation.ExpectStringValue(name);
		Fit.Cookies.Set(prefix + name, "", -1, path);
	}

	init();
}

/// <function container="Fit.Cookies" name="Set" access="public" static="true">
/// 	<description> Create or update cookie </description>
/// 	<param name="name" type="string"> Unique cookie name </param>
/// 	<param name="value" type="string"> Cookie value (cannot contain semicolon!) </param>
/// 	<param name="seconds" type="integer" default="undefined">
/// 		Optional expiration time in seconds. Creating a cookie with
/// 		no expiration time will cause it to expire when session ends.
/// 	</param>
/// 	<param name="path" type="string" default="undefined">
/// 		Optional cookie path.
/// 		Specifying no path makes cookie accessible to entire domain.
/// 	</param>
/// </function>
Fit.Cookies.Set = function(name, value, seconds, path)
{
	Fit.Validation.ExpectStringValue(name);
	Fit.Validation.ExpectString(name);
	Fit.Validation.ExpectInteger(seconds, true);
	Fit.Validation.ExpectStringValue(path, true);

	if (value.indexOf(';') > -1)
		Fit.Validation.ThrowError("Unable to set cookie - value contains illegal character: ';'");

	value = value.replace(/\n/g, "\\n"); // Preserve line breaks which would otherwise break cookie value

	var date = null;

	if (Fit.Validation.IsSet(seconds) === true)
	{
		date = new Date();
		date.setTime(date.getTime() + (seconds * 1000));
	}

	document.cookie = name + "=" + value + ((date !== null) ? "; expires=" + date.toGMTString() : "") + "; path=" + ((Fit.Validation.IsSet(path) === true) ? path + ((path[path.length-1] !== "/") ? "/" : "") : "/");
}

/// <function container="Fit.Cookies" name="Get" access="public" static="true" returns="string">
/// 	<description> Returns cookie value if found, otherwise Null </description>
/// 	<param name="name" type="string"> Unique cookie name </param>
/// </function>
Fit.Cookies.Get = function(name)
{
	Fit.Validation.ExpectStringValue(name);

	var cookieName = name + "=";
	var cookies = document.cookie.split(";");
	var cookie = null;

	for (var i = 0 ; i < cookies.length ; i++)
	{
		cookie = cookies[i];

		while (cookie.charAt(0) === " ")
			cookie = cookie.substring(1, cookie.length);

		if (cookie.indexOf(cookieName) === 0)
			return cookie.substring(cookieName.length, cookie.length).replace(/\\n/g, "\n");
	}

	return null;
}

/// <function container="Fit.Cookies" name="Remove" access="public" static="true">
/// 	<description> Remove cookie </description>
/// 	<param name="name" type="string"> Unique cookie name </param>
/// 	<param name="path" type="string" default="undefined">
/// 		Optional cookie path.
/// 		If cookie was defined on a custom path, the
/// 		same path must be specified to remove the cookie.
/// 	</param>
/// </function>
Fit.Cookies.Remove = function(name, path)
{
	Fit.Validation.ExpectStringValue(name);
	Fit.Validation.ExpectStringValue(path, true);

	Fit.Cookies.Set(name, "", -1, path);
}

// =====================================
// Data
// =====================================

Fit.Data = {};

/// <function container="Fit.Data" name="CreateGuid" access="public" static="true" returns="string">
/// 	<description> Returns Version 4 compliant GUID </description>
/// 	<param name="dashFormat" type="boolean" default="true">
/// 		Flag indicating whether to use format with or without dashes.
/// 		True = With dashes (default): 57df75f2-3d09-48ca-9c94-f64a5986518f (length = 36)
/// 		False = Without dashes: 57df75f23d0948ca9c94f64a5986518f (length = 32)
/// 	</param>
/// </function>
Fit.Data.CreateGuid = function(dashFormat)
{
	Fit.Validation.ExpectBoolean(dashFormat, true);

	/*
	// Test case proving that unique GUIDs are generated every time.
	// Use a powerful computer to run this test, and a fast browser (e.g. Safari).

	var guids = {};
	var minors = 0;

	for (var i = 0 ; i < 25000000 ; i++) // 25 million
	{
		var g = Fit.Data.CreateGuid();

		minors++;
		if (minors === 5000)
		{
			console.log("5000 more GUIDs generated");
			minors = 0;
		}

		if (guids[g])
		{
			alert("GUID already in use: " + g);
			break;
		}
		else
		{
			guids[g] = 1;
		}
	}
	*/

	var chars = "0123456789abcdef".split("");

	var uuid = new Array();
	var rnd = Math.random;
	var r = -1;

	if (dashFormat !== false) uuid[8] = "-";
	if (dashFormat !== false) uuid[13] = "-";
	uuid[14] = "4"; // version 4 compliant
	if (dashFormat !== false) uuid[18] = "-";
	if (dashFormat !== false) uuid[23] = "-";

	var length = 32 + ((dashFormat !== false) ? 4 : 0);

	for (var i = 0 ; i < length ; i++)
	{
		if (uuid[i] !== undefined)
			continue;

		r = 0 | rnd() * 16;

		uuid[i] = chars[((i === 19) ? (r & 0x3) | 0x8 : r & 0xf)];
	}

	return uuid.join("");
}


// =====================================
// Math
// =====================================

/// <container name="Fit.Math">
/// 	Math related functionality.
/// </container>
Fit.Math = {};

/// <container name="Fit.Math.MidpointRounding">
/// 	Enum values determining how a rounding mechanism processes a number that is midway between two numbers.
/// </container>
Fit.Math.MidpointRounding =
{
	/// <member container="Fit.Math.MidpointRounding" name="Up" access="public" static="true" type="string" default="Up">
	/// 	<description>
	/// 		When a number is midway between two others, the value is rounded up towards a positive value. Examples:
	/// 		1.4 becomes 1, 1.5 (midway) becomes 2, and 1.6 becomes 2.
	/// 		-1,4 becomes 1, -1,5 (midway) becomes -1, and -1.6 becomes -2.
	/// 		This is the default behaviour for JavaScript's Math.round(..) function.
	/// 	</description>
	/// </member>
	Up: "Up",

	/// <member container="Fit.Math.MidpointRounding" name="Down" access="public" static="true" type="string" default="Down">
	/// 	<description>
	/// 		When a number is midway between two others, the value is rounded down towards a negative value. Examples:
	/// 		1.4 becomes 1, 1.5 (midway) becomes 1, and 1.6 becomes 2.
	/// 		-1,4 becomes -1, -1,5 (midway) becomes -2, and -1.6 becomes -2.
	/// 		This is the reverse behaviour of Fit.Math.MidpointRounding.Up.
	/// 	</description>
	/// </member>
	Down: "Down",

	/// <member container="Fit.Math.MidpointRounding" name="AwayFromZero" access="public" static="true" type="string" default="AwayFromZero">
	/// 	<description>
	/// 		When a number is midway between two others, the value is rounded towards the nearest number away from zero. Examples:
	/// 		1.4 becomes 1, 1.5 (midway) becomes 2, and 1.6 becomes 2.
	/// 		-1,4 becomes 1, -1,5 (midway) becomes -2, and -1.6 becomes -2.
	/// 		This is the default behaviour of PHP's round(..) function.
	/// 	</description>
	/// </member>
	AwayFromZero: "AwayFromZero"
}

/// <function container="Fit.Math" name="Round" access="public" static="true" returns="number">
/// 	<description> Round off value to a number with the specified precision </description>
/// 	<param name="value" type="number"> Number to round off </param>
/// 	<param name="precision" type="integer"> Desired precision </param>
/// 	<param name="midpointRounding" type="Fit.Math.MidpointRounding" default="undefined">
/// 		Argument specifies how the function processes a number that is midway between
/// 		two numbers - defaults to Fit.Math.MidpointRounding.AwayFromZero if not specified.
/// 	</param>
/// </function>
Fit.Math.Round = function(value, precision, midpointRounding)
{
	Fit.Validation.ExpectNumber(value);
	Fit.Validation.ExpectInteger(precision, true);

	if (Fit.Validation.IsSet(midpointRounding) === true && Fit.Validation.IsSet(Fit.Math.MidpointRounding[midpointRounding]) === false)
		Fit.Validation.ThrowError("Unsupported MidpointRounding specified - use e.g. Fit.Math.MidpointRounding.Up");
	
	var decimals = ((Fit.Validation.IsSet(precision) === true) ? precision : 0);
	var mpr = (midpointRounding ? midpointRounding : Fit.Math.MidpointRounding.AwayFromZero);

    var factor = 1;
	for (var i = 0 ; i < decimals ; i++) factor = factor * 10;

	var res = null;

	if (mpr === Fit.Math.MidpointRounding.Up)
	{
		// Math.round(..) always round up numbers from midpoint (.5) towards a positive number
		//  2.5 = 3
		// -2.5 = -2

		res = Math.round(value * factor) / factor;
	}
	else if (mpr === Fit.Math.MidpointRounding.AwayFromZero)
	{
		// To round away from zero simply make sure rounding is always performed
		// on a positive number, and then turn it back into a negative number if
		// the value was initially negative.
		//  2.5 = 3
		// -2.5 = -3

		res = (value < 0 ? -1 : 1) * Math.round(Math.abs(value * factor)) / factor;
	}
	else //if (mpr === Fit.Math.MidpointRounding.Down)
	{
		// To round down simply reverse positive to negative and
		// negative to positive before rounding, and then back to its initial sign.
		//  2.5 = 2
		// -2.5 = -3

		res = -1 * Math.round(-1 * value * factor) / factor;
	}

	return res;
}

/// <function container="Fit.Math" name="Format" access="public" static="true" returns="string">
/// 	<description>
/// 		Format value to produce a number with the specified number of decimals.
/// 		Value is properly rounded off to ensure best precision.
/// 	</description>
/// 	<param name="value" type="number"> Number to format </param>
/// 	<param name="decimals" type="integer"> Desired number of decimals </param>
/// 	<param name="decimalSeparator" type="string" default="undefined">
/// 		If defined, the specified decimal separator will be used
/// 	</param>
/// </function>
Fit.Math.Format = function(value, decimals, decimalSeparator)
{
	Fit.Validation.ExpectNumber(value);
	Fit.Validation.ExpectInteger(decimals, true);
	Fit.Validation.ExpectString(decimalSeparator, true);

	var res = Fit.Math.Round(value, decimals);

    if (decimals <= 0)
        return res.toString();

    var str = ((res % 1 === 0) ? res.toString() + ".0" : res.toString());

    for (var i = str.split(".")[1].length ; i < decimals ; i++)
        str += "0";

    return ((Fit.Validation.IsSet(decimalSeparator) === true) ? str.replace(".", decimalSeparator) : str);
}

/// <function container="Fit.Math" name="Random" access="public" static="true" returns="integer">
/// 	<description> Get random integer value </description>
/// 	<param name="min" type="integer" default="undefined"> Minimum value - assumes 0 if not defined </param>
/// 	<param name="max" type="integer" default="undefined"> Maximum value - assumes Number.MAX_SAFE_INTEGER (9007199254740991) if not defined </param>
/// </function>
Fit.Math.Random = function(min, max)
{
	Fit.Validation.ExpectInteger(min, true);
	Fit.Validation.ExpectInteger(max, true);

	var mn = Fit.Validation.IsSet(min) === true ? min : 0;
	var mx = Fit.Validation.IsSet(max) === true ? max : 9007199254740991; // Number.MAX_SAFE_INTEGER not supported by IE

	return Math.floor(Math.random() * (mx - mn + 1)) + mn;
}


// =====================================
// String
// =====================================

Fit.String = {};

/// <function container="Fit.String" name="Trim" access="public" static="true" returns="string">
/// 	<description> Removes any whitespaces in beginning and end of string passed, and returns the new string </description>
/// 	<param name="str" type="string"> String to trim </param>
/// </function>
Fit.String.Trim = function(str)
{
	Fit.Validation.ExpectString(str);
	return str.replace(/^\s+|\s+$/g, "");
}

/// <function container="Fit.String" name="StripHtml" access="public" static="true" returns="string">
/// 	<description> Removes any HTML contained in string, and returns the raw text value </description>
/// 	<param name="str" type="string"> String to strip HTML from </param>
/// </function>
Fit.String.StripHtml = function(str)
{
	Fit.Validation.ExpectString(str);

	return str.replace(/(<([^>]+)>)/g, "");

	// Disabled - whitespaces are not preserved!
	/*var span = document.createElement("span");
	span.innerHTML = str;
	return Fit.String.Trim(Fit.Dom.Text(span));*/
}

/// <function container="Fit.String" name="EncodeHtml" access="public" static="true" returns="string">
/// 	<description> Encode special characters into HTML entities </description>
/// 	<param name="str" type="string"> String to encode </param>
/// </function>
Fit.String.EncodeHtml = function(str)
{
	Fit.Validation.ExpectString(str);
	return str.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/'/g, "&#39;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
}

/// <function container="Fit.String" name="DecodeHtml" access="public" static="true" returns="string">
/// 	<description> Decode special characters represented as HTML entities back into their actual characters </description>
/// 	<param name="str" type="string"> String to decode </param>
/// </function>
Fit.String.DecodeHtml = function(str)
{
	Fit.Validation.ExpectString(str);
	return str.replace(/&quot;/g, "\"").replace(/&#39;/g, "'").replace(/&#039;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");
}

/// <function container="Fit.String" name="Hash" access="public" static="true" returns="integer">
/// 	<description> Get Java compatible Hash Code from string </description>
/// 	<param name="str" type="string"> String to get hash code from </param>
/// </function>
Fit.String.Hash = function(str)
{
	Fit.Validation.ExpectString(str);

	if (str.length == 0) return 0;

	var hash = 0;
	var chr = '';

	for (var i = 0 ; i < str.length ; i++)
	{
		chr = str.charCodeAt(i);
		hash = ((hash << 5) - hash) + chr;
		hash = hash & hash;
	}

	return hash;
}

/// <function container="Fit.String" name="UpperCaseFirst" access="public" static="true" returns="string">
/// 	<description> Returns string with first letter upper cased </description>
/// 	<param name="str" type="string"> String to turn first letter into upper case </param>
/// </function>
Fit.String.UpperCaseFirst = function(str)
{
	Fit.Validation.ExpectString(str);

	if (str === "")
		return str;

	return str[0].toUpperCase() + str.slice(1);
}


// =====================================
// Date
// =====================================

Fit.Date = {};

/// <function container="Fit.Date" name="Format" access="public" static="true" returns="string">
/// 	<description>
/// 		Format instance of Date.
/// 		Example: Fit.Date.Format(new Date(), &quot;YYYY-MM-DD hh:mm:ss&quot;);
/// 		Result: 2016-06-18 15:23:48
///
/// 		Date can be formatted using the following variables:
/// 		YYYY: 4 digits year (e.g. 2016)
/// 		YY: 2 digits year (e.g. 16)
/// 		MM: 2 digits month (e.g. 04)
/// 		M: Prefer 1 digit month if possible (e.g. 4)
/// 		DD: 2 digits day (e.g. 09)
/// 		D: Prefer 1 digit day if possible (e.g. 9)
/// 		W: 1 digit week number (e.g. 35)
/// 		hh: 2 digits hours value (e.g. 08)
/// 		h: 1 digit hours value if possible (e.g. 8)
/// 		mm: 2 digits minutes value (e.g. 02)
/// 		m: 1 digit minutes value if possible (e.g. 2)
/// 		ss: 2 digits seconds value (e.g. 05)
/// 		s: 1 digit seconds value if possible (e.g. 5)
/// 	</description>
/// 	<param name="date" type="Date"> Date to format as string </param>
/// 	<param name="format" type="string"> Date format </param>
/// </function>
Fit.Date.Format = function(date, format)
{
	Fit.Validation.ExpectDate(date);
	Fit.Validation.ExpectString(format);

	format = format.replace(/YYYY/g, date.getFullYear().toString());
	format = format.replace(/YY/g, date.getFullYear().toString().substring(2));
	format = format.replace(/Y/g, parseInt(date.getFullYear().toString().substring(2), 10).toString());
	format = format.replace(/MM/g, ((date.getMonth() + 1 <= 9) ? "0" : "") + (date.getMonth() + 1));
	format = format.replace(/M/g, (date.getMonth() + 1).toString());
	format = format.replace(/DD/g, ((date.getDate() <= 9) ? "0" : "") + date.getDate());
	format = format.replace(/D/g, date.getDate().toString());
	format = format.replace(/W/g, Fit.Date.GetWeek(date).toString());
	format = format.replace(/hh/g, ((date.getHours() <= 9) ? "0" : "") + date.getHours());
	format = format.replace(/h/g, date.getHours().toString());
	format = format.replace(/mm/g, ((date.getMinutes() <= 9) ? "0" : "") + date.getMinutes());
	format = format.replace(/m/g, date.getMinutes().toString());
	format = format.replace(/ss/g, ((date.getSeconds() <= 9) ? "0" : "") + date.getSeconds());
	format = format.replace(/s/g, date.getSeconds().toString());

	return format;
}

/// <function container="Fit.Date" name="Parse" access="public" static="true" returns="Date">
/// 	<description>
/// 		Parse date as string into an instance of Date - example: 18-09/2016 17:03:21
/// 	</description>
/// 	<param name="strDate" type="string"> Date as string </param>
/// 	<param name="format" type="string">
/// 		Specify date format used to allow parser to determine which parts of the string
/// 		is Year, Month, Day, etc. The same variables used for Fit.Date.Format
/// 		can be used, except for W (week).
/// 		Since the parser do not need to know the length of the different parts that
/// 		makes up the Date, one can simply use the shorter variable format: Y, M, D, h, m, s.
/// 		Be aware that the Parse function does not support a Year represented by a
/// 		2 digit value, since it will be impossible to determine which century it belongs to.
/// 		Example: D-M/Y h:m:s
/// 	</param>
/// </function>
Fit.Date.Parse = function(strDate, format)
{
	Fit.Validation.ExpectString(strDate);
	Fit.Validation.ExpectString(format);

	// Format validation

	var regEx = format; // Example: D-M/Y h:m:s
	regEx = regEx.replace(/Y{1,4}/, "\\d{4}");
	regEx = regEx.replace(/M{1,2}/, "\\d{1,2}");
	regEx = regEx.replace(/D{1,2}/, "\\d{1,2}");
	regEx = regEx.replace(/h{1,2}/, "\\d{1,2}");
	regEx = regEx.replace(/m{1,2}/, "\\d{1,2}");
	regEx = regEx.replace(/s{1,2}/, "\\d{1,2}");
	regEx = regEx.replace(/\//g, "\\/"); // Allow use of slash by escaping it (/ => \/)
	regEx = "^" + regEx + "$";
	var regExp = new RegExp(regEx);

	if (regExp.test(strDate) === false)
		throw "InvalidDateFormat - Value '" + strDate + "' does not match format '" + format + "'";

	// Extract numbers from string date

	var regex = /\d+/g;
	var match = null;
	var matches = [];

	while ((match = regex.exec(strDate)) !== null)
	{
		Fit.Array.Add(matches, match[0]);
	}

	// Construct array with supported date parts

	var date = new Date(); //new Date(0); // Jan 01 1970 01:00:00

	var parts =
	[
		{ Name: "Year", Key: "Y", Index: -1, Value: date.getFullYear() },
		{ Name: "Month", Key: "M", Index: -1, Value: date.getMonth() + 1 },
		{ Name: "Day", Key: "D", Index: -1, Value: date.getDate() },
		{ Name: "Hours", Key: "h", Index: -1, Value: date.getHours() },
		{ Name: "Minutes", Key: "m", Index: -1, Value: date.getMinutes() },
		{ Name: "Seconds", Key: "s", Index: -1, Value: date.getSeconds() }
	];

	// Create getter that allows us to retrieve date part value by its Key

	parts.getVal = function(key/*, asString*/)
	{
		var res = null;

		Fit.Array.ForEach(this, function(part)
		{
			if (key === part.Key)
			{
				res = part.Value;
				return false;
			}
		});

		return res;
	}

	// Determine where various date parts are found in date string

	Fit.Array.ForEach(parts, function(part)
	{
		part.Index = format.indexOf(part.Key);
	});

	// Sort date parts accordingly to order in date string

	parts.sort(function(a, b)
	{
		return ((a.Index !== -1) ? a.Index : 999999) - ((b.Index !== -1) ? b.Index : 999999);
	});

	// Update date part values previously parsed out from date string using RegEx

	var idx = -1;

	Fit.Array.ForEach(parts, function(part)
	{
		if (part.Index !== -1)
		{
			idx++;

			if (idx > matches.length - 1)
				throw "InvalidDateFormat - " + part.Name + " not found in value";

			part.Value = parseInt(matches[idx], 10); // Radix (10) set to prevent some implementations of ECMAScript (e.g. on IE8) to intepret the value as octal (https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/parseInt)

			if (part.Key === "Y" && part.Value < 1000) // In case value was specified as e.g. 0001 or 0111. The Date(year, month, day, ...) implementation requires the year to be at least 3 digits which is odd, so let's restrict it to 4 which is more intuitive. More on the topic here: https://stackoverflow.com/questions/29968116/javascript-date-01-01-0001.
				throw "InvalidDataFormat - value '" + part.Value + "' is not valid for '" + part.Name + "'";
			if (part.Key === "M" && (part.Value < 0 || part.Value > 12))
				throw "InvalidDataFormat - value '" + part.Value + "' is not valid for '" + part.Name + "'";
			if (part.Key === "D" && (part.Value < 0 || part.Value > 31))
				throw "InvalidDataFormat - value '" + part.Value + "' is not valid for '" + part.Name + "'";
			if (part.Key === "h" && (part.Value < 0 || part.Value > 23))
				throw "InvalidDataFormat - value '" + part.Value + "' is not valid for '" + part.Name + "'";
			if ((part.Key === "m" || part.Key === "s") && (part.Value < 0 || part.Value > 59))
				throw "InvalidDataFormat - value '" + part.Value + "' is not valid for '" + part.Name + "'";

			if (part.Key === "M")
				part.Value = part.Value - 1; // Month is zero-based
		}
	});

	var dt = new Date(parts.getVal("Y"), parts.getVal("M"), parts.getVal("D", true), 0, 0, 0);

	dt.setHours(parseInt(parts.getVal("h"), 10));
	dt.setMinutes(parseInt(parts.getVal("m"), 10));
	dt.setSeconds(parseInt(parts.getVal("s"), 10));

	return dt;
}

/// <function container="Fit.Date" name="GetWeek" access="public" static="true" returns="integer">
/// 	<description> Get ISO 8601 week number from date </description>
/// 	<param name="date" type="Date"> Date to get week number from </param>
/// </function>
Fit.Date.GetWeek = function(date) // ISO 8601 - use MomentJS for wider support!
{
	Fit.Validation.ExpectDate(date);

	// https://en.wikipedia.org/wiki/Date_and_time_representation_by_country
	// https://en.wikipedia.org/wiki/Week#Week_numbering
	// http://stackoverflow.com/questions/6117814/get-week-of-year-in-javascript-like-in-php/6117889#6117889 (ISO 8601)

	var d = new Date(date.getTime()); // Copy date - do not modify original

	d.setHours(0, 0, 0); // Set hours, minutes, and seconds
	d.setDate(d.getDate() + 4 - (d.getDay() || 7)); // Set to nearest Thursday (make Sunday day no. 7 instead of 0)

	var yearStart = new Date(d.getFullYear(), 0, 1);
	var week = Math.ceil((((d.getTime() - yearStart.getTime()) / (24 * 60 * 60 * 1000)) + 1) / 7);

	return week;

	// http://javascript.about.com/library/blweekyear.htm
	//var janFirst = new Date(date.getFullYear(), 0, 1);
	//return Math.ceil((((date - janFirst) / 86400000) + janFirst.getDay() + ((useIso8601 !== true) ? 1 : 0) ) / 7);
}


// =====================================
// Color
// =====================================

Fit.Color = {};

/// <function container="Fit.Color" name="RgbToHex" access="public" static="true" returns="string">
/// 	<description> Convert RGB colors into HEX color string - returns Null in case of invalid RGB values </description>
/// 	<param name="r" type="integer"> Color index for red </param>
/// 	<param name="g" type="integer"> Color index for green </param>
/// 	<param name="b" type="integer"> Color index for blue </param>
/// </function>
Fit.Color.RgbToHex = function(r, g, b)
{
	Fit.Validation.ExpectNumber(r);
	Fit.Validation.ExpectNumber(g);
	Fit.Validation.ExpectNumber(b);

	if (r < 0 || r > 255 || g < 0 || g > 255 || b < 0 || b > 255)
		return null;

    var rHex = r.toString(16);
    var gHex = g.toString(16);
    var bHex = b.toString(16);

    return ("#" + ((rHex.length === 1) ? "0" : "") + rHex + ((gHex.length === 1) ? "0" : "") + gHex + ((bHex.length === 1) ? "0" : "") + bHex).toUpperCase();
}

/// <function container="Fit.Color" name="HexToRgb" access="public" static="true" returns="string">
/// 	<description> Convert HEX color string into RGB color string - returns Null in case of invalid HEX value </description>
/// 	<param name="hex" type="string"> HEX color string, e.g. #C0C0C0 (hash symbol is optional) </param>
/// </function>
Fit.Color.HexToRgb = function(hex)
{
	Fit.Validation.ExpectString(hex);

	var rgb = Fit.Color.ParseHex(hex);

	if (rgb === null)
		return null;

	return "rgb(" + rgb.Red + ", " + rgb.Green + ", " + rgb.Blue + ")";
}

/// <function container="Fit.Color" name="ParseHex" access="public" static="true" returns="object">
/// 	<description> Convert HEX color string into RGB color object, e.g. { Red: 150, Green: 30, Blue: 185 } - returns Null in case of invalid HEX value </description>
/// 	<param name="hex" type="string"> HEX color string, e.g. #C0C0C0 (hash symbol is optional) </param>
/// </function>
Fit.Color.ParseHex = function(hex)
{
	Fit.Validation.ExpectString(hex);

	var result = hex.match(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);

	if (result === null)
		return null;

	return { Red: parseInt(result[1], 16), Green: parseInt(result[2], 16), Blue: parseInt(result[3], 16) };
}

/// <function container="Fit.Color" name="ParseRgb" access="public" static="true" returns="object">
/// 	<description>
/// 		Parses RGB(A) string and turns result into a RGB(A) color object, e.g.
/// 		{ Red: 100, Green: 100, Blue: 100, Alpha: 0.3 } - returns Null in case of invalid value.
/// 	</description>
/// 	<param name="val" type="string"> RGB(A) color string, e.g. rgba(100, 100, 100, 0.3) or simply 100,100,200,0.3 </param>
/// </function>
Fit.Color.ParseRgb = function(val)
{
	Fit.Validation.ExpectString(val);

	// Parse colors from rgb[a](r, g, b[, a]) string
	var result = val.match(/(\d+)\s*,\s*(\d+)\s*,\s*(\d+)(\s*,\s*(\d*.*\d+))*/); // http://regex101.com/r/rZ7rO2/9

	if (result === null)
		return null;

	var c = {};
	c.Red = parseInt(result[1], 10);
	c.Green = parseInt(result[2], 10);
	c.Blue = parseInt(result[3], 10);
	c.Alpha = ((result[5] !== undefined) ? parseFloat(result[5]) : 1.00);

	return c;
}

/// <container name="Fit.Dom">
/// 	DOM (Document Object Model) manipulation and helper functionality
/// </container>
Fit.Dom = {};
Fit._internal.Dom = {};

// ==========================================================
// CSS
// ==========================================================

/// <function container="Fit.Dom" name="AddClass" access="public" static="true">
/// 	<description> Add CSS class to element if not already found </description>
/// 	<param name="elm" type="DOMElement"> Element on which CSS class is to be added </param>
/// 	<param name="cls" type="string"> CSS class name </param>
/// </function>
Fit.Dom.AddClass = function(elm, cls)
{
	Fit.Validation.ExpectDomElement(elm);
	Fit.Validation.ExpectStringValue(cls);

	if (Fit.Dom.HasClass(elm, cls) === false)
		elm.className += ((elm.className !== "") ? " " : "") + cls;
}

/// <function container="Fit.Dom" name="RemoveClass" access="public" static="true">
/// 	<description> Remove CSS class from element if found </description>
/// 	<param name="elm" type="DOMElement"> Element from which CSS class is to be removed </param>
/// 	<param name="cls" type="string"> CSS class name </param>
/// </function>
Fit.Dom.RemoveClass = function(elm, cls)
{
	Fit.Validation.ExpectDomElement(elm);
	Fit.Validation.ExpectStringValue(cls);

    var arr = elm.className.split(" ");
    var newCls = "";

    Fit.Array.ForEach(arr, function(item)
    {
        if (item !== cls)
            newCls += ((newCls !== "") ? " " : "") + item;
    });

    elm.className = newCls;
}

/// <function container="Fit.Dom" name="HasClass" access="public" static="true" returns="boolean">
/// 	<description> Check whether given DOMElement has specified CSS class registered - returns True if found, otherwise False </description>
/// 	<param name="elm" type="DOMElement"> Element for which CSS class may be registered </param>
/// 	<param name="cls" type="string"> CSS class name </param>
/// </function>
Fit.Dom.HasClass = function(elm, cls)
{
	Fit.Validation.ExpectDomElement(elm);
	Fit.Validation.ExpectStringValue(cls);

    var arr = elm.className.split(" ");
	var found = false;

    Fit.Array.ForEach(arr, function(item)
    {
        if (item === cls)
		{
			found = true;
			return false; // Stop loop
		}
    });

    return found;
}

/// <function container="Fit.Dom" name="GetComputedStyle" access="public" static="true" returns="string">
/// 	<description>
/// 		Get style value applied after stylesheets have been loaded.
/// 		An empty string or null may be returned if style has not been defined or does not exist.
/// 		Make sure not to use shorthand properties (e.g. border-color or padding) as some browsers are
/// 		not capable of calculating these - use the fullly qualified property name (e.g. border-left-color
/// 		or padding-left).
/// 	</description>
/// 	<param name="elm" type="DOMElement"> Element which contains desired CSS style value </param>
/// 	<param name="style" type="string"> CSS style property name </param>
/// </function>
Fit.Dom.GetComputedStyle = function(elm, style)
{
	Fit.Validation.ExpectDomElement(elm);
	Fit.Validation.ExpectStringValue(style);

	var res = null;

    if (window.getComputedStyle) // W3C
	{
		res = window.getComputedStyle(elm)[style];
	}
    else if (elm.currentStyle)
	{
		if (style.indexOf("-") !== -1) // Turn e.g. border-bottom-style into borderBottomStyle which is required by legacy browsers
		{
			var items = style.split("-");
			style = "";

			Fit.Array.ForEach(items, function(i)
			{
				if (style === "")
					style = i;
				else
					style += Fit.String.UpperCaseFirst(i);
			});
		}

        res = elm.currentStyle[style]; // Might return strings rather than useful values - e.g. "3em" or "medium"

		// IE Computed Style fix by Dean Edwards - http://disq.us/p/myl99x
		// Transform values such as 2em or 4pt to actual pixel values.

		if (res !== undefined && res !== null && /^\d+/.test(res) === true && res.toLowerCase().indexOf("px") === -1) // Non-pixel numeric value
		{
			// Save original value
			var orgLeft = elm.style.left;

			// Calculate pixel value
			var runtimeStyle = elm.runtimeStyle.left;
			elm.runtimeStyle.left = elm.currentStyle.left;
			elm.style.left = ((style === "fontSize") ? "1em" : res || 0); // Throws error for a value such as "medium"
			res = elm.style.pixelLeft + "px";

			// Restore value
			elm.style.left = orgLeft;
			elm.runtimeStyle.left = runtimeStyle;
		}
	}

    return (res !== undefined ? res : null);
}

/// <function container="Fit.Dom" name="GetInnerDimensions" access="public" static="true" returns="object">
/// 	<description>
/// 		Returns object with X and Y properties (integers) with inner dimensions of specified
/// 		container. Inner dimensions are width and height with padding and borders substracted.
/// 		Result returned will be as expected no matter the box-sizing model being used.
/// 		The space consumed by scrollbars (if present) can optionally be substracted.
/// 	</description>
/// 	<param name="elm" type="DOMElement"> Element to get inner dimensions for </param>
/// 	<param name="substractScrollbars" type="boolean" default="false"> Set True to substract space consumed by scrollbars </param>
/// </function>
Fit.Dom.GetInnerDimensions = function(elm, substractScrollbars)
{
	Fit.Validation.ExpectDomElement(elm);
	Fit.Validation.ExpectBoolean(substractScrollbars, true);

	if (elm === document.documentElement) // If document element (<html>) is passed
	{
		// Measuring document.documentElement or anything else outside of document.body makes no sense.
		// Content is added to document.body or children within, not within the document element. So the
		// result returned for the document element would not give us any idea as to how much space is
		// available in the document (body). Throw error to prevent programmers from creating unreliable apps.
		Fit.Validation.ThrowError("Unable to determine inner dimensions for document element (<html>). Maybe you wanted Fit.Dom.GetInnerDimensions(document.body) or Fit.Browser.GetViewPortDimensions().");
	}

	// NOTICE:
	// To get the inner dimensions of the document, pass document.body
	// and not document.documentElement! But be aware that document.body
	// does not have the document scrollbars - document.documentElement does.
	// But the scrollbars may affect the amount of space available for document.body,
	// which this function takes into account, just like any other scrollable container.

	var width = elm.offsetWidth;
	var height = elm.offsetHeight;

	if (width !== 0) // Width is 0 if element is either not visible, or truly 0px
	{
		width -= Fit._internal.Dom.GetPx(Fit.Dom.GetComputedStyle(elm, "padding-left"));
		width -= Fit._internal.Dom.GetPx(Fit.Dom.GetComputedStyle(elm, "padding-right"));

		// Substract borders unless dimensions without scrollbars are being requested,
		// in which case borders are not included with calculation based on offsetWidth
		// and clientWidth further down.
		if (elm === document.body || substractScrollbars !== true)
		{
			width -= Fit._internal.Dom.GetPx(Fit.Dom.GetComputedStyle(elm, "border-left-width"));
			width -= Fit._internal.Dom.GetPx(Fit.Dom.GetComputedStyle(elm, "border-right-width"));
		}
	}

	if (height !== 0) // Height is 0 if element is either not visible, or truly 0px
	{
		height -= Fit._internal.Dom.GetPx(Fit.Dom.GetComputedStyle(elm, "padding-top"));
		height -= Fit._internal.Dom.GetPx(Fit.Dom.GetComputedStyle(elm, "padding-bottom"));

		if (elm === document.body || substractScrollbars !== true)
		{
			// Substract borders unless dimensions without scrollbars are being requested,
			// in which case borders are not included with calculation based on offsetHeight
			// and clientHeight further down.
			height -= Fit._internal.Dom.GetPx(Fit.Dom.GetComputedStyle(elm, "border-top-width"));
			height -= Fit._internal.Dom.GetPx(Fit.Dom.GetComputedStyle(elm, "border-bottom-width"));
		}
	}

	if (substractScrollbars === true)
	{
		if (elm === document.body)
		{
			// For document.body the scrollbars are added outside of document.body rather than inside of it,
			// causing the container to be squeezed a bit.
			// Therefore the width of the scrollbars must be added to the width of the container to get the
			// width without scrollbars.
			// A horizontal scrollbar does not affect the height since content just grows vertically.
			// This is different from width where content just overflows the boundaries of document.body.
			width += Fit.Browser.GetViewPortDimensions().Width - document.documentElement.offsetWidth;
		}
		else
		{
			// Substract scrollbars and borders
			width -= elm.offsetWidth - elm.clientWidth;
			height -= elm.offsetHeight - elm.clientHeight;
		}
	}

	return { X: Math.floor(width), Y: Math.floor(height) };
}

Fit.Dom.GetInnerWidth = function(elm) // Backward compatibility
{
	Fit.Validation.ExpectDomElement(elm);
	return Fit.Dom.GetInnerDimensions(elm).X;
}


// ==========================================================
// DOM
// ==========================================================

/// <function container="Fit.Dom" name="IsRooted" access="public" static="true" returns="boolean">
/// 	<description> Returns True if element is rooted in document (appended to body), otherwise False </description>
/// 	<param name="elm" type="DOMNode"> Element to check </param>
/// </function>
Fit.Dom.IsRooted = function(elm)
{
	Fit.Validation.ExpectNode(elm);

	var parent = elm.parentElement;
	while (parent !== null)
	{
		if (parent === document.body)
			return true;

		parent = parent.parentElement;
	}

	return false;
}

/// <function container="Fit.Dom" name="InsertBefore" access="public" static="true">
/// 	<description> Insert DOMNode before another DOMNode </description>
/// 	<param name="target" type="DOMNode"> Element to insert new element before </param>
/// 	<param name="newElm" type="DOMNode"> Element to insert before target element </param>
/// </function>
Fit.Dom.InsertBefore = function(target, newElm)
{
	Fit.Validation.ExpectNode(target);
	Fit.Validation.ExpectNode(newElm);

	if (target.parentElement === null)
		Fit.Validation.ThrowError("Unable to insert element - target is not rooted");

	target.parentElement.insertBefore(newElm, target);
}

/// <function container="Fit.Dom" name="InsertAfter" access="public" static="true">
/// 	<description> Insert DOMNode after another DOMNode </description>
/// 	<param name="target" type="DOMNode"> Element to insert new element after </param>
/// 	<param name="newElm" type="DOMNode"> Element to insert after target element </param>
/// </function>
Fit.Dom.InsertAfter = function(target, newElm)
{
	Fit.Validation.ExpectNode(target);
	Fit.Validation.ExpectNode(newElm);

	if (target.parentElement === null)
		Fit.Validation.ThrowError("Unable to insert element - target is not rooted");

	if (target.nextSibling)
		target.parentElement.insertBefore(newElm, target.nextSibling);
	else
		target.parentElement.appendChild(newElm);
}

/// <function container="Fit.Dom" name="InsertAt" access="public" static="true">
/// 	<description>
/// 		Insert DOMNode at given position.
/// 		Notice that position is relative to contained DOM Elements.
/// 		Text and Comment nodes are ignored.
/// 	</description>
/// 	<param name="container" type="DOMElement"> Container to insert element into </param>
/// 	<param name="position" type="integer"> Position (index) to insert element at </param>
/// 	<param name="newElm" type="DOMNode"> Element to insert </param>
/// </function>
Fit.Dom.InsertAt = function(container, position, newElm)
{
	Fit.Validation.ExpectDomElement(container);
	Fit.Validation.ExpectInteger(position);
	Fit.Validation.ExpectNode(newElm);

	// Notice: InsertAt does not allow insertion based on childNodes as it is unreliable on Legacy IE.

	if (container.children.length === 0 || container.children.length - 1 < position)
	{
		container.appendChild(newElm);
	}
	else
	{
		var before = container.children[position];

		if (before)
			Fit.Dom.InsertBefore(before, newElm);
	}
}

/// <function container="Fit.Dom" name="Replace" access="public" static="true">
/// 	<description> Replace element with another one </description>
/// 	<param name="oldElm" type="DOMNode"> Element to replace (Element, Text, or Comment) </param>
/// 	<param name="newElm" type="DOMNode"> Replacement element (Element, Text, or Comment) </param>
/// </function>
Fit.Dom.Replace = function(oldElm, newElm) // http://jsfiddle.net/Jemt/eu74o984/
{
	Fit.Validation.ExpectNode(oldElm);
	Fit.Validation.ExpectNode(newElm);

	if (oldElm.parentElement === null)
		Fit.Validation.ThrowError("Unable to replace element - not rooted");

	var container = oldElm.parentElement;
	container.replaceChild(newElm, oldElm);
}

/// <function container="Fit.Dom" name="Add" access="public" static="true">
/// 	<description> Add element to container </description>
/// 	<param name="container" type="DOMElement"> Add element to this container </param>
/// 	<param name="elm" type="DOMNode"> Element, Text, or Comment to add to container </param>
/// </function>
Fit.Dom.Add = function(container, elm)
{
	Fit.Validation.ExpectDomElement(container);
	Fit.Validation.ExpectNode(elm);

	container.appendChild(elm);
}

/// <function container="Fit.Dom" name="Remove" access="public" static="true">
/// 	<description> Remove DOMNode from its container element </description>
/// 	<param name="elm" type="DOMNode"> DOMNode to remove </param>
/// </function>
Fit.Dom.Remove = function(elm)
{
	Fit.Validation.ExpectNode(elm);

	if (elm.parentElement === null)
		return; // Element not rooted

	elm.parentElement.removeChild(elm);
}

/// <function container="Fit.Dom" name="Attribute" access="public" static="true" returns="string">
/// 	<description> Get/set attribute on DOMElement </description>
/// 	<param name="elm" type="DOMElement"> DOMElement to which attribute is set and/or returned from </param>
/// 	<param name="name" type="string"> Name of attribute to set or retrieve </param>
/// 	<param name="value" type="string" default="undefined">
/// 		If defined, attribute is updated with specified value.
/// 		Passing Null results in attribute being removed.
/// 	</param>
/// </function>
Fit.Dom.Attribute = function(elm, name, value)
{
	Fit.Validation.ExpectDomElement(elm);
	Fit.Validation.ExpectStringValue(name);
	Fit.Validation.ExpectString(value, true);

	if (Fit.Validation.IsSet(value) === true)
		elm.setAttribute(name, value);
	else if (value === null)
		elm.removeAttribute(name);

	return elm.getAttribute(name);
}

/// <function container="Fit.Dom" name="Data" access="public" static="true" returns="string">
/// 	<description> Get/set data attribute on DOMElement </description>
/// 	<param name="elm" type="DOMElement"> DOMElement to which data attribute is set and/or returned from </param>
/// 	<param name="name" type="string"> Name of data attribute to set or retrieve </param>
/// 	<param name="value" type="string" default="undefined">
/// 		If defined, data attribute is updated with specified value.
/// 		Passing Null results in data attribute being removed.
/// 	</param>
/// </function>
Fit.Dom.Data = function(elm, name, value)
{
	Fit.Validation.ExpectDomElement(elm);
	Fit.Validation.ExpectStringValue(name);
	Fit.Validation.ExpectString(value, true);

	// Modern browsers can read data-attributes from elm.dataset.ATTRIBUTE.
	// Notice that data-title-value="XYZ" becomes elm.dataset.titleValue.

	return Fit.Dom.Attribute(elm, "data-" + name, value);
}

/// <function container="Fit.Dom" name="CreateElement" access="public" static="true" returns="DOMNode">
/// 	<description>
/// 		Create element with the specified HTML content.
/// 		HTML content is (by default) wrapped in a &lt;div&gt; if it produced multiple elements.
/// 		If content on the other hand produces only one outer element, that particular element is returned.
/// 		It is possible to construct DOM objects of type Element, Text, and Comment.
/// 		The container type used to wrap multiple elements can be changed using the containerTagName argument.
/// 	</description>
/// 	<param name="html" type="string"> HTML element to create DOMElement from </param>
/// 	<param name="containerTagName" type="string" default="div">
/// 		If defined, and html argument produces multiple element, the result is wrapped in a container of
/// 		the specified type. If not set, multiple elements will be wrapped in a &lt;div&gt; container.
/// 	</param>
/// </function>
Fit.Dom.CreateElement = function(html, containerTagName)
{
	Fit.Validation.ExpectString(html);
	Fit.Validation.ExpectStringValue(containerTagName, true);

	if (Fit.String.Trim(html).toLowerCase().indexOf("<tr") === 0) // <tr> can only be rooted in a <table> container
	{
		html = Fit.String.Trim(html);

		var container = document.createElement("div"); // Using <div> rather than <tbody> because tbody.innerHTML is read-only in Legacy IE
		container.innerHTML = "<table><tbody>" + html + "</tbody></table>";

		if (container.firstChild.firstChild.children.length === 1)
			return container.firstChild.firstChild.firstChild;

		return container.firstChild;
	}
	else if (Fit.String.Trim(html).toLowerCase().indexOf("<td") === 0) // <td> can only be rooted in a <tr> container
	{
		html = Fit.String.Trim(html); // Make sure container is not returned if e.g. "  <td>test</td>" is passed

		var container = document.createElement("div"); // Using <div> rather than <tr> because tr.innerHTML is read-only in Legacy IE
		container.innerHTML = "<table><tbody><tr>" + html + "</tr></tbody></table>";

		if (container.firstChild.firstChild.firstChild.children.length === 1)
			return container.firstChild.firstChild.firstChild.firstChild;

		return container.firstChild.firstChild.firstChild;
	}
	else
	{
		var container = document.createElement(((Fit.Validation.IsSet(containerTagName) === true) ? containerTagName : "div"));
		container.innerHTML = html;

		// Using childNodes property instead of children property to include text nodes,
		// which the DOM functions in Fit.UI usually do not take into account.
		// If text nodes are not included, a call like the following would exclude
		// the " world" portion. We do not want to throw away data, naturally! Example:
		// Fit.Dom.CreateElement("<span>Hello</span> world"); // Returns <div><span>Hello</span> world</div>
		if (container.childNodes.length === 1)
			return container.firstChild;

		return container;
	}
}

/// <function container="Fit.Dom" name="Text" access="public" static="true" returns="string">
/// 	<description> Get/set inner text of DOMElement </description>
/// 	<param name="elm" type="DOMNode"> Node to update and/or get text value from </param>
/// 	<param name="value" type="string" default="undefined"> If defined, inner text is updated with specified value </param>
/// </function>
Fit.Dom.Text = function(elm, value)
{
	Fit.Validation.ExpectNode(elm);
	Fit.Validation.ExpectString(value, true);

	if (Fit.Validation.IsSet(value) === true)
	{
		if (elm.textContent) // Use textContent if supported
		{
			elm.textContent = value;
		}
		else if (elm.innerText) // Set content with innerText which does not interpret HTML
		{
			// IE8 does not support textContent.
			// https://developer.mozilla.org/en-US/docs/Web/API/Node/textContent
			// "Altering innerText in Internet Explorer (version 11 and below) removes child nodes from the element
			// and permanently destroys all descendant text nodes. It is impossible to insert the nodes again into
			// any other element or into the same element anymore."
			// We therefore remove all nodes prior to changing the text value in Internet Explorer.
			if (elm.children.length > 0)
			{
				Fit.Array.ForEach(Fit.Array.Copy(elm.children), function(c)
				{
					Fit.Dom.Remove(c);
				});
			}

			elm.innerText = value;
		}
		else if (elm.nodeValue) // Text or Comment nodes do not expose innerText, nor does it expose textContent on legacy browsers
		{
			elm.nodeValue = value;
		}
	}

	// NOTICE: The properties textContent (requires IE9+) and innerText return very different values.
	// https://developer.mozilla.org/en-US/docs/Web/API/Node/textContent
	// Code from script and style blocks are included with textContent, and while innerText
	// does not, it also doesn't include text from elements hidden using CSS.
	// But fortunately hidden elements are included in IE8, probably due to incorrect implementation.
	// Since pretty much all browsers except for IE8 supports textContent,
	// we allow the inconsistency; that innerText does not include code from script and style blocks.
	// If we at some point realize that such behaviour is completely unacceptable, we can get a result
	// very similar to textContent with IE8 using the code below:
	// Fit.String.StripHtml(el.innerHTML).replace(/&nbsp;/g, " ");
	// The only major difference is that line breaks and indentation is not identical.
	// If we need even better consistency, we would need to make all browsers use the following code instead:
	// Fit.String.StripHtml(el.innerHTML).replace(/^\s*([^\s].*?)\s*$/gm, "$1").replace(/\r/g, "").replace(/\n/g, " ").replace(/&nbsp;/g, " ");
	// It takes innerHTML, removes all HTML, trims every line, remove line breaks between lines, and make sure non-breaking spaces are preserved.
	// Both approaches come with a performance penelty, and frankly it's not worth it when IE9+ and all other browsers support textContent.

	return (elm.textContent ? elm.textContent : elm.innerText);
}

/// <function container="Fit.Dom" name="GetIndex" access="public" static="true" returns="integer">
/// 	<description>
/// 		Get element position within parent element.
/// 		Notice that Text and Comment nodes are ignored.
/// 	</description>
/// 	<param name="elm" type="DOMElement"> Element to get index for </param>
/// </function>
Fit.Dom.GetIndex = function(elm)
{
	Fit.Validation.ExpectDomElement(elm);

	if (!elm.parentElement)
		return -1;

	var parent = elm.parentElement;

	for (var i = 0 ; i < parent.children.length ; i++)
		if (parent.children[i] === elm)
			return i;

	return -1; // Should not happen
}

/// <function container="Fit.Dom" name="GetDepth" access="public" static="true" returns="integer">
/// 	<description>
/// 		Get number of levels specified element is nested in DOM.
/// 		HTMLElement is at level 0, HTMLBodyElement is at level 1,
/// 		first element in HTMLBodyElement is at level 2, and so forth.
/// 	</description>
/// 	<param name="elm" type="DOMNode"> Element to get depth in DOM for </param>
/// </function>
Fit.Dom.GetDepth = function(elm)
{
	Fit.Validation.ExpectNode(elm);

    var i = 0;
    var parent = elm.parentElement;

    while (parent)
    {
        i++;
        parent = parent.parentElement;
    }

    return i;
}

/// <function container="Fit.Dom" name="Contained" access="public" static="true" returns="boolean">
/// 	<description> Check whether given element is found in given container at any given level in object hierarchy </description>
/// 	<param name="container" type="DOMElement"> Container expected to contain element </param>
/// 	<param name="elm" type="DOMNode"> Element expected to be found in container's object hierarchy </param>
/// </function>
Fit.Dom.Contained = function(container, elm)
{
	Fit.Validation.ExpectDomElement(container);
	Fit.Validation.ExpectNode(elm);

    var parent = elm.parentElement;

    while (parent)
    {
        if (parent === container)
			return true;

        parent = parent.parentElement;
    }

    return false;
}

/// <function container="Fit.Dom" name="IsVisible" access="public" static="true" returns="boolean">
/// 	<description>
/// 		Check whether given element is visible. Returns True if element has been rooted
/// 		in DOM and is visible. Returns False if not rooted, or display:none has been set
/// 		on element or any of its ancestors.
/// 	</description>
/// 	<param name="elm" type="DOMNode"> Element to check visibility for </param>
/// </function>
Fit.Dom.IsVisible = function(elm)
{
	Fit.Validation.ExpectNode(elm);

	if (elm.nodeType === 8)
		return false; // Comments are not visual, hence not visible

	if (elm.nodeType === 3)
	{
		// Check parent element if a Text element is passed

		if (elm.parentElement === null)
			return false; // Not rooted

		elm = elm.parentElement;
	}

	// Determine visibility quickly using offsetParent if possible.
	// Notice that offsetParent is always Null for an element with
	// position:fixed, in which case this check will not suffice.
	// Also <html> and <body> have no offsetParent (null).
	if (Fit._internal.Dom.IsOffsetParentSupported() === true && Fit.Dom.GetComputedStyle(elm, "position") !== "fixed" && elm !== document.body && elm !== document.body.parentElement)
	{
		return (elm.offsetParent !== null);
	}
	/*if (Fit._internal.Dom.IsOffsetParentSupported() === true)
	{
		if (elm.offsetParent !== null)
		{
			return true;
		}
	}*/

	// Traverse DOM bottom-up to determine whether element or any ancestors have display:none set

	var element = elm;
	var previous = null;

	while (element !== null)
	{
		if (Fit.Dom.GetComputedStyle(element, "display") === "none")
			return false; // Element is not visible

		previous = element;
		element = element.parentElement;
	}

	return (previous === document.documentElement); // If last parent reached is not <html>, then element is not rooted in DOM yet
}

/// <function container="Fit.Dom" name="GetConcealer" access="public" static="true" returns="DOMElement">
/// 	<description>
/// 		Get container responsible for hiding given element.
/// 		Element passed will be returned if hidden itself.
/// 		Returns Null if element is visible, or has not been rooted in DOM yet.
/// 	</description>
/// 	<param name="elm" type="DOMNode"> Element to get concealer for </param>
/// </function>
Fit.Dom.GetConcealer = function(elm)
{
	Fit.Validation.ExpectNode(elm);

	if (elm.nodeType === 8)
		return elm; // Comments are not visual, hence not visible

	if (Fit.Dom.IsVisible(elm) === true)
		return null; // Element is not concealed - it is visible and rooted in DOM

	if (elm.nodeType === 3)
		elm = elm.parentElement; // Check parent element if a Text element is passed

	// Element is hidden or not rooted in DOM.
	// Traverse DOM bottom-up to find container hiding element.

	var element = elm;
	while (element !== null)
	{
		if (Fit.Dom.GetComputedStyle(element, "display") === "none")
			return element;

		element = element.parentElement;
	}

	return null; // Not rooted in DOM yet
}

/// <function container="Fit.Dom" name="GetFocused" access="public" static="true" returns="DOMElement">
/// 	<description>
/// 		Returns element currently focused. If no element is focused, the document body is returned.
/// 		Null will be returned if the document has not been loaded yet.
/// 	</description>
/// </function>
Fit.Dom.GetFocused = function()
{
	var focused = null;

	try // Legacy IE is buggy (https://developer.mozilla.org/en-US/docs/Web/API/Document/activeElement)
	{
		focused = document.activeElement;

		if (!focused.nodeType) // IE11 returns an empty object when running in an iFrame (http://fiddle.jshell.net/Jemt/dL9q6b2d/6/embedded/result,js)
			focused = document.body;
	}
	catch (err)
	{
		focused = document.body;
	}

	return focused;
}

/// <function container="Fit.Dom" name="GetParentOfType" access="public" static="true" returns="DOMElement">
/// 	<description> Returns first parent of specified type for a given element if found, otherwise Null </description>
/// 	<param name="element" type="DOMNode"> Element to find parent for </param>
/// 	<param name="parentType" type="string"> Tagname of parent element to look for </param>
/// </function>
Fit.Dom.GetParentOfType = function(element, parentType)
{
	Fit.Validation.ExpectNode(element);
	Fit.Validation.ExpectStringValue(parentType);

    var parent = element.parentElement;

    while (parent !== null)
    {
        if (parent.tagName.toLowerCase() === parentType.toLowerCase())
			return parent;

        parent = parent.parentElement;
    }

    return null;
}

/// <function container="Fit.Dom" name="Wrap" access="public" static="true">
/// 	<description> Wraps element in container element while preserving position in DOM if rooted </description>
/// 	<param name="elementToWrap" type="DOMNode"> Element to wrap </param>
/// 	<param name="container" type="DOMElement"> Container to wrap element within </param>
/// </function>
Fit.Dom.Wrap = function(elementToWrap, container)
{
	Fit.Validation.ExpectNode(elementToWrap);
	Fit.Validation.ExpectDomElement(container);

	var parent = elementToWrap.parentElement;
	var nextSibling = elementToWrap.nextSibling;

	container.appendChild(elementToWrap); // Causes elementToWrap to be removed from existing container

	if (parent === null)
		return; // Not rooted

	if (nextSibling === null)
		parent.appendChild(container);
	else
		parent.insertBefore(container, nextSibling);
}


// ==========================================================
// Position
// ==========================================================

// Notice: Browser vendors are changing the way coordinates
// and dimensions are reported. W3C previously define these as
// integers/longs, but browsers are moving to floats for smoother
// animation and scrolling, and for more accurate positioning.
// https://code.google.com/p/chromium/issues/detail?id=323935
// For consistency we use Math.round/floor to make sure integers are
// always returned on both modern and legacy browsers.

/// <function container="Fit.Dom" name="SetCaretPosition" access="public" static="true">
/// 	<description> Set caret position for input control </description>
/// 	<param name="input" type="DOMElement"> Input element </param>
/// 	<param name="pos" type="integer"> Integer value specifying caret position in input control </param>
/// </function>
Fit.Dom.SetCaretPosition = function(input, pos)
{
	Fit.Validation.ExpectDomElement(input);
	Fit.Validation.ExpectInteger(pos);

	// Notice: This will - unfortunately - not make input fields scroll
	// its content if cursor is positioned "outside" of input's viewport.
	// In Chrome this can be solved by blurring and re-focusing control
	// after setting caret position - but that will not work across all browsers.

	if (input.setSelectionRange) // Modern browsers
	{
		input.focus();
		input.setSelectionRange(pos, pos);
	}
	else if (input.createTextRange) // IE8 and below
	{
		var range = input.createTextRange();
		range.collapse(true);
		range.moveEnd("character", pos);
		range.moveStart("character", pos);
		range.select();
	}
}

/// <function container="Fit.Dom" name="GetPosition" access="public" static="true" returns="object">
/// 	<description>
/// 		Get position for visible element.
/// 		Object returned contains an X and Y property
/// 		with the desired integer values (pixels).
/// 		Null will be returned if element is not visible.
/// 	</description>
/// 	<param name="elm" type="DOMElement"> Element to get position for </param>
/// 	<param name="relativeToViewport" type="boolean" default="false">
/// 		Set True to get element position relative to viewport rather than to document which may exceed the viewport
/// 	</param>
/// </function>
Fit.Dom.GetPosition = function(elm, relativeToViewport) { return Fit._internal.Dom.GetPosition(elm, relativeToViewport); }
Fit._internal.Dom.GetPosition = function(elm, relativeToViewport, internalKeepMargin)
{
	Fit.Validation.ExpectDomElement(elm);
	Fit.Validation.ExpectBoolean(relativeToViewport, true);
	Fit.Validation.ExpectBoolean(internalKeepMargin, true);

	if (Fit.Dom.IsVisible(elm) === false)
		return null;

	var pos = { X: 0, Y: 0 };

	// Get position relative to viewport
	var rect = elm.getBoundingClientRect(); // Might contain floating point values
	pos.X = rect.left;
	pos.Y = rect.top;

	// Substract margin as positioning is done where margin starts
	if (internalKeepMargin !== true)
	{
		pos.X -= Fit._internal.Dom.GetPx(Fit.Dom.GetComputedStyle(elm, "margin-left"));
		pos.Y -= Fit._internal.Dom.GetPx(Fit.Dom.GetComputedStyle(elm, "margin-top"));
	}

	if (relativeToViewport === true)
	{
		pos.X = Math.round(pos.X);
		pos.Y = Math.round(pos.Y);
		return pos;
	}

	// Add scroll to get position relative to document
	pos.X += window.pageXOffset || document.documentElement.scrollLeft || document.body.scrollLeft || 0;
	pos.Y += window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;

	pos.X = Math.round(pos.X);
	pos.Y = Math.round(pos.Y);

	return pos;
}

/// <function container="Fit.Dom" name="GetRelativePosition" access="public" static="true" returns="object">
/// 	<description>
/// 		Get element position relative to a positioned parent or ancestor (offsetParent).
/// 		Coordinates returned are relative to document if no positioned parent or ancestor is found.
/// 		For an element with position:fixed coordinates relative to the document is returned.
/// 		Object returned contains an X and Y property with the desired integer values (pixels).
/// 		Notice that Null is returned in case element is not rooted yet (added to DOM) or invisible.
/// 	</description>
/// 	<param name="elm" type="DOMElement"> Element to get position for </param>
/// </function>
Fit.Dom.GetRelativePosition = function(elm)
{
	Fit.Validation.ExpectDomElement(elm);

	if (Fit.Dom.GetComputedStyle(elm, "position") === "fixed")
	{
		return Fit.Dom.GetPosition(elm); // Page scroll and element margin has already been added and substracted
	}

	// Make sure offsetParent is available, which will not be the cause if element is not
	// rooted, hidden using display:none, or has position:fixed (the latter is handled above).
	if (Fit.Dom.IsVisible(elm) === false)
		return null;

	var pos = Fit.Dom.GetPosition(elm); // Page scroll and element margin has already been added and substracted

	// Get actual offsetParent.
	// For an element without a positioned parent, the offsetParent
	// is most often the body element, but for elements in e.g. a table,
	// the immediate offsetParent is the td element, and the td's offsetParent
	// is the table element. So we need to walk up the hierarchy until
	// we either find a positioned parent or reach the body element.
	// https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/offsetParent

	var offsetParent = elm.offsetParent;
	while (offsetParent !== null && Fit.Dom.GetComputedStyle(offsetParent, "position") === "static" /*&& offsetParent !== document.body && offsetParent !== document.documentElement*/)
	{
		offsetParent = offsetParent.offsetParent;
	}
	offsetParent = offsetParent || document.documentElement;

	if (offsetParent !== document.documentElement)
	{
		var offsetParentPos = Fit._internal.Dom.GetPosition(offsetParent, false, true);

		if ((Fit.Browser.GetInfo().Name === "Firefox" && offsetParent.tagName === "TABLE")
			|| (Fit.Browser.GetInfo().Name === "MSIE" && Fit.Browser.GetInfo().Version >= 10 && offsetParent.tagName === "TABLE")
			|| (Fit.Browser.GetInfo().Name === "Edge" && offsetParent.tagName === "TABLE"))
		{
			pos.X = pos.X - offsetParentPos.X;
			pos.Y = pos.Y - offsetParentPos.Y;
		}
		else
		{
			pos.X = pos.X - (offsetParentPos.X + Fit._internal.Dom.GetPx(Fit.Dom.GetComputedStyle(offsetParent, "border-left-width")));
			pos.Y = pos.Y - (offsetParentPos.Y + Fit._internal.Dom.GetPx(Fit.Dom.GetComputedStyle(offsetParent, "border-top-width")));
		}

		//pos.X = pos.X - (offsetParent.offsetLeft + Fit._internal.Dom.GetPx(Fit.Dom.GetComputedStyle(offsetParent, "border-left-width")));
		//pos.Y = pos.Y - (offsetParent.offsetTop + Fit._internal.Dom.GetPx(Fit.Dom.GetComputedStyle(offsetParent, "border-top-width")));
	}

	return pos;
}

/// <function container="Fit.Dom" name="GetScrollPosition" access="public" static="true" returns="object">
/// 	<description>
/// 		Get number of pixels specified element's container(s)
/// 		have been scrolled. This gives us the total scroll value
/// 		for nested scrollable elements.
/// 		Object returned contains an X and Y property with the desired integer values (pixels).
/// 	</description>
/// 	<param name="elm" type="DOMNode"> Element to get scroll position for </param>
/// </function>
Fit.Dom.GetScrollPosition = function(elm)
{
	Fit.Validation.ExpectNode(elm);

	// Get number of pixels specified element's container(s)
	// have been scrolled. This gives us the total scroll value
	// for nested scrollable elements which in combination with
	// X,Y mouse coordinates can be used to determine the mouse
	// position in the document rather than in the viewport:
	// scrollX = mouseXviewport + GetScrollPosition(elm).X;
	// scrollY = mouseYviewport + GetScrollPosition(elm).Y;

	var pos = { X: 0, Y: 0 };

	if (elm.nodeType !== 1) // Text or Comment element which do not have scrollLeft and scrollTop properties
		elm = elm.parentElement;

	while (elm)
	{
		pos.X += elm.scrollLeft;
		pos.Y += elm.scrollTop;
		elm = elm.parentElement;
	}

	pos.X = Math.floor(pos.X);
	pos.Y = Math.floor(pos.Y);

	return pos;
}

/// <function container="Fit.Dom" name="GetScrollParent" access="public" static="true" returns="DOMElement">
/// 	<description>
/// 		Get element's scroll parent. Returns null if element passed
/// 		is placed on its own stacking context (has position:fixed).
/// 	</description>
/// 	<param name="elm" type="DOMElement"> Element to get scroll parent for </param>
/// </function>
Fit.Dom.GetScrollParent = function(elm)
{
	Fit.Validation.ExpectDomElement(elm);

	var pos = Fit.Dom.GetComputedStyle(elm, "position");

	if (pos === "fixed")
    {
		return null; // No scroll parent when element has its own stacking context
	}

    while ((elm = elm.parentElement))
    {
		if (pos === "absolute" && Fit.Dom.GetComputedStyle(elm, "position") === "static") // static is default positioning
        {
			continue; // Skip parent if element is floating outside of it using absolute positioning
		}

		var regEx = /scroll|auto/;
        var overflow = Fit.Dom.GetComputedStyle(elm, "overflow");
		var overflowX = Fit.Dom.GetComputedStyle(elm, "overflow-x");
		var overflowY = Fit.Dom.GetComputedStyle(elm, "overflow-y");

		if (regEx.test(overflow) === true || regEx.test(overflowX) || regEx.test(overflowY))
        {
			return elm;
		}
	}

	// Return document

	return Fit.Dom.GetScrollDocument();
}

/// <function container="Fit.Dom" name="GetOverflowingParent" access="public" static="true" returns="DOMElement">
/// 	<description>
/// 		Get element's parent that has overflow set to auto, scroll, or hidden.
/// 		Returns null if element passed has now parent with overflow.
/// 	</description>
/// 	<param name="elm" type="DOMElement"> Element to get overflowing parent for </param>
/// </function>
Fit.Dom.GetOverflowingParent = function(elm)
{
	Fit.Validation.ExpectDomElement(elm);

	// Code below is similar to the code for GetScrollParent(..), except it includes overflow:hidden

	var pos = Fit.Dom.GetComputedStyle(elm, "position");

	if (pos === "fixed")
    {
		return null; // No scroll parent when element has its own stacking context
	}

	var regEx = /scroll|auto|hidden/;
	var current = elm;

	while ((current = current.parentElement) !== null)
	{
		if (pos === "absolute" && Fit.Dom.GetComputedStyle(elm, "position") === "static") // static is default positioning
        {
			continue; // Skip parent if element is floating outside of it using absolute positioning
		}

		if (regEx.test(Fit.Dom.GetComputedStyle(current, "overflowY")) === true || regEx.test(Fit.Dom.GetComputedStyle(current, "overflowX")) === true)
		{
			return current;
		}
	}

	return null;
}

/// <function container="Fit.Dom" name="GetScrollDocument" access="public" static="true" returns="DOMElement">
/// 	<description>
/// 		Get scrolling document element. This is the cross browser
/// 		equivalent of document.scrollingElement.
/// 	</description>
/// </function>
Fit.Dom.GetScrollDocument = function()
{
	if (Fit._internal.Dom.ScrollDocument === undefined)
	{
		if (document.scrollingElement)
		{
			Fit._internal.Dom.ScrollDocument = document.scrollingElement;
		}
		else
		{
			var iframe = document.createElement("iframe");
			iframe.style.cssText = "height: 1px; position: fixed; top: -100px; left: -100px;";

			document.documentElement.appendChild(iframe);

			var doc = iframe.contentWindow.document;
			doc.write("<!DOCTYPE html><div style='height: 100px'>&nbsp;</div>");
			doc.close();

			if (doc.documentElement.scrollHeight > doc.body.scrollHeight)
			{
				Fit._internal.Dom.ScrollDocument = document.documentElement;
			}
			else
			{
				Fit._internal.Dom.ScrollDocument = document.body;
			}

			iframe.parentNode.removeChild(iframe);
		}
	}

	return Fit._internal.Dom.ScrollDocument;
}

// Internal members

Fit._internal.Dom.IsOffsetParentSupported = function() // Returns True if offsetParent can be used to determine whether an element is visible or not
{
	if (Fit._internal.Dom.OffsetParentSupported === undefined)
	{
		var parent = document.createElement("div");
		var child = document.createElement("div");

		parent.style.display = "none";

		Fit.Dom.Add(document.body, parent);
		Fit.Dom.Add(parent, child);

		Fit._internal.Dom.OffsetParentSupported = (child.offsetParent === null); // If supported, offsetParent should return Null (will return <body> on e.g. IE9-10)

		Fit.Dom.Remove(parent);
	}

	return Fit._internal.Dom.OffsetParentSupported;
}

Fit._internal.Dom.GetPx = function(val)
{
	val = (val ? parseInt(val) : 0);

	if (isNaN(val) === true) // E.g. if val was "auto"
		val = 0;

	return val;
}

Fit.DragDrop = {};

// Draggable

/// <function container="Fit.DragDrop.Draggable" name="Draggable" access="public">
/// 	<description> Constructor - create instance of Draggable class </description>
/// 	<param name="domElm" type="DOMElement"> Element to turn into draggable object </param>
/// 	<param name="domTriggerElm" type="DOMElement" default="undefined"> Element that triggers dragging (optional) </param>
/// </function>
Fit.DragDrop.Draggable = function(domElm, domTriggerElm)
{
	Fit.Validation.ExpectElementNode(domElm);
	Fit.Validation.ExpectElementNode(domTriggerElm, true);

    // Private properties

    var elm = domElm;
	var trgElm = (domTriggerElm ? domTriggerElm : null);
    var me = this;

    var onDragStart = null;
    var onDragging = null;
	var onDragStop = null;

	var mouseDownEventId = -1;

    // Construct

    function init()
    {
		Fit._internal.Core.EnsureStyles();

        Fit.Dom.AddClass(elm, "FitDragDropDraggable");
        Fit.Dom.AddClass((trgElm !== null ? trgElm : elm), "FitDragDropDraggableHandle");

        // Mouse down

        mouseDownEventId = Fit.Events.AddHandler(((trgElm !== null) ? trgElm : elm), "mousedown", function(e)
        {
            var ev = e || window.event;

			if (Fit.DragDrop.Draggable._internal.active !== null)
				return; // Skip - current element is a draggable parent to which event propagated

            Fit.Dom.AddClass(elm, "FitDragDropDragging");

            // Mouse position in viewport
            var mouseXviewport = (ev.clientX || e.pageX);
            var mouseYviewport = (ev.clientY || e.pageY);

            // Make sure element being dragged is on top of every other draggable element
            Fit.DragDrop.Draggable._internal.zIndex++;
            elm.style.zIndex = Fit.DragDrop.Draggable._internal.zIndex;

            // Create state information object for draggable currently being dragged
            var state =
            {
                Draggable: me,
                Positioning: (Fit.Dom.GetComputedStyle(elm, "position") === "absolute" ? "absolute" : "relative"),
                Mouse: {Viewport: {X: -1, Y: -1}, Document: {X: -1, Y: -1}},
                Position: {Viewport: {X: -1, Y: -1}, Document: {X: -1, Y: -1}, Offset: {X: -1, Y: -1}},
                Events: { OnDragStart: onDragStart, OnDragging: onDragging, OnDragStop: onDragStop },
                OnSelectStart : document.onselectstart
            };

            // Disable text selection for legacy browsers
            document.onselectstart = function() { return false; }

            // Find mouse position in viewport
            state.Mouse.Viewport.X = mouseXviewport;
            state.Mouse.Viewport.Y = mouseYviewport;

            // Find mouse position in document (which may have been scrolled)
            //state.Mouse.Document.X = mouseXviewport + window.scrollX;
            //state.Mouse.Document.Y = mouseYviewport + window.scrollY;
            var scrollPos = Fit.Dom.GetScrollPosition(elm);
            state.Mouse.Document.X = mouseXviewport + scrollPos.X;
            state.Mouse.Document.Y = mouseYviewport + scrollPos.Y;

            // Find draggable position in viewport and document
            state.Position.Viewport = Fit.Dom.GetPosition(elm, true);
            state.Position.Document = Fit.Dom.GetPosition(elm);

            // Find X,Y position already set for draggable (by previous drag operation or using CSS positioning)
            var offsetX = Fit.Dom.GetComputedStyle(elm, "left");
            var offsetY = Fit.Dom.GetComputedStyle(elm, "top");
            state.Position.Offset.X = (offsetX.indexOf("px") > -1 ? parseInt(offsetX) : 0);
            state.Position.Offset.Y = (offsetY.indexOf("px") > -1 ? parseInt(offsetY) : 0);

            Fit.DragDrop.Draggable._internal.active = state;

            // If draggable is also a dropzone, move it to the end of internal dropzones collection
            // to make sure this dropzone is considered "on top" of other dropzones.
            // NOTICE: This only works reliable if draggable dropzones are placed on top of each
            // other by the user. If the dropzones are programmatically floated on top of each other,
            // the dropzones must be added (turned into dropzones) in the same order as they appear
            // visually.

            if (Fit.Dom.HasClass(elm, "FitDragDropDropZone") === true)
            {
                // Find draggable dropzone in dropzones collection
                var draggableDropZone = null;
                Fit.Array.ForEach(Fit.DragDrop.DropZone._internal.dropzones, function(dzState)
                {
                    if (dzState.DropZone.GetElement() === elm)
                    {
                        draggableDropZone = dzState;
                        return false;
                    }
                });

                // Move dropzone to end of collection
                Fit.Array.Remove(Fit.DragDrop.DropZone._internal.dropzones, draggableDropZone);
                Fit.Array.Add(Fit.DragDrop.DropZone._internal.dropzones, draggableDropZone);
            }

            if (state.Events.OnDragStart)
                state.Events.OnDragStart(elm);

            /*if (ev.preventDefault)
                ev.preventDefault();
            ev.cancelBubble = true;*/
        });

        // Mouse Up

        if (Fit.DragDrop.Draggable._internal.mouseUpRegistered === false)
        {
            Fit.DragDrop.Draggable._internal.mouseUpRegistered = true;

            Fit.Events.AddHandler(document, "mouseup", function(e)
            {
                if (Fit.DragDrop.Draggable._internal.active === null)
                    return;

                var ev = e || window.event;

                var draggableState = Fit.DragDrop.Draggable._internal.active;
                var draggable = Fit.DragDrop.Draggable._internal.active.Draggable;

                var dropzoneState = Fit.DragDrop.DropZone._internal.active
                var dropzone = (dropzoneState !== null ? dropzoneState.DropZone : null);

                // Handle draggable

                Fit.Dom.RemoveClass(draggable.GetElement(), "FitDragDropDragging");
                Fit.DragDrop.Draggable._internal.active = null;

                //if (draggableState.Events.OnDragStop)
                //    draggableState.Events.OnDragStop(draggable);

                // Handle active dropzone

                if (dropzoneState !== null)
                {
                    Fit.Dom.RemoveClass(dropzone.GetElement(), "FitDragDropDropZoneActive");
                    Fit.DragDrop.DropZone._internal.active = null;

                    if (dropzoneState.OnDrop)
                        dropzoneState.OnDrop(dropzone, draggable);
                }

				// Fire OnDragStop after OnDrop to make sure OnDragStop can act
				// depending on whether draggable was dropped on a dropzone or not.

				if (draggableState.Events.OnDragStop)
                    draggableState.Events.OnDragStop(draggable);

                // Restore OnSelectStart event
                document.onselectstart = draggableState.OnSelectStart;
            });
        }

        // Mouse move

        if (Fit.DragDrop.Draggable._internal.mouseMoveRegistered === false)
        {
            Fit.DragDrop.Draggable._internal.mouseMoveRegistered = true;

            Fit.Events.AddHandler(document, "mousemove", function(e)
            {
                if (Fit.DragDrop.Draggable._internal.active === null)
					return;

                var ev = e || window.event;

                // Handle draggable

                var state = Fit.DragDrop.Draggable._internal.active;
                var draggable = state.Draggable;
                var elm = draggable.GetElement();

                // Mouse position in viewport
                var mouseXviewport = (ev.clientX || e.pageX);
                var mouseYviewport = (ev.clientY || e.pageY);

                // Mouse position in document.
                // Potential performance optimization: Only call GetScrollPosition if element
                // is contained in scrollable element. If not, use window.scrollX/Y instead!
                //var mouseXdocument = mouseXviewport + window.scrollX;
                //var mouseYdocument = mouseYviewport + window.scrollY;
                var scrollPos = Fit.Dom.GetScrollPosition(elm);
                var mouseXdocument = mouseXviewport + scrollPos.X;
                var mouseYdocument = mouseYviewport + scrollPos.Y;

                if (Fit.DragDrop.Draggable._internal.active.Positioning === "absolute")
                {
                    // Mouse position within draggable
                    var mouseFromLeft = state.Mouse.Viewport.X - state.Position.Viewport.X;
                    var mouseFromTop = state.Mouse.Viewport.Y - state.Position.Viewport.Y;

                    elm.style.position = "absolute";
                    elm.style.left = (mouseXdocument - mouseFromLeft) + "px";
                    elm.style.top = (mouseYdocument - mouseFromTop) + "px";
                }
                else // relative
                {
                    // Number of pixels mouse moved
                    var mouseXmoved = mouseXdocument - state.Mouse.Document.X;
                    var mouseYmoved = mouseYdocument - state.Mouse.Document.Y;

                    // Element have been initially positioned or previously moved
                    var elementLeft = state.Position.Offset.X;
                    var elementTop = state.Position.Offset.Y;

                    elm.style.position = "relative";
                    elm.style.left = elementLeft + mouseXmoved + "px";
                    elm.style.top = elementTop + mouseYmoved + "px";
                }

                if (state.Events.OnDragging)
                    state.Events.OnDragging(elm);

                // Handle dropzones

                var dropzone = null;
                var dropzoneElement = null;
                var pos = null;
                var dropZoneX = -1;
                var dropZoneY = -1;

                // State objects
                var previouslyActiveDropZone = Fit.DragDrop.DropZone._internal.active;
                var dropzoneActive = null;

                // Find active dropzone.
                // NOTICE: If dropzones are floated on top of each other, make sure they are added to the
                // internal dropzones collection in order of appearance to make sure the correct dropzone
                // is turned active.
                Fit.Array.ForEach(Fit.DragDrop.DropZone._internal.dropzones, function(dzState)
                {
                    dropzone = dzState.DropZone;
                    dropzoneElement = dropzone.GetElement();

					if (Fit.Dom.IsVisible(dropzoneElement) === false)
						return; // Skip - dropzone not currently visible

                    pos = Fit.Dom.GetPosition(dropzoneElement, true);
                    dropZoneX = pos.X;
                    dropZoneY = pos.Y;

                    var dropzoneFound = (dropzoneActive === null);
                    var dropzoneDeeperThanPreviouslyFound = (dropzoneActive === null || Fit.Dom.GetDepth(dropzoneElement) > Fit.Dom.GetDepth(dropzoneActive.DropZone.GetElement()));
                    var dropzoneCurrentlyBeingDragged = (Fit.Dom.HasClass(dropzoneElement, "FitDragDropDragging") === true);
                    var draggableHoveringDropZone = (mouseXviewport > dropZoneX && mouseXviewport < (dropZoneX + dropzoneElement.offsetWidth) && mouseYviewport > dropZoneY && mouseYviewport < (dropZoneY + dropzoneElement.offsetHeight));

                    if ((dropzoneFound === false || dropzoneDeeperThanPreviouslyFound === true) && dropzoneCurrentlyBeingDragged === false && draggableHoveringDropZone === true)
                    {
                        dropzoneActive = dzState;
                    }
                });

                // Leave previously active dropzone if no longer active
                if (previouslyActiveDropZone !== null && dropzoneActive !== previouslyActiveDropZone)
                {
                    Fit.Dom.RemoveClass(previouslyActiveDropZone.DropZone.GetElement(), "FitDragDropDropZoneActive");
                    Fit.DragDrop.DropZone._internal.active = null;

                    if (previouslyActiveDropZone.OnLeave)
                        previouslyActiveDropZone.OnLeave(previouslyActiveDropZone.DropZone);
                }

                // Mark dropzone active if not already done
                if (dropzoneActive !== null && dropzoneActive !== previouslyActiveDropZone)
                {
                    Fit.Dom.AddClass(dropzoneActive.DropZone.GetElement(), "FitDragDropDropZoneActive");
                    Fit.DragDrop.DropZone._internal.active = dropzoneActive;

                    if (dropzoneActive.OnEnter)
                        dropzoneActive.OnEnter(dropzoneActive.DropZone);
                }
            });
        }
    }

    // Public

	/// <function container="Fit.DragDrop.Draggable" name="Reset" access="public">
	/// 	<description> Reset draggable to initial position </description>
	/// </function>
    this.Reset = function()
    {
        elm.style.position = "";
        elm.style.left = "";
        elm.style.top = "";
    }

	/// <function container="Fit.DragDrop.Draggable" name="GetDomElement" access="public" returns="DOMElement">
	/// 	<description> Get draggable DOM element </description>
	/// </function>
    this.GetDomElement = function()
    {
        return elm;
    }

	this.GetElement = this.GetDomElement; // Backward compatibility

	/// <function container="Fit.DragDrop.Draggable" name="Dispose" access="public">
	/// 	<description> Free resources and disable dragging support for DOM element </description>
	/// </function>
	this.Dispose = function()
	{
		// Dispose should not be called while dragging element!
		// To support this we would need to fire events, invoke Reset(),
		// remove FitDragDropDragging class, unset Fit.DragDrop.Draggable._internal.active etc.

		// For elements removed from DOM and memory, calling Dispose is not necessary to
		// ensure memory is freed. There are no global resources associated with the DOM element.

		Fit.Dom.RemoveClass(elm, "FitDragDropDraggable");
		Fit.Dom.RemoveClass((trgElm !== null ? trgElm : elm), "FitDragDropDraggableHandle");

		Fit.Events.RemoveHandler(((trgElm !== null) ? trgElm : elm), mouseDownEventId);

		me = elm = trgElm = onDragStart = onDragging = onDragStop = mouseDownEventId = null;
	}

    // Event handling

    /// <function container="Fit.DragDrop.Draggable" name="OnDragStart" access="public">
	/// 	<description> Add event handler which gets fired when dragging starts </description>
	/// 	<param name="cb" type="function"> Callback (event handler) function - draggable DOM element is passed to function </param>
	/// </function>
	this.OnDragStart = function(cb)
    {
		Fit.Validation.ExpectFunction(cb);
        onDragStart = cb;
    }

	/// <function container="Fit.DragDrop.Draggable" name="OnDragging" access="public">
	/// 	<description> Add event handler which constantly gets fired when dragging takes place </description>
	/// 	<param name="cb" type="function"> Callback (event handler) function - draggable DOM element is passed to function </param>
	/// </function>
    this.OnDragging = function(cb)
    {
		Fit.Validation.ExpectFunction(cb);
        onDragging = cb;
	}

    /// <function container="Fit.DragDrop.Draggable" name="OnDragStop" access="public">
	/// 	<description> Add event handler which gets fired when dragging stops </description>
	/// 	<param name="cb" type="function"> Callback (event handler) function - instance of Draggable is passed to function </param>
	/// </function>
	this.OnDragStop = function(cb)
    {
		Fit.Validation.ExpectFunction(cb);
        onDragStop = cb;
    }

	init();
}
Fit.DragDrop.Draggable._internal =
{
    /* Shared */
    zIndex : 10000,
    mouseUpRegistered : false,
    mouseMoveRegistered : false,

    /* Draggable state object */
    active: null
}

// DropZone

/// <function container="Fit.DragDrop.DropZone" name="DropZone" access="public">
/// 	<description> Constructor - create instance of DropZone class </description>
/// 	<param name="domElm" type="DOMElement"> Element to turn into dropzone object </param>
/// </function>
Fit.DragDrop.DropZone = function(domElm)
{
	Fit.Validation.ExpectElementNode(domElm);

    var elm = domElm;

    var cfg =
    {
        DropZone: this,
        OnEnter: null,
        OnDrop: null,
        OnLeave: null
	};

    function init()
    {
		Fit._internal.Core.EnsureStyles();
        Fit.Dom.AddClass(elm, "FitDragDropDropZone");
        Fit.DragDrop.DropZone._internal.dropzones.push(cfg);
	}

	/// <function container="Fit.DragDrop.DropZone" name="Dispose" access="public">
	/// 	<description> Free resources and disable DropZone support for DOM element </description>
	/// </function>
	this.Dispose = function()
	{
		// Dispose should not be called while DropZone is active!
		// To support this we would need to fire OnLeave and unset
		// Fit.DragDrop.DropZone._internal.active. Draggable
		// does not support being disposed while being dragged either.

		Fit.Dom.RemoveClass(elm, "FitDragDropDropZone");
		Fit.Array.Remove(Fit.DragDrop.DropZone._internal.dropzones, cfg);
		elm = cfg = null;
	}

	/// <function container="Fit.DragDrop.DropZone" name="GetDomElement" access="public" returns="DOMElement">
	/// 	<description> Get dropzone DOM element </description>
	/// </function>
    this.GetDomElement = function()
    {
        return elm;
    }

	this.GetElement = this.GetDomElement; // Backward compatibility

	// Event handling

    /// <function container="Fit.DragDrop.DropZone" name="OnEnter" access="public">
	/// 	<description> Add event handler which gets fired when draggable enters dropzone, ready to be dropped </description>
	/// 	<param name="cb" type="function"> Callback (event handler) function - instance of DropZone is passed to function </param>
	/// </function>
	this.OnEnter = function(cb)
    {
		Fit.Validation.ExpectFunction(cb);
        cfg.OnEnter = cb;
    }

    /// <function container="Fit.DragDrop.DropZone" name="OnDrop" access="public">
	/// 	<description> Add event handler which gets fired when draggable is dropped on dropzone </description>
	/// 	<param name="cb" type="function"> Callback (event handler) function - instance of DropZone and Draggable is passed to function (in that order) </param>
	/// </function>
	this.OnDrop = function(cb)
    {
		Fit.Validation.ExpectFunction(cb);
        cfg.OnDrop = cb;
    }

	/// <function container="Fit.DragDrop.DropZone" name="OnLeave" access="public">
	/// 	<description> Add event handler which gets fired when draggable leaves dropzone </description>
	/// 	<param name="cb" type="function"> Callback (event handler) function - instance of DropZone is passed to function </param>
	/// </function>
    this.OnLeave = function(cb)
    {
		Fit.Validation.ExpectFunction(cb);
        cfg.OnLeave = cb;
    }

	init();
}
Fit.DragDrop.DropZone._internal =
{
    dropzones: [],
    active: null
}

/// <container name="Fit.Events">
/// 	Event handler functionality
/// </container>
Fit.Events = {};

/// <function container="Fit.Events" name="AddHandler" access="public" static="true" returns="integer">
/// 	<description> Registers handler for specified event on given EventTarget and returns Event ID </description>
/// 	<param name="element" type="EventTarget"> EventTarget (e.g. Window or DOMElement) on to which event handler is registered </param>
/// 	<param name="event" type="string"> Event name without 'on' prefix (e.g. 'load', 'mouseover', 'click' etc.) </param>
/// 	<param name="eventFunction" type="function"> JavaScript function to register </param>
/// </function>
/// <function container="Fit.Events" name="AddHandler" access="public" static="true" returns="integer">
/// 	<description> Registers handler for specified event on given EventTarget and returns Event ID </description>
/// 	<param name="element" type="EventTarget"> EventTarget (e.g. Window or DOMElement) on to which event handler is registered </param>
/// 	<param name="event" type="string"> Event name without 'on' prefix (e.g. 'load', 'mouseover', 'click' etc.) </param>
/// 	<param name="useCapture" type="boolean">
/// 		Set True to capture event before it reaches target, False to catch event when it bubbles out from target.
/// 		NOTICE: This feature will be ignored by Internet Explorer 8 and below.
/// 	</param>
/// 	<param name="eventFunction" type="function"> JavaScript function to register </param>
/// </function>
Fit.Events.AddHandler = function()
{
	var element = null;
	var event = null;
	var useCapture = false; // false = event bubbling (reverse of event capturing)
	var eventFunction = null;

	if (arguments.length === 3)
	{
		element = arguments[0];
		event = arguments[1];
		eventFunction = arguments[2];
	}
	else if (arguments.length === 4)
	{
		element = arguments[0];
		event = arguments[1];
		useCapture = arguments[2];
		eventFunction = arguments[3];
	}

	Fit.Validation.ExpectEventTarget(element);
	Fit.Validation.ExpectStringValue(event);
	Fit.Validation.ExpectBoolean(useCapture);
	Fit.Validation.ExpectFunction(eventFunction);

	if (event.toLowerCase() === "#rooted") // Custom event
	{
		if (useCapture === true)
			Fit.Validation.ThrowError("Event capturing is not supported for Rooted event");

		Fit.Array.Add(Fit._internal.Events.OnRootedHandlers, { Element: element, Parent: element.parentElement, Event: event, Callback: eventFunction });
	}
	else if (element.addEventListener) // W3C
	{
		element.addEventListener(event, eventFunction, useCapture);
	}
	else if (element.attachEvent) // IE
	{
		if (event.toLowerCase() === "domcontentloaded" && Fit._internal.Events.Browser.Name === "MSIE" && Fit._internal.Events.Browser.Version === 8)
		{
			// DOMContentLoaded not supported on IE8.
			// Using OnReadyStateChange to achieve similar behaviour.

			element.attachEvent("onreadystatechange", function(e)
			{
				if (element.readyState === "complete")
				{
					eventFunction(e); // NOTICE: Event argument not identical to argument passed to modern browsers using the real DOMContentLoaded event!
				}
			});
		}
		else
		{
			element.attachEvent("on" + event, eventFunction);
		}
	}

	element._internal = element._internal || {};
	element._internal.Events = element._internal.Events || { Handlers: [] };

	var eventId = element._internal.Events.Handlers.length;

	Fit.Array.Add(element._internal.Events.Handlers, { Event: event, Handler: eventFunction, UseCapture: useCapture, Id: eventId });

	// Fire event function for onload event if document in window/iframe has already been loaded.
	// Notice that no event argument is passed to function since we don't have one.
	// BE AWARE that contentDocument is replaced when loading another document (URL) within a frame!
	// Do not register onload on iFrame.contentDocument prior to starting loading content - it will never fire.
	// Instead register OnLoad on contentDocument afterwards, or register OnLoad on the iFrame element. The latter
	// will always fire, every time the document is replaced (URL changed / navigation occur).
	// Also be aware that a frame without a src attribute will always be considered loaded (readyState === "complete")
	// because it already has a contentDocument ready to be used. Therefore we only immediately fire onload for a
	// frame that has readyState "complete" IF it also has a src attribute set. If no src attribute is set, we
	// assume it will be set later, in which case the onload event will fire normally. It simply doesn't make sense to
	// register an OnLoad handler for a frame that is dynamically populated (which has no src attribute) - it will always be ready ("complete").
	if (event.toLowerCase() === "load" && element.nodeType === 9 && element.readyState === "complete") // Element is a Document (window.document or iframe.contentDocument)
	{
		eventFunction();
	}
	else if (event.toLowerCase() === "load" && (typeof(element.contentDocument) === "object" && element.contentDocument !== null) && element.src && element.contentDocument.readyState === "complete") // Element is an iFrame
	{
		// MSIE 8 requires use of typeof(element.contentDocument) - accessing element.contentDocument without typeof results in an "unspecified error" if
		// the iFrame is not rooted in DOM. This has been fixed in MSIE 9 where contentDocument on the other hand remains Null until rooted in DOM.

		eventFunction();
	}
	else if (event.toLowerCase() === "load" && element === window && Fit._internal.Events.OnReadyFired === true) // Element is the current Window instance
	{
		eventFunction();
	}

	return eventId;
}

/// <function container="Fit.Events" name="RemoveHandler" access="public" static="true">
/// 	<description> Remove event handler given by Event ID returned from Fit.Events.AddHandler(..) </description>
/// 	<param name="element" type="DOMElement"> EventTarget (e.g. Window or DOMElement) from which event handler is removed </param>
/// 	<param name="eventId" type="integer"> Event ID identifying handler to remove </param>
/// </function>
/// <function container="Fit.Events" name="RemoveHandler" access="public" static="true">
/// 	<description> Remove event handler for specified event on given EventTarget </description>
/// 	<param name="element" type="DOMElement"> EventTarget (e.g. Window or DOMElement) from which event handler is removed </param>
/// 	<param name="event" type="string"> Event name without 'on' prefix (e.g. 'load', 'mouseover', 'click' etc.) </param>
/// 	<param name="eventFunction" type="function"> JavaScript function to remove </param>
/// </function>
/// <function container="Fit.Events" name="RemoveHandler" access="public" static="true">
/// 	<description> Remove event handler for specified event on given EventTarget </description>
/// 	<param name="element" type="DOMElement"> EventTarget (e.g. Window or DOMElement) from which event handler is removed </param>
/// 	<param name="event" type="string"> Event name without 'on' prefix (e.g. 'load', 'mouseover', 'click' etc.) </param>
/// 	<param name="useCapture" type="boolean">
/// 		Value indicating whether event handler was registered using event capturing (True) or event bubbling (False).
/// 	</param>
/// 	<param name="eventFunction" type="function"> JavaScript function to remove </param>
/// </function>
Fit.Events.RemoveHandler = function()
{
	var element = null;
	var event = null;
	var useCapture = false; // false = event bubbling (reverse of event capturing)
	var eventFunction = null;

	if (arguments.length === 2)
	{
		Fit.Validation.ExpectEventTarget(arguments[0]);
		Fit.Validation.ExpectInteger(arguments[1]);

		element = arguments[0];

		var handler = ((element._internal && element._internal.Events && element._internal.Events.Handlers) ? element._internal.Events.Handlers[arguments[1]] : undefined);

		if (handler === undefined)
			Fit.Validation.Throw("No event handler with ID '" + arguments[0] + "' exists for this element");

		if (handler === null)
			return; // Already removed

		event = handler.Event;
		eventFunction = handler.Handler;
		useCapture = handler.UseCapture;
	}
	else if (arguments.length === 3)
	{
		element = arguments[0];
		event = arguments[1];
		eventFunction = arguments[2];
	}
	else if (arguments.length === 4)
	{
		element = arguments[0];
		event = arguments[1];
		useCapture = arguments[2];
		eventFunction = arguments[3];
	}

	Fit.Validation.ExpectEventTarget(element);
	Fit.Validation.ExpectStringValue(event);
	Fit.Validation.ExpectBoolean(useCapture);
	Fit.Validation.ExpectFunction(eventFunction);

	if (event.toLowerCase() === "#rooted")
	{
		var handlers = Fit._internal.Events.OnRootedHandlers;
		var remove = null;

		Fit.Array.ForEach(handlers, function(handler)
		{
			if (element === handler.Element && event.toLowerCase() === handler.Event.toLowerCase() && eventFunction === handler.Callback && useCapture === false)
			{
				handler.Removed = true; // Allow OnRooted handler to remove element without causing a "Collection was modified" exception - properly removed in timer responsible for observing elements
				return false; // Break loop
			}
		});
	}
	else if (element.removeEventListener)
	{
		element.removeEventListener(event, eventFunction, useCapture);
	}
	else if (element.detachEvent)
	{
		element.detachEvent("on" + event, eventFunction);
	}

	if (arguments.length === 2)
	{
		element._internal.Events.Handlers[arguments[1]] = null;
	}
	else
	{
		for (var i = 0 ; i < element._internal.Events.Handlers.length ; i++)
		{
			var handler = element._internal.Events.Handlers[i];

			if (handler !== null && event.toLowerCase() === handler.Event.toLowerCase() && eventFunction === handler.Handler && useCapture === handler.UseCapture)
			{
				element._internal.Events.Handlers[i] = null;
				break;
			}
		}
	}
}

/// <function container="Fit.Events" name="PreventDefault" access="public" static="true" returns="boolean">
/// 	<description> Prevent default behaviour triggered by given event - returns False </description>
/// 	<param name="e" type="Event" default="undefined"> Event argument </param>
/// </function>
Fit.Events.PreventDefault = function(e)
{
	Fit.Validation.ExpectEvent(e, true);

	var ev = e || window.event;

	if ((ev.type === "click" || ev.type === "mousedown" || ev.type === "mouseup") && ev.button === 2) // Right click = suppress context menu
	{
		var preventContextMenu = Fit.Events.PreventDefault;

		Fit.Events.AddHandler(document, "contextmenu", true, preventContextMenu);
		Fit.Events.AddHandler(document, "contextmenu", preventContextMenu);

		setTimeout(function()
		{
			Fit.Events.RemoveHandler(document, "contextmenu", true, preventContextMenu);
			Fit.Events.RemoveHandler(document, "contextmenu", preventContextMenu);
		}, 0);
	}

	if (ev.preventDefault)
		ev.preventDefault();
	ev.returnValue = false;
	return false;
}

/// <function container="Fit.Events" name="StopPropagation" access="public" static="true" returns="boolean">
/// 	<description> Prevent given event from propagating (bubble up) - returns False </description>
/// 	<param name="e" type="Event" default="undefined"> Event argument </param>
/// </function>
Fit.Events.StopPropagation = function(e)
{
	Fit.Validation.ExpectEvent(e, true);

	var ev = e || window.event;

	if (ev.stopPropagation)
		ev.stopPropagation();
	ev.cancelBubble = true;
	return false;
}

/// <function container="Fit.Events" name="Stop" access="public" static="true" returns="boolean">
/// 	<description>
/// 		Completely suppress event which is equivalent of
/// 		calling both PreventDefault(e) and StopPropagation(e).
/// 		Returns False.
/// 	</description>
/// 	<param name="e" type="Event" default="undefined"> Event argument </param>
/// </function>
Fit.Events.Stop = function(e) // e not validated, done by PreventDefault(..) and StopPropagation(..)
{
	Fit.Events.PreventDefault(e);
	Fit.Events.StopPropagation(e);
	return false;
}

/// <function container="Fit.Events" name="GetTarget" access="public" static="true" returns="DOMElement">
/// 	<description> Get a reference to the object that is affected by an event </description>
/// 	<param name="e" type="Event" default="undefined"> Event argument </param>
/// </function>
Fit.Events.GetTarget = function(e)
{
	Fit.Validation.ExpectEvent(e, true);

	var ev = e || window.event;
	var target = ev.srcElement || ev.target;
	return (target ? target : null);
}

/// <function container="Fit.Events" name="GetEvent" access="public" static="true" returns="Event">
/// 	<description> Get event argument related to event just fired in a cross browser compatible manner </description>
/// 	<param name="e" type="Event" default="undefined"> Event argument </param>
/// </function>
Fit.Events.GetEvent = function(e)
{
	Fit.Validation.ExpectEvent(e, true);
	return e || window.event;
}

/// <function container="Fit.Events" name="GetModifierKeys" access="public" static="true" returns="object">
/// 	<description>
/// 		Get object containing information about modifier keys currently being active.
/// 		Object contains the following properties which are True if the given key is being held down:
/// 		Shift, Ctrl, Alt, Meta (Cmd key on Mac OSX, Win key on Windows).
/// 	</description>
/// </function>
Fit.Events.GetModifierKeys = function()
{
	if (window.event && (window.event.type === "keypress" || window.event.type === "keydown" || window.event.type === "keyup")) // Make sure state is current on IE8 which does not support event capturing
	{
		Fit._internal.Events.KeysDown.Shift = window.event.shiftKey === true;
		Fit._internal.Events.KeysDown.Ctrl = window.event.ctrlKey === true;
		Fit._internal.Events.KeysDown.Alt = window.event.altKey === true;
		Fit._internal.Events.KeysDown.Meta = window.event.metaKey === true;
	}

	// Cloning to prevent external code from manipulating the object
	return Fit.Core.Clone(Fit._internal.Events.KeysDown);
}

/// <function container="Fit.Events" name="GetPointerState" access="public" static="true" returns="object">
/// 	<description>
/// 		Get object containing information about pointer.
/// 		Object contains the following properties:
/// 		Buttons.Primary/Secondary: Is True if given button is being held down
/// 		Coordinates.ViewPort.X/Y: Mouse coordinates within viewport
/// 		Coordinates.Document.X/Y: Mouse coordinates within document which may have been scrolled
/// 	</description>
/// </function>
Fit.Events.GetPointerState = function()
{
	if (window.event && (window.event.type === "click" || window.event.type === "mousedown" || window.event.type === "mouseup")) // Make sure state is current on IE8 which does not support event capturing
	{
		if ((Fit._internal.Events.Browser.Name === "MSIE" && Fit._internal.Events.Browser.Version === 8 && window.event.button === 1) || window.event.button === 0)
		{
			Fit._internal.Events.Mouse.Buttons.Primary = true;
			Fit._internal.Events.Mouse.Buttons.Secondary = false;
		}
		else if (window.event.button === 2)
		{
			Fit._internal.Events.Mouse.Buttons.Secondary = true;
			Fit._internal.Events.Mouse.Buttons.Primary = false;
		}
	}

	// Cloning to prevent external code from manipulating the object

	var target = Fit._internal.Events.Mouse.Target;
	Fit._internal.Events.Mouse.Target = null; // It is not possible to clone DOMElements with Fit.Core.Clone

	var obj = Fit.Core.Clone(Fit._internal.Events.Mouse);

	obj.Target = target;
	Fit._internal.Events.Mouse.Target = target;

	return obj;
}

// ==============================================
// Internals
// ==============================================

Fit._internal.Events = {};
Fit._internal.Events.Browser = Fit.Browser.GetInfo();
Fit._internal.Events.KeysDown = { Shift: false, Ctrl: false, Alt: false, Meta: false, KeyDown: -1, KeyUp: -1 };
Fit._internal.Events.Mouse = { Buttons: { Primary: false, Secondary: false, Touch: false }, Coordinates: { ViewPort: { X: -1, Y: -1 }, Document: { X: -1, Y: -1 } }, Target: null };
Fit._internal.Events.OnReadyHandlers = [];
Fit._internal.Events.OnDomReadyHandlers = [];
Fit._internal.Events.OnRootedHandlers = [];

// ==============================================
// Observing DOM rooting
// ==============================================

setInterval(function()
{
	var remove = [];

	Fit.Array.ForEach(Fit._internal.Events.OnRootedHandlers, function(handler)
	{
		if (handler.Removed === true)
		{
			Fit.Array.Add(remove, handler);
			return; // Skip to next
		}

		if (Fit.Dom.IsRooted(handler.Element) === true && handler.Parent !== handler.Element.parentElement)
		{
			// Element was rooted or moved to another parent

			handler.Parent = handler.Element.parentElement;
			handler.Callback(handler.Element);
		}
	});

	Fit.Array.ForEach(remove, function(handler)
	{
		Fit.Array.Remove(Fit._internal.Events.OnRootedHandlers, handler);
	});

}, 100);

// ==============================================
// Keyboard tracking
// ==============================================

// Using event capturing to make sure event is registered before target is reached.
// This is not supported by MSIE 8, but we solve this by updating the state when
// Fit.Events.GetModifierKeys() is invoked.

Fit.Events.AddHandler(document, "keydown", true, function(e)
{
	var ev = Fit.Events.GetEvent(e);

	Fit._internal.Events.KeysDown.Shift = ev.shiftKey === true;
	Fit._internal.Events.KeysDown.Ctrl = ev.ctrlKey === true;
	Fit._internal.Events.KeysDown.Alt = ev.altKey === true;
	Fit._internal.Events.KeysDown.Meta = ev.metaKey === true;
	Fit._internal.Events.KeysDown.KeyUp = -1;
	Fit._internal.Events.KeysDown.KeyDown = ev.keyCode;
});
Fit.Events.AddHandler(document, "keyup", true, function(e)
{
	var ev = Fit.Events.GetEvent(e);

	Fit._internal.Events.KeysDown.Shift = ev.shiftKey === true;
	Fit._internal.Events.KeysDown.Ctrl = ev.ctrlKey === true;
	Fit._internal.Events.KeysDown.Alt = ev.altKey === true;
	Fit._internal.Events.KeysDown.Meta = ev.metaKey === true;
	Fit._internal.Events.KeysDown.KeyUp = ev.keyCode;
	Fit._internal.Events.KeysDown.KeyDown = -1;
});

// ==============================================
// Mouse and touch tracking
// ==============================================

// Using event capturing to make sure event is registered before target is reached.
// This is not supported by MSIE 8, but we solve this by updating the state when
// Fit.Events.GetPointerState() is invoked.

// Notice that MouseUp is not fired when using the secondary mouse button (right click)
// if context menu is not suppressed. Therefore we always assume the secondary button
// is released when MouseDown or MouseUp is fired.
// And for consistency, we do the same for the primary button.
// Therefore, the primary and secondary buttons are never considered pressed or held down
// simultaneously.

// http://www.quirksmode.org/js/events_properties.html

Fit.Events.AddHandler(document, "mousedown", true, function(e)
{
	var ev = Fit.Events.GetEvent(e);

	if ((Fit._internal.Events.Browser.Name === "MSIE" && Fit._internal.Events.Browser.Version === 8 && ev.button === 1) || ev.button === 0)
	{
		Fit._internal.Events.Mouse.Buttons.Primary = true;
		Fit._internal.Events.Mouse.Buttons.Secondary = false;
	}
	else if (ev.button === 2)
	{
		Fit._internal.Events.Mouse.Buttons.Secondary = true;
		Fit._internal.Events.Mouse.Buttons.Primary = false;
	}

	Fit._internal.Events.Mouse.Target = Fit.Events.GetTarget(ev);
});
Fit.Events.AddHandler(document, "mouseup", true, function(e)
{
	setTimeout(function()
	{
		// OnContextMenu event usually fires before MouseUp, but on Firefox it fires after, so the
		// button states are preserved a little longer to make them accessible to OnContextMenu handlers on Firefox.
		Fit._internal.Events.Mouse.Buttons.Primary = false;
		Fit._internal.Events.Mouse.Buttons.Secondary = false;

		// OnClick event might fire after MouseUp (if mouse was not moved away from element on which
		// MouseDown fired), so keep Target a little longer to make it accessible to OnClick handlers.
		Fit._internal.Events.Mouse.Target = null;
	}, 0);
});
Fit.Events.AddHandler(document, "mouseout", true, function(e)
{
	Fit._internal.Events.Mouse.Buttons.Primary = false;
	Fit._internal.Events.Mouse.Buttons.Secondary = false;
	Fit._internal.Events.Mouse.Target = null;
});
Fit.Events.AddHandler(document, "mousemove", function(e)
{
	var ev = Fit.Events.GetEvent(e);

	if (document.body === null) // Not ready yet
		return;

	// Notice: Browser vendors are changing the way coordinates
	// and dimensions are reported. W3C previously define these as
	// integers/longs, but browsers are moving to floats for smoother
	// animation and scrolling, and for more accurate positioning.
	// https://code.google.com/p/chromium/issues/detail?id=323935
	// For consistency we use Math.floor to make sure integers are
	// always returned on both modern and legacy browsers.

	// Mouse position in viewport
	Fit._internal.Events.Mouse.Coordinates.ViewPort.X = Math.floor(ev.clientX);
	Fit._internal.Events.Mouse.Coordinates.ViewPort.Y = Math.floor(ev.clientY);

	// Mouse position in document which may have been scrolled
	var scrollPos = Fit.Dom.GetScrollPosition(document.body); // Object with integer values returned
	Fit._internal.Events.Mouse.Coordinates.Document.X = Fit._internal.Events.Mouse.Coordinates.ViewPort.X + scrollPos.X;
	Fit._internal.Events.Mouse.Coordinates.Document.Y = Fit._internal.Events.Mouse.Coordinates.ViewPort.Y + scrollPos.Y;
});
Fit.Events.AddHandler(document, "touchstart", true, function(e)
{
	var ev = Fit.Events.GetEvent(e);

	Fit._internal.Events.Mouse.Buttons.Touch = true;

	// Touch position in viewport
	Fit._internal.Events.Mouse.Coordinates.ViewPort.X = Math.floor(ev.touches[0].clientX);
	Fit._internal.Events.Mouse.Coordinates.ViewPort.Y = Math.floor(ev.touches[0].clientY);

	// Touch position in document which may have been scrolled
	var scrollPos = Fit.Dom.GetScrollPosition(document.body); // Object with integer values returned
	Fit._internal.Events.Mouse.Coordinates.Document.X = Fit._internal.Events.Mouse.Coordinates.ViewPort.X + scrollPos.X;
	Fit._internal.Events.Mouse.Coordinates.Document.Y = Fit._internal.Events.Mouse.Coordinates.ViewPort.Y + scrollPos.Y;
});
Fit.Events.AddHandler(document, "touchend", true, function(e)
{
	var ev = Fit.Events.GetEvent(e);

	Fit._internal.Events.Mouse.Buttons.Touch = false;

	/*Fit._internal.Events.Mouse.Coordinates.ViewPort.X = -1;
	Fit._internal.Events.Mouse.Coordinates.ViewPort.Y = -1;
	Fit._internal.Events.Mouse.Coordinates.Document.X = -1;
	Fit._internal.Events.Mouse.Coordinates.Document.Y = -1;*/
});
Fit.Events.AddHandler(document, "touchcancel", true, function(e)
{
	var ev = Fit.Events.GetEvent(e);

	Fit._internal.Events.Mouse.Buttons.Touch = false;

	/*Fit._internal.Events.Mouse.Coordinates.ViewPort.X = -1;
	Fit._internal.Events.Mouse.Coordinates.ViewPort.Y = -1;
	Fit._internal.Events.Mouse.Coordinates.Document.X = -1;
	Fit._internal.Events.Mouse.Coordinates.Document.Y = -1;*/
});
Fit.Events.AddHandler(document, "touchmove", function(e)
{
	var ev = Fit.Events.GetEvent(e);

	// Touch position in viewport
	Fit._internal.Events.Mouse.Coordinates.ViewPort.X = Math.floor(ev.touches[0].clientX);
	Fit._internal.Events.Mouse.Coordinates.ViewPort.Y = Math.floor(ev.touches[0].clientY);

	// Touch position in document which may have been scrolled
	var scrollPos = Fit.Dom.GetScrollPosition(document.body); // Object with integer values returned
	Fit._internal.Events.Mouse.Coordinates.Document.X = Fit._internal.Events.Mouse.Coordinates.ViewPort.X + scrollPos.X;
	Fit._internal.Events.Mouse.Coordinates.Document.Y = Fit._internal.Events.Mouse.Coordinates.ViewPort.Y + scrollPos.Y;
});

// ==============================================
// Simple mutation tracking
// ==============================================

// This is a very simple substitution for native mutation observers,
// which unfortunately requires recent versions of some of the major
// browsers (e.g. IE 11, Safari 6 and Chrome on Android 4.4).

Fit._internal.Events.MutationObservers = [];
Fit._internal.Events.MutationObserverIds = -1;
Fit._internal.Events.MutationObserverIntervalId = -1;
Fit._internal.Events.MutationCheckExecuting = false;
Fit._internal.Events.MutationRegisterPostponed = [];

/// <function container="Fit.Events" name="AddMutationObserver" access="public" static="true" returns="integer">
/// 	<description>
/// 		Registers mutation observer which is invoked when a DOMElement is updated. By default
/// 		only attributes and dimensions are observed. Use deep flag to have children and character data observed too.
/// 		An observer ID is returned which can be used to remove mutation observer.
/// 		Important: Mutation observers should be removed when no longer needed for better performance!
/// 		To remove an observer from within the observer function itself, simply call disconnect().
/// 	</description>
/// 	<param name="elm" type="DOMElement"> DOMElement to observe </param>
/// 	<param name="obs" type="function"> JavaScript observer function to register - receives reference to DOMElement being observed when updated </param>
/// 	<param name="deep" type="boolean" default="false"> Flag indicating whether to check for modifications within element (children and character data) - this could potentially be expensive </param>
/// </function>
Fit.Events.AddMutationObserver = function(elm, obs, deep)
{
	Fit.Validation.ExpectDomElement(elm);
	Fit.Validation.ExpectFunction(obs);
	Fit.Validation.ExpectBoolean(deep, true);

	// Postpone if check is running

	if (Fit._internal.Events.MutationCheckExecuting === true)
	{
		Fit.Array.Add(Fit._internal.Events.MutationRegisterPostponed, { Task: "Add", Element: elm, Observer: obs, Deep: deep === true });
		return;
	}

	// Configure event handlers responsible for triggering mutation check

	if (Fit._internal.Events.MutationObservers.length === 0)
	{
		Fit.Events.AddHandler(document, "click", Fit._internal.Events.CheckMutations);
		Fit.Events.AddHandler(document, "mousedown", Fit._internal.Events.CheckMutations);
		Fit.Events.AddHandler(document, "mouseup", Fit._internal.Events.CheckMutations);
		Fit.Events.AddHandler(document, "keypress", Fit._internal.Events.CheckMutations); // Not using keydown, it fires continuously
		Fit.Events.AddHandler(document, "keyup", Fit._internal.Events.CheckMutations);
		Fit.Events.AddHandler(document, "touchstart", Fit._internal.Events.CheckMutations);
		Fit.Events.AddHandler(document, "touchend", Fit._internal.Events.CheckMutations);
		Fit.Events.AddHandler(document, "touchcancel", Fit._internal.Events.CheckMutations);
		Fit._internal.Events.MutationObserverIntervalId = setInterval(Fit._internal.Events.CheckMutations, 1000);
	}

	// Add mutation observer

	var hashCode = 0;
	var dimensions = elm.offsetWidth + "x" + elm.offsetHeight;

	if (deep === true)
	{
		hashCode = Fit.String.Hash(elm.outerHTML + dimensions);
	}
	else
	{
		var clone = elm.cloneNode(false);
		hashCode = Fit.String.Hash(clone.outerHTML + dimensions)
	}

	Fit._internal.Events.MutationObserverIds++;
	Fit.Array.Add(Fit._internal.Events.MutationObservers, { Element: elm, Observer: obs, Hash: hashCode, Deep: (deep === true), Id: Fit._internal.Events.MutationObserverIds });

	return Fit._internal.Events.MutationObserverIds;
}

/// <function container="Fit.Events" name="RemoveMutationObserver" access="public" static="true">
/// 	<description> Remove mutation observer </description>
/// 	<param name="elm" type="DOMElement"> DOMElement being observed </param>
/// 	<param name="obs" type="function"> JavaScript observer function to remove </param>
/// 	<param name="deep" type="boolean" default="undefined"> If defined, observer must have been registered with the same deep value to be removed </param>
/// </function>
/// <function container="Fit.Events" name="RemoveMutationObserver" access="public" static="true">
/// 	<description> Remove mutation observer by ID </description>
/// 	<param name="id" type="integer"> Observer ID returned from AddMutationObserver(..) function </param>
/// </function>
Fit.Events.RemoveMutationObserver = function()
{
	var elm, obs, deep, id = undefined;

	if (arguments.length > 1)
	{
		elm = arguments[0];
		obs = arguments[1];
		deep = arguments[2];

		Fit.Validation.ExpectDomElement(elm);
		Fit.Validation.ExpectFunction(obs);
		Fit.Validation.ExpectBoolean(deep, true);
	}
	else
	{
		id = arguments[0];

		Fit.Validation.ExpectInteger(id);
	}

	if (Fit._internal.Events.MutationCheckExecuting === true)
	{
		if (Fit.Validation.IsSet(id) === true)
		{
			Fit.Array.Add(Fit._internal.Events.MutationRegisterPostponed, { Task: "Remove", Id: id });
		}
		else
		{
			Fit.Array.Add(Fit._internal.Events.MutationRegisterPostponed, { Task: "Remove", Element: elm, Observer: obs, Deep: deep === true });
		}

		return;
	}

	var found = null;

	Fit.Array.ForEach(Fit._internal.Events.MutationObservers, function(mo)
	{
		if ((Fit.Validation.IsSet(id) === true && mo.Id === id) || (mo.Element === elm && mo.Observer === obs && mo.Deep === ((Fit.Validation.IsSet(deep) === true) ? deep : false)))
		{
			found = mo;
			return false; // Break loop
		}
	});

	if (found !== null)
		Fit.Array.Remove(Fit._internal.Events.MutationObservers, found);

	// Remove event handlers if all mutation observers have been removed

	if (Fit._internal.Events.MutationObservers.length === 0)
	{
		Fit.Events.RemoveHandler(document, "click", Fit._internal.Events.CheckMutations);
		Fit.Events.RemoveHandler(document, "mousedown", Fit._internal.Events.CheckMutations);
		Fit.Events.RemoveHandler(document, "mouseup", Fit._internal.Events.CheckMutations);
		Fit.Events.RemoveHandler(document, "keypress", Fit._internal.Events.CheckMutations); // Not using keydown, it fires continuously
		Fit.Events.RemoveHandler(document, "keyup", Fit._internal.Events.CheckMutations);
		Fit.Events.RemoveHandler(document, "touchstart", Fit._internal.Events.CheckMutations);
		Fit.Events.RemoveHandler(document, "touchend", Fit._internal.Events.CheckMutations);
		Fit.Events.RemoveHandler(document, "touchcancel", Fit._internal.Events.CheckMutations);
		clearInterval(Fit._internal.Events.MutationObserverIntervalId);
	}
}

Fit._internal.Events.CheckMutations = function()
{
	// Guard against changes to mutation observer collection while running CheckMutations().
	// This is necessary in case a running mutation observer, triggered from CheckMutations(),
	// results in another mutation observer being added/removed. We do not want to change a
	// collection being iterated, and we do not want to risk invoking mutation observers that
	// have been removed.
	Fit._internal.Events.MutationCheckExecuting = true;
	
	var toRemove = [];

	Fit.Array.ForEach(Fit._internal.Events.MutationObservers, function(mo)
	{
		// Skip mutation observers removed while CheckMutations() was running

		var skipRemovedObserver = false;

		Fit.Array.ForEach(Fit._internal.Events.MutationRegisterPostponed, function(mop)
		{
			if (mop.Task === "Add")
			{
				return; // Skip, only check for removals
			}

			if ((Fit.Validation.IsSet(mop.Id) === true && mop.Id === mo.Id) || (mop.Element === mo.Element && mop.Observer === mo.Observer && mo.Deep === ((Fit.Validation.IsSet(mo.Deep) === true) ? mo.Deep : false)))
			{
				// Observer has been scheduled for removal - do not invoke it

				skipRemovedObserver = true;
				return false; // Break loop
			}

		});

		if (skipRemovedObserver === true)
		{
			return; // Skip, scheduled for removal
		}

		// Calculate and compare hashes revealing changes to element

		var newHash = 0;
		var dimensions = mo.Element.offsetWidth + "x" + mo.Element.offsetHeight;

		if (mo.Deep === true)
		{
			newHash = Fit.String.Hash(mo.Element.outerHTML + dimensions);
		}
		else
		{
			var clone = mo.Element.cloneNode(false);
			newHash = Fit.String.Hash(clone.outerHTML + dimensions)
		}

		// Trigger mutation observer if element has changed

		if (mo.Hash !== newHash)
		{
			// Element has mutated

			mo.Hash = newHash;

			// Create global disconnect function allowing observer to remove itself by simply invoking disconnect()

			var orgDisconnect = window.disconnect;
			window.disconnect = function() { Fit.Array.Add(toRemove, mo); };

			// Call observer

			var error = null;

			try
			{
				mo.Observer(mo.Element);
			}
			catch (err)
			{
				error = err;
			}

			// Remove global disconnect function

			if (orgDisconnect)
			{
				window.disconnect = orgDisconnect;
			}
			else
			{
				try
				{
					delete window.disconnect; // Fails in IE8 with "Object doesn't support this action"
				}
				catch (err)
				{
					window.disconnect = undefined;
				}
			}

			// Re-throw error if observer failed

			if (error !== null)
				Fit.Validation.Throw(error);
		}
	});

	// Remove observers that called disconnect()

	Fit.Array.ForEach(toRemove, function(mo)
	{
		Fit.Events.RemoveMutationObserver(mo.Element, mo.Observer, mo.Deep);
	});

	// Handle mutation observers that were added/removed
	// while CheckMutations() invoked existing mutation observers.

	Fit._internal.Events.MutationCheckExecuting = false;

	Fit.Array.ForEach(Fit._internal.Events.MutationRegisterPostponed, function(mo)
	{
		if (mo.Task === "Add")
		{
			Fit.Events.AddMutationObserver(mo.Element, mo.Observer, mo.Deep);
		}
		else // if (mo.Task === "Remove")
		{
			if (Fit.Validation.IsSet(mo.Id) === true)
			{
				Fit.Events.RemoveMutationObserver(mo.Id);
			}
			else
			{
				Fit.Events.RemoveMutationObserver(mo.Element, mo.Observer, mo.Deep);
			}
		}
	});

	Fit._internal.Events.MutationRegisterPostponed = [];
}

// ==============================================
// OnReady handling
// ==============================================

/// <function container="Fit.Events" name="OnReady" access="public" static="true">
/// 	<description> Registers OnReady handler which gets fired when document is ready, or if it is already ready </description>
/// 	<param name="callback" type="function"> JavaScript function to register </param>
/// </function>
Fit.Events.OnReady = function(callback)
{
	Fit.Validation.ExpectFunction(callback);

	if (Fit._internal.Events.OnReadyFired === true)
	{
		callback();
	}
	else
	{
		Fit._internal.Events.OnReadyHandlers.push(callback);
	}
}

Fit.Events.AddHandler(window, "load", function()
{
	Fit._internal.Events.OnReadyFired = true;

	Fit.Array.ForEach(Fit._internal.Events.OnReadyHandlers, function(handler)
	{
		handler();
	});

	Fit.Array.Clear(Fit._internal.Events.OnReadyHandlers);
});

/// <function container="Fit.Events" name="OnDomReady" access="public" static="true">
/// 	<description> Registers OnReady handler which gets fired when DOM is ready for manipulation, or if it is already ready </description>
/// 	<param name="callback" type="function"> JavaScript function to register </param>
/// </function>
Fit.Events.OnDomReady = function(callback)
{
	Fit.Validation.ExpectFunction(callback);

	if (Fit._internal.Events.OnDomReadyFired === true)
	{
		callback();
	}
	else
	{
		Fit._internal.Events.OnDomReadyHandlers.push(callback);
	}
}

Fit.Events.AddHandler(document, "DOMContentLoaded", function()
{
	Fit._internal.Events.OnDomReadyFired = true;

	Fit.Array.ForEach(Fit._internal.Events.OnDomReadyHandlers, function(handler)
	{
		handler();
	});

	Fit.Array.Clear(Fit._internal.Events.OnDomReadyHandlers);
});

Fit.Http = {};

Fit._internal.Http = {};
Fit._internal.Http.JsonpRequest = {};
Fit._internal.Http.JsonpRequest.Callbacks = {};

// Use http://www.jsontest.com for testing

/// <container name="Fit.Http.Request">
/// 	Asynchronous HTTP request functionality (AJAX/WebService).
///
/// 	// Example code
///
/// 	var http = new Fit.Http.Request(&quot;CreateUser.php&quot;);
///
/// 	http.SetData(&quot;username=Jack&amp;password=Secret&quot;);
/// 	http.OnStateChange(function(r)
/// 	{
/// 		&#160;&#160;&#160;&#160; if (http.GetCurrentState() === 4 &amp;&amp; http.GetHttpStatus() === 200)
/// 		&#160;&#160;&#160;&#160;&#160;&#160;&#160;&#160; alert(&quot;User created - server said: &quot; + http.GetResponseText());
/// 	});
///
/// 	http.Start();
/// </container>

/// <function container="Fit.Http.Request" name="Request" access="public">
/// 	<description> Constructor - creates instance of Request class </description>
/// 	<param name="uri" type="string"> URL to request </param>
/// </function>
Fit.Http.Request = function(uri)
{
	/*
	// Test case
	req = new Fit.Http.Request("./post.php");
	req.AddData("Name", "Jimmy");
	req.AddData("Age", "31");
	req.AddData("Gender", "Male");
	req.OnStateChange(function(r) { console.log("State listener", r, r.GetCurrentState(), r.GetHttpStatus()); });
	req.OnStateChange(function(r) { console.log("OnStateChange ", r, r.GetCurrentState(), r.GetHttpStatus()); });
	req.OnSuccess(function(r) { console.log("OnSuccess ", r, r.GetResponseText()); });
	req.OnSuccess(function(r) { console.log("Finally done!"); });
	req.OnFailure(function(r) { console.log("OnFailure ", r, r.GetHttpStatus()); });
	req.Start();*/

	Fit.Validation.ExpectStringValue(uri);

	var me = this;
	var url = uri;
	var async = -1; // -1 = not defined / enforced, 0 = sync, 1 = async
	var httpRequest = getHttpRequestObject();
	var customHeaders = {};
	var customProperties = {};
	var formData = null;
	var data = null;
	var method = null;

	var onStateChange = [];
	var onRequestHandlers = [];
	var onSuccessHandlers = [];
	var onFailureHandlers = [];
	var onAbortHandlers = [];

	// Init

	function init()
	{
		httpRequest.onreadystatechange = function()
		{
			me._internal.FireOnStateChange();

			if (httpRequest.readyState === 4)
			{
				if (httpRequest.status === 0)
				{
					me._internal.FireOnAbort();
				}
				else if (httpRequest.status >= 200 && httpRequest.status <= 299) // Entire 2xx range indicates success
				{
					me._internal.FireOnSuccess();
				}
				else
				{
					me._internal.FireOnFailure();
				}
			}
		}

		// Cross Site Request Forgery (CSRF) protection
		// https://markitzeroday.com/x-requested-with/cors/2017/06/29/csrf-mitigation-for-ajax-requests.html
		me.AddHeader("X-Requested-With", "XMLHttpRequest");
	}

	// Public

	/// <function container="Fit.Http.Request" name="AddHeader" access="public">
	/// 	<description> Add header to request </description>
	/// 	<param name="key" type="string"> Header key </param>
	/// 	<param name="value" type="string"> Header value </param>
	/// </function>
	this.AddHeader = function(key, value)
	{
		Fit.Validation.ExpectStringValue(key);
		Fit.Validation.ExpectString(value);
		customHeaders[key.toLowerCase()] = { Key: key, Value: value };
	}

	/// <function container="Fit.Http.Request" name="GetHeader" access="public" returns="string">
	/// 	<description> Get request header - returns Null if not found </description>
	/// 	<param name="key" type="string"> Header name </param>
	/// </function>
	this.GetHeader = function(key)
	{
		Fit.Validation.ExpectString(key);
		return (Fit.Validation.IsSet(customHeaders[key.toLowerCase()]) === true ? customHeaders[key.toLowerCase()].Value : null);
	}

	/// <function container="Fit.Http.Request" name="RemoveHeader" access="public">
	/// 	<description> Remove request header </description>
	/// 	<param name="key" type="string"> Header name </param>
	/// </function>
	this.RemoveHeader = function(key)
	{
		Fit.Validation.ExpectString(key);
		delete customHeaders[key.toLowerCase()];
	}

	/// <function container="Fit.Http.Request" name="GetHeaders" access="public" returns="string[]">
	/// 	<description> Get all request header names </description>
	/// </function>
	this.GetHeaders = function()
	{
		var keys = [];

		Fit.Array.ForEach(customHeaders, function(key)
		{
			Fit.Array.Add(keys, customHeaders[key].Key);
		})

		return keys;
	}

	/// <function container="Fit.Http.Request" name="ClearHeaders" access="public">
	/// 	<description> Remove all request headers </description>
	/// </function>
	this.ClearHeaders = function()
	{
		customHeaders = {};
	}

	/// <function container="Fit.Http.Request" name="SetData" access="public">
	/// 	<description> Set data to post - this will change the request method from GET to POST </description>
	/// 	<param name="dataObj" type="object"> Data to send </param>
	/// </function>
	this.SetData = function(dataObj)
	{
		me.ClearFormData(); // Clears both form data and removes content-type header if ensured in conjunction with form data previously set
		data = null;

		if (typeof(dataObj) === "string" && (me.GetHeader("content-type") === null || me.GetHeader("content-type").toLowerCase() === "application/x-www-form-urlencoded"))
		{
			// Backward compatibility - Fit.Http.Request previously only allowed "key=val&key2=val2&etc" being passed to SetData.
			// Now accepting both the old "form data string mode" and any kind of object which will be stringified upon request.
			// Unfortunately this means that passing a "clean string" will not be possible without triggering "form data mode",
			// unless the Content-Type header is set prior to calling SetData("My string").
			// So request.SetData("Hello world") without setting the Content-Type header first will be considered form data
			// (Hello world=) and the Content-Type header will be set to "application/x-www-form-urlencoded".
			Fit.Browser.Log("Deprecated use of SetData(..) to set form data on instance of Fit.Http.Request - please use AddFormData(..) instead! If data added is not to be considered form data then make sure to set Content-Type header prior to calling SetData(..)!");

			formData = {};
			ensureContentTypeHeaderForFormData();

			var coll = parseKeyValuePairs(dataObj);

			Fit.Array.ForEach(coll, function(key)
			{
				formData[key] = { Value: coll[key], Encode: true };
			});
		}
		else
		{
			data = dataObj;
		}
	}

	/// <function container="Fit.Http.Request" name="GetData" access="public" returns="object">
	/// 	<description> Get data set to be posted </description>
	/// </function>
	this.GetData = function()
	{
		if (formData !== null)
		{
			return getFormDataString(false); // False = do not encode values (returns string as provided to SetData(..))
		}

		return data;
	}

	/// <function container="Fit.Http.Request" name="AddFormData" access="public">
	/// 	<description>
	/// 		Add form data - this will change the request method from GET to POST
	/// 		and cause the following header to be added to the request, unless already
	/// 		defined: Content-type: application/x-www-form-urlencoded
	/// 	</description>
	/// 	<param name="key" type="string"> Data key </param>
	/// 	<param name="value" type="string"> Data value </param>
	/// 	<param name="uriEncode" type="boolean" default="true">
	/// 		Set False to prevent value from being URI encoded to preserve special characters
	/// 	</param>
	/// </function>
	this.AddFormData = function(key, value, uriEncode)
	{
		Fit.Validation.ExpectStringValue(key);
		Fit.Validation.ExpectString(value);
		Fit.Validation.ExpectBoolean(uriEncode, true);

		if (formData === null)
		{
			formData = {};
			ensureContentTypeHeaderForFormData();
		}
		
		formData[key] = { Value: value, Encode: (uriEncode !== false) };
	}

	this.AddData = function(key, value, uriEncode) // Backward compatibility
	{
		Fit.Validation.ExpectStringValue(key);
		Fit.Validation.ExpectString(value);
		Fit.Validation.ExpectBoolean(uriEncode, true);

		Fit.Browser.Log("Use of deprecated AddData(..) function to set form data on instance of Fit.Http.Request - please use AddFormData(..) instead!")
		
		me.AddFormData(key, value, uriEncode);
	}

	/// <function container="Fit.Http.Request" name="GetFormData" access="public" returns="string">
	/// 	<description> Get form value added to form data collection - returns Null if not found </description>
	/// 	<param name="key" type="string"> Data key </param>
	/// </function>
	this.GetFormData = function(key)
	{
		Fit.Validation.ExpectString(key);
		return (formData !== null && Fit.Validation.IsSet(formData[key]) === true ? formData[key].Value : null);
	}

	/// <function container="Fit.Http.Request" name="RemoveFormData" access="public">
	/// 	<description> Remove form value from form data collection </description>
	/// 	<param name="key" type="string"> Data key </param>
	/// </function>
	this.RemoveFormData = function(key)
	{
		Fit.Validation.ExpectString(key);

		if (formData !== null)
			delete formData[key];
	}

	/// <function container="Fit.Http.Request" name="ClearFormData" access="public">
	/// 	<description> Remove all form values from form data collection </description>
	/// </function>
	this.ClearFormData = function()
	{
		formData = null;

		if (me.GetHeader("content-type") !== null && customHeaders["content-type"]._ensured === true)
			me.RemoveHeader("content-type");
	}

	/// <function container="Fit.Http.Request" name="Method" access="public" returns="string">
	/// 	<description> Get/set request method (e.g. GET, POST, HEAD, PUT, DELETE, OPTIONS) </description>
	/// 	<param name="val" type="string" default="undefined"> If defined, changes HTTP request method to specified value </param>
	/// </function>
	this.Method = function(val)
	{
		Fit.Validation.ExpectString(val, true);

		if (Fit.Validation.IsSet(val) === true)
		{
			method = val;
		}

		return (method !== null ? method : (data !== null || formData !== null ? "POST" : "GET"));
	}

	/// <function container="Fit.Http.Request" name="Async" access="public" returns="boolean">
	/// 	<description> Get/set flag indicating whether request is made asynchronously or synchronously </description>
	/// 	<param name="val" type="boolean" default="undefined"> If defined, enforces an async or sync request based on the boolean value provided </param>
	/// </function>
	this.Async = function(val)
	{
		Fit.Validation.ExpectBoolean(val, true);

		if (Fit.Validation.IsSet(val) === true)
		{
			async = (val === true ? 1 : 0);
		}

		if (async !== -1) // Enforced (value is 0 or 1)
			return (async === 1);

		// Not enforced - request will become async if event handlers are registered
		return (onStateChange.length > 0 || onSuccessHandlers.length > 0 || onFailureHandlers.length > 0);
	}

	/// <function container="Fit.Http.Request" name="Url" access="public" returns="string">
	/// 	<description> Get/set request URL </description>
	/// 	<param name="val" type="string" default="undefined"> If defined, changes request URL to specified value </param>
	/// </function>
	this.Url = function(val)
	{
		Fit.Validation.ExpectStringValue(val, true);

		if (Fit.Validation.IsSet(val) === true)
		{
			url = val;
		}

		return url;
	}

	/// <function container="Fit.Http.Request" name="Start" access="public">
	/// 	<description>
	/// 		Invoke request. An asynchroneus request is performed if an
	/// 		OnStateChange, OnSuccess, or OnFailure event handler has been set.
	/// 		If no event handlers have been set, a synchronous request will be performed,
	/// 		causing the client to wait (and freeze) until data is received.
	/// 	</description>
	/// </function>
	this.Start = function()
	{
		if (formData !== null && data !== null)
		{
			Fit.Validation.ThrowError("Unable to send both (JSON) Data and Form Data simultaneously - specify only one type of data to send");
		}

		// Fire OnRequest

		var cancel = me._internal.FireOnRequest();

		if (cancel === true)
			return;

		// Perform request

		var httpMethod = me.Method();
		var async = me.Async();
		httpRequest.open(httpMethod, url, async);

		for (var header in customHeaders)
		{
			httpRequest.setRequestHeader(header, customHeaders[header].Value);
		}

		Fit.Array.ForEach(customProperties, function(key)
		{
			httpRequest[key] = customProperties[key];
		});

		// Monitor request to catch communication problems (e.g. DNS errors)
		var checkerId = -1;
		checkerId = setInterval(function()
		{
			if (me.GetCurrentState() === 4) // Request done
			{
				clearInterval(checkerId);

				if (me.GetHttpStatus() === 0)
				{
					// Request is done (ready state === 4) and failed (HTTP status === 0),
					// possibly due to DNS problem (ERR_NAME_NOT_RESOLVED) - fire OnFailure.

					me._internal.FireOnFailure();
				}
			}
		}, 1000);

		try // Using try/catch to catch any error that may occur when initializing connection
		{
			if (formData !== null)
				httpRequest.send(getFormDataString(true));
			else
				httpRequest.send((data !== null ? (typeof(data) === "string" ? data : JSON.stringify(data)) : ""));
		}
		catch (err)
		{
			me._internal.FireOnFailure();
		}
	}

	/// <function container="Fit.Http.Request" name="Abort" access="public">
	/// 	<description> Abort asynchroneus request </description>
	/// </function>
	this.Abort = function()
	{
		httpRequest.abort();
	}

	/// <function container="Fit.Http.Request" name="GetResponseXml" access="public" returns="Document">
	/// 	<description>
	/// 		Returns result from request as XML or HTML document.
	/// 		Return value will only be as expected if GetCurrentState() returns a value of 4
	/// 		(request done) and GetHttpStatus() returns a value of 2xx (request successful).
	/// 	</description>
	/// </function>
	this.GetResponseXml = function()
	{
		return httpRequest.responseXML;
	}

	/// <function container="Fit.Http.Request" name="GetResponseText" access="public" returns="string">
	/// 	<description>
	/// 		Returns text result from request.
	/// 		Return value will only be as expected if GetCurrentState() returns a value of 4
	/// 		(request done) and GetHttpStatus() returns a value of 2xx (request successful).
	/// 	</description>
	/// </function>
	this.GetResponseText = function()
	{
		return httpRequest.responseText;
	}

	/// <function container="Fit.Http.Request" name="GetResponseJson" access="public" returns="object">
	/// 	<description>
	/// 		Returns result from request as JSON object, Null if no response was returned.
	/// 		Return value will only be as expected if GetCurrentState() returns a value of 4
	/// 		(request done) and GetHttpStatus() returns a value of 2xx (request successful).
	/// 	</description>
	/// </function>
	this.GetResponseJson = function()
	{
		return ((httpRequest.responseText !== "") ? JSON.parse(httpRequest.responseText) : null);
	}

	/// <function container="Fit.Http.Request" name="GetResponse" access="public" returns="object">
	/// 	<description>
	/// 		Returns result from request. Use this to obtain e.g. binary data on supported browsers.
	/// 		For requests without custom RequestProperties set the return value will be the response text.
	/// 	</description>
	/// </function>
	this.GetResponse = function()
	{
		return (((!httpRequest.responseType || httpRequest.responseType === "text") && typeof(httpRequest.responseText) === "string") ? httpRequest.responseText : httpRequest.response);
	}

	/// <function container="Fit.Http.Request" name="GetCurrentState" access="public" returns="integer">
	/// 	<description>
	/// 		Get current request state.
	/// 		0 = Unsent
	/// 		1 = Opened
	/// 		2 = Headers received
	/// 		3 = Loading
	/// 		4 = Done (response is ready for processing)
	/// 	</description>
	/// </function>
	this.GetCurrentState = function() // 0 = unsent, 1 = opened, 2 = headers received, 3 = loading, 4 = done
	{
		return httpRequest.readyState;
	}

	/// <function container="Fit.Http.Request" name="GetHttpStatus" access="public" returns="integer">
	/// 	<description>
	/// 		Returns HTTP status. Common return values are:
	/// 		200 = OK (successful request)
	/// 		304 = Forbidden (access denied)
	/// 		404 = Not found
	/// 		408 = Request time out
	/// 		500 = Internal server error
	/// 		503 = Service unavailable
	/// 	</description>
	/// </function>
	this.GetHttpStatus = function()
	{
		return httpRequest.status;
	}

	/// <function container="Fit.Http.Request" name="GetResponseHeaders" access="public" returns="object[]">
	/// 	<description> Get response headers - returned array contain objects with Key (string) and Value (string) properties </description>
	/// </function>
	this.GetResponseHeaders = function()
	{
		var headers = [];

		if (httpRequest.getAllResponseHeaders() === "")
			return headers;

		Fit.Array.ForEach(Fit.String.Trim(httpRequest.getAllResponseHeaders()).split("\n"), function(h)
		{
			var info = h.split(":");
			Fit.Array.Add(headers, { Key: Fit.String.Trim(info[0]), Value: Fit.String.Trim(info[1]) });
		});

		return headers;
	}

	/// <function container="Fit.Http.Request" name="GetResponseHeader" access="public" returns="string">
	/// 	<description> Get response header (e.g. text/html) - returns Null if not found </description>
	/// 	<param name="key" type="string"> Header key (e.g. Content-Type) </param>
	/// </function>
	this.GetResponseHeader = function(key)
	{
		Fit.Validation.ExpectString(key);
		return httpRequest.getResponseHeader(key);
	}

	// Events

	/// <function container="Fit.Http.Request" name="OnStateChange" access="public">
	/// 	<description>
	/// 		Add function to invoke when request state is changed.
	/// 		Use GetCurrentState() to read the state at the given time.
	/// 	</description>
	/// 	<param name="func" type="function">
	/// 		JavaScript function invoked when state changes.
	/// 		Fit.Http.Request instance is passed to function.
	/// 	</param>
	/// </function>
	this.OnStateChange = function(func)
	{
		Fit.Validation.ExpectFunction(func);
		Fit.Array.Add(onStateChange, func);
	}

	this.SetStateListener = this.OnStateChange; // Backward compatibility

	/// <function container="Fit.Http.Request" name="OnRequest" access="public">
	/// 	<description>
	/// 		Add function to invoke when request is initiated.
	/// 		Request can be canceled by returning False.
	/// 	</description>
	/// 	<param name="func" type="function">
	/// 		JavaScript function invoked when request is initiated.
	/// 		Fit.Http.Request instance is passed to function.
	/// 	</param>
	/// </function>
	this.OnRequest = function(func)
	{
		Fit.Validation.ExpectFunction(func);
		Fit.Array.Add(onRequestHandlers, func);
	}

	/// <function container="Fit.Http.Request" name="OnSuccess" access="public">
	/// 	<description> Add function to invoke when request is successful </description>
	/// 	<param name="func" type="function">
	/// 		JavaScript function invoked when request finished successfully.
	/// 		Fit.Http.Request instance is passed to function.
	/// 	</param>
	/// </function>
	this.OnSuccess = function(func)
	{
		Fit.Validation.ExpectFunction(func);
		Fit.Array.Add(onSuccessHandlers, func);
	}

	/// <function container="Fit.Http.Request" name="OnFailure" access="public">
	/// 	<description> Add function to invoke when request is unsuccessful </description>
	/// 	<param name="func" type="function">
	/// 		JavaScript function invoked when request finished, but not successfully.
	/// 		Fit.Http.Request instance is passed to function.
	/// 	</param>
	/// </function>
	this.OnFailure = function(func)
	{
		Fit.Validation.ExpectFunction(func);
		Fit.Array.Add(onFailureHandlers, func);
	}

	/// <function container="Fit.Http.Request" name="OnAbort" access="public">
	/// 	<description> Add function to invoke when request is canceled </description>
	/// 	<param name="func" type="function">
	/// 		JavaScript function invoked when request is canceled.
	/// 		Fit.Http.Request instance is passed to function.
	/// 	</param>
	/// </function>
	this.OnAbort = function(func)
	{
		Fit.Validation.ExpectFunction(func);
		Fit.Array.Add(onAbortHandlers, func);
	}

	/// <function container="Fit.Http.Request" name="RequestProperties" access="public" returns="object">
	/// 	<description>
	/// 		Set/get custom XHR request properties.
	/// 		Example of property object: { withCredentials: true, responseType: 'blob' }.
	/// 		How different browsers and versions support and handle custom properties differ:
	/// 		https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest
	/// 		Full cross browser support is therefore not guaranteed.
	/// 	</description>
	/// 	<param name="propertyObject" type="object" default="undefined"> If specified, properties will be applied to XHR request when Start() is invoked </param>
	/// </function>
	this.RequestProperties = function(propertyObject)
	{
		Fit.Validation.ExpectObject(propertyObject, true);

		if (Fit.Validation.IsSet(propertyObject) === true)
		{
			customProperties = propertyObject;
		}

		return customProperties;
	}

	// Protected

	this._internal =
	{
		FireOnStateChange: function()
		{
			Fit.Array.ForEach(onStateChange, function(handler) { handler(me); });
		},
		
		FireOnSuccess: function()
		{
			Fit.Array.ForEach(onSuccessHandlers, function(handler) { handler(me); });
		},

		FireOnFailure: function()
		{
			Fit.Array.ForEach(onFailureHandlers, function(handler) { handler(me); });
		},

		FireOnAbort: function()
		{
			Fit.Array.ForEach(onAbortHandlers, function(handler) { handler(me); });
		},

		FireOnRequest: function()
		{
			var cancel = false;

			Fit.Array.ForEach(onRequestHandlers, function(handler)
			{
				if (handler(me) === false)
					cancel = true;
			});

			return cancel;
		},
	}

	// Private

	function getHttpRequestObject()
	{
		if (window.XMLHttpRequest) // Firefox, IE7, Chrome, Opera, Safari
			return new XMLHttpRequest();
		else if (window.ActiveXObject) // IE5, IE6
			return new ActiveXObject("Microsoft.XMLHTTP");

		throw new Error("Http Request object not supported");
	}

	function parseKeyValuePairs(formDataStr) // formDataStr = key1=val1&name=james&keyOnly&more=data
	{
		Fit.Validation.ExpectString(formDataStr);

		if (formDataStr === "")
			return {};

		var obj = {};
		var entries = formDataStr.split("&");

		Fit.Array.ForEach(entries, function(entry)
		{
			var kv = entry.split("=");
			obj[kv[0]] = (kv.length > 1 ? kv[1] : "");
		});

		return obj;
	}

	function getFormDataString(encode) // Returns form data in query string format: key1=val1&name=james&keyOnly=&more=data
	{
		Fit.Validation.ExpectBoolean(encode);

		var formDataStr = "";

		Fit.Array.ForEach((formData !== null ? formData : {}), function(key)
		{
			formDataStr += (formDataStr !== "" ? "&" : "") + key + "=" + (encode === true && formData[key].Encode === true ? encodeURIComponent(formData[key].Value) : formData[key].Value);
		});

		return formDataStr;
	}

	function ensureContentTypeHeaderForFormData() // Add content-type header for Form Data if content-type header has not already been defined
	{
		if (me.GetHeader("content-type") === null)
		{
			// https://www.w3.org/Protocols/rfc2616/rfc2616-sec7.html#sec7.2.1
			me.AddHeader("content-type", "application/x-www-form-urlencoded");
			customHeaders["content-type"]._ensured = true;
		}
	}

	init();
}

/// <container name="Fit.Http.JsonRequest" extends="Fit.Http.Request">
/// 	Asynchronous HTTP request functionality (AJAX/WebService)
/// 	optimized for exchanging data with the server in JSON format.
/// 	Extending from Fit.Http.Request.
///
/// 	// Example code
///
/// 	var http = new Fit.Http.JsonRequest(&quot;WebService.asmx/AddUser&quot;);
///
/// 	http.SetData({ Username: &quot;Jack&quot;, Password: &quot;Secret&quot; });
/// 	http.OnSuccess(function(sender)
/// 	{
/// 		&#160;&#160;&#160;&#160; var json = http.GetResponseJson();
/// 		&#160;&#160;&#160;&#160; alert(&quot;User created - server response: &quot; + json.Message);
/// 	});
///
/// 	http.Start();
/// </container>

/// <function container="Fit.Http.JsonRequest" name="JsonRequest" access="public">
/// 	<description>
/// 		Constructor - creates instance of JSON Request class.
/// 	</description>
/// 	<param name="url" type="string">
/// 		URL to request, e.g.
/// 		http://server/_layouts/15/Company/MyWebService.asmx/MyMethod
/// 	</param>
/// </function>
Fit.Http.JsonRequest = function(url)
{
	Fit.Validation.ExpectStringValue(url);
	Fit.Core.Extend(this, Fit.Http.Request).Apply(url);

	var me = this;

	function init()
	{
		me.AddHeader("Content-Type", "application/json; charset=UTF-8");
	}

	this.AddFormData = function(key, value, uriEncode)
	{
		Fit.Validation.ThrowError("Use SetData(..) to set JSON request data for JSON WebService");
	}

	/// <function container="Fit.Http.JsonRequest" name="GetResponseJson" access="public" returns="object">
	/// 	<description>
	/// 		Returns result from request as JSON object, Null if no response was returned.
	/// 		Return value will only be as expected if GetCurrentState() returns a value of 4
	/// 		(request done) and GetHttpStatus() returns a value of 2xx (request successful).
	/// 		Notice: .NET usually wraps data in a .d property. Data is automatically extracted
	/// 		from this property, hence contained data is returned as the root object.
	/// 	</description>
	/// </function>
	this.GetResponseJson = Fit.Core.CreateOverride(this.GetResponseJson, function()
	{
		var resp = base();

		if (url.toLowerCase().indexOf(".asmx/") !== -1 && resp && resp.d)
			resp = resp.d; // Extract .NET response data

		return resp;
	});

	init();
}

/// <container name="Fit.Http.JsonpRequest">
/// 	JSONP (JSON with Padding) request functionality allowing for cross-domain data exchange.
///
/// 	// Example code
///
/// 	var http = new Fit.Http.JsonpRequest(&quot;GetUsers.php&quot;);
/// 	http.OnSuccess(function(r)
/// 	{
/// 		&#160;&#160;&#160;&#160; var data = http.GetResponse();
/// 		&#160;&#160;&#160;&#160; console.log(data);
/// 	});
/// 	http.Start();
/// </container>

/// <function container="Fit.Http.JsonpRequest" name="JsonpRequest" access="public">
/// 	<description> Constructor - creates instance of JsonpRequest class </description>
/// 	<param name="uri" type="string"> URL to request </param>
/// 	<param name="jsonpCallbackName" type="string" default="callback">
/// 		Name of URL parameter receiving name of JSONP callback function
/// 	</param>
/// </function>
Fit.Http.JsonpRequest = function(uri, jsonpCallbackName)
{
	Fit.Validation.ExpectStringValue(uri);
	Fit.Validation.ExpectStringValue(jsonpCallbackName, true);

	var me = this;
	var url = uri;
	var cbKey = ((Fit.Validation.IsSet(jsonpCallbackName) === true) ? jsonpCallbackName : "callback");
	var cbId = null;
	var data = {};
	var timeout = 30000;
	var timer = -1;
	var response = null;

	var onRequestHandlers = [];
	var onSuccessHandlers = [];
	var onTimeoutHandlers = [];

	/// <function container="Fit.Http.JsonpRequest" name="Url" access="public" returns="string">
	/// 	<description> Get/set request URL </description>
	/// 	<param name="val" type="string" default="undefined"> If defined, changes request URL to specified value </param>
	/// </function>
	this.Url = function(val)
	{
		Fit.Validation.ExpectStringValue(val, true);

		if (Fit.Validation.IsSet(val) === true)
		{
			url = val;
		}

		return url;
	}

	/// <function container="Fit.Http.JsonpRequest" name="Callback" access="public" returns="string">
	/// 	<description> Get/set name of URL parameter receiving the name of the JSONP callback function </description>
	/// 	<param name="val" type="string" default="undefined"> If defined, changes the name of the URL parameter to specified value </param>
	/// </function>
	this.Callback = function(val)
	{
		Fit.Validation.ExpectStringValue(val, true);

		if (Fit.Validation.IsSet(val) === true)
		{
			cbKey = val;
		}

		return cbKey;
	}

	/// <function container="Fit.Http.JsonpRequest" name="Timeout" access="public" returns="integer">
	/// 	<description>
	/// 		Get/set request timeout in milliseconds.
	/// 		OnTimeout is fired if response is not received
	/// 		within specified amount of time. Defaults to 30000 ms.
	/// 	</description>
	/// 	<param name="val" type="string" default="undefined"> If defined, changes timeout to specified value </param>
	/// </function>
	this.Timeout = function(val)
	{
		Fit.Validation.ExpectInteger(val, true);

		if (Fit.Validation.IsSet(val) === true)
		{
			timeout = val;
		}

		return timeout;
	}

	/// <function container="Fit.Http.JsonpRequest" name="SetParameter" access="public">
	/// 	<description> Set URL parameter </description>
	/// 	<param name="key" type="string"> URL parameter key </param>
	/// 	<param name="value" type="string"> URL parameter value </param>
	/// 	<param name="uriEncode" type="boolean" default="true">
	/// 		Set False to prevent value from being URI encoded to preserve special characters
	/// 	</param>
	/// </function>
	this.SetParameter = function(key, value, uriEncode)
	{
		Fit.Validation.ExpectStringValue(key);
		Fit.Validation.ExpectString(value);
		Fit.Validation.ExpectBoolean(uriEncode, true);

		data[key] = ((uriEncode === false) ? value : encodeURIComponent(value).replace(/%20/g, "+"));
	}

	/// <function container="Fit.Http.JsonpRequest" name="GetParameter" access="public" returns="string">
	/// 	<description> Get URL parameter value - returns Null if parameter is not defined </description>
	/// 	<param name="key" type="string"> URL parameter key </param>
	/// </function>
	this.GetParameter = function(key)
	{
		Fit.Validation.ExpectString(key);

		var val = data[key];
		return ((val !== undefined) ? val : null);
	}

	/// <function container="Fit.Http.JsonpRequest" name="GetParameters" access="public" returns="string[]">
	/// 	<description> Get all URL parameter keys </description>
	/// </function>
	this.GetParameters = function()
	{
		var keys = [];

		Fit.Array.ForEach(data, function(key)
		{
			Fit.Array.Add(keys, key);
		});

		return keys;
	}

	/// <function container="Fit.Http.JsonpRequest" name="Start" access="public">
	/// 	<description> Invoke asynchroneus request </description>
	/// </function>
	this.Start = function()
	{
		// Fire OnRequest handlers

		if (fireEvent(onRequestHandlers) === false)
			return;

		response = null;

		// Handle situation where Start() is invoked multiple times before initial request is done processing.
		// Behave like Fit.Http.Request which cancels previous request.

		if (timer !== -1)
		{
			clearTimeout(timer);
			timer = -1;

			// Prevent OnSuccess handlers from executing if data is received after being canceled.
			// Request is not actually canceled, only ignored.
			// NOTICE: Do not remove callback - it would cause a JavaScript error if the situation described above occures.
			Fit._internal.Http.JsonpRequest.Callbacks[cbId] = function(response) { };
		}

		// Register callback

		cbId = "CB" + Fit.Data.CreateGuid(false);

		Fit._internal.Http.JsonpRequest.Callbacks[cbId] = function(resp)
		{
			clearTimeout(timer);
			timer = -1;

			response = resp;
			delete Fit._internal.Http.JsonpRequest.Callbacks[cbId];

			fireEvent(onSuccessHandlers);
		}

		// Configure timeout

		timer = setTimeout(function()
		{
			timer = -1;

			// Prevent OnSuccess handlers from executing if data is received after timeout is reached.
			// NOTICE: Do not remove callback - it would cause a JavaScript error if the situation described above occures.
			Fit._internal.Http.JsonpRequest.Callbacks[cbId] = function(response) { };

			fireEvent(onTimeoutHandlers);
		}, timeout);

		// Construct request URL

		var newUrl = url;
		var cbName = "Fit._internal.Http.JsonpRequest.Callbacks." + cbId;

		newUrl += ((newUrl.indexOf("?") === -1) ? "?" : "&") + cbKey + "=" + cbName;

		Fit.Array.ForEach(data, function(key)
		{
			newUrl += "&" + key + "=" + data[key];
		});

		// Inject script to invoke JSONP request

		var script = document.createElement("script");
		script.type = "text/javascript";
		script.src = newUrl;
		document.getElementsByTagName("head")[0].appendChild(script);
	}

	/// <function container="Fit.Http.JsonpRequest" name="GetResponse" access="public" returns="object">
	/// 	<description> Get response returned from server </description>
	/// </function>
	this.GetResponse = function()
	{
		return response;
	}

	// Events

	/// <function container="Fit.Http.JsonpRequest" name="OnRequest" access="public">
	/// 	<description>
	/// 		Add function to invoke when request is initiated.
	/// 		Request can be canceled by returning False.
	/// 	</description>
	/// 	<param name="func" type="function">
	/// 		JavaScript function invoked when request is initiated.
	/// 		Fit.Http.JsonpRequest instance is passed to function.
	/// 	</param>
	/// </function>
	this.OnRequest = function(func)
	{
		Fit.Validation.ExpectFunction(func);
		Fit.Array.Add(onRequestHandlers, func);
	}

	/// <function container="Fit.Http.JsonpRequest" name="OnSuccess" access="public">
	/// 	<description> Add function to invoke when request is successful </description>
	/// 	<param name="func" type="function">
	/// 		JavaScript function invoked when request finished successfully.
	/// 		Fit.Http.JsonpRequest instance is passed to function.
	/// 	</param>
	/// </function>
	this.OnSuccess = function(func)
	{
		Fit.Validation.ExpectFunction(func);
		Fit.Array.Add(onSuccessHandlers, func);
	}

	/// <function container="Fit.Http.JsonpRequest" name="OnTimeout" access="public">
	/// 	<description> Add function to invoke when request is unsuccessful due to timeout </description>
	/// 	<param name="func" type="function">
	/// 		JavaScript function invoked when request timed out.
	/// 		Fit.Http.JsonpRequest instance is passed to function.
	/// 	</param>
	/// </function>
	this.OnTimeout = function(func)
	{
		Fit.Validation.ExpectFunction(func);
		Fit.Array.Add(onTimeoutHandlers, func);
	}

	function fireEvent(handlers)
	{
		var canceled = false; // Only OnRequest can be canceled!

		Fit.Array.ForEach(handlers, function(handler)
		{
			if (handler(me) === false)
				canceled = true;
		});

		return !canceled;
	}
}

Fit.Http.DotNetJsonRequest = Fit.Http.JsonRequest;

Fit.Internationalization = { _internal: { Locale: "en", Locales: {}, Additions: {}, OnChangeHandlers: [] } };

// ====================================================
// Locales
// ====================================================

Fit.Internationalization._internal.AddSystemLocalization = function(locales) // May be called multiple times, e.g. if splitting languages up into several files
{
	Fit.Validation.ExpectObject(locales);

	// Make sure all locales inherit from "en", and make sure country specific
	// overrides (e.g. de_AT) inherits from their primary locale (e.g. de).

	Fit.Array.ForEach(locales, function(localeKey)
	{
		var key = localeKey.toLowerCase();
		var locale = null;

		if (key !== "en") // E.g. da or de_AT
		{
			// Merge everything from "en" to current locale

			var english = locales["en"] || Fit.Internationalization._internal.Locales["en"] || null;

			if (english === null)
				Fit.Validation.ThrowError("Unexpected error - English not defined in System Locales");

			locale = Fit.Core.Merge(english, locales[localeKey]);
		}
		else // en
		{
			locale = locales[localeKey];
		}

		// For country specific locales, merge everything from their parent (e.g. de_AT inherits from de)
		if (key.indexOf("_") !== -1) // E.g. de_AT
		{
			// Merge e.g. de_AT with de

			var primaryLangKey = key.split("_")[0]; // E.g. de_AT => de
			var primaryLocale = locales[primaryLangKey] || Fit.Internationalization._internal.Locales[primaryLangKey] || null;

			if (primaryLocale === null)
				Fit.Validation.ThrowError("Unexpected error - '" + primaryLangKey + "' not defined in System Locales");
			
			locale = Fit.Core.Merge(primaryLocale, locales[localeKey]);
		}

		Fit.Internationalization._internal.Locales[key] = locale;
	});
}

/// <function container="Fit.Internationalization" name="GetSystemLocale" access="public" static="true" returns="object">
/// 	<description>
/// 		Get locale object such as:
/// 		{
/// 		&#8239;&#8239;&#8239;&#8239; Formatting:
/// 		&#8239;&#8239;&#8239;&#8239; {
/// 		&#8239;&#8239;&#8239;&#8239;&#8239;&#8239;&#8239;&#8239; DecimalSeparator: '.',
/// 		&#8239;&#8239;&#8239;&#8239;&#8239;&#8239;&#8239;&#8239; ThousandsSeparator: ',',
/// 		&#8239;&#8239;&#8239;&#8239;&#8239;&#8239;&#8239;&#8239; DateFormat: 'MM/DD/YYYY',
/// 		&#8239;&#8239;&#8239;&#8239;&#8239;&#8239;&#8239;&#8239; TimeFormat: 'hh:mm',
/// 		&#8239;&#8239;&#8239;&#8239;&#8239;&#8239;&#8239;&#8239; TimeFormatLong: 'hh:mm:ss',
/// 		&#8239;&#8239;&#8239;&#8239;&#8239;&#8239;&#8239;&#8239; ClockHours: 12 // 24 or 12 (AM/PM)
/// 		&#8239;&#8239;&#8239;&#8239; },
/// 		&#8239;&#8239;&#8239;&#8239; Translations:
/// 		&#8239;&#8239;&#8239;&#8239; {
/// 		&#8239;&#8239;&#8239;&#8239;&#8239;&#8239;&#8239;&#8239; Required: 'Field is required'
/// 		&#8239;&#8239;&#8239;&#8239; }
/// 		}
/// 	</description>
/// 	<param name="localeKey" type="string" default="undefined">
/// 		If defined, specified locale such as en, en_GB, or da is returned. If not
/// 		found, en (en_US) is returned. If omitted, current locale is returned.
/// 	</param>
/// </function>
Fit.Internationalization.GetSystemLocale = function(localeKey)
{
	Fit.Validation.ExpectString(localeKey, true);

	var locale = localeKey ? localeKey.toLowerCase() : Fit.Internationalization._internal.Locale;

	// Get locale

	var locales = Fit.Internationalization._internal.Locales;
	var found = locales[locale] || null;

	// In case e.g. de_AT is loaded, but not found, try to load de instead

	if (found === null && locale.indexOf("_") !== -1) // E.g. de_AT
	{
		var key = locale.split("_")[0]; // E.g. de_AT => de
		found = locales[key] || null;
	}

	// If specified locale is not found then fall back to English

	if (found === null)
	{
		found = locales["en"] || null; // English MUST exist!
	}

	if (found === null)
	{
		Fit.Validation.ThrowError("Unexpected error - English not defined in System Locales");
	}
	
	return Fit.Core.Clone(found); // Clone to avoid changes
}

/// <function container="Fit.Internationalization" name="Locale" access="public" static="true" returns="string">
/// 	<description>
/// 		Get/set active locale. Value returned is a lower cased string such as
/// 		&quot;en&quot;, &quot;en_us&quot;, &quot;de&quot;, etc. Changing locale results in OnLocaleChanged being fired.
/// 	</description>
/// 	<param name="locale" type="string" default="undefined"> If defined, locale is updated with specified value (e.g. en, en_GB, da, etc.) </param>
/// </function>
Fit.Internationalization.Locale = function(locale)
{
	Fit.Validation.ExpectString(locale, true);

	if (Fit.Validation.IsSet(locale) === true)
	{
		var key = locale.toLowerCase();

		if (Fit.Core.IsEqual(Fit.Internationalization.GetSystemLocale(key), Fit.Internationalization.GetSystemLocale()) === false)
		{
			Fit.Internationalization._internal.Locale = key;

			Fit.Array.ForEach(Fit.Internationalization._internal.OnChangeHandlers, function(onChangeHandler)
			{
				onChangeHandler();
			});
		}
	}

	return Fit.Internationalization._internal.Locale;
}

// ====================================================
// Localization - internationalization of apps
// ====================================================

/// <function container="Fit.Internationalization" name="AddLocalization" access="public" static="true">
/// 	<description>
/// 		Register information such as translations related to a specific language and country.
/// 	</description>
/// 	<param name="type" type="function">
/// 		Object type associated with localization information - e.g. MyApp.ContactForm
/// 	</param>
/// 	<param name="translations" type="Object">
/// 		Object array containing language and country specific information such as translations.
/// 		The object array must be indexed using locale keys, and &quot;en&quot; must be defined first.
/// 		Example: { &quot;en&quot;: {}, &quot;en_GB&quot;: {}, &quot;da&quot;: {} }
/// 		Every language inherits all the information from &quot;en&quot;, and country specific information
/// 		such as &quot;de_AT&quot; automatically inherits everything from &quot;de&quot; - in which case
/// 		&quot;de&quot; must be declared first.
/// 		Information can be obtained from within instances of the given type using:
/// 		Fit.Internationalization.GetLocale(this); // Translations for current locale
/// 		Fit.Internationalization.GetLocale(this, &quot;de_AT&quot;); // Translations for specific locale
/// 		Naturally &quot;this&quot; is an instance of MyApp.ContactForm in this example.
/// 	</param>
/// </function>
Fit.Internationalization.AddLocalization = function(type, translations) // May be called multiple times, e.g. if splitting languages up into several files
{
	Fit.Validation.IsSet(type);
	Fit.Validation.ExpectObject(translations);
	
	// Assign ID to type which can be used to resolve translations later

	type._internal = type._internal || {};
	type._internal.LocalizationKey = type._internal.LocalizationKey || Fit.Data.CreateGuid();
	var typeId = type._internal.LocalizationKey;

	// Register translations

	Fit.Internationalization._internal.Additions[typeId] = Fit.Internationalization._internal.Additions[typeId] || {};
	var existingTranslations = Fit.Internationalization._internal.Additions[typeId];

	Fit.Array.ForEach(translations, function(key)
	{
		var localeKey = key.toLowerCase();
		var translationSet = translations[key];

		if (localeKey !== "en")
		{
			// Not primary english - merge with en which MUST exist

			var english = translations["en"] || existingTranslations["en"] || null;

			if (english === null)
				Fit.Validation.ThrowError("Unexpected error - English (en) not defined in locales");

			translationSet = Fit.Core.Merge(english, translationSet);
		}
		
		if (localeKey.indexOf("_") !== -1) // E.g. de_AT
		{
			// Merge e.g. de_AT with de

			var primaryLangKey = localeKey.split("_")[0];
			var primaryLocale = translations[primaryLangKey] || existingTranslations[primaryLangKey] || null;

			if (primaryLocale === null)
				Fit.Validation.ThrowError("Unexpected error - '" + primaryLangKey + "' not defined in locales");

			translationSet = Fit.Core.Merge(primaryLocale, translationSet);
		}

		existingTranslations[localeKey] = translationSet;
	});
}

/// <function container="Fit.Internationalization" name="GetLocale" access="public" static="true" returns="object">
/// 	<description> Get type specific locale information registered using Fit.Internationalization.AddLocalization(..) </description>
/// 	<param name="instance" type="object"> Instance of type used to register locale information </param>
/// 	<param name="locale" type="string" default="undefined">
/// 		If defined, information for specified locale such as en, en_GB, or da is returned.
/// 		If not found, en (en_US) is returned. If omitted, information for current locale is returned.
/// 	</param>
/// </function>
Fit.Internationalization.GetLocale = function(instance, locale)
{
	Fit.Validation.ExpectIsSet(instance);
	Fit.Validation.ExpectString(locale, true);

	var found = null;

	if (instance.constructor._internal && instance.constructor._internal.LocalizationKey)
	{
		var langKey = (locale ? locale.toLowerCase() : null) || Fit.Internationalization._internal.Locale;

		found = Fit.Internationalization._internal.Additions[instance.constructor._internal.LocalizationKey][langKey] || null;

		if (found === null && langKey.indexOf("_") !== -1) // E.g. de_AT
		{
			var primaryLangKey = langKey.split("_")[0]; // E.g. de_AT => de
			found = Fit.Internationalization._internal.Additions[instance.constructor._internal.LocalizationKey][primaryLangKey] || null;
		}
		
		if (found === null)
		{
			found = Fit.Internationalization._internal.Additions[instance.constructor._internal.LocalizationKey]["en"] || null;
		}
	}

	return found;
}

/// <function container="Fit.Internationalization" name="OnLocaleChanged" access="public" static="true">
/// 	<description> Add event handler which is called if locale is changed </description>
/// 	<param name="cb" type="function"> Event handler which takes no arguments </param>
/// </function>
Fit.Internationalization.OnLocaleChanged = function(cb)
{
	Fit.Validation.ExpectFunction(cb);
	Fit.Array.Add(Fit.Internationalization._internal.OnChangeHandlers, cb);
}

/// <function container="Fit.Internationalization" name="RemoveOnLocaleChanged" access="public" static="true">
/// 	<description> Remove event handler to avoid it being called when locale is changed </description>
/// 	<param name="cb" type="function"> Event handler to remove </param>
/// </function>
Fit.Internationalization.RemoveOnLocaleChanged = function(cb)
{
	Fit.Validation.ExpectFunction(cb);
	Fit.Array.Remove(Fit.Internationalization._internal.OnChangeHandlers, cb);
}
// ==============================================================
// WARNING: THIS FILE IS OBSOLETE!
// File will be removed in a future version of Fit.UI!
// ==============================================================

Fit.Language = {};
Fit.Language.Translations = {};

// Simply override translation object to change language

// ControlBase
Fit.Language.Translations.Required = "Field is required";

// DropDown
Fit.Language.Translations.InvalidSelection = "Invalid selection";

// FilePicker
Fit.Language.Translations.SelectFile = "Select file";
Fit.Language.Translations.SelectFiles = "Select file(s)";

// Dialog
Fit.Language.Translations.Ok = "OK";
Fit.Language.Translations.Cancel = "Cancel";

// The order of processing scripts and stylesheets:
// http://www.html5rocks.com/en/tutorials/internals/howbrowserswork/#The_order_of_processing_scripts_and_style_sheets

/// <container name="Fit.Loader">
/// 	Loader is a useful mechanism for loading styleheets and JavaScript on demand in a non blocking manner.
/// </container>
Fit.Loader = {};

/// <function container="Fit.Loader" name="ExecuteScript" access="public" static="true">
/// 	<description>
/// 		Load client script on demand in a non-blocking manner.
///
/// 		ExecuteScript differs from LoadScript in the way code is loaded
/// 		and executed. ExecuteScript loads the script using AJAX, meaning
/// 		the script file either has to be located on the same domain as
/// 		the application invoking ExecuteScript, or have the
/// 		Access-Control-Allow-Origin header configured to allow file to be
/// 		loaded from a foreign domain.
/// 		The code loaded is injected into the virtual machine meaning debugging
/// 		will not reveal from which file the code originated, although this
/// 		information can be retrived by inspecting the call stack.
/// 		ExecuteScript has the advantages that is allows for	both an OnSuccess
/// 		and OnFailure handler, and it allows for objects to be passed to
/// 		the executing script using the context parameter, which will
/// 		cause the code to execute within its own contained scope (closure).
/// 		The script will execute in the global scope if no context object is provided.
///
/// 		// Example of loading a JavaScript file, passing variables to it:
///
/// 		Fit.Loader.ExecuteScript(&quot;extensions/test/test.js&quot;, function(src)
/// 		{
/// 			&#160;&#160;&#160;&#160; alert(&quot;JavaScript &quot; + src + &quot; loaded and ready to be used!&quot;);
/// 		},
/// 		function(src)
/// 		{
/// 			&#160;&#160;&#160;&#160; alert(&quot;JavaScript &quot; + src + &quot; could NOT be loaded;);
///
/// 		}, { $: window.jQuery, mode: &quot;advanced&quot;, showData: &quot;users&quot; });
/// 	</description>
/// 	<param name="src" type="string"> Script source (path or URL) </param>
/// 	<param name="onSuccess" type="function" default="undefined">
/// 		Callback function fired when script has been successfully loaded and executed.
/// 		The function takes the script source requested as an argument.
/// 	</param>
/// 	<param name="onFailure" type="function" default="undefined">
/// 		Callback function fired if script could not be loaded or executed successfully.
/// 		The function takes the script source requested as an argument.
/// 	</param>
/// 	<param name="context" type="object" default="undefined">
/// 		Properties registered on the context object will be
/// 		exposed as globally accessible objects for the executing script.
/// 		Example: { jQuery: window.jQuery, $: window.jQuery }
/// 		The script will execute in the global window scope if no
/// 		context object is defined.
/// 	</param>
/// </function>
Fit.Loader.ExecuteScript = function(src, onSuccess, onFailure, context)
{
	// Loading JS using AJAX and Eval versus a traditional script block
	// like Fit.Loader.LoadScript(..) uses:
	// The approach with AJAX allows us to expose both OnSuccess and
	// OnFailure, even on legacy browsers. However, if a script fails
	// or need debugging, it is not immediately obvious what file is
	// being debugged since the code runs as "anonymous" code in the VM.
	// One would have to investigate the call stack to reveal the source file.
	// Also, the AJAX request will not allow scripts from remote locations
	// to be loaded, unless the Access-Control-Allow-Origin header is configured.
	// The best thing about using eval however, is the possibility of passing
	// variables to the file being loaded using the context object.

	Fit.Validation.ExpectStringValue(src);
	Fit.Validation.ExpectFunction(onSuccess, true);
	Fit.Validation.ExpectFunction(onFailure, true);

	var r = new Fit.Http.Request(src);
	r.OnSuccess(function(sender)
	{
		var js = r.GetResponseText();
		var error = null;

		if (Fit.Validation.IsSet(context) === false || context === window)
		{
			try
			{
				eval(js);
			}
			catch (err)
			{
				error = err;
			}
		}
		else
		{
			// Execute in closure (execution scope).
			// All variables registered on context object is made globally available to JS file.

			var args = "";
			var parms = "";
			for (var prop in (context ? context : {}))
			{
				args += (args !== "" ? ", " : "") + prop;
				parms += (parms !== "" ? ", " : "") + "this." + prop;
			}

			try
			{
				eval("(function() { (function(" + args + ") { " + js + " })(" + parms + "); })").call(context ? context : this); // https://jsfiddle.net/yut8fptm/
			}
			catch (err)
			{
				error = err;
			}
		}

		if (error === null && Fit.Validation.IsSet(onSuccess) === true)
		{
			onSuccess(src);
		}
		else if (error !== null)
		{
			if (window.console)
			{
				console.log(error.message);
				console.log(error.stack);
				console.log(error);
			}

			if (Fit.Validation.IsSet(onFailure) === true)
				onFailure(src);
		}
	});
	r.OnFailure(function(sender)
	{
		if (Fit.Validation.IsSet(onFailure) === true)
		{
			onFailure(src);
		}
	});
	r.Start();
}

/// <function container="Fit.Loader" name="LoadScript" access="public" static="true">
/// 	<description>
/// 		Load client script on demand in a non-blocking manner.
///
/// 		// Example of loading a JavaScript file
///
/// 		Fit.Loader.LoadScript(&quot;extensions/test/test.js&quot;, function(src)
/// 		{
/// 			&#160;&#160;&#160;&#160; alert(&quot;JavaScript &quot; + src + &quot; loaded and ready to be used!&quot;);
/// 		});
/// 	</description>
/// 	<param name="src" type="string"> Script source (path or URL) </param>
/// 	<param name="callback" type="function" default="undefined">
/// 		Callback function fired when script loading is complete - takes the script source requested as an argument.
/// 		Be aware that a load error will also trigger the callback to make sure control is always returned.
/// 		Consider using feature detection within callback function for super reliable execution - example:
/// 		if (expectedObjectOrFunction) { /* Successfully loaded, continue.. */ }
/// 	</param>
/// </function>
Fit.Loader.LoadScript = function(src, callback)
{
	Fit.Validation.ExpectStringValue(src);
	Fit.Validation.ExpectFunction(callback, true);

	if (arguments.length > 2)
	{
		// One could easily confuse LoadScript with ExecuteScript - help the developer to choose the right function
		Fit.Validation.ThrowError("Argument(s) do not match function signature - did you intend to use Fit.Loader.ExecuteScript instead ?");
	}

	// Scripts injected always load as if they had the async attribute
	// set, so we will not cause the parser to stall using this approach.
	// It is completely non-blocking while the script loads.
	// https://developer.mozilla.org/en/docs/Web/HTML/Element/script

	var script = document.createElement("script");
	script.type = "text/javascript";
	script.charset = "UTF-8";

	if (Fit.Validation.IsSet(callback) === true && (Fit.Browser.GetBrowser() !== "MSIE" || (Fit.Browser.GetBrowser() === "MSIE" && Fit.Browser.GetVersion() >= 9)))
	{
		script.onload = function() { callback(src); };

		// Terrible, but we need same behaviour for all browsers, and IE8 (and below) does not distinguish between success and failure.
		// Also, we need to make sure control is returned no matter what - just like using ordinary <script src=".."> elements which
		// doesn't halt execution on 404 or syntax errors.
		script.onerror = function() { callback(src); };
	}
	else if (Fit.Validation.IsSet(callback) === true && Fit.Browser.GetBrowser() === "MSIE" && Fit.Browser.GetVersion() <= 8)
	{
		script.onreadystatechange = function()
		{
			if (this.readyState === "complete" || this.readyState === "loaded") // loaded = initial load, complete = from cache
				callback(src);
		}
	}

	script.src = src;

	// NOTICE: Scripts loaded this way will NOT be able to reliably resolve their own
	// script block using something like this: document.scripts[document.scripts.length - 1].
	// The reason is of couse that scripts are loaded async., and multiple script blocks
	// may have been defined after LoadScript(..) was initially invoked.

	document.getElementsByTagName("head")[0].appendChild(script);
}

/// <function container="Fit.Loader" name="LoadScripts" access="public" static="true">
/// 	<description>
/// 		Chain load multiple client scripts on demand in a non-blocking manner.
///
/// 		// Example of loading multiple JavaScript files in serial:
///
/// 		Fit.Loader.LoadScripts(
/// 		[
/// 			&#160;&#160;&#160;&#160; {
/// 			&#160;&#160;&#160;&#160; &#160;&#160;&#160;&#160; source: &quot;extensions/test/menu.js&quot;,
/// 			&#160;&#160;&#160;&#160; &#160;&#160;&#160;&#160; loaded: function(cfg) { alert(&quot;JavaScript &quot; + cfg.source + &quot; loaded&quot;); }
/// 			&#160;&#160;&#160;&#160; },
/// 			&#160;&#160;&#160;&#160; {
/// 			&#160;&#160;&#160;&#160; &#160;&#160;&#160;&#160; source: &quot;http://cdn.domain.com/chat.js&quot;,
/// 			&#160;&#160;&#160;&#160; &#160;&#160;&#160;&#160; loaded: function(cfg) { alert(&quot;JavaScript &quot; + cfg.source + &quot; loaded&quot;); }
/// 			&#160;&#160;&#160;&#160; }
/// 		],
/// 		function(cfgs)
/// 		{
/// 			&#160;&#160;&#160;&#160; alert(&quot;All files loaded&quot;);
/// 		});
///
/// 		First argument is an array of script configurations:
/// 		source:string (required): Script source (path or URL)
/// 		loaded:function (optional): Callback function to execute when file has loaded (takes file configuration as argument)
/// 		Be aware that loaded callback is invoked even if a load error occures, to make sure control is returned to your code.
///
/// 		Second argument is the callback function fired when all files have finished loading - takes configuration array as argument.
/// 		This too may be invoked even if a load error occured, to make sure control is returned to your code.
///
/// 		Consider using feature detection within callback functions for super reliable execution - example:
/// 		if (expectedObjectOrFunction) { /* Successfully loaded, continue.. */ }
/// 	</description>
/// 	<param name="cfg" type="array"> Configuration array (see function description for details) </param>
/// 	<param name="callback" type="function" default="undefined"> Callback function fired when all scripts have finished loading (see function description for details) </param>
/// </function>
Fit.Loader.LoadScripts = function(cfg, callback, skipValidation)
{
	Fit.Validation.ExpectArray(cfg);
	Fit.Validation.ExpectFunction(callback, true);
	Fit.Validation.ExpectBoolean(skipValidation, true);

	// Verify configuration

	if (skipValidation !== true)
	{
		for (var i = 0 ; i < cfg.length ; i++)
		{
			Fit.Validation.ExpectStringValue(cfg[i].source);
			Fit.Validation.ExpectFunction(cfg[i].loaded, true);
		}
	}

	// Find next unhandled script to load

	var toLoad = null;

	for (var i = 0 ; i < cfg.length ; i++)
	{
		if (cfg[i].handled !== true)
		{
			toLoad = cfg[i];
			break;
		}
	}

	// Break out if no more scripts need handling

	if (toLoad === null)
	{
		if (Fit.Validation.IsSet(callback) === true)
			callback(cfg);

		return;
	}

	// Load script

	toLoad.handled = true;

	Fit.Loader.LoadScript(toLoad.source, function()
	{
		if (Fit.Validation.IsSet(toLoad.loaded) === true)
		{
			try // Use try/catch to prevent buggy code from stopping the chain
			{
				toLoad.loaded(toLoad);
			}
			catch (err)
			{
				if (window.console)
				{
					console.log(err.message);
					console.log(err.stack);
					console.log(err);
				}
			}
		}

		// Continue chain - load next script from configuration

		Fit.Loader.LoadScripts(cfg, callback, true);
	});
}

/// <function container="Fit.Loader" name="LoadStyleSheet" access="public" static="true">
/// 	<description>
/// 		Load CSS stylesheet on demand in a non-blocking manner.
/// 		It is recommended to load stylesheets before rendering items using
/// 		the CSS classes to avoid FOUC (Flash Of Unstyled Content).
///
/// 		// Example of loading a CSS file
///
/// 		Fit.Loader.LoadStyleSheet(&quot;extensions/test/layout.css&quot;, function(src)
/// 		{
/// 			&#160;&#160;&#160;&#160; alert(&quot;CSS file &quot; + src + &quot; loaded!&quot;);
/// 		});
/// 	</description>
/// 	<param name="src" type="string"> CSS file source (path or URL) </param>
/// 	<param name="callback" type="function" default="undefined">
/// 		Callback function fired when CSS file loading is complete - takes the file source requested as an argument.
/// 		Be aware that a load error will also trigger the callback to make sure control is always returned.
/// 	</param>
/// </function>
Fit.Loader.LoadStyleSheet = function(src, callback)
{
	Fit.Validation.ExpectStringValue(src);
	Fit.Validation.ExpectFunction(callback, true);

	// OnError event could likely be supported using the following
	// lines of code which allows us to check the number of loaded CSS rules:
	// W3C browsers: var success = (cssLinkNode.sheet.cssRules.length > 0);
	// Internet Explorer: var success = (cssLinkNode.styleSheet.rules.length > 0);
	// For consistency this approach is not currently being used - we need same
	// behaviour for both LoadStyleSheet(..), and LoadScript(..) which doesn't support OnError.

	var link = document.createElement("link");
	link.type = "text/css";
	link.rel = "stylesheet";

	if (Fit.Validation.IsSet(callback) === true && (Fit.Browser.GetBrowser() !== "MSIE" || (Fit.Browser.GetBrowser() === "MSIE" && Fit.Browser.GetVersion() >= 9)))
	{
		link.onload = function() { callback(src); };
		link.onerror = function() { callback(src); }; // Same behaviour as LoadScript(..)
	}
	else if (Fit.Validation.IsSet(callback) === true && Fit.Browser.GetBrowser() === "MSIE" && Fit.Browser.GetVersion() <= 8)
	{
		link.onreadystatechange = function()
		{
			if (this.readyState === "complete" || this.readyState === "loaded") // loaded = initial load, complete = from cache
				callback(src);
		}
	}

	link.href = src;
	document.getElementsByTagName("head")[0].appendChild(link);
}

/// <function container="Fit.Loader" name="LoadStyleSheets" access="public" static="true">
/// 	<description>
/// 		Load multiple stylesheets in parrallel in a non-blocking manner.
///
/// 		// Example of loading multiple CSS files:
///
/// 		Fit.Loader.LoadStyleSheets(
/// 		[
/// 			&#160;&#160;&#160;&#160; {
/// 			&#160;&#160;&#160;&#160; &#160;&#160;&#160;&#160; source: &quot;extensions/test/menu.css&quot;,
/// 			&#160;&#160;&#160;&#160; &#160;&#160;&#160;&#160; loaded: function(cfg) { alert(&quot;Stylesheet &quot; + cfg.source + &quot; loaded&quot;); }
/// 			&#160;&#160;&#160;&#160; },
/// 			&#160;&#160;&#160;&#160; {
/// 			&#160;&#160;&#160;&#160; &#160;&#160;&#160;&#160; source: &quot;http://cdn.domain.com/chat.css&quot;,
/// 			&#160;&#160;&#160;&#160; &#160;&#160;&#160;&#160; loaded: function(cfg) { alert(&quot;Stylesheet &quot; + cfg.source + &quot; loaded&quot;); }
/// 			&#160;&#160;&#160;&#160; }
/// 		],
/// 		function(cfgs)
/// 		{
/// 			&#160;&#160;&#160;&#160; alert(&quot;All stylesheets loaded&quot;);
/// 		});
///
/// 		First argument is an array of stylesheet configurations:
/// 		source:string (required): Stylesheet source (path or URL)
/// 		loaded:function (optional): Callback function to execute when stylesheet has loaded (takes stylesheet configuration as argument)
/// 		Be aware that loaded callback is invoked even if a load error occures, to make sure control is returned to your code.
///
/// 		Second argument is the callback function fired when all stylesheets have finished loading - takes configuration array as argument.
/// 		This too may be invoked even if a load error occured, to make sure control is returned to your code.
/// 	</description>
/// 	<param name="cfg" type="array"> Configuration array (see function description for details) </param>
/// 	<param name="callback" type="function" default="undefined"> Callback function fired when all stylesheets have finished loading (see function description for details) </param>
/// </function>
Fit.Loader.LoadStyleSheets = function(cfg, callback)
{
	Fit.Validation.ExpectArray(cfg);
	Fit.Validation.ExpectFunction(callback, true);

	// Verify configuration

	for (var i = 0 ; i < cfg.length ; i++)
	{
		Fit.Validation.ExpectStringValue(cfg[i].source);
		Fit.Validation.ExpectFunction(cfg[i].loaded, true);
	}

	// Invoke callback if nothing to load

	if (cfg.length === 0)
	{
		if (Fit.Validation.IsSet(callback) === true)
			callback(cfg);

		return;
	}

	// Batch load all stylesheets

	for (var i = 0 ; i < cfg.length ; i++)
	{
		// Load stylesheet

		Fit.Loader.LoadStyleSheet(cfg[i].source, function(src)
		{
			// Fire stylesheet callback function when completed

			for (var j = 0 ; j < cfg.length ; j++)
			{
				if (cfg[j].source === src)
				{
					cfg[j].handled = true;

					if (Fit.Validation.IsSet(cfg[j].loaded) === true)
					{
						try // Use try/catch to make sure a buggy callback function does not prevent "all completed" callback to be reached
						{
							cfg[j].loaded(cfg[j]);
						}
						catch (err)
						{
							if (window.console)
							{
								console.log(err.message);
								console.log(err.stack);
								console.log(err);
							}
						}
					}

					break;
				}
			}

			// Fire "all completed" callback if all stylesheets have finished loading

			for (var j = 0 ; j < cfg.length ; j++)
			{
				if (cfg[j].handled !== true)
					return;
			}

			if (Fit.Validation.IsSet(callback) === true)
				callback(cfg);
		});
	}
}

/// <container name="Fit.Template">
/// 	Templating engine allowing for separation between layout and logic.
///
/// 	// Example code
///
/// 	// Load template (asynchronously)
/// 	var tpl = new Fit.Template(true);
/// 	tpl.LoadUrl(&quot;UserListView.html&quot;, function(sender)
/// 	{
/// 		&#160;&#160;&#160;&#160; // Populate placeholders
/// 		&#160;&#160;&#160;&#160; tpl.Content.Title = &quot;User list&quot;;
/// 		&#160;&#160;&#160;&#160; tpl.Content.Description = &quot;List of users created in system&quot;;
///
/// 		&#160;&#160;&#160;&#160; // Load user data
/// 		&#160;&#160;&#160;&#160; var users = getUsers();
///
/// 		&#160;&#160;&#160;&#160; // Populate user list with data
/// 		&#160;&#160;&#160;&#160; Fit.Array.ForEach(users, function(userData)
/// 		&#160;&#160;&#160;&#160; {
/// 		&#160;&#160;&#160;&#160;&#160;&#160;&#160;&#160; var user = tpl.Content.Users.AddItem();
/// 		&#160;&#160;&#160;&#160;&#160;&#160;&#160;&#160; user.Name = userData.Name;
/// 		&#160;&#160;&#160;&#160;&#160;&#160;&#160;&#160; user.Role = userData.Role;
/// 		&#160;&#160;&#160;&#160;&#160;&#160;&#160;&#160; user.Email = userData.Email;
/// 		&#160;&#160;&#160;&#160; });
///
/// 		&#160;&#160;&#160;&#160; // Push changes to DOM
/// 		&#160;&#160;&#160;&#160; tpl.Update();
/// 	});
/// 	tpl.Render(document.getElementById("UserList"));
///
/// 	// HTML template example (UserListView.html)
///
/// 	&lt;h1&gt;{[Title]}&lt;/h1&gt;
/// 	&lt;p&gt;{[Description]}&lt;/p&gt;
/// 	&lt;table&gt;
/// 	&#160;&#160;&#160;&#160; &lt;tr&gt;
/// 	&#160;&#160;&#160;&#160;&#160;&#160;&#160;&#160; &lt;td&gt;&lt;b&gt;User ID&lt;/b&gt;&lt;/td&gt;
/// 	&#160;&#160;&#160;&#160;&#160;&#160;&#160;&#160; &lt;td&gt;&lt;b&gt;Name&lt;/b&gt;&lt;/td&gt;
/// 	&#160;&#160;&#160;&#160;&#160;&#160;&#160;&#160; &lt;td&gt;&lt;b&gt;E-mail&lt;/b&gt;&lt;/td&gt;
/// 	&#160;&#160;&#160;&#160;&#160;&#160;&#160;&#160; &lt;td&gt;&lt;b&gt;Department&lt;/b&gt;&lt;/td&gt;
/// 	&#160;&#160;&#160;&#160; &lt;/tr&gt;
/// 	&#160;&#160;&#160;&#160; &lt;!-- LIST Users --&gt;
/// 	&#160;&#160;&#160;&#160; &lt;tr&gt;
/// 	&#160;&#160;&#160;&#160;&#160;&#160;&#160;&#160; &lt;td&gt;{[Name]}&lt;/td&gt;
/// 	&#160;&#160;&#160;&#160;&#160;&#160;&#160;&#160; &lt;td&gt;{[Role]}&lt;/td&gt;
/// 	&#160;&#160;&#160;&#160;&#160;&#160;&#160;&#160; &lt;td&gt;{[Email]}&lt;/td&gt;
/// 	&#160;&#160;&#160;&#160; &lt;/tr&gt;
/// 	&#160;&#160;&#160;&#160; &lt;!-- /LIST Users --&gt;
/// 	&lt;/table&gt;
/// </container>

/// <function container="Fit.Template" name="Template" access="public">
/// 	<description> Constructor - creates instance of Template class </description>
/// 	<param name="refreshable" type="boolean" default="false">
/// 		Flag indicating whether template can be updated after being rendered
/// 		to DOM. A value of True results in template being wrapped in a div container
/// 		controlled by the templating system.
/// 	</param>
/// 	<param name="autoDispose" type="boolean" default="true">
/// 		Flag indicating whether Fit.UI controls should be automatically disposed
/// 		when removed from view. Controls are disposed once changes are pushed to
/// 		DOM using the Update() function.
/// 	</param>
/// </function>
Fit.Template = function(refreshable, autoDispose) // http://fiddle.jshell.net/5sb97qtn/28/  --  http://fiddle.jshell.net/3rbq1r13/3/
{
	Fit.Validation.ExpectBoolean(refreshable, true);
	Fit.Validation.ExpectBoolean(autoDispose, true);

	var me = this;
	var allowUnsafe = -1;		// -1 = default behaviour (see code) which may change in the future, 0 = protect against code injection, 1 = allow code injection
	var unsafeWarned = false;
	var htmlContent = "";
	var container = null;
	var pendingElements = [];	// Holds references to all DOMElements to be rendered: { Id:string, Element:DOMElements }
	var nodesRendered = [];		// Holds references to all DOMElements rendered to DOM
	var eventHandlers = []; 	// Holds references to all event handler functions associated with DOM elements: { ElementId:string, EventType:string, Callback:function }
	var controls = [];			// Holds references to all Fit.UI controls (DOMElements) rendered to DOM

	function init()
	{
		if (refreshable === true)
			container = document.createElement("div");
	}

	/// <member container="Fit.Template" name="Content" access="public" type="object">
	/// 	<description>
	/// 		Once template is loaded, any placeholder or list will be accessible
	/// 		through the Content property. A placeholder identified as UserRole
	/// 		will be accessible as templateInstance.Content.UserRole.
	/// 		UserRole is a property that can be set with either a string,
	/// 		an instance of a Fit.UI control, or a DOMElement.
	/// 		A list identified as Users is accessible using
	/// 		templateInstance.Content.Users. See Fit.TemplateList for
	/// 		additional information.
	/// 	</description>
	/// </member>
	this.Content = null;

	/// <function container="Fit.Template" name="LoadHtml" access="public">
	/// 	<description> Load HTML string into template </description>
	/// 	<param name="htmlSource" type="string"> HTML string </param>
	/// </function>
	this.LoadHtml = function(htmlSource)
	{
		Fit.Validation.ExpectString(htmlSource);
		parse(htmlSource);
	}

	/// <function container="Fit.Template" name="LoadUrl" access="public">
	/// 	<description> Load HTML from URL asynchronously </description>
	/// 	<param name="url" type="string"> URL to HTML template </param>
	/// 	<param name="cb" type="function">
	/// 		Callback function invoked once HTML template has
	/// 		been loaded. Template instance and raw HTML data
	/// 		is passed to function. At this point placeholders
	/// 		and lists are accessible from the Content propery.
	/// 	</param>
	/// </function>
	this.LoadUrl = function(url, cb)
	{
		Fit.Validation.ExpectString(url);
		Fit.Validation.ExpectFunction(cb);

		var r = new Fit.Http.Request(url);
		r.OnSuccess(function(sender)
		{
			parse(r.GetResponseText());
			cb(me, r.GetResponseText());
		});
		r.Start();
	}

	/// <function container="Fit.Template" name="AllowUnsafeContent" access="public" returns="boolean">
	/// 	<description>
	/// 		Get/set flag indicating whether unsafe string values are handled or not.
	/// 		If AllowUnsafeContent is True, arbitrary code can be added to the template
	/// 		and will be intepreted by the browser. If AllowUnsafeContent is False,
	/// 		potentially unsafe code will be encoded and displayed as is without interpretation.
	/// 	</description>
	/// 	<param name="val" type="boolean" default="undefined"> If defined, handling of string encoding is changed to reflect value </param>
	/// </function>
	this.AllowUnsafeContent = function(val)
	{
		Fit.Validation.ExpectBoolean(val, true);

		if (Fit.Validation.IsSet(val) === true)
		{
			allowUnsafe = (val === true ? 1 : 0);
		}

		return (allowUnsafe !== 0);
	}

	/// <function container="Fit.Template" name="Reset" access="public">
	/// 	<description> Resets template - all data and event handlers are removed. Change is not pushed to DOM automatically. </description>
	/// </function>
	this.Reset = function()
	{
		// Do NOT clear e.g. 'nodesRendered' or 'controls' as they are needed if template is disposed.
		// The purpose of this function is to clear data added externally, not internal state.

		parse(htmlContent); // Re-initializes Content property
		eventHandlers = [];
	}

	/// <function container="Fit.Template" name="Dispose" access="public">
	/// 	<description> Dispose template to free up memory </description>
	/// </function>
	this.Dispose = function()
	{
		if (autoDispose !== false)
		{
			Fit.Array.ForEach(controls, function(controlElm)
			{
				// Dispose control unless manually disposed by external code in which case the _internal property no longer exists
				if (controlElm._internal !== undefined)
				{
					controlElm._internal.Instance.Dispose();
				}
			});
		}

		if (container !== null)
		{
			Fit.Dom.Remove(container);
		}
		else
		{
			Fit.Array.ForEach(nodesRendered, function(node)
			{
				Fit.Dom.Remove(node);
			});
		}

		this.Content = null;
		me = htmlContent = container = pendingElements = nodesRendered = eventHandlers = controls = null;
	}

	/// <function container="Fit.Template" name="GetHtml" access="public" returns="string">
	/// 	<description> Get HTML from template including any changes made </description>
	/// </function>
	this.GetHtml = function()
	{
		return me.toString();
	}

	/// <function container="Fit.Template" name="Render" access="public">
	/// 	<description> Render template, either inline or to element specified </description>
	/// 	<param name="toElement" type="DOMElement" default="undefined"> If defined, template is rendered to this element </param>
	/// </function>
	this.Render = function(toElement)
	{
		Fit.Validation.ExpectDomElement(toElement, true);

		if (nodesRendered.length > 0)
			return; // Skip - already rendered - Update() should be used to push changes!

		// Turn Template into DOM element

		var html = me.toString(); // Also populates 'pendingElements' array containing DOMElements to be added further down
		var dom = Fit.Dom.CreateElement("<div>" + html + "</div>");

		// Inject DOMElements

		Fit.Array.ForEach(pendingElements, function(elm)
		{
			var element = dom.querySelector("var.FitTemplate[id='PH" + elm.Id + "']");

			if (element !== null) // Null if element was added with non-existing placeholder key
			{
				Fit.Dom.Replace(element, elm.Element);
			}

			if (elm.Element._internal !== undefined && elm.Element._internal.Instance !== undefined) // Fit.UI control inheriting from Fit.Controls.Component which is disposable
			{
				Fit.Array.Add(controls, elm.Element);
			}
		});

		Fit.Array.Clear(pendingElements); // No longer needed - do not create new object - it will break references to collection on lists

		// Register event handlers

		Fit.Array.ForEach(eventHandlers, function(ev)
		{
			if (ev === null) // Event handler was removed
				return;

			var elm = dom.querySelector("#" + ev.ElementId);

			if (elm !== null)
				Fit.Events.AddHandler(elm, ev.EventType, ev.Callback);
		});

		// Render to DOM

		var renderTarget = ((container !== null) ? container : toElement);
		var nodes = Fit.Array.Copy(dom.childNodes); // Copy to prevent "Collection was modified" error when rendering elements, which moves them to a new parent
		
		nodesRendered = [];

		if (Fit.Validation.IsSet(renderTarget) === true)
		{
			Fit.Array.ForEach(nodes, function(n)
			{
				Fit.Dom.Add(renderTarget, n);
				Fit.Array.Add(nodesRendered, n);
			});
		}
		else
		{
			var script = document.scripts[document.scripts.length - 1];

			Fit.Array.ForEach(nodes, function(n)
			{
				Fit.Dom.InsertBefore(script, n);
				Fit.Array.Add(nodesRendered, n);
			});
		}

		if (container !== null)
		{
			if (Fit.Validation.IsSet(toElement) === true)
			{
				Fit.Dom.Add(toElement, container);
			}
			else
			{
				var script = document.scripts[document.scripts.length - 1];
				Fit.Dom.InsertBefore(script, container);
			}
		}
	}

	/// <function container="Fit.Template" name="AddEventHandler" access="public" returns="integer">
	/// 	<description> Add event handler to element within template given by element ID - event handler ID is returned </description>
	/// 	<param name="elmId" type="string"> Element ID </param>
	/// 	<param name="eventType" type="string"> Event type (e.g. &quot;click&quot; or &quot;mouseover&quot;) </param>
	/// 	<param name="cb" type="function"> Event handler function which takes event argument </param>
	/// </function>
	this.AddEventHandler = function(elmId, eventType, cb)
	{
		Fit.Validation.ExpectStringValue(elmId);
		Fit.Validation.ExpectStringValue(eventType);
		Fit.Validation.ExpectFunction(cb);

		Fit.Array.Add(eventHandlers, { ElementId: elmId, EventType: eventType, Callback: cb });
		return (eventHandlers.length - 1);
	}

	/// <function container="Fit.Template" name="RemoveEventHandler" access="public">
	/// 	<description> Remove event handler by event ID returned by AddEventHandler(..) </description>
	/// 	<param name="eventId" type="integer"> Event ID </param>
	/// </function>
	this.RemoveEventHandler = function(eventId)
	{
		Fit.Validation.ExpectInteger(eventId);

		if (eventHandlers.length - 1 >= eventId)
			eventHandlers[eventId] = null;
	}

	/// <function container="Fit.Template" name="Update" access="public">
	/// 	<description> Push changes to DOM to make them visible through the user interface </description>
	/// </function>
	this.Update = function()
	{
		if (container === null)
			throw "UpdateTemplateError: Template has not been configured to allow updates";

		// Turn Template into DOM element

		var html = me.toString(); // Also populates 'pendingElements' array containing DOMElements to be added further down
		var dom = Fit.Dom.CreateElement("<div>" + html + "</div>");

		// Inject DOMElements

		var oldControls = controls;
		controls = [];

		Fit.Array.ForEach(pendingElements, function(elm)
		{
			var element = dom.querySelector("var.FitTemplate[id='PH" + elm.Id + "']");

			if (element !== null) // Null if element was added with non-existing placeholder key
			{
				Fit.Dom.Replace(element, elm.Element);
			}

			if (elm.Element._internal !== undefined && elm.Element._internal.Instance !== undefined) // Fit.UI control inheriting from Fit.Controls.Component which is disposable
			{
				Fit.Array.Add(controls, elm.Element);
			}
		});

		Fit.Array.Clear(pendingElements); // No longer needed - do not create new object - it will break references to collection on lists

		// Auto dispose controls previously added to template if now left out

		if (autoDispose !== false)
		{
			Fit.Array.ForEach(oldControls, function(oldControl)
			{
				// Dispose control if no longer found in view, unless manually disposed by external code in which case the _internal property no longer exists
				if (Fit.Array.Contains(controls, oldControl) === false && oldControl._internal !== undefined)
				{
					oldControl._internal.Instance.Dispose();
				}
			});
		}

		// Register event handlers

		Fit.Array.ForEach(eventHandlers, function(ev)
		{
			if (ev === null) // Event handler was removed
				return;

			var elm = dom.querySelector("#" + ev.ElementId);

			if (elm !== null)
				Fit.Events.AddHandler(elm, ev.EventType, ev.Callback);
		});

		// Clear view

		container.innerHTML = "";

		// Render to DOM

		var nodes = Fit.Array.Copy(dom.childNodes); // Copy to prevent "Collection was modified" error when rendering elements, which moves them to a new parent
		nodesRendered = [];

		Fit.Array.ForEach(nodes, function(n)
		{
			Fit.Dom.Add(container, n);
			Fit.Array.Add(nodesRendered, n);
		});
	}

	this.toString = function()
	{
		// Turn populated template into HTML string.
		// DOMElements added to template are added to DOM later - they are temporarily represented using <var> elements.
		// Corresponding, event handlers are registered later when template is rendered to real DOM.

		if (allowUnsafe === -1 && unsafeWarned === false)
		{
			unsafeWarned = true;
			Fit.Browser.Log("WARNING: An instance of Fit.Template allows for unsafe content which could potentially lead to code injection (XSS attacks). The default behaviour for handling unsafe content will change in the future from allowing unsafe content to NOT allowing unsafe content which may break this application. Please explicitely set AllowUnsafeContent(bool) to ensure compatibility with future versions of Fit.UI.");
		}

		var newHtml = htmlContent;
		Fit.Array.Clear(pendingElements); // Do not create new object - it will break references to collection on lists

		Fit.Array.ForEach(me.Content, function(key)
		{
			var obj = me.Content[key];

			if (!obj)
				return;

			if (obj._internal !== undefined && obj._internal.IsFitTemplate === true) // List
			{
				newHtml = newHtml.replace(obj._internal.Block, obj.toString());
			}
			else
			{
				if (Fit.Core.InstanceOf(obj, Fit.Controls.Component) === true) // Fit.UI Control
				{
					var id = Fit.Data.CreateGuid();
					Fit.Array.Add(pendingElements, { Id: id, Element: obj.GetDomElement() });

					newHtml = newHtml.replace("{[" + key + "]}", "<var class='FitTemplate' id='PH" + id + "'></var>");
				}
				else if (typeof(obj) === "object" && (obj instanceof Element || obj instanceof Text)) // DOM
				{
					var id = Fit.Data.CreateGuid();
					Fit.Array.Add(pendingElements, { Id: id, Element: obj });

					// Notice: Placeholders to be replaced by DOM elements should only
					// be declared once - a DOM element cannot be added multiple times!
					// Placeholders for string values can on the other hand be declared multiple times.
					newHtml = newHtml.replace("{[" + key + "]}", "<var class='FitTemplate' id='PH" + id + "'></var>");
				}
				else // String value
				{
					var sVal = (me.AllowUnsafeContent() === true ? obj.toString() : Fit.String.EncodeHtml(obj.toString()));
					newHtml = newHtml.replace(new RegExp("{\\[" + key + "\\]}", "g"), sVal);
				}
			}
		});

		// Remove placeholders that have not been replaced
		newHtml = newHtml.replace(/\{\[(\S+?)\]\}/g, "");

		return newHtml;
	}

	function parse(sourceHtml)
	{
		Fit.Validation.ExpectString(sourceHtml);

		htmlContent = sourceHtml;

		// Parse lists

		var result = {};

		var lists = handleLists(htmlContent);
		Fit.Array.ForEach(lists, function(l)
		{
			result[l] = lists[l];
		});

		// Parse placeholders

		var placeHolders = handlePlaceHolders(htmlContent);
		Fit.Array.ForEach(placeHolders, function(ph)
		{
			result[ph] = placeHolders[ph];
		});

		// Expose lists and placeholders

		me.Content = result;
	}

	function handleLists(html)
	{
		Fit.Validation.ExpectString(html);

		var regEx = /<!-- LIST (\S+) -->[\S\s]*<!-- \/LIST \1 -->/g; // https://regex101.com/r/uL4vM9/2
		var match;

		var res = {};

		while ((match = regEx.exec(html)))
		{
			res[match[1]] = createListObject(match[1], match[0]); // 0 = HTML, 1 = List name
		}

		return res;
	}

	function handlePlaceHolders(html)
	{
		Fit.Validation.ExpectString(html);

		// Remove lists and their associated placeholders.
		// We only want to extract the global placeholders,
		// not the placeholders within lists.

		var regExLists = /<!-- LIST (\S+) -->[\S\s]*<!-- \/LIST \1 -->/g;
		html = html.replace(regExLists, "");

		// Parse global placeholders

		var regEx = /\{\[(\S+?)\]\}/g; // https://regex101.com/r/aM5cV4/1
		var match;
		var res = {};

		while ((match = regEx.exec(html)))
		{
			res[match[1]] = null; // String or DOMNode
		}

		return res;
	}

	function createListObject(name, html)
	{
		Fit.Validation.ExpectString(name);
		Fit.Validation.ExpectString(html);

		// The design of the List object is not ideal.
		// Each time an item is added, the object structure representing
		// that item is parsed from HTML. Caching the parsed item and cloning it
		// the next time AddItem is called will not work since functions
		// on the 'res' object is not cloned - they keep pointing to the original
		// functions, hence they will continue using the orignal 'res' object
		// part of their closure.
		// This can be fixed by referring to 'this' rather than 'res' within the
		// functions, but we also need to "fix" clones which holds a reference to
		// 'pendingElements' on the template instance, and needs to keep this reference
		// rather than having its own copy.
		// Another issue is that the List object depends heavily on
		// functionality on the Template object (e.g. handlePlaceHolders(..)
		// and handleLists(..)). It all works - and works well - but it is a bit
		// difficult to maintain and understand, and could potentially perform better
		// if designed differently, although such performance gain would only be
		// noticable on pretty large and complex applications which is why refactoring
		// is not prioritized at the moment.

		/// <container name="Fit.TemplateList">
		/// 	A template list is a dynamically created object representing
		/// 	a variable number of items containing placeholders. An example
		/// 	could be a list of Users containing information such as Name,
		/// 	Phone number, and E-mail address about each user.
		/// </container>

		var res = { _internal: {} };
		res._internal.Id = name;
		res._internal.Block = html;
		res._internal.Html = html.replace("<!-- LIST " + name + " -->", "").replace("<!-- /LIST " + name + " -->", "");
		res._internal.Items = [];
		res._internal.PendingElements = pendingElements;
		res._internal.IsFitTemplate = true;

		/// <function container="Fit.TemplateList" name="AddItem" access="public" returns="object">
		/// 	<description>
		/// 		Create list item represented by associative object
		/// 		array containing either strings or DOMElements.
		/// 		Example:
		/// 		var item = templateInstance.Content.MyList.AddItem();
		/// 		item[&quot;Name&quot;] = &quot;James Thompson&quot;;
		/// 		item[&quot;Email&quot;] = &quot;james@server.com&quot;;
		/// 		It is also possible to assign data using properties:
		/// 		item.ProfilePicture = document.createElement(&quot;img&quot;);
		/// 		item.ProfilePicture.src = &quot;james.png&quot;;
		/// 	</description>
		/// </function>
		res.AddItem = function()
		{
			var item = handlePlaceHolders(res._internal.Html);

			var nestedLists = handleLists(res._internal.Html);
			Fit.Array.ForEach(nestedLists, function(l)
			{
				item[l] = nestedLists[l];
			});

			Fit.Array.Add(res._internal.Items, item);
			return item;
		}

		/// <function container="Fit.TemplateList" name="GetItems" access="public" returns="object[]">
		/// 	<description> Get all list items added using AddItem() </description>
		/// </function>
		res.GetItems = function()
		{
			return res._internal.Items;
		}

		/// <function container="Fit.TemplateList" name="RemoveItem" access="public">
		/// 	<description> Remove list item (associative object array) </description>
		/// 	<param name="item" type="object"> Item to remove </param>
		/// </function>
		res.RemoveItem = function(item)
		{
			Fit.Array.Remove(res._internal.Items, item);
		}

		/// <function container="Fit.TemplateList" name="Clear" access="public">
		/// 	<description> Clear list </description>
		/// </function>
		res.Clear = function()
		{
			Fit.Array.Clear(res._internal.Items);
		}

		res.toString = function()
		{
			var listHtml = "";

			function populateItem(itemHtml, item)
			{
				Fit.Array.ForEach(item, function(prop)
				{
					var obj = item[prop];

					if (!obj)
						return;

					if (obj._internal !== undefined && obj._internal.IsFitTemplate === true) // Nested list
					{
						var allSubItems = "";

						Fit.Array.ForEach(obj._internal.Items, function(subItem)
						{
							allSubItems += populateItem(obj._internal.Html, subItem);
						});

						itemHtml = itemHtml.replace(obj._internal.Block, allSubItems);
					}
					else if (Fit.Core.InstanceOf(obj, Fit.Controls.Component) === true) // Fit.UI Control
					{
						var id = Fit.Data.CreateGuid();
						Fit.Array.Add(res._internal.PendingElements, { Id: id, Element: obj.GetDomElement() });

						// Notice: Placeholders to be replaced by DOM elements should only
						// be declared once - a DOM element cannot be added multiple times!
						// Theoretically placeholders for string values could be used multiple times, but
						// for the sake of consistency we only replace the first occurrence in this case too.
						itemHtml = itemHtml.replace("{[" + prop + "]}", "<var class='FitTemplate' id='PH" + id + "'></var>");
					}
					else if (typeof(obj) === "object" && (obj instanceof Element || obj instanceof Text)) // DOM
					{
						var id = Fit.Data.CreateGuid();
						Fit.Array.Add(res._internal.PendingElements, { Id: id, Element: obj });

						// Notice: Placeholders to be replaced by DOM elements should only
						// be declared once - a DOM element cannot be added multiple times!
						// Theoretically placeholders for string values could be used multiple times, but
						// for the sake of consistency we only replace the first occurrence in this case too.
						itemHtml = itemHtml.replace("{[" + prop + "]}", "<var class='FitTemplate' id='PH" + id + "'></var>");
					}
					else // String value
					{
						var sVal = (me.AllowUnsafeContent() === true ? obj.toString() : Fit.String.EncodeHtml(obj.toString()));
						itemHtml = itemHtml.replace(new RegExp("{\\[" + prop + "\\]}", "g"), sVal);
					}
				});

				return itemHtml;
			}

			var itmHtml = res._internal.Html;

			Fit.Array.ForEach(res._internal.Items, function(item)
			{
				listHtml += populateItem(itmHtml, item);
			});

			return listHtml;
		}

		return res;
	}

	init();
}

Fit.Internationalization._internal.AddSystemLocalization(
{
	// Primary locales must be registered before country specific overrides.
	// Example order: en, en_US, en_GB, de, de_AT, etc.
	// All locales inherit from en. All country specific overrides inherit
	// from their primary locale (e.g. de_AT inherits from de).
	// English (en) MUST be defined!
	
	"en": // US
	{
		Formatting:
		{
			DecimalSeparator		: ".",
			ThousandsSeparator		: ",",
			DateFormat				: "MM/DD/YYYY",
			TimeFormat				: "hh:mm",
			TimeFormatLong			: "hh:mm:ss",
			ClockHours				: 12 // 24 or 12 (AM/PM)
		},
		Translations:
		{
			Required				: "Field is required"
		}
	},
	"en_GB":
	{
		Formatting:
		{
			DateFormat				: "DD/MM/YYYY"
		}
	},
	"da":
	{
		Formatting:
		{
			DecimalSeparator		: ",",
			ThousandsSeparator		: ".",
			DateFormat				: "DD-MM-YYYY",
			ClockHours				: 24
		},
		Translations:
		{
			Required				: "Feltet er påkrævet"
		}
	},
	"de":
	{
		Formatting:
		{
			DecimalSeparator		: ",",
			ThousandsSeparator		: ".",
			DateFormat				: "DD.MM.YYYY",
			ClockHours				: 24
		},
		Translations:
		{
			Required				: "Feld ist erforderlich"
		}
	}
});

/// <container name="Fit.Controls.Button" extends="Fit.Controls.Component">
/// 	Button control with support for Font Awesome icons
/// </container>

// http://fiddle.jshell.net/05q0tLt6/14/

/// <function container="Fit.Controls.Button" name="Button" access="public">
/// 	<description> Create instance of Button control </description>
/// 	<param name="controlId" type="string" default="undefined"> Unique control ID that can be used to access control using Fit.Controls.Find(..) </param>
/// </function>
Fit.Controls.Button = function(controlId)
{
	Fit.Validation.ExpectStringValue(controlId, true);
	Fit.Core.Extend(this, Fit.Controls.Component).Apply(controlId);

	// Internals

	var me = this;
	var id = me.GetId();
	var element = me.GetDomElement();
	var wrapper = null;
	var icon = null;
	var label = null;
	var width = { Value: -1, Unit: "px" };	// Initial width - a value of -1 indicates that size adjusts to content
	var height = { Value: -1, Unit: "px" };	// Initial height - a value of -1 indicates that size adjusts to content
	var onClickHandlers = [];

	function init()
	{
		Fit.Events.AddHandler(element, "click", function(e)
		{
			if (me.Enabled() === true)
				me.Click();
		});
		Fit.Events.AddHandler(element, "keydown", function(e)
		{
			var ev = Fit.Events.GetEvent(e);

			if (me.Enabled() === true && (ev.keyCode === 13 || ev.keyCode === 32)) // Enter or Spacebar
			{
				me.Click();
				Fit.Events.PreventDefault(ev);
			}
		});

		Fit.Dom.AddClass(element, "FitUiControl");
		Fit.Dom.AddClass(element, "FitUiControlButton");

		wrapper = document.createElement("div");
		Fit.Dom.Add(element, wrapper);

		icon = document.createElement("span");
		Fit.Dom.Add(wrapper, icon);

		label = document.createElement("span");
		Fit.Dom.Add(wrapper, label);

		me.Enabled(true);
		me.Type(Fit.Controls.ButtonType.Default);
	}

	/// <function container="Fit.Controls.Button" name="Title" access="public" returns="string">
	/// 	<description> Get/set button title </description>
	/// 	<param name="val" type="string" default="undefined"> If specified, button title will be set to specified value </param>
	/// </function>
	this.Title = function(val)
	{
		Fit.Validation.ExpectString(val, true);

		if (Fit.Validation.IsSet(val) === true)
		{
			Fit.Dom.Data(element, "title", ((val !== "") ? val : null));
			label.innerHTML = val;
		}

		return ((Fit.Dom.Data(element, "title") !== null) ? Fit.Dom.Data(element, "title") : "");
	}

	/// <function container="Fit.Controls.Button" name="Icon" access="public" returns="string">
	/// 	<description> Get/set button icon (Font Awesome icon name, e.g. fa-check-circle-o - https://fontawesome.com/v4.7.0/icons) </description>
	/// 	<param name="val" type="string" default="undefined"> If specified, button icon will be set to specified value </param>
	/// </function>
	this.Icon = function(val)
	{
		Fit.Validation.ExpectString(val, true);

		if (Fit.Validation.IsSet(val) === true)
		{
			Fit.Dom.Data(element, "icon", ((val !== "") ? val : null));
			icon.className = ((val !== "") ? "fa " + ((val.indexOf("fa-") !== 0) ? "fa-" : "") + val : "");
		}

		return ((Fit.Dom.Data(element, "icon") !== null) ? Fit.Dom.Data(element, "icon") : "");
	}

	/// <function container="Fit.Controls.Button" name="Type" access="public" returns="Fit.Controls.ButtonType">
	/// 	<description>
	/// 		Get/set button type producing specific look and feel.
	/// 		Possible values are:
	/// 		 - Fit.Controls.ButtonType.Default (white)
	/// 		 - Fit.Controls.ButtonType.Primary (blue)
	/// 		 - Fit.Controls.ButtonType.Success (green)
	/// 		 - Fit.Controls.ButtonType.Info (turquoise)
	/// 		 - Fit.Controls.ButtonType.Warning (orange)
	/// 		 - Fit.Controls.ButtonType.Danger (red)
	/// 	</description>
	/// 	<param name="val" type="Fit.Controls.ButtonType" default="undefined"> If specified, button type will be set to specified value </param>
	/// </function>
	this.Type = function(val)
	{
		Fit.Validation.ExpectStringValue(val, true);

		if (Fit.Validation.IsSet(val) === true)
		{
			if (Fit.Validation.IsSet(Fit.Controls.ButtonType[val]) === false)
				Fit.Validation.ThrowError("Unsupported button type specified - use e.g. Fit.Controls.ButtonType.Default");

			Fit.Dom.Data(element, "type", val);
		}

		return Fit.Dom.Data(element, "type");
	}

	/// <function container="Fit.Controls.Button" name="Enabled" access="public" returns="boolean">
	/// 	<description> Get/set value indicating whether button is enabled or not </description>
	/// 	<param name="val" type="boolean" default="undefined"> If specified, True enables button, False disables it </param>
	/// </function>
	this.Enabled = function(val)
	{
		Fit.Validation.ExpectBoolean(val, true);

		if (Fit.Validation.IsSet(val) === true)
		{
			Fit.Dom.Data(element, "enabled", ((val === true) ? "true" : "false"));
			element.tabIndex = ((val === true) ? 0 : -1);
		}

		return (Fit.Dom.Data(element, "enabled") === "true");
	}

	/// <function container="Fit.Controls.Button" name="Focused" access="public" returns="boolean">
	/// 	<description> Get/set value indicating whether control has focus </description>
	/// 	<param name="focus" type="boolean" default="undefined"> If defined, True assigns focus, False removes focus (blur) </param>
	/// </function>
	this.Focused = function(focus)
	{
		Fit.Validation.ExpectBoolean(focus, true);

		if (Fit.Validation.IsSet(focus) === true)
		{
			if (focus === true)
				element.focus();
			else
				element.blur();
		}

		// Fit.Dom.Contained(..) portion added to support IE which incorrectly assigns focus to contained elements, even though tabIndex is not set
		return (Fit.Dom.GetFocused() === element || (Fit.Dom.GetFocused() && Fit.Dom.Contained(element, Fit.Dom.GetFocused())));
	}

	/// <function container="Fit.Controls.Button" name="Width" access="public" returns="object">
	/// 	<description> Get/set control width - returns object with Value and Unit properties </description>
	/// 	<param name="val" type="number" default="undefined"> If defined, control width is updated to specified value. A value of -1 resets control width. </param>
	/// 	<param name="unit" type="string" default="px"> If defined, control width is updated to specified CSS unit </param>
	/// </function>
	this.Width = function(val, unit) // Differs from ControlBase.Width(..) when -1 is passed - this control resets to width:auto while ControlBase resets to width:200px
	{
		Fit.Validation.ExpectNumber(val, true);
		Fit.Validation.ExpectStringValue(unit, true);

		if (Fit.Validation.IsSet(val) === true)
		{
			if (val > -1)
			{
				width = { Value: val, Unit: ((Fit.Validation.IsSet(unit) === true) ? unit : "px") };
				element.style.width = width.Value + width.Unit;
			}
			else
			{
				width = { Value: -1, Unit: "px" };
				element.style.width = ""; // Notice: width:auto is applied in Button.css
			}
		}

		return width;
	}

	/// <function container="Fit.Controls.Button" name="Height" access="public" returns="object">
	/// 	<description> Get/set control height - returns object with Value and Unit properties </description>
	/// 	<param name="val" type="number" default="undefined"> If defined, control height is updated to specified value. A value of -1 resets control height. </param>
	/// 	<param name="unit" type="string" default="px"> If defined, control height is updated to specified CSS unit </param>
	/// </function>
	this.Height = function(val, unit)
	{
		Fit.Validation.ExpectNumber(val, true);
		Fit.Validation.ExpectStringValue(unit, true);

		if (Fit.Validation.IsSet(val) === true)
		{
			if (val > -1)
			{
				height = { Value: val, Unit: ((Fit.Validation.IsSet(unit) === true) ? unit : "px") };
				element.style.height = height.Value + height.Unit;

				// Work around bug in WebKit/Chrome:
				// https://code.google.com/p/chromium/issues/detail?id=573715
				// Also see Button.css (div.FitUiControlButton[style*="height"] > div)
				wrapper.style.position = "relative";
			}
			else
			{
				height = { Value: -1, Unit: "px" };
				element.style.height = "";

				// Undo WebKit/Chrome bug fix (see condition above)
				wrapper.style.position = "";
			}
		}

		return height;
	}

	/// <function container="Fit.Controls.Button" name="OnClick" access="public">
	/// 	<description> Set callback function invoked when button is clicked </description>
	/// 	<param name="cb" type="function"> Callback function invoked when button is clicked - takes button instance as argument </param>
	/// </function>
	this.OnClick = function(cb)
	{
		Fit.Validation.ExpectFunction(cb);
		Fit.Array.Add(onClickHandlers, cb);
	}

	/// <function container="Fit.Controls.Button" name="Click" access="public">
	/// 	<description> Programmatically trigger a button click </description>
	/// </function>
	this.Click = function()
	{
		Fit.Array.ForEach(onClickHandlers, function(handler)
		{
			handler(me);
		});
	}

	this.Dispose = Fit.Core.CreateOverride(this.Dispose, function()
	{
		me = id = element = wrapper = icon = label = width = height = onClickHandlers = null;
		base();
	});

	init();
}

/// <container name="Fit.Controls.ButtonType">
/// 	Enum values determining visual appearance of button controls
/// </container>
Fit.Controls.ButtonType =
{
	/// <member container="Fit.Controls.ButtonType" name="Default" access="public" static="true" type="string" default="Default">
	/// 	<description> White unless styled differently - default look and feel </description>
	/// </member>
	Default: "Default",

	/// <member container="Fit.Controls.ButtonType" name="Primary" access="public" static="true" type="string" default="Primary">
	/// 	<description> Blue unless styled differently </description>
	/// </member>
	Primary: "Primary",

	/// <member container="Fit.Controls.ButtonType" name="Success" access="public" static="true" type="string" default="Success">
	/// 	<description> Green unless styled differently </description>
	/// </member>
	Success: "Success",

	/// <member container="Fit.Controls.ButtonType" name="Info" access="public" static="true" type="string" default="Info">
	/// 	<description> Turquoise unless styled differently </description>
	/// </member>
	Info: "Info",

	/// <member container="Fit.Controls.ButtonType" name="Warning" access="public" static="true" type="string" default="Warning">
	/// 	<description> Orange unless styled differently </description>
	/// </member>
	Warning: "Warning",

	/// <member container="Fit.Controls.ButtonType" name="Danger" access="public" static="true" type="string" default="Danger">
	/// 	<description> Red unless styled differently </description>
	/// </member>
	Danger: "Danger"
}

Fit.Controls.Button.Type = Fit.Controls.ButtonType; // Backward compatibility

/// <container name="Fit.Controls.CheckBox" extends="Fit.Controls.ControlBase">
/// 	Simple CheckBox control.
/// 	Extending from Fit.Controls.ControlBase.
/// </container>

/// <function container="Fit.Controls.CheckBox" name="CheckBox" access="public">
/// 	<description> Create instance of CheckBox control </description>
/// 	<param name="ctlId" type="string" default="undefined"> Unique control ID that can be used to access control using Fit.Controls.Find(..) </param>
/// </function>
Fit.Controls.CheckBox = function(ctlId)
{
	Fit.Validation.ExpectStringValue(ctlId, true);
	Fit.Core.Extend(this, Fit.Controls.ControlBase).Apply(ctlId);

	var me = this;
	var checkbox = null;
	var label = null;
	var width = { Value: -1, Unit: "px" };	// Initial width - a value of -1 indicates that size adjusts to content
	var orgChecked = false;
	var isIe8 = (Fit.Browser.GetInfo().Name === "MSIE" && Fit.Browser.GetInfo().Version === 8);

	// ============================================
	// Init
	// ============================================

	function init()
	{
		me.AddCssClass("FitUiControlCheckBox");
		me.GetDomElement().tabIndex = 0;

		checkbox = document.createElement("div");
		Fit.Dom.AddClass(checkbox, "fa");
		Fit.Dom.AddClass(checkbox, "fa-check");

		Fit.Events.AddHandler(me.GetDomElement(), "click", function(e)
		{
			if (me.Enabled() === true)
			{
				//var orgVal = orgChecked;
				me.Checked(!me.Checked(), true);
				//orgChecked = orgVal;
			}
		});
		Fit.Events.AddHandler(me.GetDomElement(), "keydown", function(e)
		{
			var ev = Fit.Events.GetEvent(e);

			if (me.Enabled() === true && ev.keyCode === 32) // Spacebar
			{
				//var orgVal = orgChecked;
				me.Checked(!me.Checked(), true);
				//orgChecked = orgVal;

				Fit.Events.PreventDefault(ev); // Prevent scroll
			}
		});

		label = document.createElement("span");

		me._internal.AddDomElement(checkbox);
		me._internal.AddDomElement(label);

		me.Enabled(true);
		me.Checked(false);
		me.Width(-1);

		Fit.Internationalization.OnLocaleChanged(localize);
	}

	// ============================================
	// Public - overrides
	// ============================================

	// See documentation on ControlBase
	this.Focused = function(focus)
	{
		Fit.Validation.ExpectBoolean(focus, true);

		if (Fit.Validation.IsSet(focus) === true)
		{
			if (focus === true)
				me.GetDomElement().focus();
			else
				me.GetDomElement().blur();
		}

		// Fit.Dom.Contained(..) portion added to support IE which incorrectly assigns focus to contained elements, even though tabIndex is not set
		return (Fit.Dom.GetFocused() === me.GetDomElement() || (Fit.Dom.GetFocused() && Fit.Dom.Contained(me.GetDomElement(), Fit.Dom.GetFocused())));
	}

	// See documentation on ControlBase
	this.Value = function(val)
	{
		Fit.Validation.ExpectString(val, true);

		if (Fit.Validation.IsSet(val) === true)
		{
			var valStr = val.toLowerCase();

			if (valStr === "true")
			{
				me.Checked(true);
			}
			else if (valStr === "false")
			{
				me.Checked(false);
			}
		}

		return ((me.Checked() === true) ? "true" : "false");
	}

	/// <function container="Fit.Controls.CheckBox" name="Checked" access="public" returns="boolean">
	/// 	<description> Get/set value indicating whether control is checked </description>
	/// 	<param name="val" type="boolean" default="undefined"> If defined, control's checked state is updated to specified value </param>
	/// </function>
	this.Checked = function(val, preserveDirtyState) // preserveDirtyState is for internal use only - do not add to documentation!
	{
		Fit.Validation.ExpectBoolean(val, true);
		Fit.Validation.ExpectBoolean(preserveDirtyState, true);

		if (Fit.Validation.IsSet(val) === true)
		{
			var before = (Fit.Dom.Data(me.GetDomElement(), "checked") === "true");

			Fit.Dom.Data(me.GetDomElement(), "checked", val.toString());

			if (preserveDirtyState !== true)
				orgChecked = (Fit.Dom.Data(me.GetDomElement(), "checked") === "true");

			if (before !== val)
			{
				repaint();
				me._internal.FireOnChange();
			}
		}

		return (Fit.Dom.Data(me.GetDomElement(), "checked") === "true");
	}

	/// <function container="Fit.Controls.CheckBox" name="Width" access="public" returns="object">
	/// 	<description> Get/set control width - returns object with Value and Unit properties </description>
	/// 	<param name="val" type="number" default="undefined"> If defined, control width is updated to specified value. A value of -1 resets control width. </param>
	/// 	<param name="unit" type="string" default="px"> If defined, control width is updated to specified CSS unit </param>
	/// </function>
	this.Width = function(val, unit) // Differs from ControlBase.Width(..) when -1 is passed - this control resets to width:auto while ControlBase resets to width:200px
	{
		Fit.Validation.ExpectNumber(val, true);
		Fit.Validation.ExpectStringValue(unit, true);

		if (Fit.Validation.IsSet(val) === true)
		{
			if (val > -1)
			{
				width = { Value: val, Unit: ((Fit.Validation.IsSet(unit) === true) ? unit : "px") };
				me.GetDomElement().style.width = width.Value + width.Unit;
			}
			else
			{
				width = { Value: -1, Unit: "px" };
				me.GetDomElement().style.width = ""; // Notice: width:auto is applied in CheckBox.css
			}
		}

		return width;
	}

	// See documentation on ControlBase
	this.IsDirty = function()
	{
		return (orgChecked !== me.Checked());
	}

	// See documentation on ControlBase
	this.Clear = function()
	{
		me.Checked(false);
	}

	// See documentation on ControlBase
	this.Dispose = Fit.Core.CreateOverride(this.Dispose, function()
	{
		// This will destroy control - it will no longer work!

		Fit.Internationalization.RemoveOnLocaleChanged(localize);

		me = checkbox = label = width = orgChecked = isIe8 = null;

		base();
	});

	// Support for required checkbox - See documentation on ControlBase
	this.IsValid = Fit.Core.CreateOverride(this.IsValid, function()
	{
		if (me.Required() === true && me.Checked() === false)
		{
			return false;
		}

		return base();
	});

	// Support for required checkbox - See documentation on ControlBase
	this._internal.Validate = Fit.Core.CreateOverride(this._internal.Validate, function()
	{
		if (me.Required() === true && me.Checked() === false)
		{
			var locale = Fit.Internationalization.GetSystemLocale();
			me._internal.Data("errormessage", locale.Translations.Required);
		}

		base();
	});

	// ============================================
	// Public
	// ============================================

	/// <function container="Fit.Controls.CheckBox" name="Label" access="public" returns="string">
	/// 	<description> Get/set label associated with checkbox </description>
	/// 	<param name="val" type="string" default="undefined"> If defined, label is updated to specified value </param>
	/// </function>
	this.Label = function(val)
	{
		Fit.Validation.ExpectString(val, true);

		if (Fit.Validation.IsSet(val) === true)
		{
			label.innerHTML = val;
		}

		return label.innerHTML;
	}

	/// <function container="Fit.Controls.CheckBox" name="Enabled" access="public" returns="boolean">
	/// 	<description> Get/set value indicating whether control is enabled or not </description>
	/// 	<param name="val" type="boolean" default="undefined"> If specified, True enables control, False disables it </param>
	/// </function>
	this.Enabled = function(val)
	{
		Fit.Validation.ExpectBoolean(val, true);

		if (Fit.Validation.IsSet(val) === true)
		{
			Fit.Dom.Data(me.GetDomElement(), "enabled", val.toString());
			me.GetDomElement().tabIndex = ((val === true) ? 0 : -1);
		}

		return (Fit.Dom.Data(me.GetDomElement(), "enabled") === "true");
	}

	// ============================================
	// Private
	// ============================================

	function localize()
	{
		me._internal.Validate();
	}

	function repaint()
	{
		if (isIe8 === true)
		{
			// IE8 does not update pseudo elements properly.
			// Changing CSS classes or content within the control
			// is not sufficient - we actually have to remove the
			// control temporarily from the DOM to make it update.
			// Unfortunately this results in focus being lost if
			// control had focus, so we have to restore it as well.

			var focused = Fit.Dom.GetFocused();

			var elm = document.createElement("span");
			Fit.Dom.Replace(checkbox, elm);
			Fit.Dom.Replace(elm, checkbox);

			if (Fit.Dom.GetFocused() !== focused)
				focused.focus();
		}
	}

	init();
}

/// <container name="Fit.Controls.ContextMenu" extends="Fit.Controls.Component">
/// 	ContextMenu control allowing for quick access to select features.
/// </container>

/// <function container="Fit.Controls.ContextMenu" name="ContextMenu" access="public">
/// 	<description> Create instance of ContextMenu control </description>
/// 	<param name="controlId" type="string" default="undefined"> Unique control ID that can be used to access control using Fit.Controls.Find(..) </param>
/// </function>
Fit.Controls.ContextMenu = function(controlId)
{
	Fit.Validation.ExpectStringValue(controlId, true);
	Fit.Core.Extend(this, Fit.Controls.Component).Apply(controlId);

	var me = this;
	var tree = new Fit.Controls.TreeView("ContextMenuTreeView_" + Fit.Data.CreateGuid());
	var prevFocused = null;
	var detectBoundaries = true;
	var highlightOnInitKeyStroke = true;
	var isIe8 = (Fit.Browser.GetInfo().Name === "MSIE" && Fit.Browser.GetInfo().Version === 8);

	var onShowing = [];
	var onShown = [];
	var onHide = [];
	var onSelect = [];

	// ============================================
	// Init
	// ============================================

	function init()
	{
		Fit.Dom.Data(tree.GetDomElement(), "keynav", "false");				// True when navigating using keyboard
		Fit.Dom.Data(tree.GetDomElement(), "sticky", "false");				// True when user toggles node
		Fit.Dom.Data(tree.GetDomElement(), "viewportcollision", "false");	// True when context menu collides with viewport boundaries

		tree.AddCssClass("FitUiControlContextMenu");
		tree.Selectable(true);

		// Custom keyboard navigation

		tree.KeyboardNavigation(false);

		Fit.Events.AddHandler(tree.GetDomElement(), "keydown", function(e)
		{
			var ev = Fit.Events.GetEvent(e);

			if (ev.keyCode === 27) // Escape
			{
				me.Hide();

				// Return focus to previously focused element
				if (prevFocused !== null)
				{
					prevFocused.focus();
					prevFocused = null;
				}

				return;
			}

			var node = tree.GetNodeFocused();

			if (node === null) // In case context menu has no children
				return;

			if (highlightOnInitKeyStroke === true)
			{
				highlightOnInitKeyStroke = false;
				Fit.Dom.Data(tree.GetDomElement(), "keynav", "true"); // Requires repaint in Legacy IE
				repaint();

				// Make sure the first item is highlighted instead of
				// the 2nd item, in case initial keystroke was arrow down.

				if (ev.keyCode === 40 && tree.GetChildren().length > 0)
				{
					tree.GetChildren()[0].Focused(true);

					Fit.Events.PreventDefault(ev); // Prevent scrolling
					return;
				}
			}

			if (ev.keyCode === 37) // Arrow left
			{
				if (node.Expanded() === true)
				{
					node.Expanded(false);
				}
				else if (node.GetParent() !== null)
				{
					node.GetParent().Focused(true);
				}

				Fit.Events.PreventDefault(ev); // Prevent scrolling
				return;
			}

			if (ev.keyCode === 39) // Arrow right
			{
				if (node.GetChildren().length > 0)
				{
					node.Expanded(true);
					node.GetChildren()[0].Focused(true);
				}

				Fit.Events.PreventDefault(ev); // Prevent scrolling
				return;
			}

			if (ev.keyCode === 38) // Arrow up
			{
				var newNode = tree.GetNodeAbove(node);

				if (newNode !== null)
					newNode.Focused(true);

				Fit.Events.PreventDefault(ev); // Prevent scrolling
				return;
			}

			if (ev.keyCode === 40) // Arrow down
			{
				var newNode = tree.GetNodeBelow(node);

				if (newNode !== null)
					newNode.Focused(true);

				Fit.Events.PreventDefault(ev); // Prevent scrolling
				return;
			}

			if (ev.keyCode === 13) // Enter
			{
				if (node.Selectable() === true)
					node.Selected(true);

				return;
			}
		});

		// Have OnSelect fire when TreeView node is selected

		tree.OnSelected(function(sender, node)
		{
			if (node.Selected() === true) // OnSelected fires when both selecting and deselecting nodes
			{
				node.Selected(false); // Notice: Fires OnSelected again
				node.Expanded(!node.Expanded());

				// Navigate link contained in item, or fire ContextMenu.OnSelect

				var links = node.GetDomElement().getElementsByTagName("a");

				if (links.length === 1 && Fit.Dom.GetParentOfType(links[0], "li") === node.GetDomElement())
				{
					if (links[0] !== Fit.Events.GetPointerState().Target)
						links[0].click();

					me.Hide();
				}
				else
				{
					fireEventHandlers(onSelect, node.GetDomElement()._internal.ContextMenuItem);
				}
			}
		});

		// Support for sticky nodes

		tree.OnToggled(function(sender, node)
		{
			if (node.Expanded() === false) // Node collapsed
			{
				// Collapse all children
				Fit.Array.ForEach(node.GetChildren(), function(c)
				{
					c.Expanded(false); // Notice: Fires OnToggled again if node is expanded, causing all children to be collapsed recursively
				});
			}
			else // Node expanded
			{
				if (node.Focused() === true) // Prevent this from executing when recursively expanding parent nodes (see further down)
				{
					Fit.Dom.Data(tree.GetDomElement(), "sticky", "true");
					highlightOnInitKeyStroke = false;

					// Collapse previously expanded nodes

					var expanded = null;
					var currentNode = node;

					while (currentNode !== null)
					{
						if (currentNode.GetParent() !== null)
							expanded = getExpandedChild(currentNode.GetParent().GetChildren(), currentNode);
						else
							expanded = getExpandedChild(tree.GetChildren(), currentNode);

						if (expanded !== null)
						{
							expanded.Expanded(false); // Notice: Fires OnToggled again, causing all children to be collapsed recursively
							break;
						}

						currentNode = currentNode.GetParent();
					}
				}

				// Expand parent nodes to make the currently hovered hierarchy/path sticky
				if (node.GetParent() !== null)
					node.GetParent().Expanded(true); // Notice: Fires OnToggled again causing all parents to expand recursively

				// Boundary detection - detect and handle viewport collisions
				if (detectBoundaries === true)
					handleViewPortCollision(node.GetDomElement());
			}
		});

		// Boundary detection - detect and handle viewport collisions when hovering items to open submenus

		Fit.Events.AddHandler(tree.GetDomElement(), "mouseover", function(e)
		{
			if (detectBoundaries === true && Fit.Dom.Data(tree.GetDomElement(), "sticky") === "false") // Viewport collision is handled by OnToggled handler when items are sticky
			{
				var elm = Fit.Events.GetTarget(e);
				elm = ((elm.tagName === "LI") ? elm : Fit.Dom.GetParentOfType(elm, "li")); // Null if user is hovering context menu border or any margin/padding applied to context menu container

				if (elm !== null)
					handleViewPortCollision(elm);
			}
		});

		// Contain clicks - prevents e.g. drop down from closing when context menu is used within picker control

		Fit.Events.AddHandler(tree.GetDomElement(), "click", function(e)
		{
			Fit.Events.StopPropagation(e);
		});
	}

	// ============================================
	// Public
	// ============================================

	/// <function container="Fit.Controls.ContextMenu" name="Show" access="public">
	/// 	<description> Make context menu show up. If X,Y coordinates are not specified, the position of the mouse pointer will be used. </description>
	/// 	<param name="x" type="integer" default="undefined"> If defined, context menu will open at specified horizontal position </param>
	/// 	<param name="y" type="integer" default="undefined"> If defined, context menu will open at specified vertical position </param>
	/// </function>
	this.Show = function(x, y)
	{
		Fit.Validation.ExpectInteger(x, true);
		Fit.Validation.ExpectInteger(y, true);

		if (me._internal.ExecuteBeforeShowBehaviour() === false)
			return;
		
		me._internal.ExecuteShowBehaviour(x, y);
	}

	/// <function container="Fit.Controls.ContextMenu" name="Hide" access="public">
	/// 	<description> Hide context menu </description>
	/// </function>
	this.Hide = function()
	{
		if (me.IsVisible() === true)
		{
			Fit.Dom.Remove(tree.GetDomElement());
			fireEventHandlers(onHide);

			Fit.Array.ForEach(tree.GetChildren(), function(n) // OnToggled handler makes sure to collapse nodes recursively
			{
				n.Expanded(false);
			});

			highlightOnInitKeyStroke = true;
			Fit.Dom.Data(tree.GetDomElement(), "keynav", "false");
			Fit.Dom.Data(tree.GetDomElement(), "viewportcollision", "false");
			Fit.Dom.Data(tree.GetDomElement(), "sticky", "false");

			Fit.Array.ForEach(tree.GetDomElement().getElementsByTagName("ul"), function(ul)
			{
				Fit.Dom.Data(ul, "viewportcollision", null);
			});
		}
	}

	/// <function container="Fit.Controls.ContextMenu" name="DetectBoundaries" access="public" returns="boolean">
	/// 	<description> Get/set value indicating whether boundary/collision detection is enabled or not </description>
	/// 	<param name="val" type="boolean" default="undefined"> If defined, True enables collision detection (default), False disables it </param>
	/// </function>
	this.DetectBoundaries = function(val)
	{
		Fit.Validation.ExpectBoolean(val, true);

		if (Fit.Validation.IsSet(val) === true)
		{
			if (val === false)
			{
				Fit.Dom.Data(tree.GetDomElement(), "viewportcollision", "false");

				Fit.Array.ForEach(tree.GetDomElement().getElementsByTagName("ul"), function(ul)
				{
					Fit.Dom.Data(ul, "viewportcollision", null);
				});
			}

			detectBoundaries = val;
		}

		return detectBoundaries;
	}

	/// <function container="Fit.Controls.ContextMenu" name="IsVisible" access="public" returns="boolean">
	/// 	<description> Get value indicating whether context menu is visible or not </description>
	/// </function>
	this.IsVisible = function()
	{
		return (tree.GetDomElement().parentElement !== null);
	}

	this.GetDomElement = function() // Override GetDomElement() on Fit.Controls.Component
	{
		return tree.GetDomElement();
	}

	this.Render = function(toElement) // Override Render() on Fit.Controls.Component
	{
		Fit.Validation.ThrowError("Use Show function to open ContextMenu");
	}

	/// <function container="Fit.Controls.ContextMenu" name="AddChild" access="public">
	/// 	<description> Add item to ContextMenu </description>
	/// 	<param name="item" type="Fit.Controls.ContextMenuItem"> Item to add </param>
	/// </function>
	this.AddChild = function(item)
	{
		Fit.Validation.ExpectInstance(item, Fit.Controls.ContextMenuItem);

		var tvNode = item.GetDomElement()._internal.Node;
		tree.AddChild(tvNode);
	}

	/// <function container="Fit.Controls.ContextMenu" name="RemoveChild" access="public">
	/// 	<description> Remove item from ContextMenu </description>
	/// 	<param name="item" type="Fit.Controls.ContextMenuItem"> Item to remove </param>
	/// </function>
	this.RemoveChild = function(item)
	{
		Fit.Validation.ExpectInstance(item, Fit.Controls.ContextMenuItem);

		var tvNode = tree.GetChild(item.Value());

		if (tvNode !== null)
			tree.RemoveChild(tvNode);
	}

	/// <function container="Fit.Controls.ContextMenu" name="RemoveAllChildren" access="public">
	/// 	<description> Remove all items contained in ContextMenu </description>
	/// 	<param name="dispose" type="boolean" default="false"> Set True to dispose items </param>
	/// </function>
	this.RemoveAllChildren = function(dispose)
	{
		Fit.Validation.ExpectBoolean(dispose, true);
		tree.RemoveAllChildren(dispose);
	}

	/// <function container="Fit.Controls.ContextMenu" name="GetChild" access="public" returns="Fit.Controls.ContextMenuItem">
	/// 	<description> Get item by value - returns Null if not found </description>
	/// 	<param name="val" type="string"> Item value </param>
	/// 	<param name="recursive" type="boolean" default="false"> If defined, True enables recursive search </param>
	/// </function>
	this.GetChild = function(val, recursive)
	{
		Fit.Validation.ExpectString(val);
		Fit.Validation.ExpectBoolean(recursive, true);

		var tvNode = tree.GetChild(val, recursive);

		if (tvNode === null)
			return null;

		return tvNode.GetDomElement()._internal.ContextMenuItem;
	}

	/// <function container="Fit.Controls.ContextMenu" name="GetChildren" access="public" returns="Fit.Controls.ContextMenuItem[]">
	/// 	<description> Get all children </description>
	/// </function>
	this.GetChildren = function()
	{
		var items = [];

		Fit.Array.ForEach(tree.GetChildren(), function(tvNode)
		{
			Fit.Array.Add(items, tvNode.GetDomElement()._internal.ContextMenuItem);
		});

		return items;
	}

	/// <function container="Fit.Controls.ContextMenu" name="GetAllChildren" access="public" returns="Fit.Controls.ContextMenuItem[]">
	/// 	<description> Get all children across entire hierarchy in a flat collection </description>
	/// </function>
	this.GetAllChildren = function()
	{
		var items = [];

		Fit.Array.ForEach(tree.GetAllNodes(), function(tvNode)
		{
			Fit.Array.Add(items, tvNode.GetDomElement()._internal.ContextMenuItem);
		});

		return items;
	}

	/// <function container="Fit.Controls.ContextMenu" name="Focused" access="public" returns="boolean">
	/// 	<description> Get/set value indicating whether control has focus </description>
	/// 	<param name="value" type="boolean" default="undefined"> If defined, True assigns focus, False removes focus (blur) </param>
	/// </function>
	this.Focused = function(value)
	{
		Fit.Validation.ExpectBoolean(value, true);

		if (Fit.Validation.IsSet(value) === true)
		{
			prevFocused = Fit.Dom.GetFocused();
		}

		return tree.Focused(value);
	}

	this.Dispose = Fit.Core.CreateOverride(this.Dispose, function()
	{
		if (me === Fit._internal.ContextMenu.Current) // In case ContextMenu is being disposed while being used
			Fit._internal.ContextMenu.Current = null;

		tree.Dispose();
		me = tree = prevFocused = detectBoundaries = highlightOnInitKeyStroke = isIe8 = onShowing = onShown = onHide = onSelect = null;

		base();
	});

	// ============================================
	// Events
	// ============================================

	/// <function container="Fit.Controls.ContextMenu" name="OnShowing" access="public">
	/// 	<description>
	/// 		Add event handler fired before context menu is shown.
	/// 		This event can be canceled by returning False.
	/// 		Function receives one argument: Sender (Fit.Controls.ContextMenu).
	/// 	</description>
	/// 	<param name="cb" type="function"> Event handler function </param>
	/// </function>
	this.OnShowing = function(cb)
	{
		Fit.Validation.ExpectFunction(cb);
		Fit.Array.Add(onShowing, cb);
	}

	/// <function container="Fit.Controls.ContextMenu" name="OnShown" access="public">
	/// 	<description>
	/// 		Add event handler fired when context menu is shown.
	/// 		Function receives one argument: Sender (Fit.Controls.ContextMenu).
	/// 	</description>
	/// 	<param name="cb" type="function"> Event handler function </param>
	/// </function>
	this.OnShown = function(cb)
	{
		Fit.Validation.ExpectFunction(cb);
		Fit.Array.Add(onShown, cb);
	}

	/// <function container="Fit.Controls.ContextMenu" name="OnHide" access="public">
	/// 	<description>
	/// 		Add event handler fired when context menu is hidden.
	/// 		Function receives one argument: Sender (Fit.Controls.ContextMenu).
	/// 	</description>
	/// 	<param name="cb" type="function"> Event handler function </param>
	/// </function>
	this.OnHide = function(cb)
	{
		Fit.Validation.ExpectFunction(cb);
		Fit.Array.Add(onHide, cb);
	}

	/// <function container="Fit.Controls.ContextMenu" name="OnSelect" access="public">
	/// 	<description>
	/// 		Add event handler fired when an item is selected in context menu.
	/// 		Function receives two arguments:
	/// 		Sender (Fit.Controls.ContextMenu) and Item (Fit.Controls.ContextMenuItem).
	/// 	</description>
	/// 	<param name="cb" type="function"> Event handler function </param>
	/// </function>
	this.OnSelect = function(cb)
	{
		Fit.Validation.ExpectFunction(cb);
		Fit.Array.Add(onSelect, cb);
	}

	// ============================================
	// Private
	// ============================================

	function fireEventHandlers(handlers, item) // Notice: item variable only provided for OnSelect event
	{
		var cancel = false;

		Fit.Array.ForEach(handlers, function(cb)
		{
			if (cb(me, item) === false)
				cancel = true; // Do NOT cancel loop though! All handlers must be fired!
		});

		return !cancel;
	}

	function getExpandedChild(children, childToIgnore)
	{
		Fit.Validation.ExpectInstanceArray(children, Fit.Controls.TreeViewNode);
		Fit.Validation.ExpectInstance(childToIgnore, Fit.Controls.TreeViewNode);

		var found = null;

		Fit.Array.ForEach(children, function(c)
		{
			if (c.Expanded() === true && c !== childToIgnore)
			{
				found = c;
				return false; // Break loop
			}
		});

		return found;
	}

	function handleViewPortCollision(nodeElm)
	{
		Fit.Validation.ExpectDomElement(nodeElm);

		if (nodeElm.getElementsByTagName("ul").length > 0)
		{
			var ul = nodeElm.getElementsByTagName("ul")[0];
			Fit.Dom.Data(ul, "viewportcollision", null); // Requires repaint in Legacy IE

			repaint(function()
			{
				var pos = Fit.Dom.GetPosition(ul, true);

				if (Fit.Browser.GetViewPortDimensions().Height < pos.Y + ul.offsetHeight)
					Fit.Dom.Data(ul, "viewportcollision", "true");
			});
		}
	}

	function repaint(f)
	{
		Fit.Validation.ExpectFunction(f, true);

		var cb = ((Fit.Validation.IsSet(f) === true) ? f : function() {});

		if (isIe8 === false)
		{
			cb();
		}
		else
		{
			// Flickering may occure on IE8 when updating UI over time
			// (UI update + JS thread released + UI updates again "later").

			Fit.Dom.AddClass(tree.GetDomElement(), "FitUi_Non_Existing_ContextMenu_Class");
			Fit.Dom.RemoveClass(tree.GetDomElement(), "FitUi_Non_Existing_ContextMenu_Class");

			setTimeout(function()
			{
				cb();

				Fit.Dom.AddClass(tree.GetDomElement(), "FitUi_Non_Existing_ContextMenu_Class");
				Fit.Dom.RemoveClass(tree.GetDomElement(), "FitUi_Non_Existing_ContextMenu_Class");
			}, 0);
		}
	}

	this._internal = (this._internal ? this._internal : {});

	this._internal.ExecuteBeforeShowBehaviour = function()
	{
		// Fire OnShowing event

		if (fireEventHandlers(onShowing) === false)
			return false;

		// Close context menu if one is already open

		if (Fit._internal.ContextMenu.Current !== null && Fit._internal.ContextMenu.Current !== me && Fit._internal.ContextMenu.Current.IsVisible() === true)
		{
			Fit._internal.ContextMenu.Current.Hide();
			Fit._internal.ContextMenu.Current = null;
		}

		return true;
	}

	this._internal.ExecuteShowBehaviour = function(x, y)
	{
		Fit.Validation.ExpectInteger(x, true);
		Fit.Validation.ExpectInteger(y, true);
		
		// Set position

		var pos = Fit.Events.GetPointerState().Coordinates.Document;

		var posX = ((Fit.Validation.IsSet(x) === true) ? x : pos.X);
		var posY = ((Fit.Validation.IsSet(y) === true) ? y : pos.Y);

		tree.GetDomElement().style.left = posX + "px";
		tree.GetDomElement().style.top = posY + "px";
		tree.GetDomElement().style.width = "auto"; // TreeView.Width(val, unit) cannot be used to set width:auto

		// Add to DOM

		if (me.IsVisible() === false) // Only append to DOM once - ContextMenu may have been rooted elsewhere by external code
		{
			Fit.Dom.Add(document.body, tree.GetDomElement());
			Fit._internal.ContextMenu.Current = me;
		}

		// Update all items to let them know if they have children that contains children.
		// This lets us use CSS ( li[data-deep="true"] > ul > li { /* ... */ } ) to indent all children
		// within an item if just one of them has children (hence we need to make room for an expand/collapse icon).

		Fit.Array.Recurse(tree.GetChildren(), "GetChildren", function(child)
		{
			// Multiple children in the same level will cause their parent to get updated multiple times which is acceptable
			
			Fit.Dom.Data(child.GetDomElement(), "deep", "false");

			if (child.GetChildren().length > 0)
			{
				if (child.GetParent() !== null)
					Fit.Dom.Data(child.GetParent().GetDomElement(), "deep", "true");
				else
					Fit.Dom.Data(child.GetTreeView().GetDomElement().children[0].children[0] /* ul > li */, "deep", "true");
			}
		});

		// Boundary detection

		if (detectBoundaries === true)
		{
			var treeElm = tree.GetDomElement();
			Fit.Dom.Data(treeElm, "viewportcollision", "false");

			if (Fit.Browser.GetViewPortDimensions().Height < (posY - Fit.Dom.GetScrollPosition(document.body).Y) + treeElm.offsetHeight)
			{
				Fit.Dom.Data(treeElm, "viewportcollision", "true");
				treeElm.style.top = (posY - treeElm.offsetHeight) + "px";
			}
		}

		// Focus context menu to allow keyboard navigation

		me.Focused(true);

		// Fire OnShown event

		fireEventHandlers(onShown);

		// Make sure OnClick handler on document does not close
		// Context Menu if triggered using left button.
		Fit._internal.ContextMenu.SkipClickClose = true;
		setTimeout(function() { Fit._internal.ContextMenu.SkipClickClose = false; }, 0);
	}

	init();
}

/// <function container="Fit.Controls.ContextMenuItem" name="ContextMenuItem" access="public">
/// 	<description> Create instance of ContextMenu Item </description>
/// 	<param name="displayTitle" type="string"> Item title </param>
/// 	<param name="itemValue" type="string"> Item value </param>
/// </function>
Fit.Controls.ContextMenuItem = function(displayTitle, itemValue)
{
	Fit.Validation.ExpectString(displayTitle);
	Fit.Validation.ExpectString(itemValue);

	var me = this;
	var node = new Fit.Controls.TreeViewNode(displayTitle, itemValue);

	// ============================================
	// Init
	// ============================================

	function init()
	{
		node.GetDomElement()._internal.ContextMenuItem = me;
	}

	// ============================================
	// Public
	// ============================================

	/// <function container="Fit.Controls.ContextMenuItem" name="Title" access="public" returns="string">
	/// 	<description> Get/set item title </description>
	/// 	<param name="val" type="string" default="undefined"> If defined, item title is updated </param>
	/// </function>
	this.Title = function(val)
	{
		Fit.Validation.ExpectStringValue(val, true);
		return node.Title(val);
	}

	/// <function container="Fit.Controls.ContextMenuItem" name="Value" access="public" returns="string">
	/// 	<description> Get item value </description>
	/// </function>
	this.Value = function()
	{
		return node.Value();
	}

	/// <function container="Fit.Controls.ContextMenuItem" name="Selectable" access="public" returns="boolean">
	/// 	<description> Get/set value indicating whether item is selectable or not </description>
	/// 	<param name="val" type="boolean" default="undefined"> If defined, True enables item, False disables it </param>
	/// </function>
	this.Selectable = function(val)
	{
		Fit.Validation.ExpectBoolean(val, true);
		return node.Selectable(val);
	}

	/// <function container="Fit.Controls.ContextMenuItem" name="GetDomElement" access="public" returns="DOMElement">
	/// 	<description> Get DOMElement representing context menu item </description>
	/// </function>
	this.GetDomElement = function()
	{
		return node.GetDomElement();
	}

	/// <function container="Fit.Controls.ContextMenuItem" name="AddChild" access="public">
	/// 	<description> Add child item </description>
	/// 	<param name="item" type="Fit.Controls.ContextMenuItem"> Item to add </param>
	/// </function>
	this.AddChild = function(item)
	{
		Fit.Validation.ExpectInstance(item, Fit.Controls.ContextMenuItem);

		var tvNode = item.GetDomElement()._internal.Node;
		node.AddChild(tvNode);
	}

	/// <function container="Fit.Controls.ContextMenuItem" name="RemoveChild" access="public">
	/// 	<description> Remove child item </description>
	/// 	<param name="item" type="Fit.Controls.ContextMenuItem"> Item to remove </param>
	/// </function>
	this.RemoveChild = function(item)
	{
		Fit.Validation.ExpectInstance(item, Fit.Controls.ContextMenuItem);

		var tvNode = node.GetChild(item.Value());

		if (tvNode !== null)
			node.RemoveChild(tvNode);
	}

	/// <function container="Fit.Controls.ContextMenuItem" name="GetChild" access="public" returns="Fit.Controls.ContextMenuItem">
	/// 	<description> Get item by value - returns Null if not found </description>
	/// 	<param name="val" type="string"> Item value </param>
	/// 	<param name="recursive" type="boolean" default="false"> If defined, True enables recursive search </param>
	/// </function>
	this.GetChild = function(val, recursive)
	{
		Fit.Validation.ExpectString(val);
		Fit.Validation.ExpectBoolean(recursive, true);

		var tvNode = node.GetChild(val, recursive);

		if (tvNode === null)
			return null;

		return tvNode.GetDomElement()._internal.ContextMenuItem;
	}

	/// <function container="Fit.Controls.ContextMenuItem" name="GetChildren" access="public" returns="Fit.Controls.ContextMenuItem[]">
	/// 	<description> Get all children </description>
	/// </function>
	this.GetChildren = function()
	{
		var items = [];

		Fit.Array.ForEach(node.GetChildren(), function(tvNode)
		{
			Fit.Array.Add(items, tvNode.GetDomElement()._internal.ContextMenuItem);
		});

		return items;
	}

	/// <function container="Fit.Controls.ContextMenuItem" name="GetParent" access="public" returns="Fit.Controls.ContextMenuItem">
	/// 	<description> Get parent item - returns Null for a root item </description>
	/// </function>
	this.GetParent = function()
	{
		var parent = node.GetParent();
		return ((parent !== null) ? parent.GetDomElement()._internal.ContextMenuItem : null);
	}

	/// <function container="Fit.Controls.ContextMenuItem" name="Dispose" access="public">
	/// 	<description> Destroys item to free up memory </description>
	/// </function>
	this.Dispose = function()
	{
		node.Dispose();
		node = null;
	}

	init();
}

Fit.Controls.ContextMenu.Item = Fit.Controls.ContextMenuItem; // Backward compatibility

// Internals

Fit._internal.ContextMenu = {};
Fit._internal.ContextMenu.SkipClickClose = false;
Fit._internal.ContextMenu.Current = null;

// Event handler responsible for closing context menu when clicking outside of context menu

Fit.Events.OnReady(function()
{
	Fit.Events.AddHandler(document, "click", function(e)
	{
		if (Fit._internal.ContextMenu.SkipClickClose === true)
			return;

		var target = Fit.Events.GetTarget(e);
		var ctx = Fit._internal.ContextMenu.Current;

		if (ctx === null || target === ctx.GetDomElement() || Fit.Dom.Contained(ctx.GetDomElement(), target) === true)
			return;

		ctx.Hide();
	});

	/*Fit.Events.AddHandler(document, "mousewheel", function(e) // Close ContextMenu when scrolling
	{
		if (Fit._internal.ContextMenu.Current !== null)
			Fit._internal.ContextMenu.Current.Hide();
	});*/
});

/// <container name="Fit.Controls.WSContextMenu" extends="Fit.Controls.ContextMenu">
/// 	ContextMenu control allowing for quick access to select features provided by a WebService.
/// 	Extending from Fit.Controls.ContextMenu.
/// </container>

/// <function container="Fit.Controls.WSContextMenu" name="WSContextMenu" access="public">
/// 	<description> Create instance of WSContextMenu control </description>
/// 	<param name="controlId" type="string" default="undefined"> Unique control ID that can be used to access control using Fit.Controls.Find(..) </param>
/// </function>
Fit.Controls.WSContextMenu = function(controlId)
{
	Fit.Validation.ExpectStringValue(controlId, true);
	Fit.Core.Extend(this, Fit.Controls.ContextMenu).Apply(controlId);

	var me = this;
	var url = null;
	var jsonpCallback = null;
	var dataLoading = false;
	var onDataLoadedCallback = [];

	var onRequestHandlers = [];
	var onResponseHandlers = [];
	var onPopulatedHandlers = [];

	// ============================================
	// Init
	// ============================================

	function init()
	{
	}

	// ============================================
	// Public
	// ============================================

	// WSContextMenu has its own implementation of Show() because it is async.
	// We want to fire OnShowing, load and WAIT for the data, and THEN open the context menu and call OnShown.
	// We don't want to show the context menu or fire OnShown before it has been populated with data.
	this.Show = function(x, y)
	{
		Fit.Validation.ExpectInteger(x, true);
		Fit.Validation.ExpectInteger(y, true);

		if (dataLoading === true)
		{
			// Data is currently loading - postpone by adding request to process queue
			onDataLoaded(function() { me.Show(x, y); });
			return;
		}

		// Fire OnShowing event

		if (me._internal.ExecuteBeforeShowBehaviour() === false)
			return;

		// Load data

		dataLoading = true;

		getData(function(eventArgs)
		{
			// Populate data received

			me.RemoveAllChildren();

			Fit.Array.ForEach(eventArgs.Children, function(c)
			{
				me.AddChild(createItemFromJson(c));
			});

			// Show context menu

			me._internal.ExecuteShowBehaviour(x, y);

			// Invoke onDataLoaded callbacks

			dataLoading = false;
			fireOnDataLoaded();
		});
	}

	/// <function container="Fit.Controls.WSContextMenu" name="Url" access="public" returns="string">
	/// 	<description>
	/// 		Get/set URL to WebService responsible for providing data to ContextMenu.
	/// 		WebService must deliver all data at once in the following JSON format:
	/// 		[
	/// 			&#160;&#160;&#160;&#160; { Title: "Test 1", Value: "1001", Selectable: true, Selected: true, Children: [] },
	/// 			&#160;&#160;&#160;&#160; { Title: "Test 2", Value: "1002", Selectable: false, Selected: false, Children: [] }
	/// 		]
	/// 		Only Value is required. Children is a collection of items with the same format as described above.
	/// 	</description>
	/// 	<param name="wsUrl" type="string" default="undefined"> If defined, updates WebService URL (e.g. http://server/ws/data.asxm/GetItems) </param>
	/// </function>
	this.Url = function(wsUrl)
	{
		Fit.Validation.ExpectString(wsUrl, true);

		if (Fit.Validation.IsSet(wsUrl) === true)
		{
			url = wsUrl;
		}

		return url;
	}

	/// <function container="Fit.Controls.WSContextMenu" name="JsonpCallback" access="public" returns="string">
	/// 	<description>
	/// 		Get/set name of JSONP callback argument. Assigning a value will enable JSONP communication.
	/// 		Often this argument is simply &quot;callback&quot;. Passing Null disables JSONP communication again.
	/// 	</description>
	/// 	<param name="val" type="string" default="undefined"> If defined, enables JSONP and updates JSONP callback argument </param>
	/// </function>
	this.JsonpCallback = function(val)
	{
		Fit.Validation.ExpectString(val, true);

		if (Fit.Validation.IsSet(val) === true || val === null)
		{
			jsonpCallback = val;
		}

		return jsonpCallback;
	}

	// ============================================
	// Events
	// ============================================

	/// <function container="Fit.Controls.WSContextMenu" name="OnRequest" access="public">
	/// 	<description>
	/// 		Add event handler fired when data is being requested.
	/// 		Request can be canceled by returning False.
	/// 		Function receives two arguments:
	/// 		Sender (Fit.Controls.WSContextMenu) and EventArgs object.
	/// 		EventArgs object contains the following properties:
	/// 		 - Sender: Fit.Controls.WSContextMenu instance
	/// 		 - Request: Fit.Http.JsonpRequest or Fit.Http.JsonRequest instance
	/// 	</description>
	/// 	<param name="cb" type="function"> Event handler function </param>
	/// </function>
	this.OnRequest = function(cb)
	{
		Fit.Validation.ExpectFunction(cb);
		Fit.Array.Add(onRequestHandlers, cb);
	}

	/// <function container="Fit.Controls.WSContextMenu" name="OnResponse" access="public">
	/// 	<description>
	/// 		Add event handler fired when data is received,
	/// 		allowing for data transformation to occure before
	/// 		ContextMenu is populated. Function receives two arguments:
	/// 		Sender (Fit.Controls.WSContextMenu) and EventArgs object.
	/// 		EventArgs object contains the following properties:
	/// 		 - Sender: Fit.Controls.WSContextMenu instance
	/// 		 - Request: Fit.Http.JsonpRequest or Fit.Http.JsonRequest instance
	/// 		 - Children: JSON items received from WebService
	/// 	</description>
	/// 	<param name="cb" type="function"> Event handler function </param>
	/// </function>
	this.OnResponse = function(cb)
	{
		Fit.Validation.ExpectFunction(cb);
		Fit.Array.Add(onResponseHandlers, cb);
	}

	/// <function container="Fit.Controls.WSContextMenu" name="OnPopulated" access="public">
	/// 	<description>
	/// 		Add event handler fired when ContextMenu has been populated with items.
	/// 		Function receives two arguments:
	/// 		Sender (Fit.Controls.WSContextMenu) and EventArgs object.
	/// 		EventArgs object contains the following properties:
	/// 		 - Sender: Fit.Controls.WSContextMenu instance
	/// 		 - Request: Fit.Http.JsonpRequest or Fit.Http.JsonRequest instance
	/// 		 - Children: JSON items received from WebService
	/// 	</description>
	/// 	<param name="cb" type="function"> Event handler function </param>
	/// </function>
	this.OnPopulated = function(cb)
	{
		Fit.Validation.ExpectFunction(cb);
		Fit.Array.Add(onPopulatedHandlers, cb);
	}

	// ============================================
	// Private
	// ============================================

	function getData(cb)
	{
		Fit.Validation.ExpectFunction(cb);

		if (url === null)
			Fit.Validation.ThrowError("Unable to get data, no WebService URL has been specified");

		// Determine request method

		var request = null;

		if (jsonpCallback !== null)
		{
			request = new Fit.Http.JsonpRequest(url, jsonpCallback);
		}
		/*else if (url.toLowerCase().indexOf(".asmx/") === -1)
		{
			request = new Fit.Http.Request(url);
		}*/
		else
		{
			request = new Fit.Http.JsonRequest(url)
		}

		// Fire OnRequest

		var eventArgs = { Sender: null, Request: null, Children: null };
		eventArgs.Sender = me;
		eventArgs.Request = request;

		if (fireEventHandlers(onRequestHandlers, eventArgs) === false)
			return;
		
		if (eventArgs.Request !== request)
		{
			// Support for changing request instans to
			// take control over webservice communication.

			// Restrict to support for Fit.Http.Request or classes derived from this
			Fit.Validation.ExpectInstance(eventArgs.Request, Fit.Http.Request);

			request = eventArgs.Request;
		}

		// Define request callbacks

		var onSuccess = function(children)
		{
			// Fire OnResponse

			eventArgs.Children = ((children instanceof Array) ? children : []);
			fireEventHandlers(onResponseHandlers, eventArgs);

			// Fire getData callback

			cb(eventArgs); // Callback is responsible for populating Context Menu

			// Fire OnPopulated

			fireEventHandlers(onPopulatedHandlers, eventArgs);
		};

		var onFailure = function(httpStatusCode)
		{
			Fit.Validation.ThrowError("Unable to load data for context menu - request failed with HTTP Status Code " + httpStatusCode)
		};

		// Register request callbacks

		if (Fit.Core.InstanceOf(request, Fit.Http.JsonpRequest) === false)
		{
			request.OnSuccess(function(req)
			{
				var children = request.GetResponseJson();
				onSuccess(children);
			});

			request.OnFailure(function(req)
			{
				onFailure(request.GetHttpStatus());
			});
		}
		else
		{
			request.OnSuccess(function(req)
			{
				var children = req.GetResponse();
				onSuccess(children);
			});

			request.OnTimeout(function()
			{
				onFailure("UNKNOWN (JSONP)");
			});
		}

		// Invoke request

		request.Start();
	}

	function onDataLoaded(cb)
	{
		Fit.Validation.ExpectFunction(cb);
		Fit.Array.Add(onDataLoadedCallback, cb);
	}

	function fireOnDataLoaded()
	{
		// Copied from WSTreeView.
		// Immediately clear collection. If multiple callbacks are registered,
		// chances are that only the first will run, and the remaining will be
		// re-scheduled again - so we need the collection to be cleared before
		// invoking callbacks.
		var orgOnDataLoadedCallback = onDataLoadedCallback;
		onDataLoadedCallback = [];

		Fit.Array.ForEach(orgOnDataLoadedCallback, function(cb)
		{
			cb();
		});
	}

	function createItemFromJson(jsonNode)
	{
		Fit.Validation.ExpectIsSet(jsonNode);

		// Convert JSON to ContextMenu item, including all contained children

		var item = new Fit.Controls.ContextMenuItem((jsonNode.Title ? jsonNode.Title : jsonNode.Value), jsonNode.Value);

		if (jsonNode.Selectable !== undefined)
			item.Selectable((jsonNode.Selectable === true));

		if (jsonNode.Children instanceof Array)
		{
			Fit.Array.ForEach(jsonNode.Children, function(c)
			{
				item.AddChild(createItemFromJson(c));
			});
		}

		return item;
	}

	function fireEventHandlers(handlers, eventArgs)
	{
		var cancel = false;

		Fit.Array.ForEach(handlers, function(cb)
		{
			if (cb(me, eventArgs) === false)
				cancel = true; // Do NOT cancel loop though! All handlers must be fired!
		});

		return !cancel;
	}

	init();
}

/// <container name="Fit.Controls.DatePicker" extends="Fit.Controls.ControlBase">
/// 	DatePicker control allowing user to easily pick a date and optionally time.
/// 	On mobile devices (phones and tablets) the native date and time pickers are used.
/// 	Extending from Fit.Controls.ControlBase.
/// </container>

/// <function container="Fit.Controls.DatePicker" name="DatePicker" access="public">
/// 	<description> Create instance of DatePicker control </description>
/// 	<param name="ctlId" type="string" default="undefined"> Unique control ID that can be used to access control using Fit.Controls.Find(..) </param>
/// </function>
Fit.Controls.DatePicker = function(ctlId)
{
	Fit.Validation.ExpectStringValue(ctlId, true);
	Fit.Core.Extend(this, Fit.Controls.ControlBase).Apply(ctlId);

	var me = this;
	var input = null;			// Input field for date
	var inputTime = null;		// Input field for time (Null if not enabled)
	var orgVal = null;			// Date object containing control value set using Value(..) or Date(..) - used to determine Dirty state (holds both date and time portion)
	var preVal = "";			// Previous valid date value as string (without time portion)
	var prevTimeVal = "";		// Previous valid time value as string (without date portion)
	var locale = "en";			// Default ("", "en", and "en-US" is the same) - see this.regional[""] decleration in jquery-ui.js
	var localeEnforced = false;	// Whether locale was set by external code which takes precedence over locale set using Fit.Internationalization.Locale(..)
	var format = "MM/DD/YYYY";	// Default format for "en" locale (specified using Fit.UI format - jQuery UI DataPicker uses "mm/dd/yy" - see this.regional[""] decleration in jquery-ui.js)
	var formatEnforced = false;	// Whether format was set by external code which takes precedence over locale set using DatePicker.Locale(..) and Fit.Internationalization.Locale(..)
	var placeholderDate = null;	// Placeholder value for date
	var placeholderTime = null;	// Placeholder value for time
	var weeks = false;			// Whether to display week numbers or not
	var jquery = undefined;		// jQuery instance
	var datepicker = null;		// jQuery UI calendar widget
	var startDate = null;		// Which year/month to display in calendar widget if view needs to be restored (related to restoreView variable)
	var open = false;			// Whether calendar widget is currently open
	var focused = false;		// Whether control is currently focused
	var restoreView = false;	// Whether to keep calendar widget on given year/month when temporarily closing and opening it again
	var updateCalConf = true;	// Whether to set/update calendar widget settings - true on initial load

	var isMobile = Fit.Browser.GetInfo().IsMobile;
	var inputMobile = null;		// Native date picker on mobile devices - value selected is synchronized to input field defined above (remains Null on desktop devices)
	var inputTimeMobile = null;	// Native time picker on mobile devices - value selected is synchronized to inputTime field defined above (remains Null on desktop devices)

	// ============================================
	// Init
	// ============================================

	function init()
	{
		input = document.createElement("input");
		input.type = "text";
		input.autocomplete = "off";
		input.spellcheck = false;
		input.placeholder = getDatePlaceholder();
		input.tabIndex = ((isMobile === true) ? -1 : 0);

		input.onkeydown = function(e)
		{
			// Open calendar when arrow down key is pressed

			var ev = Fit.Events.GetEvent(e);

			if (ev.keyCode === 40) // Arrow down
			{
				me.Show();
			}
		}

		input.onkeyup = function()
		{
			// Fire OnChange when a valid value is entered

			var curDateTime = me.Date();

			if (input.value !== "" && curDateTime === null)
				return; // Invalid value

			var curDateStr = ((curDateTime !== null) ? Fit.Date.Format(curDateTime, me.Format()) : ""); // Not using Value() which includes time if enabled

			if (curDateStr !== preVal)
			{
				if (input.value === "" && open === true) // Value cleared while calendar widget is open
				{
					// Fix: DatePicker keeps selection when value is
					// cleared - hide and show again to update picker
					restoreView = true;
					me.Hide();
					me.Show();
					restoreView = false;
				}

				preVal = curDateStr;
				me._internal.FireOnChange();
			}
		}

		input.onchange = function() // OnKeyUp does not catch changes made using mouse (e.g. cut)
		{
			if (me === null)
			{
				// Fix for Chrome which fires OnChange and OnBlur (in both capturering and bubbling phase)
				// if control has focus while being removed from DOM, e.g. if used in a dialog closed using ESC.
				// More details here: https://bugs.chromium.org/p/chromium/issues/detail?id=866242
				return;
			}

			input.onkeyup();
		}

		input.onpaste = function()
		{
			setTimeout(function() // Postpone - OnPaste fires before pasted value is set
			{
				input.onkeyup();

				// The calendar widget is not updated when pasting a value
				// using the context menu. CTRL/CMD + V updates it just fine though.
				// Force it to always update when pasting a value.
				if (open === true)
				{
					me.Hide();
					me.Show();
				}

				startDate = null;
			}, 0);
		}

		input.onclick = function()
		{
			me.Show();
		}

		// Prevent OnFocus from firing when user interacts with calendar widget which
		// is not contained in div.FitUiControlDatePicker (changing month/year and selecting date).
		// Focus is returned to input almost immediately after interacting with calendar widget.
		me._internal.FireOnFocus = Fit.Core.CreateOverride(me._internal.FireOnFocus, function()
		{
			if (focused === false)
			{
				focused = true;
				base();
			}
		});

		// Prevent OnBlur from firing when user interacts with calendar widget which
		// is not contained in div.FitUiControlDatePicker (changing month/year).
		// Focus is returned to input almost immediately after interacting with calendar widget.
		me._internal.FireOnBlur = Fit.Core.CreateOverride(me._internal.FireOnBlur, function()
		{
			if (open === false)
			{
				focused = false;
				base();
			}
		});

		input.onblur = function()
		{
			if (me === null)
			{
				// Fix for Chrome which fires OnChange and OnBlur (in both capturering and bubbling phase)
				// if control has focus while being removed from DOM, e.g. if used in a dialog closed using ESC.
				// More details here: https://bugs.chromium.org/p/chromium/issues/detail?id=866242
				return;
			}

			// Make sure date entered is properly formatted (e.g. 1-1-2012 transforms to 01-01-2012)

			if (open === true)
				return; // Do not execute code below when input looses focus when user interacts with calendar widget

			// The input.onchange/onpaste/onkeyup events constantly updates preVal,
			// so it always contains the last valid (and properly formatted) value.

			// Notice that the calendar widget is temporarily closed when clearing the
			// control value using e.g. CTRL+X or CMD+X. This causes OnBlur to fire and
			// reach the code below BEFORE preVal is updated, because this value is not
			// updated until Key UP. This results in the previous value being restored
			// every time the user tries to clear the input field. The fix is a simple
			// as making sure preVal is only used when the input field actually contains
			// a value.

			if (input.value !== "")
				input.value = preVal;
		}

		me.OnBlur(function(sender)
		{
			if (input.value === "" && inputTime !== null)
			{
				inputTime.value = "";
				prevTimeVal = "00:00";
			}

			if (input.value !== "" && inputTime !== null && inputTime.value === "")
			{
				inputTime.value = "00:00";
				prevTimeVal = "00:00";
			}
		});

		me._internal.AddDomElement(input);
		me.AddCssClass("FitUiControlDatePicker");

		me._internal.Data("weeks", "false");
		me._internal.Data("time", "false");

		if (isMobile === true)
		{
			inputMobile = document.createElement("input");
			inputMobile.type = "date";
			inputMobile.onchange = function()
			{
				if (inputMobile.valueAsDate !== null)
					input.value = Fit.Date.Format(inputMobile.valueAsDate, me.Format());
				else
					input.value = "";

				input.onchange();
			}
			me._internal.AddDomElement(inputMobile);
		}

		Fit.Internationalization.OnLocaleChanged(localize);
		localize();
	}

	// ============================================
	// Public - overrides
	// ============================================

	// See documentation on ControlBase
	this.Focused = function(focus)
	{
		Fit.Validation.ExpectBoolean(focus, true);

		if (Fit.Validation.IsSet(focus) === true)
		{
			var inp = ((inputMobile === null) ? input : inputMobile);

			if (focus === true)
			{
				inp.focus();
			}
			else
			{
				inp.blur();

				if (isMobile === false) // Prevent infinite loop - Hide() calls Focused(false) on mobile
					me.Hide();
			}
		}

		return focused;
	}

	// See documentation on ControlBase
	this.Value = function(val) // ONLY accepts YYYY-MM-DD[ hh:mm]
	{
		Fit.Validation.ExpectString(val, true);

		if (Fit.Validation.IsSet(val) === true)
		{
			var fireOnChange = (me.Value() !== val);
			var wasOpen = open;

			if (wasOpen === true)
			{
				restoreView = true;
				me.Hide();
			}

			if (val !== "")
			{
				if (val.indexOf(":") === -1)
					val += " 00:00";

				var date = Fit.Date.Parse(val, "YYYY-MM-DD hh:mm");
				date.setSeconds(0);
				date.setMilliseconds(0);

				input.value = Fit.Date.Format(date, me.Format());
				preVal = input.value;

				orgVal = date;

				if (inputTime !== null)
				{
					inputTime.value = Fit.Date.Format(date, "hh:mm");
					prevTimeVal = inputTime.value;
				}

				if (inputMobile !== null)
					inputMobile.valueAsDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));

				if (inputTimeMobile !== null)
					inputTimeMobile.value = inputTime.value;
			}
			else
			{
				input.value = "";
				preVal = "";

				orgVal = null;

				if (inputTime !== null)
				{
					inputTime.value = "";
					prevTimeVal = "00:00";
				}

				if (inputMobile !== null)
					inputMobile.valueAsDate = null;

				if (inputTimeMobile !== null)
					inputTimeMobile.value = "";
			}

			if (wasOpen === true)
			{
				me.Show();
				restoreView = false;
			}

			if (fireOnChange === true)
				me._internal.FireOnChange();
		}

		if (input.value === "")
			return "";

		try
		{
			var value = input.value + ((inputTime !== null) ? " " + ((inputTime.value !== "") ? inputTime.value : "00:00") : "");
			var dtFormat = me.Format() + ((value.indexOf(":") > -1) ? " hh:mm" : "");

			var d = Fit.Date.Parse(value, dtFormat); // May throw exception if value is invalid - this may happen if user is currently entering an invalid value while Value() is being called at the same time async.
			return Fit.Date.Format(d, "YYYY-MM-DD" + ((value.indexOf(":") > -1) ? " hh:mm" : ""));
		}
		catch (err)
		{
		}

		return "";
	}

	// See documentation on ControlBase
	this.IsDirty = function()
	{
		if (inputTime !== null)
		{
			return (Fit.Core.IsEqual(orgVal, me.Date()) === false);
		}
		else
		{
			var curDate = me.Date();

			if ((orgVal === null && curDate !== null) || (orgVal !== null && curDate === null))
				return true;
			else if (orgVal === null && curDate === null)
				return false;
			else
				return (Fit.Date.Format(orgVal, "YYYY-MM-DD") !== Fit.Date.Format(me.Date(), "YYYY-MM-DD"));
		}
	}

	// See documentation on ControlBase
	this.Clear = function()
	{
		me.Value("");
	}

	// See documentation on ControlBase
	this.Dispose = Fit.Core.CreateOverride(this.Dispose, function()
	{
		// This will destroy control - it will no longer work!

		if (datepicker !== null)
		{
			me.Hide();
			datepicker.datepicker("destroy");
		}

		Fit.Internationalization.RemoveOnLocaleChanged(localize);

		me = input = inputTime = orgVal = preVal = prevTimeVal = locale = localeEnforced = format = formatEnforced = weeks = jquery = datepicker = startDate = open = focused = restoreView = isMobile = inputMobile = inputTimeMobile = null;
		base();
	});

	// ============================================
	// Public
	// ============================================

	/// <function container="Fit.Controls.DatePicker" name="Date" access="public" returns="Date">
	/// 	<description>
	/// 		Get/set control value.
	/// 		The function works the same as the Value function, expect it
	/// 		accepts and returns a Date object instead of a string.
	/// 	</description>
	/// 	<param name="val" type="Date" default="undefined"> If defined, date is selected </param>
	/// </function>
	this.Date = function(val)
	{
		Fit.Validation.ExpectDate(val, true);

		// Set value if supplied

		if (val !== undefined) // Allow Null
		{
			if (val !== null)
				me.Value(val.getFullYear() + "-" + (val.getMonth() + 1) + "-" + val.getDate() + " " + val.getHours() + ":" + val.getMinutes());
			else
				me.Clear();
		}

		// Get current value

		var value = me.Value();
		var date = null;

		if (value !== "")
		{
			try
			{
				date = Fit.Date.Parse(value, "YYYY-MM-DD" + ((inputTime !== null) ? " hh:mm" : ""));
			}
			catch (err)
			{
			}
		}

		if (date !== null)
		{
			if (inputTime === null)
			{
				date.setHours(0);
				date.setMinutes(0);
			}

			date.setSeconds(0);
			date.setMilliseconds(0);
		}

		return date;
	}

	/// <function container="Fit.Controls.DatePicker" name="GetText" access="public" returns="string">
	/// 	<description>
	/// 		Get control value as a string. Opposite to the Value function GetText returns the
	/// 		selected Date/DateTime in the format configured (see Format function). The Value
	/// 		function always returns the value in a fixed format, which is YYYY-MM-DD[ hh:mm].
	/// 		The time portion is only appended if time is enabled (see Time function).
	/// 	</description>
	/// </function>
	this.GetText = function()
	{
		var date = me.Date();
		return ((date !== null) ? Fit.Date.Format(date, me.Format() + ((inputTime !== null) ? " hh:mm" : "")) : "");
	}

	/// <function container="Fit.Controls.DatePicker" name="Locale" access="public" returns="string">
	/// 	<description>
	/// 		Get/set locale used by the DatePicker control. This will affect the
	/// 		date format, unless format has been set explicitely, as well as the language used by the calendar widget.
	/// 		DatePicker locale takes precedence over locale set using Fit.Internationalization.Locale(..).
	/// 		Call the GetLocales function to get a complete list of supported locales.
	/// 	</description>
	/// 	<param name="val" type="string" default="undefined"> If defined, locale is changed </param>
	/// </function>
	this.Locale = function(val)
	{
		Fit.Validation.ExpectString(val, true);

		if (Fit.Validation.IsSet(val) === true)
		{
			localeEnforced = true;
			setLocale(val);
		}

		return locale;
	}

	/// <function container="Fit.Controls.DatePicker" name="Format" access="public" returns="string">
	/// 	<description>
	/// 		Get/set format used by the DatePicker control. This will affect the format
	/// 		in which the date is presented, as well as the value returned by the GetText function.
	/// 		Format takes precedence over locale.
	/// 	</description>
	/// 	<param name="val" type="string" default="undefined">
	/// 		If defined, format is changed.
	///			The following tokens can be used to construct the format:
	///			YYYY = Year with four digits (e.g. 2016)
	///			M = Month with one digit if possible (e.g. 1 or 12)
	///			MM = Month with two digits (e.g. 01 or 12)
	///			D = Day with one digit if possible (e.g. 1 or 24)
	///			DD = Day with two digits (e.g. 01 or 24)
	/// 		Examples: YYYY-MM-DD or D/M-YYYY
	/// 	</param>
	/// </function>
	this.Format = function(val)
	{
		Fit.Validation.ExpectString(val, true);

		if (Fit.Validation.IsSet(val) === true)
		{
			formatEnforced = true;
			setFormat(val);
		}

		return format;
	}

	/// <function container="Fit.Controls.DatePicker" name="DatePlaceholder" access="public" returns="string">
	/// 	<description> Get/set date placeholder value. Returns Null if not set. </description>
	/// 	<param name="val" type="string" default="undefined">
	/// 		If defined, placeholder is updated. Pass Null to use default
	/// 		placeholder, or an empty string to remove placeholder.
	/// 	</param>
	/// </function>
	this.DatePlaceholder = function(val)
	{
		Fit.Validation.ExpectString(val, true);

		if (val !== undefined) // Allow Null
		{
			placeholderDate = val;
			input.placeholder = getDatePlaceholder();
		}

		return placeholderDate;
	}

	/// <function container="Fit.Controls.DatePicker" name="TimePlaceholder" access="public" returns="string">
	/// 	<description> Get/set time placeholder value. Returns Null if not set. </description>
	/// 	<param name="val" type="string" default="undefined">
	/// 		If defined, placeholder is updated. Pass Null to use default
	/// 		placeholder, or an empty string to remove placeholder.
	/// 	</param>
	/// </function>
	this.TimePlaceholder = function(val)
	{
		Fit.Validation.ExpectString(val, true);

		if (val !== undefined) // Allow Null
		{
			placeholderTime = val;

			if (inputTime !== null)
				inputTime.placeholder = getTimePlaceholder();
		}

		return placeholderTime;
	}

	this.WeekNumbers = function(val) // Not supported on mobile, and jQuery calendar is buggy: https://bugs.jqueryui.com/ticket/14907
	{
		Fit.Validation.ExpectBoolean(val, true);

		if (Fit.Validation.IsSet(val) === true)
		{
			var wasOpen = open;

			if (wasOpen === true)
			{
				restoreView = true;
				me.Hide();
			}

			weeks = val;
			updateCalConf = true; // Update calendar widget settings

			if (wasOpen === true)
			{
				me.Show();
				restoreView = false;
			}

			me._internal.Data("weeks", val.toString());
		}

		return weeks;
	}

	/// <function container="Fit.Controls.DatePicker" name="Time" access="public" returns="boolean">
	/// 	<description>
	/// 		Get/set value indicating whether DatePicker should allow a time portion to be set.
	/// 	</description>
	/// 	<param name="val" type="boolean" default="undefined"> If defined, time is changed </param>
	/// </function>
	this.Time = function(val)
	{
		Fit.Validation.ExpectBoolean(val, true);

		if (Fit.Validation.IsSet(val) === true)
		{
			if (val === true && inputTime === null)
			{
				prevTimeVal = "00:00";

				inputTime = document.createElement("input");
				inputTime.type = "text";
				inputTime.autocomplete = "off";
				inputTime.spellcheck = false;
				inputTime.placeholder = getTimePlaceholder();
				inputTime.value = ((me.Date() !== null) ? "00:00" : "");
				inputTime.tabIndex = ((isMobile === true) ? -1 : 0);

				if (me.Date() !== null && orgVal !== null) // DatePicker has a date selected, and had a DateTime value assigned programmatically when created
				{
					inputTime.value = Fit.Date.Format(orgVal, "hh:mm");
					prevTimeVal = inputTime.value;
				}

				inputTime.onkeydown = function(e)
				{
					// Suppress invalid characters

					var ev = Fit.Events.GetEvent(e);
					var mod = Fit.Events.GetModifierKeys();

					// Allow Tab/Backspace/ArrowLeft/ArrowRightDelete/Ctrl/Cmd

					if (ev.keyCode === 9 || ev.keyCode === 8 || ev.keyCode === 37 || ev.keyCode === 39 || ev.keyCode === 46 || mod.Ctrl === true || mod.Meta === true)
						return;

					// Allow colon and 0-9

					var tv = inputTime.value;
					var isColon = (ev.keyCode === 186 || (mod.Shift === true && ev.keyCode === 190)); // Colon (keycode 186 or Shift+190 - depends on browser)
					var valid = (/*tv.length < 5 &&*/ (isColon === true || (ev.keyCode >= 48 && ev.keyCode <= 58) || (ev.keyCode >= 96 && ev.keyCode <= 105))); // Colon or 0-9 (numrow or numpad) - disabled check on length which prevents value from being overwritten when selected

					if (isColon === true && (tv.length === 0 || tv.substring(tv.length - 1) === ":"))
					{
						valid = false; // Skip colon if it is already present - DatePicker adds it automatically which many users overlook
					}

					if (valid === false)
					{
						Fit.Events.PreventDefault(ev);
						return;
					}
				}

				inputTime.onkeyup = function(e)
				{
					// Automatically add colon when hours have been entered

					if (e !== null) // Null when called from inputTime.onchange handler
					{
						var ev = Fit.Events.GetEvent(e);

						if (inputTime.value.length === 2 && inputTime.value.substring(1) !== ":" && ev.keyCode !== 8 && ev.keyCode !== 46) // KeyCodes: Backspace and Delete
						{
							inputTime.value += ":";
							return;
						}
					}

					// Update prevTimeVal which holds the last valid time value entered, and fire OnChange

					var dt = null;

					try
					{
						dt = Fit.Date.Parse(((inputTime.value !== "") ? inputTime.value : "00:00"), "hh:mm");
					}
					catch (err)
					{
					}

					if (dt === null) // Invalid value entered
						return;

					var newVal = Fit.Date.Format(dt, "hh:mm");

					if (newVal !== prevTimeVal)
					{
						prevTimeVal = newVal;

						if (input.value !== "")
							me._internal.FireOnChange();
					}
				}

				inputTime.onchange = function()
				{
					if (me === null)
					{
						// Fix for Chrome which fires OnChange and OnBlur (in both capturering and bubbling phase)
						// if control has focus while being removed from DOM, e.g. if used in a dialog closed using ESC.
						// More details here: https://bugs.chromium.org/p/chromium/issues/detail?id=866242
						return;
					}

					inputTime.onkeyup(null); // In case mouse was used to cut a value
				}

				inputTime.onpaste = function() // In case mouse was used to paste a value
				{
					setTimeout(function() // Postpone - OnPaste fires before pasted value is set
					{
						inputTime.onkeyup(null);
					}, 0);
				}

				inputTime.onblur = function()
				{
					if (me === null)
					{
						// Fix for Chrome which fires OnChange and OnBlur (in both capturering and bubbling phase)
						// if control has focus while being removed from DOM, e.g. if used in a dialog closed using ESC.
						// More details here: https://bugs.chromium.org/p/chromium/issues/detail?id=866242
						return;
					}

					if (inputTime.value === "")
					{
						inputTime.value = ((input.value !== "") ? "00:00" : "");
						prevTimeVal = "00:00";
					}
					else
					{
						// Use prevTimeVal which is properly formatted with leading zeros (see inputTime.onkeyup handler)
						inputTime.value = prevTimeVal;
					}
				}
				Fit.Dom.InsertAfter(input, inputTime);

				if (isMobile === true)
				{
					inputTimeMobile = document.createElement("input");
					inputTimeMobile.type = "time";
					inputTimeMobile.onchange = function()
					{
						if (inputTimeMobile.value === "" && inputMobile.value !== "")
							inputTimeMobile.value = "00:00";

						inputTime.value = inputTimeMobile.value; // Value is 24 hours hh:mm format (e.g. 22:43), even for devices with AM/PM picker
						inputTime.onchange();
					}
					me._internal.AddDomElement(inputTimeMobile);
				}

				me._internal.FireOnChange(); // Enabling Time causes Value() and Date() to return Date with timestamp - invoke event listeners
			}
			else if (val === false && inputTime !== null)
			{
				Fit.Dom.Remove(inputTime);

				if (isMobile === true)
				{
					Fit.Dom.Remove(inputTimeMobile);
				}

				inputTime = null;
				prevTimeVal = "";

				me._internal.FireOnChange(); // Disabling Time causes Value() and Date() to return Date without timestamp - invoke event listeners
			}

			me._internal.Data("time", (inputTime !== null).toString());
		}

		return (inputTime !== null);
	}

	/// <function container="Fit.Controls.DatePicker" name="Show" access="public">
	/// 	<description>
	/// 		Calling this function will open the calendar widget.
	/// 		Whether this results in picker being displayed on mobile depends on implementation.
	/// 		Often it will only work if Show() or Focused(true) is triggered by a user action such as a button click.
	/// 	</description>
	/// </function>
	this.Show = function()
	{
		if (isMobile === false)
		{
			initializeOnDemand(function()
			{
				var focused = Fit.Dom.GetFocused();

				datepicker.datepicker("show");

				if (focused === inputTime)
					inputTime.focus();
			});
		}
		else
		{
			me.Focused(false);
			me.Focused(true);
		}
	}

	/// <function container="Fit.Controls.DatePicker" name="Hide" access="public">
	/// 	<description>
	/// 		Calling this function will close the calendar widget.
	/// 		Whether this results in picker being hidden on mobile depends on implementation.
	/// 		Often it will only work if Hide() or Focused(false) is triggered by a user action such as a button click.
	/// 	</description>
	/// </function>
	this.Hide = function()
	{
		if (isMobile === false)
		{
			if (datepicker !== null)
				datepicker.datepicker("hide");
		}
		else
		{
			me.Focused(false);
		}
	}

	/// <function container="Fit.Controls.DatePicker" name="GetLocales" access="public" returns="string[]">
	/// 	<description> Returns a string array containing supported locales </description>
	/// </function>
	this.GetLocales = function()
	{
		var locales = []

		Fit.Array.ForEach(getLocales(), function(locale)
		{
			if (locale === "") // Skip "" which in jQuery UI DatePicker is equivalent to "en" and "en-US"
				return;

			Fit.Array.Add(locales, locale);
		});

		return locales;
	}

	// ============================================
	// Private
	// ============================================

	function initializeOnDemand(cb) // Callback is invoked once datepicker is loaded
	{
		Fit.Validation.ExpectFunction(cb);

		if (datepicker !== null)
		{
			cb();
			return;
		}

		// jQUery instance is shared between multiple instances of DatePicker.
		// Testing multiple instances loading simultaneously: http://fiddle.jshell.net/se7qt8fj/15/
		jquery = Fit._internal.Controls.DatePicker.jQuery;

		if (jquery === undefined)
		{
			// jQuery has not been loaded yet

			jquery = null;
			Fit._internal.Controls.DatePicker.jQuery = null;

			// jQuery UI CSS has been added to Fit.UI.css to make overriding easier.
			// To load the stylesheet dynamically, consider moving overrides from
			// Controls/DatePicker/DatePicker.css to the bottom of jquery-ui.css.
			// Fit.Loader.LoadStyleSheet(Fit.GetUrl() + "/Resources/JqueryUI-1.11.4.custom/jquery-ui.css");

			// Load files

			Fit.Loader.ExecuteScript(Fit.GetUrl() + "/Resources/JqueryUI-1.11.4.custom/external/jquery/jquery.js", function(src)
			{
				jquery = $;
				Fit._internal.Controls.DatePicker.jQuery = $; // jQuery instance is shared between multiple instances of DatePicker
				$.noConflict(true);

				Fit.Loader.ExecuteScript(Fit.GetUrl() + "/Resources/JqueryUI-1.11.4.custom/jquery-ui.js", function(src)
				{
					createDatePicker();
					cb();

				}, null, { jQuery: jquery, $: jquery }); // Make jQuery accessible to jquery-ui.js
			});
		}
		else if (jquery && jquery.datepicker)
		{
			// jQuery and UI has already been loaded

			createDatePicker();
			cb();
		}
	}

	function createDatePicker()
	{
		var jq = jquery;

		datepicker = jq(input).datepicker(
		{
			showOn: "none", // Prevents datepicker from showing when input gains focus
			showAnim: false,
			showWeek: weeks, // Buggy - does not work if week starts on sunday: https://bugs.jqueryui.com/ticket/14907
			//firstDay: 1,
			changeMonth: true,
			changeYear: true,
			dateFormat: getJqueryUiDatePickerFormat(me.Format()),
			defaultDate: null,
			onChangeMonthYear: function(year, month, dp) // Fires when changing year/month but also when simply opening calendar widget
			{
				if (open === true) // Remember which year and month the user navigated to
				{
					try
					{
						// Fit.Date.Parse will throw an exception if the year is below 1000
						startDate = Fit.Date.Parse(year + "-" + month + "-" + "01", "YYYY-MM-DD");
					}
					catch (err)
					{
					}
				}
			},
			onSelect: function(dateText, dp) // Notice: jQuery UI DatePicker no longer fires input.OnChange when OnSelect is registered
			{
				startDate = null;
				me.Focused(true);
				input.onchange();
			},
			beforeShow: function(elm, dp)
			{
				// Load locale if not already loaded

				if (datepicker.jq.datepicker.regional[locale] === null)
					return false; // Do not display - locale is currently loading (potentially started loading from another instance of DatePicker)

				if (datepicker.jq.datepicker.regional[locale] === undefined)
				{
					datepicker.jq.datepicker.regional[locale] = null; // Prevent multiple instances from loading the same locale

					Fit.Loader.ExecuteScript(Fit.GetUrl() + "/Resources/JqueryUI-1.11.4.custom/i18n/datepicker-" + locale + ".js", function(src)
					{
						if (datepicker.jq.datepicker.regional[locale])
						{
							me.Show(); // Causes beforeShow to be fired again
						}

					}, null, { jQuery: datepicker.jq, $: datepicker.jq } // Make jQuery accessible to datepicker-xx.js
					);

					return false; // Do not display - wait for locale to load
				}

				// Update settings in case they were changed

				var val = me.Value();

				if (updateCalConf === true) // Only update settings if actually changed, as this results in input value being updated, causing cursor position to change in IE
				{
					updateCalConf = false;

					datepicker.datepicker("option", datepicker.jq.datepicker.regional[locale]);
					datepicker.datepicker("option", "dateFormat", getJqueryUiDatePickerFormat(me.Format()));
					datepicker.datepicker("option", "showWeek", weeks);
				}

				if (startDate !== null && restoreView === true) // Restore year and month the user previously navigated to
				{
					setTimeout(function()
					{
						var year = Fit.Date.Format(startDate, "YYYY");
						var month = Fit.Date.Format(startDate, "M");

						var yearPicker = document.querySelector("select.fitui-datepicker-year");
						yearPicker.value = year;
						datepicker.jq(yearPicker).trigger("change");

						var monthPicker = document.querySelector("select.fitui-datepicker-month");
						monthPicker.value = (parseInt(month) - 1).toString();
						datepicker.jq(monthPicker).trigger("change");
					}, 0);
				}

				open = true;

				if (val !== me.Value()) // Value cleared because locale loaded has a format different from the one previously loaded
				{
					me._internal.ExecuteWithNoOnChange(function()
					{
						me.Value(val);
					});
				}
			},
			onClose: function(dateText, dp)
			{
				open = false;

				// Make sure properly formatted value is used if user entered
				// the value manually and pressed ESC to close the calendar.
				// Calendar widget returns focus if closed using ESC key.
				input.onblur();
			}
		});

		datepicker.jq = jq;
	}

	function getJqueryUiDatePickerFormat()
	{
		return me.Format().replace(/D/g, "d").replace(/M/g, "m").replace(/YY/g, "y");
	}

	function getFitUiDateFormat(jqueryFormat) // jquery.datepicker.regional["da"].dateFormat
	{
		Fit.Validation.ExpectString(jqueryFormat);
		return jqueryFormat.replace(/d/g, "D").replace(/m/g, "M").replace(/y/g, "YY");
	}

	function getJqueryDateFormatFromLocale(lc)
	{
		Fit.Validation.ExpectString(lc);

		var locales = getLocales();

		if (locales[lc] !== undefined)
			return locales[lc];

		return null;
	}

	function getLocales()
	{
		// List of locales was generated this way:
		// 1) Make sure to prepare locales first like described in README-FitUiCustomJqueryUiBuild.txt
		// 2) Merge all i18n files using Bash:
		//    # cd Resources/JqueryUI-1.11.4.custom/i18n
		//    # echo "" > merged.js && for file in `ls datepicker-*js` ; do cat $file >> merged.js ; done
		// 3) Execute JS code in a page running Fit.UI:
		//    # var jq = Fit.GetUrl() + "/Resources/JqueryUI-1.11.4.custom/external/jquery/jquery.js";
		//    # var ui = Fit.GetUrl() + "/Resources/JqueryUI-1.11.4.custom/jquery-ui.js?FitJquery";
		//    # var ln = Fit.GetUrl() + "/Resources/JqueryUI-1.11.4.custom/i18n/merged.js?FitJquery";
		//    # Fit.Loader.LoadScripts([ { source: jq, loaded: function(src) { FitJquery = $; $.noConflict(true); } }, { source: ui }, { source: ln } ], function(cfgs)
		//    # {
		//    # 	var regional = FitJquery.datepicker.regional;
		//    # 	var res = {};
		//    # 	for (lang in regional)
		//    # 	{
		//    # 		if (regional[lang].dateFormat) // Make sure property is a language
		//    # 			res[lang] = regional[lang].dateFormat;
		//    # 	}
		//    #
		//    # 	console.log(JSON.stringify(res));
		//    # });
		// 4) Insert JSON written to console into variable below.

		return {"":"mm/dd/yy","en":"mm/dd/yy","en-US":"mm/dd/yy","da":"dd-mm-yy","af":"dd/mm/yy","ar-DZ":"dd/mm/yy","ar":"dd/mm/yy","az":"dd.mm.yy","be":"dd.mm.yy","bg":"dd.mm.yy","bs":"dd.mm.yy","ca":"dd/mm/yy","cs":"dd.mm.yy","cy-GB":"dd/mm/yy","de":"dd.mm.yy","el":"dd/mm/yy","en-AU":"dd/mm/yy","en-GB":"dd/mm/yy","en-NZ":"dd/mm/yy","eo":"dd/mm/yy","es":"dd/mm/yy","et":"dd.mm.yy","eu":"yy-mm-dd","fa":"yy/mm/dd","fi":"d.m.yy","fo":"dd-mm-yy","fr-CA":"yy-mm-dd","fr-CH":"dd.mm.yy","fr":"dd/mm/yy","gl":"dd/mm/yy","he":"dd/mm/yy","hi":"dd/mm/yy","hr":"dd.mm.yy.","hu":"yy.mm.dd.","hy":"dd.mm.yy","id":"dd/mm/yy","is":"dd.mm.yy","it-CH":"dd.mm.yy","it":"dd/mm/yy","ja":"yy/mm/dd","ka":"dd-mm-yy","kk":"dd.mm.yy","km":"dd-mm-yy","ko":"yy. m. d.","ky":"dd.mm.yy","lb":"dd.mm.yy","lt":"yy-mm-dd","lv":"dd.mm.yy","mk":"dd.mm.yy","ml":"dd/mm/yy","ms":"dd/mm/yy","nb":"dd.mm.yy","nl-BE":"dd/mm/yy","nl":"dd-mm-yy","nn":"dd.mm.yy","no":"dd.mm.yy","pl":"dd.mm.yy","pt-BR":"dd/mm/yy","pt":"dd/mm/yy","rm":"dd/mm/yy","ro":"dd.mm.yy","ru":"dd.mm.yy","sk":"dd.mm.yy","sl":"dd.mm.yy","sq":"dd.mm.yy","sr":"dd.mm.yy","sr-SR":"dd.mm.yy","sv":"yy-mm-dd","ta":"dd/mm/yy","th":"dd/mm/yy","tj":"dd.mm.yy","tr":"dd.mm.yy","uk":"dd.mm.yy","vi":"dd/mm/yy","zh-CN":"yy-mm-dd","zh-HK":"dd-mm-yy","zh-TW":"yy/mm/dd"};
	}

	function getDatePlaceholder()
	{
		return (placeholderDate !== null ? placeholderDate : Fit.Date.Format(new Date(), format));
	}

	function getTimePlaceholder()
	{
		return (placeholderTime !== null ? placeholderTime : Fit.Date.Format(new Date(), "hh:mm"));
	}

	function setLocale(val)
	{
		Fit.Validation.ExpectString(val);

		var newFormat = getJqueryDateFormatFromLocale(val); // Null if locale does not exist

		if (newFormat === null)
			Fit.Validation.ThrowError("Unknown locale '" + val + "'");

		var wasOpen = open;

		if (wasOpen === true)
		{
			restoreView = true;
			me.Hide();
		}

		locale = val;
		updateCalConf = true; // Update calendar widget settings

		if (formatEnforced === false)
		{
			setFormat(getFitUiDateFormat(newFormat));
		}

		if (wasOpen === true)
		{
			me.Show();
			restoreView = false;
		}
	}

	function setFormat(val)
	{
		Fit.Validation.ExpectString(val);

		// Validate format

		try
		{
			// Notice: Fit.Date.Parse(..) produces a DateTime object that contains
			// current Hours:Minutes:Seconds unless explicitly set, so we need to set
			// those to prevent 'date' and 'parsed' variables from differing one second.

			var date = Fit.Date.Parse("2016-06-24 00:00:00", "YYYY-MM-DD hh:mm:ss");
			var dateStr = Fit.Date.Format(date, val + " hh:mm:ss");
			var parsed = Fit.Date.Parse(dateStr, val + " hh:mm:ss");

			if (date.getTime() !== parsed.getTime())
				throw "Invalid"; // Catched below and re-thrown
		}
		catch (err)
		{
			Fit.Validation.ThrowError("Invalid date format '" + val + "'");
		}

		// Set format

		var wasOpen = open;

		if (wasOpen === true)
		{
			restoreView = true;
			me.Hide();
		}

		var curDate = me.Date(); // The format is used by Value(), which is called by Date(), to parse the date entered - get DateTime value before changing format

		format = val;
		updateCalConf = true; // Update calendar widget settings
		input.placeholder = getDatePlaceholder();

		// Update input with new format
		me._internal.ExecuteWithNoOnChange(function()
		{
			if (curDate !== null)
			{
				// Update input directly rather than using Value(..) since the input field still contains
				// the old value which is formatted using the old format. This will cause a call to Value(..)
				// to fail since it cannot parse the old string value using the new format applied.
				// Notice that we only change the format of the DateTime value - not the actual date or time.
				// Therefore, there is no need to update curVal.

				input.value = Fit.Date.Format(curDate, format);
				preVal = input.value;
			}
		});

		if (wasOpen === true)
		{
			me.Show();
			restoreView = false;
		}
	}

	function localize()
	{
		if (localeEnforced === true)
			return;

		var newLocale = Fit.Internationalization.Locale();
		var key = null;

		// Transform Fit.UI's locale format (e.g. en or en_gb) to jQuery's locale format (e.g. en or en-GB)

		if (newLocale.indexOf("_") !== -1) // E.g. de_AT
		{
			var info = newLocale.split("_");
			key = info[0].toLowerCase() + "-" + info[1].toUpperCase();
		}
		else // e.g. de
		{
			key = newLocale.toLowerCase();
		}

		// Update locale

		// Make sure locale exists - otherwise setLocale throws an error
		if (Fit.Array.Contains(Fit.Array.GetKeys(getLocales()), key) === true)
		{
			setLocale(key);
		}
	}

	init();
}

Fit._internal.Controls.DatePicker = {};

/// <container name="Fit.Controls.Dialog" extends="Fit.Controls.Component">
/// 	Simple Dialog control with support for Fit.UI buttons.
/// </container>

/// <function container="Fit.Controls.Dialog" name="Dialog" access="public">
/// 	<description> Create instance of Dialog control </description>
/// 	<param name="controlId" type="string" default="undefined"> Unique control ID that can be used to access control using Fit.Controls.Find(..) </param>
/// </function>
Fit.Controls.Dialog = function(controlId)
{
	Fit.Validation.ExpectStringValue(controlId, true);
	Fit.Core.Extend(this, Fit.Controls.Component).Apply(controlId);

	var me = this;
	var dialog = me.GetDomElement();
	var focusTrapStart = null;
	var focusTrapEnd = null;
	var title = null;
	var titleButtons = null;
	var cmdMaximize = null;
	var cmdDismiss = null;
	var content = null;
	var iframe = null;
	var buttons = null;
	var modal = false;
	var layer = null;

	var width = null;
	var minWidth = null;
	var maxWidth = null;

	var height = null;
	var minHeight = null;
	var maxHeight = null;
	var mutationObserverId = -1;
	var resizeHandlerId = -1;

	var onDismissHandlers = [];
	var onCloseHandlers = [];
	var isClosing = false;

	// ============================================
	// Init
	// ============================================

	function init()
	{
		Fit.Dom.AddClass(dialog, "FitUiControl");
		Fit.Dom.AddClass(dialog, "FitUiControlDialog");
		Fit.Dom.Data(dialog, "framed", "false");
		Fit.Dom.Data(dialog, "maximized", "false");

		focusTrapStart = document.createElement("div");
		focusTrapStart.tabIndex = 0;
		Fit.Dom.Add(dialog, focusTrapStart);

		focusTrapEnd = document.createElement("div");
		focusTrapEnd.tabIndex = 0;
		Fit.Dom.Add(dialog, focusTrapEnd);

		content = createContentElement();
		Fit.Dom.InsertAfter(focusTrapStart, content);

		layer = document.createElement("div");
		Fit.Dom.AddClass(layer, "FitUiControlDialogModalLayer");

		// Focus first button when clicking dialog or modal layer

		Fit.Events.AddHandler(dialog, "click", function(e)
		{
			if (me === null)
				return; // Dialog was disposed when a button was clicked

			// Do not focus first button when a (any) button within the button area was clicked.
			// Button clicked might have been e.g. second button, which perhaps caused dialog to remain open,
			// in which case we should not change focus. The button clicked could also have changed focus in
			// which case we should not intervene. In case button did not change focus, it will remain focused
			// of course since it was clicked.
			if (buttons !== null && Fit.Dom.Contained(buttons, Fit.Events.GetTarget(e)))
				return;

			if (buttons !== null && (Fit.Dom.GetFocused() === null || Fit.Dom.Contained(dialog, Fit.Dom.GetFocused()) === false))
				buttons.children[0].focus();
		});

		Fit.Events.AddHandler(layer, "click", function(e)
		{
			if (buttons !== null && (Fit.Dom.GetFocused() === null || Fit.Dom.Contained(dialog, Fit.Dom.GetFocused()) === false))
				buttons.children[0].focus();
		});

		// Keep tab navigation within modal dialog

		Fit.Events.AddHandler(dialog, "keydown", function(e)
		{
			var ev = Fit.Events.GetEvent(e);

			if (modal === true && ev.keyCode === 9) // Tab key
			{
				if (ev.shiftKey === true && Fit.Events.GetTarget(ev) === focusTrapStart) // Tabbing backwards
				{
					Fit.Events.PreventDefault(ev);
				}
				else if (ev.shiftKey === false && Fit.Events.GetTarget(ev) === focusTrapEnd) // Tabbing forward
				{
					Fit.Events.PreventDefault(ev);
				}
			}
		});
	}

	// ============================================
	// Public
	// ============================================

	/// <function container="Fit.Controls.Dialog" name="Title" access="public" returns="string">
	/// 	<description> Get/set title - returns null if not set, and null can be passed to remove title </description>
	/// 	<param name="val" type="string" default="undefined"> If specified, dialog title is updated with specified value </param>
	/// </function>
	this.Title = function(val)
	{
		Fit.Validation.ExpectString(val, true);

		if (val !== undefined) // Allow null to remove title
		{
			if (val === null && title !== null)
			{
				if (titleButtons !== null)
				{
					Fit.Dom.Text(title, "");
					Fit.Dom.Add(title, titleButtons);
				}
				else
				{
					Fit.Dom.Remove(title);
					title = null;

					setContentHeight();
					updatePosition();
				}
			}
			else
			{
				if (title === null)
				{
					title = document.createElement("div");
					Fit.Dom.AddClass(title, "FitUiControlDialogTitle");
					Fit.Dom.InsertAfter(focusTrapStart, title);
				}

				Fit.Dom.Text(title, val);

				if (titleButtons !== null)
				{
					Fit.Dom.Add(title, titleButtons);
				}

				setContentHeight();
				updatePosition();
			}
		}

		return (title !== null ? Fit.Dom.Text(title) : null);
	}

	/// <function container="Fit.Controls.Dialog" name="Width" access="public" returns="object">
	/// 	<description> Get/set dialog width - returns object with Value and Unit properties </description>
	/// 	<param name="val" type="number" default="undefined"> If defined, dialog width is updated to specified value. A value of -1 resets width (auto sizing). </param>
	/// 	<param name="unit" type="string" default="px"> If defined, dialog width is updated to specified CSS unit </param>
	/// </function>
	this.Width = function(val, unit)
	{
		Fit.Validation.ExpectNumber(val, true);
		Fit.Validation.ExpectStringValue(unit, true);

		var defaultValue = { Value: -1, Unit: "px" };

		if (Fit.Validation.IsSet(val) === true)
		{
			if (val > -1)
			{
				width = { Value: val, Unit: ((Fit.Validation.IsSet(unit) === true) ? unit : "px") };
				dialog.style.width = width.Value + width.Unit;

				if (minWidth === null)
				{
					dialog.style.minWidth = "0";
				}

				if (maxWidth === null)
				{
					dialog.style.maxWidth = "none";
				}
			}
			else
			{
				width = null;
				dialog.style.width = "";

				if (minWidth === null)
				{
					dialog.style.minWidth = "";
				}

				if (maxWidth === null)
				{
					dialog.style.maxWidth = "";
				}
			}

			updatePosition();
		}

		return (width !== null ? width : defaultValue);
	}

	/// <function container="Fit.Controls.Dialog" name="MinimumWidth" access="public" returns="object">
	/// 	<description> Get/set dialog minimum width - returns object with Value and Unit properties </description>
	/// 	<param name="val" type="number" default="undefined"> If defined, dialog minimum width is updated to specified value. A value of -1 resets minimum width. </param>
	/// 	<param name="unit" type="string" default="px"> If defined, dialog minimum width is updated to specified CSS unit </param>
	/// </function>
	this.MinimumWidth = function(val, unit)
	{
		Fit.Validation.ExpectNumber(val, true);
		Fit.Validation.ExpectStringValue(unit, true);

		// defaultValue must match min-width in Dialog.css
		var defaultValue = { Value: 280, Unit: "px" };

		if (Fit.Validation.IsSet(val) === true)
		{
			if (val > -1)
			{
				minWidth = { Value: val, Unit: ((Fit.Validation.IsSet(unit) === true) ? unit : "px") };
				dialog.style.minWidth = minWidth.Value + minWidth.Unit;
			}
			else
			{
				minWidth = null;
				dialog.style.minWidth = (width !== null ? "0" : ""); // Apply "0" (no min-width) if width is set
			}

			updatePosition();
		}

		return (minWidth !== null ? minWidth : (width !== null ? width : defaultValue));
	}

	/// <function container="Fit.Controls.Dialog" name="MaximumWidth" access="public" returns="object">
	/// 	<description> Get/set dialog maximum width - returns object with Value and Unit properties </description>
	/// 	<param name="val" type="number" default="undefined"> If defined, dialog maximum width is updated to specified value. A value of -1 resets maximum width. </param>
	/// 	<param name="unit" type="string" default="px"> If defined, dialog maximum width is updated to specified CSS unit </param>
	/// </function>
	this.MaximumWidth = function(val, unit)
	{
		Fit.Validation.ExpectNumber(val, true);
		Fit.Validation.ExpectStringValue(unit, true);

		// defaultValue must match max-width in Dialog.css
		var defaultValue = { Value: 800, Unit: "px" };

		if (Fit.Validation.IsSet(val) === true)
		{
			if (val > -1)
			{
				maxWidth = { Value: val, Unit: ((Fit.Validation.IsSet(unit) === true) ? unit : "px") };
				dialog.style.maxWidth = maxWidth.Value + maxWidth.Unit;
			}
			else
			{
				maxWidth = null;
				dialog.style.maxWidth = (width !== null ? "none" : ""); // Apply "none" (no max-width) if width is set
			}

			updatePosition();
		}

		return (maxWidth !== null ? maxWidth : (width !== null ? width : defaultValue));
	}

	/// <function container="Fit.Controls.Dialog" name="Height" access="public" returns="object">
	/// 	<description> Get/set dialog height - returns object with Value and Unit properties </description>
	/// 	<param name="val" type="number" default="undefined"> If defined, dialog height is updated to specified value. A value of -1 resets height to default. </param>
	/// 	<param name="unit" type="string" default="px"> If defined, dialog width is updated to specified CSS unit </param>
	/// </function>
	this.Height = function(val, unit)
	{
		Fit.Validation.ExpectNumber(val, true);
		Fit.Validation.ExpectStringValue(unit, true);

		// defaultValue must match height in Dialog.css
		var defaultValue = (iframe !== null ? { Value: 40, Unit: "%" } : { Value: -1, Unit: "px" });

		if (Fit.Validation.IsSet(val) === true)
		{
			if (val > -1)
			{
				height = { Value: val, Unit: ((Fit.Validation.IsSet(unit) === true) ? unit : "px") };
				dialog.style.height = height.Value + height.Unit;
			}
			else
			{
				height = null;
				dialog.style.height = "";
			}

			setContentHeight();
			updatePosition();
		}

		return (height !== null ? height : defaultValue);
	}

	/// <function container="Fit.Controls.Dialog" name="MinimumHeight" access="public" returns="object">
	/// 	<description> Get/set dialog minimum height - returns object with Value and Unit properties </description>
	/// 	<param name="val" type="number" default="undefined"> If defined, dialog minimum height is updated to specified value. A value of -1 resets minimum height. </param>
	/// 	<param name="unit" type="string" default="px"> If defined, dialog minimum height is updated to specified CSS unit </param>
	/// </function>
	this.MinimumHeight = function(val, unit)
	{
		Fit.Validation.ExpectNumber(val, true);
		Fit.Validation.ExpectStringValue(unit, true);

		// defaultValue must match min-height in Dialog.css (which is not defined)
		var defaultValue = { Value: -1, Unit: "px" };

		if (Fit.Validation.IsSet(val) === true)
		{
			if (val > -1)
			{
				minHeight = { Value: val, Unit: ((Fit.Validation.IsSet(unit) === true) ? unit : "px") };
				dialog.style.minHeight = minHeight.Value + minHeight.Unit;
			}
			else
			{
				minHeight = null;
				dialog.style.minHeight = "";
			}

			setContentHeight();
			updatePosition();
		}

		return (minHeight !== null ? minHeight : defaultValue);
	}

	/// <function container="Fit.Controls.Dialog" name="MaximumHeight" access="public" returns="object">
	/// 	<description> Get/set dialog maximum height - returns object with Value and Unit properties </description>
	/// 	<param name="val" type="number" default="undefined"> If defined, dialog maximum height is updated to specified value. A value of -1 resets maximum height. </param>
	/// 	<param name="unit" type="string" default="px"> If defined, dialog maximum height is updated to specified CSS unit </param>
	/// </function>
	this.MaximumHeight = function(val, unit)
	{
		Fit.Validation.ExpectNumber(val, true);
		Fit.Validation.ExpectStringValue(unit, true);

		// defaultValue must match max-height in Dialog.css (which is not defined)
		var defaultValue = { Value: -1, Unit: "px" };

		if (Fit.Validation.IsSet(val) === true)
		{
			if (val > -1)
			{
				maxHeight = { Value: val, Unit: ((Fit.Validation.IsSet(unit) === true) ? unit : "px") };
				dialog.style.maxHeight = maxHeight.Value + maxHeight.Unit;
			}
			else
			{
				maxHeight = null;
				dialog.style.maxHeight = "";
			}

			setContentHeight();
			updatePosition();
		}

		return (maxHeight !== null ? maxHeight : defaultValue);
	}

	/// <function container="Fit.Controls.Dialog" name="Modal" access="public" returns="boolean">
	/// 	<description> Get/set value indicating whether dialog is modal or not </description>
	/// 	<param name="val" type="boolean" default="undefined"> If specified, True enables modal mode, False disables it </param>
	/// </function>
	this.Modal = function(val)
	{
		Fit.Validation.ExpectBoolean(val, true);

		if (Fit.Validation.IsSet(val) === true)
		{
			if (val !== modal && me.IsOpen() === true)
			{
				if (val === true)
					Fit.Dom.InsertBefore(dialog, layer);
				else
					Fit.Dom.Remove(layer);
			}

			modal = val;
		}

		return modal;
	}

	/// <function container="Fit.Controls.Dialog" name="Content" access="public" returns="string">
	/// 	<description> Get/set dialog content </description>
	/// 	<param name="val" type="string" default="undefined"> If specified, dialog content is updated with specified value </param>
	/// </function>
	this.Content = function(val)
	{
		Fit.Validation.ExpectString(val, true);

		if (Fit.Validation.IsSet(val) === true)
		{
			content.innerHTML = val;

			if (iframe !== null)
			{
				Fit.Dom.Data(dialog, "framed", "false");
				iframe = null;
			}

			setContentHeight();
			updatePosition();
		}

		return content.innerHTML;
	}

	/// <function container="Fit.Controls.Dialog" name="GetContentDomElement" access="public" returns="DOMElement">
	/// 	<description> Get dialog content element </description>
	/// </function>
	this.GetContentDomElement = function()
	{
		return content;
	}

	/// <function container="Fit.Controls.Dialog" name="ContentUrl" access="public" returns="string">
	/// 	<description> Get/set content URL - returns null if not set </description>
	/// 	<param name="url" type="string" default="undefined"> If specified, dialog is updated with content from specified URL </param>
	/// 	<param name="onLoadHandler" type="function" default="undefined"> If specified, callback is invoked when content has been loaded </param>
	/// </function>
	this.ContentUrl = function(url, onLoadHandler)
	{
		Fit.Validation.ExpectString(url, true);
		Fit.Validation.ExpectFunction(onLoadHandler, true);

		if (Fit.Validation.IsSet(url) === true)
		{
			iframe = Fit.Dom.CreateElement("<iframe src='" + url + "' scrolling='yes' frameBorder='0' allowtransparency='true'></iframe>");

			if (Fit.Validation.IsSet(onLoadHandler) === true)
			{
				Fit.Events.AddHandler(iframe, "load", function(e)
				{
					onLoadHandler(me);
				});
			}

			content.innerHTML = "";
			Fit.Dom.Add(content, iframe);
			Fit.Dom.Data(dialog, "framed", "true");
		}

		return (iframe !== null ? iframe.src : null);
	}

	/// <function container="Fit.Controls.Dialog" name="Maximized" access="public" returns="boolean">
	/// 	<description> Get/set flag indicating whether dialog is maximized or not </description>
	/// 	<param name="val" type="boolean" default="undefined"> If defined, True maximizes dialog while False restores it </param>
	/// </function>
	this.Maximized = function(val)
	{
		Fit.Validation.ExpectBoolean(val, true);

		if (Fit.Validation.IsSet(val) === true)
		{
			Fit.Dom.Data(dialog, "maximized", (val === true ? "true" : "false"));

			if (cmdMaximize !== null)
			{
				if (Fit.Dom.Data(dialog, "maximized") === "true")
				{
					cmdMaximize.Icon("compress");
				}
				else
				{
					cmdMaximize.Icon("expand");
				}
			}

			me._internal.Repaint(function()
			{
				// Safari on iOS: Scroll does not work after resizing the
				// dialog. Temporarily hiding the iframe solves the problem.
				var b = Fit.Browser.GetInfo();
				if (iframe !== null && b.Name === "Safari" && b.IsMobile === true)
				{
					iframe.style.display = "none";
					setTimeout(function() { iframe.style.display = ""; }, 0);
				}
			});
		}

		return (Fit.Dom.Data(dialog, "maximized") === "true");
	}

	/// <function container="Fit.Controls.Dialog" name="Maximizable" access="public" returns="boolean">
	/// 	<description> Get/set flag indicating whether dialog is maximizable or not </description>
	/// 	<param name="val" type="boolean" default="undefined"> If defined, a value of True makes dialog maximizable by adding a maximize button while False disables it </param>
	/// </function>
	this.Maximizable = function(val)
	{
		Fit.Validation.ExpectBoolean(val, true);

		if (Fit.Validation.IsSet(val) === true)
		{
			if (val === true && cmdMaximize === null)
			{
				cmdMaximize = new Fit.Controls.Button();
				cmdMaximize.Icon((me.Maximized() === false ? "expand" : "compress"));
				cmdMaximize.OnClick(function(sender)
				{
					if (me.Maximized() === false)
					{
						me.Maximized(true); // Also updates button icon
					}
					else
					{
						me.Maximized(false); // Also updates button icon
					}
				});

				updateTitleButtons();
			}
			else if (val === false && cmdMaximize !== null)
			{
				cmdMaximize.Dispose();
				cmdMaximize = null;
				updateTitleButtons();
			}
		}

		return (cmdMaximize !== null);
	}

	/// <function container="Fit.Controls.Dialog" name="Dismissible" access="public" returns="boolean">
	/// 	<description> Get/set flag indicating whether dialog is dismissible or not </description>
	/// 	<param name="val" type="boolean" default="undefined"> If defined, a value of True makes dialog dismissible by adding a close button while False disables it </param>
	/// 	<param name="disposeOnDismiss" type="boolean" default="undefined"> If defined, a value of True results in dialog being disposed (destroyed) when closed using dismiss/close button </param>
	/// </function>
	this.Dismissible = function(val, disposeOnDismiss)
	{
		Fit.Validation.ExpectBoolean(val, true);
		Fit.Validation.ExpectBoolean(disposeOnDismiss, true);

		if (Fit.Validation.IsSet(val) === true)
		{
			if (val === true && cmdDismiss === null)
			{
				cmdDismiss = new Fit.Controls.Button();
				cmdDismiss.Icon("close");
				cmdDismiss.OnClick(function(sender)
				{
					var canceled = false;

					Fit.Array.ForEach(onDismissHandlers, function(cb)
					{
						if (cb(me) === false)
						{
							canceled = true;
							return false; // Break loop
						}
					});

					if (canceled === true)
					{
						return;
					}

					if (me !== null) // me is null if dialog was disposed from within OnDismiss handler
					{
						if (disposeOnDismiss === true)
						{
							me.Dispose();
						}
						else
						{
							me.Close();
						}
					}
				});

				updateTitleButtons();
			}
			else if (val === false && cmdDismiss !== null)
			{
				cmdDismiss.Dispose();
				cmdDismiss = null;
				updateTitleButtons();
			}
		}

		return (cmdDismiss !== null);
	}

	/// <function container="Fit.Controls.Dialog" name="AddButton" access="public">
	/// 	<description> Add button to dialog </description>
	/// 	<param name="btn" type="Fit.Controls.Button"> Instance of Fit.Controls.Button </param>
	/// </function>
	this.AddButton = function(btn)
	{
		Fit.Validation.ExpectInstance(btn, Fit.Controls.Button);

		if (buttons === null)
		{
			buttons = document.createElement("div");
			Fit.Dom.AddClass(buttons, "FitUiControlDialogButtons");
			Fit.Dom.InsertBefore(focusTrapEnd, buttons);
		}

		Fit.Dom.Add(buttons, btn.GetDomElement());

		setContentHeight();
		updatePosition();
	}

	/// <function container="Fit.Controls.Dialog" name="RemoveButton" access="public">
	/// 	<description> Remove button from dialog </description>
	/// 	<param name="btn" type="Fit.Controls.Button"> Instance of Fit.Controls.Button </param>
	/// 	<param name="dispose" type="boolean" default="undefined"> If defined, a value of True results in button being disposed (destroyed) </param>
	/// </function>
	this.RemoveButton = function(btn, dispose)
	{
		Fit.Validation.ExpectInstance(btn, Fit.Controls.Button);
		Fit.Validation.ExpectBoolean(dispose, true);

		if (buttons === null)
			return;

		Fit.Array.ForEach(buttons.children, function(elm)
		{
			if (elm === btn.GetDomElement())
			{
				if (dispose === true)
				{
					btn.Dispose();
				}
				else
				{
					Fit.Dom.Remove(btn.GetDomElement());
				}

				if (buttons.children.length === 0)
				{
					Fit.Dom.Remove(buttons);
					buttons = null;
				}

				setContentHeight();
				updatePosition();

				return false; // Break loop
			}
		});
	}

	/// <function container="Fit.Controls.Dialog" name="RemoveAllButtons" access="public">
	/// 	<description> Remove all buttons from dialog </description>
	/// 	<param name="dispose" type="boolean" default="undefined"> If defined, a value of True results in buttons being disposed (destroyed) </param>
	/// </function>
	this.RemoveAllButtons = function(dispose)
	{
		Fit.Validation.ExpectBoolean(dispose, true);

		if (buttons === null)
			return;

		Fit.Array.ForEach(Fit.Array.Copy(buttons.children), function(buttonElm) // Using Copy(..) since code modifies children collection
		{
			if (dispose === true)
			{
				buttonElm._internal.Instance.Dispose();
			}
			else
			{
				Fit.Dom.Remove(buttonElm);
			}
		});

		Fit.Dom.Remove(buttons);
		buttons = null;

		setContentHeight();
		updatePosition();
	}

	/// <function container="Fit.Controls.Dialog" name="IsOpen" access="public" returns="boolean">
	/// 	<description> Get flag indicating whether dialog is open or not </description>
	/// </function>
	this.IsOpen = function()
	{
		return Fit.Dom.IsRooted(dialog);
	}

	/// <function container="Fit.Controls.Dialog" name="Open" access="public">
	/// 	<description> Open dialog </description>
	/// 	<param name="renderTarget" type="DOMElement" default="undefined">
	/// 		Optional render target which can be used to render dialog to specific
	/// 		container rather than the root of the body element. This allows for
	/// 		the dialog to inherit styles from the specified render target.
	/// 	</param>
	/// </function>
	this.Open = function(renderTarget)
	{
		Fit.Validation.ExpectDomElement(renderTarget, true);

		if (me.IsOpen() === true)
			return;

		if (modal === true)
			Fit.Dom.Add(renderTarget || document.body, layer);

		Fit.Dom.Add(renderTarget || document.body, dialog);

		setContentHeight();
		updatePosition();

		// Make dimensions and position adjust to dynamic content (added/removed/manipulated through DOM or Fit.Template).
		// Notice that mutation observer will not be triggered if title is set or buttons have been added,
		// and content is being updated using DOM, e.g. through GetContentDomElement() or an instance of
		// Fit.Template rendered to the content DOM element.
		// The reason for this can be found in setContentHeight() where a fixed height is being calculated,
		// based on whether title and/or button(s) have been added, and assigned to the content element of the
		// dialog. Therefore, in this case, changing the content of the content element through DOM (or an
		// instance of Fit.Template) will not change the dimension of the content element, and therefore not
		// trigger the mutation observer.
		// The external code using the dialog must call a public function which in turn calls setContentHeight(),
		// to have the dialog resize to its newly updated content - e.g. close and re-open the dialog, or update
		// the title like dia.Title(dia.Title()).
		// Making the observer monitor the entire dialog's DOM using the 'deep' flag would solve this problem in
		// most causes, although not when dimensions change using styling (e.g. .style.height).
		// Also, it would be more expensive, and could trigger height calculation even when not necessary, e.g.
		// when changing a selection in a drop down control which changes the DOM.
		mutationObserverId = Fit.Events.AddMutationObserver(dialog, function(elm)
		{
			setContentHeight();
			updatePosition();
		});

		resizeHandlerId = Fit.Events.AddHandler(window, "resize", function(e)
		{
			setContentHeight();
			updatePosition();
		});
	}

	/// <function container="Fit.Controls.Dialog" name="Close" access="public">
	/// 	<description> Close dialog </description>
	/// </function>
	this.Close = function()
	{
		if (me.IsOpen() === false)
			return;

		if (isClosing === true) // Guard against infinite loop if Dispose(), which calls Close(), is called from within an OnClose handler
			return;

		var canceled = false;
		isClosing = true;

		Fit.Array.ForEach(onCloseHandlers, function(cb)
		{
			if (cb(me) === false)
			{
				canceled = true;
				return false; // Break loop
			}
		});

		isClosing = false;

		if (canceled === true)
			return;

		if (me !== null) // me is null if dialog was disposed from within an OnClose handler
		{
			Fit.Events.RemoveMutationObserver(mutationObserverId);
			mutationObserverId = -1;

			Fit.Events.RemoveHandler(window, resizeHandlerId);
			resizeHandlerId = -1;

			Fit.Dom.Remove(dialog);

			if (layer !== null)
				Fit.Dom.Remove(layer);
		}
	}

	this.Render = function(toElement) // Override Render() on Fit.Controls.Component
	{
		Fit.Validation.ThrowError("Use Open function to open Dialog");
	}

	this.Dispose = Fit.Core.CreateOverride(this.Dispose, function()
	{
		me.Close(); // Closes and triggers OnClose event, but only if dialog is open

		if (me === null) // me is null if dialog was disposed from within an OnClose handler
		{
			return;
		}

		if (layer !== null)
		{
			Fit.Dom.Remove(layer);
		}

		if (cmdMaximize !== null)
		{
			cmdMaximize.Dispose();
		}

		if (cmdDismiss !== null)
		{
			cmdDismiss.Dispose();
		}

		if (buttons !== null)
		{
			Fit.Array.ForEach(Fit.Array.Copy(buttons.children), function(buttonElm) // Using Copy(..) since Dispose() modifies children collection
			{
				buttonElm._internal.Instance.Dispose();
			});
		}

		if (mutationObserverId !== -1)
		{
			Fit.Events.RemoveMutationObserver(mutationObserverId);
		}

		if (resizeHandlerId !== -1)
		{
			Fit.Events.RemoveHandler(window, resizeHandlerId);
		}

		me = dialog = title = titleButtons = cmdMaximize = cmdDismiss = content = buttons = modal = layer = width = minWidth = maxWidth = height = minHeight = maxHeight = mutationObserverId = resizeHandlerId = onDismissHandlers = onCloseHandlers = isClosing = null;

		base();
	});

	// ============================================
	// Events
	// ============================================

	/// <function container="Fit.Controls.Dialog" name="OnDismiss" access="public">
	/// 	<description>
	/// 		Add event handler fired when dialog is being dismissed by the user.
	/// 		Action can be suppressed by returning False.
	/// 		Function receives one argument: Sender (Fit.Controls.Dialog)
	/// 	</description>
	/// 	<param name="cb" type="function"> Event handler function </param>
	/// </function>
	this.OnDismiss = function(cb)
	{
		Fit.Validation.ExpectFunction(cb);
		Fit.Array.Add(onDismissHandlers, cb);
	}

	/// <function container="Fit.Controls.Dialog" name="OnClose" access="public">
	/// 	<description>
	/// 		Add event handler fired when dialog is closed or dismissed.
	/// 		Use this event to react to dialog being closed, no matter
	/// 		the cause. Use OnDismiss event to detect when user closed it.
	/// 		Action can be suppressed by returning False.
	/// 		Function receives one argument: Sender (Fit.Controls.Dialog)
	/// 	</description>
	/// 	<param name="cb" type="function"> Event handler function </param>
	/// </function>
	this.OnClose = function(cb)
	{
		Fit.Validation.ExpectFunction(cb);
		Fit.Array.Add(onCloseHandlers, cb);
	}

	// ============================================
	// Private
	// ============================================

	function createContentElement()
	{
		var div = document.createElement("div");
		Fit.Dom.AddClass(div, "FitUiControlDialogContent");
		return div;
	}

	function setContentHeight()
	{
		if (me.IsOpen() === false)
			return;

		// By default the Dialog component adjusts its height to the content.
		// But if Height/MinimumHeight/MaximumHeight is set, or dialog is maximized,
		// then make sure to adjust the height of the content element if title/buttons
		// have been added. If no title/buttons are added, the content element simply
		// adjusts to the height of the dialog.

		content.style.height = "";

		if ((buttons !== null || title !== null) && (me.Maximized() === true || me.Height().Value !== -1 || me.MinimumHeight().Value !== -1 || me.MaximumHeight().Value !== -1))
		{
			var dh = dialog.offsetHeight;
			var th = (title !== null ? title.offsetHeight : 0);
			var bh = (buttons !== null ? buttons.offsetHeight : 0);

			content.style.height = (dh - th - bh) + "px";
		}
	}

	function updatePosition()
	{
		if (me.IsOpen() === false)
			return;

		var elm = me.GetDomElement();

		// Updating the position may actually cause content to change dimensions,
		// which in turn triggers the Mutation Observer registered to monitor the
		// dialog element, which in turn triggers updatePosition() again.
		// So this may result in dialog bouncing around a few times, especially when
		// using tables with dynamic cell widths within the content area.
		// The reason for this is because when the dialog is pushed to the right side
		// of the viewport (when centered), it may be sqeezed if sufficient space is not
		// available for the content, which may happen when the dialog is configured to scale
		// with the content (default behaviour when no dimensions are set). This results in
		// the Mutation Observer being triggered which in turn causes updatePosition()
		// to be called again.
		// Resetting the position reduces the risk of this happening since it allows
		// for the content of the dialog to consume the space it needs, without
		// causing resizing of the content once the dialog is positioned further down.
		elm.style.left = "0px";
		elm.style.top = "0px";

		var dim = Fit.Browser.GetViewPortDimensions();
		var offsetLeft = Math.floor((dim.Width / 2) - (elm.offsetWidth / 2));	// Center horizontally - place center of dialog 1/2 (50%) from the left
		var offsetTop = Math.floor((dim.Height / 3) - (elm.offsetHeight / 2));	// Place center of dialog 1/3 (33%) from the top

		if (offsetTop < 0)
			offsetTop = 0;
		if (offsetLeft < 0)
			offsetLeft = 0;

		elm.style.left = offsetLeft + "px";
		elm.style.top = offsetTop + "px";
	}

	function updateTitleButtons()
	{
		// Remove title buttons container if no longer needed

		if (titleButtons !== null && cmdMaximize === null && cmdDismiss === null)
		{
			Fit.Dom.Remove(titleButtons);
			titleButtons = null;
			return;
		}

		// Ensure title bar and container for title buttons

		if (titleButtons === null && (cmdMaximize !== null || cmdDismiss !== null))
		{
			if (me.Title() === null)
				me.Title("");

			titleButtons = document.createElement("div");
			Fit.Dom.AddClass(titleButtons, "FitUiControlDialogTitleButtons");
			Fit.Dom.Add(title, titleButtons);
		}

		// Add/re-add to ensure proper order

		if (cmdMaximize !== null)
		{
			Fit.Dom.Add(titleButtons, cmdMaximize.GetDomElement());
		}

		if (cmdDismiss !== null)
		{
			Fit.Dom.Add(titleButtons, cmdDismiss.GetDomElement());
		}
	}

	init();
}

Fit.Controls.Dialog._internal = {};

Fit.Controls.Dialog._internal.BaseDialog = function(content, showCancel, cb)
{
	Fit.Validation.ExpectString(content);
	Fit.Validation.ExpectBoolean(showCancel);
	Fit.Validation.ExpectFunction(cb, true);

	// Create dialog

	var d = new Fit.Controls.Dialog();
	d.Content(content.replace(/\n/g, "<br>"));
	d.Modal(true);
	Fit.Dom.AddClass(d.GetDomElement(), "FitUiControlDialogBase");

	// Declare buttons

	var cmdOk = new Fit.Controls.Button();
	var cmdCancel = null;

	// Localization

	var localize = function()
	{
		var locale = Fit.Internationalization.GetLocale(d);

		cmdOk.Title(locale.Ok);

		if (cmdCancel !== null)
			cmdCancel.Title(locale.Cancel);
	};

	Fit.Internationalization.OnLocaleChanged(localize);

	// Configure and add buttons

	cmdOk.Icon("check");
	cmdOk.Type(Fit.Controls.ButtonType.Success);
	cmdOk.OnClick(function(sender)
	{
		Fit.Internationalization.RemoveOnLocaleChanged(localize);

		d.Dispose();

		if (Fit.Validation.IsSet(cb) === true)
			cb(true);
	});
	d.AddButton(cmdOk);

	if (showCancel === true)
	{
		cmdCancel = new Fit.Controls.Button();
		cmdCancel.Icon("ban");
		cmdCancel.Type(Fit.Controls.ButtonType.Danger);
		cmdCancel.OnClick(function(sender)
		{
			Fit.Internationalization.RemoveOnLocaleChanged(localize);

			d.Dispose();

			if (Fit.Validation.IsSet(cb) === true)
				cb(false);
		});
		d.AddButton(cmdCancel);
	}

	localize();

	// Open dialog

	return { Dialog: d, ConfirmButton: cmdOk, CancelButton: cmdCancel }; // NOTICE: CancelButton might be null !
}

/// <function container="Fit.Controls.Dialog" name="Alert" access="public" static="true">
/// 	<description> Display alert dialog </description>
/// 	<param name="content" type="string"> Content to display in alert dialog </param>
/// 	<param name="cb" type="function" default="undefined"> Optional callback function invoked when OK button is clicked </param>
/// </function>
Fit.Controls.Dialog.Alert = function(content, cb)
{
	Fit.Validation.ExpectString(content);
	Fit.Validation.ExpectFunction(cb, true);

	var baseDialog = Fit.Controls.Dialog._internal.BaseDialog(content, false, function(res)
	{
		if (Fit.Validation.IsSet(cb) === true)
			cb();
	});
	baseDialog.Dialog.Open();
	baseDialog.ConfirmButton.Focused(true);
}

/// <function container="Fit.Controls.Dialog" name="Confirm" access="public" static="true">
/// 	<description> Display confirmation dialog with OK and Cancel buttons </description>
/// 	<param name="content" type="string"> Content to display in confirmation dialog </param>
/// 	<param name="cb" type="function">
/// 		Callback function invoked when a button is clicked.
/// 		True is passed to callback function when OK is clicked, otherwise False.
/// 	</param>
/// </function>
Fit.Controls.Dialog.Confirm = function(content, cb)
{
	Fit.Validation.ExpectString(content);
	Fit.Validation.ExpectFunction(cb);

	var baseDialog = Fit.Controls.Dialog._internal.BaseDialog(content, true, cb);
	baseDialog.Dialog.Open();
	baseDialog.ConfirmButton.Focused(true);
}

/// <function container="Fit.Controls.Dialog" name="Prompt" access="public" static="true">
/// 	<description> Display prompt dialog that allows for user input </description>
/// 	<param name="content" type="string"> Content to display in prompt dialog </param>
/// 	<param name="defaultValue" type="string"> Default value in input field </param>
/// 	<param name="cb" type="function" default="undefined">
/// 		Callback function invoked when OK or Cancel button is clicked.
/// 		Value entered in input field is passed, null if prompt is canceled.
/// 	</param>
/// </function>
Fit.Controls.Dialog.Prompt = function(content, defaultValue, cb)
{
	Fit.Validation.ExpectString(content);
	Fit.Validation.ExpectString(defaultValue);
	Fit.Validation.ExpectFunction(cb);

	var txt = new Fit.Controls.Input("FitUiControlDialogPrompt" + Fit.Data.CreateGuid());
	txt.Width(100, "%");
	txt.Value(defaultValue);

	var baseDialog = Fit.Controls.Dialog._internal.BaseDialog(content + "<br><br>", true, function(res)
	{
		// Notice: Dialog is disposed at this point!

		var val = txt.Value();
		txt.Dispose();

		if (res === true) // OK
		{
			cb(val);
		}
		else // Cancel
		{
			cb(null);
		}
	});

	Fit.Events.AddHandler(baseDialog.Dialog.GetDomElement(), "keydown", function(e)
	{
		if (e.keyCode === 13 && txt.Focused() === true) // ENTER
		{
			baseDialog.ConfirmButton.Click();
		}
		else if (e.keyCode === 27) // ESC
		{
			baseDialog.CancelButton.Click();
		}
	});

	Fit.Dom.Add(baseDialog.Dialog.GetContentDomElement(), txt.GetDomElement());

	baseDialog.Dialog.Open();
	txt.Focused(true);
}

Fit.Internationalization.AddLocalization(Fit.Controls.Dialog,
{
	// Primary locales must be registered before country specific overrides.
	// Example order: en, en_US, en_GB, de, de_AT, etc.
	// All locales inherit from en. All country specific overrides inherit
	// from their general locale (e.g. de_AT inherits from de).
	// English (en) MUST be defined, and be defined first!

	"en":
	{
		"Ok": "OK",
		"Cancel": "Cancel"
	},
	"da":
	{
		"Ok": "OK",
		"Cancel": "Annuller"
	},
	"de":
	{
		"Ok" : "OK",
		"Cancel" : "Abbrechen"
	}
});
/// <container name="Fit.Controls.DropDown" extends="Fit.Controls.ControlBase">
/// 	Drop Down Menu control allowing for single and multi selection.
/// 	Supports data selection using any control extending from Fit.Controls.PickerBase.
/// 	This control is extending from Fit.Controls.ControlBase.
/// </container>

/// <function container="Fit.Controls.DropDown" name="DropDown" access="public">
/// 	<description> Create instance of DropDown control </description>
/// 	<param name="ctlId" type="string" default="undefined"> Unique control ID that can be used to access control using Fit.Controls.Find(..) </param>
/// </function>
Fit.Controls.DropDown = function(ctlId)
{
	Fit.Validation.ExpectStringValue(ctlId, true);
	Fit.Core.Extend(this, Fit.Controls.ControlBase).Apply(ctlId);

	var me = this;								// Access to members from event handlers (where "this" may have a different meaning)
	var itemContainer = null;					// Container for selected items and input fields
	var itemCollection = {};					// Indexed collection for selected items (for fast lookup)
	var itemCollectionOrdered = [];				// Ordered item collection (item order can be changed using drag and drop)
	var itemDropZones = {};						// Indexed collection of dropzones used to enable item dragging/dropping
	var arrow = null;							// Arrow button used to open/close drop down menu
	var hidden = null;							// Area used to hide DOM elements (e.g span used to calculate width of input fields)
	var spanFitWidth = null;					// Span element used to calculate text width - used to dynamically control width of input fields
	var txtPrimary = null;						// Primary input (search) field initially available
	var txtCssWidth = -1;						// Width of input (search) field(s) - specified using CSS
	var txtActive = null;						// Currently active input (search) field
	var txtEnabled = false;						// Flag indicating whether user can enter text
	var dropDownMenu = null;					// Drop down menu element
	var picker = null;							// Picker control within drop down menu
	var orgSelections = [];						// Original selection set using Value(..) function - used to determine whether control is dirty
	var invalidMessage = "Invalid selection";	// Mouse over text for invalid selections
	var invalidMessageChanged = false;			// Flag indicating whether built-in Invalid Selection Message has been overridden or not
	var initialFocus = true;					// Flag indicating first focus of control
	var maxHeight = { Value: 150, Unit: "px"};	// Picker max height (px)
	var prevValue = "";							// Previous input value - used to determine whether OnChange should be fired
	var focusAssigned = false;					// Boolean ensuring that control is only given focus when AddSelection is called, if user assigned focus to control
	var visibilityObserverId = -1;				// Observer (ID) responsible for updating input control width when drop down becomes visible (if initially hidden)
	var widthObserverId = -1;					// Observer (ID) responsible for updating tab flow when control width is changed
	var tabOrderObserverId = -1;				// Observer (ID) responsible for updating tab flow when control becomes visible
	var partiallyHidden = null;					// Reference to item partially hidden (only used in Single Selection Mode where word wrapping is disabled)
	var closeHandlers = [];						// Events (IDs) responsible for closing drop down when user clicks outside of control
	var dropZone = null;						// Active DropZone (drag and drop support)
	var isMobile = false;						// Flag indicating whether control is running on a mobile (touch) device
	var focusInputOnMobile = false;				// Flag indicating whether control should focus input after removing an item or selecting a new item from the picker control
	var detectBoundaries = false;				// Flag indicating whether drop down menu should detect viewport collision and open upwards when needed

	var onInputChangedHandlers = [];			// Invoked when input value is changed - takes two arguments (sender (this), text value)
	var onPasteHandlers = [];					// Invoked when a value is pasted - takes two arguments (sender (this), text value)
	var onOpenHandlers = [];					// Invoked when drop down is opened - takes one argument (sender (this))
	var onCloseHandlers = [];					// Invoked when drop down is closed - takes one argument (sender (this))

	// Picker - suppress events
	var suppressUpdateItemSelectionState = false;
	var suppressOnItemSelectionChanged = false;

	// Text selection mode
	var clearTextSelectionOnInputChange = false;
	var prevTextSelection = null;
	var textSelectionCallback = null;
	var cmdToggleTextMode = null;

	function init()
	{
		Fit.Internationalization.OnLocaleChanged(localize);
		localize();

		// Initial settings

		me._internal.Data("multiselect", "false");
		me._internal.Data("selectionmode", "visual");
		me._internal.Data("selectionmodetoggle", "false");

		if (Fit.Browser.GetInfo().IsMobile === true)
			isMobile = true;

		// Create item container

		itemContainer = document.createElement("div");
		itemContainer.onmousedown = function(e)
		{
			itemContainer.tabIndex = 0; // Prevent control from losing focus when clicked by temporarily making the element focusable
		}
		itemContainer.onmouseup = function(e)
		{
			itemContainer.tabIndex = -1; // Remove tabindex to prevent element from interfering with tab flow
		}
		itemContainer.onclick = function(e) // Not triggered when user clicks arrow button - it has its own logic and suppresses event propagation
		{
			var target = Fit.Events.GetTarget(e);

			focusInputOnMobile = true;

			if (target.tagName !== "INPUT") // Focus input unless already focused (if input was clicked)
			{
				focusAssigned = true; // Clicking the item container causes blur to fire for input fields in drop down which changes focusAssigned to false - it must be true for focusInput(..) to assign focus
				focusInput(((partiallyHidden !== null) ? partiallyHidden.previousSibling : txtPrimary));
			}

			me.OpenDropDown();
		}
		Fit.Dom.AddClass(itemContainer, "FitUiControlDropDownItems");

		// Create arrow button used to open drop down

		arrow = document.createElement("i");
		Fit.Dom.AddClass(arrow, "fa");
		Fit.Dom.AddClass(arrow, "fa-chevron-down");
		arrow.tabIndex = ((isMobile === true) ? 0 : -1); // We need to be able to focus arrow on mobile to keep DropDown focused (search for the use of arrow.focus())
		arrow.onmousedown = function(e)
		{
			if (isMobile === false)
				arrow.tabIndex = 0; // Prevent control from losing focus when clicked by temporarily making the element focusable
		}
		arrow.onmouseup = function(e)
		{
			if (isMobile === false) // Assigning focus on a mobile device often pops up the virtual keyboard which is annoying
			{
				arrow.tabIndex = -1; // Remove tabindex to prevent element from interfering with tab flow

				// Prevent DropDown from losing focus when arrow is used to close menu.
				// It would otherwise leave the control with no blinking cursor.
				// Also, we want the control to be ready for input and keyboard navigation.
				focusAssigned = true; // Clicking the arrow causes blur to fire for input fields in drop down which changes focusAssigned to false - it must be true for focusInput(..) to assign focus
				focusInput(((partiallyHidden !== null) ? partiallyHidden.previousSibling : txtPrimary));
			}
		}
		arrow.onclick = function(e)
		{
			focusInputOnMobile = false;

			// Do nothing by default, event propagates out to itemContainer
			// which opens drop down (See itemContainer.onclick handler above).

			// Close drop down if already open
			if (me.IsDropDownOpen() === true)
			{
				me.CloseDropDown();

				if (isMobile === true)
				{
					me.Focused(false); // Force control to lose focus when closed on mobile, to have the OnBlur event fire
				}
			}
			else // DropDown is closed - open it
			{
				me.OpenDropDown();
			}

			Fit.Events.StopPropagation(e); // Prevent event from reaching itemContainer.onclick which opens DropDown
		}

		// Create primary search textbox

		txtPrimary = createSearchField();
		txtActive = txtPrimary;

		// Create drop down menu

		dropDownMenu = document.createElement("div");
		if (Fit.Browser.GetBrowser() !== "MSIE" || Fit.Browser.GetVersion() >= 9) // OnMouseWheel event is buggy in IE8
		{
			dropDownMenu.onmousewheel = function(e) // Handler prevents scroll on page when scrolling picker
			{
				var ev = Fit.Events.GetEvent(e);

				dropDownMenu.firstChild.scrollTop -= ((ev.wheelDeltaY !== undefined) ? ev.wheelDeltaY : ev.wheelDelta); // Expecting PickerControl's container (firstChild) to be scrollable for this to work
				Fit.Events.PreventDefault(ev);
			}
		}
		Fit.Dom.AddClass(dropDownMenu, "FitUiControlDropDownPicker");
		dropDownMenu.style.display = "none"; // Considered closed by default (prevent OnClose from firing if CloseDropDown() is called on closed drop down)

		// Create hidden span used to calculate width of input field value

		hidden = document.createElement("div");
		Fit.Dom.AddClass(hidden, "FitUiControlDropDownHidden");

		spanFitWidth = document.createElement("span");

		// Make drop down close when user clicks outside of control

		if (isMobile === false)
		{
			var eventId = Fit.Events.AddHandler(document, "click", function(e)
			{
				var target = Fit.Events.GetTarget(e);

				if (me.IsDropDownOpen() === true && target !== me.GetDomElement() && Fit.Dom.Contained(me.GetDomElement(), target) === false)
					me.CloseDropDown();
			});
			Fit.Array.Add(closeHandlers, eventId);
		}
		else
		{
			// OnClick does not work reliably on mobile (at least not on iOS 9 and 10), so using touch events instead

			var coords = null;
			var eventId = -1;

			eventId = Fit.Events.AddHandler(document, "touchstart", function(e)
			{
				var target = Fit.Events.GetTarget(e);

				coords = null;

				if (me.IsDropDownOpen() === true && target !== me.GetDomElement() && Fit.Dom.Contained(me.GetDomElement(), target) === false)
				{
					coords = Fit.Events.GetPointerState().Coordinates.Document;
				}
			});
			Fit.Array.Add(closeHandlers, eventId);

			eventId = Fit.Events.AddHandler(document, "touchend", function(e)
			{
				if (coords === null)
					return;

				// Determine whether user moved finger (e.g. to scroll page) in which case we do not want to close the menu

				var curCoords = Fit.Events.GetPointerState().Coordinates.Document;
				var moved = (Math.abs(coords.X - curCoords.X) > 10 || Math.abs(coords.Y - curCoords.Y) > 10); // Must be moved at least 10px left/right or up/down

				if (moved === false)
				{
					me.CloseDropDown();
					me.Focused(false);
				}
			});
			Fit.Array.Add(closeHandlers, eventId);
		}

		// Make drop down close if focus is lost on mobile
		// which happens when onscreen keyboard is closed.

		me.OnBlur(function()
		{
			if (isMobile === true)
			{
				focusInputOnMobile = false;
				me.CloseDropDown();
			}
		});

		// Suppress context menu (except for input fields)

		Fit.Events.AddHandler(me.GetDomElement(), "contextmenu", function(e)
		{
			if (Fit.Events.GetTarget(e).tagName !== "INPUT")
				return Fit.Events.PreventDefault(e);
		});

		// Text selection mode

		me.OnFocus(function()
		{
			if (me.TextSelectionMode() === true)
			{
				if (Fit.Browser.GetBrowser() === "MSIE" || Fit.Browser.GetBrowser() === "Edge")
				{
					txtPrimary.readOnly = false; // ReadOnly set to true to make text-overflow:ellipsis work
					setTimeout(function() { txtPrimary.blur(); txtPrimary.focus(); }, 0); // Change to ReadOnly is not applied immediately unless blurred and re-focused
				}

				clearTextSelectionOnInputChange = true;

				//me.OpenDropDown(); // DISABLED - will also open control when gaining focus from tab navigation
			}
		});

		me.OnChange(function()
		{
			if (me.TextSelectionMode() === true)
			{
				updateTextSelection();
			}
		});

		me.OnBlur(function()
		{
			if (me.TextSelectionMode() === true)
			{
				updateTextSelection(); // Update when blurred in case user have entered a value

				if (Fit.Browser.GetBrowser() === "MSIE" || Fit.Browser.GetBrowser() === "Edge")
				{
					txtPrimary.readOnly = true; // ReadOnly set to true to make text-overflow:ellipsis work
				}
			}
		});

		// PickerBase - make picker aware of focused state of host control

		me.OnFocus(function()
		{
			if (picker !== null)
			{
				picker._internal.ReportFocused(true);
			}
		});

		me.OnBlur(function()
		{
			if (picker !== null)
			{
				picker._internal.ReportFocused(false);
			}
		});

		// Append elements to the DOM

		Fit.Dom.Add(hidden, spanFitWidth);
		Fit.Dom.Add(itemContainer, txtPrimary);
		Fit.Dom.Add(itemContainer, arrow);
		me._internal.AddDomElement(itemContainer);
		me._internal.AddDomElement(dropDownMenu);
		me._internal.AddDomElement(hidden);

		me.AddCssClass("FitUiControlDropDown");
	}

	// ============================================
	// Public
	// ============================================

	// Error message

	/// <function container="Fit.Controls.DropDown" name="InvalidSelectionMessage" access="public" returns="string">
	/// 	<description> Get/set mouse over text shown for invalid selections </description>
	/// 	<param name="msg" type="string" default="undefined"> If defined, error message for invalid selections are set </param>
	/// </function>
	this.InvalidSelectionMessage = function(msg)
	{
		Fit.Validation.ExpectString(msg, true);

		if (Fit.Validation.IsSet(msg) === true)
		{
			invalidMessage = msg;
			invalidMessageChanged = true; // Make sure message is not changed if locale is changed on page

			updateInvalidMessageForSelectedItems();
		}

		return invalidMessage;
	}

	// Dimensions

	// See documentation on ControlBase
	this.Width = Fit.Core.CreateOverride(this.Width, function(val, unit)
	{
		Fit.Validation.ExpectNumber(val, true);
		Fit.Validation.ExpectStringValue(unit, true);

		var rtn = base(val, unit);

		// Make sure tab flow is automatically updated if control width is changed due to use of relative unit

		if (Fit.Validation.IsSet(val) === true)
		{
			if ((rtn.Unit === "%" || rtn.Unit === "em" || rtn.Unit === "rem") && widthObserverId === -1)
			{
				var prevWidth = me.GetDomElement().offsetWidth;
				var moTimeout = -1;

				widthObserverId = Fit.Events.AddMutationObserver(me.GetDomElement(), function(elm)
				{
					var newWidth = me.GetDomElement().offsetWidth;

					if (prevWidth !== newWidth) // Width has changed
					{
						prevWidth = newWidth;

						if (moTimeout !== -1) // Clear pending optimization
							clearTimeout(moTimeout);

						// Schedule optimization to prevent too many identical operations
						// in case observer fires several times almost simultaneously.
						moTimeout = setTimeout(function()
						{
							if (me === null)
							{
								return; // Control has been disposed
							}

							moTimeout = -1;
							optimizeTabOrder();
						}, 250);
					}
				});
			}
			else
			{
				if (widthObserverId !== -1)
				{
					Fit.Events.RemoveMutationObserver(widthObserverId);
					widthObserverId = -1;
				}
			}

			// Immediately update tab flow when control width is changed

			optimizeTabOrder();
		}

		return rtn;
	});

	/// <function container="Fit.Controls.DropDown" name="DropDownMaxHeight" access="public" returns="object">
	/// 	<description> Get/set max height of drop down - returns object with Value (number) and Unit (string) properties </description>
	/// 	<param name="value" type="number" default="undefined"> If defined, max height is updated to specified value. A value of -1 forces picker to fit height to content. </param>
	/// 	<param name="unit" type="string" default="undefined"> If defined, max height is updated to specified CSS unit, otherwise px is assumed </param>
	/// </function>
	this.DropDownMaxHeight = function(value, unit)
	{
		Fit.Validation.ExpectNumber(value, true);
		Fit.Validation.ExpectStringValue(unit, true);

		if (Fit.Validation.IsSet(value) === true)
		{
			maxHeight = { Value: value, Unit: ((Fit.Validation.IsSet(unit) === true) ? unit : "px")};

			if (picker !== null)
				picker.MaxHeight(maxHeight.Value, maxHeight.Unit);
		}

		return maxHeight;
	}

	/// <function container="Fit.Controls.DropDown" name="DropDownMaxWidth" access="public" returns="object">
	/// 	<description> Get/set max width of drop down - returns object with Value (number) and Unit (string) properties </description>
	/// 	<param name="value" type="number" default="undefined"> If defined, max width is updated to specified value. A value of -1 forces drop down to use control width. </param>
	/// 	<param name="unit" type="string" default="undefined"> If defined, max width is updated to specified CSS unit, otherwise px is assumed </param>
	/// </function>
	this.DropDownMaxWidth = function(value, unit)
	{
		Fit.Validation.ExpectNumber(value, true);
		Fit.Validation.ExpectStringValue(unit, true);

		if (Fit.Validation.IsSet(value) === true)
		{
			if (value !== -1)
			{
				dropDownMenu.style.width = "auto"; // Adjust width to content - notice that optimizeDropDownPosition(..) and resetDropDownPosition() also manipulate the width property!
				dropDownMenu.style.maxWidth = value + ((Fit.Validation.IsSet(unit) === true) ? unit : "px");
			}
			else
			{
				dropDownMenu.style.width = (me.DetectBoundaries() === true ? dropDownMenu.style.width : ""); // Preserve width value if DetectBoundaries is enabled since it also modifies this property
				dropDownMenu.style.maxWidth = "";
			}
		}

		var res = { Value: -1, Unit: "px" };

		if (dropDownMenu.style.maxWidth !== "")
		{
			res.Value = parseFloat(dropDownMenu.style.maxWidth);
			res.Unit = dropDownMenu.style.maxWidth.replace(res.Value, "");
		}

		return res;
	}

	// ControlBase interface

	// See documentation on ControlBase
	this.Value = function(val)
	{
		Fit.Validation.ExpectString(val, true);

		// Set

		if (Fit.Validation.IsSet(val) === true)
		{
			orgSelections = [];
			var fireChange = (itemCollectionOrdered.length > 0 || val !== ""); // Fire OnChange if current selections are cleared, and/or if new selections are set

			me._internal.ExecuteWithNoOnChange(function()
			{
				me.Clear();

				if (val !== "")
				{
					Fit.Array.ForEach(val.split(";"), function(item)
					{
						var info = item.split("=");

						if (info.length === 2) // Format: title1=val1;title2=val2;title3=val3
							me.AddSelection(decodeReserved(info[0]), decodeReserved(info[1]));
						else // Format: val1;val2;val3
							me.AddSelection(decodeReserved(info[0]), decodeReserved(info[0]));
					});
				}
			});

			orgSelections = me.GetSelections();

			if (fireChange === true)
				fireOnChange();
		}

		// Get

		var selections = me.GetSelections(); // Invalid selections excluded
		var value = "";

		Fit.Array.ForEach(selections, function(item)
		{
			value += ((value !== "") ? ";" : "") + encodeReserved(item.Title) + "=" + encodeReserved(item.Value);
		});

		return value;
	}

	// See documentation on ControlBase
	this.IsDirty = function()
	{
		return (Fit.Core.IsEqual(orgSelections, me.GetSelections()) === false); // Invalid selections excluded
	}

	// See documentation on ControlBase
	this.Clear = function()
	{
		me.ClearSelections();
	}

	// See documentation on ControlBase
	this.Focused = function(val)
	{
		Fit.Validation.ExpectBoolean(val, true);

		if (Fit.Validation.IsSet(val) === true)
		{
			if (val === true)
			{
				var c = txtPrimary; //txtActive;
				var v = c.value;

				// Set focus
				c.focus();

				// Make cursor move to end
				c.value = "";
				c.value = v;
			}
			else if (val === false && Fit.Dom.Contained(me.GetDomElement(), Fit.Dom.GetFocused()) === true)
			{
				me.CloseDropDown();
				Fit.Dom.GetFocused().blur(); // Focused element could be txtActive (holds reference to currently focused input field) or arrow button
			}
		}

		return (txtActive === Fit.Dom.GetFocused());
	}

	// See documentation on ControlBase
	this.Dispose = Fit.Core.CreateOverride(this.Dispose, function()
	{
		// This will destroy control - it will no longer work!

		if (picker !== null)
			picker.Destroy();

		if (Fit._internal.DropDown.Current === me)
		{
			Fit._internal.DropDown.Current = null;
		}

		Fit.Internationalization.RemoveOnLocaleChanged(localize);

		if (widthObserverId !== -1)
		{
			Fit.Events.RemoveMutationObserver(widthObserverId);
		}

		if (tabOrderObserverId !== -1)
		{
			Fit.Events.RemoveMutationObserver(tabOrderObserverId);
		}

		Fit.Array.ForEach(closeHandlers, function(eventId)
		{
			Fit.Events.RemoveHandler(document, eventId);
		});

		Fit.Array.ForEach(itemDropZones, function(key)
		{
			itemDropZones[key].Dispose();
		});

		me = itemContainer = itemCollection = itemDropZones = arrow = hidden = spanFitWidth = txtPrimary = txtCssWidth = txtActive = txtEnabled = dropDownMenu = picker = orgSelections = invalidMessage = invalidMessageChanged = initialFocus = maxHeight = prevValue = focusAssigned = visibilityObserverId = widthObserverId = tabOrderObserverId = partiallyHidden = closeHandlers = dropZone = isMobile = focusInputOnMobile = detectBoundaries = onInputChangedHandlers = onPasteHandlers = onOpenHandlers = onCloseHandlers = suppressUpdateItemSelectionState = suppressOnItemSelectionChanged = clearTextSelectionOnInputChange = prevTextSelection = textSelectionCallback = cmdToggleTextMode = null;

		base();
	});

	// Misc. options

	/// <function container="Fit.Controls.DropDown" name="TextSelectionMode" access="public" returns="boolean">
	/// 	<description>
	/// 		Get/set flag indicating whether to use Text Selection Mode (true) or Visual Selection Mode (false).
	/// 		Visual Selection Mode is the default way selected items are displayed, but it may result in control
	/// 		changing dimensions as items are added/removed. Text Selection Mode prevents this and gives the
	/// 		user a traditional DropDown control instead.
	/// 	</description>
	/// 	<param name="val" type="boolean" default="undefined"> If defined, True enables Text Selection Mode, False disables it (Visual Selection Mode) </param>
	/// 	<param name="cb" type="function" default="undefined">
	/// 		If defined, function will be called with DropDown being passed as an argument when selection text
	/// 		needs to be updated. Function is expected to return a string representation of the selected items.
	/// 	</param>
	/// </function>
	this.TextSelectionMode = function(val, cb)
	{
		Fit.Validation.ExpectBoolean(val, true);
		Fit.Validation.ExpectFunction(cb, true);

		if (Fit.Validation.IsSet(val) === true)
		{
			if (val === true && me.TextSelectionMode() === false)
			{
				textSelectionCallback = (cb ? cb : null);

				updateTextSelection();

				if (me.Focused() === false && (Fit.Browser.GetBrowser() === "MSIE" || Fit.Browser.GetBrowser() === "Edge"))
				{
					txtPrimary.readOnly = true; // Necessary to make text-overflow:ellipsis work in IE and Edge - disabled in OnFocus handler
				}
			}
			else if (val === false && me.TextSelectionMode() === true)
			{
				if (txtPrimary.value === prevTextSelection)
				{
					txtPrimary.value = "";
				}
				else
				{
					// User has changed value - clear and fire OnInputChanged.
					// This only happens if Text Selection Mode is being disabled
					// while control has focus and user have entered a value,
					// since selection text is always updated when control lose focus.
					me.ClearInput();
				}

				clearTextSelectionOnInputChange = false;
				prevTextSelection = null;
				textSelectionCallback = null;

				if (Fit.Browser.GetBrowser() === "MSIE" || Fit.Browser.GetBrowser() === "Edge")
				{
					txtPrimary.readOnly = false;
				}
			}

			me._internal.Data("selectionmode", (val === true ? "text" : "visual"));

			if (cmdToggleTextMode !== null)
			{
				if (val === true)
				{
					Fit.Dom.RemoveClass(cmdToggleTextMode, "fa-compress");
					Fit.Dom.AddClass(cmdToggleTextMode, "fa-expand");
				}
				else
				{
					{
						Fit.Dom.RemoveClass(cmdToggleTextMode, "fa-expand");
						Fit.Dom.AddClass(cmdToggleTextMode, "fa-compress");
					}
				}
			}
		}

		return (me._internal.Data("selectionmode") === "text");
	}

	/// <function container="Fit.Controls.DropDown" name="SelectionModeToggle" access="public" returns="boolean">
	/// 	<description> Get/set value indicating whether control allow user to toggle Selection Mode (Visual or Text) </description>
	/// 	<param name="val" type="boolean" default="undefined"> If defined, True enables toggle button, False disables it </param>
	/// </function>
	this.SelectionModeToggle = function(val)
	{
		Fit.Validation.ExpectBoolean(val, true);

		if (Fit.Validation.IsSet(val) === true)
		{
			if (val === true && cmdToggleTextMode === null)
			{
				cmdToggleTextMode = document.createElement("span");
				cmdToggleTextMode.onclick = function()
				{
					me.TextSelectionMode(!me.TextSelectionMode());
				}
				Fit.Dom.AddClass(cmdToggleTextMode, "fa");
				Fit.Dom.AddClass(cmdToggleTextMode, me.TextSelectionMode() === true ? "fa-expand" : "fa-compress");
				me._internal.AddDomElement(cmdToggleTextMode);
				me._internal.Data("selectionmodetoggle", "true");
			}
			else if (val === false && cmdToggleTextMode !== null)
			{
				me._internal.RemoveDomElement(cmdToggleTextMode);
				cmdToggleTextMode = null;
				me._internal.Data("selectionmodetoggle", "false");
			}
		}

		return (cmdToggleTextMode !== null);
	}

	/// <function container="Fit.Controls.DropDown" name="MultiSelectionMode" access="public" returns="boolean">
	/// 	<description> Get/set flag indicating whether control allows for multiple selections </description>
	/// 	<param name="val" type="boolean" default="undefined"> If defined, True enables multi selection mode, False disables it </param>
	/// </function>
	this.MultiSelectionMode = function(val)
	{
		Fit.Validation.ExpectBoolean(val, true);

		if (Fit.Validation.IsSet(val) === true && me.MultiSelectionMode() !== val)
		{
			me.ClearSelections();
			me._internal.Data("multiselect", val.toString());
			optimizeTabOrder();
		}

		return (me._internal.Data("multiselect") === "true");
	}

	// Controlling selections

	/// <function container="Fit.Controls.DropDown" name="GetPicker" access="public" returns="Fit.Controls.PickerBase">
	/// 	<description> Get picker control used to add items to drop down control </description>
	/// </function>
	this.GetPicker = function()
	{
		return picker;
	}

	/// <function container="Fit.Controls.DropDown" name="SetPicker" access="public">
	/// 	<description> Set picker control used to add items to drop down control </description>
	/// 	<param name="pickerControl" type="Fit.Controls.PickerBase" nullable="true"> Picker control extending from PickerBase </param>
	/// </function>
	this.SetPicker = function(pickerControl)
	{
		Fit.Validation.ExpectInstance(pickerControl, Fit.Controls.PickerBase, true);

		if (pickerControl === picker)
			return; // Already active picker

		// Remove existing picker

		if (picker !== null)
			Fit.Dom.Remove(picker.GetDomElement());

		// Add picker

		if (!pickerControl)
		{
			picker = null;
			return;
		}

		pickerControl._internal.InitializePicker();
		pickerControl._internal.ReportFocused(me.Focused());

		picker = pickerControl;
		Fit.Dom.Add(dropDownMenu, picker.GetDomElement());

		// Allow picker to select items in case selections have already been set in drop down

		suppressOnItemSelectionChanged = true;
		picker.SetSelections(me.GetSelections());
		suppressOnItemSelectionChanged = false;

		// Set picker MaxHeight

		picker.MaxHeight(maxHeight.Value, maxHeight.Unit);
		optimizeDropDownPosition(); // In case dropdown is already open and SetPicker was called async, e.g. initiated from OnOpen event. Function may change MaxHeight on Picker.

		// Make sure OnItemSelectionChanged is only registered once

		if (!picker._internal)
			picker._internal = {};

		if (picker._internal.HostControl)
			return;

		picker._internal.HostControl = me;

		// Register OnItemSelectionChanged handler which is used to
		// synchronize selections from picker control to drop down.

		var fireChangeEvent = false;

		picker.OnItemSelectionChanged(function(sender, eventArgs)
		{
			if (suppressOnItemSelectionChanged === true)
				return; // Skip - already processing OnItemSelectionChanged - may be invoked multiple times if e.g. switching selection in Single Selection Mode (existing item removed + new item selected)

			var txt = null;

			// Prevent this.AddSelection and this.RemoveSelection from calling
			// picker.UpdateItemSelection which in turn fires OnItemSelectionChanged, causing an infinite loop.
			suppressUpdateItemSelectionState = true;

			if (eventArgs.Selected === true && me.GetSelectionByValue(eventArgs.Value) === null) // Check whether node is already selected (PreSelection)
			{
				fireChangeEvent = true;

				// Changing a selection in the picker control may cause OnItemSelectionChanged to be fired multiple
				// times since an existing selection may first be deselected, followed by new item being selected.
				// In this case we suppress OnChange fired by RemoveSelection(..) and AddSelection(..), and instead
				// fire it when picker's OnItemSelectionComplete event is fired.
				me._internal.ExecuteWithNoOnChange(function() { me.AddSelection(eventArgs.Title, eventArgs.Value); });

				if (me.MultiSelectionMode() === false)
					me.CloseDropDown();
			}
			else if (eventArgs.Selected === false && me.GetSelectionByValue(eventArgs.Value) !== null)
			{
				fireChangeEvent = true;

				txt = txtActive; // RemoveSelection changes txtActive

				// Changing a selection in the picker control may cause OnItemSelectionChanged to be fired multiple
				// times since an existing selection may first be deselected, followed by new item being selected.
				// In this case we suppress OnChange fired by RemoveSelection(..) and AddSelection(..), and instead
				// fire it when picker's OnItemSelectionComplete event is fired.
				me._internal.ExecuteWithNoOnChange(function() { me.RemoveSelection(eventArgs.Value) });

				// Fix - if item removed was the last item, and txtActive
				// was one of the input fields belonging to that selection,
				// it will now have been removed.
				if (txt.parentElement.parentElement === null)
					txt = txtPrimary;
			}

			// DISABLED: Now handled using picker.OnFocus(..) handler further down - see https://github.com/Jemt/Fit.UI/issues/86 for details
			// if (eventArgs.ProgrammaticallyChanged === false && (isMobile === false || focusInputOnMobile === true))
			// {
			// 	focusAssigned = true; // Clicking the picker causes blur to fire for input fields in drop down which changes focusAssigned to false - it must be true for focusInput(..) to assign focus
			// 	focusInput(((txt !== null) ? txt : txtActive));
			// }

			suppressUpdateItemSelectionState = false;
		});

		picker.OnItemSelectionComplete(function(sender)
		{
			if (suppressOnItemSelectionChanged === true)
				return;

			// Picker may notify about selections that has already been
			// made due to PreSelections (nodes are selected when loaded).
			// Only fire OnChange if control value has actually changed.
			if (fireChangeEvent === true)
			{
				me._internal.FireOnChange();
				fireChangeEvent = false;
			}
		});

		picker.OnFocusIn(function(sender)
		{
			if (isMobile === false || focusInputOnMobile === true)
			{
				// Steal back focus - DropDown should remain the focused control
				focusAssigned = true; // Clicking the picker causes blur to fire for input fields in drop down which changes focusAssigned to false - it must be true for focusInput(..) to assign focus
				focusInput(txtActive);
			}
		});
	}

	/// <function container="Fit.Controls.DropDown" name="AddSelection" access="public">
	/// 	<description> Add selection to control </description>
	/// 	<param name="title" type="string"> Item title </param>
	/// 	<param name="value" type="string"> Item value </param>
	/// 	<param name="valid" type="boolean" default="true">
	/// 		Flag indicating whether selection is valid or not. Invalid selections are highlighted and
	/// 		not included when selections are retrived using Value() function, and not considered when
	/// 		IsDirty() is called to determine whether control value has been changed by user.
	/// 		GetSelections(true) can be used to retrive all items, including invalid selections.
	/// 	</param>
	/// </function>
	this.AddSelection = function(title, value, valid)
	{
		Fit.Validation.ExpectString(title);
		Fit.Validation.ExpectString(value);
		Fit.Validation.ExpectBoolean(valid, true);

		if (me.GetSelectionByValue(value) !== null)
			return;

		// Update picker control

		// Notice: suppressUpdateItemSelectionState is True if item was added by picker,
		// in which case picker.UpdateItemSelection(..) should not be called.
		// What happens is that picker fires drop down's OnItemSelectionChanged when an item is
		// selected, which sets suppressUpdateItemSelectionState to True, and calls AddSelection.
		// Failing to prevent picker.UpdateItemSelection(..) from being called in this case could
		// result in an infinite loop.
		if (picker !== null && suppressUpdateItemSelectionState === false)
		{
			// Notice: Picker fires OnItemSelectionChanged when picker.UpdateItemSelection(..) is invoked
			// below (other controls than DropDown may have registered an OnItemSelectionChanged
			// handler too). In this case we set suppressOnItemSelectionChanged to True, causing
			// drop down to do nothing in OnItemSelectionChanged handler when fired. Drop down's OnItemSelectionChanged
			// handler is responsible for handling items added/removed by picker, but in this case the change did not
			// come from the picker (since suppressUpdateItemSelectionState is False).
			// Failing to set this flag could result in an infinite loop.
			suppressOnItemSelectionChanged = true;

			var res = true;
			var error = null;

			try // Make sure we can set suppressOnItemSelectionChanged false again, so drop down remains in a functioning state
			{
				res = picker.UpdateItemSelection(value, true, me.Focused() === false);
			}
			catch (err) { error = err; }

			suppressOnItemSelectionChanged = false;

			if (error !== null)
				Fit.Validation.ThrowError(error);

			if (res === false)
				return; // Picker prevented selection from being added
		}

		// Clear selection if in Single Selection Mode

		if (me.MultiSelectionMode() === false)
		{
			var error = null;

			// ClearSelections() results in picker.UpdateItemSelection(..) being called if an item is currently selected,
			// eventually resulting in picker firing OnItemSelectionChanged and OnItemSelectionComplete. However, operation has
			// not completed yet, since new element has not yet been selected (done below). Skip events.
			suppressOnItemSelectionChanged = true;

			try // Make sure we can set suppressOnItemSelectionChanged false again, so drop down remains in a functioning state
			{
				me._internal.ExecuteWithNoOnChange(function() { me.ClearSelections(); });
			}
			catch (err) { error = err; }

			suppressOnItemSelectionChanged = false;

			if (error !== null)
				Fit.Validation.ThrowError(error);

			if (itemCollectionOrdered.length > 0) // A picker prevented selected item from being removed
				return;
		}

		// Create new item

		// Delete button
		var cmdDelete = document.createElement("i");
		Fit.Dom.AddClass(cmdDelete, "fa");
		Fit.Dom.AddClass(cmdDelete, "fa-times");
		cmdDelete.tabIndex = 0; // Prevents control from losing focus when clicking button - will not interfear with tab flow since we have custom handling for that
		cmdDelete.onclick = function(e) // OnClick fires after MouseUp
		{
			// Whether OnClick fires depends on what browser is being used. A couple of tests reveal this:
			// Chrome and IE: Does not fire onclick if an element is moved to another position in DOM (dragged and dropped).
			// Firefox: Does not fire onclick if element is moved, unless it is dropped in a new position in DOM (drag and drop)
			//  - opposite of Chrome and IE. Firefox does ignore minor movements though, for the sake of usability.

			me.RemoveSelection(decode(Fit.Dom.Data(cmdDelete.parentElement, "value")));

			// Always focus control when removing and moving items.
			// First of all it prevents OnFocus and OnBlur from firing
			// a lot of times if multiple elements are removed or moved,
			// secondly it's easier to ensure consistency across browsers
			// as various events are implemented differently, especially
			// when drag and drop comes into place.
			// RemoveSelection changes focus if control already has focus.
			// If three items are selected, and the first one is removed,
			// then focus is set to the first (left most) input field.
			// We always want txtPrimary to have focus after removing an
			// item using the mouse which is why focus is assigned below.
			// This is also the reason why the code in cmdDelete.OnMouseUp
			// alone is not sufficient. Focus must be assigned to txtPrimary
			// AFTER RemoveSelection(..) is invoked.
			if (isMobile === false || focusInputOnMobile === true)
			{
				focusAssigned = true;
				focusInput(txtPrimary);
			}
			else
			{
				arrow.focus(); // Focus arrow to keep DropDown control focused on mobile
			}

			// Do not open drop down when an item is removed
			Fit.Events.StopPropagation(e);
		}
		cmdDelete.onmouseup = function() // MouseUp fires before OnClick
		{
			// OnClick is not fired in Firefox when mouse is moved (but not dropped in a new position),
			// which causes the item to remain intact and focused. Make sure proper element is focused in this case.
			if (isMobile === false || focusInputOnMobile === true)
			{
				focusAssigned = true;
				focusInput(txtPrimary);
			}
			else
			{
				arrow.focus(); // Focus arrow to keep DropDown control focused on mobile
			}
		}

		// Item container (left input, title box, right input)
		var container = document.createElement("span");
		container.onmousedown = function(e)
		{
			container.tabIndex = 0; // Prevent control from losing focus when clicked by temporarily making the element focusable
		}
		container.onmouseup = function(e)
		{
			container.tabIndex = -1; // Remove tabindex to prevent element from interfering with tab flow
		}
		/*container.onclick = function(e)
		{
			focusInputOnMobile = true;
			focusAssigned = true;
			focusInput(((partiallyHidden !== null) ? partiallyHidden.previousSibling : txtPrimary)); //focusInput(txtPrimary);
		}*/

		// Input fields (left and right)
		var searchLeft = createSearchField();
		var searchRight = createSearchField();

		// Title box
		var item = document.createElement("span");
		Fit.Dom.Data(item, "value", encode(value)); // Value may contain special characters - encode to prevent value from breaking item

		// Set CSS class and mouse over for invalid selection
		if (valid === false)
		{
			Fit.Dom.Attribute(item, "title", invalidMessage);
			Fit.Dom.AddClass(item, "FitUiControlDropDownInvalid");
		}

		// Add title and delete button to title box
		var titleWithoutHtml = Fit.String.StripHtml(title);
		var textNode = document.createTextNode(titleWithoutHtml);
		Fit.Dom.Add(item, textNode);
		Fit.Dom.Add(item, cmdDelete);

		// Add elements to item container
		Fit.Dom.Add(container, searchLeft);
		Fit.Dom.Add(container, item);
		Fit.Dom.Add(container, searchRight);

		// Add new item

		var before = null;

		if (txtActive !== txtPrimary && me.MultiSelectionMode() === true && Fit.Dom.GetIndex(txtActive) === 0) // Left input
			before = txtActive.parentElement;
		else if (txtActive !== txtPrimary && me.MultiSelectionMode() === true && Fit.Dom.GetIndex(txtActive) === 2) // Right input
			before = txtActive.parentElement.nextSibling;
		else
			before = txtPrimary;

		itemContainer.insertBefore(container, before);

		var itemObject = createItemObject(titleWithoutHtml, value, valid !== false, item, textNode); //convertItemElementToItemObject(item);
		itemCollection[itemObject.Value] = itemObject;
		itemCollectionOrdered.push(itemObject);

		// Clear input control value

		if (me.TextSelectionMode() === false)
		{
			me.ClearInput();
		}

		// Optimize tab order

		if (Fit.Dom.IsVisible(me.GetDomElement()) === true)
		{
			// Controls is visible - immediately optimize tab order

			if (me.MultiSelectionMode() === true)
				optimizeTabOrder(item); // Optmize tab order for this particular item only - disables right search field (tabIndex = -1) if item is wider than control
			else
				optimizeTabOrder(); // Update tab flow and partiallyHidden variable
		}
		else
		{
			// Control is hidden or not rooted - optimize tab order once it becomes visible

			// Register mutation observer if not already registered
			if (tabOrderObserverId === -1)
			{
				tabOrderObserverId = Fit.Events.AddMutationObserver(me.GetDomElement(), function(elm)
				{
					if (Fit.Dom.IsVisible(me.GetDomElement()) === true)
					{
						optimizeTabOrder();
						disconnect(); // Observers are expensive - remove when no longer needed
						tabOrderObserverId = -1;
					}
				});
			}
		}

		// Drag and Drop

		var drg = new Fit.DragDrop.Draggable(container, item);
		drg.OnDragStop(onDragStop);
		drg.OnDragging(onDragging);

		var drp = new Fit.DragDrop.DropZone(container);
		drp.OnDrop(onDrop);
		drp.OnEnter(onDropZoneEnter);
		drp.OnLeave(onDropZoneLeave);
		itemDropZones[value] = drp; // Keep reference so we can dispose it when item is removed

		// Focus input control

		if (me.MultiSelectionMode() === true)
		{
			// Make input to the right of newly added item active. This to make sure that
			// the next item added appears to the right of the previously added item.
			// If a left input field is selected, it remains focused, as the new element
			// is added in front of the left input field.
			if (txtActive !== txtPrimary && Fit.Dom.GetIndex(txtActive) === 2)
			{
				if (searchRight.tabIndex !== -1) // Select right search field if not taken out of tab flow (see optimizeTabOrder(item) above)
					focusInput(searchRight);
				else if (container.nextSibling.tagName === "SPAN") // Right search field has been taken out of flow - use left search field in following item if found
					focusInput(container.nextSibling.children[0]);
			}
		}
		else
		{
			// Focus primary search field in Single Selection Mode, unless selected item is partially hidden,
			// in which case the first input field (left side) is focused instead, since txtPrimary will also
			// have been hidden due to word wrapping being disabled in Single Selection Mode.

			focusInput(((partiallyHidden !== null) ? partiallyHidden.previousSibling : txtPrimary)); // partiallyHidden.previousSibling is the same as searchLeft
		}

		// Fire OnChange event

		fireOnChange();
	}

	/// <function container="Fit.Controls.DropDown" name="GetSelections" access="public" returns="array">
	/// 	<description> Get selected items - returned array contain objects with Title (string), Value (string), and Valid (boolean) properties </description>
	/// 	<param name="includeInvalid" type="boolean" default="false"> Flag indicating whether invalid selection should be included or not </param>
	/// </function>
	this.GetSelections = function(includeInvalid)
	{
		Fit.Validation.ExpectBoolean(includeInvalid, true);

		var toReturn = [];

		Fit.Array.ForEach(itemCollectionOrdered, function(selection)
		{
			if (includeInvalid === true || selection.Valid === true)
			{
				Fit.Array.Add(toReturn, { Title: selection.Title, Value: selection.Value, Valid: selection.Valid });
			}
		});

		return toReturn;
	}

	/// <function container="Fit.Controls.DropDown" name="GetSelectionByValue" access="public" returns="object">
	/// 	<description> Get selected item by value - returns object with Title (string), Value (string), and Valid (boolean) properties if found, otherwise Null is returned </description>
	/// 	<param name="val" type="string"> Value of selected item to retrive </param>
	/// </function>
	this.GetSelectionByValue = function(val)
	{
		Fit.Validation.ExpectString(val);

		var selection = itemCollection[val] || null;

		if (selection !== null)
		{
			return { Title: selection.Title, Value: selection.Value, Valid: selection.Valid };
		}

		return null;
	}

	/// <function container="Fit.Controls.DropDown" name="RenameSelection" access="public">
	/// 	<description> Rename title of selected item by its value </description>
	/// 	<param name="val" type="string"> Value of selected item to rename </param>
	/// 	<param name="newTitle" type="string"> New item title </param>
	/// </function>
	this.RenameSelection = function(val, newTitle)
	{
		Fit.Validation.ExpectString(val);
		Fit.Validation.ExpectString(newTitle);

		var selection = itemCollection[val] || null;

		if (selection !== null && selection.Title !== newTitle)
		{
			var titleWithoutHtml = Fit.String.StripHtml(newTitle);

			Fit.Dom.Text(selection.TextNode, titleWithoutHtml);
			selection.Title = titleWithoutHtml;

			fireOnChange();
		}
	}

	/// <function container="Fit.Controls.DropDown" name="ClearSelections" access="public">
	/// 	<description> Clear selections </description>
	/// </function>
	this.ClearSelections = function()
	{
		var fireEvent = false;
		var wasFocused = focusAssigned; // Removing an input from DOM fires OnBlur which sets focusAssigned to False

		me._internal.ExecuteWithNoOnChange(function() // picker.UpdateItemSelection results in OnChange being fired
		{
			Fit.Array.ForEach(itemCollectionOrdered, function(selection)
			{
				if (picker !== null)
				{
					// Notice: Picker fires OnItemSelectionChanged when picker.UpdateItemSelection(..) is invoked
					// below (other controls than DropDown may have registered an OnItemSelectionChanged
					// handler too). In this case we set suppressOnItemSelectionChanged to True, causing
					// drop down to do nothing in OnItemSelectionChanged handler when fired. Drop down's OnItemSelectionChanged
					// handler is responsible for handling items added/removed by picker, but in this case the change did not
					// come from the picker.
					suppressOnItemSelectionChanged = true;

					var res = true;
					var error = null;

					try // Make sure we can set suppressOnItemSelectionChanged false again, so drop down remains in a functioning state
					{
						var res = picker.UpdateItemSelection(selection.Value, false, me.Focused() === false); // OnItemSelectionChanging and OnItemSelectionChanged are fired if picker recognizes item, causing it to be removed in drop down's OnItemSelectionChanged handler (unless canceled, in which case False is returned)
					}
					catch (err) { error = err; }

					suppressOnItemSelectionChanged = false;

					if (error !== null)
						Fit.Validation.ThrowError(error);

					if (res !== false && selection.DomElement.parentElement.parentElement !== null)
					{
						// Element was not removed (still rooted in DOM), because picker did not recognize
						// it (did not fire OnItemSelectionChanged) which would otherwise have triggered Drop
						// Down's OnItemSelectionChanged handler, which in turn would have called RemoveSelection.
						// And we know it did not cancel change since picker.UpdateItemSelection did not return False.
						// It is fine to remove item.
						Fit.Dom.Remove(selection.DomElement.parentElement);
					}

					if (res !== false)
						fireEvent = true;
				}
				else
				{
					Fit.Dom.Remove(selection.DomElement.parentElement);
					fireEvent = true;
				}
			});

			Fit.Array.ForEach(itemDropZones, function(key)
			{
				itemDropZones[key].Dispose();
			});

			itemCollection = {};
			itemCollectionOrdered = [];
			itemDropZones = {};
		});

		focusAssigned = wasFocused;

		optimizeTabOrder();
		focusInput(txtPrimary);

		if (fireEvent === true)
			fireOnChange();
	}

	/// <function container="Fit.Controls.DropDown" name="RemoveSelection" access="public">
	/// 	<description> Remove selected item by value </description>
	/// 	<param name="value" type="string"> Value of selected item to remove </param>
	/// </function>
	this.RemoveSelection = function(value)
	{
		Fit.Validation.ExpectString(value);

		// Update picker control.
		// Notice: suppressUpdateItemSelectionState is True if item was removed by picker,
		// in which case picker.UpdateItemSelection(..) should not be called.
		// What happens is that picker fires drop down's OnItemSelectionChanged when an item is
		// deselected, which sets suppressUpdateItemSelectionState to True, and calls RemoveSelection.
		// Failing to prevent picker.UpdateItemSelection(..) from being called in this case could
		// result in an infinite loop.
		if (picker !== null && suppressUpdateItemSelectionState === false)
		{
			// Notice: Picker fires OnItemSelectionChanged when picker.UpdateItemSelection(..) is invoked
			// below (other controls than DropDown may have registered an OnItemSelectionChanged
			// handler too). In this case we set suppressOnItemSelectionChanged to True, causing
			// drop down to do nothing in OnItemSelectionChanged handler when fired. Drop down's OnItemSelectionChanged
			// handler is responsible for handling items added/removed by picker, but in this case the change did not
			// come from the picker (since suppressUpdateItemSelectionState is False).
			// Failing to set this flag could result in an infinite loop.
			suppressOnItemSelectionChanged = true;

			var res = false;
			var error = null;

			try // Make sure we can set suppressOnItemSelectionChanged false again, so drop down remains in a functioning state
			{
				res = picker.UpdateItemSelection(value, false, me.Focused() === false);
			}
			catch (err) { error = err; }

			suppressOnItemSelectionChanged = false;

			if (error !== null)
				Fit.Validation.ThrowError(error);

			if (res === false)
				return; // Picker prevented selection from being removed
		}

		var found = null;
		var txt = null;

		var itemObject = itemCollection[value] || null;

		if (itemObject === null)
			return;

		if (me.MultiSelectionMode() === true && itemObject.DomElement.parentElement.nextSibling !== null && itemObject.DomElement.parentElement.nextSibling !== txtPrimary)
			txt = itemObject.DomElement.parentElement.nextSibling.children[0];

		found = itemObject.DomElement.parentElement;

		if (me.TextSelectionMode() === false)
		{
			// Do not assign focus in TextSelectionMode - only txtPrimary is visible,
			// and while modern browsers will just ignore focus assignment for hidden
			// inputs and keep focus where it is, IE8 will throw an error in a modal
			// alert dialog with the following message:
			// "ThrowError: Can't move focus to the control because it is invisible, not enabled, or of a type that does not accept the focus."
			// Focus is changed internally in DropDown when de-selecting items, in which case
			// one of the inputs belonging to one of the remaining hidden items will be assigned
			// focus and trigger the error because it is hidden.

			if (me.MultiSelectionMode() === false)
				focusInput(txtPrimary);
			else
				focusInput(((txt !== null) ? txt : txtPrimary)); // Place focus in front of item to the right of removed element
		}

		Fit.Dom.Remove(found);
		Fit.Array.Remove(itemCollectionOrdered, itemObject);
		delete itemCollection[value];

		itemDropZones[value].Dispose();
		delete itemDropZones[value];

		if (me.MultiSelectionMode() === false)
		{
			optimizeTabOrder();
		}
		else
		{
			if (itemCollectionOrdered.length === 0)
				optimizeTabOrder(); // Make sure txtPrimary can receive focus using Tab or Shift+Tab
		}

		fireOnChange();
	}

	/// <function container="Fit.Controls.DropDown" name="UpdateSelected" access="public" returns="object[]">
	/// 	<description>
	/// 		Update title of selected items based on data in associated picker control.
	/// 		An array of updated items are returned. Each object has the following properties:
	/// 		 - Title: string (Updated title)
	/// 		 - Value: string (Unique item value)
	/// 		 - Exists: boolean (True if item still exists, False if not)
	/// 		This is useful if selections are stored in a database, and
	/// 		available items may have their titles changed over time. Invoking
	/// 		this function will ensure that the selection displayed to the user
	/// 		reflects the actual state of data in the picker control. Be aware
	/// 		that this function can only update selected items if a picker has been
	/// 		associated (see SetPicker(..)), and it contains the data from which
	/// 		selected items are to be updated.
	/// 		Items that no longer exists in picker's data will not automatically
	/// 		be removed.
	/// 	</description>
	/// </function>
	this.UpdateSelected = function()
	{
		if (me.GetPicker() === null)
		{
			return [];
		}

		var updated = [];
		var selections = me.GetSelections();

		Fit.Array.ForEach(selections, function(selected)
		{
			var pickerItem = me.GetPicker().GetItemByValue(selected.Value);

			if (pickerItem !== null)
			{
				var elm = getSelectionElementByValue(selected.Value);
				elm.childNodes[0].nodeValue = Fit.String.StripHtml(pickerItem.Title);

				Fit.Array.Add(updated, { Title: pickerItem.Title, Value: selected.Value, Exists: true });
			}
			else
			{
				Fit.Array.Add(updated, { Title: selected.Title, Value: selected.Value, Exists: false });
			}
		});

		return updated;
	}

	// Controlling input field

	/// <function container="Fit.Controls.DropDown" name="ClearInput" access="public">
	/// 	<description> Clear text field </description>
	/// </function>
	this.ClearInput = function(input)
	{
		Fit.Validation.ExpectInstance(input, HTMLInputElement, true);

		var inp = ((Fit.Validation.IsSet(input) === true) ? input : txtActive);

		if (inp.value === "")
			return;

		inp.value = "";
		inp.style.width = "";

		if (inp === txtActive)
			prevValue = "";

		fireOnInputChanged("");

		// Resetting width (above): Seems to be buggy with Chrome+SharePoint. Input sometime retains width and is incorrectly positioned above selected items,
		// which does not happen with IE and Firefox. Releasing JS thread using setTimeout solves the problem, but it will only work when input argument is passed,
		// since txtActive may change during execution (e.g. if ClearInput is called from clearAllInputsButActive).
		// Perhaps forcing a repaint using either zoom in CSS, or by temporarily assigning a CSS class, may also fix the problem.
	}

	/// <function container="Fit.Controls.DropDown" name="SetInputValue" access="public">
	/// 	<description>
	/// 		Set value of text field which is automatically cleared the first time control
	/// 		receives focus. Notice that this function should be called after AddSelection(..),
	/// 		since adding selections causes the value of the text field to be cleared.
	/// 	</description>
	/// 	<param name="val" type="string"> New value for text field </param>
	/// </function>
	this.SetInputValue = function(val)
	{
		Fit.Validation.ExpectString(val);

		if (txtActive.value === val)
			return;

		txtActive.value = "";
		txtActive.style.width = "";

		var txt = ((focusAssigned === true) ? txtActive : txtPrimary);

		if (partiallyHidden !== null)
			txt = partiallyHidden.previousSibling;

		txt.value = val;
		prevValue = val;
		txtActive = txt;

		fitWidthToContent(txt);
		fireOnInputChanged(txt.value);

		// Fix for hidden or non-rooted control, in which case fitWidthToContent(..) won't work and txt.offsetWidth remains 0.
		// Register mutation observer which is invoked when control is rooted, or when DOMElement hiding control becomes visible.

		if (visibilityObserverId !== -1) // Cancel any mutation observer previously registered
		{
			Fit.Events.RemoveMutationObserver(visibilityObserverId);
			visibilityObserverId = -1;
		}

		if (val.length > 0 && txt.offsetWidth === 0)
		{
			var observe = null;

			if (Fit.Dom.IsRooted(txt) === false)
				observe = txt;
			else
				observe = Fit.Dom.GetConcealer(txt); // Returns Null if not concealed (hidden)

			if (observe !== null)
			{
				visibilityObserverId = Fit.Events.AddMutationObserver(observe, function(elm)
				{
					if (Fit.Dom.IsVisible(txt) === true)
					{
						fitWidthToContent(txt);
						disconnect(); // Observers are expensive - remove when no longer needed
						visibilityObserverId = -1;
					}
				});
			}
		}
	}

	/// <function container="Fit.Controls.DropDown" name="GetInputValue" access="public" returns="string">
	/// 	<description> Get input value </description>
	/// </function>
	this.GetInputValue = function()
	{
		return txtActive.value;
	}

	/// <function container="Fit.Controls.DropDown" name="InputEnabled" access="public" returns="boolean">
	/// 	<description> Get/set value indicating whether input is enabled </description>
	/// 	<param name="val" type="boolean" default="undefined"> If defined, True enables input, False disables it </param>
	/// </function>
	this.InputEnabled = function(val)
	{
		Fit.Validation.ExpectBoolean(val, true);

		if (Fit.Validation.IsSet(val) === true)
		{
			txtEnabled = val;
		}

		return txtEnabled;
	}

	// Controlling drop down menu

	/// <function container="Fit.Controls.DropDown" name="OpenDropDown" access="public">
	/// 	<description> Open drop down menu </description>
	/// </function>
	this.OpenDropDown = function()
	{
		if (dropDownMenu.style.display === "block")
			return;

		if (Fit._internal.DropDown.Current !== null && Fit._internal.DropDown.Current !== me)
			Fit._internal.DropDown.Current.CloseDropDown();

		// Do this before displaying drop down to prevent dropdown with position:absolute
		// from changing height of document which may cause page to temporarily scroll, hence
		// result in incorrect measurement of control position in optimizeDropDownPosition().
		optimizeDropDownPosition(true);

		dropDownMenu.style.minWidth = me.GetDomElement().offsetWidth + "px"; // In case DropDownMaxWidth(..) is set - update every time drop down is opened in case viewport is resized and has changed control width
		dropDownMenu.style.display = "block";

		//optimizeDropDownPosition();

		Fit._internal.DropDown.Current = me;

		fireOnDropDownOpen();

		// Scroll selected item into view in Single Selection Mode.
		// This needs to be done after fireOnDropDownOpen() is invoked
		// because it fires PickerBase.OnShow which in TreeView resets
		// the scroll position.
		// NOTICE: WSDropDown also calls RevealItemInView(..) when
		// root nodes have been populated.

		if (me.MultiSelectionMode() === false && me.GetSelections().length === 1)
		{
			me.GetPicker().RevealItemInView(me.GetSelections()[0].Value);
		}
	}

	/// <function container="Fit.Controls.DropDown" name="CloseDropDown" access="public">
	/// 	<description> Close drop down menu </description>
	/// </function>
	this.CloseDropDown = function()
	{
		if (dropDownMenu.style.display === "none")
			return;

		dropDownMenu.style.display = "none";
		resetDropDownPosition();

		Fit._internal.DropDown.Current = null;

		fireOnDropDownClose();
	}

	/// <function container="Fit.Controls.DropDown" name="IsDropDownOpen" access="public" returns="boolean">
	/// 	<description> Get flag indicating whether drop down is open or not </description>
	/// </function>
	this.IsDropDownOpen = function()
	{
		return (dropDownMenu.style.display === "block");
	}

	/// <function container="Fit.Controls.DropDown" name="DetectBoundaries" access="public" returns="boolean">
	/// 	<description>
	/// 		Get/set value indicating whether boundary/collision detection is enabled or not (off by default).
	/// 		This may cause drop down to open upwards if sufficient space is not available below control.
	/// 		Enabling this feature will also allow the control to escape (overflow) boundaries created by
	/// 		containers with overflow:scroll|hidden|auto. The DropDown element will be positioned
	/// 		using fixed positioning rather than absolute positioning.
	/// 	</description>
	/// 	<param name="val" type="boolean" default="undefined"> If defined, True enables collision detection (default), False disables it </param>
	/// </function>
	this.DetectBoundaries = function(val)
	{
		Fit.Validation.ExpectBoolean(val, true);

		// NOTICE: This feature is known to not work properly with iOS 9 and below:
		// https://github.com/Jemt/Fit.UI/issues/87

		if (Fit.Validation.IsSet(val) === true)
		{
			detectBoundaries = val;
		}

		return detectBoundaries;
	}

	// ============================================
	// Events (OnChange defined on BaseControl)
	// ============================================

	/// <function container="Fit.Controls.DropDown" name="OnInputChanged" access="public">
	/// 	<description>
	/// 		Add event handler fired when input value is changed.
	/// 		Function receives two arguments:
	/// 		Sender (Fit.Controls.DropDown) and Value (string).
	/// 	</description>
	/// 	<param name="cb" type="function"> Event handler function </param>
	/// </function>
	this.OnInputChanged = function(cb)
	{
		Fit.Validation.ExpectFunction(cb);
		Fit.Array.Add(onInputChangedHandlers, cb);
	}

	/// <function container="Fit.Controls.DropDown" name="OnPaste" access="public">
	/// 	<description>
	/// 		Add event handler fired when text is pasted into input field.
	/// 		Function receives two arguments:
	/// 		Sender (Fit.Controls.DropDown) and Value (string).
	/// 		Return False to cancel event and change, and prevent OnInputChanged from firing.
	/// 	</description>
	/// 	<param name="cb" type="function"> Event handler function </param>
	/// </function>
	this.OnPaste = function(cb)
	{
		Fit.Validation.ExpectFunction(cb);
		Fit.Array.Add(onPasteHandlers, cb);
	}

	/// <function container="Fit.Controls.DropDown" name="OnOpen" access="public">
	/// 	<description>
	/// 		Add event handler fired when drop down menu is opened.
	/// 		Function receives one argument: Sender (Fit.Controls.DropDown)
	/// 	</description>
	/// 	<param name="cb" type="function"> Event handler function </param>
	/// </function>
	this.OnOpen = function(cb)
	{
		Fit.Validation.ExpectFunction(cb);
		Fit.Array.Add(onOpenHandlers, cb);
	}

	/// <function container="Fit.Controls.DropDown" name="OnClose" access="public">
	/// 	<description>
	/// 		Add event handler fired when drop down menu is closed.
	/// 		Function receives one argument: Sender (Fit.Controls.DropDown)
	/// 	</description>
	/// 	<param name="cb" type="function"> Event handler function </param>
	/// </function>
	this.OnClose = function(cb)
	{
		Fit.Validation.ExpectFunction(cb);
		Fit.Array.Add(onCloseHandlers, cb);
	}

	// ============================================
	// Private
	// ============================================

	function createSearchField()
	{
		var txt = document.createElement("input");
		txt.autocomplete = "off";
		txt.spellcheck = false;

		txt.onpaste = function(e)
		{
			var orgValue = txt.value;

			setTimeout(function() // Timeout to queue event to have pasted value available
			{
				/*if (me.TextSelectionMode() === true && txt.value === prevTextSelection)
				{
					// User just copied selection text and pasted it again - ignore
					// so we don't fire OnInputChanged below and change prevValue which
					// will cause OnInputChanged to fire once again when control lose focus.
					return;
				}*/

				// DISABLED - does not make sense.
				// Pasting a value would not fire OnInputChanged, but starting to delete
				// the characters just pasted would. So pasting "ABC" would not fire anything, but
				// pressing backspace would fire OnInputChanged with the value "AB" - that is odd.
				/*if (txt.value === prevValue || txt.value === prevTextSelection)
				{
					return; // Skip event if user just copied text and pasted it again
				}*/

				prevValue = txt.value;
				var pastedValue = txt.value;

				if (fireOnPaste(txt.value) === true)
				{
					if (txt.value === pastedValue)
					{
						// No OnPaste handler altered input value by calling SetInputValue(..)

						fitWidthToContent(txt);
						fireOnInputChanged(txt.value);
					}
				}
				else
				{
					// Paste canceled - restore old value, unless OnPaste handler called SetInputValue with a different value

					if (txt.value === pastedValue)
					{
						txt.value = orgValue;
						prevValue = txt.value;
					}
				}
			}, 0);

			clearTextSelectionOnInputChange = false;
		}

		txt.onfocus = function(e)
		{
			focusAssigned = true;

			if (initialFocus === true)
			{
				initialFocus = false;

				if (me.TextSelectionMode() === false)
					me.ClearInput(txtPrimary);
			}

			txtActive = txt;
			prevValue = (me.TextSelectionMode() === false ? txtActive.value : prevValue); // Do not assign text selection to prevValue - it should only hold changes made by user or by calls to SetInputValue(..)

			clearAllInputsButActive();
		}

		txt.onblur = function(e)
		{
			if (me === null)
			{
				// Fix for Chrome which fires OnChange and OnBlur (in both capturering and bubbling phase)
				// if control has focus while being removed from DOM, e.g. if used in a dialog closed using ESC.
				// More details here: https://bugs.chromium.org/p/chromium/issues/detail?id=866242
				return;
			}

			focusAssigned = false;
		}

		var timeOutId = -1;
		var cancelScheduledFitWidthToContent = function()
		{
			if (timeOutId !== -1)
				clearTimeout(timeOutId);
		}
		var scheduleFitWidthToContent = function(txtControl)
		{
			cancelScheduledFitWidthToContent();

			timeOutId = setTimeout(function()
			{
				if (me === null)
				{
					return; // Control was disposed shortly after removing characters
				}

				fitWidthToContent(txtControl);
				timeOutId = -1;
			}, 50);
		}

		txt.onkeydown = function(e) // Fires continuously for any key pressed - both characters and e.g backspace/delete/arrows etc. Key press may be canceled (change has not yet occured)
		{
			var ev = Fit.Events.GetEvent(e);

			txtActive = txt;
			clearAllInputsButActive();

			if (picker !== null)
			{
				if (me.IsDropDownOpen() === true)
				{
					var res = picker.HandleEvent(ev);

					if (res === false)
						return; // Picker returned False to prevent DropDown from also handling event
				}
			}

			if (me.TextSelectionMode() === true && clearTextSelectionOnInputChange === true && txtEnabled === true)
			{
				// Clear input in Text Selection Mode if user starts entering a value

				// Skip if key press is TAB, ENTER, ESC, LEFT, UP, RIGHT, or DOWN.
				// Also ignore key press if combined with modifier keys (except if SHIFT+Key for upper case letters, of course).
				var modKeys = Fit.Events.GetModifierKeys();
				if (Fit.Array.Contains([9, 13, 27, 37, 38, 39, 40], ev.keyCode) === false && (modKeys.Shift === false || modKeys.KeyDown !== 16) && modKeys.Ctrl === false && modKeys.Alt === false && modKeys.Meta === false)
				{
					// User is entering a value - clear input before character is applied to input

					clearTextSelectionOnInputChange = false;
					txt.value = ""; // No need to update prevValue - this is not the value set by the user - see onkeyup which updates prevValue

					return;
				}
			}

			if (ev.keyCode === 9) // Tab
			{
				if (me.TextSelectionMode() === true)
				{
					me.CloseDropDown();
					return;
				}

				if (ev.shiftKey === true) // Moving left
				{
					if (me.GetSelections().length === 0)
					{
						me.CloseDropDown();
						return;
					}
					else if (txt !== txtPrimary && txt.parentElement.previousSibling === null)
					{
						me.CloseDropDown();
						return;
					}

					moveToInput("Prev");
				}
				else // Moving right
				{
					if (me.MultiSelectionMode() === false && partiallyHidden !== null)
					{
						// Let browser handle navigation - only left input control can receive focus at this point

						me.CloseDropDown();
						return;
					}
					else if (txt === txtPrimary)
					{
						me.CloseDropDown();
						return;
					}

					moveToInput("Next");
				}

				return false;
			}
			else if (ev.keyCode === 38) // Arrow up
			{
				me.OpenDropDown(); // Make sure it is opened
			}
			else if (ev.keyCode === 40) // Arrow down
			{
				me.OpenDropDown(); // Make sure it is opened

				if (me.TextSelectionMode() === true) // && (Fit.Browser.GetBrowser() !== "MSIE" || Fit.Browser.GetVersion() !== 8)
				{
					// Set cursor at the beginning of text field.
					// Suppressing default behaviour to prevent cursor
					// from jumping to the end. SetCaretPosition(..)
					// is still necessary to make sure text value
					// does not remain selected (blue selection) if
					// focused was assigned using tab navigation.
					Fit.Dom.SetCaretPosition(txtPrimary, 0);
					Fit.Events.PreventDefault(ev);
				}
			}
			else if (ev.keyCode === 37) // Arrow left
			{
				if (me.TextSelectionMode() === true)
					return;

				moveToInput("Prev");
			}
			else if (ev.keyCode === 39) // Arrow right
			{
				if (me.TextSelectionMode() === true)
					return;

				if (me.MultiSelectionMode() === false && partiallyHidden !== null)
					return;

				moveToInput("Next");
			}
			else if (ev.keyCode === 27) // Escape
			{
				if (Fit.Browser.GetInfo().Name === "MSIE")
					Fit.Events.PreventDefault(ev); // Do not clear input on IE

				me.CloseDropDown();
			}
			else if (ev.keyCode === 8) // Backspace - remove selection
			{
				if (me.TextSelectionMode() === true)
				{
					if (txtEnabled === false)
					{
						Fit.Events.PreventDefault(ev); // Prevent user from clearing input value
					}

					return;
				}

				if (txt.value.length === 0)
				{
					if (Fit.Browser.GetInfo().Name === "MSIE")
						Fit.Events.PreventDefault(ev); // Do not navigate back on IE when backspace is pressed within input being removed

					var toRemove = null;

					if (txt !== txtPrimary && Fit.Dom.GetIndex(txt) === 2) // Right input
						toRemove = txt.parentElement;
					else if (txt !== txtPrimary && Fit.Dom.GetIndex(txt) === 0 && txt.parentElement.previousSibling !== null) // Left input
						toRemove = txt.parentElement.previousSibling;
					else if (txt.previousSibling !== null) // Primary input
						toRemove = txt.previousSibling;

					if (toRemove !== null)
					{
						me.RemoveSelection(decode(Fit.Dom.Data(toRemove.children[1], "value")));
					}
				}
				else
				{
					// New length is not known when removing characters until OnKeyUp is fired.
					// We won't wait for that. Instead we calculate the width "once in a while".
					// Passing txt instance rather than txtActive, as the latter may change before
					// timeout is reached and delegate is executed.
					scheduleFitWidthToContent(txt);
				}
			}
			else if (ev.keyCode === 46) // Delete - remove selection
			{
				if (me.TextSelectionMode() === true)
				{
					if (txtEnabled === false)
					{
						Fit.Events.PreventDefault(ev); // Prevent user from clearing input value
					}

					return;
				}

				if (txt.value.length === 0)
				{
					var toRemove = null;

					if (txt !== txtPrimary && Fit.Dom.GetIndex(txt) === 0) // Left input
						toRemove = txt.parentElement;
					else if (txt !== txtPrimary && Fit.Dom.GetIndex(txt) === 2 && txt.parentElement.nextSibling.tagName === "SPAN") // Right input
						toRemove = txt.parentElement.nextSibling;

					if (toRemove !== null)
					{
						me.RemoveSelection(decode(Fit.Dom.Data(toRemove.children[1], "value")));
					}
				}
				else
				{
					// New length is not known when removing characters until OnKeyUp is fired.
					// We won't wait for that. Instead we calculate the width "once in a while".
					// Passing txt instance rather than txtActive, as the latter may change before
					// timeout is reached and delegate is executed.
					scheduleFitWidthToContent(txt);
				}
			}
			else if (ev.keyCode === 13) // Enter - notice that item selection is handled by (delegated to) picker when Enter is pressed - picker.OnItemSelectionChanged receives selected item
			{
				// Prevent form submit
				Fit.Events.PreventDefault(e);
			}
			else
			{
				if (txtEnabled === false)
				{
					if (Fit.Events.GetModifierKeys().Meta === false && Fit.Events.GetModifierKeys().Ctrl === false)
					{
						// Suppress key press unless modifier key is being used (e.g. CTRL+F5 or CMD+R to reload page)
						Fit.Events.PreventDefault(ev);
					}

					return;
				}

				var mods = Fit.Events.GetModifierKeys();

				if ((mods.Ctrl === true || mods.Meta === true) && mods.KeyDown !== 16 && mods.KeyDown !== 91) // Queue operation to have value updated - this could be e.g. Ctrl/Cmd+X to cut. Real characters are handled in OnKeyPress.
				{
					scheduleFitWidthToContent(txt);
				}
			}
		}

		txt.onkeypress = function(e) // Fires continuously (unless suppressed in OnKeyDown) - character codes are available when a real value is entered
		{
			var ev = Fit.Events.GetEvent(e);

			if (ev.charCode > 0) // A real character/digit was entered if charCode is not 0 (zero)
			{
				fitWidthToContent(txt, txt.value + String.fromCharCode(ev.charCode)); // TODO: Will not work properly if multiple characters are selected, and just one character is entered - the input field will obtain an incorrect width until next key stroke. The solution is NOT to always use setTimeout since the delayed update is noticeable.
			}
		}

		txt.onkeyup = function(e) // Fires only once when a key is released (unless suppressed in OnKeyDown)
		{
			var ev = Fit.Events.GetEvent(e);

			if (ev.keyCode !== 37 && ev.keyCode !== 38 && ev.keyCode !== 39 && ev.keyCode !== 40 && ev.keyCode !== 27 && ev.keyCode !== 9 && ev.keyCode !== 16 && ev.ctrlKey === false && ev.keyCode !== 17) // Do not fire change event for: arrow keys, escape, tab, shift, and on paste (never fires when CTRL is held down (ev.ctrlKey true) or released (ev.keyCode 17))
			{
				if (me.TextSelectionMode() === true && txt.value === prevTextSelection)
				{
					// Do not fire OnInputChanged. Input value is identical to text selection
					// so user probably pressed SPACE to toggle a selection (which doesn't change input value), or
					// pressed some other none-character key (e.g CMD/SUPER or ALT/OPTION) which did not alter input value.
					return;
				}

				if (txt.value !== prevValue /*&& (me.TextSelectionMode() === false || txt.value !== prevTextSelection)*/)
				{
					prevValue = txt.value;
					fireOnInputChanged(txt.value);
				}
			}
		}

		return txt;
	}

	function createItemObject(title, value, valid, domElement, textNode)
	{
		Fit.Validation.ExpectString(title);
		Fit.Validation.ExpectString(value);
		Fit.Validation.ExpectBoolean(valid);
		Fit.Validation.ExpectDomElement(domElement);
		Fit.Validation.ExpectTextNode(textNode);

		return { Title: title, Value: value, Valid: valid, DomElement: domElement, TextNode: textNode };
	}
	/*function convertItemElementToItemObject(itemElm)
	{
		Fit.Validation.ExpectDomElement(itemElm);
		return { Title: Fit.Dom.Text(itemElm), Value: decode(Fit.Dom.Data(itemElm, "value")), Valid: Fit.Dom.HasClass(itemElm, "FitUiControlDropDownInvalid") === false, DomElement: itemElm };
	}*/

	function getSelectionElementByValue(value)
	{
		Fit.Validation.ExpectString(value);

		var item = itemCollection[value] || null;
		return item !== null ? item.DomElement : null;
	}

	function getFirstSelectionElement()
	{
		if (itemCollectionOrdered.length > 0)
		{
			return itemCollectionOrdered[0].DomElement;
		}

		return null;
	}

	function fitWidthToContent(input, val) // Set width of input field equivalent to its content
	{
		Fit.Validation.ExpectInstance(input, HTMLInputElement);
		Fit.Validation.ExpectString(val, true);

		var value = ((Fit.Validation.IsSet(val) === true) ? val : input.value);

		// Width of txtPrimary cannot reliably be determined initially if picker is hidden.
		// Re-calculating when fitWidthToContent gets called again when the picker is visible.
		if (txtCssWidth <= 0)
			txtCssWidth = txtPrimary.offsetWidth; // Notice: offsetWidth returns 0 if picker is hidden using display:none

		spanFitWidth.innerHTML = value;
		var newWidth = (((value !== "") ? spanFitWidth.offsetWidth : 0) + txtCssWidth);

		// Make sure new input width does not exceed width of drop down control
		var offsetLeft = input.offsetLeft; // Get position relative to offset parent which is div.FitUiControlDropDownItems that have position:relative
		var innerWidth = Fit.Dom.GetInnerWidth(itemContainer);
		newWidth = ((offsetLeft + newWidth > innerWidth) ? innerWidth - offsetLeft : newWidth);

		input.style.width = newWidth + "px";
	}

	function moveToInput(direction) // direction = Next/Prev
	{
		Fit.Validation.ExpectString(direction);

		var newInput = null;

		if (direction === "Prev") // Moving left
		{
			if (txtActive !== txtPrimary && Fit.Dom.GetIndex(txtActive) === 0 && txtActive.parentElement.previousSibling !== null) // Left input has focus
				newInput = txtActive.parentElement.previousSibling.children[0];
			else if (txtActive !== txtPrimary && Fit.Dom.GetIndex(txtActive) === 2) // Right input has focus
				newInput = txtActive.parentElement.children[0];
			else if (txtActive.previousSibling !== null) // Primary input has focus
				newInput = txtActive.previousSibling.children[0];
		}
		else // Moving right
		{
			// TODO: Clean up - remove disabled code below - has been replaced by more compact code below it
			/*if (txtActive !== txtPrimary && Fit.Dom.GetIndex(txtActive) === 0) // Left input has focus
			{
				var itemContainer = txtActive.parentElement;

				if (itemContainer.children[2].tabIndex !== -1) // Focus right search field in next item if not taken out of tab flow
					newInput = itemContainer.children[2];
				else if (itemContainer.nextSibling.tagName === "SPAN") // Next item's right search field has been taken out of flow - focus left search field in following item if found
					newInput = itemContainer.nextSibling.children[0];
				else // No more elements available, focus primary search field
					newInput = txtPrimary;
			}
			else if (txtActive !== txtPrimary && Fit.Dom.GetIndex(txtActive) === 2 && txtActive.parentElement.nextSibling.tagName === "SPAN") // Right input has focus
			{
				var nextItemContainer = txtActive.parentElement.nextSibling;

				if (nextItemContainer.children[2].tabIndex !== -1) // Focus right search field in next item if not taken out of tab flow
					newInput = nextItemContainer.children[2];
				else if (nextItemContainer.nextSibling.tagName === "SPAN") // Next item's right search field has been taken out of flow - focus left search field in following item if found
					newInput = nextItemContainer.nextSibling.children[0];
				else // No more elements available, focus primary search field
					newInput = txtPrimary;
			}*/

			// TODO: Rename this! We have a private property in this class with the same name!
			var itemContainer = null; // Remains Null if last item's right input control has focus (unlikely since it will never be focused unless user manages to actually click it (5px wide)

			if (txtActive !== txtPrimary && Fit.Dom.GetIndex(txtActive) === 0) // Left input has focus
				itemContainer = txtActive.parentElement; // Use current item
			else if (txtActive !== txtPrimary && Fit.Dom.GetIndex(txtActive) === 2 && txtActive.parentElement.nextSibling.tagName === "SPAN") // Right input has focus
				itemContainer = txtActive.parentElement.nextSibling; // Use next item

			if (itemContainer !== null)
			{
				if (itemContainer.children[2].tabIndex !== -1) // Focus right search field if not taken out of tab flow
					newInput = itemContainer.children[2];
				else if (itemContainer.nextSibling.tagName === "SPAN") // Right search field has been taken out of flow - focus left search field in following item if found
					newInput = itemContainer.nextSibling.children[0];
				else // No more elements available, focus primary search field - happens in Multi Selection Mode if last item is partially hidden due to overflow (item wider than control)
					newInput = txtPrimary;
			}

			// If newInput is last selection's right input field, then select txtPrimary instead
			if (newInput !== null && newInput.parentElement.nextSibling === txtPrimary && Fit.Dom.GetIndex(newInput) === 2)
				newInput = txtPrimary;
		}

		if (newInput === null) // May be null if no selections are available to move to
			return;

		// Move content
		/*newInput.value = txtActive.value;
		me.ClearInput();
		fitWidthToContent(newInput);*/

		focusInput(newInput);
	}

	function focusInput(input)
	{
		Fit.Validation.ExpectInstance(input, HTMLInputElement);

		txtActive = input;

		if (focusAssigned === true) // Only set focus if user initially assigned focus to control
			txtActive.focus();
	}

	function clearAllInputsButActive()
	{
		var inputs = itemContainer.getElementsByTagName("input");

		Fit.Array.ForEach(inputs, function(input)
		{
			if (input === txtActive)
				return;

			me.ClearInput(input);
		});
	}

	function optimizeTabOrder(item)
	{
		Fit.Validation.ExpectDomElement(item, true);

		// Fix tab order for passed item only

		if (Fit.Validation.IsSet(item) === true) // Used in Multi Selection Mode only
		{
			if (item.parentElement.offsetWidth + 1 > Fit.Dom.GetInnerWidth(itemContainer)) // Adding 1px to offsetWidth - otherwise right aligned cursor may become hidden behind drop down arrow box
				item.nextSibling.tabIndex = -1; // Item is partially hidden - disable right search field

			return;
		}

		// Fix tab navigation by taking input controls out of tab flow if hidden due to overflow

		if (me.MultiSelectionMode() === false) // Single Selection Mode
		{
			var firstSelection = getFirstSelectionElement();
			partiallyHidden = ((firstSelection !== null && firstSelection.parentElement.offsetWidth + 1 > Fit.Dom.GetInnerWidth(itemContainer)) ? firstSelection : null); // Adding 1px to offsetWidth - otherwise right aligned cursor may become hidden behind drop down arrow box

			var inputs = itemContainer.querySelectorAll("input");
			Fit.Array.ForEach(inputs, function(input)
			{
				input.tabIndex = ((partiallyHidden !== null) ? -1 : 0);
			});

			if (partiallyHidden !== null)
				inputs[0].tabIndex = 0;

			if (firstSelection !== null)
			{
				var cmdDelete = firstSelection.querySelector("i");
				cmdDelete.tabIndex = ((partiallyHidden !== null) ? -1 : 0);
			}
		}
		else // Multi Selection Mode
		{
			partiallyHidden = null;

			Fit.Array.ForEach(itemCollectionOrdered, function(itemObject)
			{
				var item = itemObject.DomElement;

				if (item.parentElement.offsetWidth + 1 > Fit.Dom.GetInnerWidth(itemContainer)) // Adding 1px to offsetWidth - otherwise right aligned cursor may become hidden behind drop down arrow box
					item.nextSibling.tabIndex = -1; // Item is partially hidden - disable right search field
				else
					item.nextSibling.tabIndex = 0; // Fully visible - part of tab flow
			});
		}
	}

	function optimizeDropDownPosition(force)
	{
		Fit.Validation.ExpectBoolean(force, true);

		if (detectBoundaries === false || (me.IsDropDownOpen() === false && force !== true))
			return;

		// Check visibility in case DropDown control is hidden while items are being selected.
		// This is a common approach to reduce expensive reflows when programmatically selecting
		// many items (e.g. using SelectAll in TreeView picker). If control is in fact hidden,
		// the picker container will keep its current position rather than being positioned
		// below/above DropDown as expected - that's acceptable. Re-opening DropDown will position
		// it properly. Without this fix, Fit.Dom.GetPosition(..) used below would return Null and
		// result in an error.
		if (Fit.Dom.IsVisible(me.GetDomElement()) === false)
			return;

		// Drop Down Menu is positioned above control if more space is available there.
		// The MaxHeight of the drop down menu will be adjusted automatically to better fit.

		var viewPortDimensions = Fit.Browser.GetViewPortDimensions();				// { Width, Height }
		var controlPositionY = Fit.Dom.GetPosition(itemContainer, true).Y;			// Position from top
		var innerDimensions = Fit.Dom.GetInnerDimensions(me.GetDomElement());		// { X, Y } with width/height of itemContainer including its margin and outline which itemContainer.offsetWidth/Height does not include
		var spacingAboveAndBelow = innerDimensions.Y - itemContainer.offsetHeight;	// Margin and outline above and below itemContainer, in case this has been applied using CSS
		var spaceAboveControl = controlPositionY;									// Space available above control
		var spaceBelowControl = viewPortDimensions.Height - (controlPositionY + innerDimensions.Y); // Space available below control
		var mostSpaceAboveControl = spaceAboveControl > spaceBelowControl;			// True if there is more space available above control than below control
		var spaceRequiredBelowControl = 100;										// Opens upwards if this amount of pixels is not available below control, and more space is available above control
		var spacingToBrowserEdge = 10;												// Makes sure that drop down menu has this amount of spacing (in pixels) to the edge of the browser

		var condNotEnoughSpaceBelow = spaceBelowControl - (spacingAboveAndBelow / 2) - spacingToBrowserEdge < spaceRequiredBelowControl

		if (Fit.Dom.GetOverflowingParent(me.GetDomElement()) === null) // Control not contained in a parent that has overflow:hidden|auto|scroll - use position:absolute which allows dropdown to remain "attached" to control when scrolling document
		{
			// Position drop down and calculate available space above or below control

			dropDownMenu.style.bottom = "";

			var spaceAvailable = -1;

			if (condNotEnoughSpaceBelow === true && mostSpaceAboveControl === true) // Open upward
			{
				dropDownMenu.style.bottom = itemContainer.offsetHeight + "px";

				spaceAvailable = controlPositionY - spacingToBrowserEdge;
			}
			else // Open like normal, downwards
			{
				spaceAvailable = viewPortDimensions.Height - (controlPositionY + itemContainer.offsetHeight) - spacingToBrowserEdge;
			}

			// Adjust DropDown's MaxHeight to make it fit

			if (picker !== null && (maxHeight.Unit !== "px" || maxHeight.Value > spaceAvailable))
			{
				// Reduce drop down menu's max height.
				// CSS unit for MaxHeight is something like 'em' (so enforce pixel based
				// max height), or pixel based MaxHeight simply exceeds space available.

				picker.MaxHeight(spaceAvailable, "px");
			}

			if (picker !== null && Fit.Core.IsEqual(picker.MaxHeight(), maxHeight) === false && picker.MaxHeight().Value < maxHeight.Value)
			{
				// MaxHeight has previously been reduced by optimizeDropDownPosition and is now smaller than
				// the value initially configured for the drop down. Increase its size again if sufficient space is available.

				picker.MaxHeight((maxHeight.Value < spaceAvailable ? maxHeight.Value : spaceAvailable), "px");
			}
		}
		else // Contained in a parent that has overflow:hidden|auto|scroll - use position:fixed which can escape overflow
		{
			// Notice that position:fixed results in the drop down being "disconnected" from the
			// control, allowing the control to be "scrolled away" from the drop down element when opened.

			dropDownMenu.style.position = "fixed";	// Using fixed positioning to escape containers with overflow:scroll|hidden|auto
			dropDownMenu.style.width = "auto";		// Picker by default has width:100% to assume the same width as the control, except if DropDownMaxWidth is set, in which case it is already "auto"
			dropDownMenu.style.top = "";
			dropDownMenu.style.bottom = "";

			var spaceAvailable = -1;

			if (condNotEnoughSpaceBelow === true && mostSpaceAboveControl === true) // Open upward
			{
				// Handle situation where the control is contained in a parent with scroll
				// and the control has been partially scrolled out of view. In this case
				// we do not want to position the drop down element where the (now hidden)
				// top of the control is located in the viewport, but where the scrollable
				// container starts.
				// https://github.com/Jemt/Fit.UI/issues/51

				var scrollParent = Fit.Dom.GetScrollParent(me.GetDomElement());

				if (scrollParent !== Fit.Dom.GetScrollDocument())
				{
					// Control is positioned within a container with scroll.
					// Calculate position relative to viewport to determine
					// whether control has been scrolled out of view.

					var scrollParentPosY = Fit.Dom.GetPosition(scrollParent, true).Y;
					scrollParentPosY = scrollParentPosY + parseInt(Fit.Dom.GetComputedStyle(scrollParent, "margin-top"));
					scrollParentPosY = scrollParentPosY + parseInt(Fit.Dom.GetComputedStyle(scrollParent, "border-top-width"));

					if (controlPositionY < scrollParentPosY)
					{
						// Relative to the viewport the control is positioned above the
						// scroll container which means it has been scrolled out of view.
						controlPositionY = scrollParentPosY;
					}
				}

				dropDownMenu.style.bottom = (viewPortDimensions.Height - controlPositionY) + "px";

				spaceAvailable = controlPositionY - spacingToBrowserEdge;
			}
			else // Open like normal, downwards
			{
				dropDownMenu.style.top = (controlPositionY + innerDimensions.Y) + "px";

				spaceAvailable = spaceBelowControl - spacingToBrowserEdge;
			}

			if (picker !== null && (maxHeight.Unit !== "px" || maxHeight.Value > spaceAvailable))
			{
				// Reduce drop down menu's max height.
				// CSS unit for MaxHeight is something like 'em' (so enforce pixel based
				// max height), or pixel based MaxHeight simply exceeds space available.

				picker.MaxHeight(spaceAvailable, "px");
			}

			if (picker !== null && Fit.Core.IsEqual(picker.MaxHeight(), maxHeight) === false && picker.MaxHeight().Value < maxHeight.Value)
			{
				// MaxHeight has previously been reduced by optimizeDropDownPosition and is now smaller than
				// the value initially configured for the drop down. Increase its size again if sufficient space is available.

				picker.MaxHeight((maxHeight.Value < spaceAvailable ? maxHeight.Value : spaceAvailable), "px");
			}
		}
	}

	function resetDropDownPosition()
	{
		// Reset changes made by optimizeDropDownPosition()
		dropDownMenu.style.position = "";
		dropDownMenu.style.width = (me.DropDownMaxWidth().Value > -1 ? dropDownMenu.style.width : ""); // Preserve width if DropDownMaxWidth is enabled since it also modifies this property
		dropDownMenu.style.bottom = "";
		dropDownMenu.style.top = "";

		if (picker !== null) // Checking in case picker was removed while opened (unlikely though)
			picker.MaxHeight(maxHeight.Value, maxHeight.Unit);
	}

	function onDragStop(draggable)
	{
		draggable.Reset();
	}

	function onDragging(draggable)
	{
		if (dropZone === null)
			return;

		var pointerPos = Fit.Events.GetPointerState().Coordinates.ViewPort;
		var elmPos = Fit.Dom.GetPosition(dropZone.GetDomElement(), true);

		if (elmPos.X + (dropZone.GetDomElement().offsetWidth / 2) < pointerPos.X) // Drop on right side
		{
			Fit.Dom.Data(dropZone.GetDomElement(), "dropping", "right");
		}
		else // Drop on left side
		{
			Fit.Dom.Data(dropZone.GetDomElement(), "dropping", "left");
		}

		me._internal.Repaint();
	}

	function onDrop(dropzone, draggable)
	{
		var fireChange = false;

		if (Fit.Dom.Data(dropzone.GetDomElement(), "dropping") === "right" && dropzone.GetDomElement() !== draggable.GetDomElement().previousSibling)
		{
			// Always focus control when removing and moving items.
			// First of all it prevents OnFocus and OnBlur from firing
			// a lot of times if multiple elements are removed or moved,
			// secondly it's easier to ensure consistency across browsers
			// as various events are implemented differently, especially
			// when drag and drop comes into place.
			focusAssigned = true;
			focusInput(txtPrimary);

			var draggableIndex = Fit.Dom.GetIndex(draggable.GetDomElement());
			var dropzoneIndex =  Fit.Dom.GetIndex(dropzone.GetDomElement());
			var itemObject = itemCollectionOrdered[draggableIndex];

			Fit.Array.RemoveAt(itemCollectionOrdered, draggableIndex);
			Fit.Array.Insert(itemCollectionOrdered, (draggableIndex < dropzoneIndex ? dropzoneIndex : dropzoneIndex + 1), itemObject);
			Fit.Dom.InsertAfter(dropzone.GetDomElement(), draggable.GetDomElement());

			fireChange = true;
		}
		else if (Fit.Dom.Data(dropzone.GetDomElement(), "dropping") === "left" && dropzone.GetDomElement().previousSibling !== draggable.GetDomElement())
		{
			// See comment in block above regarding focus
			focusAssigned = true;
			focusInput(txtPrimary);

			var draggableIndex = Fit.Dom.GetIndex(draggable.GetDomElement());
			var dropzoneIndex =  Fit.Dom.GetIndex(dropzone.GetDomElement());
			var itemObject = itemCollectionOrdered[draggableIndex];

			Fit.Array.RemoveAt(itemCollectionOrdered, draggableIndex);
			Fit.Array.Insert(itemCollectionOrdered, (draggableIndex < dropzoneIndex ? dropzoneIndex - 1 : dropzoneIndex), itemObject);
			Fit.Dom.InsertBefore(dropzone.GetDomElement(), draggable.GetDomElement());

			fireChange = true;
		}

		Fit.Dom.Data(dropZone.GetDomElement(), "dropping", null);
		dropZone = null;

		me._internal.Repaint();

		if (fireChange === true)
			fireOnChange();
	}

	function onDropZoneEnter(dropzone)
	{
		dropZone = dropzone;
	}

	function onDropZoneLeave(dropzone)
	{
		Fit.Dom.Data(dropzone.GetDomElement(), "dropping", null);
		dropZone = null;
		me._internal.Repaint();
	}

	function decodeReserved(str)
	{
		Fit.Validation.ExpectString(str);
		return str.replace(/%3B/g, ";").replace(/%3D/g, "=") // Decode characters reserved for value format: title1=value1;title2=value2;etc..
	}

	function encodeReserved(str)
	{
		Fit.Validation.ExpectString(str);
		return str.replace(/;/g, "%3B").replace(/=/g, "%3D") // Encode characters reserved for value format: title1=value1;title2=value2;etc..
	}

	function decode(str)
	{
		Fit.Validation.ExpectString(str);
		return decodeURIComponent(str);
	}

	function encode(str)
	{
		Fit.Validation.ExpectString(str);
		return encodeURIComponent(str);
	}

	function updateTextSelection()
	{
		// Add selected items to input field

		// Local flag controlling event behaviour - whether to fire OnInputChanged
		// when programmatically updating input with selection text or not.
		// Some developers want OnInputChanged fired always, while others only
		// expect it to fire when the user enters a value, or when SetInputValue(..)
		// is called from external code.
		// True		= Always fire OnInputChanged.
		// False	= Only fire when user enters a value or when SetInputValue(..) is
		//            called. Do not fire OnInputChanged when TextSelection is updated.
		var fireOnInputChangedEvent = false;

		// If fireOnInputChangedEvent is false:
		// Notice that in TextSelectionMode with fireOnInputChangedEvent=false the input field
		// handles two states: The value set by TextSelectionMode, and the value set by
		// either the user or a call to SetInputValue(..).
		// Therefore, even when a text selection is set, the input field will still be
		// considered empty in regards to how OnInputChanged fires.
		// So an actual value has to be entered for OnInputChanged to fire.
		// Clearing the text selection will not fire OnInputChanged since it is already
		// considered empty.

		if (fireOnInputChangedEvent === false && prevValue !== "")
		{
			// User entered a value which will now be removed and replaced.
			// Make sure OnInputChanged handlers are fired - this is the same
			// behaviour as in the ordinary visual selection mode
			// which also clears the input once a selection is made.
			me.ClearInput();
		}

		// Convert selected items to text

		var text = "";

		if (textSelectionCallback !== null)
		{
			text = textSelectionCallback(me);
		}
		else
		{
			var selections = me.GetSelections();

			Fit.Array.ForEach(selections, function(selection)
			{
				text += (text !== "" ? ", " : "") + selection.Title;
			});

			if (me.MultiSelectionMode() === true && selections.length > 0)
			{
				text = "(" + selections.length + ") " + text;
			}
		}

		// Set new text selection

		if (fireOnInputChangedEvent === true)
		{
			//me.SetInputValue(text); // Notice: SetInputValue calls fitWidthToContent(..) which adjusts input size to fit value, and fires OnInputChanged event
			if (txtPrimary.value !== text)
			{
				txtPrimary.value = text;
				prevValue = text;
				fireOnInputChanged(text);
			}
		}
		else
		{
			txtPrimary.value = text;
		}

		prevTextSelection = (text !== "" ? text : null);

		// Set cursor position

		// Make cursor move to end and scroll it into view.
		// Unfortunately it will not make the field scroll to the right on IE
		// and Edge, and it seems very difficult (impossible?) to get working.
		// Other similar controls simply clear their selection when opened, and
		// restore it when closed, which might be the only way to ensure the
		// same experience across all browsers.
		/*if (me.Focused() === true)
		{
			txtPrimary.blur();
			txtPrimary.focus();
		}*/

		// Make cursor move to beginning of input field if focused
		if (me.Focused() === true)
		{
			Fit.Dom.SetCaretPosition(txtPrimary, 0);
		}

		clearTextSelectionOnInputChange = true;
	}

	function updateInvalidMessageForSelectedItems()
	{
		Fit.Array.ForEach(itemCollection, function(key)
		{
			var selection = itemCollection[key];

			if (selection.Valid === false)
			{
				Fit.Dom.Attribute(selection.DomElement, "title", invalidMessage);
			}
		});
	}

	function localize()
	{
		if (invalidMessageChanged === false)
		{
			var locale = Fit.Internationalization.GetLocale(me);
			invalidMessage = locale.Translations.InvalidSelection;

			updateInvalidMessageForSelectedItems();
		}
	}

	// Event dispatchers

	function fireOnInputChanged(val)
	{
		Fit.Validation.ExpectString(val);

		Fit.Array.ForEach(onInputChangedHandlers, function(handler)
		{
			handler(me, val);
		});
	}

	function fireOnChange()
	{
		optimizeDropDownPosition();
		me._internal.FireOnChange();
	}

	function fireOnPaste(val)
	{
		Fit.Validation.ExpectString(val);

		var proceed = true;

		Fit.Array.ForEach(onPasteHandlers, function(handler)
		{
			if (handler(me, val) === false)
				proceed = false; // Do not cancel loop, allow all handlers to fire
		});

		return proceed;
	}

	function fireOnDropDownOpen()
	{
		Fit.Array.ForEach(onOpenHandlers, function(handler)
		{
			handler(me);
		});

		if (picker !== null)
			picker._internal.FireOnShow();
	}

	function fireOnDropDownClose()
	{
		Fit.Array.ForEach(onCloseHandlers, function(handler)
		{
			handler(me);
		});

		if (picker !== null)
			picker._internal.FireOnHide();
	}

	init();
}

Fit._internal.DropDown = {};
Fit._internal.DropDown.Current = null;

/*Fit.Controls.DropDown.Item = function()
{
	var title = null;
	var value = null;

	function init()
	{
		if (arguments.length === 1)
		{
			value = arguments[0];
		}
		else if (arguments.length === 2)
		{
			title = arguments[0];
			value = arguments[1];
		}

	}

	this.Title = function(val)
	{
		Fit.Validation.ExpectString(val, true);

		if (Fit.Validation.IsSet(val) === true)
			title = val;

		return title;
	}

	this.Value = function(val)
	{
		Fit.Validation.ExpectString(val, true);

		if (Fit.Validation.IsSet(val) === true)
			value = val;

		return value;
	}

	init();
}*/

/// <container name="Fit.Controls.PickerBase">
/// 	Class from which all Picker Controls extend.
/// 	Control developers must override: GetDomElement, Destroy.
/// 	Overriding the following functions is optional:
/// 	UpdateItemSelectionState, HandleEvent.
/// 	Picker Control must fire OnItemSelectionChanging and OnItemSelectionChanged when an item's
/// 	selection state is being changed, which is done by invoking
/// 	this._internal.FireOnItemSelectionChanging(title:string, value:string, currentSelectionState:boolean, programmaticallyChanged:boolean)
/// 	and
/// 	this._internal.FireOnItemSelectionChanged(title:string, value:string, newSelectionState:boolean, programmaticallyChanged:boolean).
/// 	Notice that FireOnItemSelectionChanging may return False, which must prevent item from being
/// 	selected, and at the same time prevent FireOnItemSelectionChanged from being called.
/// 	Changing an item selection may cause OnItemSelectionChanging and OnItemSelectionChanged to be
/// 	fired multiple times (e.g. if picker needs to first deselect one item before selecting another one).
/// 	Therefore PickerBase also features the OnItemSelectionComplete event which must be fired when related
/// 	changes complete, which is done by invoking this._internal.FireOnItemSelectionComplete().
/// 	OnItemSelectionComplete should only fire if a change was made (changes can be canceled using
/// 	OnItemSelectionChanging).
/// 	Picker control is also to invoke this._internal.FireOnFocusIn() if control gains focus, and
/// 	this._internal.FireOnFocusOut() if control loses focus.
/// </container>
Fit.Controls.PickerBase = function()
{
	// Private variables

	var me = this;

	var onShowHandlers = [];
	var onHideHandlers = [];
	var onChangingHandlers = [];
	var onChangeHandlers = [];
	var onCompleteHandlers = [];
	var onFocusHandlers = [];
	var onBlurHandlers = [];

	// ============================================
	// Public
	// ============================================

	/// <function container="Fit.Controls.PickerBase" name="MaxHeight" access="public" returns="object">
	/// 	<description> Get/set max height of control - returns object with Value (number) and Unit (string) properties </description>
	/// 	<param name="value" type="number" default="undefined"> If defined, max height is updated to specified value. A value of -1 forces picker to fit height to content. </param>
	/// 	<param name="unit" type="string" default="undefined"> If defined, max height is updated to specified CSS unit, otherwise px is assumed </param>
	/// </function>
	this.MaxHeight = function(value, unit)
    {
		Fit.Validation.ExpectNumber(value, true);
		Fit.Validation.ExpectStringValue(unit, true);

		var elm = me.GetDomElement();

		if (Fit.Validation.IsSet(value) === true)
		{
			if (value !== -1)
			{
				elm.style.maxHeight = value + ((Fit.Validation.IsSet(unit) === true) ? unit : "px");
			}
			else
			{
				elm.style.maxHeight = "";
			}
		}

		var res = { Value: -1, Unit: "px" }; // No maxHeight set, height adjusts to content

		if (elm.style.maxHeight !== "") // MaxHeight set
		{
			res.Value = parseFloat(elm.style.maxHeight);
			res.Unit = elm.style.maxHeight.replace(res.Value, "");
		}

		return res;
    }

	// ============================================
	// Events fired by host control
	// ============================================

	/// <function container="Fit.Controls.PickerBase" name="OnShow" access="public">
	/// 	<description>
	/// 		Register event handler fired when picker control is shown in host control.
	/// 		The following argument is passed to event handler function: Sender (PickerBase).
	/// 	</description>
	/// 	<param name="cb" type="function"> Event handler function </param>
	/// </function>
	this.OnShow = function(cb)
	{
		Fit.Validation.ExpectFunction(cb);
		Fit.Array.Add(onShowHandlers, cb);
	}

	/// <function container="Fit.Controls.PickerBase" name="OnHide" access="public">
	/// 	<description>
	/// 		Register event handler fired when picker control is hidden in host control.
	/// 		The following argument is passed to event handler function: Sender (PickerBase).
	/// 	</description>
	/// 	<param name="cb" type="function"> Event handler function </param>
	/// </function>
	this.OnHide = function(cb)
	{
		Fit.Validation.ExpectFunction(cb);
		Fit.Array.Add(onHideHandlers, cb);
	}

	// ============================================
	// Events fired by picker control itself
	// ============================================

	/// <function container="Fit.Controls.PickerBase" name="OnItemSelectionChanging" access="public">
	/// 	<description>
	/// 		Register event handler fired when item selection is changing.
	/// 		Selection can be canceled by returning False.
	/// 		The following arguments are passed to event handler function:
	/// 		Sender (PickerBase), EventArgs (containing Title (string), Value (string), and Selected (boolean) properties).
	/// 	</description>
	/// 	<param name="cb" type="function"> Event handler function </param>
	/// </function>
    this.OnItemSelectionChanging = function(cb)
    {
		Fit.Validation.ExpectFunction(cb);
		Fit.Array.Add(onChangingHandlers, cb);
    }

	/// <function container="Fit.Controls.PickerBase" name="OnItemSelectionChanged" access="public">
	/// 	<description>
	/// 		Register event handler fired when item selection is changed.
	/// 		This event may be fired multiple times when a selection is changed, e.g. in Single Selection Mode,
	/// 		where an existing selected item is deselected, followed by selection of new item.
	/// 		The following arguments are passed to event handler function:
	/// 		Sender (PickerBase), EventArgs (containing Title (string), Value (string), and Selected (boolean) properties).
	/// 	</description>
	/// 	<param name="cb" type="function"> Event handler function </param>
	/// </function>
    this.OnItemSelectionChanged = function(cb)
    {
		Fit.Validation.ExpectFunction(cb);
		Fit.Array.Add(onChangeHandlers, cb);
    }

	/// <function container="Fit.Controls.PickerBase" name="OnItemSelectionComplete" access="public">
	/// 	<description> Register event handler invoked when a series of related item changes are completed </description>
	/// 	<param name="cb" type="function"> Event handler function which accepts Sender (PickerBase) </param>
	/// </function>
	this.OnItemSelectionComplete = function(cb)
	{
		Fit.Validation.ExpectFunction(cb);
		Fit.Array.Add(onCompleteHandlers, cb);
	}

	/// <function container="Fit.Controls.PickerBase" name="OnFocusIn" access="public">
	/// 	<description> Register OnFocusIn event handler which is invoked when picker gains focus </description>
	/// 	<param name="cb" type="function"> Event handler function which accepts Sender (PickerBase) </param>
	/// </function>
	this.OnFocusIn = function(cb)
	{
		Fit.Validation.ExpectFunction(cb);
		Fit.Array.Add(onFocusHandlers, cb);
	}

	/// <function container="Fit.Controls.PickerBase" name="OnFocusOut" access="public">
	/// 	<description> Register OnFocusOut event handler which is invoked when picker loses focus </description>
	/// 	<param name="cb" type="function"> Event handler function which accepts Sender (PickerBase) </param>
	/// </function>
	this.OnFocusOut = function(cb)
	{
		Fit.Validation.ExpectFunction(cb);
		Fit.Array.Add(onBlurHandlers, cb);
	}

	// ============================================
	// For derivatives - control developers
	// ============================================

	/// <function container="Fit.Controls.PickerBase" name="GetDomElement" access="public" returns="DOMElement">
	/// 	<description>
	/// 		Overridden by control developers (required).
	/// 		Get DOMElement representing control.
	/// 	</description>
	/// </function>
	this.GetDomElement = function()
	{
		Fit.Validation.ThrowError("Function not implemented");
	}

	/// <function container="Fit.Controls.PickerBase" name="UpdateItemSelection" access="public">
	/// 	<description>
	/// 		Overridden by control developers (optional).
	/// 		Host control invokes this function when an item's selection state is changed from host control.
	/// 		Picker control is responsible for firing FireOnItemSelectionChanging and FireOnItemSelectionChanged,
	/// 		as demonstrated below, if the picker control contains the given item.
	///
	/// 		var item = getItem(value);
	/// 		if (item !== null)
	/// 		{
	/// 			&#160;&#160;&#160;&#160; if (this._internal.FireOnItemSelectionChanging(item.Title, item.Value, item.Selected, programmaticallyChanged) === false)
	/// 			&#160;&#160;&#160;&#160;&#160;&#160;&#160;&#160; return false;
	///
	/// 			&#160;&#160;&#160;&#160; item.SetSelected(selected);
	/// 			&#160;&#160;&#160;&#160; this._internal.FireOnItemSelectionChanged(item.Title, item.Value, item.Selected, programmaticallyChanged);
	/// 		}
	///
	/// 		Both events are fired by passing the given item's title, value, and current selection state.
	/// 		Be aware that host control may pass information about items not found in picker, e.g. when pasting
	/// 		items which may turn out not to be valid selections.
	/// 		Returning False from UpdateItemSelection will cancel the change.
	/// 	</description>
	/// 	<param name="value" type="string"> Item value </param>
	/// 	<param name="selected" type="boolean"> True if item was selected, False if item was deselected </param>
	/// 	<param name="programmaticallyChanged" type="boolean"> True if item was selected programmatically (not by user interaction), False otherwise </param>
	/// </function>
	this.UpdateItemSelection = function(value, selected, programmaticallyChanged) // Actually the current use of programmaticallyChanged is more like "control has focus" - used for performance optimizations
	{
		Fit.Validation.ExpectString(value);
		Fit.Validation.ExpectBoolean(selected);
		Fit.Validation.ExpectBoolean(programmaticallyChanged);

		// Default implementation fires both events, even though specialized control may not know
		// anything about the given item selected/deselected. This is necessary in order to support
		// events out of the box without requiring developer to override function.

		// It's safe to assume that current selection state is equal to !selected since host control will
		// never call UpdateItemSelection with the current value of the given item, only the desired value.
		if (me._internal.FireOnItemSelectionChanging("", value, !selected, programmaticallyChanged) === false)
			return false;

		me._internal.FireOnItemSelectionChanged("", value, selected, programmaticallyChanged);
	}

	/// <function container="Fit.Controls.PickerBase" name="SetSelections" access="public">
	/// 	<description>
	/// 		Overridden by control developers (optional).
	/// 		Host control invokes this function when picker is assigned to host control, providing an array
	/// 		of items already selected. An item is an object with a Title (string) and Value (string) property set.
	/// 		If picker defines preselected items, firing OnItemSelectionChanged
	/// 		for these items, will update the host control appropriately.
	/// 	</description>
	/// 	<param name="items" type="array"> Array containing selected items: {Title:string, Value:string} </param>
	/// </function>
	this.SetSelections = function(items)
	{
		Fit.Validation.ExpectArray(items);

		Fit.Array.ForEach(items, function(item)
		{
			Fit.Validation.ExpectString(item.Title);
			Fit.Validation.ExpectString(item.Value);
		});
	}

	/// <function container="Fit.Controls.PickerBase" name="GetItemByValue" access="public" returns="object">
	/// 	<description>
	/// 		Overridden by control developers (optional).
	/// 		Host control may invoke this function, for instance to update the title of selected items,
	/// 		to make sure these properly reflect the state of data displayed in the picker.
	/// 		Function returns Null when not implemented or when an item is not found. If found, an object
	/// 		with the following signature is returned: { Title: string, Value: string }.
	/// 	</description>
	/// 	<param name="val" type="string"> Value of item to retrieve </param>
	/// </function>
	this.GetItemByValue = function(val)
	{
		Fit.Validation.ExpectString(val);
		return null;
	}

	/// <function container="Fit.Controls.PickerBase" name="RevealItemInView" access="public">
	/// 	<description>
	/// 		Overridden by control developers (optional).
	/// 		Host control may invoke this function to reveal a selected item in
	/// 		the picker control. Often this means having the item scrolled into view.
	/// 	</description>
	/// 	<param name="val" type="string"> Value of item to reveal in view </param>
	/// </function>
	this.RevealItemInView = function(val)
	{
		Fit.Validation.ExpectString(val);
	}

	/// <function container="Fit.Controls.PickerBase" name="HandleEvent" access="public">
	/// 	<description>
	/// 		Overridden by control developers (optional).
	/// 		Host control dispatches keyboard events to this function to allow
	/// 		picker control to handle keyboard navigation with keys such as
	/// 		arrow up/down/left/right, enter, space, etc.
	/// 		Picker may return False to prevent host control from reacting to given event.
	/// 	</description>
	/// 	<param name="e" type="Event" default="undefined"> Keyboard event to process </param>
	/// </function>
	this.HandleEvent = function(e)
	{
		Fit.Validation.ExpectEvent(e, true);
	}

	/// <function container="Fit.Controls.PickerBase" name="Destroy" access="public">
	/// 	<description>
	/// 		Overridden by control developers (required).
	/// 		Destroys control to free up memory.
	/// 		Make sure to call Destroy() on PickerBase which can be done like so:
	/// 		this.Destroy = Fit.Core.CreateOverride(this.Destroy, function()
	/// 		{
	/// 			&#160;&#160;&#160;&#160; // Add control specific logic here
	/// 			&#160;&#160;&#160;&#160; base(); // Call Destroy on PickerBase
	/// 		});
	/// 	</description>
	/// </function>
	this.Destroy = function() // Must be overridden - remember to call base !
	{
		me = onShowHandlers = onHideHandlers = onChangingHandlers = onChangeHandlers = onCompleteHandlers = null;
	}

	// ============================================
	// Private
	// ============================================

	// Private members (must be public in order to be accessible to host control and controls extending from PickerBase)

	this._internal = (this._internal ? this._internal : {});

	this._internal.InitializePicker = function() // Called by Host Control when picker is assigned to it
	{
	}

	this._internal.ReportFocused = function(value) // Called by Host Control to tell picker when it is focused/blurred
	{
	}

	this._internal.FireOnShow = function() // Called by Host Control
	{
		Fit.Array.ForEach(onShowHandlers, function(handler)
		{
			handler(me);
		});
	},

	this._internal.FireOnHide = function() // Called by Host Control
	{
		Fit.Array.ForEach(onHideHandlers, function(handler)
		{
			handler(me);
		});
	},

	this._internal.FireOnItemSelectionChanging = function(title, value, selected, programmaticallyChanged) // Called by Picker Control
	{
		Fit.Validation.ExpectString(title);
		Fit.Validation.ExpectString(value);
		Fit.Validation.ExpectBoolean(selected);
		Fit.Validation.ExpectBoolean(programmaticallyChanged);

		var cancel = false;

		Fit.Array.ForEach(onChangingHandlers, function(handler)
		{
			if (handler(me, { Title: title, Value: value, Selected: selected, ProgrammaticallyChanged: programmaticallyChanged }) === false)
				cancel = true;
		});

		return !cancel;
	}

	this._internal.FireOnItemSelectionChanged = function(title, value, selected, programmaticallyChanged) // Called by Picker Control
	{
		Fit.Validation.ExpectString(title);
		Fit.Validation.ExpectString(value);
		Fit.Validation.ExpectBoolean(selected);
		Fit.Validation.ExpectBoolean(programmaticallyChanged);

		Fit.Array.ForEach(onChangeHandlers, function(handler)
		{
			handler(me, { Title: title, Value: value, Selected: selected, ProgrammaticallyChanged: programmaticallyChanged });
		});
	}

	this._internal.FireOnItemSelectionComplete = function() // Called by Picker Control
	{
		Fit.Array.ForEach(onCompleteHandlers, function(handler)
		{
			handler(me);
		});
	}

	this._internal.FireOnFocusIn = function() // Called by Picker Control
	{
		Fit.Array.ForEach(onFocusHandlers, function(handler)
		{
			handler(me);
		});
	}

	this._internal.FireOnFocusOut = function() // Called by Picker Control
	{
		Fit.Array.ForEach(onBlurHandlers, function(handler)
		{
			handler(me);
		});
	}
}

/// <container name="Fit.Controls.WSDropDown" extends="Fit.Controls.DropDown">
/// 	WebService enabled Drop Down Menu control allowing for single and multi selection.
/// 	Supports data selection using any control extending from Fit.Controls.PickerBase.
/// 	This control is extending from Fit.Controls.DropDown.
/// </container>

/// <function container="Fit.Controls.WSDropDown" name="WSDropDown" access="public">
/// 	<description> Create instance of WSDropDown control </description>
/// 	<param name="ctlId" type="string" default="undefined"> Unique control ID that can be used to access control using Fit.Controls.Find(..) </param>
/// </function>
Fit.Controls.WSDropDown = function(ctlId)
{
	Fit.Validation.ExpectStringValue(ctlId, true);
	Fit.Core.Extend(this, Fit.Controls.DropDown).Apply(ctlId);

	var me = this;
	var list = null;
	var tree = null;

	var search = "";
	var forceNewSearch = false;
	var hideLinesForFlatData = true;
	var dataRequested = false;		// Flag indicating whether TreeView data has been requested or not - determines whether a call to ensureTreeViewData() actually loads data or not
	var dataLoading = false;		// Flag indicating whether TreeView data is currently being loaded by WSDropDown internals (awaiting response) - will not be True when user expand nodes to load children, or when invoking e.g. dd.GetTreeView.Reload()
	var requestCount = 0;			// Counter to keep track of nodes for which data is currently being loaded, no matter how it was being loaded (via WSDropDown internals, programmatically on WSTreeView from external code, or by user expanding nodes)
	var onDataLoadedCallback = [];
	var suppressTreeOnOpen = false;
	var timeOut = null;
	var currentRequest = null;
	var classes = null;
	var autoUpdatedSelections = null; // Cached result from AutoUpdateSelected: [{ Title:string, Value:string, Exists:boolean }, ...]

	var onRequestHandlers = [];
	var onResponseHandlers = [];
	var onAbortHandlers = [];
	//var onPopulatedHandlers = [];

	function init()
	{
		// Initialize self (drop down)

		me.OnInputChanged(function(sender, value)
		{
			if (me.Focused() === true) // Prevent search from being triggered when OnInputChanged fires after programmatically changing input value
				searchData(value);
		});

		// Get drop down open/close button element (arrow)

		var cmdOpen = me.GetDomElement().firstChild.children[me.GetDomElement().firstChild.children.length - 1];
		classes = cmdOpen.className;

		// Create ListView

		list = new Fit.Controls.WSListView(ctlId + "__WSListView");
		list.OnRequest(function(sender, eventArgs)
		{
			if (fireEventHandlers(onRequestHandlers, list, eventArgs) === false)
				return false;

			requestCount++;
			currentRequest = eventArgs.Request;
			cmdOpen.className = "fa fa-refresh fa-spin";
		});
		list.OnResponse(function(sender, eventArgs)
		{
			requestCount--;

			fireEventHandlers(onResponseHandlers, list, eventArgs);
			
			cmdOpen.className = classes;
			currentRequest = null;

			if (forceNewSearch === true)
			{
				forceNewSearch = false;

				eventArgs.Items = []; // Remove data, we do not want it to be populated to control
				searchData(me.GetInputValue());
			}
		});
		list.OnAbort(function(sender, eventArgs)
		{
			requestCount--;
		});
		list.OnItemSelectionChanging(function(sender, item)
		{
			// Prevent user from deselecting node which is read only in tree (not selectable)

			var node = tree.GetChild(item.Value, true);

			if (node !== null && node.Selectable() === false)
				return false;
		});
		list.OnItemSelectionChanged(function(sender, item)
		{
			// DropDown (base) automatically closes drop down in Single Selection Mode, but we
			// always want it to close drop down when using ListView to select data from a search query.
			// ListView is only used to select data from search results - TreeView is used to display
			// all data, no matter if it is received in a flat list or a hierarchy.
			if (item.Selected === true) // Only close when a selection is made - removing an item keeps drop down open
				me.CloseDropDown();
		});

		// Create TreeView

		tree = new Fit.Controls.WSTreeView(ctlId + "__WSTreeView");
		tree.Selectable(true); // Make nodes selectable by default when added
		tree.Width(100, "%");
		//tree.Lines(true); // DISABLED - lines do not scale with font size
		//tree.AllowDeselect(true); // DISABLED - AllowDeselect is True by default
		tree.OnRequest(function(sender, eventArgs)
		{
			if (fireEventHandlers(onRequestHandlers, tree, eventArgs) === false)
			{
				return false;
			}

			dataRequested = true;
			requestCount++;

			if (dataLoading === true)
			{
				cmdOpen.className = "fa fa-refresh fa-spin";
			}
		});
		tree.OnResponse(function(sender, eventArgs)
		{
			requestCount--;

			fireEventHandlers(onResponseHandlers, tree, eventArgs);

			if (requestCount === 0)
			{
				cmdOpen.className = classes;

				// Make sure to fire internal OnDataLoaded event in case a WebService operation
				// was invoked on DropDown while WSTreeView was loading data, e.g. triggered by
				// a user interaction such as expanding a node.
				// DropDown takes care of firing internal event OnDataLoaded if dataLoading is True,
				// in which case DropDown triggered the initial WebService operation and knows when
				// it has finished.
				if (dataLoading === false)
				{
					fireOnDataLoaded();
				}
			}
		});
		tree.OnAbort(function(sender, eventArgs)
		{
			requestCount--;
			
			fireEventHandlers(onAbortHandlers, tree, eventArgs);
			
			if (requestCount === 0)
			{
				cmdOpen.className = classes;

				if (dataLoading === false) // See comment to related code in OnResponse handler above
				{
					fireOnDataLoaded();
				}
			}
		});
		tree.OnPopulated(function(sender, eventArgs)
		{
			if (hideLinesForFlatData === true && tree.Lines() === true) // Lines are off by default but might have been enabled like so: dd.GetTreeView().Lines(true)
			{
				// Disable helper lines if no children are contained

				var hasChildren = false;

				Fit.Array.ForEach(tree.GetChildren(), function(c)
				{
					if (c.GetChildren().length > 0)
					{
						hasChildren = true;
						return false;
					}
				});

				if (hasChildren === false)
				{
					tree.Lines(false);
					//tree.GetDomElement().style.marginLeft = "-2em";
				}

				hideLinesForFlatData = false;
			}

			// Scroll selected item into view in Single Selection Mode.
			// NOTICE: DropDown also calls RevealItemInView(..) when
			// dropdown is opened. But for WSDropDown there are (most often)
			// no nodes initially, so we make sure to call RevealItemInView(..)
			// below when root nodes have been loaded and populated.
			// We only want to do this for root nodes - otherwise the selected
			// item would constantly be scrolled into view while user expand nodes
			// with remote children.
			// This works even for nested items if they are returned in the initial
			// call for root nodes. It will not work if nodes are loaded programmatically
			// using e.g. WSDropDown.AutoUpdateSelected() or WSTreeView.ExpandAll() though,
			// if the selected item is returned in a secondary request for remote children.
			// To support this scenario we would need to carry information about whether
			// the request was made programmatically or triggered via a user interaction,
			// which would complicate things, so for now we are satisfied with the current
			// implementation.

			if (eventArgs.Node === null && me.MultiSelectionMode() === false && me.GetSelections().length === 1)
			{
				tree.RevealItemInView(me.GetSelections()[0].Value);
			}
		});
		tree.OnSelectAll(function(sender, eventArgs)
		{
			// Make sure focus is lost when SelectAll is invoked. Otherwise control will
			// reassign focus every time an item is added which is very expensive performance wise.
			// DISABLED: This is simply to annoying for the user as dropdown closes when Focused(false) is called.
			// Also, due to the implementation of DropDown.Focused(..), it only closes when control has focus
			// which it won't have if SelectAll is triggered using e.g. a ContextMenu, since the ContextMenu becomes
			// focused when clicked. So the inconsistency is also annoying. Furthermore automatically closing or
			// changing focus takes away control from the developer implementing the SelectAll behaviour.
			//me.Focused(false);

			// NOTICE: Selecting thousands of nodes using SelectAll may result in very poor performance
			// due to the large amount of DOM manipulation. Both the TreeView and DropDown goes through a full
			// state change for every single item being selected or deselected, so all events fire and reflows are
			// triggered for visible items.
			// To increase performance, temporarily hide TreeView and/or DropDown with display:none while SelectAll
			// is being performed. Switching to TextSelectionMode may also increase performance significantly.

			// Make sure TreeView is the active picker to have changes synchronized with
			// drop down control (in case SelectAll is triggered programmatically).
			if (me.GetPicker() !== tree)
				me.SetPicker(tree);
		});

		me.OnOpen(function()
		{
			if (suppressTreeOnOpen === true)
			{
				suppressTreeOnOpen = false;
				return;
			}

			me.SetPicker(tree);
			ensureTreeViewData();
		});
	}

	// ============================================
	// Public
	// ============================================

	/// <function container="Fit.Controls.WSDropDown" name="AutoUpdateSelected" access="public">
	/// 	<description>
	/// 		Automatically update title of selected items based on data from WebService.
	/// 		Contrary to UpdateSelected(), AutoUpdateSelected() automatically loads all
	/// 		data from the associated WebService before updating the selected items, but
	/// 		only if one or more items are selected.
	/// 		The callback function is invoked when selected items have been updated.
	/// 		The following arguments are passed to function:
	/// 		 - Sender (WSDropDown)
	/// 		 - An array of updated items, each with a Title (string), Value (string), and Exists (boolean) property.
	/// 		Notice that items that no longer exists in picker's data, will NOT automatically be removed.
	/// 		To obtain all items with the most current state (both updated and unmodified selections), use;
	/// 		dropdown.AutoUpdateSelected(function(sender, updated) { console.log(&quot;All selected&quot;, dropdown.GetSelections()); });
	/// 		For additiona details see UpdateSelected().
	/// 	</description>
	/// 	<param name="cb" type="function" default="undefined">
	/// 		Optional callback function invoked when selected items have been updated
	/// 	</param>
	/// </function>
	this.AutoUpdateSelected = function(cb)
	{
		Fit.Validation.ExpectFunction(cb, true);

		if (me.GetSelections().length === 0) // Do not request data if no selections are made to be updated
		{
			if (Fit.Validation.IsSet(cb) === true)
			{
				cb(me, []);
			}

			return;
		}

		if (requestCount > 0)
		{
			// Data is currently loading - postpone by adding request to process queue
			onDataLoaded(function() { me.AutoUpdateSelected(cb); });
			return;
		}

		if (autoUpdatedSelections !== null)
		{
			if (Fit.Validation.IsSet(cb) === true)
			{
				cb(me, Fit.Core.Clone(autoUpdatedSelections)); // Clone to prevent changes to internal array and its data
			}

			return;
		}

		dataLoading = true;

		var ensure = function()
		{
			tree.EnsureData(function(sender)
			{
				// Ensure all nodes in case only a subset is returned
				// when requesting root nodes via tree.Reload(..)

				// Picker must be set when calling UpdateSelected() on
				// DropDown from which WSDropDown inherits. Selected items
				// are updated based on data loaded by the picker control.
				me.SetPicker(tree);

				autoUpdatedSelections = me.UpdateSelected();

				dataLoading = false;

				if (Fit.Validation.IsSet(cb) === true)
				{
					cb(me, Fit.Core.Clone(autoUpdatedSelections)); // Clone to prevent changes to internal array and its data
				}

				fireOnDataLoaded();
			});
		}

		if (dataRequested === false)
		{
			// Notice that dataRequested may have been set to False in ClearData(..), which is why
			// we first call Reload to fetch initial data, since it also discards any existing nodes.

			tree.Reload(true, function(sender)
			{
				ensure(); // Get remaining nodes in case WebService did not return the entire hierarchy at once (Progressive Mode)
			});
		}
		else
		{
			// Some data has already been loaded - make sure we get the rest
			ensure();
		}
	}

	/// <function container="Fit.Controls.WSDropDown" name="Url" access="public" returns="string">
	/// 	<description>
	/// 		Get/set URL to WebService responsible for providing data to drop down.
	/// 		WebService must deliver data in the following JSON format:
	/// 		[
	/// 			&#160;&#160;&#160;&#160; { Title: "Test 1", Value: "1001", Selectable: true, Selected: true, Children: [] },
	/// 			&#160;&#160;&#160;&#160; { Title: "Test 2", Value: "1002", Selectable: false, Selected: false, Children: [] }
	/// 		]
	/// 		Only Value is required. Children is a collection of nodes with the same format as described above.
	/// 		HasChildren:boolean may be set to indicate that children are available server side and that WebService
	/// 		should be called to load these children when the given node is expanded.
	/// 	</description>
	/// 	<param name="wsUrl" type="string" default="undefined"> If defined, updates WebService URL (e.g. http://server/ws/data.asxm/GetData) </param>
	/// </function>
	this.Url = function(wsUrl)
	{
		Fit.Validation.ExpectString(wsUrl, true);

		if (Fit.Validation.IsSet(wsUrl) === true)
		{
			list.Url(wsUrl);
			tree.Url(wsUrl);
		}

		return list.Url();
	}

	/// <function container="Fit.Controls.WSDropDown" name="JsonpCallback" access="public" returns="string">
	/// 	<description>
	/// 		Get/set name of JSONP callback argument. Assigning a value will enable JSONP communication.
	/// 		Often this argument is simply &quot;callback&quot;. Passing Null disables JSONP communication again.
	/// 	</description>
	/// 	<param name="val" type="string" default="undefined"> If defined, enables JSONP and updates JSONP callback argument </param>
	/// </function>
	this.JsonpCallback = function(val)
	{
		Fit.Validation.ExpectString(val, true);

		if (Fit.Validation.IsSet(val) === true || val === null)
		{
			list.JsonpCallback(val);
			tree.JsonpCallback(val);
		}

		return list.JsonpCallback();
	}

	/// <function container="Fit.Controls.WSDropDown" name="ClearData" access="public">
	/// 	<description>
	/// 		Call this function to make control reload data when needed,
	/// 		ensuring that the user will see the most recent values available.
	/// 		Operation may be postponed if data is currently loading from WebService.
	/// 		Use callback to pick up execution once data has been cleared.
	/// 		Sender (Fit.Controls.WSDropDown) is passed to callback as an argument.
	/// 	</description>
	/// 	<param name="cb" type="function" default="undefined">
	/// 		If defined, callback is invoked when data is cleared
	/// 	</param>
	/// </function>
	this.ClearData = function(cb)
	{
		Fit.Validation.ExpectFunction(cb, true);
		
		// Postpone if WebService operation is currently running

		if (requestCount > 0)
		{
			// Data is currently loading - postpone by adding request to process queue
			onDataLoaded(function() { me.ClearData(cb); });
			return;
		}

		// Clear data/cache/state

		hideLinesForFlatData = true;	// Make TreeView hide helper lines if nodes received have no children	
		dataRequested = false;			// Make data in TreeView reload via ensureTreeViewData() when DropDown is opened
		autoUpdatedSelections = null;	// Remove cached result from AutoUpdateSelected(..) used when multiple calls to the function is made

		// Cancel pending search operation if scheduled
		
		cancelSearch();

		// Invoke callback

		if (Fit.Validation.IsSet(cb) === true)
		{
			cb(me);
		}

		// Immediately load TreeView data if DropDown is open and TreeView is active picker

		if (me.IsDropDownOpen() === true && me.GetPicker() === tree)
		{
			ensureTreeViewData(); // Will not load anything if callback above triggered data load, e.g. by calling AutoUpdateSelected(..)
		}
	}

	/// <function container="Fit.Controls.WSDropDown" name="MultiSelectionMode" access="public" returns="boolean">
	/// 	<description> Get/set value indicating whether control allows for multiple selections simultaneously </description>
	/// 	<param name="val" type="boolean" default="undefined"> If defined, True enables support for multiple selections, False disables it </param>
	/// </function>
	this.MultiSelectionMode = Fit.Core.CreateOverride(this.MultiSelectionMode, function(val)
	{
		Fit.Validation.ExpectBoolean(val, true);

		if (Fit.Validation.IsSet(val) === true)
		{
			tree.Selectable(true, val);
		}

		return base(val);
	});


	/// <function container="Fit.Controls.WSDropDown" name="GetListView" access="public" returns="Fit.Controls.WSListView">
	/// 	<description> Get WSListView control used to display data in a flat list view </description>
	/// </function>
	this.GetListView = function()
	{
		return list;
	}

	/// <function container="Fit.Controls.WSDropDown" name="GetTreeView" access="public" returns="Fit.Controls.WSTreeView">
	/// 	<description> Get WSTreeView control used to display data in a hierarchical tree view </description>
	/// </function>
	this.GetTreeView = function()
	{
		return tree;
	}

	// See documentation on ControlBase
	this.Dispose = Fit.Core.CreateOverride(this.Dispose, function()
	{
		me.SetPicker(null);

		list.Destroy();
		tree.Destroy();

		me = list = tree = search = forceNewSearch = hideLinesForFlatData = dataRequested = dataLoading = requestCount = onDataLoadedCallback = suppressTreeOnOpen = timeOut = currentRequest = classes = autoUpdatedSelections = onRequestHandlers = onResponseHandlers = null;

		base();
	});

	// ============================================
	// Events
	// ============================================

	/// <function container="Fit.Controls.WSDropDown" name="OnRequest" access="public">
	/// 	<description>
	/// 		Add event handler fired when data is being requested.
	/// 		Request can be canceled by returning False.
	/// 		Function receives two arguments:
	/// 		Sender (Fit.Controls.WSDropDown) and EventArgs object.
	/// 		EventArgs object contains the following properties:
	/// 		 - Sender: Fit.Controls.WSDropDown instance
	/// 		 - Picker: Picker causing WebService data request (WSTreeView or WSListView instance)
	/// 		 - Node: Fit.Controls.TreeViewNode instance if requesting TreeView children, Null if requesting root nodes
	/// 		 - Search: Search value if entered by user
	/// 		 - Request: Fit.Http.Request or Fit.Http.JsonRequest instance
	/// 	</description>
	/// 	<param name="cb" type="function"> Event handler function </param>
	/// </function>
	this.OnRequest = function(cb)
	{
		Fit.Validation.ExpectFunction(cb);
		Fit.Array.Add(onRequestHandlers, cb);
	}

	/// <function container="Fit.Controls.WSDropDown" name="OnResponse" access="public">
	/// 	<description>
	/// 		Add event handler fired when data is received,
	/// 		allowing for data transformation to occure before
	/// 		picker control is populated. Function receives two arguments:
	/// 		Sender (Fit.Controls.WSDropDown) and EventArgs object.
	/// 		EventArgs object contains the following properties:
	/// 		 - Sender: Fit.Controls.WSDropDown instance
	/// 		 - Picker: Picker causing WebService data request (WSTreeView or WSListView instance)
	/// 		 - Node: Fit.Controls.TreeViewNode instance if requesting TreeView children, Null if requesting root nodes
	/// 		 - Search: Search value if entered by user
	/// 		 - Data: JSON data received from WebService
	/// 		 - Request: Fit.Http.Request or Fit.Http.JsonRequest instance
	/// 	</description>
	/// 	<param name="cb" type="function"> Event handler function </param>
	/// </function>
	this.OnResponse = function(cb)
	{
		Fit.Validation.ExpectFunction(cb);
		Fit.Array.Add(onResponseHandlers, cb);
	}

	/// <function container="Fit.Controls.WSDropDown" name="OnAbort" access="public">
	/// 	<description>
	/// 		Add event handler fired if data request is canceled.
	/// 		Function receives two arguments:
	/// 		Sender (Fit.Controls.WSDropDown) and EventArgs object.
	/// 		EventArgs object contains the following properties:
	/// 		 - Sender: Fit.Controls.WSDropDown instance
	/// 		 - Picker: Picker causing WebService data request (WSTreeView or WSListView instance)
	/// 		 - Node: Fit.Controls.TreeViewNode instance if requesting TreeView children, Null if requesting root nodes
	/// 		 - Search: Search value if entered by user
	/// 		 - Data: JSON data received from WebService (Null in this particular case)
	/// 		 - Request: Fit.Http.Request or Fit.Http.JsonRequest instance
	/// 	</description>
	/// 	<param name="cb" type="function"> Event handler function </param>
	/// </function>
	this.OnAbort = function(cb)
	{
		Fit.Validation.ExpectFunction(cb);
		Fit.Array.Add(onAbortHandlers, cb);
	}

	/*this.OnPopulated = function(cb)
	{
		Fit.Validation.ExpectFunction(cb);
		Fit.Array.Add(onPopulatedHandlers, cb);
	}*/

	// ============================================
	// Private
	// ============================================

	function ensureTreeViewData(/*cb*/)
	{
		//Fit.Validation.ExpectFunction(cb, true);

		if (dataRequested === false)
		{
			dataLoading = true;

			tree.Reload(true, function(sender)
			{
				dataLoading = false;

				/*if (Fit.Validation.IsSet(cb) === true)
				{
					cb(me);
				}*/

				fireOnDataLoaded();
			});
		}
	}

	function searchData(value)
	{
		// Abort time responsible for starting search request X milliseconds after user stops typing

		cancelSearch();

		// Schedule new search request if a WebService request is already in progress

		if (currentRequest !== null)
		{
			forceNewSearch = true;
			return;
		}

		// Schedule search to run X milliseconds after user stops typing

		// Search value is passed to WSDropDown event handler using EventArgs object. External code
		// is responsible for exposing it to the backend, which in turn must return matching items.
		search = value;

		if (search !== "")
		{
			list.RemoveItems(); // Remove data from previous search
			me.SetPicker(list);

			timeOut = setTimeout(function()
			{
				if (me.IsDropDownOpen() === false)
				{
					suppressTreeOnOpen = true; // Drop Down changes picker to TreeView when OnOpen fires - prevent this from happening
					me.OpenDropDown();
				}

				list.Reload();

				timeOut = null;
			}, 500);
		}
	}

	function cancelSearch()
	{
		if (timeOut !== null)
		{
			clearTimeout(timeOut);
			timeOut = null;
		}
	}

	function onDataLoaded(cb)
	{
		Fit.Validation.ExpectFunction(cb);
		Fit.Array.Add(onDataLoadedCallback, cb);
	}

	function fireOnDataLoaded()
	{
		// Copied from WSTreeView.
		// Immediately clear collection. If multiple callbacks are registered,
		// chances are that only the first will run, and the remaining will be
		// re-scheduled again - so we need the collection to be cleared before
		// invoking callbacks.
		var orgOnDataLoadedCallback = onDataLoadedCallback;
		onDataLoadedCallback = [];

		Fit.Array.ForEach(orgOnDataLoadedCallback, function(cb)
		{
			cb();
		});
	}

	function fireEventHandlers(handlers, picker, eventArgs)
	{
		var cancel = false;

		Fit.Array.ForEach(handlers, function(cb)
		{
			var data = null; // Remains Null for OnAbort event (no Children or Items provided)
			var searchValue = Fit.Core.InstanceOf(picker, Fit.Controls.WSListView) === true ? search : "";

			if (eventArgs.Children) // WSTreeView
			{
				data = eventArgs.Children;
			}
			else if (eventArgs.Items) // WSListView
			{
				data = eventArgs.Items;
			}

			var newArgs = { Sender: me, Picker: picker, Node: (eventArgs.Node ? eventArgs.Node : null), SelectAll: eventArgs.SelectAll, Search: searchValue, Data: data, Request: eventArgs.Request };

			if (cb(me, newArgs) === false)
				cancel = true; // Do not cancel loop though - all handlers must be fired!

			// Assign data back to eventArgs, in case a new array instance was created
			if (eventArgs.Children) // WSTreeView
				eventArgs.Children = newArgs.Data;
			else if (eventArgs.Items) // WSListView
				eventArgs.Items = newArgs.Data;
			
			if (newArgs.Request !== eventArgs.Request)
			{
				// Support for changing request instans to
				// take control over webservice communication.

				// Restrict to support for Fit.Http.Request or classes derived from this
				Fit.Validation.ExpectInstance(newArgs.Request, Fit.Http.Request);

				eventArgs.Request = newArgs.Request;
			}
		});

		return !cancel;
	}

	init();
}

;(function()
{
	var locale = {
		// Primary locales must be registered before country specific overrides.
		// Example order: en, en_US, en_GB, de, de_AT, etc.
		// All locales inherit from en. All country specific overrides inherit
		// from their primary locale (e.g. de_AT inherits from de).
		// English (en) MUST be defined!
		
		"en": // US
		{
			Translations:
			{
				InvalidSelection		: "Invalid selection"
			}
		},
		"da":
		{
			Translations:
			{
				InvalidSelection		: "Ugyldigt valg"
			}
		},
		"de":
		{
			Translations:
			{
				InvalidSelection		: "Ungültige Auswahl"
			}
		}
	}
	Fit.Internationalization.AddLocalization(Fit.Controls.DropDown, locale);
	Fit.Internationalization.AddLocalization(Fit.Controls.WSDropDown, locale);	
})();
/// <container name="Fit.Controls.FilePicker" extends="Fit.Controls.ControlBase">
/// 	Control allowing for files to be selected locally and uploaded asynchronously.
/// 	Extending from Fit.Controls.ControlBase.
/// </container>

// http://fiddle.jshell.net/gho7Lmno/84/

/// <function container="Fit.Controls.FilePicker" name="FilePicker" access="public">
/// 	<description> Create instance of FilePicker control </description>
/// 	<param name="ctlId" type="string" default="undefined"> Unique control ID that can be used to access control using Fit.Controls.Find(..) </param>
/// </function>
Fit.Controls.FilePicker = function(ctlId)
{
	Fit.Validation.ExpectStringValue(ctlId, true);
	Fit.Core.Extend(this, Fit.Controls.ControlBase).Apply(ctlId);

	var me = this;
	var button = null;
	var buttonTitleEnforced = null;
	var input = null;
	var width = { Value: -1, Unit: "px" }; // Differs from default value on ControlBase which is 200px - here a value of -1 indicates width:auto
	var url = null;
	var files = [];
	var autoUpload = false;

	// Legacy control
	var inputs = []; // Contains input controls when legacy mode is enabled (IE9 and older)
	var inputsByFileId = {};
	
	var dropZoneLabel = null;
	var dropZoneLabelEnforced = null;
	var dropZoneContainer = null;

	var onUploadHandlers = [];
	var onProgressHandlers = [];
	var onSuccessHandlers = [];
	var onFailureHandlers = [];
	var onCompletedHandlers = [];
	//var onAbortHandlers = [];

	function init()
	{
		createUploadField();

		if (inputs.length === 0) // Modern control
		{
			button = new Fit.Controls.Button("Button" + me.GetId());
			button.Icon("upload"); // files-o
			button.OnClick(function(sender) { input.click(); }); // Make sure Enter/Spacebar opens file dialog

			// Add file picker to button
			Fit.Dom.Add(button.GetDomElement(), input);
			me._internal.AddDomElement(button.GetDomElement());
		}

		me.AddCssClass("FitUiControlFilePicker");
		me.Width(-1); // Set width:auto - ControlBase uses width:200px by default
		me.Enabled(true);

		me._internal.Data("legacy", (inputs.length > 0).toString());
		me._internal.Data("dropzone", "false");

		Fit.Internationalization.OnLocaleChanged(localize);
		localize();
	}

	function createUploadField()
	{
		var inp = document.createElement("input");
		inp.type = "file";
		inp.onchange = function(e) // e may be null if called programmatically from FilePicker.Clear()
		{
			// The modern control clears any previously selected files when a new selection is made.
			// The legacy control consists of multiple single picker controls, so it has to keep
			// previously selected files. This adds a bit more complexity to the legacy control since
			// we need to preserve some state information between every time OnChange is fired
			// and if Upload is called multiple times.

			if (inputs.length === 0) // Modern control
			{
				setValueFromFilesList(inp.files); // Also triggers OnChange and performs postback if AutoUpload is true
			}
			else // Legacy control
			{
				files = [];
				inputsByFileId = {};

				// Add selected files to internal collection

				Fit.Array.ForEach(Fit.Array.Copy(inputs), function(i)
				{
					// Remove empty input fields

					if (i.value === "")
					{
						if (me.MultiSelectionMode() === true) // Remove empty upload controls in Multi Selection Mode
						{
							Fit.Dom.Remove(i);
							Fit.Array.Remove(inputs, i);
						}

						return; // Skip file picker, no file selected
					}

					// file has been selected, create file information object

					var file = null;

					// Some files may have been uploaded earlier (e.g. if AutoUpload is enabled or if user
					// selects 3 files, triggers upload, selects another 5 files, and triggers upload again).
					// Make sure file information is preserved for files already processed.

					if (me.MultiSelectionMode() === true && i._file !== undefined && i._file.Processed === true)
					{
						file = i._file;
					}
					else
					{
						file = createFileInfo(i.value.replace(/^C:\\fakepath\\/, ""), "Unknown", -1, null);
					}

					i._file = file;

					// Add file information

					Fit.Array.Add(files, file);
					inputsByFileId[file.Id] = i;
				});

				// Make sure an empty upload control is always available in Multi Selection Mode, allowing for another file to be added
				if (me.MultiSelectionMode() === true)
					createUploadField();
				
				me._internal.FireOnChange();

				if (me.AutoUpload() === true)
					me.Upload();
			}
		}

		if (inp.files && !Fit.Controls.FilePicker.ForceLegacyMode) // Modern control
		{
			input = inp;
			input.tabIndex = -1;

			Fit.Events.AddHandler(input, "click", function(e)
			{
				// Do not trigger OnClick on button containing file picker.
				// It will cause file picker to open file dialog twice.
				Fit.Events.StopPropagation(e);
			});
		}
		else // Legacy control
		{
			inp.name = "SelectedFile";

			Fit.Array.Add(inputs, inp);
			me._internal.AddDomElement(inp);
		}
	}

	function setValueFromFilesList(fileList)
	{
		Fit.Validation.ExpectInstance(fileList, FileList);

		// Add selected files to internal collection

		files = [];
		Fit.Array.ForEach(fileList, function(file)
		{
			Fit.Array.Add(files, createFileInfo(file.name, file.type, file.size, file));

			// Dropzone always allow for multiple files to be dropped - handle Single Selection Mode here
			if (me.MultiSelectionMode() === false)
				return false; // Break loop
		});

		// Fire OnChange and trigger upload if configured to upload automatically

		me._internal.FireOnChange();

		if (me.AutoUpload() === true)
			me.Upload();
	}

	// ============================================
	// Public - overrides
	// ============================================

	// See documentation on ControlBase
	this.Focused = function(focus)
	{
		Fit.Validation.ExpectBoolean(focus, true);

		if (Fit.Validation.IsSet(focus) === true)
		{
			if (inputs.length === 0) // Modern control
			{
				if (focus === true)
					input.focus();
				else
					input.blur();
			}
			else // Legacy control
			{
				if (focus === true)
					inputs[0].focus();
				else
					inputs[0].blur();
			}
		}

		return (Fit.Dom.GetFocused() === input);
	}

	// See documentation on ControlBase
	this.Value = function(val)
	{
		Fit.Validation.ExpectString(val, true);

		if (Fit.Validation.IsSet(val) === true)
		{
			Fit.Validation.ThrowError("SecurityError: Due to security restrictions, the value of an upload control cannot be set");
		}

		var strFiles = "";

		Fit.Array.ForEach(files, function(file)
		{
			strFiles += ((strFiles !== "") ? ";" : "") + file.Filename;
		});

		return strFiles;
	}

	// See documentation on ControlBase
	this.IsDirty = function()
	{
		return (files.length > 0);
	}

	// See documentation on ControlBase
	this.Clear = function()
	{
		if (files.length === 0)
			return;

		if (inputs.length === 0) // Modern control
		{
			input.value = "";
			input.onchange(null);
		}
		else // Legacy control
		{
			// Remove all file pickers in Legacy Mode - clearing them is not possible in Legacy IE
			Fit.Array.ForEach(Fit.Array.Copy(inputs), function(i)
			{
				Fit.Dom.Remove(i);
				Fit.Array.Remove(inputs, i);
			});

			createUploadField();
			inputs[0].onchange(null);
		}
	}

	// See documentation on ControlBase
	this.Dispose = Fit.Core.CreateOverride(this.Dispose, function()
	{
		// This will destroy control - it will no longer work!

		Fit.Internationalization.RemoveOnLocaleChanged(localize);

		if (button !== null) // Modern control
		{
			button.Dispose();
		}

		me = button = buttonTitleEnforced = input = width = url = files = autoUpload = inputs = inputsByFileId = dropZoneLabel = dropZoneLabelEnforced = dropZoneContainer = onUploadHandlers = onProgressHandlers = onSuccessHandlers = onFailureHandlers = onCompletedHandlers = null; // onAbortHandlers
		base();
	});

	/// <function container="Fit.Controls.FilePicker" name="Width" access="public" returns="object">
	/// 	<description>
	/// 		Fit.Controls.ControlBase.Width override:
	/// 		Get/set control width - returns object with Value and Unit properties.
	/// 		This implementation differs from ControlBase.Width as passing a value of -1 resets
	/// 		the control width to fit its content, rather than assuming a fixed default width.
	/// 	</description>
	/// 	<param name="val" type="number" default="undefined"> If defined, control width is updated to specified value. A value of -1 resets control width. </param>
	/// 	<param name="unit" type="string" default="px"> If defined, control width is updated to specified CSS unit </param>
	/// </function>
	this.Width = Fit.Core.CreateOverride(this.Width, function(val, unit)
	{
		Fit.Validation.ExpectNumber(val, true);
		Fit.Validation.ExpectStringValue(unit, true);

		if (Fit.Validation.IsSet(val) === true)
		{
			if (val > -1) // Fixed width
			{
				width = base(val, unit);

				if (inputs.length === 0 && me.ShowDropZone() === false)
					button.Width(100, "%");
			}
			else // Adjust width to content size
			{
				width = { Value: -1, Unit: "px" }; // Any changes to this line must be dublicated to line declaring the width variable !
				me.GetDomElement().style.width = "auto";

				if (inputs.length === 0 && me.ShowDropZone() === false)
					button.Width(-1);
			}
		}

		return width;
	});

	// See documentation on ControlBase
	this.Height = Fit.Core.CreateOverride(this.Height, function(val, unit)
	{
		Fit.Validation.ExpectNumber(val, true);
		Fit.Validation.ExpectStringValue(unit, true);

		if (Fit.Validation.IsSet(val) === true && inputs.length === 0) // Modern control - not supported in Legacy Mode
		{
			base(val, unit);

			if (me.ShowDropZone() === false)
			{
				if (val > -1) // Fixed height
					button.Height(100, "%");
				else // Adjust height to content size
					button.Height(-1);
			}
		}

		return base();
	});

	// ============================================
	// Public
	// ============================================

	/// <function container="Fit.Controls.FilePicker" name="Url" access="public" returns="string">
	/// 	<description>
	/// 		Get/set URL to which files are uploaded when FilePicker.Upload() is called.
	/// 		Multiple files will be uploaded using POST over individual HTTP connections,
	/// 		and each file will be accessible from the POST data collection using the SelectedFile key.
	/// 	</description>
	/// 	<param name="url" type="string" default="undefined"> If defined, upload URL is set to specified value </param>
	/// </function>
	this.Url = function(val)
	{
		Fit.Validation.ExpectStringValue(val, true)

		if (Fit.Validation.IsSet(val) === true)
		{
			url = val;
		}

		return url;
	}

	/// <function container="Fit.Controls.FilePicker" name="ButtonText" access="public" returns="string">
	/// 	<description> Get/set button text </description>
	/// 	<param name="val" type="string" default="undefined"> If defined, button text is set to specified value </param>
	/// </function>
	this.ButtonText = function(val)
	{
		Fit.Validation.ExpectString(val, true)

		if (Fit.Validation.IsSet(val) === true)
		{
			buttonTitleEnforced = val;

			if (button !== null) // Modern control
			{
				button.Title(val);
				Fit.Dom.Add(button.GetDomElement(), input);
			}
		}

		return (button !== null ? button.Title() : buttonTitleEnforced || ""); // Button is null in legacy mode
	}
	
	// DEPRECATED
	this.Title = function(val)
	{
		Fit.Browser.LogDeprecated("Use of deprecated function Title(..) on instance of Fit.Controls.FilePicker - please use ButtonText(..) instead");
		return me.ButtonText(val);
	}

	/// <function container="Fit.Controls.FilePicker" name="DropZoneText" access="public" returns="string">
	/// 	<description> Get/set drop zone text </description>
	/// 	<param name="val" type="string" default="undefined"> If defined, drop zone text is set to specified value </param>
	/// </function>
	this.DropZoneText = function(val)
	{
		Fit.Validation.ExpectString(val, true)

		if (Fit.Validation.IsSet(val) === true)
		{
			dropZoneLabelEnforced = val;

			if (dropZoneLabel !== null)
				dropZoneLabel.innerHTML = val;
		}

		return (dropZoneLabel !== null ? dropZoneLabel.innerHTML : dropZoneLabelEnforced || "");
	}

	/// <function container="Fit.Controls.FilePicker" name="GetFiles" access="public" returns="object[]">
	/// 	<description>
	/// 		Get collection of selected files. Each file is represented as an object with the following members:
	/// 		 - Filename:string (Name of selected file)
	/// 		 - Type:string (Mime type for selected file)
	/// 		 - Size:integer (File size in bytes)
	/// 		 - Id:string (Unique file ID)
	/// 		 - Processed:boolean (Flag indicating whether file has been uploaded, or is currently being uploaded)
	/// 		 - FileObject:File (Native JS File object representing selected file)
	/// 		 - GetImagePreview:function (Returns an HTMLImageElement with a preview for supported file types)
	/// 		NOTICE: The following properties/functions are not available in Legacy Mode: Type, Size, FileObject, GetImagePreview().
	/// 	</description>
	/// </function>
	this.GetFiles = function()
	{
		return files;
	}

	/// <function container="Fit.Controls.FilePicker" name="MultiSelectionMode" access="public" returns="boolean">
	/// 	<description> Get/set flag indicating whether control allows for multiple selections </description>
	/// 	<param name="val" type="boolean" default="undefined"> If defined, True enables multi selection mode, False disables it </param>
	/// </function>
	this.MultiSelectionMode = function(val)
	{
		Fit.Validation.ExpectBoolean(val, true)

		if (Fit.Validation.IsSet(val) === true)
		{
			if (inputs.length === 0) // Modern control
			{
				if (val === true && me.MultiSelectionMode() === false)
				{
					input.multiple = "multiple";
				}
				else if (val === false && me.MultiSelectionMode() === true)
				{
					if (files.length > 1)
						me.Clear();

					input.multiple = "";
				}
			}
			else // Legacy control
			{
				me.Clear();
			}

			me._internal.Data("multiple", val.toString());
			
			localize();
		}

		return (me._internal.Data("multiple") === "true");
	}

	/// <function container="Fit.Controls.FilePicker" name="Enabled" access="public" returns="boolean">
	/// 	<description> Get/set value indicating whether control is enabled or not </description>
	/// 	<param name="val" type="boolean" default="undefined"> If specified, True enables control, False disables it </param>
	/// </function>
	this.Enabled = function(val)
	{
		Fit.Validation.ExpectBoolean(val, true);

		if (Fit.Validation.IsSet(val) === true)
		{
			me._internal.Data("enabled", val.toString());

			if (inputs.length === 0) // Modern control
			{
				input.disabled = !val;
				button.Enabled(val);
			}
			else // Legacy control
			{
				Fit.Array.ForEach(inputs, function(inp)
				{
					inp.disabled = !val;

					if (me.MultiSelectionMode() === true && val === true && inp._file !== undefined && inp._file.Processed === true) // Input controls previously uploaded should remain disabled
						inp.disabled = true;
				})
			}
		}

		return (me._internal.Data("enabled") === "true");
	}

	/// <function container="Fit.Controls.FilePicker" name="ShowDropZone" access="public" returns="boolean">
	/// 	<description> Get/set value indicating whether control is displayed as a drop zone on supported browsers or not </description>
	/// 	<param name="val" type="boolean" default="undefined"> If specified, True enables drop zone, False disables it (default) </param>
	/// </function>
	this.ShowDropZone = function(val)
	{
		Fit.Validation.ExpectBoolean(val, true);

		if (Fit.Validation.IsSet(val) === true && inputs.length === 0) // Only available for modern control
		{
			if (val === true && dropZoneLabel === null)
			{
				dropZoneLabel = Fit.Dom.CreateElement("<div></div>");
				dropZoneContainer = Fit.Dom.CreateElement("<div></div>");
				
				/*me.GetDomElement().ondragenter = function(e)
				{
					me._internal.Data("dropping", "true");
				}*/

				me.GetDomElement().ondragleave = function(e)
				{
					me._internal.Data("dropping", "false");
				}

				// OnDragOver must be overridden and suppressed to avoid files being opened in browser when dropped
				me.GetDomElement().ondragover = function(e)
				{
					var ev = Fit.Events.GetEvent(e);
					Fit.Events.PreventDefault(ev); // Prevent files from opening in browser

					// OnDragEnter and OnDragLeave is not sufficient to update dropping state since user may enter dropzone (triggers OnDragEnter),
					// then hover button (triggers OnDragLeave), and then hover dropzone again which unfortunately doesn't trigger OnDragEnter again.
					me._internal.Data("dropping", "true");
				}

				me.GetDomElement().ondrop = function(e)
				{
					var ev = Fit.Events.GetEvent(e);
					Fit.Events.PreventDefault(ev); // Prevent files from opening in browser
					
					setValueFromFilesList(ev.dataTransfer.files); // Also triggers OnChange and performs postback if AutoUpload is true
					me._internal.Data("dropping", "false");
				}

				button.Width(-1);
				button.Height(-1);

				Fit.Dom.Add(dropZoneContainer, dropZoneLabel);
				Fit.Dom.Add(dropZoneContainer, button.GetDomElement());
				Fit.Dom.Add(me.GetDomElement(), dropZoneContainer);

				localize();

				me._internal.Data("dropping", "false");
				me._internal.Data("dropzone", "true");
			}
			else if (val === false && dropZoneLabel !== null)
			{
				//me.GetDomElement().ondragenter = null;
				me.GetDomElement().ondragleave = null;
				me.GetDomElement().ondragover = null;
				me.GetDomElement().ondrop = null;

				button.Width(me.Width().Value, me.Width().Unit);
				button.Height(me.Height().Value, me.Height().Unit);

				Fit.Dom.Remove(dropZoneContainer);
				Fit.Dom.Add(me.GetDomElement(), button.GetDomElement());

				dropZoneLabel = null;
				dropZoneContainer = null;

				me._internal.Data("dropping", null);
				me._internal.Data("dropzone", "false");
			}
		}

		return (dropZoneLabel !== null);
	}

	/// <function container="Fit.Controls.FilePicker" name="IsLegacyModeEnabled" access="public" returns="boolean">
	/// 	<description> Get value indicating whether control is in legacy mode (old fashion upload control) </description>
	/// </function>
	this.IsLegacyModeEnabled = function()
	{
		return (inputs.length > 0);
	}

	/// <function container="Fit.Controls.FilePicker" name="AutoUpload" access="public" returns="boolean">
	/// 	<description> Get/set value indicating whether control automatically starts upload process when files are selected </description>
	/// 	<param name="val" type="boolean" default="undefined"> If specified, True enables auto upload, False disables it (default) </param>
	/// </function>
	this.AutoUpload = function(val)
	{
		Fit.Validation.ExpectBoolean(val, true);

		if (Fit.Validation.IsSet(val) === true)
		{
			autoUpload = val;
		}

		return autoUpload;
	}

	/// <function container="Fit.Controls.FilePicker" name="Upload" access="public">
	/// 	<description>
	/// 		Upload selected files. Each file will be uploaded using POST over individual HTTP connections,
	/// 		and each file will be accessible from the POST data collection using the SelectedFile key.
	/// 		Use the OnProgress event to monitor the upload process, or use the OnCompleted event
	/// 		to be notified when all files have been fully processed.
	/// 	</description>
	/// 	<param name="skip" type="string[]" default="undefined">
	/// 		Optional argument allowing some of the selected files to be skipped during
	/// 		upload. The argument is a string array with the names of the files to skip.
	/// 	</param>
	/// </function>
	this.Upload = function(skip)
	{
		Fit.Validation.ExpectTypeArray(skip, Fit.Validation.ExpectStringValue, true);

		if (url === null)
			Fit.Validation.ThrowError("Unable to upload file(s), no URL has been specified");

		if (me.Enabled() === false) // Legacy control cannot upload data when disabled - this ensures consistency
			return;

		var filesToUpload = [];

		Fit.Array.ForEach(files, function(file)
		{
			if (Fit.Validation.IsSet(skip) === false || Fit.Array.Contains(skip, file.Filename) === false)
			{
				if (file.Processed === true) // Skip previously uploaded files
					return;

				Fit.Array.Add(filesToUpload, file);
			}
		});

		if (filesToUpload.length === 0)
			return;

		if (fireEvent(onUploadHandlers) === false)
			return;

		var completed = [];

		Fit.Array.ForEach(filesToUpload, function(file)
		{
			file.Processed = true;

			if (inputs.length === 0) // Modern control
			{
				var data = new FormData();
				data.append("SelectedFile", file.FileObject);

				var req = new XMLHttpRequest();
				Fit.Events.AddHandler(req.upload, "progress", function(e)
				{
					var ev = Fit.Events.GetEvent(e);
					fireEvent(onProgressHandlers, file, ((ev.loaded > 0 && ev.total > 0) ? Math.floor((ev.loaded / ev.total) * 100) : 0));
				});
				Fit.Events.AddHandler(req, "readystatechange", function(e)
				{
					// Using readystatechange rather than req.upload.onload (success) and req.upload.onerror (failure).
					// Server response is not available when req.upload.onload fires: Fit.Events.AddHandler(req.upload, "load", function(e) { /*..*/ });
					// OnError only fires when network communication fails (e.g. network unplugged or server process is restarted), not when an error
					// occur server side (500 Internal Server Error). Using readystatechange we can catch both communication and server errors.

					if (req.readyState === 4)
					{
						if (req.status === 200) // Success
						{
							file.ServerResponse = req.responseText;

							Fit.Array.Add(completed, file);
							fireEvent(onSuccessHandlers, file);
						}
						else // Failure
						{
							Fit.Array.Add(completed, file);
							fireEvent(onFailureHandlers, file);
						}

						if (completed.length === filesToUpload.length)
							fireEvent(onCompletedHandlers);
					}
				});
				/*Fit.Events.AddHandler(req.upload, "abort", function(e)
				{
					fireEvent(onAbortHandlers, file);
				});*/

				req.open("POST", url);
				req.send(data);
			}
			else // Legacy control
			{
				var enforcedOnModernBrowser = (Fit.Browser.GetInfo().Name !== "MSIE" || Fit.Browser.GetInfo().Version > 8);

				var picker = inputsByFileId[file.Id];

				var iFrame = null;
				var form = null;

				var progress = 0;
				var interval = null;

				// Create hidden iFrame used to upload current file asynchronously

				iFrame = document.createElement("iframe");
				iFrame.name = "iFrame" + Fit.Data.CreateGuid();
				iFrame.style.display = "none";

				if (enforcedOnModernBrowser === true)
				{
					// When Legacy Mode is enforced in modern browsers, the OnLoad handler MUST be registered
					// AFTER rooting iFrame in DOM, to prevent WebKit/Chrome from firing OnLoad multiple times.
					Fit.Dom.InsertAfter(picker, iFrame);
				}

				Fit.Events.AddHandler(iFrame, "load", function(e)
				{
					// Read server response

					try // Will throw an error if uploading to foreign domain, in which case ServerResponse will remain Null
					{
						file.ServerResponse = iFrame.contentDocument.body.innerHTML;
					}
					catch (err)
					{
						Fit.Browser.Log("Unable to read server response, most likely due to violation of Same-Origin Policy");
					}

					// Clean up

					Fit.Dom.Remove(iFrame);
					clearInterval(interval);

					// Fire events

					Fit.Array.Add(completed, file);

					fireEvent(onProgressHandlers, file, 100);
					fireEvent(onSuccessHandlers, file);

					if (completed.length === filesToUpload.length)
						fireEvent(onCompletedHandlers);
				});

				if (enforcedOnModernBrowser === false)
				{
					// On IE8 the OnLoad handler MUST be registered BEFORE
					// rooting iFrame in DOM, otherwise it will not be fired.
					Fit.Dom.InsertAfter(picker, iFrame);
				}

				// Create form used to upload current file - data is posted to hidden iFrame created above

				form = document.createElement("form");
				form.action = url;
				form.method = "POST";
				form.setAttribute("enctype", "multipart/form-data"); // Must be registered using setAttribute() for upload to work in IE8 //form.enctype="multipart/form-data";
				form.target = iFrame.name;

				// Add form to page, and file picker to form.
				// Having multiple forms on the same page might break apps expecting only one form element, so it is
				// immediately removed from page once submitted, and picker is returned to its prior location in the DOM.
				Fit.Dom.InsertAfter(picker, form);
				form.appendChild(picker);

				// Post data - start file upload
				form.submit();

				// Immediately remove form element after submit, as it might confuse apps expecting
				// only one form element on page. Picker is returned to its prior location in the DOM.
				Fit.Dom.InsertBefore(iFrame, picker);
				Fit.Dom.Remove(form);

				// Simulate progress in legacy mode which does not support the progress event

				interval = setInterval(function()
				{
					if (me === null)
					{
						// Control was disposed while uploading file
						clearInterval(interval);
						return;
					}

					progress = progress + 5;
					fireEvent(onProgressHandlers, file, progress);

					if (progress === 90) // Halt progress on 90% and wait for file to fully complete
						clearInterval(interval);

				}, 1000);

				if (me.MultiSelectionMode() === true)
					picker.disabled = true;
			}
		});
	}

	function localize()
	{
		if (inputs.length > 0)
			return; // Legacy mode - nothing to localize

		var locale = Fit.Internationalization.GetLocale(me);

		if (buttonTitleEnforced === null)
		{
			var buttonTitle = (me.MultiSelectionMode() === true ? locale.SelectFiles : locale.SelectFile);
			button.Title(buttonTitle);
		}

		if (dropZoneLabel !== null)
		{
			var dzText = (dropZoneLabelEnforced !== null ? dropZoneLabelEnforced : (me.MultiSelectionMode() === true ? locale.DropFiles : locale.DropFile));
			dropZoneLabel.innerHTML = dzText;
		}
	}

	function getImagePreview(file) // file is an instance of File (native JS object type) - returns Image instance if preview can be created, otherwise Null
	{
		if (inputs.length > 0)
			return null; // Legacy control

		if (file.type === "image/png" || file.type === "image/jpg" || file.type === "image/jpeg" || file.type === "image/svg" || file.type === "image/gif")
		{
			var img = new Image();

			setTimeout(function() // Postpone to allow external code to register an onload handler on the image, which should be registered before assigning image source (src)
			{
				var fr = new FileReader();
				fr.onload = function(e)
				{
					var ev = Fit.Events.GetEvent(e);
					img.src = ev.target.result;
				}
				fr.readAsDataURL(file);
			}, 0);

			return img;
		}

		return null;
	}

	function fireEvent(handlers, file, progress)
	{
		var canceled = false;

		Fit.Array.ForEach(handlers, function(cb)
		{
			if (Fit.Validation.IsSet(file) === true) // OnSuccess/OnFailure/OnProcess
			{
				var eventArgs = cloneFileInfo(file);
				eventArgs.Progress = 100;

				if (Fit.Validation.IsSet(progress) === true)
					eventArgs.Progress = progress;

				if (cb(me, eventArgs) === false)
					canceled = true;
			}
			else // OnUpload/OnCompleted
			{
				if (cb(me) === false)
					canceled = true;
			}
		});

		return !canceled;
	}

	function createFileInfo(filename, type, size, fileObject)
	{
		Fit.Validation.ExpectString(filename);
		Fit.Validation.ExpectString(type);
		Fit.Validation.ExpectNumber(size);
		Fit.Validation.ExpectInstance(fileObject, File, true);

		// IMPORTANT: Make sure changes to this object is also made to object returned by cloneFileInfo(..)
		return { Filename: filename, Type: type, Size: size, Id: Fit.Data.CreateGuid(), Processed: false, FileObject: fileObject || null, GetImagePreview: function() { return getImagePreview(fileObject); }, ServerResponse: null };
	}

	function cloneFileInfo(file) // Object as created by createFileInfo(..)
	{
		// We cannot use Fit.Core.Clone(..) since this is not a simple JSON object (DOM input field contained).
		// Also notice that the clone's Input and GetImagePreview properties are references (shared with original object).

		return { Filename: file.Filename, Type: file.Type, Size: file.Size, Id: file.Id, Processed: file.Processed, FileObject: file.FileObject, GetImagePreview: file.GetImagePreview, ServerResponse: file.ServerResponse };
	}

	// ============================================
	// Events
	// ============================================

	/// <function container="Fit.Controls.FilePicker" name="OnUpload" access="public">
	/// 	<description>
	/// 		Add event handler fired when upload is started.
	/// 		Operation can be canceled by returning False.
	/// 		Function receives one argument: Sender (Fit.Controls.FilePicker).
	/// 	</description>
	/// 	<param name="cb" type="function"> Event handler function </param>
	/// </function>
	this.OnUpload = function(cb)
	{
		Fit.Validation.ExpectFunction(cb);
		Fit.Array.Add(onUploadHandlers, cb);
	}

	/// <function container="Fit.Controls.FilePicker" name="OnProgress" access="public">
	/// 	<description>
	/// 		Add event handler fired when the upload process for a given file is progressing.
	/// 		Function receives two arguments:
	/// 		Sender (Fit.Controls.FlePicker) and EventArgs object.
	/// 		EventArgs object contains the following members:
	/// 		 - Filename:string (Name of given file)
	/// 		 - Type:string (Mime type for given file)
	/// 		 - Size:integer (File size in bytes)
	/// 		 - Id:string (Unique file ID)
	/// 		 - Processed:boolean (Flag indicating whether file has been uploaded, or is currently being uploaded)
	/// 		 - Progress:integer (A value from 0-100 indicating how many percent of the file has been uploaded)
	/// 		 - FileObject:File (Native JS File object representing given file)
	/// 		 - GetImagePreview:function (Returns an HTMLImageElement with a preview for supported file types)
	/// 		Be aware that Type and Size cannot be determined in Legacy Mode, and that FileObject in this
	/// 		case will be Null. GetImagePreview() will also return Null in Legacy Mode.
	/// 	</description>
	/// 	<param name="cb" type="function"> Event handler function </param>
	/// </function>
	this.OnProgress = function(cb)
	{
		Fit.Validation.ExpectFunction(cb);
		Fit.Array.Add(onProgressHandlers, cb);
	}

	/// <function container="Fit.Controls.FilePicker" name="OnSuccess" access="public">
	/// 	<description>
	/// 		Add event handler fired when a file has successfully been uploaded.
	/// 		Function receives two arguments:
	/// 		Sender (Fit.Controls.FlePicker) and EventArgs object.
	/// 		EventArgs object contains the following members:
	/// 		 - Filename:string (Name of given file)
	/// 		 - Type:string (Mime type for given file)
	/// 		 - Size:integer (File size in bytes)
	/// 		 - Id:string (Unique file ID)
	/// 		 - Processed:boolean (Flag indicating whether file has been uploaded, or is currently being uploaded)
	/// 		 - Progress:integer (A value from 0-100 indicating how many percent of the file has been uploaded)
	/// 		 - FileObject:File (Native JS File object representing given file)
	/// 		 - GetImagePreview:function (Returns an HTMLImageElement with a preview for supported file types)
	/// 		 - ServerResponse:string (Contains the response received from the server after a successful upload)
	/// 		Be aware that Type and Size cannot be determined in Legacy Mode, and that FileObject in this
	/// 		case will be Null. GetImagePreview() will also return Null in Legacy Mode.
	/// 	</description>
	/// 	<param name="cb" type="function"> Event handler function </param>
	/// </function>
	this.OnSuccess = function(cb)
	{
		Fit.Validation.ExpectFunction(cb);
		Fit.Array.Add(onSuccessHandlers, cb);
	}

	/// <function container="Fit.Controls.FilePicker" name="OnFailure" access="public">
	/// 	<description>
	/// 		Add event handler fired for a given file if the upload process failed.
	/// 		Function receives two arguments:
	/// 		Sender (Fit.Controls.FlePicker) and EventArgs object.
	/// 		EventArgs object contains the following members:
	/// 		 - Filename:string (Name of given file)
	/// 		 - Type:string (Mime type for given file)
	/// 		 - Size:integer (File size in bytes)
	/// 		 - Id:string (Unique file ID)
	/// 		 - Processed:boolean (Flag indicating whether file has been uploaded, or is currently being uploaded)
	/// 		 - Progress:integer (A value from 0-100 indicating how many percent of the file has been uploaded)
	/// 		 - FileObject:File (Native JS File object representing given file)
	/// 		 - GetImagePreview:function (Returns an HTMLImageElement with a preview for supported file types)
	/// 		Be aware that Type and Size cannot be determined in Legacy Mode, and that FileObject in this
	/// 		case will be Null. GetImagePreview() will also return Null in Legacy Mode.
	/// 	</description>
	/// 	<param name="cb" type="function"> Event handler function </param>
	/// </function>
	this.OnFailure = function(cb)
	{
		Fit.Validation.ExpectFunction(cb);
		Fit.Array.Add(onFailureHandlers, cb);
	}

	/// <function container="Fit.Controls.FilePicker" name="OnCompleted" access="public">
	/// 	<description>
	/// 		Add event handler fired when all files selected have been fully processed.
	/// 		Be aware that this event fires even if some files were not uploaded successfully.
	/// 		At this point files returned from GetFiles() contains a ServerResponse:string property
	/// 		containing the response from the server. This property remains Null in case of errors.
	/// 		Function receives one argument: Sender (Fit.Controls.FlePicker).
	/// 	</description>
	/// 	<param name="cb" type="function"> Event handler function </param>
	/// </function>
	this.OnCompleted = function(cb) // Fires when all files have been processed, even if files have failed!
	{
		Fit.Validation.ExpectFunction(cb);
		Fit.Array.Add(onCompletedHandlers, cb);
	}

	/*this.OnAbort = function(cb)
	{
		Fit.Validation.ExpectFunction(cb);
		Fit.Array.Add(onAbortHandlers, cb);
	}*/

	init();
}

Fit.Internationalization.AddLocalization(Fit.Controls.FilePicker,
{
	// Primary locales must be registered before country specific overrides.
	// Example order: en, en_GB, de, de_AT, etc.
	// All locales inherit from en. All country specific overrides inherit
	// from their general locale (e.g. de_AT inherits from de).
	// English (en) MUST be defined, and be defined first!

	"en":
	{
		"SelectFile": "Select file",
		"SelectFiles": "Select files",
		"DropFile": "Drag and drop file here, or",
		"DropFiles": "Drag and drop files here, or"
	},
	"da":
	{
		"SelectFile": "Vælg fil",
		"SelectFiles": "Vælg filer",
		"DropFile": "Træk og slip fil her, eller",
		"DropFiles": "Træk og slip filer her, eller"
	},
	"de":
	{
		"SelectFile": "Datei aussuchen",
		"SelectFiles": "Dateien auswählen",
		"DropFile": "Zieh deine Datei hierher und lege sie ab, oder",
		"DropFiles": "Zieh deine Dateien hierher und lege sie ab, oder"
	}
});

/// <container name="Fit.Controls.Input" extends="Fit.Controls.ControlBase">
/// 	Input control which allows for one or multiple lines of
/// 	text, and features a Design Mode for rich HTML content.
/// 	Extending from Fit.Controls.ControlBase.
/// </container>

/// <function container="Fit.Controls.Input" name="Input" access="public">
/// 	<description> Create instance of Input control </description>
/// 	<param name="ctlId" type="string" default="undefined"> Unique control ID that can be used to access control using Fit.Controls.Find(..) </param>
/// </function>
Fit.Controls.Input = function(ctlId)
{
	Fit.Validation.ExpectStringValue(ctlId, true);
	Fit.Core.Extend(this, Fit.Controls.ControlBase).Apply(ctlId);

	var me = this;
	var orgVal = "";
	var preVal = "";
	var input = null;
	var cmdResize = null;
	var designEditor = null;
	var wasMultiLineBefore = false;
	var minimizeHeight = -1;
	var maximizeHeight = -1;
	var minMaxUnit = null;
	var mutationObserverId = -1;
	var rootedEventId = -1;
	var isIe8 = (Fit.Browser.GetInfo().Name === "MSIE" && Fit.Browser.GetInfo().Version === 8);

	// ============================================
	// Init
	// ============================================

	function init()
	{
		input = document.createElement("input");
		input.type = "text";
		input.autocomplete = "off";
		input.spellcheck = true;
		input.onkeyup = function()
		{
			if (me.Value() !== preVal)
			{
				preVal = me.Value();
				me._internal.FireOnChange();
			}
		}
		input.onchange = function() // OnKeyUp does not catch changes by mouse (e.g. paste or moving selected text)
		{
			if (me === null)
			{
				// Fix for Chrome which fires OnChange and OnBlur (in both capturering and bubbling phase)
				// if control has focus while being removed from DOM, e.g. if used in a dialog closed using ESC.
				// More details here: https://bugs.chromium.org/p/chromium/issues/detail?id=866242
				return;
			}

			input.onkeyup();
		}
		me._internal.AddDomElement(input);

		me.AddCssClass("FitUiControlInput");

		me._internal.Data("multiline", "false");
		me._internal.Data("maximizable", "false");
		me._internal.Data("maximized", "false");
		me._internal.Data("designmode", "false");

		Fit.Internationalization.OnLocaleChanged(localize);
	}

	// ============================================
	// Public - overrides
	// ============================================

	// See documentation on ControlBase
	this.Focused = function(focus)
	{
		Fit.Validation.ExpectBoolean(focus, true);

		var elm = ((designEditor !== null) ? designEditor : input);

		if (Fit.Validation.IsSet(focus) === true)
		{
			if (focus === true)
				elm.focus();
			else if (elm !== designEditor) // Blur doesn't work for CKEditor!
				elm.blur();
		}

		if (designEditor !== null)
		{
			return (designEditor._focused === true); // Focused element is found in an iFrame so we have to rely on the HTML Editor instance to provide this information
		}

		return (Fit.Dom.GetFocused() === elm);
	}

	// See documentation on ControlBase
	this.Value = function(val)
	{
		Fit.Validation.ExpectString(val, true);

		if (Fit.Validation.IsSet(val) === true)
		{
			var fireOnChange = (me.Value() !== val);

			orgVal = val;
			preVal = val;

			if (designEditor !== null)
				CKEDITOR.instances[me.GetId() + "_DesignMode"].setData(val);
			else
				input.value = val;

			if (fireOnChange === true)
				me._internal.FireOnChange();
		}

		if (designEditor !== null)
			return CKEDITOR.instances[me.GetId() + "_DesignMode"].getData();

		return input.value;
	}

	// See documentation on ControlBase
	this.IsDirty = function()
	{
		return (orgVal !== me.Value());
	}

	// See documentation on ControlBase
	this.Clear = function()
	{
		me.Value("");
	}

	// See documentation on ControlBase
	this.Dispose = Fit.Core.CreateOverride(this.Dispose, function()
	{
		// This will destroy control - it will no longer work!

		if (designEditor !== null)
			designEditor.destroy();

		Fit.Internationalization.RemoveOnLocaleChanged(localize);

		if (mutationObserverId !== -1)
		{
			Fit.Events.RemoveMutationObserver(mutationObserverId);
		}

		if (rootedEventId !== -1)
		{
			Fit.Events.RemoveHandler(me.GetDomElement(), rootedEventId);
		}

		me = orgVal = preVal = input = cmdResize = designEditor = wasMultiLineBefore = minimizeHeight = maximizeHeight = minMaxUnit = mutationObserverId = rootedEventId = isIe8 = null;

		base();
	});

	// See documentation on ControlBase
	this.Width = Fit.Core.CreateOverride(this.Width, function(val, unit)
	{
		Fit.Validation.ExpectNumber(val, true);
		Fit.Validation.ExpectStringValue(unit, true);

		if (Fit.Validation.IsSet(val) === true)
		{
			base(val, unit);
			updateDesignEditorSize();
		}

		return base();
	});

	// See documentation on ControlBase
	this.Height = Fit.Core.CreateOverride(this.Height, function(val, unit, suppressMinMax)
	{
		Fit.Validation.ExpectNumber(val, true);
		Fit.Validation.ExpectStringValue(unit, true);
		Fit.Validation.ExpectBoolean(suppressMinMax, true);

		if (Fit.Validation.IsSet(val) === true)
		{
			var h = base(val, unit);
			updateDesignEditorSize(); // Throws error if in DesignMode and unit is not px

			if (me.Maximizable() === true && suppressMinMax !== true)
			{
				minimizeHeight = h.Value;
				maximizeHeight = ((maximizeHeight > h.Value && h.Unit === minMaxUnit) ? maximizeHeight : h.Value * 2)
				minMaxUnit = h.Unit;

				me.Maximized(false);
			}
		}

		return base();
	});

	// ============================================
	// Public
	// ============================================

	/// <function container="Fit.Controls.Input" name="Placeholder" access="public" returns="string">
	/// 	<description> Get/set value used as a placeholder to indicate expected input on supported browsers </description>
	/// 	<param name="val" type="string" default="undefined"> If defined, value is set as placeholder </param>
	/// </function>
	this.Placeholder = function(val)
	{
		Fit.Validation.ExpectString(val, true);

		if (Fit.Validation.IsSet(val) === true)
		{
			input.placeholder = val;
		}

		return (input.placeholder ? input.placeholder : "");
	}

	/// <function container="Fit.Controls.Input" name="CheckSpelling" access="public" returns="boolean">
	/// 	<description> Get/set value indicating whether control should have spell checking enabled (default) or disabled </description>
	/// 	<param name="val" type="boolean" default="undefined"> If defined, true enables spell checking while false disables it </param>
	/// </function>
	this.CheckSpelling = function(val)
	{
		Fit.Validation.ExpectBoolean(val, true);

		if (Fit.Validation.IsSet(val) === true)
		{
			if (val !== input.spellcheck)
			{
				input.spellcheck = val;

				if (me.DesignMode() === true)
				{
					reloadEditor();
				}
			}
		}

		return input.spellcheck;
	}

	/// <function container="Fit.Controls.Input" name="Type" access="public" returns="Fit.Controls.InputType">
	/// 	<description> Get/set input type (e.g. Text, Password, Email, etc.) </description>
	/// 	<param name="val" type="Fit.Controls.InputType" default="undefined"> If defined, input type is changed to specified value </param>
	/// </function>
	this.Type = function(val)
	{
		Fit.Validation.ExpectStringValue(val, true);

		if (Fit.Validation.IsSet(val) === true)
		{
			if (Fit.Validation.IsSet(Fit.Controls.InputType[val]) === false || val === Fit.Controls.InputType.Unknown)
				Fit.Validation.ThrowError("Unsupported input type specified - use e.g. Fit.Controls.InputType.Text");

			if (val === Fit.Controls.InputType.Textarea)
			{
				me.MultiLine(true);
			}
			else
			{
				me.MultiLine(false);

				if (val === Fit.Controls.InputType.Color)
					input.type = "color";
				else if (val === Fit.Controls.InputType.Date)
					input.type = "date";
				else if (val === Fit.Controls.InputType.DateTime)
					input.type = "datetime";
				else if (val === Fit.Controls.InputType.Email)
					input.type = "email";
				else if (val === Fit.Controls.InputType.Month)
					input.type = "month";
				else if (val === Fit.Controls.InputType.Number)
					input.type = "number";
				else if (val === Fit.Controls.InputType.Password)
					input.type = "password";
				else if (val === Fit.Controls.InputType.PhoneNumber)
					input.type = "tel";
				else if (val === Fit.Controls.InputType.Text)
					input.type = "text";
				else if (val === Fit.Controls.InputType.Time)
					input.type = "time";
				else if (val === Fit.Controls.InputType.Week)
					input.type = "week";
			}
		}

		if (me.MultiLine() === true || me.DesignMode() === true)
			return Fit.Controls.InputType.Textarea;
		else if (input.type === "color")
			return Fit.Controls.InputType.Color;
		else if (input.type === "date")
			return Fit.Controls.InputType.Date;
		else if (input.type === "datetime")
			return Fit.Controls.InputType.DateTime;
		else if (input.type === "email")
			return Fit.Controls.InputType.Email;
		else if (input.type === "month")
			return Fit.Controls.InputType.Month;
		else if (input.type === "number")
			return Fit.Controls.InputType.Number;
		else if (input.type === "password")
			return Fit.Controls.InputType.Password;
		else if (input.type === "tel")
			return Fit.Controls.InputType.PhoneNumber;
		else if (input.type === "text")
			return Fit.Controls.InputType.Text;
		else if (input.type === "time")
			return Fit.Controls.InputType.Time;
		else if (input.type === "week")
			return Fit.Controls.InputType.Week;

		return Fit.Controls.InputType.Unknown; // Only happens if someone changed the type to an unsupported value through the DOM (e.g. hidden or checkbox)
	}

	/// <function container="Fit.Controls.Input" name="MultiLine" access="public" returns="boolean">
	/// 	<description> Get/set value indicating whether control is in Multi Line mode (textarea) </description>
	/// 	<param name="val" type="boolean" default="undefined"> If defined, True enables Multi Line mode, False disables it </param>
	/// </function>
	this.MultiLine = function(val)
	{
		Fit.Validation.ExpectBoolean(val, true);

		if (Fit.Validation.IsSet(val) === true)
		{
			if (me.DesignMode() === true)
				me.DesignMode(false);

			if (val === true && input.tagName === "INPUT")
			{
				var oldInput = input;
				me._internal.RemoveDomElement(oldInput);

				input = document.createElement("textarea");
				input.value = oldInput.value;
				input.spellcheck = oldInput.spellcheck;
				input.onkeyup = oldInput.onkeyup;
				input.onchange = oldInput.onchange;
				me._internal.AddDomElement(input);

				if (me.Height().Value === -1)
					me.Height(150);

				me._internal.Data("multiline", "true");
				repaint();
			}
			else if (val === false && input.tagName === "TEXTAREA")
			{
				var oldInput = input;
				me._internal.RemoveDomElement(oldInput);

				if (cmdResize !== null)
				{
					me._internal.RemoveDomElement(cmdResize);
					cmdResize = null;

					me._internal.Data("maximized", "false");
					me._internal.Data("maximizable", "false");
					repaint();
				}

				input = document.createElement("input");
				input.autocomplete = "off";
				input.type = "text";
				input.value = oldInput.value;
				input.spellcheck = oldInput.spellcheck;
				input.onkeyup = oldInput.onkeyup;
				input.onchange = oldInput.onchange;
				me._internal.AddDomElement(input);

				me.Height(-1);

				wasMultiLineBefore = false;

				me._internal.Data("multiline", "false");
				repaint();
			}
		}

		return (input.tagName === "TEXTAREA" && designEditor === null);
	}

	/// <function container="Fit.Controls.Input" name="Maximizable" access="public" returns="boolean">
	/// 	<description> Get/set value indicating whether control is maximizable </description>
	/// 	<param name="val" type="boolean" default="undefined"> If defined, True enables maximize button, False disables it </param>
	/// 	<param name="heightMax" type="number" default="undefined">
	/// 		If defined, this becomes the height of the input control when maximized.
	/// 		The value is considered the same unit set using Height(..) which defaults to px.
	/// 		However, if DesignMode is enabled, the value unit is considered to be px.
	/// 	</param>
	/// </function>
	this.Maximizable = function(val, heightMax)
	{
		Fit.Validation.ExpectBoolean(val, true);
		Fit.Validation.ExpectNumber(heightMax, true);

		if (Fit.Validation.IsSet(val) === true)
		{
			if (val === true && cmdResize === null)
			{
				if (me.MultiLine() === true)
					wasMultiLineBefore = true;

				if (me.MultiLine() === false && designEditor === null)
					me.MultiLine(true);

				// Determine height to use when maximizing and minimizing

				var h = me.Height();

				if (designEditor === null)
				{
					minimizeHeight = h.Value;
					maximizeHeight = ((Fit.Validation.IsSet(heightMax) === true) ? heightMax : ((minimizeHeight !== -1) ? minimizeHeight * 2 : 150));
					minMaxUnit = h.Unit;
				}
				else
				{
					minimizeHeight = h.Value;
					maximizeHeight = ((Fit.Validation.IsSet(heightMax) === true) ? heightMax : ((minimizeHeight !== -1) ? minimizeHeight * 2 : 300));
					minMaxUnit = "px";
				}

				// Create maximize/minimize button

				cmdResize = document.createElement("span");
				cmdResize.onclick = function()
				{
					me.Maximized(!me.Maximized());
				}
				Fit.Dom.AddClass(cmdResize, "fa");
				Fit.Dom.AddClass(cmdResize, "fa-chevron-down");
				me._internal.AddDomElement(cmdResize);

				me._internal.Data("maximizable", "true");
				repaint();
			}
			else if (val === false && cmdResize !== null)
			{
				me._internal.RemoveDomElement(cmdResize);
				cmdResize = null;

				if (wasMultiLineBefore === true)
					me.Height(minimizeHeight, minMaxUnit);
				else
					me.MultiLine(false);

				me._internal.Data("maximizable", "false"); // Also set in MultiLine(..)
				repaint();
			}
		}

		return (cmdResize !== null);
	}

	/// <function container="Fit.Controls.Input" name="Maximized" access="public" returns="boolean">
	/// 	<description> Get/set value indicating whether control is maximized </description>
	/// 	<param name="val" type="boolean" default="undefined"> If defined, True maximizes control, False minimizes it </param>
	/// </function>
	this.Maximized = function(val)
	{
		Fit.Validation.ExpectBoolean(val, true);

		if (Fit.Validation.IsSet(val) === true && cmdResize !== null)
		{
			if (val === true && Fit.Dom.HasClass(cmdResize, "fa-chevron-up") === false)
			{
				me.Height(maximizeHeight, minMaxUnit, true);
				Fit.Dom.RemoveClass(cmdResize, "fa-chevron-down");
				Fit.Dom.AddClass(cmdResize, "fa-chevron-up");

				me._internal.Data("maximized", "true");
				repaint();
			}
			else if (val === false && Fit.Dom.HasClass(cmdResize, "fa-chevron-down") === false)
			{
				me.Height(minimizeHeight, minMaxUnit, true);
				Fit.Dom.RemoveClass(cmdResize, "fa-chevron-up");
				Fit.Dom.AddClass(cmdResize, "fa-chevron-down");

				me._internal.Data("maximized", "false"); // Also set in MultiLine(..)
				repaint();
			}
		}

		return (cmdResize !== null && Fit.Dom.HasClass(cmdResize, "fa-chevron-up") === true);
	}

	/// <function container="Fit.Controls.Input" name="DesignMode" access="public" returns="boolean">
	/// 	<description>
	/// 		Get/set value indicating whether control is in Design Mode allowing for rich HTML content.
	/// 		Notice that this control type requires dimensions (Width/Height) to be specified in pixels.
	/// 	</description>
	/// 	<param name="val" type="boolean" default="undefined"> If defined, True enables Design Mode, False disables it </param>
	/// </function>
	this.DesignMode = function(val)
	{
		Fit.Validation.ExpectBoolean(val, true);

		if (Fit.Validation.IsSet(val) === true)
		{
			var designMode = (me._internal.Data("designmode") === "true");

			if (val === true && designMode === false)
			{
				if (me.MultiLine() === true)
					wasMultiLineBefore = true;
				else
					me.MultiLine(true);

				input.id = me.GetId() + "_DesignMode";

				if (window.CKEDITOR === undefined)
				{
					window.CKEDITOR = null;

					Fit.Loader.LoadScript(Fit.GetUrl() + "/Resources/CKEditor/ckeditor.js", function(src) // Using Fit.GetUrl() rather than Fit.GetPath() to allow editor to be used on e.g. JSFiddle (Cross-Origin Resource Sharing policy)
					{
						if (Fit.Validation.IsSet(Fit._internal.Controls.Input.DefaultSkin) === true)
						{
							CKEDITOR.config.skin = Fit._internal.Controls.Input.DefaultSkin;
						}
						
						createEditor();
					});
				}
				else if (window.CKEDITOR === null)
				{
					var iId = -1;
					iId = setInterval(function()
					{
						if (me === null)
						{
							// Control was disposed while waiting for CKEditor to finish loading
							clearInterval(iId);
							return;
						}

						if (window.CKEDITOR !== null)
						{
							clearInterval(iId);
							createEditor();
						}
					}, 500);
				}
				else
				{
					createEditor();
				}

				me._internal.Data("designmode", "true");
				repaint();
			}
			else if (val === false && designMode === true)
			{
				designEditor.destroy(); // Editor content automatically synchronized to input control when destroyed
				designEditor = null;

				me._internal.Data("designmode", "false");

				if (wasMultiLineBefore === false)
					me.MultiLine(false);

				repaint();
			}
		}

		return (me._internal.Data("designmode") === "true");
	}

	// ============================================
	// Private
	// ============================================

	function createEditor()
	{
		// NOTICE: CKEDITOR requires input control to be rooted in DOM.
		// Creating the editor when Render(..) is called is not the solution, since the programmer
		// may call GetDomElement() instead and root the element at any given time which is out of our control.
		// It may be possible to temporarily root the control and make it invisible while the control
		// is being created, and remove it from the DOM when instanceReady is fired. However, since creating
		// the editor is an asynchronous operation, we need to detect whether the element has been rooted
		// elsewhere when instanceCreated is fired, and only remove it from the DOM if this is not the case.
		// This problem needs to be solved some other time as it may spawn other problems, such as determining
		// the size of objects while being invisible. The CKEditor team may also solve the bug in an update.
		if (Fit.Dom.IsRooted(me.GetDomElement()) === false)
		{
			//Fit.Validation.ThrowError("Control must be appended/rendered to DOM before DesignMode can be initialized");

			var retry = function()
			{
				if (Fit.Dom.IsRooted(me.GetDomElement()) === true)
				{
					if (me.DesignMode() === true)
					{
						createEditor();
					}

					return true;
				}

				// Return False to indicate that we still need to keep retrying (still in DesignMode).
				// Otherwie return True to indicate success - retrying is no longer relevant.
				return (me.DesignMode() === true ? false : true);
			};

			setTimeout(function() // Queue to allow control to be rooted
			{
				if (retry() === false)
				{
					// Still not rooted - add observer to create editor instance once control is rooted

					rootedEventId = Fit.Events.AddHandler(me.GetDomElement(), "#rooted", function(e)
					{
						if (retry() === true || me.DesignMode() === false)
						{
							Fit.Events.RemoveHandler(me.GetDomElement(), rootedEventId);
							rootedEventId = -1;
						}
					});
				}
			}, 0);

			return;
		}

		var langSupport = ["da", "de", "en"];
		var locale = Fit.Internationalization.Locale().length === 2 ? Fit.Internationalization.Locale() : Fit.Internationalization.Locale().substring(0, 2);
		var lang = Fit.Array.Contains(langSupport, locale) === true ? locale : "en";

		designEditor = CKEDITOR.replace(me.GetId() + "_DesignMode",
		{
			//allowedContent: true, // http://docs.ckeditor.com/#!/guide/dev_allowed_content_rules and http://docs.ckeditor.com/#!/api/CKEDITOR.config-cfg-allowedContent
			language: lang,
			disableNativeSpellChecker: me.CheckSpelling() === false,
			extraPlugins: "justify,pastefromword",
			toolbar:
			[
				{
					name: "BasicFormatting",
					items: [ "Bold", "Italic", "Underline" ]
				},
				{
					name: "Justify",
					items: [ "JustifyLeft", "JustifyCenter", "JustifyRight" ]
				},
				{
					name: "Lists",
					items: [ "NumberedList", "BulletedList", "Indent", "Outdent" ]
				},
				{
					name: "Links",
					items: [ "Link", "Unlink" ]
				}
			],
			removeButtons: "", // Set to empty string to prevent CKEditor from removing buttons such as Underline
			on:
			{
				instanceReady: function()
				{
					var h = me.Height();
					me.Height(((h.Value >= 150 && h.Unit === "px") ? h.Value : 150));

					designEditor._isReadyForInteraction = true;
				},
				change: function()
				{
					input.onkeyup();
				},
				focus: function()
				{
					designEditor._focused = true;
					me._internal.FireOnFocus();
				}/*,
				blur: function() // Not needed when editable area is a <div> (divarea plugin) - ControlBase implements focus/blur handling for all controls, which also ensures that e.g. OnBlur fires for editor before OnClick on e.g. a button
				{
					delete designEditor._focused;
					me._internal.FireOnBlur();
				}*/
			}
		});
	}

	function updateDesignEditorSize()
	{
		if (designEditor !== null)
		{
			if (designEditor._isReadyForInteraction !== true)
			{
				// Postpone, editor is not ready yet.
				// This may happen when editor is created and Width(..) is
				// immediately set after creating and mounting the control.
				// https://github.com/Jemt/Fit.UI/issues/34
				// This is a problem because CKEditor uses setTimeout(..) to for instance
				// allow early registration of events, and because resources are loaded
				// in an async. manner.
				setTimeout(updateDesignEditorSize, 100);
				return;
			}

			var w = me.Width();
			var h = me.Height();

			// CKEditor contains a bug that prevents us from resizing
			// with a CSS unit, so currently only pixels are supported.

			if (w.Unit !== "px" || h.Unit !== "px")
				throw new Error("DesignMode does not support resizing in units different from px");

			// Default control width is 200px (defined in Styles.css).
			// NOTICE: resize does not work reliably when editor is hidden, e.g. behind a tab with display:none.
			// The height set will not have the height of the toolbar substracted since the height can not be
			// determined for hidden objects, so the editor will become larger than the value set (height specified + toolbar height).
			// http://docs.ckeditor.com/#!/api/CKEDITOR.editor-method-resize
			designEditor.resize(((w.Value > -1) ? w.Value : 200), ((h.Value > -1) ? h.Value : 150));

			// Set mutation observer responsible for updating editor size once it becomes visible

			if (mutationObserverId !== -1) // Cancel any mutation observer previously registered
			{
				Fit.Events.RemoveMutationObserver(mutationObserverId);
				mutationObserverId = -1;
			}

			var concealer = Fit.Dom.GetConcealer(me.GetDomElement()); // Get element hiding editor

			if (concealer !== null) // Editor is hidden - adjust size when it becomes visible
			{
				mutationObserverId = Fit.Events.AddMutationObserver(concealer, function(elm)
				{
					if (Fit.Dom.IsVisible(me.GetDomElement()) === true)
					{
						designEditor.resize(((w.Value > -1) ? w.Value : 200), ((h.Value > -1) ? h.Value : 150));
						disconnect(); // Observers are expensive - remove when no longer needed
					}
				});
			}
		}
	}

	function reloadEditor()
	{
		// Disabling DesignMode brings it back to input or textarea mode.
		// If reverting to input mode, the Height is reset, so we need to preserve that.

		var height = me.Height();
		me.DesignMode(false);
		me.Height(height.Value, height.Unit);
		me.DesignMode(true);
	}

	function localize()
	{
		if (me.DesignMode() === true)
		{
			// Re-create editor with new language.
			// NOTICE minor issue: Changing language while link dialog (and possibly any dialog)
			// is open, breaks the editor with a "Cannot read property 'blur' of null" error.
			
			reloadEditor();
		}
	}

	function repaint()
	{
		if (isIe8 === true)
		{
			me.AddCssClass("FitUi_Non_Existing_Input_Class");
			me.RemoveCssClass("FitUi_Non_Existing_Input_Class");
		}
	}

	init();
}

/// <container name="Fit.Controls.InputType">
/// 	Enum values determining input type
/// </container>
Fit.Controls.InputType =
{
	/// <member container="Fit.Controls.InputType" name="Textarea" access="public" static="true" type="string" default="Textarea">
	/// 	<description> Multi line input field </description>
	/// </member>
	Textarea: "Textarea",

	/// <member container="Fit.Controls.InputType" name="Color" access="public" static="true" type="string" default="Color">
	/// 	<description> Input control useful for entering a color </description>
	/// </member>
	Color: "Color",

	/// <member container="Fit.Controls.InputType" name="Date" access="public" static="true" type="string" default="Date">
	/// 	<description> Input control useful for entering a date </description>
	/// </member>
	Date: "Date",

	/// <member container="Fit.Controls.InputType" name="DateTime" access="public" static="true" type="string" default="DateTime">
	/// 	<description> Input control useful for entering a date and time </description>
	/// </member>
	DateTime: "DateTime",

	/// <member container="Fit.Controls.InputType" name="Email" access="public" static="true" type="string" default="Email">
	/// 	<description> Input control useful for entering an e-mail address </description>
	/// </member>
	Email: "Email",

	/// <member container="Fit.Controls.InputType" name="Month" access="public" static="true" type="string" default="Month">
	/// 	<description> Input control useful for entering a month </description>
	/// </member>
	Month: "Month",

	/// <member container="Fit.Controls.InputType" name="Number" access="public" static="true" type="string" default="Number">
	/// 	<description> Input control useful for entering a number </description>
	/// </member>
	Number: "Number",

	/// <member container="Fit.Controls.InputType" name="Password" access="public" static="true" type="string" default="Password">
	/// 	<description> Input control useful for entering a password (characters are masked) </description>
	/// </member>
	Password: "Password",

	/// <member container="Fit.Controls.InputType" name="PhoneNumber" access="public" static="true" type="string" default="PhoneNumber">
	/// 	<description> Input control useful for entering a phone number </description>
	/// </member>
	PhoneNumber: "PhoneNumber",

	/// <member container="Fit.Controls.InputType" name="Text" access="public" static="true" type="string" default="Text">
	/// 	<description> Input control useful for entering ordinary text </description>
	/// </member>
	Text: "Text",

	/// <member container="Fit.Controls.InputType" name="Time" access="public" static="true" type="string" default="Time">
	/// 	<description> Input control useful for entering time </description>
	/// </member>
	Time: "Time",

	/// <member container="Fit.Controls.InputType" name="Week" access="public" static="true" type="string" default="Week">
	/// 	<description> Input control useful for entering a week number </description>
	/// </member>
	Week: "Week",

	Unknown: "Unknown"
}

Fit.Controls.Input.Type = Fit.Controls.InputType; // Backward compatibility

Fit._internal.Controls.Input = {};
Fit._internal.Controls.Input.DefaultSkin = null; // Notice: CKEditor does not support multiple different skins on the same page - do not change value once an editor has been created

/// <container name="Fit.Controls.ListView" extends="Fit.Controls.PickerBase;Fit.Controls.Component">
/// 	Picker control which allows for entries
/// 	to be selected in the DropDown control.
/// </container>

/// <function container="Fit.Controls.ListView" name="ListView" access="public">
/// 	<description> Create instance of ListView control </description>
/// 	<param name="controlId" type="string" default="undefined"> Unique control ID that can be used to access control using Fit.Controls.Find(..) </param>
/// </function>
Fit.Controls.ListView = function(controlId)
{
	Fit.Validation.ExpectStringValue(controlId, true);
	Fit.Core.Extend(this, Fit.Controls.PickerBase).Apply();
	Fit.Core.Extend(this, Fit.Controls.Component).Apply(controlId);

	var me = this;
	var list = me.GetDomElement();
	var active = null;
	var isIe8 = (Fit.Browser.GetInfo().Name === "MSIE" && Fit.Browser.GetInfo().Version === 8);

	function init()
	{
		list.tabIndex = "0";
		Fit.Dom.AddClass(list, "FitUiControlListView");

		me.OnShow(function()
		{
			list.scrollTop = 0;
			setActive(null);
		});

		list.onclick = function(e)
		{
			var ev = Fit.Events.GetEvent(e);
			var elm = Fit.Events.GetTarget(e);

			if (elm === list)
				return;

			while (elm.parentElement !== list)
				elm = elm.parentElement;

			setActive(elm, true); // true = do not scroll into view - it already is

			// Fire OnChanging and OnChange events

			// Notice: We always pass False as current selection state to OnItemSelectionChanging since ListView does
			// not keep track of selection state. In theory item could very well already be selected in host control.
			// Event handlers should not trust boolean to reveal selection in host control, only in picker.
			if (me._internal.FireOnItemSelectionChanging(Fit.Dom.Text(elm), decode(Fit.Dom.Data(elm, "value")), false, false) === true)
			{
				me._internal.FireOnItemSelectionChanged(Fit.Dom.Text(elm), decode(Fit.Dom.Data(elm, "value")), true, false);
				me._internal.FireOnItemSelectionComplete();
			}
		}

		list.onfocus = function(e)
		{
			me._internal.FireOnFocusIn(); // Fire OnFocusIn on PickerBase

			// Skip if this was a mouse click, leave handling to OnClick which fires after OnFocus.
			// Notice that Fit.Events.GetPointerState() is used to determine whether mouse button
			// is active since this information is not accessible through Event instance passed in OnFocus.
			if (Fit.Events.GetPointerState().Buttons.Primary === true)
				return;

			// Implemented Tab and Shift+Tab support below rather than using built-in support to prevent
			// the need for an OnFocus event handler on every single item contained, which would otherwise
			// be necessary to intercept focus and make element active.

			if (Fit.Events.GetModifierKeys().Shift === true) // Shift+Tab: Navigate up/backwards
			{
				if (list.children.length > 0)
					setActive(list.children[list.children.length - 1]);
			}
			else // Tab: Navigate down/forward
			{
				if (list.children.length > 0)
					setActive(list.children[0]);
			}
		}

		list.onblur = function(e)
		{
			setActive(null);
			me._internal.FireOnFocusOut(); // Fire OnFocusOut on PickerBase
		}

		list.onkeydown = function(e)
		{
			var ev = Fit.Events.GetEvent(e);

			// Handle Tab navigation manually to prevent the need to
			// implement a onfocus handler on every single item, responsible
			// for selecting an item when it gains focus.

			if (ev.keyCode === 9 && ev.shiftKey === false) // Tab
			{
				if (active !== list.children[list.children.length - 1])
				{
					moveDown();

					// Prevent native tab navigation from moving focus to next focusable element
					Fit.Events.PreventDefault(ev);
					return false;
				}
			}
			else if (ev.keyCode === 9 && ev.shiftKey === true) // Shift + Tab
			{
				if (active !== list.firstChild)
				{
					moveUp();

					// Prevent native tab navigation from moving focus to any focusable element above
					Fit.Events.PreventDefault(ev);
					return false;
				}
			}
			else
			{
				me.HandleEvent(ev); // Handle arrow up/down and enter
			}
		}
	}

	// ============================================
	// Public
	// ============================================

	/// <function container="Fit.Controls.ListView" name="AddItem" access="public">
	/// 	<description> Add item to ListView </description>
	/// 	<param name="title" type="string"> Item title </param>
	/// 	<param name="value" type="string"> Item value </param>
	/// </function>
	this.AddItem = function(title, value)
	{
		Fit.Validation.ExpectString(title);
		Fit.Validation.ExpectString(value);

		var entry = document.createElement("div");
		entry.innerHTML = title;
		Fit.Dom.Data(entry, "value", encode(value));
		Fit.Dom.Data(entry, "active", "false");

		list.appendChild(entry);
	}

	/// <function container="Fit.Controls.ListView" name="GetItem" access="public" returns="object">
	/// 	<description> Get item by value - returns object with Title (string) and Value (string) properties if found, otherwise Null </description>
	/// 	<param name="value" type="string"> Value of item to retrieve </param>
	/// </function>
	this.GetItem = function(value)
	{
		Fit.Validation.ExpectString(value);

		var itemElm = getItemElement(value);

		if (itemElm !== null)
		{
			return convertItemElementToObject(itemElm);
		}

		return null;
	}

	/// <function container="Fit.Controls.ListView" name="HasItem" access="public" returns="boolean">
	/// 	<description> Returns value indicating whether control contains item with specified value </description>
	/// 	<param name="value" type="string"> Value of item to check for </param>
	/// </function>
	this.HasItem = function(value)
	{
		Fit.Validation.ExpectString(value);
		return getItemElement(value) !== null;
	}

	/// <function container="Fit.Controls.ListView" name="RemoveItem" access="public">
	/// 	<description> Remove item from ListView </description>
	/// 	<param name="value" type="string"> Value of item to remove </param>
	/// </function>
	this.RemoveItem = function(value)
	{
		Fit.Validation.ExpectString(value);

		var item = getItemElement(value);

		if (item !== null)
		{
			Fit.Dom.Remove(item);
		}
	}

	/// <function container="Fit.Controls.ListView" name="RemoveItems" access="public">
	/// 	<description> Remove all items from ListView </description>
	/// </function>
	this.RemoveItems = function()
	{
		list.innerHTML = "";
		setActive(null);
	}

	// ============================================
	// PickerBase interface
	// ============================================

	this.GetItemByValue = function(val)
	{
		Fit.Validation.ExpectString(val);
		return me.GetItem(val);
	}

	this.RevealItemInView = function(val)
	{
		Fit.Validation.ExpectString(val);

		var itemElm = getItemElement(val);

		if (itemElm !== null)
		{
			setActive(itemElm);
		}
	}

    this.HandleEvent = function(e)
    {
		Fit.Validation.ExpectEvent(e, true);

        var ev = Fit.Events.GetEvent(e);

        if (ev.type === "keydown")
        {
            if (ev.keyCode === 38) // arrow up
            {
                moveUp();

				// Prevent scrollable div from scrolling up
				Fit.Events.PreventDefault(ev);
            }
            else if (ev.keyCode === 40) // arrow down
            {
                moveDown();

				// Prevent scrollable div from scrolling down
				Fit.Events.PreventDefault(ev);
            }
            else if (ev.keyCode === 13) // enter
            {
                if (active === null && list.children.length === 1)
					moveDown(); // Select first item if no item is selected

				if (active !== null)
				{
					// Notice: We always pass False as current selection state to OnItemSelectionChanging since ListView does
					// not keep track of selection state. In theory item could very well already be selected in host control.
					// Event handlers should not trust boolean to reveal selection in host control, only in picker.
					if (me._internal.FireOnItemSelectionChanging(Fit.Dom.Text(active), decode(Fit.Dom.Data(active, "value")), false, false) === true)
					{
						me._internal.FireOnItemSelectionChanged(Fit.Dom.Text(active), decode(Fit.Dom.Data(active, "value")), true, false);
						me._internal.FireOnItemSelectionComplete();
					}
				}

				// Prevent form submit
				Fit.Events.PreventDefault(ev);
            }
        }
	}
	
	this.Destroy = Fit.Core.CreateOverride(this.Destroy, function(calledInternally)
	{
		Fit.Validation.ExpectBoolean(calledInternally, true);

		// This will destroy control - it will no longer work!

		if (calledInternally !== true)
		{
			me.Dispose(true); // Component.Dispose()
		}

		base(); // PickerBase.Destroy()
	});

	this.Dispose = Fit.Core.CreateOverride(this.Dispose, function(calledInternally)
	{
		Fit.Validation.ExpectBoolean(calledInternally, true);
		
		base(); // Component.Dispose()
		
		if (calledInternally !== true)
		{
			me.Destroy(true); // PickerBase.Destroy()
		}

		me = list = active = isIe8 = null;
	});

    // ============================================
	// Private
	// ============================================

	function getItemElement(value)
	{
		Fit.Validation.ExpectString(value);

		var found = null;

		Fit.Array.ForEach(list.children, function(child)
		{
			if (decode(Fit.Dom.Data(child, "value")) === value)
			{
				found = child;
				return false;
			}
		});

		return found;
	}

	function convertItemElementToObject(elm)
	{
		Fit.Validation.ExpectDomElement(elm);
		return { Title: Fit.Dom.Text(elm), Value: Fit.Dom.Data(elm, "value") }; // Using Text(..) to get rid of HTML formatting
	}

	function setActive(elm, suppressScrollIntoView)
	{
		Fit.Validation.ExpectDomElement(elm, true);
		Fit.Validation.ExpectBoolean(suppressScrollIntoView, true);

		if (active !== null)
			Fit.Dom.Data(active, "active", "false");

		active = (elm ? elm : null);

		if (active !== null)
		{
			Fit.Dom.Data(active, "active", "true");

			if (suppressScrollIntoView !== true)
			{
				list.scrollTop = active.offsetHeight * Fit.Dom.GetIndex(active); // Alternative to active.scrollIntoView(true) which unfortunately also scrolls main view
				repaint();
			}
		}
	}

    function moveUp()
    {
        if (list.children.length === 0)
            return;

        // Select item

        if (active === null) // Select first entry if no selection is made
        {
			setActive(list.firstChild);
        }
        else if (active.previousSibling !== null) // Select previous entry if available
        {
			setActive(active.previousSibling);
        }
    }

    function moveDown()
    {
        if (list.children.length === 0)
            return;

        // Select item

        if (active === null) // Select first entry if no selection is made
        {
			setActive(list.firstChild);
        }
        else if (active.nextSibling !== null) // Select next entry if available
        {
			setActive(active.nextSibling);
        }
    }

	function repaint()
	{
		if (isIe8 === true)
		{
			Fit.Dom.AddClass(list, "FitUi_Non_Existing_ListView_Class");
			Fit.Dom.RemoveClass(list, "FitUi_Non_Existing_ListView_Class");
		}
	}

	function decode(str)
	{
		Fit.Validation.ExpectString(str);
		return decodeURIComponent(str);
	}

	function encode(str)
	{
		Fit.Validation.ExpectString(str);
		return encodeURIComponent(str);
	}

	init();
}

/// <container name="Fit.Controls.WSListView" extends="Fit.Controls.ListView">
/// 	WebService enabled picker control which allows for entries
/// 	to be selected in the DropDown control.
/// </container>

/// <function container="Fit.Controls.WSListView" name="WSListView" access="public">
/// 	<description> Create instance of WSListView control </description>
/// 	<param name="ctlId" type="string" default="undefined"> Unique control ID that can be used to access control using Fit.Controls.Find(..) </param>
/// </function>
Fit.Controls.WSListView = function(ctlId)
{
	Fit.Validation.ExpectStringValue(ctlId, true);
	Fit.Core.Extend(this, Fit.Controls.ListView).Apply(ctlId);

	var me = this;
	var url = null;
	var jsonpCallback = null;
	var dataLoading = false;
	var onDataLoadedCallback = [];
	var onRequestHandlers = [];
	var onResponseHandlers = [];
	var onAbortHandlers = [];
	var onPopulatedHandlers = [];

	function init()
	{
	}

	// ============================================
	// Public
	// ============================================

	/// <function container="Fit.Controls.WSListView" name="Url" access="public" returns="string">
	/// 	<description>
	/// 		Get/set URL to WebService responsible for providing data to control.
	/// 		WebService must deliver data in the following JSON format:
	/// 		[
	/// 			&#160;&#160;&#160;&#160; { Title: "Test 1", Value: "1001", Selectable: true, Children: [] },
	/// 			&#160;&#160;&#160;&#160; { Title: "Test 2", Value: "1002", Selectable: false, Children: [] }
	/// 		]
	/// 		Only Value is required. Children is a collection of items with the same format as described above.
	/// 		Be aware that items are treated as a flat list, even when hierarchically structured using the Children property.
	/// 		Items with Selectable set to False will simply be ignored (not shown) while children will still be added.
	/// 	</description>
	/// 	<param name="wsUrl" type="string" default="undefined"> If defined, updates WebService URL (e.g. http://server/ws/data.asxm/GetItems) </param>
	/// </function>
	this.Url = function(wsUrl)
	{
		Fit.Validation.ExpectString(wsUrl, true);

		if (Fit.Validation.IsSet(wsUrl) === true)
		{
			url = wsUrl;
		}

		return url;
	}

	/// <function container="Fit.Controls.WSListView" name="JsonpCallback" access="public" returns="string">
	/// 	<description>
	/// 		Get/set name of JSONP callback argument. Assigning a value will enable JSONP communication.
	/// 		Often this argument is simply &quot;callback&quot;. Passing Null disables JSONP communication again.
	/// 	</description>
	/// 	<param name="val" type="string" default="undefined"> If defined, enables JSONP and updates JSONP callback argument </param>
	/// </function>
	this.JsonpCallback = function(val)
	{
		Fit.Validation.ExpectString(val, true);

		if (Fit.Validation.IsSet(val) === true || val === null)
		{
			jsonpCallback = val;
		}

		return jsonpCallback;
	}

	/// <function container="Fit.Controls.WSListView" name="Reload" access="public">
	/// 	<description> Load/reload data from WebService </description>
	/// 	<param name="cb" type="function" default="undefined">
	/// 		If defined, callback function is invoked when data has been loaded
	/// 		and populated - takes Sender (Fit.Controls.WSListView) as an argument.
	/// 	</param>
	/// </function>
	this.Reload = function(cb)
	{
		Fit.Validation.ExpectFunction(cb, true);

		if (dataLoading === true)
		{
			// Data is currently loading - postpone by adding request to process queue
			onDataLoaded(function() { me.Reload(cb); });
			return;
		}

		dataLoading = true;

		getData(function() // Callback is invoked when nodes are populated, but before OnPopulated is fired by getData(..)
		{
			dataLoading = false;

			if (Fit.Validation.IsSet(cb) === true)
			{
				cb(me);
			}

			fireOnDataLoaded();
		});
	}

	// See documentation on PickerBase
	this.Destroy = Fit.Core.CreateOverride(this.Destroy, function()
	{
		// This will destroy control - it will no longer work!

		me = url = jsonpCallback = dataLoading = onDataLoadedCallback = onRequestHandlers = onResponseHandlers = onAbortHandlers = onPopulatedHandlers = null;
		base();
	});

	// ============================================
	// Events
	// ============================================

	/// <function container="Fit.Controls.WSListView" name="OnRequest" access="public">
	/// 	<description>
	/// 		Add event handler fired when data is being requested.
	/// 		Request can be canceled by returning False.
	/// 		Function receives two arguments:
	/// 		Sender (Fit.Controls.WSListView) and EventArgs object.
	/// 		EventArgs object contains the following properties:
	/// 		 - Sender: Fit.Controls.WSListView instance
	/// 		 - Request: Fit.Http.JsonpRequest or Fit.Http.JsonRequest instance
	/// 	</description>
	/// 	<param name="cb" type="function"> Event handler function </param>
	/// </function>
	this.OnRequest = function(cb)
	{
		Fit.Validation.ExpectFunction(cb);
		Fit.Array.Add(onRequestHandlers, cb);
	}

	/// <function container="Fit.Controls.WSListView" name="OnResponse" access="public">
	/// 	<description>
	/// 		Add event handler fired when data is received,
	/// 		allowing for data transformation to occure before
	/// 		ListView is populated. Function receives two arguments:
	/// 		Sender (Fit.Controls.WSListView) and EventArgs object.
	/// 		EventArgs object contains the following properties:
	/// 		 - Sender: Fit.Controls.WSListView instance
	/// 		 - Request: Fit.Http.JsonpRequest or Fit.Http.JsonRequest instance
	/// 		 - Items: JSON items received from WebService
	/// 	</description>
	/// 	<param name="cb" type="function"> Event handler function </param>
	/// </function>
	this.OnResponse = function(cb)
	{
		Fit.Validation.ExpectFunction(cb);
		Fit.Array.Add(onResponseHandlers, cb);
	}

	/// <function container="Fit.Controls.WSListView" name="OnAbort" access="public">
	/// 	<description>
	/// 		Add event handler fired if data request is canceled.
	/// 		Function receives two arguments:
	/// 		Sender (Fit.Controls.WSListView) and EventArgs object.
	/// 		EventArgs object contains the following properties:
	/// 		 - Sender: Fit.Controls.WSListView instance
	/// 		 - Request: Fit.Http.JsonpRequest or Fit.Http.JsonRequest instance
	/// 		 - Items: JSON items received from WebService (Null in this particular case)
	/// 	</description>
	/// 	<param name="cb" type="function"> Event handler function </param>
	/// </function>
	this.OnAbort = function(cb)
	{
		Fit.Validation.ExpectFunction(cb);
		Fit.Array.Add(onAbortHandlers, cb);
	}

	/// <function container="Fit.Controls.WSListView" name="OnPopulated" access="public">
	/// 	<description>
	/// 		Add event handler fired when ListView has been populated with items.
	/// 		Function receives two arguments:
	/// 		Sender (Fit.Controls.WSListView) and EventArgs object.
	/// 		EventArgs object contains the following properties:
	/// 		 - Sender: Fit.Controls.WSListView instance
	/// 		 - Request: Fit.Http.JsonpRequest or Fit.Http.JsonRequest instance
	/// 		 - Items: JSON items received from WebService
	/// 	</description>
	/// 	<param name="cb" type="function"> Event handler function </param>
	/// </function>
	this.OnPopulated = function(cb)
	{
		Fit.Validation.ExpectFunction(cb);
		Fit.Array.Add(onPopulatedHandlers, cb);
	}

	// ============================================
	// Private
	// ============================================

	function getData(cb)
	{
		Fit.Validation.ExpectFunction(cb, true);

		if (url === null)
			Fit.Validation.ThrowError("Unable to get data, no WebService URL has been specified");

		// Determine request method

		var request = null;

		if (jsonpCallback !== null)
		{
			request = new Fit.Http.JsonpRequest(url, jsonpCallback);
		}
		else
		{
			request = new Fit.Http.JsonRequest(url)
		}

		// Fire OnRequest

		var eventArgs = { Sender: me, Request: request, Items: null };

		if (fireEventHandlers(onRequestHandlers, eventArgs) === false)
			return;

		if (eventArgs.Request !== request)
		{
			// Support for changing request instans to
			// take control over webservice communication.

			// Restrict to support for Fit.Http.Request or classes derived from this
			Fit.Validation.ExpectInstance(eventArgs.Request, Fit.Http.Request);

			request = eventArgs.Request;
		}

		// Define request callbacks

		var onSuccess = function(data)
		{
			// Fire OnResponse

			eventArgs.Items = ((data instanceof Array) ? data : []);
			fireEventHandlers(onResponseHandlers, eventArgs);

			// Populate ListView

			me.RemoveItems();

			Fit.Array.ForEach(eventArgs.Items, function(item)
			{
				populate(item);
			});

			// Invoke callback

			if (Fit.Validation.IsSet(cb) === true)
			{
				cb();
			}

			// Fire OnPopulated

			fireEventHandlers(onPopulatedHandlers, eventArgs);
		}

		var onFailure = function(httpStatusCode)
		{
			Fit.Validation.ThrowError("Unable to get data - request failed with HTTP Status code " + httpStatusCode)
		};

		var onAbort = function()
		{
			fireEventHandlers(onAbortHandlers, eventArgs);
		}

		// Register request callbacks

		if (Fit.Core.InstanceOf(request, Fit.Http.JsonpRequest) === false)
		{
			request.OnSuccess(function(req)
			{
				var data = request.GetResponseJson();
				onSuccess(data);
			});

			request.OnFailure(function(req)
			{
				onFailure(request.GetHttpStatus());
			});

			request.OnAbort(function(req)
			{
				onAbort();
			});
		}
		else
		{
			request.OnSuccess(function(req)
			{
				var children = req.GetResponse();
				onSuccess(children);
			});

			request.OnTimeout(function()
			{
				onFailure("UNKNOWN (JSONP)");
			});
		}

		// Invoke request

		request.Start();
	}

	function onDataLoaded(cb)
	{
		Fit.Validation.ExpectFunction(cb);
		Fit.Array.Add(onDataLoadedCallback, cb);
	}

	function fireOnDataLoaded()
	{
		// Copied from WSTreeView.
		// Immediately clear collection. If multiple callbacks are registered,
		// chances are that only the first will run, and the remaining will be
		// re-scheduled again - so we need the collection to be cleared before
		// invoking callbacks.
		var orgOnDataLoadedCallback = onDataLoadedCallback;
		onDataLoadedCallback = [];

		Fit.Array.ForEach(orgOnDataLoadedCallback, function(cb)
		{
			cb();
		});
	}

	function populate(jsonItem)
	{
		Fit.Validation.ExpectIsSet(jsonItem);
		Fit.Validation.ExpectString(jsonItem.Value);
		Fit.Validation.ExpectString(jsonItem.Title, true);
		Fit.Validation.ExpectBoolean(jsonItem.Selectable, true);
		Fit.Validation.ExpectArray(jsonItem.Children, true);

		if (jsonItem.Selectable !== false)
			me.AddItem((jsonItem.Title ? jsonItem.Title : jsonItem.Value), jsonItem.Value);

		if (jsonItem.Children)
		{
			Fit.Array.ForEach(jsonItem.Children, function(c)
			{
				populate(c);
			});
		}
	}

	function fireEventHandlers(handlers, eventArgs)
	{
		var cancel = false;

		Fit.Array.ForEach(handlers, function(cb)
		{
			if (cb(me, eventArgs) === false)
				cancel = true; // Do not cancel loop - all handlers must be fired!
		});

		return !cancel;
	}

	init();
}

/// <container name="Fit.Controls.ProgressBar" extends="Fit.Controls.Component">
/// 	ProgressBar control useful for indicating progress.
/// </container>

/// <function container="Fit.Controls.ProgressBar" name="ProgressBar" access="public">
/// 	<description> Create instance of ProgressBar control </description>
/// 	<param name="controlId" type="string" default="undefined"> Unique control ID that can be used to access control using Fit.Controls.Find(..) </param>
/// </function>
Fit.Controls.ProgressBar = function(controlId)
{
	Fit.Validation.ExpectStringValue(controlId, true);
	Fit.Core.Extend(this, Fit.Controls.Component).Apply(controlId);

	// Internals

	var me = this;
	var id = me.GetId();
	var element = me.GetDomElement();
	var status = null;
	var title = "";
	var width = { Value: 200, Unit: "px" }; // Any changes to this line must be dublicated to Width(..)
	var onProgressHandlers = [];

	function init()
	{
		Fit.Dom.AddClass(element, "FitUiControl");
		Fit.Dom.AddClass(element, "FitUiControlProgressBar");

		status = document.createElement("div");
		status.style.width = "0%";
		Fit.Dom.AddClass(status, "FitUiControlProgressBarStatus");
		Fit.Dom.Add(element, status);

		title = document.createElement("span");
		Fit.Dom.Add(status, title);
	}

	/// <function container="Fit.Controls.ProgressBar" name="Title" access="public" returns="string">
	/// 	<description> Get/set title in progress bar </description>
	/// 	<param name="val" type="string" default="undefined"> If specified, title will be set to specified value </param>
	/// </function>
	this.Title = function(val)
	{
		Fit.Validation.ExpectString(val, true);

		if (Fit.Validation.IsSet(val) === true)
		{
			title.innerHTML = val;
		}

		return title.innerHTML;
	}

	/// <function container="Fit.Controls.ProgressBar" name="Width" access="public" returns="object">
	/// 	<description> Get/set control width - returns object with Value and Unit properties </description>
	/// 	<param name="val" type="number" default="undefined"> If defined, control width is updated to specified value. A value of -1 resets control width. </param>
	/// 	<param name="unit" type="string" default="px"> If defined, control width is updated to specified CSS unit </param>
	/// </function>
	this.Width = function(val, unit)
	{
		Fit.Validation.ExpectNumber(val, true);
		Fit.Validation.ExpectStringValue(unit, true);

		if (Fit.Validation.IsSet(val) === true)
		{
			if (val > -1)
			{
				width = { Value: val, Unit: ((Fit.Validation.IsSet(unit) === true) ? unit : "px") };
				element.style.width = width.Value + width.Unit;
			}
			else
			{
				width = { Value: 200, Unit: "px" }; // Any changes to this line must be dublicated to line declaring the width variable !
				element.style.width = "";
			}
		}

		return width;
	}

	/// <function container="Fit.Controls.ProgressBar" name="Progress" access="public" returns="integer">
	/// 	<description> Get/set progress - a value between 0 and 100 </description>
	/// 	<param name="val" type="integer" default="undefined"> If defined, progress is set to specified value (0-100) </param>
	/// </function>
	this.Progress = function(val)
	{
		Fit.Validation.ExpectInteger(val, true);

		if (Fit.Validation.IsSet(val) === true && val >= 0 && val <= 100 && status.style.width !== val + "%")
		{
			status.style.width = val + "%";

			// Fire OnProgress event

			Fit.Array.ForEach(onProgressHandlers, function(cb)
			{
				cb(me);
			});
		}

		return parseInt(status.style.width);
	}

	/// <function container="Fit.Controls.ProgressBar" name="OnProgress" access="public">
	/// 	<description> Set callback function invoked when progress is changed </description>
	/// 	<param name="cb" type="function"> Callback function invoked when progress is changed - takes progress bar instance as argument </param>
	/// </function>
	this.OnProgress = function(cb)
	{
		Fit.Validation.ExpectFunction(cb);
		Fit.Array.Add(onProgressHandlers, cb);
	}

	this.Dispose = Fit.Core.CreateOverride(this.Dispose, function()
	{
		me = id = element = status = title = width = onProgressHandlers = null;
		base();
	});

	init();
}

/// <container name="Fit.Controls.TreeView" extends="Fit.Controls.PickerBase;Fit.Controls.ControlBase">
/// 	TreeView control allowing data to be listed in a structured manner.
/// 	Extending from Fit.Controls.PickerBase.
/// 	Extending from Fit.Controls.ControlBase.
///
/// 	Performance considerations (for huge amounts of data):
///
/// 	1) Selectable(..) is used to transform how nodes allow selections
/// 	   (disabled/single select/multi select/select all). This requires the function to
/// 	   recursively modify all nodes contained to make sure they are configured identically.
/// 	   However, this also happens when AddChild(node) is called, to make sure
/// 	   nodes added at any time is configured in accordance with TreeView configuration.
/// 	   Selectable(..) should therefore be called before adding nodes to prevent
/// 	   an extra recursive operation on all nodes contained.
///
/// 	2) Selected(nodes) performs better than Value("val1;val2;val3")
///
/// 	3) RemoveChild(node) performance is non-linear, relative to the amount of children contained.
/// 	   The function recursively iterates children to find selected nodes to deselect them, to
/// 	   make sure TreeView is updated accordingly.
///
/// 	4) GetChild("val1", true) is faster at finding one specific node, compared to recursively
/// 	   iterating the result from GetChildren(), since internal children collections are indexed.
///
/// 	5) Be aware that some operations (e.g. AddChild, Expand/Collapse, Select/Deselect) forces
/// 	   Internet Explorer 8 to repaint tree to work around render bugs. Repainting can be minimized
/// 	   greately by populating root nodes before adding them to the TreeView instance.
/// 	   However, be aware that this comes with the performance penalty mentioned in article 1 (AddChild).
/// 	   It is likely that repainting does not pose a major performance problem, though.
/// </container>

/// <function container="Fit.Controls.TreeView" name="TreeView" access="public">
/// 	<description> Create instance of TreeView control </description>
/// 	<param name="ctlId" type="string" default="undefined"> Unique control ID that can be used to access control using Fit.Controls.Find(..) </param>
/// </function>
Fit.Controls.TreeView = function(ctlId)
{
	Fit.Validation.ExpectStringValue(ctlId, true);
	Fit.Core.Extend(this, Fit.Controls.PickerBase).Apply();
	Fit.Core.Extend(this, Fit.Controls.ControlBase).Apply(ctlId);

	var me = this;
	var rootContainer = null;		// UL element
	var rootNode = null;			// Fit.Controls.TreeViewNode instance

	var keyNavigationEnabled = true;

	var selectable = false;
	var multiSelect = false;
	var showSelectAll = false; // TBD: Never implemented - can be achieved using ContextMenu. Remove or implement?
	var allowDeselect = true;
	var revealExpandedNodes = false;

	var selected = createInternalCollection();
	var selectedOrg = [];

	var ctx = null; // Context menu

	var onSelectHandlers = [];
	var onSelectedHandlers = [];
	var onToggleHandlers = [];
	var onToggledHandlers = [];
	var onSelectAllHandlers = [];
	var onSelectAllCompleteHandlers = [];
	var onContextMenuHandlers = [];

	var forceClear = false;
	var isIe8 = (Fit.Browser.GetInfo().Name === "MSIE" && Fit.Browser.GetInfo().Version === 8);

	// ============================================
	// Init
	// ============================================

	function init()
	{
		// Initial settings

		me.AddCssClass("FitUiControlTreeView");
		me._internal.Data("selectable", "false");
		me._internal.Data("multiselect", "false");
		me._internal.Data("wordwrap", "false");
		me._internal.Data("picker", "false");

		// Create internal root node to hold children

		rootContainer = document.createElement("ul");
		me._internal.AddDomElement(rootContainer);

		rootNode = new Fit.Controls.TreeViewNode(" ", "TREEVIEW_ROOT_NODE");
		rootNode.GetDomElement().tabIndex = -1;
		rootContainer.appendChild(rootNode.GetDomElement());

		// TreeView Node Interface:
		// The Tree View Node Interface allow nodes to synchronize their selection state to the TreeView.
		// That way the TreeView never has to recursively iterate a potentially huge tree to determine
		// which nodes are selected, to clear all nodes, etc.
		// One might wonder why the TreeView does not maintain the internal selected collection itself
		//  - after all, all event handling is performed by the TreeView, so it knows when a node is
		//    selected. The reason for this, of course, is that nodes can be selected programmatically as well.
		// The TreeView Node Interface also ensures that once a node is attached to the TreeView, any children added to that
		// particular node is configured accordingly with the existing nodes in the TreeView (Selectable, Checkbox, ShowSelectAll).

		var treeViewNodeInterface =
		{
			Select: function(node)
			{
				Fit.Validation.ExpectInstance(node, Fit.Controls.TreeViewNode);

				// Deselect selected node if Multi Selection is not enabled
				if (multiSelect === false && selected.length > 0)
					executeWithNoOnChange(function() { selected[0].Selected(false); });

				// Add node to internal selection
				Fit.Array.Add(selected, node);
			},
			Deselect: function(node)
			{
				Fit.Validation.ExpectInstance(node, Fit.Controls.TreeViewNode);

				// Remove node from internal selection
				Fit.Array.Remove(selected, node);
			},
			Selected: function(val)
			{
				Fit.Validation.ExpectArray(val, true);
				return me.Selected(val); // Fires OnChange
			},
			IsSelectable: function()
			{
				return selectable;
			},
			IsMultiSelect: function()
			{
				return multiSelect;
			},
			ShowSelectAll: function()
			{
				return showSelectAll;
			},
			Repaint: function()
			{
				repaint();
			},
			FireToggle: function(node)
			{
				Fit.Validation.ExpectInstance(node, Fit.Controls.TreeViewNode);
				return fireEventHandlers(onToggleHandlers, node);
			},
			FireToggled: function(node)
			{
				Fit.Validation.ExpectInstance(node, Fit.Controls.TreeViewNode);
				return fireEventHandlers(onToggledHandlers, node);
			},
			FireSelect: function(node)
			{
				Fit.Validation.ExpectInstance(node, Fit.Controls.TreeViewNode);

				// FireSelect is invoked prior to node change.
				// If TreeView is in Single Selection Mode, and a non-selectable node is already selected,
				// new selection is canceled by returning False, to keep existing selection.
				// However, we never want to cancel change if TreeView.Clear() is invoked, in which case forceClear is true.
				if (forceClear === false && multiSelect === false && selected.length > 0 && selected[0].Selectable() === false)
					return false;

				return fireEventHandlers(onSelectHandlers, node);
			},
			FireSelected: function(node)
			{
				Fit.Validation.ExpectInstance(node, Fit.Controls.TreeViewNode);
				fireEventHandlers(onSelectedHandlers, node);
			},
			FireOnChange: function()
			{
				me._internal.FireOnChange();
			},
			GetTreeView: function()
			{
				return me;
			}
		}

		rootNode.GetDomElement()._internal.TreeView = treeViewNodeInterface;

		// Event handling

		rootNode.GetDomElement().onkeydown = function(e)
		{
			var ev = Fit.Events.GetEvent(e);
			var elm = Fit.Events.GetTarget(e);

			if (keyNavigationEnabled === false)
				return;

			//{ PickerControl support - START

			// If used as picker control, make sure first node is selected on initial key press (activeNode has not yet been set)
			if (isPicker === true && isNodeSet(activeNode) === false)
			{
				focusFirstNode(); // Sets activeNode to first child
				return;
			}

			// If onkeydown was not fired from a list item (which usually has focus),
			// it was most likely fired from a host control through HandleEvent(..).
			// In this case activeNode will be set.
			if (elm.tagName !== "LI" && isPicker === true && isNodeSet(activeNode) === true)
				elm = activeNode.GetDomElement();

			//} // PickerControl support - END

			// Variable elm above is almost always a <li> node element since we make sure only these elements are focused
			// when node is clicked or keyboard navigation occure. However, IF the node title for some strange reason contains an element
			// that gains focus (e.g. an input control), that element could be contained in the elm variable when onkeydown is fired.
			// We already make sure that <a> link elements do not gain focus which is more likely to be used as node title, so there
			// is almost no chance the elm variable will ever contain anything else but the <li> node element. But better safe than sorry.
			if (elm.tagName !== "LI")
				return;

			// Element is root node if user clicked next to a child node within root node element
			if (elm === rootNode.GetDomElement())
			{
				if (rootNode.GetChildren().length > 0)
					focusNode(rootNode.GetChildren()[0]); // Select first node

				Fit.Events.PreventDefault(ev);
				return;
			}

			var node = elm._internal.Node;

			// Handle context menu

			if (ev.keyCode === 93 || (Fit.Events.GetModifierKeys().Shift === true && ev.keyCode === 121)) // Context menu button or Shift+F10
			{
				var label = node.GetDomElement().querySelector("span");

				var pos = Fit.Dom.GetPosition(label);
				var scrollContainers = Fit.Dom.GetScrollPosition(label); // TreeView may be placed in container(s) with scroll
				var scrollDocument = Fit.Dom.GetScrollPosition(document.body); // Page may have been scrolled

				pos.X = (pos.X - scrollContainers.X) + scrollDocument.X + label.offsetWidth - 10;
				pos.Y = (pos.Y - scrollContainers.Y) + scrollDocument.Y + label.offsetHeight - 5;

				openContextMenu(node, pos);

				Fit.Events.PreventDefault(ev);
				return;
			}

			// Handle navigation links

			if (ev.keyCode === 13) // Enter
			{
				if (node.Selectable() === true)
				{
					node.Selected(true);
				}
				else
				{
					// Navigate link contained in item

					var links = node.GetDomElement().getElementsByTagName("a");

					if (links.length === 1)
						links[0].click();
				}

				Fit.Events.PreventDefault(ev);
				return;
			}

			// Toggle selection

			if (ev.keyCode === 32) // Spacebar (toggle selection)
			{
				if (node.Selectable() === true)
					toggleNodeSelection(node);

				Fit.Events.PreventDefault(ev);
				return;
			}

			// Determine which node to focus next on keyboard navigation (arrow keys)

			var next = null;

			if (ev.keyCode === 37) // Left (collapse or move to parent)
			{
				// Collapse node if expanded - if not expanded, jump to parent node

				if (node.Expanded() === true)
				{
					node.Expanded(false);
				}
				else
				{
					next = node.GetParent();
				}

				Fit.Events.PreventDefault(ev);
			}
			else if (ev.keyCode === 39) // Right (expand)
			{
				// Expand node if not already expanded, and children are contained

				if (node.Expanded() === false && node.GetChildren().length > 0)
					node.Expanded(true);

				Fit.Events.PreventDefault(ev);
			}
			else if (ev.keyCode === 38) // Up
			{
				// Move selection up
				next = getNodeAbove(node);

				Fit.Events.PreventDefault(ev);
			}
			else if (ev.keyCode === 40) // Down
			{
				// Move selection down
				next = getNodeBelow(node);

				Fit.Events.PreventDefault(ev);
			}

			// Focus next node

			if (next !== null)
				focusNode(next);
		}

		rootNode.GetDomElement().onclick = function(e)
		{
			var elm = Fit.Events.GetTarget(e);

			// If element was a node's checkbox, cancel change to selection,
			// and let node handle whether it should be checked or not.
			if (elm.tagName === "INPUT" && elm.parentElement.tagName === "LI")
				elm.checked = !elm.checked;

			var nodeElm = ((elm.tagName === "LI") ? elm : Fit.Dom.GetParentOfType(elm, "LI"));
			var node = nodeElm._internal.Node;

			// Focus node
			focusNode(node);

			// Toggle node if expand button was clicked
			if (elm === node.GetDomElement().children[0])
				node.Expanded(!node.Expanded());

			// Toggle selection or perform auto postback if node is selectable
			if (elm !== node.GetDomElement().children[0] && node.Selectable() === true)
			{
				toggleNodeSelection(node);
			}
		}

		Fit.Events.AddHandler(me.GetDomElement(), "contextmenu", function(e) { return Fit.Events.PreventDefault(e); }); // Disable context menu
		Fit.Events.AddHandler(me.GetDomElement(), "mouseup", function(e) // Select All feature
		{
			if (Fit.Events.GetPointerState().Buttons.Secondary === true) // Right click
			{
				var target = Fit.Events.GetTarget(e);

				if (target !== me.GetDomElement()) // Skip if right clicking TreeView container (possible if padding is applied)
				{
					var node = ((target.tagName === "LI") ? target._internal.Node : Fit.Dom.GetParentOfType(target, "li")._internal.Node);
					openContextMenu(node);
				}

				return Fit.Events.PreventDefault(e);
			}
		});

		var touchTimeout = -1;
		Fit.Events.AddHandler(me.GetDomElement(), "touchstart", function(e)
		{
			var target = Fit.Events.GetTarget(e);

			if (target !== me.GetDomElement()) // Skip if touching TreeView container (possible if padding is applied)
			{
				touchTimeout = setTimeout(function()
				{
					if (me === null)
					{
						return; // Control was disposed while holding down finger to trigger ContextMenu (unlikely though)
					}

					var node = ((target.tagName === "LI") ? target._internal.Node : Fit.Dom.GetParentOfType(target, "li")._internal.Node);
					openContextMenu(node);

					touchTimeout = -1;
				}, 500);
			}
		});
		Fit.Events.AddHandler(me.GetDomElement(), "touchend", function(e)
		{
			var elm = Fit.Events.GetTarget(e);

			if (touchTimeout !== -1)
			{
				clearTimeout(touchTimeout);
				touchTimeout = -1;
			}
		});
	}

	// ============================================
	// Public
	// ============================================

	/// <function container="Fit.Controls.TreeView" name="WordWrap" access="public" returns="boolean">
	/// 	<description> Get/set value indicating whether Word Wrapping is enabled </description>
	/// 	<param name="val" type="boolean" default="undefined"> If defined, True enables Word Wrapping, False disables it </param>
	/// </function>
	this.WordWrap = function(val)
	{
		Fit.Validation.ExpectBoolean(val, true);

		if (Fit.Validation.IsSet(val) === true)
		{
			me._internal.Data("wordwrap", val.toString()); // Actual word-wrapping is achieved using CSS
			repaint();
		}

		return (me._internal.Data("wordwrap") === "true");
	}

	/// <function container="Fit.Controls.TreeView" name="Selectable" access="public" returns="boolean">
	/// 	<description>
	/// 		Get/set value indicating whether user can change selection state of nodes.
	/// 		This affects all contained nodes. To configure nodes
	/// 		individually, use Selectable(..) function on node instances.
	/// 	</description>
	/// 	<param name="val" type="boolean" default="undefined"> If defined, True enables node selection, False disables it </param>
	/// 	<param name="multi" type="boolean" default="false"> If defined, True enables node multi selection, False disables it </param>
	/* 	<param name="showSelAll" type="boolean" default="false"> If defined, True enables Select All checkbox, False disables it </param> */
	/// </function>
	this.Selectable = function(val, multi, showSelAll)
	{
		Fit.Validation.ExpectBoolean(val, true);
		Fit.Validation.ExpectBoolean(multi, true);
		Fit.Validation.ExpectBoolean(showSelAll, true);

		if (Fit.Validation.IsSet(val) === true)
		{
			selectable = val;
			multiSelect = ((multi === true) ? true : false);
			showSelectAll = ((showSelAll === true) ? true : false);
			//allowDeselect = multi; // DISABLED - Selectable(..) should not change this behaviour!

			me._internal.Data("selectable", selectable.toString());
			me._internal.Data("multiselect", multiSelect.toString());

			var fireOnChange = (selected.length > 0);

			selected = createInternalCollection();

			// Deselect all children and make sure they are configured identically

			if (me.Value() !== "")
			{
				// Help developers - it might be confusing that changing Selectable state also clears selection
				Fit.Browser.Debug("TreeView: Selectable changed - Selections will be cleared");
			}

			executeWithNoOnChange(function() // Prevent n.Selected(false) from firering OnChange event
			{
				executeRecursively(rootNode, function(n)
				{
					if (n === rootNode)
						return; // Skip root node itself

					n.Selectable(selectable, multiSelect, showSelectAll);
					n.Selected(false);
				});
			});

			repaint();

			if (fireOnChange === true)
				me._internal.FireOnChange();
		}

		return selectable;
	}

	/// <function container="Fit.Controls.TreeView" name="Selected" access="public" returns="Fit.Controls.TreeViewNode[]">
	/// 	<description> Get/set selected nodes </description>
	/// 	<param name="val" type="Fit.Controls.TreeViewNode[]" default="undefined"> If defined, provided nodes are selected </param>
	/// </function>
	this.Selected = function(val)
	{
		Fit.Validation.ExpectArray(val, true);

		if (Fit.Validation.IsSet(val) === true)
		{
			selectedOrg = [];
			var fireOnChange = (selected.length > 0);

			executeWithNoOnChange(function() // Prevent node.Selected(true) from firering OnChange event
			{
				me.Clear();

				Fit.Array.ForEach(val, function(n)
				{
					Fit.Validation.ExpectInstance(n, Fit.Controls.TreeViewNode);

					var node = ((n.GetTreeView() === me) ? n : me.GetChild(n.Value(), true)); // Try GetChild(..) in case node was constructed, but with a valid value

					if (node === null)
						Fit.Validation.ThrowError("Node is not associated with this TreeView, unable to change selection");

					Fit.Array.Add(selectedOrg, node);
					node.Selected(true); // Adds node to internal selected collection through TreeViewNodeInterface
					fireOnChange = true;
				});
			});

			if (fireOnChange === true)
				me._internal.FireOnChange();
		}

		return Fit.Array.Copy(selected); // Copy to prevent changes to internal selection array

		/*var copy = Fit.Array.Copy(selected); // Copy to prevent changes to internal selection array
		copy.toString = selected.toString;

		return copy;*/
	}

	/// <function container="Fit.Controls.TreeView" name="SelectAll" access="public">
	/// 	<description> Select all nodes </description>
	/// 	<param name="selected" type="boolean"> Value indicating whether to select or deselect nodes </param>
	/// 	<param name="selectAllNode" type="Fit.Controls.TreeViewNode" default="undefined">
	/// 		If specified, children under given node is selected/deselected recursively.
	/// 		If not specified, all nodes contained in TreeView will be selected/deselected.
	/// 	</param>
	/// </function>
	this.SelectAll = function(selected, selectAllNode/*, suppressOnSelectAllCompletedCallback*/) // suppressOnSelectAllCompletedCallback is for internal use only!
	{
		Fit.Validation.ExpectBoolean(selected);
		Fit.Validation.ExpectInstance(selectAllNode, Fit.Controls.TreeViewNode, true);

		// NOTICE: Selecting thousands of nodes using SelectAll may result in very poor performance
		// due to the large amount of DOM manipulation. The control goes through a full state change
		// for every single item being selected or deselected, so all events fire and reflows are
		// triggered for visible items.
		// To increase performance, temporarily hide TreeView with display:none while SelectAll is being performed.

		var node = (selectAllNode ? selectAllNode : null); // Null = select all nodes, Set = select only children under passed node

		// Fire OnSelectAll event

		if (me._internal.FireOnSelectAll(selected, node) === false)
			return; // Event handler canceled event

		// Change selection and expand (all nodes)

		var changed = false;

		executeWithNoOnChange(function() // Prevent OnChange from firing every time a node's selection state is changed
		{
			var nodes = ((node !== null) ? node.GetChildren() : rootNode.GetChildren());

			Fit.Array.Recurse(nodes, "GetChildren", function(child)
			{
				if (child.Selectable() === true)
				{
					if (child.Selected() !== selected)
					{
						changed = true;
						child.Selected(selected);
					}
				}

				//child.Expanded(true); // DISABLED - This hurts performance significantly for large TreeViews (10-15.000 nodes) as a huge amounts of DOM elements needs to be pushed to render tree, e.g. when opening/closing dropdown hosting TreeView
			});
		});

		//if (suppressOnSelectAllCompletedCallback !== true)
		//{
		me._internal.FireOnSelectAllComplete(selected, node);
		//}

		if (changed === true)
			me._internal.FireOnChange();
	}

	/// <function container="Fit.Controls.TreeView" name="ExpandAll" access="public">
	/// 	<description> Expand all nodes, optionally to a maximum depth </description>
	/// 	<param name="maxDepth" type="integer" default="undefined"> Optional maximum depth to expand nodes </param>
	/// </function>
	this.ExpandAll = function(maxDepth) // Overridden by WSTreeView
	{
		Fit.Validation.ExpectInteger(maxDepth, true);

		Fit.Array.CustomRecurse(me.GetChildren(), function(node)
		{
			node.Expanded(true);
			return (node.GetLevel() + 1 < (maxDepth || 99999) ? node.GetChildren() : null);
		});
	}

	/// <function container="Fit.Controls.TreeView" name="CollapseAll" access="public">
	/// 	<description> Collapse all nodes, optionally to a maximum depth </description>
	/// 	<param name="maxDepth" type="integer" default="undefined"> Optional maximum depth to collapse nodes </param>
	/// </function>
	this.CollapseAll = function(maxDepth) // Overridden by WSTreeView
	{
		Fit.Validation.ExpectInteger(maxDepth, true);

		Fit.Array.CustomRecurse(me.GetChildren(), function(node)
		{
			node.Expanded(false);
			return (node.GetLevel() + 1 < (maxDepth || 99999) ? node.GetChildren() : null);
		});
	}

	/// <function container="Fit.Controls.TreeView" name="AllowDeselect" access="public" returns="boolean">
	/// 	<description>
	/// 		Get/set value indicating whether user is allowed to deselect nodes.
	/// 		By default the user is allowed to deselect nodes.
	/// 	</description>
	/// 	<param name="val" type="boolean" default="undefined"> If defined, changes behaviour to specified value </param>
	/// </function>
	this.AllowDeselect = function(val)
	{
		Fit.Validation.ExpectBoolean(val, true);

		if (Fit.Validation.IsSet(val) === true)
		{
			allowDeselect = val;
		}

		return allowDeselect;
	}

	// See documentation on ControlBase
	this.Value = function(val)
	{
		Fit.Validation.ExpectString(val, true)

		// Set

		if (Fit.Validation.IsSet(val) === true)
		{
			selectedOrg = [];
			var fireOnChange = (selected.length > 0);

			executeWithNoOnChange(function()
			{
				me.Clear();

				var values = val.split(";");

				Fit.Array.ForEach(values, function(nodeValue)
				{
					var nodeVal = decodeReserved(((nodeValue.indexOf("=") === -1) ? nodeValue : nodeValue.split("=")[1]));
					var child = me.GetChild(nodeVal, true);

					if (child !== null)
					{
						Fit.Array.Add(selectedOrg, child);
						child.Selected(true);
						fireOnChange = true;
					}
				});
			});

			if (fireOnChange === true)
				me._internal.FireOnChange();
		}

		// Get

		var nodes = me.Selected();
		var value = "";

		Fit.Array.ForEach(nodes, function(node)
		{
			value += ((value !== "") ? ";" : "") + encodeReserved(node.Title()) + "=" + encodeReserved(node.Value());
		});

		return value;
	}

	// See documentation on ControlBase
	this.IsDirty = function()
	{
		if (selected.length !== selectedOrg.length)
			return true;

		var dirty = false;
		Fit.Array.ForEach(selectedOrg, function(node)
		{
			if (Fit.Array.Contains(selected, node) === false)
			{
				dirty = true;
				return false;
			}
		});
		return dirty;
	}

	// See documentation on ControlBase
	this.Focused = function(focus)
	{
		Fit.Validation.ExpectBoolean(focus, true);

		if (Fit.Validation.IsSet(focus) === true)
		{
			var focused = getNodeFocused();

			if (focus === true && focused === null)
			{
				var nodes = rootNode.GetChildren();

				if (nodes.length > 0)
					nodes[0].Focused(true);
			}
			else if (focus === false && focused !== null)
			{
				focused.Focused(false);
			}
		}

		return (getNodeFocused() !== null);
	}

	/// <function container="Fit.Controls.TreeView" name="Lines" access="public" returns="boolean">
	/// 	<description>
	/// 		Get/set value indicating whether helper lines are shown.
	/// 		Notice that helper lines cause node items to obtain a fixed
	/// 		line height of 20px, making it unsuitable for large fonts.
	/// 	</description>
	/// 	<param name="val" type="boolean" default="undefined"> If defined, True enables helper lines, False disables them </param>
	/// </function>
	this.Lines = function(val)
	{
		Fit.Validation.ExpectBoolean(val, true);

		if (Fit.Validation.IsSet(val) === true)
		{
			if (val === true)
			{
				me.AddCssClass("FitUiControlTreeViewLines");
				me.AddCssClass("FitUiControlTreeViewDotLines"); // Optional, render dotted lines instead of solid lines
			}
			else
			{
				me.RemoveCssClass("FitUiControlTreeViewLines");
				me.RemoveCssClass("FitUiControlTreeViewDotLines");
			}

			repaint();
		}

		return me.HasCssClass("FitUiControlTreeViewLines");
	}

	/// <function container="Fit.Controls.TreeView" name="ContextMenu" access="public" returns="Fit.Controls.ContextMenu">
	/// 	<description> Get/set instance of ContextMenu control triggered when right clicking nodes in TreeView </description>
	/// 	<param name="contextMenu" type="Fit.Controls.ContextMenu" nullable="true"> If defined, assignes ContextMenu control to TreeView </param>
	/// </function>
	this.ContextMenu = function(contextMenu)
	{
		Fit.Validation.ExpectInstance(contextMenu, Fit.Controls.ContextMenu, true);

		if (contextMenu !== undefined) // Accept null to disable context menu
		{
			ctx = contextMenu;
		}

		return ctx;
	}

	/// <function container="Fit.Controls.TreeView" name="Clear" access="public">
	/// 	<description>
	/// 		Fit.Controls.ControlBase.Clear override:
	/// 		Clear control value.
	/// 		Override allows for non-selectable nodes to keep their selection state.
	/// 		This is useful if TreeView has been configured to preselect some non-selectable
	/// 		nodes, hence preventing the user from removing these selections. In that case the
	/// 		desired functionality of the Clear function could be to preserve these preselections.
	/// 		If called with no arguments, all selections are cleared.
	/// 	</description>
	/// 	<param name="preserveNonSelectable" type="boolean" default="false">
	/// 		True causes selection state of non-selectable nodes to be preserved, False do not
	/// 	</param>
	/// </function>
	this.Clear = function(preserveNonSelectable)
	{
		if (selected.length === 0)
			return;

		forceClear = (preserveNonSelectable !== true);

		// Deselecting items causes them to be removed from internal selected collection.
		// Copying array to avoid breaking ForEach which doesn't like collection being modified while iterated.
		var sel = Fit.Array.Copy(selected);

		executeWithNoOnChange(function() // Prevent node.Selected(false) from firering OnChange
		{
			Fit.Array.ForEach(sel, function(node)
			{
				if (preserveNonSelectable !== true || node.Selectable() === true)
					node.Selected(false); // Removes node from internal selected collection through TreeViewNodeInterface
			});
		});

		forceClear = false;

		me._internal.FireOnChange();
	}

	/// <function container="Fit.Controls.TreeView" name="AddChild" access="public">
	/// 	<description> Add node to TreeView </description>
	/// 	<param name="node" type="Fit.Controls.TreeViewNode"> Node to add </param>
	/// 	<param name="atIndex" type="integer" default="undefined"> Optional index at which node is added </param>
	/// </function>
	this.AddChild = function(node, atIndex)
	{
		Fit.Validation.ExpectInstance(node, Fit.Controls.TreeViewNode);
		Fit.Validation.ExpectInteger(atIndex, true);
		rootNode.AddChild(node, atIndex);
	}

	/// <function container="Fit.Controls.TreeView" name="RemoveChild" access="public">
	/// 	<description> Remove node from TreeView - this does not result in OnSelect and OnSelected being fired for selected nodes </description>
	/// 	<param name="node" type="Fit.Controls.TreeViewNode"> Node to remove </param>
	/// </function>
	this.RemoveChild = function(node)
	{
		Fit.Validation.ExpectInstance(node, Fit.Controls.TreeViewNode);
		rootNode.RemoveChild(node);
	}

	/// <function container="Fit.Controls.TreeView" name="RemoveAllChildren" access="public">
	/// 	<description> Remove all nodes contained in TreeView - this does not result in OnSelect and OnSelected being fired for selected nodes </description>
	/// 	<param name="dispose" type="boolean" default="false"> Set True to dispose nodes </param>
	/// </function>
	this.RemoveAllChildren = function(dispose)
	{
		Fit.Validation.ExpectBoolean(dispose, true);

		var fireOnChange = (selected.length > 0);

		// Clear internal selections by creating new collection rather than calling me.Clear().
		// This is done to prevent OnSelect (and OnItemSelectionChanging), OnSelected (and
		// OnItemSelectionChanged), and OnChange from firing if selections were made.
		// In fact, we want to preserve selection state for removed nodes in case it is
		// needed later, e.g. if moved to another TreeView.
		selected = createInternalCollection();

		executeWithNoOnChange(function()
		{
			var children = rootNode.GetChildren();

			Fit.Array.ForEach(children, function(child)
			{
				if (dispose === true)
					child.Dispose();
				else
					rootNode.RemoveChild(child);
			});
		});

		if (fireOnChange === true)
			me._internal.FireOnChange();
	}

	/// <function container="Fit.Controls.TreeView" name="GetChild" access="public" returns="Fit.Controls.TreeViewNode">
	/// 	<description> Get node by value - returns Null if not found </description>
	/// 	<param name="val" type="string"> Node value </param>
	/// 	<param name="recursive" type="boolean" default="false"> If defined, True enables recursive search </param>
	/// </function>
	this.GetChild = function(val, recursive)
	{
		Fit.Validation.ExpectString(val);
		Fit.Validation.ExpectBoolean(recursive, true);

		return rootNode.GetChild(val, recursive);
	}

	/// <function container="Fit.Controls.TreeView" name="GetChildren" access="public" returns="Fit.Controls.TreeViewNode[]">
	/// 	<description> Get all children </description>
	/// </function>
	this.GetChildren = function()
	{
		return rootNode.GetChildren();
	}

	/// <function container="Fit.Controls.TreeView" name="GetAllNodes" access="public" returns="Fit.Controls.TreeViewNode[]">
	/// 	<description> Get all nodes across all children and their children, in a flat structure </description>
	/// </function>
	this.GetAllNodes = function()
	{
		var nodes = [];
		executeRecursively(rootNode, function(n)
		{
			if (n === rootNode)
				return;

			Fit.Array.Add(nodes, n);
		});
		return nodes;
	}

	/// <function container="Fit.Controls.TreeView" name="GetNodeFocused" access="public" returns="Fit.Controls.TreeViewNode">
	/// 	<description> Get node currently having focus - returns Null if no node has focus </description>
	/// </function>
	this.GetNodeFocused = function()
	{
		return getNodeFocused();
	}

	/// <function container="Fit.Controls.TreeView" name="GetActiveNode" access="public" returns="Fit.Controls.TreeViewNode">
	/// 	<description> Get active (highlighted or focused) node - returns Null if no node is currently active </description>
	/// </function>
	this.GetActiveNode = function()
	{
		return isPicker ? activeNode : getNodeFocused();
	}

	/// <function container="Fit.Controls.TreeView" name="SetActiveNode" access="public">
	/// 	<description> Set active (highlighted or focused) node </description>
	/// 	<param name="node" type="Fit.Controls.TreeViewNode"> Node to set active in TreeView </param>
	/// </function>
	this.SetActiveNode = function(node)
	{
		Fit.Validation.ExpectInstance(node, Fit.Controls.TreeViewNode);
		focusNode(node); // Will highlight node if TreeView is used as picker, otherwise focus node
	}

	/// <function container="Fit.Controls.TreeView" name="GetNodeAbove" access="public" returns="Fit.Controls.TreeViewNode">
	/// 	<description> Get node above specified node - returns Null if no node is above the specified one </description>
	/// 	<param name="node" type="Fit.Controls.TreeViewNode"> Node to get node above </param>
	/// </function>
	this.GetNodeAbove = function(node)
	{
		return getNodeAbove(node, true);
	}

	/// <function container="Fit.Controls.TreeView" name="GetNodeBelow" access="public" returns="Fit.Controls.TreeViewNode">
	/// 	<description> Get node below specified node - returns Null if no node is below the specified one </description>
	/// 	<param name="node" type="Fit.Controls.TreeViewNode"> Node to get node below </param>
	/// </function>
	this.GetNodeBelow = function(node)
	{
		return getNodeBelow(node, true, true);
	}

	/// <function container="Fit.Controls.TreeView" name="KeyboardNavigation" access="public" returns="boolean">
	/// 	<description> Get/set value indicating whether keyboard navigation is enabled </description>
	/// 	<param name="val" type="boolean" default="undefined"> If defined, True enables keyboard navigation, False disables it </param>
	/// </function>
	this.KeyboardNavigation = function(val)
	{
		Fit.Validation.ExpectBoolean(val, true);

		if (Fit.Validation.IsSet(val) === true)
		{
			keyNavigationEnabled = val;
		}

		return keyNavigationEnabled;
	}

	// See documentation on ControlBase
	this.Dispose = Fit.Core.CreateOverride(this.Dispose, function(calledInternally)
	{
		Fit.Validation.ExpectBoolean(calledInternally, true);

		// This will destroy control - it will no longer work!

		me._internal.ExecuteWithNoOnChange(function() // Prevent Dispose() on nodes from firing OnChange when they are removed from hierarchy
		{
			rootNode.Dispose();
		});

		if (ctx !== null)
		{
			ctx.Dispose(); //ctx.Hide();
		}

		base();

		if (calledInternally !== true)
		{
			me.Destroy(true); // PickerBase.Destroy()
		}
		
		me = rootContainer = rootNode = keyNavigationEnabled = selectable = multiSelect = showSelectAll = allowDeselect = revealExpandedNodes = selected = selectedOrg = ctx = onSelectHandlers = onSelectedHandlers = onToggleHandlers = onToggledHandlers = onSelectAllHandlers = onSelectAllCompleteHandlers = onContextMenuHandlers = forceClear = isIe8 = isPicker = activeNode = hostFocused = null;
	});

	// ============================================
	// Events (OnChange defined on BaseControl)
	// ============================================

	/// <function container="Fit.Controls.TreeView" name="OnSelect" access="public">
	/// 	<description>
	/// 		Add event handler fired when node is being selected or deselected.
	/// 		Selection can be canceled by returning False.
	/// 		Function receives two arguments:
	/// 		Sender (Fit.Controls.TreeView) and Node (Fit.Controls.TreeViewNode).
	/// 	</description>
	/// 	<param name="cb" type="function"> Event handler function </param>
	/// </function>
	this.OnSelect = function(cb)
	{
		Fit.Validation.ExpectFunction(cb);
		Fit.Array.Add(onSelectHandlers, cb);
	}

	/// <function container="Fit.Controls.TreeView" name="OnSelected" access="public">
	/// 	<description>
	/// 		Add event handler fired when node is selected or deselected.
	/// 		Selection can not be canceled. Function receives two arguments:
	/// 		Sender (Fit.Controls.TreeView) and Node (Fit.Controls.TreeViewNode).
	/// 	</description>
	/// 	<param name="cb" type="function"> Event handler function </param>
	/// </function>
	this.OnSelected = function(cb)
	{
		Fit.Validation.ExpectFunction(cb);
		Fit.Array.Add(onSelectedHandlers, cb);
	}

	/// <function container="Fit.Controls.TreeView" name="OnToggle" access="public">
	/// 	<description>
	/// 		Add event handler fired when node is being expanded or collapsed.
	/// 		Toggle can be canceled by returning False.
	/// 		Function receives two arguments:
	/// 		Sender (Fit.Controls.TreeView) and Node (Fit.Controls.TreeViewNode).
	/// 	</description>
	/// 	<param name="cb" type="function"> Event handler function </param>
	/// </function>
	this.OnToggle = function(cb)
	{
		Fit.Validation.ExpectFunction(cb);
		Fit.Array.Add(onToggleHandlers, cb);
	}

	/// <function container="Fit.Controls.TreeView" name="OnToggled" access="public">
	/// 	<description>
	/// 		Add event handler fired when node is expanded or collapsed.
	/// 		Toggle can not be canceled. Function receives two arguments:
	/// 		Sender (Fit.Controls.TreeView) and Node (Fit.Controls.TreeViewNode).
	/// 	</description>
	/// 	<param name="cb" type="function"> Event handler function </param>
	/// </function>
	this.OnToggled = function(cb)
	{
		Fit.Validation.ExpectFunction(cb);
		Fit.Array.Add(onToggledHandlers, cb);
	}

	/// <function container="Fit.Controls.TreeView" name="OnSelectAll" access="public">
	/// 	<description>
	/// 		Add event handler fired when Select All is used for a given node.
	/// 		This event can be canceled by returning False.
	/// 		Function receives two arguments:
	/// 		Sender (Fit.Controls.TreeView) and EventArgs object.
	/// 		EventArgs object contains the following properties:
	/// 		 - Node: Fit.Controls.TreeViewNode instance
	/// 		 - Selected: Boolean value indicating new selection state
	/// 	</description>
	/// 	<param name="cb" type="function"> Event handler function </param>
	/// </function>
	this.OnSelectAll = function(cb)
	{
		Fit.Validation.ExpectFunction(cb);
		Fit.Array.Add(onSelectAllHandlers, cb);
	}

	/// <function container="Fit.Controls.TreeView" name="OnSelectAllComplete" access="public">
	/// 	<description>
	/// 		Add event handler fired when Select All operation has completed.
	/// 		Function receives two arguments:
	/// 		Sender (Fit.Controls.TreeView) and EventArgs object.
	/// 		EventArgs object contains the following properties:
	/// 		 - Node: Fit.Controls.TreeViewNode instance
	/// 		 - Selected: Boolean value indicating new selection state
	/// 	</description>
	/// 	<param name="cb" type="function"> Event handler function </param>
	/// </function>
	this.OnSelectAllComplete = function(cb)
	{
		Fit.Validation.ExpectFunction(cb);
		Fit.Array.Add(onSelectAllCompleteHandlers, cb);
	}

	/// <function container="Fit.Controls.TreeView" name="OnContextMenu" access="public">
	/// 	<description>
	/// 		Add event handler fired before context menu is shown.
	/// 		This event can be canceled by returning False.
	/// 		Function receives two arguments:
	/// 		Sender (Fit.Controls.TreeView) and Node (Fit.Controls.TreeViewNode).
	/// 		Use Sender.ContextMenu() to obtain a reference to the context menu.
	/// 	</description>
	/// 	<param name="cb" type="function"> Event handler function </param>
	/// </function>
	this.OnContextMenu = function(cb)
	{
		Fit.Validation.ExpectFunction(cb);
		Fit.Array.Add(onContextMenuHandlers, cb);
	}

	// ============================================
	// PickerBase interface
	// ============================================

	var isPicker = false;
	var activeNode = null;
	var hostFocused = false;

	this.OnShow(function(sender)
	{
		// Reset selection and scroll
		unsetActiveNode();
		me.GetDomElement().scrollTop = 0;
		me.GetDomElement().scrollLeft = 0;
	});

	this.OnSelect(function(sender, node)
	{
		// Handlers may return False which will prevent node from being selected, and OnSelected from being fired
		return me._internal.FireOnItemSelectionChanging(node.Title(), node.Value(), node.Selected(), hostFocused === false);
	});

	this.OnSelected(function(sender, node)
	{
		me._internal.FireOnItemSelectionChanged(node.Title(), node.Value(), node.Selected(), hostFocused === false);
	});

	this.OnChange(function(sender)
	{
		me._internal.FireOnItemSelectionComplete();
	});

	this.OnFocus(function(sender)
	{
		me._internal.FireOnFocusIn();
	});

	this.OnBlur(function(sender)
	{
		me._internal.FireOnFocusOut();
	});

	this.SetSelections = function(items)
	{
		Fit.Validation.ExpectArray(items);

		var vals = [];
		var fireOnChange = false;

		Fit.Array.ForEach(items, function(item)
		{
			Fit.Array.Add(vals, item.Value);
		});

		// Set new selections provided by host control

		executeWithNoOnChange(function()
		{
			// Deselect nodes not found in items passed (vals array)

			Fit.Array.ForEach(Fit.Array.Copy(selected), function(selectedNode) // Copying array to prevent "Collection modified" error - deselecting nodes causes them to be removed from array
			{
				// Notice that non-selectable (read only) nodes always keep their selection state
				if (Fit.Array.Contains(vals, selectedNode.Value()) === false && selectedNode.Selectable() === true)
				{
					selectedNode.Selected(false);
					fireOnChange = true;
				}
			});

			// Select nodes from items argument not already selected

			Fit.Array.ForEach(vals, function(nodeVal)
			{
				var child = me.GetChild(nodeVal, true); // Based on indexed lookup - fast!

				// Notice: Items passed may contain nodes that were already selected, hence checking node's
				// Selected state to prevent OnChange from firing if items provided matched TreeView's current selection.
				if (child !== null && child.Selected() === false)
				{
					child.Selected(true);
					fireOnChange = true;
				}
			});
		});

		// Fire OnChange

		if (fireOnChange === true)
			me._internal.FireOnChange();
	}

	this.GetItemByValue = function(val)
	{
		Fit.Validation.ExpectString(val);

		var node = me.GetChild(val, true);

		if (node !== null)
		{
			return { Title: node.Title(), Value: node.Value() };
		}

		return null;
	}

	this.RevealItemInView = function(val)
	{
		Fit.Validation.ExpectString(val);

		var node = me.GetChild(val, true);

		if (node !== null)
		{
			// Expand parent nodes if selected node is a child node.
			// But only expand nodes automatically the first time to
			// allow user to collapse nodes and have them remain collapsed.
			if (revealExpandedNodes === false)
			{
				revealExpandedNodes = true;

				var parent = node;
				while ((parent = parent.GetParent()) !== null)
				{
					parent.Expanded(true);
				}
			}

			focusNode(node);
		}
	}

	this.UpdateItemSelection = function(itemValue, selected, programmaticallyChanged)
	{
		Fit.Validation.ExpectString(itemValue);
		Fit.Validation.ExpectBoolean(selected);
		Fit.Validation.ExpectBoolean(programmaticallyChanged);

		var node = me.GetChild(itemValue, true);

		if (node !== null && node.Selected() !== selected)
		{
			if (node.Selectable() === false)
				return false; // Cancel, node is not selectable

			node.Selected(selected); // Fires OnSelect (which fires OnItemSelectionChanging) and OnSelected (which fires OnItemSelectionChanged)

			if (node.Selected() !== selected)
				return false; // An event handler has canceled change, node's selection state was not updated - return false to prevent host control from adding item
		}
	}

	this._internal = (this._internal ? this._internal : {});

	this._internal.InitializePicker = function() // Override function from PickerBase
	{
		isPicker = true;
		me._internal.Data("picker", "true");
	}

	this._internal.ReportFocused = function(focused) // Override function from PickerBase
	{
		Fit.Validation.ExpectBoolean(focused);
		hostFocused = focused;
	}

	this._internal.FireOnSelectAll = function(selected, node) // Make function available to derivatives
	{
		Fit.Validation.ExpectBoolean(selected);
		Fit.Validation.ExpectInstance(node, Fit.Controls.TreeViewNode, true);

		return fireEventHandlers(onSelectAllHandlers, { Selected: selected, Node: node || null });
	}

	this._internal.FireOnSelectAllComplete = function(selected, node) // Make function available to derivatives
	{
		Fit.Validation.ExpectBoolean(selected);
		Fit.Validation.ExpectInstance(node, Fit.Controls.TreeViewNode, true);

		fireEventHandlers(onSelectAllCompleteHandlers, { Selected: selected, Node: node || null });
	}

    this.HandleEvent = function(e)
    {
		Fit.Validation.ExpectEvent(e, true);

		var ev = Fit.Events.GetEvent(e);

		if (ev.type === "keydown")
		{
			rootNode.GetDomElement().onkeydown(e);

			if (ev.keyCode === 37 || ev.keyCode === 39) // Left/Right
				return false; // Suppress, left/right is reserved for expanding/collapsing nodes
			if (ev.keyCode === 32) // Space
				return false; // Suppress, space is reserved for selecting nodes
		}
    }

	this.Destroy = Fit.Core.CreateOverride(this.Destroy, function(calledInternally)
	{
		Fit.Validation.ExpectBoolean(calledInternally, true);

		// This will destroy control - it will no longer work!

		if (calledInternally !== true)
		{
			me.Dispose(true); // Component.Dispose()
		}

		base(); // PickerBase.Destroy()
	});

	// ============================================
	// Private
	// ============================================

	function executeWithNoOnChange(cb)
	{
		Fit.Validation.ExpectFunction(cb);
		me._internal.ExecuteWithNoOnChange(cb);
	}

	function executeRecursively(node, cb)
	{
		Fit.Validation.ExpectInstance(node, Fit.Controls.TreeViewNode);
		Fit.Validation.ExpectFunction(cb);

		if (cb(node) === false)
			return false;

		Fit.Array.ForEach(node.GetChildren(), function(child)
		{
			if (executeRecursively(child, cb) === false)
				return false;
		});
	}

	function createInternalCollection()
	{
		var selected = [];
		return selected;
	}

	function repaint()
	{
		// In some cases, IE8 does not repaint Treeview properly.
		// This often happens when modifying the TreeView programmatically.
		// Calling this function resolves the problem.

		if (isIe8 === true)
		{
			me.AddCssClass("FitUi_Non_Existing_TreeView_Class");
			me.RemoveCssClass("FitUi_Non_Existing_TreeView_Class");
		}
	}

	function toggleNodeSelection(node)
	{
		Fit.Validation.ExpectInstance(node, Fit.Controls.TreeViewNode);

		if (node.Selected() === true && allowDeselect === false)
			return;

		// TreeViewNodeInterface now takes care of deselecting an existing node if in Single Selection Mode,
		// but prevents selection change if currently selected node is non-selectable (read only).
		// See Select and FireSelect functions on TreeViewNodeInterface for details.
		// Node itself is responsible for firing OnChange which also happens through TreeViewNodeInterface.
		node.Selected(!node.Selected());
	}

	function focusNode(node)
	{
		Fit.Validation.ExpectInstance(node, Fit.Controls.TreeViewNode);

		// Only set node active if it is visible (not hidden by collapsed parent, not
		// hidden by closed DropDown control when used as picker, not hidden using
		// styles such as display:none, and not disconnected from (not rooted in) DOM).
		// RevealItemInView() may be triggered asynchronously by WSDropDown when loading
		// nodes, in which case user may have closed dropdown while waiting for data,
		// resulting in node no longer being visible to focus.
		// We use offsetParent further down which is only available for elements in
		// the render tree - "visible" elements.
		if (Fit.Dom.IsVisible(node.GetDomElement()) === false)
		{
			return;
		}

		if (isPicker === true)
		{
			// Since host control has focus, we use the "active" data attribute
			// to indicate that the node has focus, even though it has not,
			// and keep a reference to the "pseudo focused" node in activeNode.

			if (isNodeSet(activeNode) === true)
				Fit.Dom.Data(activeNode.GetDomElement(), "active", null);

			activeNode = node;
			Fit.Dom.Data(activeNode.GetDomElement(), "active", "true");

			// Scroll active node into view if necessary.
			// This is a bit expensive, especially if we navigate up the
			// tree from 5+ nested levels, and hold down the arrow key.

			// Get node position within control

			// Get position relative to offset parent (parent node) which has position:relative
			var nodePositionWithinControl = { X: activeNode.GetDomElement().offsetLeft, Y: activeNode.GetDomElement().offsetTop };

			// Get node position all the way up to the div.FitUiControl control container which has position:relative
			var offsetParent = activeNode.GetDomElement().offsetParent;
			while (offsetParent !== me.GetDomElement())
			{
				nodePositionWithinControl.X += offsetParent.offsetLeft;
				nodePositionWithinControl.Y += offsetParent.offsetTop;

				offsetParent = offsetParent.offsetParent;
			}

			// Get node height

			var nodeHeightWithoutChildren = -1;

			var childrenContainer = ((activeNode.GetChildren().length > 0) ? activeNode.GetChildren()[0].GetDomElement().parentElement : null);

			if (childrenContainer !== null)
				childrenContainer.style.display = "none";

			nodeHeightWithoutChildren = activeNode.GetDomElement().offsetHeight;

			if (childrenContainer !== null)
				childrenContainer.style.display = "";

			// Scroll item into view

			// Vertical scroll
			if (nodePositionWithinControl.Y > (me.GetDomElement().scrollTop + me.GetDomElement().clientHeight - nodeHeightWithoutChildren) || nodePositionWithinControl.Y < me.GetDomElement().scrollTop)
				me.GetDomElement().scrollTop = Math.ceil(nodePositionWithinControl.Y - (me.GetDomElement().clientHeight / 2)); // Horizontal center

			// Horizontal scroll
			if (activeNode.GetLevel() > 2)
				me.GetDomElement().scrollLeft = Math.ceil(nodePositionWithinControl.X);
			else
				me.GetDomElement().scrollLeft = 0;

			repaint();
		}
		else
		{
			node.Focused(true);
		}
	}

	function focusFirstNode() // Focus first node in TreeView
	{
		if (rootNode.GetChildren().length > 0)
		{
			focusNode(rootNode.GetChildren()[0]);
		}
	}

	function unsetActiveNode() // Unset picker selection
	{
		if (isNodeSet(activeNode) === true)
		{
			Fit.Dom.Data(activeNode.GetDomElement(), "active", null);
			activeNode = null;
		}
	}

	function isNodeSet(node) // Used to check whether activeNode is set and that it has not been disposed
	{
		return (node !== null && node.GetDomElement() !== null); // GetDomElement() returns null if node has been disposed
	}

	function getNodeFocused()
	{
		// Returns focused node or null - active node is not actually focused when TreeView is used as picker control but merely highlighted
		return ((Fit.Dom.GetFocused() && Fit.Dom.GetFocused().tagName === "LI" && Fit.Dom.GetFocused()._internal && Fit.Dom.Contained(rootContainer, Fit.Dom.GetFocused()) === true) ? Fit.Dom.GetFocused()._internal.Node : null);
	}

	function getNodeAbove(node, noLastOnExpand)
	{
		Fit.Validation.ExpectInstance(node, Fit.Controls.TreeViewNode);
		Fit.Validation.ExpectBoolean(noLastOnExpand, true);

		// Get parent node
		var parent = node.GetParent();
		parent = ((parent !== null) ? parent : rootNode);

		// Find current node's position in parent node
		var children = parent.GetChildren();
		var idx = Fit.Array.GetIndex(children, node);

		// Select node above current node, within same parent
		var next = ((idx > 0) ? children[idx-1] : null);

		if (noLastOnExpand === true)
			return next;

		// Now make sure the last node in a hierarchy
		// of expanded nodes gets selected.

		if (next !== null)
		{
			while (next.Expanded() === true)
			{
				children = next.GetChildren();
				next = children[children.length - 1];
			}
		}
		else
		{
			// Current node is top node within parent - select parent
			next = node.GetParent();
		}

		return next;
	}

	function getNodeBelow(node, noFirstOnExpand, noSkipToParent)
	{
		Fit.Validation.ExpectInstance(node, Fit.Controls.TreeViewNode);
		Fit.Validation.ExpectBoolean(noFirstOnExpand, true);
		Fit.Validation.ExpectBoolean(noSkipToParent, true);

		if (node.Expanded() === true && noFirstOnExpand !== true) // Select first child if current node is expanded
		{
			var children = node.GetChildren();
			return children[0];
		}
		else // Get node below current node within same level (parent)
		{
			// Get parent node

			var parent = node.GetParent();
			parent = ((parent !== null) ? parent : rootNode);

			// Find current node's position in parent node
			var children = parent.GetChildren();
			var idx = Fit.Array.GetIndex(children, node);

			// Select node below current node, within same parent
			var next = ((children.length - 1 >= idx + 1) ? children[idx+1] : null);

			if (noSkipToParent === true || next !== null || node.GetParent() === null) // Found, or last element within root node (in which case next variable is Null)
				return next;

			// No more nodes within parent - select node below parent

			return getNodeBelow(parent, true);
		}
	}

	function openContextMenu(node, pos) // pos is optional
	{
		Fit.Validation.ExpectInstance(node, Fit.Controls.TreeViewNode);

		if (ctx === null)
			return;

		if (fireEventHandlers(onContextMenuHandlers, node) === false)
			return;

		if (Fit.Validation.IsSet(pos) === true)
			ctx.Show(pos.X, pos.Y);
		else
			ctx.Show();
	}

	function fireEventHandlers(handlers, evObj)
	{
		var cancel = false;

		Fit.Array.ForEach(handlers, function(cb)
		{
			if (cb(me, evObj) === false)
				cancel = true; // Do NOT cancel loop though! All handlers must be fired!
		});

		return !cancel;
	}

	function decodeReserved(str)
	{
		Fit.Validation.ExpectString(str);
		return str.replace(/%3B/g, ";").replace(/%3D/g, "="); // Decode characters reserved for value format
	}

	function encodeReserved(str)
	{
		Fit.Validation.ExpectString(str);
		return str.replace(/;/g, "%3B").replace(/=/g, "%3D"); // Encode characters reserved for value format
	}

	init();
}

/// <function container="Fit.Controls.TreeViewNode" name="TreeViewNode" access="public">
/// 	<description> Create instance of TreeViewNode </description>
/// 	<param name="displayTitle" type="string"> Node title </param>
/// 	<param name="nodeValue" type="string"> Node value </param>
/// </function>
Fit.Controls.TreeViewNode = function(displayTitle, nodeValue)
{
	Fit.Validation.ExpectString(displayTitle);
	Fit.Validation.ExpectString(nodeValue);

	var me = this;
	var elmLi = null;
	var elmUl = null;
	var cmdToggle = null;
	var chkSelect = null;
	var lblTitle = null;
	var childrenIndexed = {};
	var childrenArray = [];
	var lastChild = null;
	var behavioralNodeCallback = null;

	// ============================================
	// Init
	// ============================================

	function init()
	{
		elmLi = document.createElement("li");
		cmdToggle = document.createElement("div");
		lblTitle = document.createElement("span");

		me.Title(displayTitle);
		Fit.Dom.Data(elmLi, "value", encode(nodeValue));

		Fit.Dom.Data(elmLi, "state", "static");
		Fit.Dom.Data(elmLi, "selectable", "false");
		Fit.Dom.Data(elmLi, "selected", "false");
		Fit.Dom.Data(elmLi, "last", "false");

		elmLi.tabIndex = 0; // Make focusable

		elmLi.appendChild(cmdToggle);
		elmLi.appendChild(lblTitle);

		elmLi._internal = { Node: me, TreeView: null, TreeViewConfigOverrides: { Selectable: undefined, ShowCheckbox: undefined, ShowSelectAll: undefined } };
	}

	// ============================================
	// Public
	// ============================================

	/// <function container="Fit.Controls.TreeViewNode" name="Title" access="public" returns="string">
	/// 	<description> Get/set node title </description>
	/// 	<param name="val" type="string" default="undefined"> If defined, node title is updated </param>
	/// </function>
	this.Title = function(val)
	{
		Fit.Validation.ExpectString(val, true);

		if (Fit.Validation.IsSet(val) === true)
		{
			lblTitle.innerHTML = val;

			// Make sure any contained links do not receive focus when navigating TreeView with Tab/Shift+Tab
			Fit.Array.ForEach(lblTitle.getElementsByTagName("a"), function(link) { link.tabIndex = -1; });
		}

		return Fit.Dom.Text(lblTitle); // Using inner text to get rid of HTML formatting
	}

	/// <function container="Fit.Controls.TreeViewNode" name="Value" access="public" returns="string">
	/// 	<description> Get node value </description>
	/// </function>
	this.Value = function()
	{
		return decode(Fit.Dom.Data(elmLi, "value")); // Read only - value has been used on parent node as index (childrenIndexed)
	}

	/// <function container="Fit.Controls.TreeViewNode" name="Expanded" access="public" returns="boolean">
	/// 	<description> Get/set value indicating whether node is expanded </description>
	/// 	<param name="val" type="boolean" default="undefined"> If defined, True expands node, False collapses it </param>
	/// </function>
	this.Expanded = function(expand)
	{
		Fit.Validation.ExpectBoolean(expand, true);

		if (Fit.Validation.IsSet(expand) === true && Fit.Dom.Data(elmLi, "state") !== "static" && me.Expanded() !== expand)
		{
			var tv = elmLi._internal.TreeView;

			// Fire OnToggle event

			if (tv !== null && tv.FireToggle(me) === false)
				return (Fit.Dom.Data(elmLi, "state") === "expanded");

			// Update state

			Fit.Dom.Data(elmLi, "state", ((expand === true) ? "expanded" : "collapsed"));

			// Repaint and fire OnToggled event

			if (tv !== null)
			{
				tv.Repaint();
				tv.FireToggled(me);
			}
		}

		return (Fit.Dom.Data(elmLi, "state") === "expanded");
	}

	/// <function container="Fit.Controls.TreeViewNode" name="SetBehavioralNodeCallback" access="public">
	/// 	<description>
	/// 		Set callback invoked when node is selected.
	/// 		A behavioral node is not considered data, so selecting it will not change
	/// 		the control value. Since the node is not considered data, it will not trigger
	/// 		the OnSelect and OnSelected TreeView events either.
	/// 		Callback receives two arguments:
	/// 		Sender (Fit.Controls.TreeView) and EventArgs object.
	/// 		EventArgs object contains the following properties:
	/// 		 - Node: Fit.Controls.TreeViewNode instance
	/// 		 - Selected: Boolean value indicating new selection state
	/// 		Callback may cancel changed selection state by returning False.
	/// 	</description>
	/// 	<param name="func" type="function"> Callback function invoked when node is selected - Null disables behavioral state </param>
	/// </function>
	this.SetBehavioralNodeCallback = function(func)
	{
		Fit.Validation.ExpectFunction(func !== null ? func : function() {});
		behavioralNodeCallback = func;
	}

	/// <function container="Fit.Controls.TreeViewNode" name="IsBehavioralNode" access="public" returns="boolean">
	/// 	<description> Returns True if this is a behavioral node, otherwise False - see SetBehavioralNodeCallback for more details </description>
	/// </function>
	this.IsBehavioralNode = function()
	{
		return behavioralNodeCallback !== null;
	}

	/// <function container="Fit.Controls.TreeViewNode" name="Selectable" access="public" returns="boolean">
	/// 	<description> Get/set value indicating whether user can change node selection state </description>
	/// 	<param name="val" type="boolean" default="undefined"> If defined, True enables node selection, False disables it </param>
	/// 	<param name="showCheckbox" type="boolean" default="false"> If defined, True adds a selection checkbox, False removes it </param>
	/* 	<param name="showSelectAll" type="boolean" default="false"> If defined, True adds a Select All checkbox useful for selecting all children, False removes it </param> */
	/// </function>
	this.Selectable = function(val, showCheckbox, showSelectAll)
	{
		Fit.Validation.ExpectBoolean(val, true);
		Fit.Validation.ExpectBoolean(showCheckbox, true);
		Fit.Validation.ExpectBoolean(showSelectAll, true);

		if (Fit.Validation.IsSet(val) === true)
		{
			// Prevent node from obtaining configuration from TreeView if explicitly set
			// before adding node to TreeView. See AddChild(..) for TreeViewConfigOverrides usage.
			elmLi._internal.TreeViewConfigOverrides.Selectable = val;
			elmLi._internal.TreeViewConfigOverrides.ShowCheckbox = showCheckbox;
			elmLi._internal.TreeViewConfigOverrides.ShowSelectAll = showSelectAll;

			Fit.Dom.Data(elmLi, "selectable", val.toString());

			if (showCheckbox === true && chkSelect === null)
			{
				chkSelect = document.createElement("input");
				chkSelect.type = "checkbox";
				chkSelect.tabIndex = "-1";
				chkSelect.checked = me.Selected();

				// Alternatively use Fit.UI CheckBox (will most likely need changes to CSS to adjust position and size)
				// Also search for chkSelect._FitControl to find related changes if this is enabled at some point!
				/*var chk = new Fit.Controls.CheckBox(Fit.Data.CreateGuid());
				chkSelect = chk.GetDomElement();
				chk.OnChange(function(sender)
				{
					chkSelect.checked = chk.Checked();
				});
				chkSelect._FitControl = chk;*/

				Fit.Dom.InsertBefore(lblTitle, chkSelect);
			}
			else if (showCheckbox === false && chkSelect !== null)
			{
				Fit.Dom.Remove(chkSelect);
				chkSelect = null;
			}

			if (chkSelect !== null)
			{
				chkSelect.disabled = ((val === false) ? true : false);
				//chkSelect._FitControl.Enabled(val); // Related to alternative use of Fit.UI CheckBox
			}
		}

		return (Fit.Dom.Data(elmLi, "selectable") === "true");
	}

	/// <function container="Fit.Controls.TreeViewNode" name="HasCheckbox" access="public" returns="boolean">
	/// 	<description> Get value indicating whether node has its selection checkbox enabled </description>
	/// </function>
	this.HasCheckbox = function()
	{
		return (chkSelect !== null);
	}

	/// <function container="Fit.Controls.TreeViewNode" name="Selected" access="public" returns="boolean">
	/// 	<description>
	/// 		Get/set value indicating whether node is selected.
	/// 		If node is selected, it will automatically be made
	/// 		selectable, if not already done so.
	/// 	</description>
	/// 	<param name="select" type="boolean" default="undefined"> If defined, True selects node, False deselects it </param>
	/// </function>
	this.Selected = function(select, suppressOnChange) // suppressOnChange is for internal use only!
	{
		Fit.Validation.ExpectBoolean(select, true);

		// Notice:
		// Nodes are responsible for keeping the TreeView current
		// in regards to selected nodes, through the TreeViewNodeInterface.
		// If this approach was not used, TreeView would have to
		// iterate recursively over all nodes to determine which
		// nodes are selected, which would be too expensive for
		// huge tree views containing thousands of nodes.

		if (Fit.Validation.IsSet(select) === true && me.Selected() !== select)
		{
			var tv = elmLi._internal.TreeView;

			if (behavioralNodeCallback !== null)
			{
				if (behavioralNodeCallback(me.GetTreeView(), { Node: me, Selected: !me.Selected() }) === false)
				{
					return (Fit.Dom.Data(elmLi, "selected") === "true");
				}
			}

			// Fire OnSelect event

			if (behavioralNodeCallback === null)
			{
				if (tv !== null && tv.FireSelect(me) === false)
				{
					return (Fit.Dom.Data(elmLi, "selected") === "true");
				}
			}

			var wasSelected = me.Selected();

			// Update state

			Fit.Dom.Data(elmLi, "selected", select.toString());

			if (chkSelect !== null)
				chkSelect.checked = select;

			// Repaint

			if (tv !== null)
				tv.Repaint();
			
			// Synchronize selection to TreeView (unless this was a behavioral node (not a data node))

			if (behavioralNodeCallback === null && tv !== null)
			{
				if (select === true && wasSelected === false)
				{
					tv.Select(me);
					tv.FireSelected(me);

					if (suppressOnChange !== true)
						tv.FireOnChange();
				}
				else if (select === false && wasSelected === true)
				{
					tv.Deselect(me);
					tv.FireSelected(me);

					if (suppressOnChange !== true)
						tv.FireOnChange();
				}
			}
		}

		return (Fit.Dom.Data(elmLi, "selected") === "true");
	}

	/// <function container="Fit.Controls.TreeViewNode" name="Focused" access="public" returns="boolean">
	/// 	<description> Get/set value indicating whether node has focus </description>
	/// 	<param name="val" type="boolean" default="undefined"> If defined, True assigns focus, False removes it (blur) </param>
	/// </function>
	this.Focused = function(val)
	{
		Fit.Validation.ExpectBoolean(val, true);

		if (Fit.Validation.IsSet(val) === true)
		{
			if (val === true)
				elmLi.focus();
			else if (Fit.Dom.GetFocused() === elmLi)
				elmLi.blur();
		}

		return (Fit.Dom.GetFocused() === elmLi);
	}

	/// <function container="Fit.Controls.TreeViewNode" name="GetParent" access="public" returns="Fit.Controls.TreeViewNode">
	/// 	<description> Get parent node - returns Null if node has no parent </description>
	/// </function>
	this.GetParent = function()
	{
		if (!elmLi.parentElement)
			return null; // Not rooted in another node yet
			if (!elmLi.parentElement.parentElement._internal || !elmLi.parentElement.parentElement._internal.TreeView) // Notice: _internal may have been set by e.g. Fit.Events.AddHandler
			return null; // Rooted, but not in another node - most likely rooted in TreeView UL container
		if (elmLi.parentElement.parentElement._internal.Node.Value() === "TREEVIEW_ROOT_NODE")
			return null; // Indicate top by returning Null when root node is reached

		return elmLi.parentElement.parentElement._internal.Node;
	}

	/// <function container="Fit.Controls.TreeViewNode" name="GetTreeView" access="public" returns="Fit.Controls.TreeView">
	/// 	<description> Returns TreeView if associated, otherwise Null </description>
	/// </function>
	this.GetTreeView = function()
	{
		if (elmLi._internal.TreeView !== null)
			return elmLi._internal.TreeView.GetTreeView();

		return null;
	}

	/// <function container="Fit.Controls.TreeViewNode" name="GetLevel" access="public" returns="integer">
	/// 	<description> Get node depth in current hierarchy - root node is considered level 0 </description>
	/// </function>
	this.GetLevel = function()
	{
		var level = 0;
		var node = me;

		while ((node = node.GetParent()) !== null) // Parent is Null when no more nodes are found, and when TREEVIEW_ROOT_NODE is reached for nodes rooted in TreeView
		{
			level++;
		}

		return level;
	}

	/// <function container="Fit.Controls.TreeViewNode" name="GetIndex" access="public" returns="integer">
	/// 	<description> Get node index (position in parent node or TreeView) - returns -1 if node has not been added yet </description>
	/// </function>
	this.GetIndex = function()
	{
		if (me.GetTreeView() === null)
		{
			return -1;
		}

		return Fit.Dom.GetIndex(me.GetDomElement());
	}

	/// <function container="Fit.Controls.TreeViewNode" name="AddChild" access="public">
	/// 	<description> Add child node </description>
	/// 	<param name="node" type="Fit.Controls.TreeViewNode"> Node to add </param>
	/// 	<param name="atIndex" type="integer" default="undefined"> Optional index at which node is added </param>
	/// </function>
	this.AddChild = function(node, atIndex)
	{
		Fit.Validation.ExpectInstance(node, Fit.Controls.TreeViewNode);
		Fit.Validation.ExpectInteger(atIndex, true);

		// Remove node from existing parent if already rooted.
		// This is important to make sure that TreeView, from which
		// node is moved, is updated to reflect the change, and
		// to ensure that node (and its children) is no longer capable
		// of updating the old TreeView through its TreeViewNodeInterface.

		if (node.GetParent() !== null)
			node.GetParent().RemoveChild(node);
		if (node.GetTreeView() !== null)
			node.GetTreeView().RemoveChild(node);

		// Register child node.
		// This is done prior to firing any events so that event handlers
		// can rely on node being fully accessible through DOM (rooted).

		// Create child container (<ul>) if not already added
		if (elmUl === null)
		{
			elmUl = document.createElement("ul");
			elmLi.appendChild(elmUl);

			Fit.Dom.Data(elmLi, "state", "collapsed");
		}

		if (Fit.Validation.IsSet(atIndex) === false || lastChild === null || atIndex > lastChild.GetIndex())
		{
			// Make sure last node is marked as such, allowing for specialized CSS behaviour
			if (lastChild !== null)
				Fit.Dom.Data(lastChild.GetDomElement(), "last", "false");
			Fit.Dom.Data(node.GetDomElement(), "last", "true");
			lastChild = node;
		}

		// Add child to DOM and internal collections
		if (lastChild === node)
		{
			elmUl.appendChild(node.GetDomElement());
			childrenIndexed[node.Value()] = node;
			Fit.Array.Add(childrenArray, node);
		}
		else
		{
			Fit.Dom.InsertAt(elmUl, atIndex, node.GetDomElement());
			childrenIndexed[node.Value()] = node;
			Fit.Array.Insert(childrenArray, atIndex, node);
		}

		// Changing data attribute above requires repaint in IE8
		// for dynamically added nodes to render helper lines properly.
		if (elmLi._internal.TreeView !== null)
			elmLi._internal.TreeView.Repaint();
		
		// Behavioral node support
		
		if (node.IsBehavioralNode() === true)
		{
			executeRecursively(node, function(n)
			{
				n.GetDomElement()._internal.TreeView = elmLi._internal.TreeView;
			});

			return; // Skip remaining wiring - behavioral nodes are not considered data, so it should not fire OnSelect, OnSelected, and OnChange
		}

		// Configure TreeView association and synchronize selection state

		var tv = elmLi._internal.TreeView;

		if (tv !== null)
		{
			var selected = [];
			var fireOnChange = false;

			executeRecursively(node, function(n)
			{
				//n.GetDomElement()._internal.TreeView = null; // Avoid conflicts if node currently belongs to another TreeView (e.g. drag and drop)

				if (n.Selected() === true)
				{
					// Deselect node which allows us to reselect it later and have all
					// relevant events fired with appropriate current selection state set
					// (OnSelect with Selected = false, and OnSelected with Selected = true).
					Fit.Array.Add(selected, n);
					n.Selected(false); // Does not fire any events since TreeViewNodeInterface is not set yet
				}

				n.GetDomElement()._internal.TreeView = tv;
				var ovr = n.GetDomElement()._internal.TreeViewConfigOverrides;

				// Configure node like TreeView, unless node has been explicitly configured (see TreeViewConfigOverrides)
				n.Selectable(((Fit.Validation.IsSet(ovr.Selectable) === true) ? ovr.Selectable : tv.IsSelectable()), ((Fit.Validation.IsSet(ovr.ShowCheckbox) === true) ? ovr.ShowCheckbox : tv.IsMultiSelect()), ((Fit.Validation.IsSet(ovr.ShowSelectAll) === true) ? ovr.ShowSelectAll : tv.ShowSelectAll()));
			});

			// Re-select nodes initially selected

			Fit.Array.ForEach(selected, function(node)
			{
				// Notice that TreeViewNodeInterface is temporarily removed to prevent
				// node.Selected(true) from firing events - we do not want OnChange to be
				// fired multiple times, so we fire only OnSelect and OnSelected below.
				// DISABLED: This is garbage! Functions such as node.GetTreeView() or node.Expanded(true)
				// will not work properly with this approach from e.g. an OnSelected event handler! Fixed
				// by passing an argument to node.Selected(..) instead which suppresses the OnChange event.
				/*node.GetDomElement()._internal.TreeView = null;

				if (tv.FireSelect(node) === true)
				{
					node.Selected(true);
					tv.Select(node);
					tv.FireSelected(node);
					fireOnChange = true;
				}

				node.GetDomElement()._internal.TreeView = tv;*/

				var wasSelected = node.Selected();
				var newSelection = node.Selected(true, true); // Second True is an internal argument suppressing firing of the OnChange event

				if (wasSelected !== newSelection)
				{
					fireOnChange = true;
				}
			});

			// Fire OnChange if selections were made

			if (fireOnChange === true)
				tv.FireOnChange();
		}
	}

	/// <function container="Fit.Controls.TreeViewNode" name="RemoveChild" access="public">
	/// 	<description> Remove child node - this does not result in TreeView.OnSelect and TreeView.OnSelected being fired for selected nodes </description>
	/// 	<param name="node" type="Fit.Controls.TreeViewNode"> Node to remove </param>
	/// </function>
	this.RemoveChild = function(node)
	{
		Fit.Validation.ExpectInstance(node, Fit.Controls.TreeViewNode);

		if (node.GetParent() === me || (me.Value() === "TREEVIEW_ROOT_NODE" && me.GetTreeView().GetChild(node.Value()) !== null))
		{
			// Deconfigure TreeView association and synchronize selection state

			var tv = node.GetDomElement()._internal.TreeView;

			if (tv !== null)
			{
				// Deselecting selected nodes in TreeView

				var fireOnChange = false;

				executeRecursively(node, function(n)
				{
					if (n.Selected() === true)
					{
						// Node itself remains selected, this only removes node from TreeView's internal selection collection.
						// Notice that OnSelect and OnSelected is not fired since the node is not actually deselected, only removed from TreeView.
						tv.Deselect(n);

						fireOnChange = true;
					}

					n.GetDomElement()._internal.TreeView = null; // Make sure removed node cannot update TreeView anymore
				});

				if (fireOnChange === true)
					tv.FireOnChange();
			}

			// Remove from DOM

			elmUl.removeChild(node.GetDomElement());
			delete childrenIndexed[node.Value()];
			Fit.Array.Remove(childrenArray, node);

			if (childrenArray.length === 0)
			{
				elmLi.removeChild(elmUl);
				elmUl = null;
				Fit.Dom.Data(elmLi, "state", "static");
			}

			// Update last node

			if (node === lastChild)
			{
				lastChild = null;
				Fit.Dom.Data(node.GetDomElement(), "last", "false");

				if (childrenArray.length > 0)
				{
					lastChild = childrenArray[childrenArray.length - 1];
					Fit.Dom.Data(lastChild.GetDomElement(), "last", "true");
				}
			}

			// Make sure helper lines are repainted on IE8
			if (elmLi._internal.TreeView !== null)
				elmLi._internal.TreeView.Repaint();
		}
	}

	/// <function container="Fit.Controls.TreeViewNode" name="GetChild" access="public" returns="Fit.Controls.TreeViewNode">
	/// 	<description> Get node by value - returns Null if not found </description>
	/// 	<param name="val" type="string"> Node value </param>
	/// 	<param name="recursive" type="boolean" default="false"> If defined, True enables recursive search </param>
	/// </function>
	this.GetChild = function(val, recursive)
	{
		Fit.Validation.ExpectString(val);
		Fit.Validation.ExpectBoolean(recursive, true);

		var node = childrenIndexed[val];

		if (node === undefined && recursive === true)
		{
			var found = null;
			Fit.Array.ForEach(childrenArray, function(child)
			{
				found = child.GetChild(val, recursive);

				if (found !== null)
					return false;
			});
			return found;
		}

		return ((node !== undefined) ? node : null);
	}

	/// <function container="Fit.Controls.TreeViewNode" name="GetChildren" access="public" returns="Fit.Controls.TreeViewNode[]">
	/// 	<description> Get all children </description>
	/// </function>
	this.GetChildren = function()
	{
		return Fit.Array.Copy(childrenArray); // Copy to prevent changes to internal children array
	}

	/// <function container="Fit.Controls.TreeViewNode" name="Dispose" access="public">
	/// 	<description> Destroys object to free up memory </description>
	/// </function>
	this.Dispose = function()
	{
		// This will destroy node - it will no longer work!

		// Dispose children
		Fit.Array.ForEach(Fit.Array.Copy(childrenArray), function(child) { child.Dispose(); });

		// Remove from DOM

		var parentNode = me.GetParent();

		if (parentNode !== null)
		{
			parentNode.RemoveChild(me);
		}
		else
		{
			if (me.GetTreeView() !== null)
			{
				me.GetTreeView().RemoveChild(me);
			}
			else
			{
				Fit.Dom.Remove(elmLi);
			}
		}

		// Dispose private members
		me = elmLi = elmUl = cmdToggle = chkSelect = lblTitle = childrenIndexed = childrenArray = lastChild = behavioralNodeCallback = null;
	}

	/// <function container="Fit.Controls.TreeViewNode" name="GetDomElement" access="public" returns="DOMElement">
	/// 	<description> Get DOMElement representing node </description>
	/// </function>
	this.GetDomElement = function()
	{
		return elmLi;
	}

	// Private

	function executeRecursively(node, cb)
	{
		Fit.Validation.ExpectInstance(node, Fit.Controls.TreeViewNode);
		Fit.Validation.ExpectFunction(cb);

		if (cb(node) === false)
			return false;

		Fit.Array.ForEach(node.GetChildren(), function(child)
		{
			if (executeRecursively(child, cb) === false)
				return false;
		});
	}

	function decode(str)
	{
		Fit.Validation.ExpectString(str);
		return decodeURIComponent(str); // Turn string back to original value
	}

	function encode(str)
	{
		Fit.Validation.ExpectString(str);
		return encodeURIComponent(str); // Allow value to be stored in a HTML Data Attribute
	}

	init();
}

Fit.Controls.TreeView.Node = Fit.Controls.TreeViewNode; // Backward compatibility

/// <container name="Fit.Controls.WSTreeView" extends="Fit.Controls.TreeView">
/// 	TreeView control allowing data from a
/// 	WebService to be listed in a structured manner.
/// 	Extending from Fit.Controls.TreeView.
///
/// 	Notice: WSTreeView works a bit differently from TreeView.
/// 	Nodes are loaded on-demand, meaning when Selected(..) or Value(..)
/// 	is called to set selections, nodes not loaded yet are stored internally as
/// 	preselections. Nodes not loaded yet will not have OnSelect, OnSelected,
/// 	and any associated events fired, until they are actually loaded.
/// 	But they will be returned when Selected() or Value() is called (getters).
/// 	OnChange, however, will always be fired when selections are changed,
/// 	no matter if nodes are loaded or not.
/// </container>

/// <function container="Fit.Controls.WSTreeView" name="WSTreeView" access="public">
/// 	<description> Create instance of WSTreeView control </description>
/// 	<param name="ctlId" type="string" default="undefined"> Unique control ID that can be used to access control using Fit.Controls.Find(..) </param>
/// </function>
Fit.Controls.WSTreeView = function(ctlId)
{
	Fit.Validation.ExpectStringValue(ctlId, true);
	Fit.Core.Extend(this, Fit.Controls.TreeView).Apply(ctlId);

	var me = this;
	var url = null;
	var jsonpCallback = null;
	var rootNode = null;
	var preSelected = {};
	var orgSelected = [];
	var loadDataOnInit = true;
	var dataLoading = false;			// True when requesting data via Reload, EnsureData, and SelectAll
	var nodesLoading = 0;				// Value is above zero when nodes are being loaded when expanded
	var recursiveNodeLoadCount = -1;	// Value used by recursivelyLoadAllNodes(..) to keep track of progress when chain loading nodes
	var onDataLoadedCallback = [];
	var selectAllMode = Fit.Controls.WSTreeViewSelectAllMode.Progressively;
	var onRequestHandlers = [];
	var onResponseHandlers = [];
	var onAbortHandlers = [];
	var onPopulatedHandlers = [];
	var baseSelected = this.Selected;	// Used by Selected(..), Value(), and SetSelections(..)

	// Support for ExpandAll which may trigger WebService requests to load data.
	// We therefore need to keep some state to resume ExpandAll when nodes are received,
	// which is done using the WSTreeView's OnPopulated event further down.
	var expandCollapseAllMode = -1;			// 0 = Collapse, 1 = Expand
	var expandCollapseAllMaxDepth = 99999;	// The maximum depth to expand/collapse

	function init()
	{
		rootNode = me.GetDomElement().firstChild.firstChild._internal.Node;
		rootNode.GetDomElement()._internal.WSHasChildren = true; // Support for nodeFullyLoaded(..)

		var rootedEventId = -1;
		rootedEventId = Fit.Events.AddHandler(me.GetDomElement(), "#rooted", function(elm)
		{
			if (loadDataOnInit === true)
			{
				me.Reload(true);
			}

			Fit.Events.RemoveHandler(me.GetDomElement(), rootedEventId);
		});

		me.OnToggle(function(sender, node)
		{
			// Load node data when expanded

			if (node.IsBehavioralNode() === true)
				return; // Do not request data for behavioral node

			if (node.Expanded() === true) // Node is currently expanded and will now become collapsed
				return;

			if (dataLoading === true && node.GetDomElement()._internal.WSHasChildren === true && node.GetDomElement()._internal.WSDone !== true)
			{
				// Node contains remote children that has not yet been loaded, and
				// data is currently being loaded, e.g. by EnsureData(..), Reload(..),
				// or SelectAll(..). Adding request to process queue.
				onDataLoaded(function() { node.Expanded(true); });
				return false;
			}

			if (node.GetDomElement()._internal.WSLoading === true)
			{
				// Data for this node is currently being loaded.
				// Return False to cancel toggle to prevent user from being
				// able to expand node (and re-trigger data load) multiple times.
				return false;
			}

			var dataStartedLoading = loadNodeData(node, function(nodePopulated) // Returns False if there are no remote nodes to load, or if request is suppressed using an OnRequest handler
			{
				// Children now loaded and populated

				nodesLoading--;

				if (nodeDisposedOrDetached(node) === false)
				{
					delete node.GetDomElement()._internal.WSLoading;
					node.Expanded(true); // Unfortunately causes both OnToggle and OnToggled to be fired, although OnToggle has already been fired once (canceled below)
				}

				if (nodesLoading === 0)
				{
					// Reload, SelectAll, or EnsureData may have been called while
					// node was loading - make sure they are resumed from process queue.
					fireOnDataLoadedToResumeProcessQueue();
				}
			});

			if (dataStartedLoading === true)
			{
				// Prevent e.g. EnsureData, Reload, and SelectAll from loading while current node
				// is being loaded and populated.
				// We cannot use the dataLoading variable for this though, as it would also prevent the
				// user from expanding (and requesting data for) multiple nodes simultaneously since this OnToggle
				// handler prevents the user from expanding nodes if dataLoading is True (set by EnsureData/Reload/etc).
				// Instead we use nodesLoading which is incremented and decremented when node data is requested and populated.
				// EnsureData(..), Reload(..) and other functions fetching data checks this variable, and
				// if its value is above zero, the functions will reschedule and run after all requested
				// nodes are done loading.
				nodesLoading++;

				node.GetDomElement()._internal.WSLoading = true;
				return false; // Cancel toggle, will be "resumed" (triggered again in loadNodeData callback above) when data is loaded
			}

			if (dataStartedLoading === false && node.GetDomElement()._internal.WSHasChildren === true && node.GetChildren().length === 1 && node.GetChildren()[0].Value() === "__" && node.GetChildren()[0].Title() === "__")
			{
				// Node has remote children and no pre-populated children, but data load
				// was not started, meaning it was suppressed using an OnRequest handler.
				// Prevent node from expanding since it will reveal the place holder node making
				// parent node expandable.
				return false;
			}
		});

		//{ SelectAll - Mode: Instantly

		// Instant Mode - how it works:
		// Node on which Select All is triggered will have all its children removed (in OnResponse handler)
		// and replaced by the new data returned. This is to prevent that any children already loaded is
		// expanded and causing separate requests. Instant Mode is quaranteed to only trigger
		// one request and fire OnChange only once, provided that no nodes returned has HasChildren set to True
		// which WILL trigger additional requests and fire OnChange multiple times.
		// Instant Mode provides better performance over Progressive Mode since the latter will constantly
		// occupy the JS thread on and off, as nodes are received from multiple requests, making the browser less responsive.
		// However, Instant Mode loads data by expanding nodes while Progressive Mode can do this without affecting the UI.
		// Progressive Mode is handled in SelectAll function override.
		// TBD: Can/should we change implementation so it uses the new node loader mechanism which Progressive Mode uses,
		// so SelectAll in Instant Mode does not expand nodes, but merely loads children?

		me.OnSelectAll(function(sender, eventArgs)
		{
			if (selectAllMode === Fit.Controls.WSTreeViewSelectAllMode.Progressively)
				return; // Progressive Mode is handled in WSTreeView.SelectAll function override

			var node = ((eventArgs.Node !== null) ? eventArgs.Node : rootNode);
			var internal = node.GetDomElement()._internal;

			// Check whether all nodes have already been loaded

			if (nodeFullyLoaded(node) === true)
				return; // Everything is already loaded, let TreeView.SelectAll take care of selecting and expanding nodes

			// Some (or all) children missing - load now

			// Flags set below ensures that Select All is resumed in OnRequest and OnPopulated event handlers
			internal.WSSelectAll = true; // Used when firing OnRequest, OnResponse, and OnPopulated events which expose an eventArgs.SelectAll boolean
			internal.WSCheckedState = eventArgs.Selected;

			if (node === rootNode) // Load root nodes
			{
				setTimeout(function() // Postpone call to Reload to allow SelectAll to fire all OnSelectAll listeners before requesting data, causing OnRequest to fire
				{
					me.Reload(true);
				}, 0);
			}
			else
			{
				// Clear WebService state in case node has already been expanded
				delete internal.WSDone;
				delete internal.WSLoading;

				// Make node load children after OnSelectAll is canceled below, by returning False
				node.Expanded(false);
				setTimeout(function() { node.Expanded(true); }, 0);
			}

			// Cancel SelectAll, it will cause any existing children to be selected, and in turn fire OnChange.
			// Children will be selected once the complete hierarchy of children is received and populated (see OnResponse and OnPopulated below).
			return false;
		});

		me.OnResponse(function(sender, eventArgs)
		{
			if (selectAllMode === Fit.Controls.WSTreeViewSelectAllMode.Progressively)
				return;

			// Remove any existing children (subtree may have been partially loaded by user).
			// WebService is expected to return entire record set capable of replacing partially loaded data.

			var node = ((eventArgs.Node !== null) ? eventArgs.Node : rootNode);

			if (eventArgs.SelectAll === true) // Select All triggered request
			{
				me._internal.ExecuteWithNoOnChange(function() // Prevent checked nodes from firing OnChange when removed, fires in OnPopulated event handler
				{
					// Deselect children first (recursively) - may need to be synchronized with drop down control
					Fit.Array.Recurse(node.GetChildren(), "GetChildren", function(n)
					{
						n.Selected(false); // NOTICE: In case n.Selectable() returns False, we rely on WebService to return node with the same Selectable and Selected state as it has now
					});

					// Remove nodes - will be replaced in OnPopulated event handler
					Fit.Array.ForEach(node.GetChildren(), function(child)
					{
						node.RemoveChild(child);
					});
				});
			}
		});

		me.OnPopulated(function(sender, eventArgs)
		{
			if (selectAllMode === Fit.Controls.WSTreeViewSelectAllMode.Progressively)
				return;

			var node = ((eventArgs.Node !== null) ? eventArgs.Node : rootNode);
			var selected = node.GetDomElement()._internal.WSCheckedState;

			if (eventArgs.SelectAll === true) // Select All triggered request
			{
				// Select/deselect and expand all nodes

				var changed = false;

				me._internal.ExecuteWithNoOnChange(function()
				{
					if (node !== rootNode && node.Selectable() === true && node.Selected() !== selected)
					{
						node.Selected(selected);
						changed = true;
					}

					Fit.Array.Recurse(node.GetChildren(), "GetChildren", function(child)
					{
						// Support HasChildren:true, even in Instant Mode

						var childInternal = child.GetDomElement()._internal;

						if (childInternal.WSHasChildren === true && childInternal.WSDone !== true) // Node has children server side which have not loaded yet
						{
							Fit.Browser.Log("NOTICE: WebService did not provide all data in one single HTTP request - an additional request is required to load data for node with value '" + child.Value() + "'");
							childInternal.WSSelectAll = true; // Used when firing OnRequest, OnResponse, and OnPopulated events which expose an eventArgs.SelectAll boolean
							childInternal.WSCheckedState = selected;
						}

						// Select node if selectable

						if (child.Selectable() === true && child.Selected() !== selected)
						{
							child.Selected(selected);
							changed = true;
						}

						// Expand node to load children (HasChildren)

						child.Expanded(true);
					});
				});

				if (changed === true)
					me._internal.FireOnChange();
			}
		});

		//}

		// ExpandAll(..) support.
		// Using the OnPopulated event to progressively expand nodes is more
		// complicated than just loading all nodes first with recursivelyLoadAllNodes(..),
		// and via its callback, which is fired when all nodes are loaded, expand all the nodes.
		// But the approach using OnPopulated to resume the ExpandAll operation has the advantage
		// that the user can visually see the progress as nodes expand and their children start loading.
		me.OnPopulated(function(sender, eventArgs)
		{
			if (expandCollapseAllMode === -1)
				return;

			var node = eventArgs.Node;

			if (node === null)
				return; // Root node populated

			if (node.GetLevel() + 1 < expandCollapseAllMaxDepth)
			{
				expandCollapseNodesRecursively(node.GetChildren(), expandCollapseAllMode, expandCollapseAllMaxDepth);
			}
		});
	}

	/// <function container="Fit.Controls.WSTreeView" name="Url" access="public" returns="string">
	/// 	<description>
	/// 		Get/set URL to WebService responsible for providing data to TreeView.
	/// 		WebService must deliver data in the following JSON format:
	/// 		[
	/// 			&#160;&#160;&#160;&#160; { Title: "Test 1", Value: "1001", Selectable: true, Selected: true, Children: [] },
	/// 			&#160;&#160;&#160;&#160; { Title: "Test 2", Value: "1002", Selectable: false, Selected: false, Children: [] }
	/// 		]
	/// 		Only Value is required. Children is a collection of nodes with the same format as described above.
	/// 		HasChildren:boolean may be set to indicate that children are available server side and that WebService
	/// 		should be called to load these children when the given node is expanded.
	/// 		Additionally Expanded:boolean can be set to initially display node as expanded.
	/// 	</description>
	/// 	<param name="wsUrl" type="string" default="undefined"> If defined, updates WebService URL (e.g. http://server/ws/data.asxm/GetNodes) </param>
	/// </function>
	this.Url = function(wsUrl)
	{
		Fit.Validation.ExpectString(wsUrl, true);

		if (Fit.Validation.IsSet(wsUrl) === true)
		{
			url = wsUrl;
		}

		return url;
	}

	/// <function container="Fit.Controls.WSTreeView" name="JsonpCallback" access="public" returns="string">
	/// 	<description>
	/// 		Get/set name of JSONP callback argument. Assigning a value will enable JSONP communication.
	/// 		Often this argument is simply &quot;callback&quot;. Passing Null disables JSONP communication again.
	/// 	</description>
	/// 	<param name="val" type="string" default="undefined" nullable="true"> If defined, enables JSONP and updates JSONP callback argument </param>
	/// </function>
	this.JsonpCallback = function(val)
	{
		Fit.Validation.ExpectString(val, true);

		if (Fit.Validation.IsSet(val) === true || val === null)
		{
			jsonpCallback = val;
		}

		return jsonpCallback;
	}

	/// <function container="Fit.Controls.WSTreeView" name="SelectAllMode" access="public" returns="Fit.Controls.WSTreeViewSelectAllMode">
	/// 	<description>
	/// 		Get/set flag indicating whether WebService returns the complete hierarchy when
	/// 		Select All is triggered (Instantly), or loads data for each level individually
	/// 		when TreeView automatically expands all nodes (Progressively - chain loading).
	/// 	</description>
	/// 	<param name="val" type="Fit.Controls.WSTreeViewSelectAllMode" default="undefined"> If defined, behaviour is set to specified mode </param>
	/// </function>
	this.SelectAllMode = function(val)
	{
		Fit.Validation.ExpectString(val, true);

		if (Fit.Validation.IsSet(val) === true)
		{
			if (val === Fit.Controls.WSTreeViewSelectAllMode.Progressively || val === Fit.Controls.WSTreeViewSelectAllMode.Instantly)
				selectAllMode = val;
		}

		return selectAllMode;
	}

	// See documentation on TreeView
	this.SelectAll = Fit.Core.CreateOverride(this.SelectAll, function(select, selectAllNode)
	{
		Fit.Validation.ExpectBoolean(select);
		Fit.Validation.ExpectInstance(selectAllNode, Fit.Controls.TreeViewNode, true);

		// NOTICE: Selecting thousands of nodes using SelectAll may result in very poor performance
		// due to the large amount of DOM manipulation. The control goes through a full state change
		// for every single item being selected or de-selected, so all events fire and reflows are
		// triggered for visible items.
		// To increase performance, temporarily hide TreeView with display:none while SelectAll is being performed.

		// TBD: Add support for completed callback (?).
		// EnsureData, which is also based on the new node loader mechanism
		// (loadNodeData and recursivelyLoadAllNodes) keeps track of progress
		// and knows when all nodes have been loaded, so we could easily
		// add support for a callback or an event such as OnSelectAllComplete.
		// We already have an event called OnSelectAll which fires prior to
		// selection changes.
		// We can implement this when/if needed at some point. See EnsureData
		// for inspiration.

		if (selectAllMode === Fit.Controls.WSTreeViewSelectAllMode.Instantly)
		{
			// Fit.Controls.WSTreeViewSelectAllMode.Instantly Mode is handled with
			// OnSelectAll, OnResponse, and OnPopulated handlers registered in init()
			// when TreeView.SelectAll (base) is invoked below.
			base(select, selectAllNode);
			return;
		}

		// Progressive Mode - how it works:
		// Nodes are loaded progressively (chain loaded) from WebService.
		// Nodes with children not loaded yet will be loaded and populated, while
		// nodes already populated will remain (which is the opposite of Instant Mode which removes
		// children already loaded to make sure all data is received in just one request).
		// WebService may return multiple levels of nodes, or even the complete hierarchy, but Progressive Mode
		// will never be able to quarantee that only one request is made, since the node triggering Select All
		// may already have multiple children loaded with HasChildren set to True, which will spawn individual
		// requests.
		// To select all nodes and ensure only one request is made, set SelectAllMode
		// to Fit.Controls.WSTreeViewSelectAllMode.Instantly and make sure the server
		// returns the entire children hierarchy for a given target node.

		if (dataLoading === true || nodesLoading > 0)
		{
			// Data is currently loading - postpone by adding request to process queue
			onDataLoaded(function() { me.SelectAll(select, selectAllNode); });
			return;
		}

		var internal = (selectAllNode || rootNode).GetDomElement()._internal;
		internal.WSSelectAll = true; // Used when firing OnRequest, OnResponse, and OnPopulated events which expose an eventArgs.SelectAll boolean

		var baseSelectAll = base; // Reference to original SelectAll function on TreeView class
		var exec = function()
		{
			dataLoading = true;

			recursivelyLoadAllNodes(selectAllNode || null, function() // Fired when all nodes have been loaded
			{
				/*//baseSelectAll(select, selectAllNode);
				baseSelectAll(select, selectAllNode, true); // Passing True to suppress firing of OnSelectAllComplete event (internal argument)
				dataLoading = false;
				me._internal.FireOnSelectAllComplete(select, selectAllNode);
				fireOnDataLoadedToResumeProcessQueue();*/

				// This callback passed to recursivelyLoadAllNodes(..) is fired BEFORE OnPopulated
				// is fired, so if SelectAll results in multiple nodes loading data async, we may experience
				// events firing like so:
				//  - OnPopulated(sender, node1) fired
				//  - OnPopulated(sender, node2) fired
				//  - OnPopulated(sender, node3) fired
				//  - SelectAll(sender, nodeA) fired
				//  - SelectAllComplete(sender, nodeA) fired
				//  - OnPopulated(sender, node4) fired
				// Notice how the last node will have OnPopulated called after OnSelect and OnSelectComplete,
				// while all the other nodes had it called prior to that. Such inconsistency is no good. And
				// since SelectAll is async anyways, we might as well just queue the execution of SelectAll
				// using setTimeout(..) allowing for the last OnPopulated event to fire first.
				// This way we can also let baseSelectAll(..) handle execution of both OnSelectAll and OnSelectAllComplete.
				// https://github.com/Jemt/Fit.UI/issues/84

				dataLoading = false;
				fireOnDataLoadedToResumeProcessQueue();
				setTimeout(function() { baseSelectAll(select, selectAllNode); }, 0); // Allow OnPopulated to fire first in recursivelyLoadAllNodes => loadNodeData => getData
			}/*,
			function(nodePopulated) // Fired for every node loaded, except if node has been disposed or detached while loading
			{
				//nodePopulated.Expanded(true); // DISABLED: This hurts performance significantly for large TreeViews (10-15.000 nodes) as a huge amounts of DOM elements needs to be pushed to render tree, e.g. when opening/closing dropdown hosting TreeView
			}*/);
		};

		if (loadDataOnInit === true) // No data loaded yet
		{
			me.Reload(true, function(sender) // Will change loadDataOnInit to False
			{
				exec();
			});
		}
		else // Data already (partially) loaded - often just the root nodes
		{
			exec();
		}
	});

	// See documentation on TreeView
	this.RemoveAllChildren = Fit.Core.CreateOverride(this.RemoveAllChildren, function(dispose)
	{
		Fit.Validation.ExpectBoolean(dispose, true);

		preSelected = {}; // Clear preselections to avoid auto selection of nodes added later
		base(dispose);
	});

	// See documentation on TreeView
	this.Selectable = Fit.Core.CreateOverride(this.Selectable, function(val, multi, showSelAll)
	{
		Fit.Validation.ExpectBoolean(val, true);
		Fit.Validation.ExpectBoolean(multi, true);
		Fit.Validation.ExpectBoolean(showSelAll, true);

		if (Fit.Validation.IsSet(val) === true)
		{
			if (Fit.Array.Count(preSelected) > 0)
			{
				// Help developers - it might be confusing that changing Selectable state also clears selection
				Fit.Browser.Debug("WSTreeView: Selectable changed - PreSelections will be cleared");
			}

			preSelected = {}; // Clear preselections to ensure same behaviour as TreeView.Selectable(..) which clear selections - avoid auto selection if nodes are loaded later
		}

		return base(val, multi, showSelAll);
	});

	// See documentation on ControlBase
	this.Clear = Fit.Core.CreateOverride(this.Clear, function()
	{
		var fireChange = (me.Selected().length > 0); // Selected() return nodes loaded as well as preselections

		preSelected = {};

		me._internal.ExecuteWithNoOnChange(function() { base(); });

		if (fireChange === true)
			me._internal.FireOnChange();
	});

	/// <function container="Fit.Controls.WSTreeView" name="Reload" access="public">
	/// 	<description> Reload data from WebService </description>
	/// 	<param name="keepSelections" type="boolean" default="undefined">
	/// 		If defined, True will preserve selections, False will remove them (default)
	/// 	</param>
	/// 	<param name="cb" type="function" default="undefined">
	/// 		If defined, callback function is invoked when root nodes have been loaded
	/// 		and populated - takes Sender (Fit.Controls.WSTreeView) as an argument.
	/// 	</param>
	/// </function>
	this.Reload = function(a, b) // Correct signature: Reload(boolean, function)
	{
		// Backward compatibility - temporary support for deprecated Reload signature: Reload([callback])

		var keepSelections = undefined;
		var cb = undefined;

		if (typeof(a) === "boolean")
		{
			// Correct signature used: Reload([bool[, callback]])

			keepSelections = a;
			cb = b;
		}
		else if (typeof(a) === "function")
		{
			// Deprecated signature used: Reload([callback])

			keepSelections = b;
			cb = a;

			Fit.Browser.Log("WARNING: Using deprecated function signature for WSTreeView.Reload(callback) which will be removed in the future - please use Reload(boolean, callback) instead");
		}

		// End of backward compatibility for deprecated Reload signature

		Fit.Validation.ExpectBoolean(keepSelections, true);
		Fit.Validation.ExpectFunction(cb, true);

		// Postpone operation if currently loading data

		if (dataLoading === true || nodesLoading > 0)
		{
			// Data is currently loading - postpone by adding request to process queue
			onDataLoaded(function() { me.Reload(keepSelections, cb); });
			return;
		}

		// Preserve selection if instructed to.
		// Nodes will automatatically be selected again once data has been loaded.

		var selected = me.Selected();
		var newPreselection = {};

		if (keepSelections === true)
		{
			Fit.Array.ForEach(selected, function(node)
			{
				newPreselection[node.Value()] = {Title: node.Title(), Value: node.Value()};
			});
		}

		// Remove nodes - OnChange is not fire if selection is preserved (keepSelections)

		me._internal.ExecuteWithNoOnChange(function()
		{
			me.RemoveAllChildren(true); // True to dispose objects - also clears selections, including preselections
		});

		preSelected = newPreselection;

		// Fire OnChange if selection was cleared (not preserved above)

		if (Fit.Array.Count(selected) > 0 && Fit.Array.Count(newPreselection) === 0)
		{
			me._internal.FireOnChange();
		}

		// Load data

		dataLoading = true;

		getData(null, function(node, eventArgs) // Notice: node argument is null when requesting root nodes
		{
			Fit.Array.ForEach(eventArgs.Children, function(jsonChild)
			{
				me.AddChild(createNodeFromJson(jsonChild));
			});

			dataLoading = false;

			rootNode.GetDomElement()._internal.WSDone = true;

			/*if (Fit.Validation.IsSet(cb) === true)
			{
				cb(me); // Fires when nodes are populated (above), but before OnPopulated is fired by getData(..)
			}*/

			fireOnDataLoadedToResumeProcessQueue();

			if (Fit.Validation.IsSet(cb) === true)
			{
				setTimeout(function() { cb(me); }, 0); // Allow OnPopulated to fire first in recursivelyLoadAllNodes => loadNodeData => getData - see WSTreeView.SelectAll(..) for details
			}
		});

		loadDataOnInit = false;
	}

	/// <function container="Fit.Controls.WSTreeView" name="EnsureData" access="public">
	/// 	<description>
	/// 		Ensure all data from WebService.
	/// 		Contrary to Reload(..), this function does not clear selected
	/// 		values, or remove nodes already loaded - it merely loads data
	/// 		not already loaded.
	/// 	</description>
	/// 	<param name="callback" type="function" default="undefined">
	/// 		If defined, callback function is invoked when all nodes have been loaded
	/// 		and populated - takes Sender (Fit.Controls.WSTreeView) as an argument.
	/// 	</param>
	/// </function>
	this.EnsureData = function(cb)
	{
		Fit.Validation.ExpectFunction(cb, true);

		if (dataLoading === true || nodesLoading > 0)
		{
			// Data is currently loading - postpone by adding request to process queue
			onDataLoaded(function() { me.EnsureData(cb); });
			return;
		}

		var exec = function()
		{
			dataLoading = true;

			recursivelyLoadAllNodes(null, function() // Fired when all nodes have been loaded
			{
				dataLoading = false;

				/*if (Fit.Validation.IsSet(cb) === true)
				{
					cb(me);
				}*/

				fireOnDataLoadedToResumeProcessQueue();

				if (Fit.Validation.IsSet(cb) === true)
				{
					setTimeout(function() { cb(me); }, 0); // Allow OnPopulated to fire first in recursivelyLoadAllNodes => loadNodeData => getData - see WSTreeView.SelectAll(..) for details
				}
			});
		};

		if (me.GetChildren().length === 0) // No nodes in TreeView - we check against node count instead of loadDataOnInit since we want to be able to re-ensure nodes in case they we initially loaded and later removed
		{
			me.Reload(true, function(sender) // Will change loadDataOnInit to False
			{
				exec();
			});
		}
		else // Data already (partially) loaded - often just the root nodes
		{
			exec();
		}
	}

	// See documentation on TreeView
	this.ExpandAll = function(maxDepth)
	{
		Fit.Validation.ExpectInteger(maxDepth, true);
		setExpandedStateForAllNodes(1, maxDepth);
	}

	// See documentation on TreeView
	this.CollapseAll = function(maxDepth)
	{
		Fit.Validation.ExpectInteger(maxDepth, true);
		setExpandedStateForAllNodes(0, maxDepth);
	}

	// See documentation on ControlBase
	this.Value = Fit.Core.CreateOverride(this.Value, function(val)
	{
		Fit.Validation.ExpectString(val, true);

		// Setter

		if (Fit.Validation.IsSet(val) === true)
		{
			orgSelected = [];
			preSelected = {};
			var fireOnChange = (me.Selected().length > 0); // Selected() return nodes already loaded and preselections

			me._internal.ExecuteWithNoOnChange(function()
			{
				// Select nodes already loaded

				base(val);
				var selected = baseSelected(); // Get selection just made as node objects, which can be iterated using ForEach

				if (selected.length > 0)
					fireOnChange = true;

				// Update orgSelected used to determine dirty state

				Fit.Array.ForEach(selected, function(node)
				{
					Fit.Array.Add(orgSelected, node.Value());
				});

				// Add nodes not loaded yet to preselections

				var values = val.split(";");

				Fit.Array.ForEach(values, function(nodeVal)
				{
					var info = nodeVal.split("=");
					var preSel = { Title: null, Value: null };

					if (info.length === 1)
					{
						preSel.Title = "[pre-selection]";
						preSel.Value = decodeReserved(info[0]);
					}
					else
					{
						preSel.Title = decodeReserved(info[0]);
						preSel.Value = decodeReserved(info[1]);
					}

					if (me.GetChild(preSel.Value, true) === null)
					{
						preSelected[preSel.Value] = preSel;
						Fit.Array.Add(orgSelected, preSel.Value);
						fireOnChange = true;
					}
				});
			});

			if (fireOnChange === true)
				me._internal.FireOnChange();
		}

		// Getter

		var nodes = me.Selected();
		var value = "";

		Fit.Array.ForEach(nodes, function(node)
		{
			value += ((value !== "") ? ";" : "") + encodeReserved(node.Title()) + "=" + encodeReserved(node.Value());
		});

		return value;
	});

	/// <function container="Fit.Controls.WSTreeView" name="Selected" access="public" returns="Fit.Controls.TreeViewNode[]">
	/// 	<description>
	/// 		Fit.Controls.TreeView.Selected override:
	/// 		Get/set selected nodes.
	/// 		Notice for getter: Nodes not loaded yet (preselections) are NOT valid nodes associated with TreeView.
	/// 		Therefore most functions will not work. Preselection nodes can be identified by their title:
	/// 		if (node.Title() === "[pre-selection]") console.log("This is a preselection node");
	/// 		Only the following getter functions can be used for preselection nodes:
	/// 		node.Title(), node.Value(), node.Selected()
	/// 	</description>
	/// 	<param name="val" type="Fit.Controls.TreeViewNode[]" default="undefined"> If defined, provided nodes are selected </param>
	/// </function>
	this.Selected = function(val)
	{
		Fit.Validation.ExpectInstanceArray(val, Fit.Controls.TreeViewNode, true);

		// Setter

		if (Fit.Validation.IsSet(val) === true)
		{
			// Exclude nodes not belonging to TreeView - trying to select them
			// will cause an error to be thrown from TreeView.Selected (base).
			// Nodes excluded are added as preselections instead.

			var toSelect = [];

			Fit.Array.ForEach(val, function(n)
			{
				var node = ((n.GetTreeView() === me) ? n : me.GetChild(n.Value(), true)); // Try GetChild(..) in case node was constructed, but with a value of an existing node

				if (node !== null)
					Fit.Array.Add(toSelect, node);
			});

			// Select nodes

			orgSelected = [];
			preSelected = {};
			var fireOnChange = (me.Selected().length > 0); // Selected() return nodes already loaded and preselections

			// Select nodes already loaded

			var selected = null;
			me._internal.ExecuteWithNoOnChange(function() { selected = baseSelected(toSelect); });

			if (selected.length > 0)
				fireOnChange = true;

			// Update orgSelected used to determine dirty state

			Fit.Array.ForEach(selected, function(node)
			{
				Fit.Array.Add(orgSelected, node.Value());
			});

			// Add nodes not loaded yet to preselections

			Fit.Array.ForEach(val, function(node)
			{
				if (me.GetChild(node.Value(), true) === null)
				{
					preSelected[node.Value()] = {Title: node.Title(), Value: node.Value()};
					Fit.Array.Add(orgSelected, node.Value());
					fireOnChange = true;
				}
			});

			// Fire OnChange

			if (fireOnChange === true)
			{
				me._internal.FireOnChange();
			}
		}

		// Getter

		var nodes = baseSelected();

		// Add preselections - they are considered part of value
		Fit.Array.ForEach(preSelected, function(preSelVal)
		{
			var preSel = preSelected[preSelVal];
			Fit.Array.Add(nodes, new Fit.Controls.TreeViewNode(preSel.Title, preSel.Value)); // Invalid nodes! E.g. node.Selected(true) and node.GetTreeView() will not work since node has no association with TreeView
		});

		return nodes;
	}

	// See documentation on ControlBase
	this.IsDirty = Fit.Core.CreateOverride(this.IsDirty, function()
	{
		// Get nodes currently selected

		var valuesSelected = [];

		Fit.Array.ForEach(me.Selected(), function(selected)
		{
			Fit.Array.Add(valuesSelected, selected.Value());
		});

		// Determine dirty state

		if (valuesSelected.length !== orgSelected.length)
			return true;

		var dirty = false;
		Fit.Array.ForEach(orgSelected, function(val)
		{
			if (Fit.Array.Contains(valuesSelected, val) === false)
			{
				dirty = true;
				return false;
			}
		});
		return dirty;
	});

	// See documentation on ControlBase
	this.Dispose = Fit.Core.CreateOverride(this.Dispose, function()
	{
		me = url = jsonpCallback = preSelected = orgSelected = loadDataOnInit = dataLoading = nodesLoading = recursiveNodeLoadCount = onDataLoadedCallback = onRequestHandlers = onResponseHandlers = onPopulatedHandlers = baseSelected = expandCollapseAllMode = expandCollapseAllMaxDepth = null;

		base();
	});

	// ============================================
	// PickerBase interface
	// ============================================

	/*this.OnShow(function(sender) // Event defined on PickerBase
	{
		if (loadDataOnInit === true)
		{
			me.Reload();
			loadDataOnInit = false;
		}
	});*/

	// See documentation on PickerBase
	this.SetSelections = Fit.Core.CreateOverride(this.SetSelections, function(items)
	{
		Fit.Validation.ExpectArray(items);

		var fireOnChange = (me.Selected().length > 0); // me.Selected() return nodes already loaded and preselections

		// Make sure calls to Value() or Selected() does not return old preselections for events fired

		preSelected = {};

		// Call SetSelections(..) on base class to make sure nodes already loaded is immediately selected.

		me._internal.ExecuteWithNoOnChange(function() { base(items); });

		if (me.Selected().length > 0)
			fireOnChange = true;

		// Set preselections for nodes not loaded yet

		// Add all values to preselections - preselections for nodes already loaded is removed further down
		Fit.Array.ForEach(items, function(item)
		{
			Fit.Validation.ExpectString(item.Title);
			Fit.Validation.ExpectString(item.Value);

			preSelected[item.Value] = {Title: item.Title, Value: item.Value};
		});

		// Remove values from preselections if already loaded
		Fit.Array.ForEach(baseSelected(), function(selected)
		{
			delete preSelected[selected.Value()];
		});

		if (Fit.Core.IsEqual(preSelected, {}) === false)
			fireOnChange = true;

		// Fire OnChange

		if (fireOnChange === true)
			me._internal.FireOnChange();
	});

	// See documentation on PickerBase
	this.UpdateItemSelection = Fit.Core.CreateOverride(this.UpdateItemSelection, function(itemValue, selected, programmaticallyChanged)
	{
		Fit.Validation.ExpectString(itemValue);
		Fit.Validation.ExpectBoolean(selected);
		Fit.Validation.ExpectBoolean(programmaticallyChanged);

		if (me.GetChild(itemValue, true) === null) // Node not loaded yet, update preselections
		{
			// Since the node is not loaded yet, OnSelect, OnItemSelectionChanging,
			// OnSelected, and OnItemSelectionChanged are not fired - they fire once the node is loaded.

			if (selected === true && preSelected[itemValue] === undefined)
			{
				preSelected[itemValue] = {Title: "[pre-selection]", Value: itemValue};
				me._internal.FireOnChange();
			}
			else if (selected === false && preSelected[itemValue] !== undefined)
			{
				delete preSelected[itemValue];
				me._internal.FireOnChange();
			}
		}
		else // Update nodes already loaded
		{
			if (base(itemValue, selected, programmaticallyChanged) === false) // Fires OnSelect, OnItemSelectionChanging, OnSelected, OnItemSelectionChanged, and OnChange
				return false;
		}
	});

	// ============================================
	// Events
	// ============================================

	/// <function container="Fit.Controls.WSTreeView" name="OnRequest" access="public">
	/// 	<description>
	/// 		Add event handler fired when data is being requested.
	/// 		Request can be canceled by returning False.
	/// 		Function receives two arguments:
	/// 		Sender (Fit.Controls.WSTreeView) and EventArgs object.
	/// 		EventArgs object contains the following properties:
	/// 		 - Sender: Fit.Controls.WSTreeView instance
	/// 		 - Request: Fit.Http.JsonpRequest or Fit.Http.JsonRequest instance
	/// 		 - Node: Fit.Controls.TreeViewNode instance
	/// 	</description>
	/// 	<param name="cb" type="function"> Event handler function </param>
	/// </function>
	this.OnRequest = function(cb)
	{
		Fit.Validation.ExpectFunction(cb);
		Fit.Array.Add(onRequestHandlers, cb);
	}

	/// <function container="Fit.Controls.WSTreeView" name="OnResponse" access="public">
	/// 	<description>
	/// 		Add event handler fired when data is received,
	/// 		allowing for data transformation to occure before
	/// 		TreeView is populated. Function receives two arguments:
	/// 		Sender (Fit.Controls.WSTreeView) and EventArgs object.
	/// 		EventArgs object contains the following properties:
	/// 		 - Sender: Fit.Controls.WSTreeView instance
	/// 		 - Request: Fit.Http.JsonpRequest or Fit.Http.JsonRequest instance
	/// 		 - Node: Fit.Controls.TreeViewNode instance to be populated
	/// 		 - Children: JSON nodes received from WebService
	/// 	</description>
	/// 	<param name="cb" type="function"> Event handler function </param>
	/// </function>
	this.OnResponse = function(cb)
	{
		Fit.Validation.ExpectFunction(cb);
		Fit.Array.Add(onResponseHandlers, cb);
	}

	/// <function container="Fit.Controls.WSTreeView" name="OnAbort" access="public">
	/// 	<description>
	/// 		Add event handler fired if data request is canceled.
	/// 		Function receives two arguments:
	/// 		Sender (Fit.Controls.WSTreeView) and EventArgs object.
	/// 		EventArgs object contains the following properties:
	/// 		 - Sender: Fit.Controls.WSTreeView instance
	/// 		 - Request: Fit.Http.JsonpRequest or Fit.Http.JsonRequest instance
	/// 		 - Node: Fit.Controls.TreeViewNode instance to be populated
	/// 		 - Children: JSON nodes received from WebService (Null in this particular case)
	/// 	</description>
	/// 	<param name="cb" type="function"> Event handler function </param>
	/// </function>
	this.OnAbort = function(cb)
	{
		Fit.Validation.ExpectFunction(cb);
		Fit.Array.Add(onAbortHandlers, cb);
	}

	/// <function container="Fit.Controls.WSTreeView" name="OnPopulated" access="public">
	/// 	<description>
	/// 		Add event handler fired when TreeView has been populated with nodes.
	/// 		Node is not populated and event is not fired though if node is disposed
	/// 		or detached from TreeView while data is loading from WebService.
	/// 		Function receives two arguments:
	/// 		Sender (Fit.Controls.WSTreeView) and EventArgs object.
	/// 		EventArgs object contains the following properties:
	/// 		 - Sender: Fit.Controls.WSTreeView instance
	/// 		 - Request: Fit.Http.JsonpRequest or Fit.Http.JsonRequest instance
	/// 		 - Node: Fit.Controls.TreeViewNode instance now populated with children
	/// 		 - Children: JSON nodes received from WebService
	/// 	</description>
	/// 	<param name="cb" type="function"> Event handler function </param>
	/// </function>
	this.OnPopulated = function(cb)
	{
		Fit.Validation.ExpectFunction(cb);
		Fit.Array.Add(onPopulatedHandlers, cb);
	}

	// ============================================
	// Private
	// ============================================

	// Several functions end up calling getData(..) which is a bit confusing.
	// The following link has a drawing that clarifies how this works: https://github.com/Jemt/Fit.UI/issues/83
	function getData(node, cb)
	{
		Fit.Validation.ExpectInstance(node, Fit.Controls.TreeViewNode, true); // Node is null when requesting root nodes
		Fit.Validation.ExpectFunction(cb);

		if (url === null)
			Fit.Validation.ThrowError("Unable to get data, no WebService URL has been specified");

		// Determine request method

		var request = null;

		if (jsonpCallback !== null)
		{
			request = new Fit.Http.JsonpRequest(url, jsonpCallback);
		}
		else
		{
			request = new Fit.Http.JsonRequest(url)
		}

		// Fire OnRequest

		var eventArgs = { Sender: null, Node: null, Request: null, Children: null };
		eventArgs.Sender = me;
		eventArgs.Node = node;
		eventArgs.Request = request;
		eventArgs.SelectAll = (node || rootNode).GetDomElement()._internal.WSSelectAll === true;

		if (fireEventHandlers(onRequestHandlers, eventArgs) === false)
			return false;

		if (eventArgs.Request !== request)
		{
			// Support for changing request instans to
			// take control over webservice communication.

			// Restrict to support for Fit.Http.Request or classes derived from this
			Fit.Validation.ExpectInstance(eventArgs.Request, Fit.Http.Request);

			request = eventArgs.Request;
		}

		// Define request callbacks

		var onSuccess = function(children)
		{
			// Fire OnResponse

			eventArgs.Children = ((children instanceof Array) ? children : []);
			fireEventHandlers(onResponseHandlers, eventArgs);

			// Fire getData callback

			// WARNING: node might have been disposed - WebService communication is async!
			cb(node, eventArgs); // Callback is responsible for populating TreeView

			// Remove loading indicator

			if (request._loadingIndicator !== undefined) // Loading indicator not set when requesting root nodes
			{
				Fit.Dom.Remove(request._loadingIndicator);
				delete request._loadingIndicator;
			}

			// Select nodes found in preselections

			var hasBeenDisposedOrDetached = node !== null && nodeDisposedOrDetached(node);

			if (hasBeenDisposedOrDetached === false && Fit.Core.IsEqual(preSelected, {}) === false) // Prevent nodes from being iterated if no preselections are found
			{
				// Notice: OnChange is not fired! It has already been fired when PreSelections were added.
				// They are also included when e.g. WSTreeView.Value() is called to obtain current selections.
				// However, OnSelect (which fires OnItemSelectionChanging) and OnSelected (which fires OnItemSelectionChanged)
				// fires when node.selected(boolean) is called below.
				me._internal.ExecuteWithNoOnChange(function()
				{
					Fit.Array.Recurse(((node !== null) ? node.GetChildren() : me.GetChildren()), "GetChildren", function(n)
					{
						if (preSelected[n.Value()] !== undefined)
						{
							delete preSelected[n.Value()];
							n.Selected(true);
						}
					});
				});
			}

			// Fire OnPopulated.
			// Contrary to OnRequest, OnResponse, and OnAbort, OnPopulated does not
			// fire if node has been disposed or detached, in which case WSTreeView
			// will not have populated the node.
			// OnRequest/OnResponse/OnAbort handlers can check whether a given node
			// has been disposed or detached like this:
			// var disposed = node.GetDomElement() === null;
			// var detached = !disposed && node.GetTreeView() === null;
			// var moved = !disposed && node.GetTreeView() !== myTreeViewInstance;
			// var disposedOrDetached = node.GetDomElement() === null || node.GetTreeView() === null;

			if (hasBeenDisposedOrDetached === false)
			{
				fireEventHandlers(onPopulatedHandlers, eventArgs);
			}
		}

		var onFailure = function(httpStatusCode)
		{
			Fit.Validation.ThrowError("Unable to get children for " + ((node !== null) ? "node '" + node.Title() + "'" : "root level") + " - request failed with HTTP Status code " + httpStatusCode)
		}

		var onAbort = function()
		{
			if (request._loadingIndicator !== undefined) // Loading indicator not set when requesting root nodes
			{
				Fit.Dom.Remove(request._loadingIndicator);
				delete request._loadingIndicator;
			}

			if (node !== null) // Null when requesting root nodes
			{
				if (nodeDisposedOrDetached(node) === false)
				{
					delete node.GetDomElement()._internal.WSLoading;
				}
			}

			fireEventHandlers(onAbortHandlers, eventArgs);
		};

		// Register request callbacks

		if (Fit.Core.InstanceOf(request, Fit.Http.JsonpRequest) === false)
		{
			request.OnSuccess(function(req)
			{
				var children = request.GetResponseJson();
				onSuccess(children);
			});

			request.OnFailure(function(req)
			{
				onFailure(request.GetHttpStatus());
			});

			request.OnAbort(function(req)
			{
				onAbort();
			});
		}
		else
		{
			request.OnSuccess(function(req)
			{
				var children = req.GetResponse();
				onSuccess(children);
			});

			request.OnTimeout(function()
			{
				onFailure("UNKNOWN (JSONP)");
			});
		}

		// Display loading indicator

		if (node !== null) // Null when requesting root nodes
		{
			var li = node.GetDomElement();

			request._loadingIndicator = document.createElement("i");
			Fit.Dom.AddClass(request._loadingIndicator, "FitUiControlLoadingIndicator");
			Fit.Dom.Add(li, request._loadingIndicator);
		}

		// Invoke request

		request.Start();

		return true;
	}

	function onDataLoaded(cb)
	{
		Fit.Validation.ExpectFunction(cb);
		Fit.Array.Add(onDataLoadedCallback, cb);
	}

	function fireOnDataLoadedToResumeProcessQueue()
	{
		// Immediately clear collection. If multiple callbacks are registered,
		// chances are that only the first will run, and the remaining will be
		// re-scheduled again - so we need the collection to be cleared before
		// invoking callbacks.
		var orgOnDataLoadedCallback = onDataLoadedCallback;
		onDataLoadedCallback = [];

		Fit.Array.ForEach(orgOnDataLoadedCallback, function(cb)
		{
			cb();
		});
	}

	function createNodeFromJson(jsonNode)
	{
		Fit.Validation.ExpectIsSet(jsonNode);

		// Convert JSON to TreeView node, including all contained children

		var child = new Fit.Controls.TreeViewNode((jsonNode.Title ? jsonNode.Title : jsonNode.Value), jsonNode.Value);

		if (jsonNode.Selectable !== undefined)
			child.Selectable((jsonNode.Selectable === true)); // Node will obtain Selectable state from TreeView unless explicitly set here

		if (jsonNode.Selected !== undefined)
			child.Selected((jsonNode.Selected === true)); // Notice, will not cause various events to fire since TreeViewNodeInterface is not assigned at this point

		if (jsonNode.Children instanceof Array)
		{
			Fit.Array.ForEach(jsonNode.Children, function(c)
			{
				child.AddChild(createNodeFromJson(c));
			});
		}

		if (jsonNode.Expanded !== undefined)
			child.Expanded((jsonNode.Expanded === true)); // Notice, will not cause various events to fire since TreeViewNodeInterface is not assigned at this point

		// Set internal flag indicating whether node has children server side

		child.GetDomElement()._internal.WSHasChildren = (jsonNode.HasChildren === true);

		// Add fake child to node if HasChildren indicates that there are more children
		// server side. Adding the fake child ensures that the node can be expanded, which
		// allow us to use OnToggle to load the children at this point.
		// However, the current node may already have some of its children added,
		// so only add the fake child if no children are found.

		if (jsonNode.HasChildren === true && child.GetChildren().length === 0)
		{
			// Make node expandable by attaching a place holder node
			// which is automatically removed when node is expanded.
			var expanderNode = new Fit.Controls.TreeViewNode("__", "__");
			expanderNode.Selectable(false); // Prevent it from being selected when using SelectAll
			child.AddChild(expanderNode);
		}

		// Add supplementary information provided by WebService

		child.Supplementary = {};
		var reserved = new Array("Title", "Value", "Children", "HasChildren", "Selected", "Selectable", "Expanded");

		Fit.Array.ForEach(jsonNode, function(key)
		{
			if (Fit.Array.Contains(reserved, key) === false)
				child.Supplementary[key] = jsonNode[key];
		});

		return child;
	}

	function nodeFullyLoaded(node) // Check whether all children has been loaded
	{
		var internal = node.GetDomElement()._internal;

		if (internal.WSSelectAll === true)
			return true; // This node previously caused SelectAll

		// Check whether node was part of hierarchy loaded using Select All

		var parent = node.GetParent();

		while (parent !== null)
		{
			if (parent.GetDomElement()._internal.WSSelectAll === true)
				return true;

			parent = parent.GetParent();
		}

		// Check whether all children are loaded (usually manually by expanding nodes)

		var fullyLoaded = true;

		Fit.Array.Recurse([node], "GetChildren", function(child)
		{
			var childInternal = child.GetDomElement()._internal;

			if (childInternal.WSHasChildren === true && childInternal.WSDone !== true)
			{
				fullyLoaded = false;
				return false; // Break loop
			}
		});

		return fullyLoaded;
	}

	// Check whether a node has been disposed or detached from TreeView.
	// We use this function when loading nodes async, to make sure the
	// nodes are still in working order when data is received, which will
	// not be the case for a node that has been disposed (destroyed).
	// Also, a node that has been detached should no longer affect this
	// TreeView instance.
	function nodeDisposedOrDetached(node)
	{
		Fit.Validation.ExpectInstance(node, Fit.Controls.TreeViewNode);

		// Return True if node is either disposed or no longer attached to TreeView.
		// GetTreeView() returns Null if node has been removed from TreeView, or a
		// TreeView instance different from this one, if attached to another TreeView.
		// NOTICE: Moving a node currently being loaded will not work properly.
		// It will not have its _internal state updated to reflect its proper
		// state. If this is needed, search for calls to nodeDisposedOrDetached(..),
		// and make sure the node is updated if only detached, but do NOT process
		// it any further (e.g. expand it), nor let it affect state within the initial
		// TreeView from which it was moved. And make sure to test it properly!
		return node.GetDomElement() === null || node.GetTreeView() !== me;
	}

	// Loads node data and returns True if data is being loaded, False if no data needs to be loaded.
	// Does not load nodes recursively! Use recursivelyLoadAllNodes(..) for that!
	function loadNodeData(node, cb) // Populated node is passed to callback
	{
		Fit.Validation.ExpectInstance(node, Fit.Controls.TreeViewNode);
		Fit.Validation.ExpectFunction(cb, true);

		if (node.GetDomElement()._internal.WSDone === true)
		{
			return false; // Data has already been loaded
		}

		if (node.GetDomElement()._internal.WSHasChildren === false)
		{
			return false; // No remote children to load
		}

		// Get data

		var canceled = !getData(node, function(n, eventArgs) // Callback fired when data is ready
		{
			if (nodeDisposedOrDetached(node) === false)
			{
				// Remove place holder child which served the purpose of making the node expandable

				var expanderNode = node.GetChild("__");

				if (expanderNode !== null) // Does not exist if node was partially pre-populated server side
				{
					node.RemoveChild(expanderNode);
				}

				// Populate node

				Fit.Array.ForEach(eventArgs.Children, function(c)
				{
					node.AddChild(createNodeFromJson(c));
				});

				node.GetDomElement()._internal.WSDone = true;
			}

			// Invoke callback

			if (Fit.Validation.IsSet(cb) === true)
			{
				// WARNING: node might have been disposed - WebService communication is async!
				cb(node);
			}
		});

		return canceled === false;
	}

	// Load all children for given node recursively.
	// No arguments are passed to cbComplete - populated node is passed to cbProgress.
	function recursivelyLoadAllNodes(targetNode, cbComplete, cbProgress, isSubCall)
	{
		Fit.Validation.ExpectInstance(targetNode, Fit.Controls.TreeViewNode, true);
		Fit.Validation.ExpectFunction(cbComplete, true);
		Fit.Validation.ExpectFunction(cbProgress, true);
		Fit.Validation.ExpectBoolean(isSubCall, true);

		if (isSubCall !== true)
		{
			recursiveNodeLoadCount = 0;
		}

		var targetNodeInternal = (targetNode || rootNode).GetDomElement()._internal;
		var nodes = null;

		if (targetNode === null)
		{
			nodes = me.GetChildren();
		}
		else
		{
			nodes = targetNode.GetChildren();
		}

		var anythingToLoad = false;

		Fit.Array.ForEach(nodes, function(node)
		{
			if (node.IsBehavioralNode() === true)
				return; // Do not request data for behavioral node

			if (targetNodeInternal.WSSelectAll === true)
				node.GetDomElement()._internal.WSSelectAll = true; // Used when firing OnRequest, OnResponse, and OnPopulated events which expose an eventArgs.SelectAll boolean

			var dataStartedLoading = loadNodeData(node, function(n) // True if node has remote children that will be loaded, False if no remote children is available to be loaded
			{
				var hasBeenDisposed = nodeDisposedOrDetached(node);

				if (hasBeenDisposed === false && Fit.Validation.IsSet(cbProgress) === true)
				{
					cbProgress(node);
				}

				recursiveNodeLoadCount--;

				if (hasBeenDisposed === false)
				{
					recursivelyLoadAllNodes(node, cbComplete, cbProgress, true);
				}

				if (recursiveNodeLoadCount === 0)
				{
					if (Fit.Validation.IsSet(cbComplete) === true)
					{
						cbComplete();
					}
				}
			});

			if (dataStartedLoading === true)
			{
				anythingToLoad = true;
				recursiveNodeLoadCount++;
			}
			else
			{
				// No remote children to load, but node may have existing children that could have remote children

				if (Fit.Validation.IsSet(cbProgress) === true)
				{
					cbProgress(node);
				}

				if (recursivelyLoadAllNodes(node, cbComplete, cbProgress, true) === true)
				{
					anythingToLoad = true;
				}
			}
		});

		if (isSubCall !== true && anythingToLoad === false && Fit.Validation.IsSet(cbComplete) === true)
		{
			cbComplete();
		}

		return anythingToLoad;
	}

	// Progressively expand nodes. Nodes containing remote children will keep
	// expanding when nodes are loaded and populated, which is handled by
	// an OnToggle handler registered in init().
	function setExpandedStateForAllNodes(expandMode, maxDepth)
	{
		Fit.Validation.ExpectInteger(expandMode); // 0 = Collapse, 1 = Expand
		Fit.Validation.ExpectInteger(maxDepth, true);

		if (dataLoading === true || nodesLoading > 0)
		{
			// Data is currently loading - postpone by adding request to process queue.
			// This also applies when collapsing nodes, since the operation currently loading
			// data may be ExpandAll or SelectAll (which also expand nodes), which should be allowed
			// to finish first.
			onDataLoaded(function() { setExpandedStateForAllNodes(expandMode, maxDepth); });
			return;
		}

		// Save state to allow operation to be resumed as nodes are progressively
		// loaded and populated. State is used in OnPopulated handler registered in init().

		expandCollapseAllMode = -1;
		expandCollapseAllMaxDepth = 99999;

		if (Fit.Validation.IsSet(maxDepth) === true)
		{
			if (maxDepth < 1)
				return;

			expandCollapseAllMaxDepth = maxDepth;
		}

		expandCollapseAllMode = expandMode;

		// Load data and start expanding/collapsing

		if (loadDataOnInit === true && expandCollapseAllMode === 1)
		{
			me.Reload(true, function(sender)
			{
				expandCollapseNodesRecursively(me.GetChildren(), expandCollapseAllMode, expandCollapseAllMaxDepth);
			});
		}
		else // Data already loaded
		{
			expandCollapseNodesRecursively(me.GetChildren(), expandCollapseAllMode, expandCollapseAllMaxDepth);
		}
	}

	function expandCollapseNodesRecursively(nodes, expandCollapseMode, maxDepth)
	{
		Fit.Validation.ExpectInstanceArray(nodes, Fit.Controls.TreeViewNode);
		Fit.Validation.ExpectInteger(expandCollapseMode);
		Fit.Validation.ExpectInteger(maxDepth);

		Fit.Array.CustomRecurse(nodes, function(node)
		{
			if (expandCollapseMode === 1)
				node.Expanded(true);
			else if (expandCollapseMode === 0)
				node.Expanded(false);

			return (node.GetLevel() + 1 < maxDepth ? node.GetChildren() : null);
		});
	}

	function fireEventHandlers(handlers, eventArgs)
	{
		var cancel = false;

		Fit.Array.ForEach(handlers, function(cb)
		{
			if (cb(me, eventArgs) === false)
				cancel = true; // Do NOT cancel loop though! All handlers must be fired!
		});

		return !cancel;
	}

	function decodeReserved(str)
	{
		Fit.Validation.ExpectString(str);
		return str.replace(/%3B/g, ";").replace(/%3D/g, "="); // Decode characters reserved for value format
	}

	function encodeReserved(str)
	{
		Fit.Validation.ExpectString(str);
		return str.replace(/;/g, "%3B").replace(/=/g, "%3D"); // Encode characters reserved for value format
	}

	init();
}

/// <container name="Fit.Controls.WSTreeViewSelectAllMode">
/// 	Enum indicating how data is loaded from WebService when using the Select All feature
/// </container>
Fit.Controls.WSTreeViewSelectAllMode =
{
	/// <member container="Fit.Controls.WSTreeViewSelectAllMode" name="Progressively" access="public" static="true" type="string" default="Progressively">
	/// 	<description>
	/// 		Chain load children by progressively expanding them as they are loaded.
	/// 		This may result in several HTTP requests to WebService, and OnChange will
	/// 		fire for every node expanded if children are available server side.
	/// 	</description>
	/// </member>
	Progressively: "Progressively",

	/// <member container="Fit.Controls.WSTreeViewSelectAllMode" name="Instantly" access="public" static="true" type="string" default="Instantly">
	/// 	<description>
	/// 		Load all children at once (WebService is expected to return the complete hierarchy in one single request).
	/// 		This approach will provide better performance as it does not fire OnChange for every child expanded,
	/// 		and only sends one HTTP request to WebService.
	/// 	</description>
	/// </member>
	Instantly: "Instantly"
};

Fit.Controls.WSTreeView.SelectAllMode = Fit.Controls.WSTreeViewSelectAllMode; // Backward compatibility

Fit.Validation.Enabled(true);
return Fit;})();

	return fitInstance;
});

