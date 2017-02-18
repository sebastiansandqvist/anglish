(function () {
'use strict';

var commonjsGlobal = typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};





function createCommonjsModule(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
}

var mithril = createCommonjsModule(function (module) {
new function() {

function Vnode(tag, key, attrs0, children, text, dom) {
	return {tag: tag, key: key, attrs: attrs0, children: children, text: text, dom: dom, domSize: undefined, state: {}, events: undefined, instance: undefined, skip: false}
}
Vnode.normalize = function(node) {
	if (Array.isArray(node)) { return Vnode("[", undefined, undefined, Vnode.normalizeChildren(node), undefined, undefined) }
	if (node != null && typeof node !== "object") { return Vnode("#", undefined, undefined, node === false ? "" : node, undefined, undefined) }
	return node
};
Vnode.normalizeChildren = function normalizeChildren(children) {
	for (var i = 0; i < children.length; i++) {
		children[i] = Vnode.normalize(children[i]);
	}
	return children
};
var selectorParser = /(?:(^|#|\.)([^#\.\[\]]+))|(\[(.+?)(?:\s*=\s*("|'|)((?:\\["'\]]|.)*?)\5)?\])/g;
var selectorCache = {};
function hyperscript(selector) {
	var arguments$1 = arguments;

	if (selector == null || typeof selector !== "string" && typeof selector.view !== "function") {
		throw Error("The selector must be either a string or a component.");
	}
	if (typeof selector === "string" && selectorCache[selector] === undefined) {
		var match, tag, classes = [], attributes = {};
		while (match = selectorParser.exec(selector)) {
			var type = match[1], value = match[2];
			if (type === "" && value !== "") { tag = value; }
			else if (type === "#") { attributes.id = value; }
			else if (type === ".") { classes.push(value); }
			else if (match[3][0] === "[") {
				var attrValue = match[6];
				if (attrValue) { attrValue = attrValue.replace(/\\(["'])/g, "$1").replace(/\\\\/g, "\\"); }
				if (match[4] === "class") { classes.push(attrValue); }
				else { attributes[match[4]] = attrValue || true; }
			}
		}
		if (classes.length > 0) { attributes.className = classes.join(" "); }
		selectorCache[selector] = function(attrs, children) {
			var hasAttrs = false, childList, text;
			var className = attrs.className || attrs.class;
			for (var key in attributes) { attrs[key] = attributes[key]; }
			if (className !== undefined) {
				if (attrs.class !== undefined) {
					attrs.class = undefined;
					attrs.className = className;
				}
				if (attributes.className !== undefined) { attrs.className = attributes.className + " " + className; }
			}
			for (var key in attrs) {
				if (key !== "key") {
					hasAttrs = true;
					break
				}
			}
			if (Array.isArray(children) && children.length == 1 && children[0] != null && children[0].tag === "#") { text = children[0].children; }
			else { childList = children; }
			return Vnode(tag || "div", attrs.key, hasAttrs ? attrs : undefined, childList, text, undefined)
		};
	}
	var attrs, children, childrenIndex;
	if (arguments[1] == null || typeof arguments[1] === "object" && arguments[1].tag === undefined && !Array.isArray(arguments[1])) {
		attrs = arguments[1];
		childrenIndex = 2;
	}
	else { childrenIndex = 1; }
	if (arguments.length === childrenIndex + 1) {
		children = Array.isArray(arguments[childrenIndex]) ? arguments[childrenIndex] : [arguments[childrenIndex]];
	}
	else {
		children = [];
		for (var i = childrenIndex; i < arguments.length; i++) { children.push(arguments$1[i]); }
	}
	if (typeof selector === "string") { return selectorCache[selector](attrs || {}, Vnode.normalizeChildren(children)) }
	return Vnode(selector, attrs && attrs.key, attrs || {}, Vnode.normalizeChildren(children), undefined, undefined)
}
hyperscript.trust = function(html) {
	if (html == null) { html = ""; }
	return Vnode("<", undefined, undefined, html, undefined, undefined)
};
hyperscript.fragment = function(attrs1, children) {
	return Vnode("[", attrs1.key, attrs1, Vnode.normalizeChildren(children), undefined, undefined)
};
var m = hyperscript;
/** @constructor */
var PromisePolyfill = function(executor) {
	if (!(this instanceof PromisePolyfill)) { throw new Error("Promise must be called with `new`") }
	if (typeof executor !== "function") { throw new TypeError("executor must be a function") }
	var self = this, resolvers = [], rejectors = [], resolveCurrent = handler(resolvers, true), rejectCurrent = handler(rejectors, false);
	var instance = self._instance = {resolvers: resolvers, rejectors: rejectors};
	var callAsync = typeof setImmediate === "function" ? setImmediate : setTimeout;
	function handler(list, shouldAbsorb) {
		return function execute(value) {
			var then;
			try {
				if (shouldAbsorb && value != null && (typeof value === "object" || typeof value === "function") && typeof (then = value.then) === "function") {
					if (value === self) { throw new TypeError("Promise can't be resolved w/ itself") }
					executeOnce(then.bind(value));
				}
				else {
					callAsync(function() {
						if (!shouldAbsorb && list.length === 0) { console.error("Possible unhandled promise rejection:", value); }
						for (var i = 0; i < list.length; i++) { list[i](value); }
						resolvers.length = 0, rejectors.length = 0;
						instance.state = shouldAbsorb;
						instance.retry = function() {execute(value);};
					});
				}
			}
			catch (e) {
				rejectCurrent(e);
			}
		}
	}
	function executeOnce(then) {
		var runs = 0;
		function run(fn) {
			return function(value) {
				if (runs++ > 0) { return }
				fn(value);
			}
		}
		var onerror = run(rejectCurrent);
		try {then(run(resolveCurrent), onerror);} catch (e) {onerror(e);}
	}
	executeOnce(executor);
};
PromisePolyfill.prototype.then = function(onFulfilled, onRejection) {
	var self = this, instance = self._instance;
	function handle(callback, list, next, state) {
		list.push(function(value) {
			if (typeof callback !== "function") { next(value); }
			else { try {resolveNext(callback(value));} catch (e) {if (rejectNext) { rejectNext(e); }} }
		});
		if (typeof instance.retry === "function" && state === instance.state) { instance.retry(); }
	}
	var resolveNext, rejectNext;
	var promise = new PromisePolyfill(function(resolve, reject) {resolveNext = resolve, rejectNext = reject;});
	handle(onFulfilled, instance.resolvers, resolveNext, true), handle(onRejection, instance.rejectors, rejectNext, false);
	return promise
};
PromisePolyfill.prototype.catch = function(onRejection) {
	return this.then(null, onRejection)
};
PromisePolyfill.resolve = function(value) {
	if (value instanceof PromisePolyfill) { return value }
	return new PromisePolyfill(function(resolve) {resolve(value);})
};
PromisePolyfill.reject = function(value) {
	return new PromisePolyfill(function(resolve, reject) {reject(value);})
};
PromisePolyfill.all = function(list) {
	return new PromisePolyfill(function(resolve, reject) {
		var total = list.length, count = 0, values = [];
		if (list.length === 0) { resolve([]); }
		else { for (var i = 0; i < list.length; i++) {
			(function(i) {
				function consume(value) {
					count++;
					values[i] = value;
					if (count === total) { resolve(values); }
				}
				if (list[i] != null && (typeof list[i] === "object" || typeof list[i] === "function") && typeof list[i].then === "function") {
					list[i].then(consume, reject);
				}
				else { consume(list[i]); }
			})(i);
		} }
	})
};
PromisePolyfill.race = function(list) {
	return new PromisePolyfill(function(resolve, reject) {
		for (var i = 0; i < list.length; i++) {
			list[i].then(resolve, reject);
		}
	})
};
if (typeof window !== "undefined") {
	if (typeof window.Promise === "undefined") { window.Promise = PromisePolyfill; }
	var PromisePolyfill = window.Promise;
} else if (typeof commonjsGlobal !== "undefined") {
	if (typeof commonjsGlobal.Promise === "undefined") { commonjsGlobal.Promise = PromisePolyfill; }
	var PromisePolyfill = commonjsGlobal.Promise;
} else {
}
var buildQueryString = function(object) {
	if (Object.prototype.toString.call(object) !== "[object Object]") { return "" }
	var args = [];
	for (var key0 in object) {
		destructure(key0, object[key0]);
	}
	return args.join("&")
	function destructure(key0, value) {
		if (Array.isArray(value)) {
			for (var i = 0; i < value.length; i++) {
				destructure(key0 + "[" + i + "]", value[i]);
			}
		}
		else if (Object.prototype.toString.call(value) === "[object Object]") {
			for (var i in value) {
				destructure(key0 + "[" + i + "]", value[i]);
			}
		}
		else { args.push(encodeURIComponent(key0) + (value != null && value !== "" ? "=" + encodeURIComponent(value) : "")); }
	}
};
var _8 = function($window, Promise) {
	var callbackCount = 0;
	var oncompletion;
	function setCompletionCallback(callback) {oncompletion = callback;}
	function finalizer() {
		var count = 0;
		function complete() {if (--count === 0 && typeof oncompletion === "function") { oncompletion(); }}
		return function finalize(promise0) {
			var then0 = promise0.then;
			promise0.then = function() {
				count++;
				var next = then0.apply(promise0, arguments);
				next.then(complete, function(e) {
					complete();
					if (count === 0) { throw e }
				});
				return finalize(next)
			};
			return promise0
		}
	}
	function normalize(args, extra) {
		if (typeof args === "string") {
			var url = args;
			args = extra || {};
			if (args.url == null) { args.url = url; }
		}
		return args
	}
	function request(args, extra) {
		var finalize = finalizer();
		args = normalize(args, extra);
		var promise0 = new Promise(function(resolve, reject) {
			if (args.method == null) { args.method = "GET"; }
			args.method = args.method.toUpperCase();
			var useBody = typeof args.useBody === "boolean" ? args.useBody : args.method !== "GET" && args.method !== "TRACE";
			if (typeof args.serialize !== "function") { args.serialize = typeof FormData !== "undefined" && args.data instanceof FormData ? function(value) {return value} : JSON.stringify; }
			if (typeof args.deserialize !== "function") { args.deserialize = deserialize; }
			if (typeof args.extract !== "function") { args.extract = extract; }
			args.url = interpolate(args.url, args.data);
			if (useBody) { args.data = args.serialize(args.data); }
			else { args.url = assemble(args.url, args.data); }
			var xhr = new $window.XMLHttpRequest();
			xhr.open(args.method, args.url, typeof args.async === "boolean" ? args.async : true, typeof args.user === "string" ? args.user : undefined, typeof args.password === "string" ? args.password : undefined);
			if (args.serialize === JSON.stringify && useBody) {
				xhr.setRequestHeader("Content-Type", "application/json; charset=utf-8");
			}
			if (args.deserialize === deserialize) {
				xhr.setRequestHeader("Accept", "application/json, text/*");
			}
			if (args.withCredentials) { xhr.withCredentials = args.withCredentials; }
			for (var key in args.headers) { if ({}.hasOwnProperty.call(args.headers, key)) {
				xhr.setRequestHeader(key, args.headers[key]);
			} }
			if (typeof args.config === "function") { xhr = args.config(xhr, args) || xhr; }
			xhr.onreadystatechange = function() {
				// Don't throw errors on xhr.abort(). XMLHttpRequests ends up in a state of
				// xhr.status == 0 and xhr.readyState == 4 if aborted after open, but before completion.
				if (xhr.status && xhr.readyState === 4) {
					try {
						var response = (args.extract !== extract) ? args.extract(xhr, args) : args.deserialize(args.extract(xhr, args));
						if ((xhr.status >= 200 && xhr.status < 300) || xhr.status === 304) {
							resolve(cast(args.type, response));
						}
						else {
							var error = new Error(xhr.responseText);
							for (var key in response) { error[key] = response[key]; }
							reject(error);
						}
					}
					catch (e) {
						reject(e);
					}
				}
			};
			if (useBody && (args.data != null)) { xhr.send(args.data); }
			else { xhr.send(); }
		});
		return args.background === true ? promise0 : finalize(promise0)
	}
	function jsonp(args, extra) {
		var finalize = finalizer();
		args = normalize(args, extra);
		var promise0 = new Promise(function(resolve, reject) {
			var callbackName = args.callbackName || "_mithril_" + Math.round(Math.random() * 1e16) + "_" + callbackCount++;
			var script = $window.document.createElement("script");
			$window[callbackName] = function(data) {
				script.parentNode.removeChild(script);
				resolve(cast(args.type, data));
				delete $window[callbackName];
			};
			script.onerror = function() {
				script.parentNode.removeChild(script);
				reject(new Error("JSONP request failed"));
				delete $window[callbackName];
			};
			if (args.data == null) { args.data = {}; }
			args.url = interpolate(args.url, args.data);
			args.data[args.callbackKey || "callback"] = callbackName;
			script.src = assemble(args.url, args.data);
			$window.document.documentElement.appendChild(script);
		});
		return args.background === true? promise0 : finalize(promise0)
	}
	function interpolate(url, data) {
		if (data == null) { return url }
		var tokens = url.match(/:[^\/]+/gi) || [];
		for (var i = 0; i < tokens.length; i++) {
			var key = tokens[i].slice(1);
			if (data[key] != null) {
				url = url.replace(tokens[i], data[key]);
			}
		}
		return url
	}
	function assemble(url, data) {
		var querystring = buildQueryString(data);
		if (querystring !== "") {
			var prefix = url.indexOf("?") < 0 ? "?" : "&";
			url += prefix + querystring;
		}
		return url
	}
	function deserialize(data) {
		try {return data !== "" ? JSON.parse(data) : null}
		catch (e) {throw new Error(data)}
	}
	function extract(xhr) {return xhr.responseText}
	function cast(type0, data) {
		if (typeof type0 === "function") {
			if (Array.isArray(data)) {
				for (var i = 0; i < data.length; i++) {
					data[i] = new type0(data[i]);
				}
			}
			else { return new type0(data) }
		}
		return data
	}
	return {request: request, jsonp: jsonp, setCompletionCallback: setCompletionCallback}
};
var requestService = _8(window, PromisePolyfill);
var coreRenderer = function($window) {
	var $doc = $window.document;
	var $emptyFragment = $doc.createDocumentFragment();
	var onevent;
	function setEventCallback(callback) {return onevent = callback}
	//create
	function createNodes(parent, vnodes, start, end, hooks, nextSibling, ns) {
		for (var i = start; i < end; i++) {
			var vnode = vnodes[i];
			if (vnode != null) {
				insertNode(parent, createNode(vnode, hooks, ns), nextSibling);
			}
		}
	}
	function createNode(vnode, hooks, ns) {
		var tag = vnode.tag;
		if (vnode.attrs != null) { initLifecycle(vnode.attrs, vnode, hooks); }
		if (typeof tag === "string") {
			switch (tag) {
				case "#": return createText(vnode)
				case "<": return createHTML(vnode)
				case "[": return createFragment(vnode, hooks, ns)
				default: return createElement(vnode, hooks, ns)
			}
		}
		else { return createComponent(vnode, hooks, ns) }
	}
	function createText(vnode) {
		return vnode.dom = $doc.createTextNode(vnode.children)
	}
	function createHTML(vnode) {
		var match1 = vnode.children.match(/^\s*?<(\w+)/im) || [];
		var parent = {caption: "table", thead: "table", tbody: "table", tfoot: "table", tr: "tbody", th: "tr", td: "tr", colgroup: "table", col: "colgroup"}[match1[1]] || "div";
		var temp = $doc.createElement(parent);
		temp.innerHTML = vnode.children;
		vnode.dom = temp.firstChild;
		vnode.domSize = temp.childNodes.length;
		var fragment = $doc.createDocumentFragment();
		var child;
		while (child = temp.firstChild) {
			fragment.appendChild(child);
		}
		return fragment
	}
	function createFragment(vnode, hooks, ns) {
		var fragment = $doc.createDocumentFragment();
		if (vnode.children != null) {
			var children = vnode.children;
			createNodes(fragment, children, 0, children.length, hooks, null, ns);
		}
		vnode.dom = fragment.firstChild;
		vnode.domSize = fragment.childNodes.length;
		return fragment
	}
	function createElement(vnode, hooks, ns) {
		var tag = vnode.tag;
		switch (vnode.tag) {
			case "svg": ns = "http://www.w3.org/2000/svg"; break
			case "math": ns = "http://www.w3.org/1998/Math/MathML"; break
		}
		var attrs2 = vnode.attrs;
		var is = attrs2 && attrs2.is;
		var element = ns ?
			is ? $doc.createElementNS(ns, tag, {is: is}) : $doc.createElementNS(ns, tag) :
			is ? $doc.createElement(tag, {is: is}) : $doc.createElement(tag);
		vnode.dom = element;
		if (attrs2 != null) {
			setAttrs(vnode, attrs2, ns);
		}
		if (vnode.attrs != null && vnode.attrs.contenteditable != null) {
			setContentEditable(vnode);
		}
		else {
			if (vnode.text != null) {
				if (vnode.text !== "") { element.textContent = vnode.text; }
				else { vnode.children = [Vnode("#", undefined, undefined, vnode.text, undefined, undefined)]; }
			}
			if (vnode.children != null) {
				var children = vnode.children;
				createNodes(element, children, 0, children.length, hooks, null, ns);
				setLateAttrs(vnode);
			}
		}
		return element
	}
	function createComponent(vnode, hooks, ns) {
		vnode.state = Object.create(vnode.tag);
		var view = vnode.tag.view;
		if (view.reentrantLock != null) { return $emptyFragment }
		view.reentrantLock = true;
		initLifecycle(vnode.tag, vnode, hooks);
		vnode.instance = Vnode.normalize(view.call(vnode.state, vnode));
		view.reentrantLock = null;
		if (vnode.instance != null) {
			if (vnode.instance === vnode) { throw Error("A view cannot return the vnode it received as arguments") }
			var element = createNode(vnode.instance, hooks, ns);
			vnode.dom = vnode.instance.dom;
			vnode.domSize = vnode.dom != null ? vnode.instance.domSize : 0;
			return element
		}
		else {
			vnode.domSize = 0;
			return $emptyFragment
		}
	}
	//update
	function updateNodes(parent, old, vnodes, hooks, nextSibling, ns) {
		if (old === vnodes || old == null && vnodes == null) { return }
		else if (old == null) { createNodes(parent, vnodes, 0, vnodes.length, hooks, nextSibling, undefined); }
		else if (vnodes == null) { removeNodes(old, 0, old.length, vnodes); }
		else {
			if (old.length === vnodes.length) {
				var isUnkeyed = false;
				for (var i = 0; i < vnodes.length; i++) {
					if (vnodes[i] != null && old[i] != null) {
						isUnkeyed = vnodes[i].key == null && old[i].key == null;
						break
					}
				}
				if (isUnkeyed) {
					for (var i = 0; i < old.length; i++) {
						if (old[i] === vnodes[i]) { continue }
						else if (old[i] == null && vnodes[i] != null) { insertNode(parent, createNode(vnodes[i], hooks, ns), getNextSibling(old, i + 1, nextSibling)); }
						else if (vnodes[i] == null) { removeNodes(old, i, i + 1, vnodes); }
						else { updateNode(parent, old[i], vnodes[i], hooks, getNextSibling(old, i + 1, nextSibling), false, ns); }
					}
					return
				}
			}
			var recycling = isRecyclable(old, vnodes);
			if (recycling) { old = old.concat(old.pool); }
			var oldStart = 0, start = 0, oldEnd = old.length - 1, end = vnodes.length - 1, map;
			while (oldEnd >= oldStart && end >= start) {
				var o = old[oldStart], v = vnodes[start];
				if (o === v && !recycling) { oldStart++, start++; }
				else if (o == null) { oldStart++; }
				else if (v == null) { start++; }
				else if (o.key === v.key) {
					oldStart++, start++;
					updateNode(parent, o, v, hooks, getNextSibling(old, oldStart, nextSibling), recycling, ns);
					if (recycling && o.tag === v.tag) { insertNode(parent, toFragment(o), nextSibling); }
				}
				else {
					var o = old[oldEnd];
					if (o === v && !recycling) { oldEnd--, start++; }
					else if (o == null) { oldEnd--; }
					else if (v == null) { start++; }
					else if (o.key === v.key) {
						updateNode(parent, o, v, hooks, getNextSibling(old, oldEnd + 1, nextSibling), recycling, ns);
						if (recycling || start < end) { insertNode(parent, toFragment(o), getNextSibling(old, oldStart, nextSibling)); }
						oldEnd--, start++;
					}
					else { break }
				}
			}
			while (oldEnd >= oldStart && end >= start) {
				var o = old[oldEnd], v = vnodes[end];
				if (o === v && !recycling) { oldEnd--, end--; }
				else if (o == null) { oldEnd--; }
				else if (v == null) { end--; }
				else if (o.key === v.key) {
					updateNode(parent, o, v, hooks, getNextSibling(old, oldEnd + 1, nextSibling), recycling, ns);
					if (recycling && o.tag === v.tag) { insertNode(parent, toFragment(o), nextSibling); }
					if (o.dom != null) { nextSibling = o.dom; }
					oldEnd--, end--;
				}
				else {
					if (!map) { map = getKeyMap(old, oldEnd); }
					if (v != null) {
						var oldIndex = map[v.key];
						if (oldIndex != null) {
							var movable = old[oldIndex];
							updateNode(parent, movable, v, hooks, getNextSibling(old, oldEnd + 1, nextSibling), recycling, ns);
							insertNode(parent, toFragment(movable), nextSibling);
							old[oldIndex].skip = true;
							if (movable.dom != null) { nextSibling = movable.dom; }
						}
						else {
							var dom = createNode(v, hooks, undefined);
							insertNode(parent, dom, nextSibling);
							nextSibling = dom;
						}
					}
					end--;
				}
				if (end < start) { break }
			}
			createNodes(parent, vnodes, start, end + 1, hooks, nextSibling, ns);
			removeNodes(old, oldStart, oldEnd + 1, vnodes);
		}
	}
	function updateNode(parent, old, vnode, hooks, nextSibling, recycling, ns) {
		var oldTag = old.tag, tag = vnode.tag;
		if (oldTag === tag) {
			vnode.state = old.state;
			vnode.events = old.events;
			if (shouldUpdate(vnode, old)) { return }
			if (vnode.attrs != null) {
				updateLifecycle(vnode.attrs, vnode, hooks, recycling);
			}
			if (typeof oldTag === "string") {
				switch (oldTag) {
					case "#": updateText(old, vnode); break
					case "<": updateHTML(parent, old, vnode, nextSibling); break
					case "[": updateFragment(parent, old, vnode, hooks, nextSibling, ns); break
					default: updateElement(old, vnode, hooks, ns);
				}
			}
			else { updateComponent(parent, old, vnode, hooks, nextSibling, recycling, ns); }
		}
		else {
			removeNode(old, null);
			insertNode(parent, createNode(vnode, hooks, ns), nextSibling);
		}
	}
	function updateText(old, vnode) {
		if (old.children.toString() !== vnode.children.toString()) {
			old.dom.nodeValue = vnode.children;
		}
		vnode.dom = old.dom;
	}
	function updateHTML(parent, old, vnode, nextSibling) {
		if (old.children !== vnode.children) {
			toFragment(old);
			insertNode(parent, createHTML(vnode), nextSibling);
		}
		else { vnode.dom = old.dom, vnode.domSize = old.domSize; }
	}
	function updateFragment(parent, old, vnode, hooks, nextSibling, ns) {
		updateNodes(parent, old.children, vnode.children, hooks, nextSibling, ns);
		var domSize = 0, children = vnode.children;
		vnode.dom = null;
		if (children != null) {
			for (var i = 0; i < children.length; i++) {
				var child = children[i];
				if (child != null && child.dom != null) {
					if (vnode.dom == null) { vnode.dom = child.dom; }
					domSize += child.domSize || 1;
				}
			}
			if (domSize !== 1) { vnode.domSize = domSize; }
		}
	}
	function updateElement(old, vnode, hooks, ns) {
		var element = vnode.dom = old.dom;
		switch (vnode.tag) {
			case "svg": ns = "http://www.w3.org/2000/svg"; break
			case "math": ns = "http://www.w3.org/1998/Math/MathML"; break
		}
		if (vnode.tag === "textarea") {
			if (vnode.attrs == null) { vnode.attrs = {}; }
			if (vnode.text != null) {
				vnode.attrs.value = vnode.text; //FIXME handle0 multiple children
				vnode.text = undefined;
			}
		}
		updateAttrs(vnode, old.attrs, vnode.attrs, ns);
		if (vnode.attrs != null && vnode.attrs.contenteditable != null) {
			setContentEditable(vnode);
		}
		else if (old.text != null && vnode.text != null && vnode.text !== "") {
			if (old.text.toString() !== vnode.text.toString()) { old.dom.firstChild.nodeValue = vnode.text; }
		}
		else {
			if (old.text != null) { old.children = [Vnode("#", undefined, undefined, old.text, undefined, old.dom.firstChild)]; }
			if (vnode.text != null) { vnode.children = [Vnode("#", undefined, undefined, vnode.text, undefined, undefined)]; }
			updateNodes(element, old.children, vnode.children, hooks, null, ns);
		}
	}
	function updateComponent(parent, old, vnode, hooks, nextSibling, recycling, ns) {
		vnode.instance = Vnode.normalize(vnode.tag.view.call(vnode.state, vnode));
		updateLifecycle(vnode.tag, vnode, hooks, recycling);
		if (vnode.instance != null) {
			if (old.instance == null) { insertNode(parent, createNode(vnode.instance, hooks, ns), nextSibling); }
			else { updateNode(parent, old.instance, vnode.instance, hooks, nextSibling, recycling, ns); }
			vnode.dom = vnode.instance.dom;
			vnode.domSize = vnode.instance.domSize;
		}
		else if (old.instance != null) {
			removeNode(old.instance, null);
			vnode.dom = undefined;
			vnode.domSize = 0;
		}
		else {
			vnode.dom = old.dom;
			vnode.domSize = old.domSize;
		}
	}
	function isRecyclable(old, vnodes) {
		if (old.pool != null && Math.abs(old.pool.length - vnodes.length) <= Math.abs(old.length - vnodes.length)) {
			var oldChildrenLength = old[0] && old[0].children && old[0].children.length || 0;
			var poolChildrenLength = old.pool[0] && old.pool[0].children && old.pool[0].children.length || 0;
			var vnodesChildrenLength = vnodes[0] && vnodes[0].children && vnodes[0].children.length || 0;
			if (Math.abs(poolChildrenLength - vnodesChildrenLength) <= Math.abs(oldChildrenLength - vnodesChildrenLength)) {
				return true
			}
		}
		return false
	}
	function getKeyMap(vnodes, end) {
		var map = {}, i = 0;
		for (var i = 0; i < end; i++) {
			var vnode = vnodes[i];
			if (vnode != null) {
				var key2 = vnode.key;
				if (key2 != null) { map[key2] = i; }
			}
		}
		return map
	}
	function toFragment(vnode) {
		var count0 = vnode.domSize;
		if (count0 != null || vnode.dom == null) {
			var fragment = $doc.createDocumentFragment();
			if (count0 > 0) {
				var dom = vnode.dom;
				while (--count0) { fragment.appendChild(dom.nextSibling); }
				fragment.insertBefore(dom, fragment.firstChild);
			}
			return fragment
		}
		else { return vnode.dom }
	}
	function getNextSibling(vnodes, i, nextSibling) {
		for (; i < vnodes.length; i++) {
			if (vnodes[i] != null && vnodes[i].dom != null) { return vnodes[i].dom }
		}
		return nextSibling
	}
	function insertNode(parent, dom, nextSibling) {
		if (nextSibling && nextSibling.parentNode) { parent.insertBefore(dom, nextSibling); }
		else { parent.appendChild(dom); }
	}
	function setContentEditable(vnode) {
		var children = vnode.children;
		if (children != null && children.length === 1 && children[0].tag === "<") {
			var content = children[0].children;
			if (vnode.dom.innerHTML !== content) { vnode.dom.innerHTML = content; }
		}
		else if (vnode.text != null || children != null && children.length !== 0) { throw new Error("Child node of a contenteditable must be trusted") }
	}
	//remove
	function removeNodes(vnodes, start, end, context) {
		for (var i = start; i < end; i++) {
			var vnode = vnodes[i];
			if (vnode != null) {
				if (vnode.skip) { vnode.skip = false; }
				else { removeNode(vnode, context); }
			}
		}
	}
	function removeNode(vnode, context) {
		var expected = 1, called = 0;
		if (vnode.attrs && vnode.attrs.onbeforeremove) {
			var result = vnode.attrs.onbeforeremove.call(vnode.state, vnode);
			if (result != null && typeof result.then === "function") {
				expected++;
				result.then(continuation, continuation);
			}
		}
		if (typeof vnode.tag !== "string" && vnode.tag.onbeforeremove) {
			var result = vnode.tag.onbeforeremove.call(vnode.state, vnode);
			if (result != null && typeof result.then === "function") {
				expected++;
				result.then(continuation, continuation);
			}
		}
		continuation();
		function continuation() {
			if (++called === expected) {
				onremove(vnode);
				if (vnode.dom) {
					var count0 = vnode.domSize || 1;
					if (count0 > 1) {
						var dom = vnode.dom;
						while (--count0) {
							removeNodeFromDOM(dom.nextSibling);
						}
					}
					removeNodeFromDOM(vnode.dom);
					if (context != null && vnode.domSize == null && !hasIntegrationMethods(vnode.attrs) && typeof vnode.tag === "string") { //TODO test custom elements
						if (!context.pool) { context.pool = [vnode]; }
						else { context.pool.push(vnode); }
					}
				}
			}
		}
	}
	function removeNodeFromDOM(node) {
		var parent = node.parentNode;
		if (parent != null) { parent.removeChild(node); }
	}
	function onremove(vnode) {
		if (vnode.attrs && vnode.attrs.onremove) { vnode.attrs.onremove.call(vnode.state, vnode); }
		if (typeof vnode.tag !== "string" && vnode.tag.onremove) { vnode.tag.onremove.call(vnode.state, vnode); }
		if (vnode.instance != null) { onremove(vnode.instance); }
		else {
			var children = vnode.children;
			if (Array.isArray(children)) {
				for (var i = 0; i < children.length; i++) {
					var child = children[i];
					if (child != null) { onremove(child); }
				}
			}
		}
	}
	//attrs2
	function setAttrs(vnode, attrs2, ns) {
		for (var key2 in attrs2) {
			setAttr(vnode, key2, null, attrs2[key2], ns);
		}
	}
	function setAttr(vnode, key2, old, value, ns) {
		var element = vnode.dom;
		if (key2 === "key" || key2 === "is" || (old === value && !isFormAttribute(vnode, key2)) && typeof value !== "object" || typeof value === "undefined" || isLifecycleMethod(key2)) { return }
		var nsLastIndex = key2.indexOf(":");
		if (nsLastIndex > -1 && key2.substr(0, nsLastIndex) === "xlink") {
			element.setAttributeNS("http://www.w3.org/1999/xlink", key2.slice(nsLastIndex + 1), value);
		}
		else if (key2[0] === "o" && key2[1] === "n" && typeof value === "function") { updateEvent(vnode, key2, value); }
		else if (key2 === "style") { updateStyle(element, old, value); }
		else if (key2 in element && !isAttribute(key2) && ns === undefined && !isCustomElement(vnode)) {
			//setting input[value] to same value by typing on focused element moves cursor to end in Chrome
			if (vnode.tag === "input" && key2 === "value" && vnode.dom.value === value && vnode.dom === $doc.activeElement) { return }
			//setting select[value] to same value while having select open blinks select dropdown in Chrome
			if (vnode.tag === "select" && key2 === "value" && vnode.dom.value === value && vnode.dom === $doc.activeElement) { return }
			//setting option[value] to same value while having select open blinks select dropdown in Chrome
			if (vnode.tag === "option" && key2 === "value" && vnode.dom.value === value) { return }
			element[key2] = value;
		}
		else {
			if (typeof value === "boolean") {
				if (value) { element.setAttribute(key2, ""); }
				else { element.removeAttribute(key2); }
			}
			else { element.setAttribute(key2 === "className" ? "class" : key2, value); }
		}
	}
	function setLateAttrs(vnode) {
		var attrs2 = vnode.attrs;
		if (vnode.tag === "select" && attrs2 != null) {
			if ("value" in attrs2) { setAttr(vnode, "value", null, attrs2.value, undefined); }
			if ("selectedIndex" in attrs2) { setAttr(vnode, "selectedIndex", null, attrs2.selectedIndex, undefined); }
		}
	}
	function updateAttrs(vnode, old, attrs2, ns) {
		if (attrs2 != null) {
			for (var key2 in attrs2) {
				setAttr(vnode, key2, old && old[key2], attrs2[key2], ns);
			}
		}
		if (old != null) {
			for (var key2 in old) {
				if (attrs2 == null || !(key2 in attrs2)) {
					if (key2 === "className") { key2 = "class"; }
					if (key2[0] === "o" && key2[1] === "n" && !isLifecycleMethod(key2)) { updateEvent(vnode, key2, undefined); }
					else if (key2 !== "key") { vnode.dom.removeAttribute(key2); }
				}
			}
		}
	}
	function isFormAttribute(vnode, attr) {
		return attr === "value" || attr === "checked" || attr === "selectedIndex" || attr === "selected" && vnode.dom === $doc.activeElement
	}
	function isLifecycleMethod(attr) {
		return attr === "oninit" || attr === "oncreate" || attr === "onupdate" || attr === "onremove" || attr === "onbeforeremove" || attr === "onbeforeupdate"
	}
	function isAttribute(attr) {
		return attr === "href" || attr === "list" || attr === "form" || attr === "width" || attr === "height"// || attr === "type"
	}
	function isCustomElement(vnode){
		return vnode.attrs.is || vnode.tag.indexOf("-") > -1
	}
	function hasIntegrationMethods(source) {
		return source != null && (source.oncreate || source.onupdate || source.onbeforeremove || source.onremove)
	}
	//style
	function updateStyle(element, old, style) {
		if (old === style) { element.style.cssText = "", old = null; }
		if (style == null) { element.style.cssText = ""; }
		else if (typeof style === "string") { element.style.cssText = style; }
		else {
			if (typeof old === "string") { element.style.cssText = ""; }
			for (var key2 in style) {
				element.style[key2] = style[key2];
			}
			if (old != null && typeof old !== "string") {
				for (var key2 in old) {
					if (!(key2 in style)) { element.style[key2] = ""; }
				}
			}
		}
	}
	//event
	function updateEvent(vnode, key2, value) {
		var element = vnode.dom;
		var callback = typeof onevent !== "function" ? value : function(e) {
			var result = value.call(element, e);
			onevent.call(element, e);
			return result
		};
		if (key2 in element) { element[key2] = typeof value === "function" ? callback : null; }
		else {
			var eventName = key2.slice(2);
			if (vnode.events === undefined) { vnode.events = {}; }
			if (vnode.events[key2] === callback) { return }
			if (vnode.events[key2] != null) { element.removeEventListener(eventName, vnode.events[key2], false); }
			if (typeof value === "function") {
				vnode.events[key2] = callback;
				element.addEventListener(eventName, vnode.events[key2], false);
			}
		}
	}
	//lifecycle
	function initLifecycle(source, vnode, hooks) {
		if (typeof source.oninit === "function") { source.oninit.call(vnode.state, vnode); }
		if (typeof source.oncreate === "function") { hooks.push(source.oncreate.bind(vnode.state, vnode)); }
	}
	function updateLifecycle(source, vnode, hooks, recycling) {
		if (recycling) { initLifecycle(source, vnode, hooks); }
		else if (typeof source.onupdate === "function") { hooks.push(source.onupdate.bind(vnode.state, vnode)); }
	}
	function shouldUpdate(vnode, old) {
		var forceVnodeUpdate, forceComponentUpdate;
		if (vnode.attrs != null && typeof vnode.attrs.onbeforeupdate === "function") { forceVnodeUpdate = vnode.attrs.onbeforeupdate.call(vnode.state, vnode, old); }
		if (typeof vnode.tag !== "string" && typeof vnode.tag.onbeforeupdate === "function") { forceComponentUpdate = vnode.tag.onbeforeupdate.call(vnode.state, vnode, old); }
		if (!(forceVnodeUpdate === undefined && forceComponentUpdate === undefined) && !forceVnodeUpdate && !forceComponentUpdate) {
			vnode.dom = old.dom;
			vnode.domSize = old.domSize;
			vnode.instance = old.instance;
			return true
		}
		return false
	}
	function render(dom, vnodes) {
		if (!dom) { throw new Error("Ensure the DOM element being passed to m.route/m.mount/m.render is not undefined.") }
		var hooks = [];
		var active = $doc.activeElement;
		// First time0 rendering into a node clears it out
		if (dom.vnodes == null) { dom.textContent = ""; }
		if (!Array.isArray(vnodes)) { vnodes = [vnodes]; }
		updateNodes(dom, dom.vnodes, Vnode.normalizeChildren(vnodes), hooks, null, undefined);
		dom.vnodes = vnodes;
		for (var i = 0; i < hooks.length; i++) { hooks[i](); }
		if ($doc.activeElement !== active) { active.focus(); }
	}
	return {render: render, setEventCallback: setEventCallback}
};
function throttle(callback) {
	//60fps translates to 16.6ms, round it down since setTimeout requires int
	var time = 16;
	var last = 0, pending = null;
	var timeout = typeof requestAnimationFrame === "function" ? requestAnimationFrame : setTimeout;
	return function() {
		var now = Date.now();
		if (last === 0 || now - last >= time) {
			last = now;
			callback();
		}
		else if (pending === null) {
			pending = timeout(function() {
				pending = null;
				callback();
				last = Date.now();
			}, time - (now - last));
		}
	}
}
var _11 = function($window) {
	var renderService = coreRenderer($window);
	renderService.setEventCallback(function(e) {
		if (e.redraw !== false) { redraw(); }
	});
	
	var callbacks = [];
	function subscribe(key1, callback) {
		unsubscribe(key1);
		callbacks.push(key1, throttle(callback));
	}
	function unsubscribe(key1) {
		var index = callbacks.indexOf(key1);
		if (index > -1) { callbacks.splice(index, 2); }
	}
    function redraw() {
        for (var i = 1; i < callbacks.length; i += 2) {
            callbacks[i]();
        }
    }
	return {subscribe: subscribe, unsubscribe: unsubscribe, redraw: redraw, render: renderService.render}
};
var redrawService = _11(window);
requestService.setCompletionCallback(redrawService.redraw);
var _16 = function(redrawService0) {
	return function(root, component) {
		if (component === null) {
			redrawService0.render(root, []);
			redrawService0.unsubscribe(root);
			return
		}
		
		if (component.view == null) { throw new Error("m.mount(element, component) expects a component, not a vnode") }
		
		var run0 = function() {
			redrawService0.render(root, Vnode(component));
		};
		redrawService0.subscribe(root, run0);
		redrawService0.redraw();
	}
};
m.mount = _16(redrawService);
var Promise = PromisePolyfill;
var parseQueryString = function(string) {
	if (string === "" || string == null) { return {} }
	if (string.charAt(0) === "?") { string = string.slice(1); }
	var entries = string.split("&"), data0 = {}, counters = {};
	for (var i = 0; i < entries.length; i++) {
		var entry = entries[i].split("=");
		var key5 = decodeURIComponent(entry[0]);
		var value = entry.length === 2 ? decodeURIComponent(entry[1]) : "";
		if (value === "true") { value = true; }
		else if (value === "false") { value = false; }
		var levels = key5.split(/\]\[?|\[/);
		var cursor = data0;
		if (key5.indexOf("[") > -1) { levels.pop(); }
		for (var j = 0; j < levels.length; j++) {
			var level = levels[j], nextLevel = levels[j + 1];
			var isNumber = nextLevel == "" || !isNaN(parseInt(nextLevel, 10));
			var isValue = j === levels.length - 1;
			if (level === "") {
				var key5 = levels.slice(0, j).join();
				if (counters[key5] == null) { counters[key5] = 0; }
				level = counters[key5]++;
			}
			if (cursor[level] == null) {
				cursor[level] = isValue ? value : isNumber ? [] : {};
			}
			cursor = cursor[level];
		}
	}
	return data0
};
var coreRouter = function($window) {
	var supportsPushState = typeof $window.history.pushState === "function";
	var callAsync0 = typeof setImmediate === "function" ? setImmediate : setTimeout;
	function normalize1(fragment0) {
		var data = $window.location[fragment0].replace(/(?:%[a-f89][a-f0-9])+/gim, decodeURIComponent);
		if (fragment0 === "pathname" && data[0] !== "/") { data = "/" + data; }
		return data
	}
	var asyncId;
	function debounceAsync(callback0) {
		return function() {
			if (asyncId != null) { return }
			asyncId = callAsync0(function() {
				asyncId = null;
				callback0();
			});
		}
	}
	function parsePath(path, queryData, hashData) {
		var queryIndex = path.indexOf("?");
		var hashIndex = path.indexOf("#");
		var pathEnd = queryIndex > -1 ? queryIndex : hashIndex > -1 ? hashIndex : path.length;
		if (queryIndex > -1) {
			var queryEnd = hashIndex > -1 ? hashIndex : path.length;
			var queryParams = parseQueryString(path.slice(queryIndex + 1, queryEnd));
			for (var key4 in queryParams) { queryData[key4] = queryParams[key4]; }
		}
		if (hashIndex > -1) {
			var hashParams = parseQueryString(path.slice(hashIndex + 1));
			for (var key4 in hashParams) { hashData[key4] = hashParams[key4]; }
		}
		return path.slice(0, pathEnd)
	}
	var router = {prefix: "#!"};
	router.getPath = function() {
		var type2 = router.prefix.charAt(0);
		switch (type2) {
			case "#": return normalize1("hash").slice(router.prefix.length)
			case "?": return normalize1("search").slice(router.prefix.length) + normalize1("hash")
			default: return normalize1("pathname").slice(router.prefix.length) + normalize1("search") + normalize1("hash")
		}
	};
	router.setPath = function(path, data, options) {
		var queryData = {}, hashData = {};
		path = parsePath(path, queryData, hashData);
		if (data != null) {
			for (var key4 in data) { queryData[key4] = data[key4]; }
			path = path.replace(/:([^\/]+)/g, function(match2, token) {
				delete queryData[token];
				return data[token]
			});
		}
		var query = buildQueryString(queryData);
		if (query) { path += "?" + query; }
		var hash = buildQueryString(hashData);
		if (hash) { path += "#" + hash; }
		if (supportsPushState) {
			var state = options ? options.state : null;
			var title = options ? options.title : null;
			$window.onpopstate();
			if (options && options.replace) { $window.history.replaceState(state, title, router.prefix + path); }
			else { $window.history.pushState(state, title, router.prefix + path); }
		}
		else { $window.location.href = router.prefix + path; }
	};
	router.defineRoutes = function(routes, resolve, reject) {
		function resolveRoute() {
			var path = router.getPath();
			var params = {};
			var pathname = parsePath(path, params, params);
			
			var state = $window.history.state;
			if (state != null) {
				for (var k in state) { params[k] = state[k]; }
			}
			for (var route0 in routes) {
				var matcher = new RegExp("^" + route0.replace(/:[^\/]+?\.{3}/g, "(.*?)").replace(/:[^\/]+/g, "([^\\/]+)") + "\/?$");
				if (matcher.test(pathname)) {
					pathname.replace(matcher, function() {
						var keys = route0.match(/:[^\/]+/g) || [];
						var values = [].slice.call(arguments, 1, -2);
						for (var i = 0; i < keys.length; i++) {
							params[keys[i].replace(/:|\./g, "")] = decodeURIComponent(values[i]);
						}
						resolve(routes[route0], params, path, route0);
					});
					return
				}
			}
			reject(path, params);
		}
		
		if (supportsPushState) { $window.onpopstate = debounceAsync(resolveRoute); }
		else if (router.prefix.charAt(0) === "#") { $window.onhashchange = resolveRoute; }
		resolveRoute();
	};
	
	return router
};
var _20 = function($window, redrawService0) {
	var routeService = coreRouter($window);
	var identity = function(v) {return v};
	var render1, component, attrs3, currentPath, lastUpdate;
	var route = function(root, defaultRoute, routes) {
		if (root == null) { throw new Error("Ensure the DOM element that was passed to `m.route` is not undefined") }
		var run1 = function() {
			if (render1 != null) { redrawService0.render(root, render1(Vnode(component, attrs3.key, attrs3))); }
		};
		var bail = function() {
			routeService.setPath(defaultRoute, null, {replace: true});
		};
		routeService.defineRoutes(routes, function(payload, params, path) {
			var update = lastUpdate = function(routeResolver, comp) {
				if (update !== lastUpdate) { return }
				component = comp != null && typeof comp.view === "function" ? comp : "div", attrs3 = params, currentPath = path, lastUpdate = null;
				render1 = (routeResolver.render || identity).bind(routeResolver);
				run1();
			};
			if (payload.view) { update({}, payload); }
			else {
				if (payload.onmatch) {
					Promise.resolve(payload.onmatch(params, path)).then(function(resolved) {
						update(payload, resolved);
					}, bail);
				}
				else { update(payload, "div"); }
			}
		}, bail);
		redrawService0.subscribe(root, run1);
	};
	route.set = function(path, data, options) {
		if (lastUpdate != null) { options = {replace: true}; }
		lastUpdate = null;
		routeService.setPath(path, data, options);
	};
	route.get = function() {return currentPath};
	route.prefix = function(prefix0) {routeService.prefix = prefix0;};
	route.link = function(vnode1) {
		vnode1.dom.setAttribute("href", routeService.prefix + vnode1.attrs.href);
		vnode1.dom.onclick = function(e) {
			if (e.ctrlKey || e.metaKey || e.shiftKey || e.which === 2) { return }
			e.preventDefault();
			e.redraw = false;
			var href = this.getAttribute("href");
			if (href.indexOf(routeService.prefix) === 0) { href = href.slice(routeService.prefix.length); }
			route.set(href, undefined, undefined);
		};
	};
	route.param = function(key3) {
		if(typeof attrs3 !== "undefined" && typeof key3 !== "undefined") { return attrs3[key3] }
		return attrs3
	};
	return route
};
m.route = _20(window, redrawService);
m.withAttr = function(attrName, callback1, context) {
	return function(e) {
		callback1.call(context || this, attrName in e.currentTarget ? e.currentTarget[attrName] : e.currentTarget.getAttribute(attrName));
	}
};
var _28 = coreRenderer(window);
m.render = _28.render;
m.redraw = redrawService.redraw;
m.request = requestService.request;
m.jsonp = requestService.jsonp;
m.parseQueryString = parseQueryString;
m.buildQueryString = buildQueryString;
m.version = "1.0.0";
m.vnode = Vnode;
{ module["exports"] = m; }
};
});

var stream$2 = createCommonjsModule(function (module) {
"use strict";

var guid = 0, HALT = {};
function createStream() {
	function stream() {
		if (arguments.length > 0 && arguments[0] !== HALT) { updateStream(stream, arguments[0]); }
		return stream._state.value
	}
	initStream(stream);

	if (arguments.length > 0 && arguments[0] !== HALT) { updateStream(stream, arguments[0]); }

	return stream
}
function initStream(stream) {
	stream.constructor = createStream;
	stream._state = {id: guid++, value: undefined, state: 0, derive: undefined, recover: undefined, deps: {}, parents: [], endStream: undefined};
	stream.map = stream["fantasy-land/map"] = map, stream["fantasy-land/ap"] = ap, stream["fantasy-land/of"] = createStream;
	stream.valueOf = valueOf, stream.toJSON = toJSON, stream.toString = valueOf;

	Object.defineProperties(stream, {
		end: {get: function() {
			if (!stream._state.endStream) {
				var endStream = createStream();
				endStream.map(function(value) {
					if (value === true) { unregisterStream(stream), unregisterStream(endStream); }
					return value
				});
				stream._state.endStream = endStream;
			}
			return stream._state.endStream
		}}
	});
}
function updateStream(stream, value) {
	updateState(stream, value);
	for (var id in stream._state.deps) { updateDependency(stream._state.deps[id], false); }
	finalize(stream);
}
function updateState(stream, value) {
	stream._state.value = value;
	stream._state.changed = true;
	if (stream._state.state !== 2) { stream._state.state = 1; }
}
function updateDependency(stream, mustSync) {
	var state = stream._state, parents = state.parents;
	if (parents.length > 0 && parents.every(active) && (mustSync || parents.some(changed))) {
		var value = stream._state.derive();
		if (value === HALT) { return false }
		updateState(stream, value);
	}
}
function finalize(stream) {
	stream._state.changed = false;
	for (var id in stream._state.deps) { stream._state.deps[id]._state.changed = false; }
}

function combine(fn, streams) {
	if (!streams.every(valid)) { throw new Error("Ensure that each item passed to m.prop.combine/m.prop.merge is a stream") }
	return initDependency(createStream(), streams, function() {
		return fn.apply(this, streams.concat([streams.filter(changed)]))
	})
}

function initDependency(dep, streams, derive) {
	var state = dep._state;
	state.derive = derive;
	state.parents = streams.filter(notEnded);

	registerDependency(dep, state.parents);
	updateDependency(dep, true);

	return dep
}
function registerDependency(stream, parents) {
	for (var i = 0; i < parents.length; i++) {
		parents[i]._state.deps[stream._state.id] = stream;
		registerDependency(stream, parents[i]._state.parents);
	}
}
function unregisterStream(stream) {
	for (var i = 0; i < stream._state.parents.length; i++) {
		var parent = stream._state.parents[i];
		delete parent._state.deps[stream._state.id];
	}
	for (var id in stream._state.deps) {
		var dependent = stream._state.deps[id];
		var index = dependent._state.parents.indexOf(stream);
		if (index > -1) { dependent._state.parents.splice(index, 1); }
	}
	stream._state.state = 2; //ended
	stream._state.deps = {};
}

function map(fn) {return combine(function(stream) {return fn(stream())}, [this])}
function ap(stream) {return combine(function(s1, s2) {return s1()(s2())}, [stream, this])}
function valueOf() {return this._state.value}
function toJSON() {return this._state.value != null && typeof this._state.value.toJSON === "function" ? this._state.value.toJSON() : this._state.value}

function valid(stream) {return stream._state }
function active(stream) {return stream._state.state === 1}
function changed(stream) {return stream._state.changed}
function notEnded(stream) {return stream._state.state !== 2}

function merge(streams) {
	return combine(function() {
		return streams.map(function(s) {return s()})
	}, streams)
}
createStream["fantasy-land/of"] = createStream;
createStream.merge = merge;
createStream.combine = combine;
createStream.HALT = HALT;

{ module["exports"] = createStream; }
});

var stream = stream$2;

var dictionary = {
	"aardvark": ["ant bear", "ant-bear", "antbear"],
	"abandon": ["wantonness", "recklessness"],
	"abandonment": ["forsaking"],
	"abase": ["cheapen", "warp; shame", "sink"],
	"abash": ["faze", "rattle"],
	"abate": ["drain away", "drop off", "dwindle", "ease", "ebb fall (away)", "lessen", "let up", "lower", "shrink", "wane"],
	"abattoir": ["slaughterhouse"],
	"abbess": ["-"],
	"abbreviation": ["-"],
	"abdicate": ["step down", "step aside from"],
	"abdomen": ["midriff", "belly"],
	"abduct": ["kidnap", "steal", "lead away", "offlead", "nab"],
	"aberrant": ["black-sheep"],
	"aberration": ["-"],
	"abet": ["goad", "spur", "hearten"],
	"abhor": ["hate", "loathe", "mislike"],
	"ability": ["skill", "might", "craft", "knackin-born: mother-wit"],
	"abject": ["low"],
	"abjure": ["foreswear", "take back", "unsay", "withdraw"],
	"ablactate": ["wean"],
	"ablative": ["-"],
	"ablaut": ["-"],
	"able": ["fit", "skilled"],
	// "-able": ["-worthy"],
	"able to": ["can", "may"],
	"ablution": ["washing", "cleansing"],
	"abnegate": ["forgo", "forswear"],
	"abnormal": ["amiss", "unwonted", "odd"],
	"abolish": ["black out", "stamp out", "sweep away", "wipe out"],
	"abominable": ["aweful", "dreadful", "evil", "loathsome", "sickening"],
	"aboriginal": ["inborn"],
	"aborigine": ["-"],
	"abort": ["lay off", "call off"],
	"abortion": ["misbirth"],
	"abound": ["brim", "teem", "overflow"],
	"abrasion": ["graze", "scrape"],
	"abridge": ["cut back", "forshorten", "cut,"],
	"abrupt": ["quick", "fast", "steep"],
	"abscess": ["swelling"],
	"abscond": ["break out", "run off", "steal away"],
	"absence": ["time off", "lack", "needfulness", "want; dearth"],
	"absent": ["missing", "wanting"],
	"absenteeism": ["-"],
	"absent-mindedness": ["daydreaming", "flighty", "thoughtless", "unheeding", "unmindful", "woolgathering"],
	"absinthe": ["wormwood"],
	"absolute": ["outright", "utter", "full", "rankcheckless (Barnes)"],
	"absolutely": ["fully", "wholly", "dead"],
	"absolve": ["forgive"],
	"absorb": ["drink", "soak up", "suck up", "take up; grip; burn", "drain", "draw down", "play out"],
	"abstain": ["forbear (Barnes)", "foregowithhold", "hold back"],
	"abstinence": ["-"],
	"abstract": ["withdrawal", "outline"],
	"abundance": ["wealth", "lot"],
	"abundant": ["teeming", "swarmingoverflowing", "fulsomerife", "fat", "thick", "awash"],
	"abuse": ["scathe", "mishandle"],
	"abysmal": ["1. hellish", "hopeless", "dreadful2. fathomless", "bottomless"],
	"abyss": ["1. hell2. depth", "ground", "deep", "pit", "netherworld"],
	"acacia": ["thorn tree", "whistling thorn", "wattle"],
	"academia": ["-"],
	"academic": ["highbrow", "book-learned"],
	"accede": ["-"],
	"accelerate": ["speed up", "spur", "quicken (Barnes)"],
	"acceleration": ["speeding up"],
	"accent": ["-"],
	"accept": ["swallow", "trust; bear", "shoulder; intake (Barnes)"],
	"acceptable": ["all right", "fairish", "good"],
	"access": ["doorway", "gateway", "key"],
	"accessible": ["at hand"],
	"accessory": ["-"],
	"accident": ["mishap; hap", "luck"],
	"accidental": ["unwitting"],
	"accompany": ["go with", "follow"],
	"accomplish": ["fulfill", "sow up", "bring about", "reach"],
	"accord": ["deal", "meeting of minds"],
	"accordion": ["-"],
	"according to": ["as of", "by"],
	"account": ["ledger"],
	"account of": ["witness (give)"],
	"accountant": ["-"],
	"accumulate": ["heap", "build up", "gather up"],
	"accurate": ["right on", "spot-on"],
	"accusative (case)": ["-"],
	"accuse": ["wray", "guilt"],
	"accustom": ["wean", "wean on", "wean to"],
	"accustomed": ["wont", "used to"],
	"acephalous": ["headless (Barnes)"],
	"acetone": ["-"],
	"acid": ["-"],
	"acne": ["-"],
	"aconite": ["wolfsbane"],
	"acoustics": ["-"],
	"acquaint": ["befriend"],
	"acquaintance": ["friend", "neighbor"],
	"acquiesce": ["bow"],
	"acquire": ["earn", "foster", "get", "win"],
	"acquisition": ["windfall (unexpected)"],
	"acrobat": ["-"],
	"acropolis": ["-"],
	"across": ["over"],
	"act": ["do", "work"],
	"action": ["deed (Barnes), doing", "work"],
	"active": ["snell", "deedy; mettlesome", "springy; hopping", "tied-up"],
	"actor(ess)": ["player"],
	"actual": ["sooth", "true"],
	"actually": ["indeed", "truly", "soothly", "forsooth"],
	"acupuncture": ["pinpricking"],
	"acute": ["sharp", "high (Barnes)", "keen", "honed; shrill (accent)"],
	"a.d.": ["-"],
	"ad infinitum": ["forevermore"],
	"adamant": ["unyielding", "unswayed"],
	"adaptable": ["-"],
	"adapter": ["-"],
	"add": ["eke"],
	"add up": ["cast up", "tally up"],
	"addiction": ["craving", "yearning"],
	"additionally": ["again", "also", "besides", "either", "further", "furthermore", "likewise", "moreover", "then", "too", "withal", "yet", "over and above"],
	"address": ["-"],
	"adept": ["skillful", "skilled", "good,"],
	"adequate": ["right", "even", "fair", "fit", "befitting"],
	"adhere": ["cling", "stick", "cleave to", "follow", "stand by"],
	"adherence to good morals": ["-"],
	"adherent": ["follower"],
	"adiposis": ["overweight"],
	"adjacent": ["near", "next", "neighboring"],
	"adjective": ["-"],
	"adjunct": ["helpmate", "sidekick"],
	"adjust": ["set", "fit"],
	"administer": ["wield", "deal", "lot,"],
	"admiral": ["-"],
	"admire": ["look up to"],
	"admission": ["doorway"],
	"admit": ["let in", "acknowledge", "welcome", "greet", "take in\nconfess: own up"],
	"admonish": ["chide", "forewarn", "upbraid", "warn"],
	"adolescence": ["youthhood"],
	"adolescent": ["youth", "youngling", "youngster", "teen"],
	"adopt": ["take on", "follow; take in", "mother", "rear", "foster", "bring up", "take care of"],
	"adoption": ["fostering"],
	"adorable": ["comely", "lovely", "looksome"],
	"adorn": ["bedeck (Barnes)", "yare", "trim"],
	"adrenaline": ["-"],
	"adulation": ["-"],
	"adult": ["grown-up"],
	"adultery": ["-"],
	"adumbrate": ["outline"],
	"advance": ["inroads", "headway; breakthroughin advance: beforehand"],
	"advancing": ["striding"],
	"advantage": ["high ground", "upper-hand"],
	"advantageous": ["helpful", "worthwhile"],
	"advent": ["coming", "onset"],
	"adventure": ["happening", "time; flutter", "throw", "undertaking"],
	"adventurous": ["daring", "free-swinging", "gutsy"],
	"adverb": ["-"],
	"adversarial": ["-"],
	"adversary": ["foe", "witherling"],
	"adversity": ["ill", "knock", "mishap; hardship", "hurdle", "pitfall"],
	"adversive": ["-"],
	"advertize": ["play up"],
	"advice": ["tip", "help"],
	"advise": ["-"],
	"advocacy": ["backing"],
	"advocate": ["plead for", "uphold", "back up; spokesman"],
	"aerial": ["-"],
	"aerodynamic": ["streamlined"],
	"aerodynamics": ["-"],
	"aeronaut": ["-"],
	"aerospace": ["-"],
	"æsir": ["-"],
	"aesthetic": ["comely", "fair"],
	"affair": ["fling; blowout; handiwork; happening; business"],
	"affection": ["fondness; illness; leaning; hallmark"],
	"affectionate": ["loving", "warm-hearted"],
	"affinity": ["leaning", "kinship"],
	"affirm": ["-"],
	"affirmative": ["aye", "yea", "so", "yes", "yeah", "yep"],
	"affix": ["-"],
	"afflict": ["ail", "smite", "dretch"],
	"affluence": ["wealth", "riches", "fat"],
	"affluent": ["wealthy", "well-off", "well-to-dorich", "fat"],
	"afraid": ["aghast", "fearful", "frightened"],
	"africa": ["-"],
	"age": ["mature: mellow", "ripen"],
	"aged": ["elderly", "old(en)", "yore"],
	"agenda": ["to-do-list"],
	"agglomerate": ["huddle"],
	"agglomeration": ["-"],
	"agglutinate": ["wordlink"],
	"aggressive": ["go-getting"],
	"aggressor": ["raider"],
	"agile": ["nimble", "limber", "lithelight-footed", "yare"],
	"agitate(d)": ["stir", "toss", "keyed-up"],
	"agitation": ["worry"],
	"agoraphobia": ["-"],
	"agree": ["settle on", "fit, hold with (Barnes)"],
	"agreement": ["deal", "meeting of minds"],
	"agrarian": ["field (Barnes)"],
	"agriculture": ["farming", "tilling", "harvest"],
	"aichmophobia": ["needlefright"],
	"aid": ["help", "bestead"],
	"aimsome": ["single-minded (Barnes)"],
	"aids": ["-"],
	"aim": ["goal", "mark"],
	"aim at": ["-"],
	"air": ["wind", "breath; vb: broadcast; freshen"],
	"air force": ["-"],
	"airplane": ["-"],
	"airport": ["-"],
	"aisle": ["path", "lane"],
	"alarm clock": ["-"],
	"alas": ["alack", "ay, woe"],
	"albedo": ["-"],
	"albino": ["-"],
	"album": ["-"],
	"albumen": ["egg white"],
	"alcohol": ["booze", "firewater"],
	"alcoholic": ["sot", "drunkard", "boozen"],
	"alert": ["awake", "watchful; heedful", "wary; numble", "sharp-witted; ready", "willing"],
	"algorithm": ["-"],
	"alien": ["way-out", "fremd", "outlandish"],
	"alienate": ["-"],
	"alienation": ["unfriendliness"],
	"allegory": ["likeness"],
	"allergy": ["-"],
	"alleviate": ["allay", "lighten"],
	"alley": ["walk", "lane", "pathway"],
	"alliance": ["bond", "tie"],
	"allied": ["bound", "wed"],
	"alligator": ["-"],
	"alliteration": ["-"],
	"allocate": ["earmark", "let"],
	"allotment": ["-"],
	"allow": ["let (Barnes), leave", "give the green light for"],
	"allowable": ["-"],
	"alloy": ["mix", "blend", "meld"],
	"allude": ["hint (at)", "touch (on)"],
	"allure": ["draw to"],
	"almanac": ["yearbook"],
	"alphabet": ["ABCs\nalphabet: futhorc"],
	"altar": ["-"],
	"alter": ["wend"],
	"altercation": ["flite", "brangle", "brawl", "row", "dust-up"],
	"alternative": ["other"],
	"altitude": ["height"],
	"altruism": ["selflessness"],
	"altruistic": ["selfless", "unselfish"],
	"amass": ["gather", "heap", "huddle"],
	"amateur": ["greenhorn", "beginner", "starter"],
	"ambassador": ["-"],
	"amber": ["-"],
	"ambidextrous": ["both-handed", "two-handed"],
	"ambience": ["mood", "feeling"],
	"ambiguous": ["-"],
	"ambiguity": ["-"],
	"ambivalence": ["-"],
	"ambulance": ["-"],
	"ambulant": ["roving", "wandering", "wayfaring"],
	"ambush": ["net", "web; waylay (Barnes)"],
	"ameliorate": ["better"],
	"amen": ["-"],
	"america": ["New World"],
	"amicable": ["friendly", "hail-fellow-well-met"],
	"amigo": ["friend"],
	"ammonia": ["-"],
	"amnesia": ["blackout"],
	"amoeba": ["-"],
	"amorphous": ["shapeless"],
	"amount": ["score", "lot", "whit", "deal (Barnes)"],
	"amphibian": ["-"],
	"amphibious": ["-"],
	"amphitheater": ["-"],
	"amplifier": ["-"],
	"amplify": ["-"],
	"amplitude": ["breadth", "reach", "width"],
	"amputate": ["cut (off)"],
	"amusement": ["fun"],
	"amusing": ["delightful"],
	"anachronism": ["mistiming (Barnes)"],
	"anaconda": ["-"],
	"anaesthetic": ["-"],
	"anagram": ["-"],
	"anal": ["bottom"],
	"analgesic": ["-"],
	"analyze": ["check"],
	"anarchism": ["-"],
	"anarchy": ["lawlessness"],
	"anastomosis": ["shunt"],
	"anathema": ["-"],
	"anatomy": ["-"],
	"ancestor": ["forebear (Barnes)forefather (Barnes)elder", "forerunnerfore-elder (Barnes)"],
	"ancestry": ["strain", "seed", "bloodties", "house"],
	"ancient": ["hoary", "olden", "old-time\nforeold (Barnes)"],
	"ancient times": ["yore"],
	"andiron": ["firedog"],
	"anemometer": ["-"],
	"anemone": ["-"],
	"angel": ["-"],
	"anger": ["ire", "wrath"],
	"angle": ["nook", "bight", "winkle"],
	"anglish": ["Onglish"],
	"angry": ["wrathful", "uptight", "waspish"],
	"anguish": ["woe", "sorrow", "heartbreak", "heartache", "throe"],
	"angular": ["-"],
	"animal": ["-"],
	"animate": ["livenliterary: quicken (Barnes)"],
	"anime": ["-"],
	"animosity": ["hate(red)"],
	"annals": ["-"],
	"annelid": ["ringworm"],
	"annihilate": ["wipe out", "be'nothing"],
	"anniversary": ["yearday", "yeartide (Barnes)"],
	"o.oanno domini": ["in the year of our lord"],
	"announce": ["ban", "bode", "bid", "kithe"],
	"annoy": ["irk (Barnes)", "nettle"],
	"annoying": ["irksome (Barnes)"],
	"annual": ["yearbook"],
	"annul": ["fordo"],
	"anoint": ["smear"],
	"anonym": ["nameless"],
	"anorexia": ["-"],
	"antagonist": ["fiend", "foe"],
	"antarctic": ["southend"],
	"antarctica": ["South End"],
	"antecedence": ["beforemath", "foregoing"],
	"antediluvian": ["-"],
	"anterior": ["fore", "foreside"],
	"anthem": ["-"],
	"anthology": ["reader"],
	"anthropology": ["-"],
	"anti-": ["wither-"],
	"antisemite": ["Jew-hater"],
	"anticipate": ["foretell", "foresee"],
	"anticlockwise": ["-"],
	"antics": ["-"],
	"anticonstitutionally": ["-"],
	"antidote": ["-"],
	"antigen": ["-"],
	"antilope": ["-"],
	"antimatter": ["-"],
	"antipathy": ["mislike"],
	"antiquated": ["careworn", "timestruck"],
	"antiquity": ["olden days; oldness", "eldnerliness"],
	"antiseptic": ["-"],
	"anti-statism": ["-"],
	"anti-statist": ["-"],
	"antitoxin": ["-"],
	"antler": ["-"],
	"antonym": ["-"],
	"anulus": ["ring"],
	"anus": ["asshole(vulgar)"],
	"anxiety": ["worry", "fear"],
	"aorta": ["-"],
	"apart": ["cleaved", "sundered", "shedded"],
	"apart from": ["aside"],
	"apartment": ["flat", "room", "by-room"],
	"apathetic": ["samewise"],
	"aperture": ["opening", "breech", "hole"],
	"apex": ["tip", "yop", "top"],
	"aphid": ["greenfly", "blackfly"],
	"aphrodisiac": ["-"],
	"apogee": ["-"],
	"apologise": ["-"],
	"apology": ["sorry (rare)"],
	"apostle": ["-"],
	"apothecary": ["-"],
	"apparel": ["clothes", "wear", "threads", "weed"],
	"apparent": ["seeming"],
	"apparently": ["seemingly", "at first sight", "in name only", "on the outside,openly", "to the eye"],
	"appeal": ["call (upon)"],
	"appealing": ["fair"],
	"appear": ["show up"],
	"appearance": ["blee", "look", "cast"],
	"appease": ["soothe", "allay"],
	"appellation": ["name"],
	"appendage": ["limb"],
	"appendicitis": ["-"],
	"appendix": ["-"],
	"appetite": ["craving", "hunger"],
	"appetizer": ["starter"],
	"application": ["bearing", "putting-on"],
	"apply": ["beseech"],
	"appoint": ["afix", "set up", "earmark", "deem", "settle", "name"],
	"apprehension": ["foreboding", "misgiving"],
	"apprentice": ["beginner", "learner"],
	"approach": ["near", "nigh, draw near to", "come forth", "creep up on"],
	"approaching": ["nearing", "forthcoming", "upcoming", "oncoming"],
	"appropriate": ["befitting", "seemly", "meet"],
	"approximate": ["rough", "near", "loose"],
	"approximately": ["about", "roughly", "nearly", "nigh"],
	"appurtenance": ["-"],
	"april": ["-"],
	"apron": ["-"],
	"apt": ["fit"],
	"aquaculture": ["fish-farming"],
	"aqualung": ["-"],
	"aquamarine": ["seagreen"],
	"aquarium": ["-"],
	"aquatic": ["waterly"],
	"aqueduct": ["-"],
	"aqueous": ["water like", "water bearing"],
	"arable": ["-"],
	"arachnid": ["-"],
	"arboreal": ["-"],
	"arbitrary": ["whimsy"],
	"arboretum": ["-"],
	"arc": ["bow"],
	"archaeology": ["-"],
	"archaeopterix": ["-"],
	"archangel": ["-"],
	"archer": ["bowman"],
	"archery": ["-"],
	"archipelago": ["-"],
	"architecture": ["shell", "framework"],
	"architrave": ["-"],
	"arctic": ["Land of the Midnight Sun"],
	"ardour": ["keenness", "lust"],
	"area": ["land", "landspan", "swathe"],
	"argent": ["silver"],
	"argentina": ["-"],
	"arguable": ["moot"],
	"argue": ["flite", "wrestle", "squabble", "wrangle", "bicker", "tilt"],
	"argument": ["flite"],
	"aridity": ["drought", "dryness"],
	"aristocrat": ["blue-blood"],
	"aristocratic": ["full-blooded", "highborn", "highbred"],
	"arithmetic": ["-"],
	"arm": ["-"],
	"armadillo": ["-"],
	"armistice": ["truce"],
	"armour": ["shield"],
	"army": ["-"],
	"aroma": ["smell"],
	"around": ["about"],
	"arouse": ["stir", "awake", "arear"],
	"arrange": ["fix", "set", "settle; draw up", "lay out"],
	"arrangement": ["layout"],
	"array": ["lay out", "set out"],
	"arrest": ["nab", "avast"],
	"arrive at": ["reach", "come upon", "get to"],
	"arrogant": ["proud", "highhandedoverbearing", "overweening"],
	"arsenal": ["-"],
	"arsonist": ["-"],
	"art": ["craft"],
	"artery": ["-"],
	"artesian": ["-"],
	"arthritis": ["-"],
	"article": ["thing"],
	"artificial": ["manmade", "craftly"],
	"artillery": ["gunware"],
	"artisan": ["craftsman", "wright", "handyman"],
	"artistry": ["craft", "deftness"],
	"asatru(ar) (maður)": ["-"],
	"asbestos": ["-"],
	"ascend": ["climb", "stigh/sty"],
	"ascension day": ["-"],
	"ascent": ["upgoing"],
	"asexual": ["-"],
	"asia": ["the East"],
	"asian (race)": ["yellow (vulgar slang)"],
	"asparagus": ["sparrowgrass"],
	"asphalt": ["-"],
	"assail": ["scathe lay into col.; raid", "storm"],
	"assassin": ["hitman", "murderer"],
	"assault": ["onset", "onrush"],
	"assemble": ["cleave", "gather", "huddle", "banframe", "build", "set up"],
	"assembly": ["ingathering", "meeting; church; get-together", "huddle"],
	"asset": ["holding"],
	"assiduous": ["hopping", "tied-up", "working"],
	"assign": ["allot", "deed", "trust"],
	"assimilate": ["-"],
	"assist": ["help", "bestead", "prop up"],
	"assistance": ["help", "backing", "helping hand", "lift"],
	"assistant": ["helper"],
	"association": ["hookup", "linkup", "tie-up; brotherhood", "guild", "club", "fellowship"],
	"assume": ["deem; foreguess", "bear", "shoulder", "undertake"],
	"aster": ["-"],
	"asterisk": ["star"],
	"asteroid": ["-"],
	"asthma": ["-"],
	"astonish": ["astound", "dumbfound", "amazebewilder", "bewonder,startle"],
	"astonishing": ["amazing", "astounding", "blindsiding", "eye-openingstartling; stunning", "wonderful"],
	"astral": ["-"],
	"astrology": ["starcraft"],
	"astronaut": ["-"],
	"astronomy": ["-"],
	"astute": ["shrewd", "cunning", "sharpquick-witted"],
	"asylum": ["haven", "madhouse"],
	"asymptote": ["-"],
	"atavism": ["throwback"],
	"atelier": ["workshop"],
	"atheist": ["godless"],
	// "-ative": ["-"],
	"atlas": ["-"],
	"atmosphere": ["-"],
	"atom": ["-"],
	"atrocious": ["frightful; rotten"],
	"atrophy": ["withering", "dying", "waning"],
	"attack": ["raid", "rush", "strike"],
	"attain": ["reach"],
	"attempt": ["seek"],
	"attend": ["hearken", "mind; care", "oversee", "watch"],
	"attendant": ["steward"],
	"attention": ["heed", "mind"],
	"attest": ["witness; swear; bear out"],
	"attic": ["loft"],
	"attire": ["cladding"],
	"attitude": ["standing", "outlook", "mood"],
	"attorney": ["lawyer (french suffix)", "lawman"],
	"attract": ["draw", "draw in"],
	"attractive": ["comely", "fair", "good looking", "handsome"],
	"attribute": ["ownship"],
	"aubergine": ["-"],
	"audacious": ["daring", "bold", "ballsy", "fearless", "unafeared", "cheeky", "dare-all", "dareful", "unfearing", "recklessstoor"],
	"audacity": ["gall", "guts", "mettlehardihood", "hardinessboldness", "balls"],
	"audible": ["-"],
	"audience": ["hearing", "listeners"],
	"augment": ["eke"],
	"august": ["-"],
	"aunt": ["-"],
	"aurora": ["dawning", "daylight"],
	"aurora borealis": ["northern lights"],
	"aurum": ["gold"],
	"auscultation": ["harkening"],
	"austere": ["-"],
	"austerity": ["hardliness"],
	"australia": ["-"],
	"author": ["writer"],
	"authority": ["shark; death grip"],
	"auto-": ["self-"],
	"autodidact": ["self-taught"],
	"automaker": ["wainwright"],
	"automatic": ["knee-jerk\ngunning: self-loading", "half-tilt", "full-tilt"],
	"autonomy": ["-"],
	"autonym": ["selfname"],
	"autopsy": ["-"],
	"autumn": ["fall"],
	"auxiliary": ["backup", "fallback"],
	"avail": ["-"],
	"available": ["free", "in stock", "at hand"],
	"avalanche": ["snowslide"],
	"avant garde": ["forhead"],
	"avarice": ["-"],
	"avatar": ["-"],
	"avenge": ["wreak"],
	"average": ["mean", "middling"],
	"avert": ["forestall", "head off", "stave off"],
	"aviary": ["birdhouse"],
	"aviator": ["birdman", "flyer"],
	"avid": ["eager"],
	"avoid": ["miss", "shun", "ware"],
	"avow": ["swear", "trow", "own"],
	"award": ["bestow"],
	"axis": ["axle"],
	"azimuth": ["-"],
	"azure": ["-"],
	"babble": ["clatter", "drivel"],
	"baby": ["bairn", "newborn", "suckling"],
	"bacchanal": ["-"],
	"bacil": ["-"],
	"bacon": ["spick"],
	"bacteria": ["-"],
	"badger": ["brock"],
	"badminton": ["-"],
	"baggage": ["belongings"],
	"baguette": ["French loaf"],
	"bail out": ["pack out", "peel off", "pull out", "run along"],
	"bailiff": ["sheriff", "steward"],
	"balaclava": ["-"],
	"balance": ["steady; match", "make up for", "even up; weigh; settle", "work out", "reckon", "tally\ncomposure: strength of mind or will"],
	"bald": ["bare", "peeled", "stripped; naked; bright-line", "straightforward"],
	"baleen": ["whalebone"],
	"ballad": ["jingle", "folk song"],
	"ballet": ["-"],
	"ballistics": ["-"],
	"balloon": ["bladder; snowball", "spread", "swell", "wax"],
	"baloney": ["twaddle"],
	"baluster": ["-"],
	"banana": ["-"],
	"bandage": ["bind", "swaddle", "swathe", "wreathe"],
	"bandit": ["crook", "outlaw"],
	"banish": ["cast out", "kick out", "run off", "throw out", "turf out", "ban (<OE bannan)"],
	"banister": ["-"],
	"banknote": ["greenback"],
	"bankrupt": ["broke", "spent", "in the red", "on your upperes"],
	"banner": ["jack", "streamer"],
	"banquet": ["feed", "spread"],
	"baptise": ["christen; seat"],
	"bar": ["ban", "forbid", "freeze out", "shut out; shut off", "wall off"],
	"barb": ["prick"],
	"barbarian": ["heathen; rough", "wild; ruthless"],
	"barbarous": ["heartless"],
	"barbeque": ["-"],
	"bargain": ["cheapen", "haggle"],
	"barge": ["scow", "lighter", "flatboat", "narrow boat"],
	"barometer": ["weatherglass"],
	"baron(ess)": ["-"],
	"barracks": ["-"],
	"barracuda": ["-"],
	"barrage": ["wall"],
	"barrel": ["coop", "tub", "drum", "tun", "keg", "firkin", "vat; boatload", "fistful", "good deal"],
	"barrelmaker": ["cooper"],
	"barren": ["bare", "bony", "dead", "empty", "waste"],
	"barricade": ["bar", "block", "bulwark"],
	"barrier": ["-"],
	"base": ["low", "mean"],
	"baseball": ["-"],
	"baseless": ["groundless"],
	"basement": ["-"],
	"basil": ["-"],
	"basis": ["bedrock", "bottom", "footing", "footing", "ground", "groundwork", "keystone", "root", "underpinning"],
	"basket": ["-"],
	"basketball": ["-"],
	"bass": ["-"],
	"basin": ["bowl", "sink; bed", "trough"],
	"bastard": ["n: bye-blow", "lovechild", "whoreson", "mongadj: misbegotten", "unfathered", "underbred"],
	"batik": ["-"],
	"batrachian": ["-"],
	"battalion": ["throng", "crowd"],
	"batter": ["beat", "strike", "cudgel"],
	"battery": ["-"],
	"battery bear": ["moon bear"],
	"battle": ["hurly-burly", "clash"],
	"battlefield": ["-"],
	"battleship": ["-"],
	"bay": ["inlay", "bight; cove (sheltered)"],
	"bayonet": ["goad"],
	"beach volley": ["-"],
	"beak": ["bill", "neb"],
	"beau": ["swain", "ladfriend", "fop"],
	"beautiful": ["comely", "fair", "good-looking", "handsome", "sightly; nifty", "sterling", "sheen"],
	"beauty": ["comeliness", "fairness", "handsomeness", "looks", "loveliness", "prettyness", "sightliness; eyeful", "knockout; bee's knees", "standout"],
	"because": ["as", "as long as", "being as (how)", "being that", "for", "inasmuch as", "now", "seeing", "whereas\nowing to because of"],
	"bedaub": ["besmear"],
	"beef": ["cowflesh", "cowmeat"],
	"behavior": ["bearing", "ways"],
	"beige": ["-"],
	"belarus": ["-"],
	"belfry": ["-"],
	"belgium": ["-"],
	"belladonna": ["-"],
	"bellicose": ["brawly"],
	"belligerent": ["-"],
	"benefactor": ["-"],
	"benefit": ["help"],
	"benevolent": ["kind-hearted", "good"],
	"benign": ["harmless"],
	"berate": ["upbraid"],
	"beret": ["-"],
	"besiege": ["beleaguer; harrow", "beset", "rack"],
	"bestiality": ["-"],
	"betray": ["backstab", "sellout", "two-time; bespeak", "give away; lead on"],
	"betrayer": ["deep throat", "fink", "nark", "rat", "whistleblower; backstabber", "two-timer"],
	"beverage": ["drink", "quencher"],
	"bi-": ["two-"],
	"biannual": ["-"],
	"bias": ["leaning", "one-sidedness; athwart adv"],
	"bible": ["Holy Book"],
	"bibulous": ["spongy", "thirsty; drunken"],
	"bicameral": ["two-roomed"],
	"bicycle": ["two-wheeler"],
	"bidet": ["saddlebath"],
	"bidirectional": ["two-way"],
	"biennial(ly)": ["-"],
	"biker": ["-"],
	"bilateral": ["two-sided"],
	"bile bear": ["moon bear"],
	"bill": ["reckoning", "lawing"],
	"billabong": ["oxbow"],
	"billion (109)": ["-"],
	"binoculars": ["field glasses"],
	"bio-": ["life-", "living"],
	"biography": ["-"],
	"biology": ["-"],
	"bipedal": ["two-legged"],
	"biscuit": ["cookie"],
	"bisect": ["cleave", "halve"],
	"bisexual": ["-"],
	"bittern": ["-"],
	"bitumen": ["blacktop"],
	"bivalve": ["clam"],
	"bizarre": ["weird", "offbeat", "far-out", "outlandish"],
	"blairite": ["-"],
	"blame": ["wite", "guilt", "chide"],
	"blasphemy": ["swearing"],
	"blatant": ["glaring"],
	"blemish": ["mar", "flaw", "fleck"],
	"blemishless": ["clean", "fair", "flawless", "fleckless"],
	"blizzard": ["-"],
	"blond (germanic)": ["fair", "flaxen,golden-brown", "light", "snowy"],
	"blouse": ["keel"],
	"bludgeon": ["club", "cudgel"],
	"bodyguard": ["-"],
	"boffin": ["-"],
	"bog": ["mire"],
	"bogus": ["wrong", "fake"],
	"boil": ["foam", "seethe", "sizzle: simmer"],
	"boilersuit": ["overalls"],
	"bomb": ["blow sky-high"],
	"bonanza": ["windfall", "stroke of luck"],
	"bondage": ["yolk", "thraldom"],
	"bonnet": ["hood", "brimless hat"],
	"boomerang": ["-"],
	"boondocks": ["nowhere", "sticks"],
	"bordello": ["whorehouse", "brothel"],
	"border": ["brim", "hem", "ring"],
	"boss": ["foreman", "head", "leader"],
	"botany": ["-"],
	"bottle": ["flask"],
	"bouillon": ["brew", "dishwater"],
	"boulevard": ["broadway", "bullwark"],
	"boulevardier": ["-"],
	"boundary": ["end", "line; brim", "frame", "hem", "ring"],
	"bountiful": ["bighearted", "openhanded"],
	"bouquet": ["-"],
	"bourbon": ["-"],
	"bourgeois": ["hidebound"],
	"boutique": ["-"],
	"bovine": ["cowlike"],
	"bowel": ["gut"],
	"bra": ["breastshirt", "breastholder"],
	"bracelet": ["wristband", "armband"],
	"braggart": ["boaster", "show-off"],
	"braille": ["-"],
	"branch": ["bough", "limb; feedersub: twig", "offshoot"],
	"brassiere": ["-"],
	"brave": ["bold", "doughty", "fearless", "gutsy", "manful", "stalworth"],
	"bravo!": ["well done!"],
	"brawl": ["flite", "free-for-all"],
	"bray": ["heehaw"],
	"breakable": ["brittle"],
	"breve": ["short"],
	"brewery": ["brewhouse"],
	"bribe": ["buy off"],
	"briefs": ["-"],
	"brilliant": ["shining"],
	"brisk": ["swift", "frisky"],
	"broccoli": ["-"],
	"brochure": ["flyer", "handout"],
	"browser": ["web crawler"],
	"brunet(te)": ["black", "dark", "swarthy"],
	"brutal": ["tough; heartless"],
	"bryophyte": ["moss"],
	"buccaneer": ["freebooter"],
	"bucket": ["boatload (amount)"],
	"buckle": ["fasten", "clasp"],
	"budget": ["nest egg; pool", "stock"],
	"buffalo": ["wild ox"],
	"buffer": ["ward", "shelter"],
	"buffet": ["-"],
	"buffoon": ["clown"],
	"bullet": ["slug", "bolt", "lead", "ball"],
	"bulletin": ["-"],
	"bullion": ["ingots"],
	"bulldozer": ["-"],
	"bully": ["manhandle", "mess over (slang); browbeat", "strong-arm"],
	"bun": ["puff"],
	"bunch": ["lot"],
	"bungalow": ["-"],
	"bungler": ["-"],
	"buoy": ["-"],
	"bureau": ["-"],
	"bureaucracy": ["-"],
	"burgeon": ["bud", "bloom", "blossom"],
	"burglar": ["stealer", "thief", "housebreaker"],
	"burglary": ["housebreaking", "theft"],
	"burgle": ["steal", "plunder", "thieve"],
	"burlesque": ["-"],
	"bus": ["-"],
	"bust": ["chest", "breast"],
	"butcher": ["-"],
	"butler": ["steward"],
	"button": ["-"],
	"buzzard": ["-"],
	"bypass": ["skirt", "shunt; overlook; shortcut", "sidestep"],
	"by-past": ["bygone"],
	"byte": ["-"],
	"caballine": ["horselike", "horsely"],
	"cabaret": ["club", "nightspot", "roadhouse", "nightclub"],
	"cabbage": ["cole", "kale"],
	"cabinet": ["hutch", "sideboard", "locker"],
	"cable": ["wire", "rope"],
	"caboose": ["-"],
	"cacao": ["-"],
	"cache": ["hoard"],
	"cacophony": ["rattle", "roar"],
	"cadaver": ["shell", "framework", "slang: stiff"],
	"cadaverous": ["deathly", "wan", "bloodless", "ashen", "hollow-eyed"],
	"cadet": ["-"],
	"cadmium": ["-"],
	"caecum": ["-"],
	"caesar": ["overlord"],
	"caesium": ["-"],
	"café": ["tearoom\nclub", "nightspot", "roadhouse; taproom", "watering hole; beanery"],
	"cafeteria": ["lunchroom", "lunch house"],
	"cajole": ["soft-soap", "sweet-talk", "wheedle"],
	"cake": ["-"],
	"calamari": ["cuttlefish"],
	"calcaneus": ["heelbone"],
	"calcium": ["-"],
	"calcium carbonate": ["-"],
	"calculate": ["reckon", "work out"],
	"calculator": ["-"],
	"calculus": ["reckoning"],
	"calendar": ["daybook"],
	"calisthenics": ["drills"],
	"calligraphy": ["longhand"],
	"callous": ["slash-and-burn", "soulless", "stony", "thick-skinned", "unfeeling"],
	"calm": ["lull", "settle", "soothe"],
	"calumniate": ["grime", "sully"],
	"calque": ["borrowing"],
	"calyx": ["-"],
	"camel": ["-"],
	"camera": ["-"],
	"camouflage": ["dapple", "(dappling", "dappleshell", "dapplehide", "dappleclad", "dappleteld)\ndazzle-painting (attested)"],
	"camomile": ["-"],
	"camp": ["leaguer", "lair"],
	"campaign": ["take the stump", "barnstorm"],
	"campus": ["-"],
	"canal": ["leat", "waterway"],
	"cancer": ["zodiac: Crab"],
	"candelabrum": ["-"],
	"candidate": ["hopeful"],
	"canine": ["doggy", "houndlike"],
	"cannon": ["-"],
	"candy": ["sweets"],
	"candied": ["sweetened"],
	"canvas": ["-"],
	"canyon": ["gulch"],
	"capacity": ["room", "berth; strength", "gift", "readiness"],
	"cape": ["sleeveless coatgeography: foreland", "headland", "ness"],
	"capital": ["wealth", "means", "wherewithal; sterling; foremost"],
	"capitalist": ["silk stocking"],
	"capricious": ["fickle"],
	"capsize": ["keel", "upset"],
	"captain": ["headman", "leader"],
	"captivate": ["wile"],
	"captive": ["penned", "locked up"],
	"capture": ["nail", "take", "kidnap", "steal", "swipe", "nab"],
	"car": ["wheels slang"],
	"caravan": ["-"],
	"carbon": ["chark", "soot"],
	"carbon dioxide": ["-"],
	"carburator": ["-"],
	"carcass": ["bones", "stiff"],
	"cardiac arrest": ["heartstop"],
	"cardinal (church official)": ["-"],
	"cardinal (bird)": ["redbird"],
	"career": ["calling", "game (inf.)", "walk of life"],
	"caress": ["fondle", "stroke"],
	"cargo": ["draft", "freight", "haul", "loading", "weight"],
	"caribou": ["reindeer"],
	"carnal": ["fleshly"],
	"carnal attraction": ["-"],
	"carnivore": ["meateater", "flesheater"],
	"carouse": ["birle"],
	"carousel": ["-"],
	"carpenter": ["woodworker"],
	"carpentry": ["woodwork", "woodcraft"],
	"carpet": ["-"],
	"carriage": ["bearing"],
	"carrot": ["-"],
	"carry": ["bear", "weigh", "ferry", "take,"],
	"cartoon": ["-"],
	"cartouche": ["-"],
	"cartridge": ["bag", "load", "holder"],
	"case": ["hull", "husk", "pod", "sheath", "shell; box\nin case: lest", "by fear of", "if... should"],
	"cashewnut": ["-"],
	"casing": ["shell", "brass"],
	"casino": ["-"],
	"castle": ["burg", "stronghold\ninnermost keep"],
	"casual": ["breezy", "blithe", "light-hearted"],
	"cat": ["puss"],
	"catch": ["snare", "snarl", "snag", "latch", "fang", "nab"],
	"catechism": ["-"],
	"catechize": ["grill", "sweat slang"],
	"categorize": ["-"],
	"caterpillar": ["-"],
	"cathedral": ["-"],
	"catheter": ["-"],
	"cathode": ["-"],
	"catholic": ["-"],
	"catkin": ["-"],
	"cattle": ["cows", "livestock", "kine", "nowt", "fee"],
	"caucasian (race)": ["white"],
	"cauldron": ["(big) kettle"],
	"cauliflower": ["-"],
	"cause": ["beget", "breed", "drive", "make", "work", "yield"],
	"cause, without": ["-"],
	"caustic": ["burning"],
	"cautery": [""],
	"caution": ["wariness", "care", "reck"],
	"cavalier": ["horseman"],
	"cavalry": ["horsemen", "riders"],
	"cave": ["-"],
	"cavil": ["carp"],
	"cavity": ["dint", "hollow", "pit"],
	"cease": ["stop", "lay off", "halt", "give up", "leave off,"],
	"ceasefire": ["truce"],
	"cede": ["yield", "hand over"],
	"celebrate": ["-"],
	"celery": ["-"],
	"celestial bow": ["rainbow", "heaven's bow"],
	"celestial sphere": ["-"],
	"cell": ["hole", "room"],
	"cell division": ["-"],
	"cellulose": ["-"],
	"cellar": ["-"],
	"cement": ["-"],
	"cemetery": ["graveyard", "boneyard"],
	"censorship": ["-"],
	"censure": ["upbraid"],
	"census": ["tale", "tally"],
	"cent": ["penny", "hundredth"],
	"centaur": ["-"],
	"centipede": ["-"],
	"central": ["overriding; midway", "midmost; middle-of-the-road"],
	"centre": ["heart; middle", "midst"],
	"century": ["-"],
	"cereal": ["-"],
	"certain": ["wis"],
	"certainly": ["wisly"],
	"certificate": ["-"],
	"cerulean": ["-"],
	"cerumen": ["earwax"],
	"chain": ["shackle", "fetter"],
	"chair": ["seat", "stool"],
	"chalice": ["bowl"],
	"challenge": ["fuss", "kick; knot; dare; becall"],
	"chamber": ["room; bay (enclosed space)"],
	"chameleon": ["-"],
	"chance": ["luck", "opening"],
	"change": ["shift", "switch", "makeover\ndough (cash)"],
	"channel": ["fairway", "race", "ford"],
	"charming": ["friendly", "lovely", "winsome", "comely"],
	"chaos": ["mess"],
	"character": ["clay", "self"],
	"charge": ["fill", "load", "outlay; lading"],
	"charged": ["owing", "laden (electric)"],
	"charitable": ["kind", "freehanded", "freehearted", "unselfish", "unsparing", "unstinting"],
	"charity": ["help", "gift", "hand-out; goodness", "goodwill", "fellow feeling; alms", "dole; ruth; brotherhood"],
	"charlatan": ["swindler"],
	"charter": ["-"],
	"chase": ["hotfoot", "put to flight"],
	"chastise": ["chew out", "chide", "flay", "hammer", "jaw", "keelhaul", "ream out", "tongue-lash", "upbraid"],
	"cheat": ["shark", "bilk, do in", "nobble", "rip off", "rig, swindle; shark", "dodger", "swindler"],
	"checkers (game)": ["Draughts"],
	"cheer": ["gladden", "root", "hearten", "perk up"],
	"chef d'oeuvre": ["-"],
	"chemistry": ["-"],
	"cherish": ["hold dear", "cleave to; care for", "love", "look after", "shelter; harbor"],
	"chief": ["ringleader"],
	"chili": ["-"],
	"chime": ["ring", "toll"],
	"chimpanzee": ["-"],
	"china": ["Middle Kingdom"],
	"chivalrous": ["big", "greathearted", "high-minded", "lofty", "lordly"],
	"chivalry": ["knightliness"],
	"chlorophyll": ["leafgreen"],
	"choice": ["choosing", "picking", "wale"],
	"cholesterol": ["-"],
	"chrestomathy": ["-"],
	"christian": ["-"],
	"christianity": ["-"],
	"christmas": ["Yule"],
	"chromosome": ["-"],
	"chromatid": ["-"],
	"chronicle": ["ledger", "tale", "saga"],
	"chronology": ["timeline"],
	"chrysanthemum": ["-"],
	"cider": ["apple wine"],
	"cigar": ["smoke"],
	"cigarette": ["smoke", "fag", "butt", "stompie"],
	"cinema": ["-"],
	"cinquefoil": ["-"],
	"circa": ["about", "umb (<OE", "<NHG)"],
	"circle": ["ring", "loop", "wreath", "trindle", "trundle"],
	"circuit": ["ringway"],
	"circulate": ["flow; broadcast"],
	"circulation": ["flow"],
	"circulatory system": ["bloodstream"],
	"circumambulate": ["walk around"],
	"circumcise": ["cut"],
	"circumference": ["rim"],
	"circumflex": ["-"],
	"circumspect": ["careful", "watchful"],
	"circumstance": ["doom", "hap", "luck"],
	"circumvent": ["shortcut", "sidestep; girdle", "ring"],
	"circus": ["big top"],
	"cirrocumulus": ["-"],
	"citizen": ["towns(wo)man"],
	"citroen": ["sourapple"],
	"city": ["borough", "burgh", "burg", "town"],
	"civet cat": ["-"],
	"civil law": ["-"],
	"civilian": ["-"],
	"civility": ["-"],
	"civilization": ["-"],
	"civilize": ["tame", "settle"],
	"clairvoyance": ["-"],
	"claim": ["call", "dibs", "right; share", "stake"],
	"clamor": ["din"],
	"clan": ["body", "crowd", "network", "ring", "set; blood", "folks", "house", "kindred", "line", "set"],
	"clarify": ["shed light on"],
	"class": ["set; feather"],
	"classic": ["-"],
	"classical": ["-"],
	"classification": ["tag", "brand"],
	"classify": ["tag", "brand"],
	"claustrophobia": ["-"],
	"clear": ["sharp; lily-white"],
	"clearing": ["-"],
	"clergy": ["church", "cloth"],
	"clergyman": ["churchman", "father", "shepherd", "man of the cloth"],
	"cliché": ["hackneyed", "moth-eaten; n: groaner"],
	"climate": ["-"],
	"clinic": ["-"],
	"clock": ["timer"],
	"clockwise": ["sunwise"],
	"clone": ["twin"],
	"close": ["near", "narrow", "nearby"],
	"co-": ["fellow", "by-", "i-"],
	"coalition": ["-"],
	"coast": ["seashore", "seaboard", "strand; sail", "drift"],
	"coat of arms": ["-"],
	"cockroach": ["-"],
	"coeval": ["-"],
	"coffer": ["-"],
	"cognate": ["-"],
	"cognizant": ["aware"],
	"cohabit": ["-"],
	"coil": ["-"],
	"coin": ["-"],
	"coincidence": ["-"],
	"coitus": ["-"],
	"cojones": ["balls", "guts"],
	"colic": ["-"],
	"collapse": ["downfall", "infall", "swooning"],
	"colleague": ["workmate", "fellow worker"],
	"collect": ["gather"],
	"colonize": ["settle", "take over", "spread through(out)"],
	"colony": ["-"],
	"colour": ["hue", "dye", "shade"],
	"column": ["upright"],
	"combine": ["bind"],
	"combustible": ["fiery"],
	"comedian": ["funnyman"],
	"comedy": ["-"],
	"comet": ["shooting star"],
	"comfort": ["liss", "frover"],
	"comfortable": ["soft"],
	"comestible": ["eating"],
	"comic": ["funny"],
	"comics": ["-"],
	"command": ["bid", "lead", "behest; spearhead"],
	"commandment": ["behest"],
	"commence": ["begin", "start"],
	"commensurate": ["fitting"],
	"comment": ["-"],
	"commentary": ["input", "feedback"],
	"commerce": ["business", "trade; dealings"],
	"commercial": ["businesswise"],
	"commit": ["do", "betake", "belay"],
	"common": ["household: cut-and-fry", "workaday; broad-brush", "overall; shared; middling; lowbrow\npeasants churlish"],
	"commonwealth": ["leedwealth (cf. Ic", "Fa. lýðveldi)\nkinwise (<OE cynewise) thoftkinwise"],
	"commotion": ["-"],
	"communicate": ["spread; brainstorm; bespeak"],
	"communion": ["fellowship"],
	"communism": ["-"],
	"communist": ["-"],
	"community": ["fellowship"],
	"compact": ["hard", "stiff", "unyielding; crowded", "packed", "thick", "tight; thumbnail (expression)"],
	"compact disc": ["-"],
	"cd-rom": ["-"],
	"companion": ["fellow", "mate"],
	"company": ["business", "outfit; brotherhood", "fellowship"],
	"comparative": ["-"],
	"compare": ["liken", "stack up"],
	"compassion": ["feeling; kindness", "ruth; goodwill"],
	"compatible": ["kindred"],
	"compatriot": ["kinsman"],
	"compel": ["-"],
	"compensation": ["meed"],
	"competent": ["fit", "good; fair", "right"],
	"compile": ["put together"],
	"complain": ["whine", "bitch", "caterwaul", "moan", "gripe", "whinge"],
	"complete": ["fulfill", "end"],
	"completely": ["outright", "fully", "utterly", "thoroughly", "through and through", "inside-out", "to the hilt", "altogether"],
	"complexion": ["hue", "look", "blee", "ilk", "kind", "suchness", "way", "outlook"],
	"compliant": ["toward", "abiding"],
	"complicate": ["-"],
	"complicated": ["knotty", "tangled"],
	"compline": ["-"],
	"composer": ["-"],
	"composition": ["layout"],
	"compound": ["cocktail", "meld", "mix"],
	"comprehensive": ["all-in", "thorough; whole; all-out\nadv: fully", "inside-out", "throough and through"],
	"comprise": ["make up"],
	"compromise": ["tradeoff", "deal", "vb: meet halfway"],
	"compunction": ["qualm", "misgiving"],
	"computation": ["reckoning"],
	"compute(r)": ["-Reckon(er)", "Gemynthincan"],
	"concatenation": ["-"],
	"conceal": ["hide", "shroud"],
	"concealment": ["hiding; hideaway", "lair", "nest"],
	"conceivable": ["thoughtworthy"],
	"conceive": ["dream; make out", "twig"],
	"concentrate": ["meet", "cluster", "gather; fasten; lump; build up"],
	"concentrated": ["crammed"],
	"concentration camp": ["-"],
	"concentric": ["-"],
	"concern": ["care", "worry", "reck"],
	"concerning": ["as for", "as far as", "on", "toward"],
	"concept": ["mind's eye"],
	"conception": ["mind's eye", "thought"],
	"conclude": ["end", "wind up", "wrap up; break up", "leeave off", "let up", "wind up", "wink out; name", "settle upon; gather", "make out"],
	"conclusion": ["ending"],
	"concurrently": ["meanwhile", "all-the-while", "all along"],
	"concussion": ["shell shock"],
	"condemn": ["-"],
	"condescend": ["belittle", "stoop", "talk down", "lower"],
	"condition": ["onlay", "fettle ;-)"],
	"condom": ["warding", "rubber", "scumbag"],
	"conduct": ["lead", "drive"],
	"confectionary": ["sweets", "sweet-shop"],
	"confederacy": ["-"],
	"confederate": ["henchman"],
	"confer": ["bestow", "lend", "give over"],
	"conference": ["meeting"],
	"confess": ["beken", "acknowledge", "own up"],
	"confession": ["acknowledging", "shrift"],
	"configuration": ["setting", "set up", "of elements layout"],
	"confine": ["lock in", "keep", "trap", "fetter", "bind", "latch", "grasp", "abed (by illness)", "bedrid"],
	"confiscate": ["filch"],
	"conflagration": ["fire"],
	"confluence": ["-"],
	"conform": ["dovetail; blend", "groove; key"],
	"conformism": ["-"],
	"conformity": ["-"],
	"confound": ["befuddle", "bewilder", "addle"],
	"confront": ["take on", "come at", "be up against"],
	"confuse": ["befuddle", "mistake", "ravel", "bewilder", "muddle", "mangle", "addle"],
	"confusion": ["muddling"],
	"congress": ["gathering", "moot", "lawmaker body"],
	"conjugate": ["bend"],
	"conjunction": ["linking word"],
	"connect": ["link", "fit", "tie-in", "bind"],
	"conquer": ["do down", "overcome", "upend", "worst"],
	"conquest": ["overwin"],
	"consanguinity": ["kinship"],
	"conscience": ["-"],
	"conscious": ["aware", "mindful", "heedful", "waken"],
	"consciousness": ["awareness", "mindfulness", "heedfulness", "wake"],
	"conscript": ["draft", "call-up"],
	"consecrate": ["bless", "hallow", "bename"],
	"consent": ["leave"],
	"consequence": ["aftermath", "backwash", "outcome", "upshot; wightiness"],
	"consequently": ["hence", "thereby", "thereupon", "thus", "wherefore"],
	"consider": ["heed", "bethink", "think about", "reckon", "set down"],
	"consideration": ["thought"],
	"consist of": ["be made up of"],
	"console": ["frover", "soothe", "allay sorrow", "share grief", "give strength and hope"],
	"consonant": ["-"],
	"conspicuous": ["-"],
	"conspire": ["plot"],
	"constant": ["ongoing", "besetting"],
	"constipated": ["-"],
	"constitution": ["clay", "self; build", "frame", "shape; law"],
	"constraint": ["-"],
	"constrict": ["-"],
	"consume": ["eat (up)", "drain", "spend", "intake"],
	"consumerism": ["-"],
	"consummate": ["crack", "good", "great", "skilled; blooming", "straight-out; utmost"],
	"consumption": ["intaking"],
	"contact": ["get", "reach"],
	"contain": ["hold", "inhold", "have in itself"],
	"contaminate": ["befoul"],
	"contemplate": ["-"],
	"contemplation": ["thought"],
	"contemporary": ["today's"],
	"contempt": ["loathing", "hatred"],
	"contemptuous": ["-"],
	"contend": ["set to"],
	"contend (argue)": ["flite", "hold"],
	"content": ["pleased"],
	"contention": ["wrangling"],
	"contest": ["match"],
	"context": ["light", "framework", "ins and outs"],
	"contiguous": ["abutting"],
	"continent": ["mainland"],
	"continue": ["go on", "abide", "keep on", "keep at", "wend"],
	"continuous": ["unbroken", "ongoing"],
	"contort": ["writhe"],
	"contract": ["bond", "deal", "settlement"],
	"contradict": ["gainsay", "withsay"],
	"contrary": ["against"],
	"contrast": ["-"],
	"contribute": ["pitch in"],
	"contribution": ["input", "giving"],
	"contrition": ["sorrow", "guilt", "ruth"],
	"control": ["bridle", "hold", "keep", "tame; steward"],
	"conundrum": ["riddle"],
	"conurbation": ["-"],
	"convergence": ["meeting"],
	"conversation": ["talk", "mailing"],
	"converse": ["speak", "talk"],
	"conversely": ["on the other hand", "otherwise"],
	"convert": ["wend", "make over"],
	"convey": ["give", "spread; bear", "ferry; deed", "make over"],
	"convict": ["lag"],
	"convoy": ["-"],
	"co-operate": ["work together"],
	"cop": ["hound", "pig (slang", "slightly vulgar)"],
	"cope": ["deal"],
	"copious": ["beteeming"],
	"copper": ["-"],
	"copse": ["thicket", "shaw"],
	"copy": ["1. twin2. ape"],
	"copy & paste": ["-"],
	"coral": ["-"],
	"cord": ["fasten"],
	"cordial": ["friendly", "hearty", "warm"],
	"cords": ["-"],
	"corduroy": ["ribbed cloth"],
	"core": ["heart", "yolk", "innermost being"],
	"cormorant": ["sea raven"],
	"cornea": ["-"],
	"corner": ["nook", "winkle", "hirn"],
	"coronation": ["-"],
	"corpor(e)al": ["bodily"],
	"corporation": ["-"],
	"corpse": ["-"],
	"corpus": ["body"],
	"correct": ["right", "righten", "(acad) mark"],
	"correction": ["righting"],
	"correction fluid": ["white out"],
	"corridor": ["hallway"],
	"corroborate": ["bear out"],
	"corrode": ["gnaw"],
	"corrugated": ["-"],
	"corrupt": ["crooked", "bent", "rot"],
	"corslet": ["byrnie"],
	"cosmetics": ["fard"],
	"cost": ["outlay", "worth"],
	"costly": ["dear"],
	"costa rica": ["-"],
	"costume": ["outfit", "get-up", "fake dress"],
	"côte d'ivoire": ["-"],
	"cottage": ["cote"],
	"cottager": ["-"],
	"cotton": ["-"],
	"council": ["gathering", "huddle; board", "brotherhood", "fellowship"],
	"counsel": ["lead", "shepherd"],
	"counsel(l)or": ["alder(wo)man"],
	"count": ["earl"],
	"countenance": ["cast"],
	"counterbalance": ["offset"],
	"counter-clockwise": ["withershins"],
	"counterculture": ["-"],
	"counterpart": ["match"],
	"counterstroke": ["-"],
	"country": ["land", "weald", "upland (rural", "as in countryside)", "kith", "fatherland", "homeland", "motherland"],
	"county": ["shire", "ethel", "earldom", "wapentake", "erd"],
	"county council": ["-"],
	"coup": ["strike"],
	"coup de grâce": ["topper"],
	"coupling, train/carriage": ["thill"],
	"coupon": ["-"],
	"courage": ["mettle", "boldness", "fearlessness", "heart", "heartiness", "daring"],
	"courageous": ["bold", "daring", "doughty", "fearless", "full-hearted", "unfrightened"],
	"course": ["line", "pathway"],
	"course (academic)": ["-"],
	"court": ["-"],
	"courteous": ["fairspoken"],
	"courtyard": ["-"],
	"cousin": ["kins(wo)man"],
	"covenant": ["oath", "deal", "bond", "binding"],
	"cover": ["overlay", "hide", "deck", "overspread"],
	"covered area": ["deck", "roofed deck"],
	"covering": ["skin", "feathers", "hackles"],
	"cover with": ["lay on"],
	"covert": ["hidden", "shrouded", "stealthy", "under wraps,"],
	"cover-up": ["whitewash", "hush-work"],
	"covet": ["crave", "want", "hunger after", "thirst after", "cast greedy eyes upon"],
	"covetous": ["greedy", "graspy", "grabby", "hoggish", "wanting"],
	"coward": ["wimp", "woos", "fearer"],
	"cowardly": ["gutless", "thewless", "woosy", "fearful"],
	"co-worker": ["by-worker", "fellow worker"],
	"cranium": ["skull"],
	"cravat": ["necktie", "neckcloth"],
	"crayon": ["-"],
	"cream": ["salve", "ream", "milk's head"],
	"crease": ["wrinkle", "rumple", "rimple", "runkle"],
	"create": ["build", "craft", "make", "start", "shape", "put together"],
	"creation": ["brainchild", "wrinke; world", "rise"],
	"creature": ["head", "thing", "wight: beast,"],
	"credence": ["belief", "trustworthiness"],
	"credibility": ["trustworthiness"],
	"credible": ["trustworthy"],
	"credit": ["hail", "acknowledgement"],
	"creed": ["belief"],
	"cremate": ["bale"],
	"creme de la creme": ["bee's knees", "dog's bollocks", "best of the best", "fat of the land", "best"],
	"crepuscular": ["twilighty"],
	"crepuscule": ["twilight", "darkfall", "dusk", "nightfall", "gloaming", "evenfall", "eventide", "sundown"],
	"crest": ["ridge", "noon", "top; high-water mark"],
	"cretaceous": ["-"],
	"cretin": ["blighter; nit"],
	"crevasse": ["cleft"],
	"crevice": ["cleft", "gap", "hole"],
	"crime": ["lawbreaking; shame", "sin; wrongdoing", "misdeed"],
	"criminal": ["crook", "outlaw", "lawbreaker", "wrongdoer"],
	"crimson": ["-"],
	"criterion": ["yardstick; hallmark", "need"],
	"critical": ["weighty", "key", "scathing"],
	"criticise": ["slag", "knock"],
	"criticism": ["-"],
	"crocodile": ["-"],
	"croissant": ["-"],
	"cross": ["-"],
	"crown": ["-"],
	"crucifix": ["-"],
	"crucify": ["-"],
	"crude": ["rough", "raw"],
	"cruel": ["harsh", "mean", "ruthless"],
	"cruelty": ["meaness", "harshness", "ruthlessness"],
	"crusade": ["drive", "push"],
	"cry": ["weep", "shout", "wail", "yell", "howl", "sob", "roup", "cleep", "wail"],
	"crystal": ["-"],
	"cub": ["-"],
	"cuckoo": ["-"],
	"cucumber": ["-"],
	"cull": ["pickings", "siftings"],
	"cul de sac": ["dead end"],
	"culminate": ["-"],
	"cultivate": ["till", "harvest", "work,"],
	"culture": ["couth", "folklore", "way of life"],
	"culvert": ["-"],
	"cure": ["heal"],
	"curious": ["funny"],
	"curlew": ["whaup"],
	"current": ["run", "drift", "leaning", "tide", "wind", "now"],
	"currently": ["as of yet", "now", "nowenly"],
	"curriculum": ["-"],
	"curriculum vitae": ["-"],
	"cursive": ["handwritten"],
	"cursor": ["runner"],
	"curtail": ["cut back", "foreshorten", "clip,"],
	"curtain": ["-"],
	"curve": ["bow", "bend", "wind,"],
	"custody": ["hold", "hands"],
	"custom": ["wone", "wont", "business", "trade"],
	"customary": ["-"],
	"cutaneous": ["skin", "hide"],
	"cutaneous disease": ["tetter", "scurf", "scurvy"],
	"cute": ["pretty", "sweet", "lief"],
	"cutlass": ["backsword"],
	"cutlery": ["flatware", "silverware"],
	"cyclist": ["-"],
	"cyclone": ["-"],
	"cygnet": ["swanling"],
	"cynosure": ["-"],
	"czar": ["king"],
	"dairy": ["milkhouse"],
	"damage": ["break", "harm", "hurt", "forspill"],
	"damaged": ["broken", "dented", "unsound"],
	"damaging": ["bad", "baleful", "baneful", "hurtful"],
	"damn": ["all-out", "flat-out", "out-and-out"],
	"damnation": ["-"],
	"dance": ["step; flicker", "flutter"],
	"danger": ["plight", "threat"],
	"dangerous": ["plightful", "threatening"],
	"data": ["rawput", "worth"],
	"database": ["-"],
	"dative (case)": ["-"],
	"daub": ["befoul", "sully; besmear"],
	"de-": ["un-"],
	"debate": ["moot"],
	"debatable": ["moot", "mootish", "mootsome", "mootworthy"],
	"debut": ["beginning", "birth", "dawn", "kickoff", "morning", "onset", "start", "threshold"],
	"decade": ["-"],
	"decapitate": ["behead"],
	"decay": ["foul", "rot; sink", "worsen; waste away"],
	"deceased": ["breathless", "fallen", "gone"],
	"deceit": ["misleading", "outwitting"],
	"deceive": ["swike", "mislead", "forlead", "fop", "outwit", "snooker"],
	"december": ["-"],
	"decent": ["good", "upstanding", "befitting"],
	"decentralization": ["-"],
	"deception": ["cheating", "crookery", "foxiness"],
	"decide": ["choose", "name", "settle (up)on", "fix", "set", "nail"],
	"decision": ["call"],
	"decisive": ["all-out", "out-and-out", "outright", "straight-out; hell-bent"],
	"declaration": ["boding"],
	"declare": ["bode", "swear", "set forth"],
	"declination": ["dwining", "dwindling"],
	"decline": ["dwindle", "wane", "fordwine", "slump", "lessen", "weaken", "flag", "sink"],
	"decoction": ["-"],
	"decorate": ["bedeck", "trim", "gild"],
	"decrease": ["shrink", "lower", "wane", "lessen"],
	"decree": ["behest"],
	"decrepit": ["timeworn"],
	"dedicate": ["earmark", "set by", "give up to"],
	"de facto": ["true", "in truth", "truly"],
	"defame": ["file", "shend", "besmirch", "befile"],
	"default": ["flaw"],
	"defeat": ["beat", "overcome", "overrun", "overwhelm", "overthrow"],
	"defecate": ["drite", "shit", "shite (obscene)"],
	"defect": ["blight", "blotch", "flaw", "pockmark"],
	"defend": ["bulwark", "ward", "keep", "shield; uphold"],
	"defenestrate": ["-"],
	"defense": ["shield", "ward"],
	"deficiency": ["dearth", "drought", "lack", "want"],
	"deficient": ["wanting", "missing", "lacking"],
	"deficit": ["shortfall", "dearth", "drought", "lack", "want"],
	"defile": ["befile", "besmite", "befoul", "sully"],
	"define": ["mark off", "lay out"],
	"deform": ["misshape", "unshape"],
	"deformed": ["misshapen", "shapeless"],
	"deformity": ["blight", "blotch", "flaw", "pockmark"],
	"defragment": ["cleave", "misbreak"],
	"defraud": ["swindle"],
	"defrost": ["thaw"],
	"defy": ["Flout (Dutch: fluiten)"],
	"degrade": ["bemean", "nether", "beneathen", "below"],
	"degree": ["cut", "inch", "notch", "peg", "step"],
	"deify": ["begod"],
	"deity": ["god"],
	"deism": ["-"],
	"de jure": ["lawfully", "by law"],
	"delay": ["stall", "forestall", "tarry"],
	"delete": ["-"],
	"deliberate": ["think about", "think over"],
	"delicious": ["dainty", "lush", "tasteful", "toothsome", "mouthwatering"],
	"delight": ["gladness", "lust"],
	"delightful": ["sweet", "darling", "pleasing, heavenly", "winsome"],
	"delirious": ["bewildered", "mind-wandering", "dwale"],
	"delude": ["mislead"],
	"deluge": ["flood", "rainstorm", "cloudburst", "overflowing", "drenching"],
	"delusion": ["misbelief"],
	"demeanour": ["jib"],
	"dementia": ["madness", "mindloss"],
	"demilitarized": ["unweaponed"],
	"demise": ["downfall"],
	"democracy": ["-"],
	"demodulation": ["-"],
	"demograph": ["-"],
	"demolish": ["tear down", "forspill"],
	"demolition": ["wipeout"],
	"demon": ["fiend", "hellfiend", "mare"],
	"demonstrate": ["show"],
	"dendrite": ["-"],
	"dendrochronology": ["-"],
	"denial": ["nay"],
	"denigrate": ["slighten", "belittle", "downcast"],
	"denote": ["betoken"],
	"denouement": ["unravelling"],
	"dense": ["thick"],
	"density": ["crowd: huddlethickness; slowness"],
	"dentist": ["-"],
	"denude": ["strip", "unclothe"],
	"deny": ["gainsay", "withsay", "naysay; withhold"],
	"deodorant": ["-"],
	"deoxyribonucleic acid": ["-"],
	"depart": ["book slang", "cut off", "dig out", "peel off", "run along", "step along", "walk out"],
	"departing": ["farewell", "leav(ing)", "walking out"],
	"department": ["-"],
	"depend": ["hang", "hinge on", "rest on", "trust in"],
	"dependence": ["-"],
	"dependent": ["-"],
	"depict": ["show"],
	"depreciate": ["cheapen", "lessen", "write off"],
	"depression": ["moodsink", "blues", "downer", "downheartedness", "glumness", "woefulness"],
	"deprivation": ["lack", "want; bereaving"],
	"deprive (of)": ["bereave", "strip"],
	"deracinate": ["uproot"],
	"deranged": ["crazed", "mad", "moonstruck", "unhinged"],
	"deregulation": ["-"],
	"derive": ["come from", "bring from", "spring from", "stem from", "draw off from"],
	"dermatology": ["-"],
	"dermis": ["hide", "rind", "hackle"],
	"desacralize": ["-"],
	"descend": ["fall", "slope", "bear"],
	"descendant": ["offspring"],
	"descent": ["downcoming", "downgoing"],
	"describe": ["draw", "outline", "set out"],
	"description": ["bewriting", "tale", "inwording", "drawing"],
	"desecrate": ["unhallow"],
	"desert": ["dustbowl", "wasteland (fits the scientific sense that Antarctica is a desert)"],
	"deserving": ["meedful", "worthy"],
	"design": ["lay out", "draft", "outline", "set out"],
	"designate": ["betoken", "mark", "earmark", "show", "call", "name"],
	"desinfectant": ["-"],
	"desire": ["crave", "wish", "lust", "yearn", "long", "hanker (for", "after)", "list"],
	"desirous": ["wishful", "longing"],
	"desolate": ["barren"],
	"despair": ["give way", "lose heart"],
	"desperate": ["hopeless", "forlorn"],
	"despondency": ["-"],
	"despise": ["behate", "loathe"],
	"despite": ["although", "notwithstanding"],
	"dessert": ["afters", "pudding", "sweet"],
	"destine": ["tee", "set up to happen"],
	"destiny": ["lot"],
	"destroy": ["fordo", "toshend", "do in", "pull down", "shatter", "tear down"],
	"destruction": ["-"],
	"detail": ["-"],
	"detective": ["sleuth", "bloodhound"],
	"deteriorate": ["worsen"],
	"determine": ["name", "settle; root out"],
	"detest": ["hate", "loathe"],
	"detrimental": ["harmful", "scatheful"],
	"devail": ["fiend"],
	"devalue": ["cheapen"],
	"develop": ["grow", "build", "unfold", "unwrap"],
	"developed, poorly": ["wan-thriven"],
	"development(al)": ["growth; upshot; ripening"],
	"devious": ["shrewd", "wily"],
	"devolve": ["-"],
	"devote": ["earmark", "set by"],
	"devour": ["fret", "gulp", "raven", "wolf"],
	"devout": ["down-the-line", "fast", "good", "steady", "true-blue"],
	"dexterity": ["deftness"],
	"dexterous": ["deft"],
	"diabolic": ["devilish"],
	"diacritic": ["mark"],
	"diagonal": ["leaning", "sloping", "slanted"],
	"dialect": ["-"],
	"diameter": ["-"],
	"diameter, inner": ["inner: bore; outer: girth"],
	"diamond": ["-"],
	"diaphanous": ["sheer"],
	"diarrhoea": ["skitter", "the runs"],
	"diary": ["daybook"],
	"diaspora": ["-"],
	"dictator": ["-"],
	"dictionary": ["wordbook"],
	"diet": ["-"],
	"difference": ["otherness", "unlikeness"],
	"different": ["other", "otherwise"],
	"differentiation (mathematics)": ["-"],
	"differently": ["otherwise"],
	"difficult": ["pick-and-shovel", "uphill"],
	"diffident": ["withdrawn"],
	"digit": ["finger", "toe"],
	"digital": ["scorely"],
	"dignity": ["worth", "selfworth"],
	"digress": ["-"],
	"dilapidated": ["threadbare", "timeworn"],
	"dilate": ["-"],
	"diligent": ["tied-up", "working"],
	"diminish": ["lessen", "lower", "wane", "dwindle", "dwine"],
	"diminutive": ["tiny", "impish", "small", "little"],
	"dimorphism": ["-"],
	"diningroom": ["-"],
	"dinner": ["mese (obsolete) fr. OE: (table", "that which is set on a table", "dish", "food", "meal)"],
	"dinosaur": ["early deer (cf. early man)", "erstdeer"],
	"diocese": ["-"],
	"diploma": ["-"],
	"direct": ["lead", "steer", "beward", "beright", "right"],
	"direction": ["wending", "warding"],
	"directory": ["-"],
	"dis-": ["mis-"],
	"disable": ["cripple", "lame; hamstring"],
	"disabled": ["lame", "halt"],
	"disadvantage": ["drawback", "downside"],
	"disadvantaged": ["hindered"],
	"disappear": ["flee", "melt", "sink"],
	"disappoint": ["let down"],
	"disarm": ["-"],
	"disarrange": ["rumple", "tousle"],
	"disaster": ["shipwreck", "fizzle", "washout"],
	"disastrous": ["baneful", "deadly", "dreadful", "black", "hapless", "harmful", "doomfull", "wrackful"],
	"discard": ["get rid of", "deep-six"],
	"discharge": ["unload"],
	"disciple": ["-"],
	"discipline": ["field;  rear up", "upbraid"],
	"disclaim": ["foreswear", "forego"],
	"disclaimer": ["forsaker", "yielder"],
	"disclose": ["bare", "show", "tell"],
	"disconcerting": ["offputting", "upsetting"],
	"discontinue": ["cut", "end"],
	"discount": ["-"],
	"discourse": ["talk", "speak", "mouth out"],
	"discover": ["find out", "get on", "hear", "learn", "wise up; dig out", "dredge up", "hit on", "nose out", "root out; bare", "unbosom"],
	"discovery": ["finding", "unearthing"],
	"discredit": ["smirch"],
	"discriminate": ["treat unfairly"],
	"discuss": ["talk about", "talk over", "talk through"],
	"disease": ["addle", "cothe", "sickness", "illness", "wanhaleness"],
	"disease, skin": ["tetter"],
	"disfigure": ["mar", "misshape"],
	"disgrace(ful)": ["shame", "shend"],
	"disgusting": ["loathely", "wlatsome", "foul", "pukening", "gruesome", "ghastly", "rank"],
	"dishevelled": ["cluttered", "tousled", "untidy"],
	"dishonourable": ["-"],
	"disinclined": ["loath"],
	"disinfect": ["-"],
	"disinfectant": ["-"],
	"disk": ["-"],
	"dislike": ["mislike"],
	"dismember": ["-"],
	"dismiss": ["snub", "slight", "sack", "fire"],
	"disobedience": ["-"],
	"disobedient": ["unhold", "unhearsome", "hardheaded", "stubborn", "wayward"],
	"disordered": ["unsided", "throughanother"],
	"disperse": ["scatter", "spread", "strew"],
	"displace": ["uproot"],
	"display": ["fair", "show; lay out", "show off", "strut"],
	"displease": ["-"],
	"disposable": ["throwaway"],
	"disposal": ["deep-six", "junking", "throwing away"],
	"disprove": ["belie"],
	"dispute": ["bicker", "brawl", "tiff", "wrangle"],
	"disqualify": ["unfit"],
	"disregard": ["overlook", "forheed"],
	"dissect": ["sithe", "cut up"],
	"dissemble": ["bluff", "sham", "put on; let on", "make out"],
	"dissolution": ["breakup", "split", "sundering"],
	"dissonance": ["infighting"],
	"distance": ["lead", "length", "spread", "stretch", "way; breadth", "field; unlikeness", "otherness"],
	"distant": ["away", "deep", "far", "far away far-flung", "far-off; cold-eyed", "dry", "offish", "standoff; other", "unalike", "unlike"],
	"distill": ["drop", "trickle"],
	"distinguish": ["make-out"],
	"distort": ["twist", "throw", "warp"],
	"distract": ["throw off"],
	"distraught": ["worked up"],
	"distress": ["bother", "upset", "worryn: woe", "harm's way"],
	"distribute": ["deal out", "hand out", "mete out"],
	"distribution": ["dealing; setup"],
	"district": ["neighbourhood"],
	"distrust": ["forthink", "mistrust"],
	"disturb": ["stir", "muddle"],
	"disturbance": ["stir; teasing", "harrying", "bothering"],
	"disturbing": ["creepy", "startling", "frightening", "unsettling"],
	"diurnal": ["daily"],
	"diverse": ["manifold", "sundry", "manikind"],
	"divert": ["-"],
	"divide": ["cleave", "shed", "split", "sunder", "share", "of-mete", "deal"],
	"divination": ["-"],
	"divine": ["godly", "holy"],
	"divinity": ["holiness"],
	"division": ["cleaving", "splitting", "tweeming", "shedding", "sundering"],
	"divorce": ["-"],
	"docile": ["meek; law-abiding"],
	"doctor, medical": ["healer"],
	"document": ["-"],
	"dogma": ["-"],
	"dolphin": ["-"],
	"domain": ["-"],
	"domestic": ["homeland (politics); household; tamed; born"],
	"domesticate": ["tame"],
	"dominate": ["-"],
	"donate": ["bestow", "give", "overgive", "yield"],
	"donation": ["gift", "yeld"],
	"doppelgänger": ["look-alike", "evil look-alike", "ill-boding look-alike"],
	"dormant": ["sleeping", "drowsing"],
	"dormitory": ["bedroom"],
	"dorsal": ["back"],
	"dosage": ["muchness"],
	"double": ["twin", "twofold", "twosome"],
	"doubt": ["qualm", "niggle", "wonder"],
	"douse": ["drench"],
	"dozen": ["tens"],
	"draconian": ["-"],
	"dragon": ["-"],
	"dragonfly": ["-"],
	"dramatic": ["hammy; showy", "splashy"],
	"dramatist": ["playwright"],
	"dress": ["clothe"],
	"dromadary": ["-"],
	"dual": ["twin", "twofold"],
	"dub": ["name", "call"],
	"dubious": ["dodgy", "shady", "shaky; loath; far-fetched", "unlikely; hinky", "mistrustful", "unsettled"],
	"duchy": ["earldom"],
	"due": ["owing"],
	"duel": ["ball game"],
	"duet": ["-"],
	"dugong": ["-"],
	"duke": ["earl"],
	"dunce": ["mouth breather"],
	"during": ["throughout"],
	"dutch(man)": ["-"],
	"duvet": ["bedspread", "eiderdown"],
	"dynamic": ["snell", "flush", "lusty", "red-blooded"],
	"dynasty": ["-"],
	"dysentery": ["-"],
	"dysfunctional": ["unworking", "badworking"],
	"dyslexic": ["-"],
	"eager": ["keen", "hungry", "yearnsome"],
	"eagle": ["ern (<OE earn)"],
	"earphone": ["headset", "earspeaker"],
	"ease": ["allay", "unburden", "unlade", "smoothen", "sooth", "quell"],
	"easy": ["smooth", "downhill", "hands-down", "light,"],
	"eau de toilette": ["-"],
	"ebony": ["blackwood"],
	"ebullition": ["outburst", "flare-up", "blowup", "frothing"],
	"eccentric": ["-"],
	"ecclesiastical": ["churchly", "church"],
	"echo": ["wannabe; shadow"],
	"eclipse": ["outshine"],
	"economics": ["trade", "dealing", "husbandry"],
	"economy": ["wealthdom; cutback"],
	"ecosystem": ["-"],
	"ecstatic": ["athrill", "upbeat", "beside oneself"],
	"ecumenopolis": ["-"],
	"edda": ["hoard", "book", "lore"],
	"edelweiss": ["silver star"],
	"edible": ["eating", "fit to eat"],
	"edifice": ["building"],
	"edify": ["-"],
	"edifying": ["teaching", "uplifting", "mindworthy"],
	"edit": ["-"],
	"edition": ["-"],
	"educate": ["teach"],
	"educated": ["learned", "well-read"],
	"education": ["learning", "teaching"],
	"educator": ["teacher"],
	"educe": ["outbring", "draw out"],
	"-ee": ["-end", "-ling", "-ed"],
	"effect": ["aftermath", "backwash", "outcome", "upshot; mark", "sway"],
	"effective": ["handy", "good"],
	"effeminate": ["womanlike", "womanly"],
	"effervescent": ["bubbling", "bubbly", "lively", "frothing"],
	"efficacious": ["handy"],
	"efficacy": ["handiness"],
	"effort": ["sweat", "while", "work"],
	"effrontery": ["shamelessness"],
	"e.g.": ["-"],
	"egalitarianism": ["-"],
	"ego": ["bighead", "pride"],
	"egocentric": ["selfish"],
	"egoism": ["selfishness"],
	"egotistic": ["bigheaded", "overweening", "proud", "stuck-ip"],
	"egregious": ["gross", "striking"],
	"egressive": ["outflowing"],
	"egypt": ["-"],
	"ejaculate": ["-"],
	"eject": ["cast out", "kick out", "throw out", "turf out"],
	"elaborate": ["thorough"],
	"elastic": ["rubbery", "springy", "stretchy", "whippy"],
	"elate": ["uplift", "stir up"],
	"elect": ["choose", "wale"],
	"election": ["choosing"],
	"electric": ["-"],
	"electrician": ["-"],
	"electricity": ["-"],
	"electro-mechanical": ["-"],
	"electron": ["-"],
	"elegant(ce)": ["trim(ness)", "handsome"],
	"element": ["-"],
	"elephant": ["tusker"],
	"elevate": ["uppen", "hoist", "lift", "lift up", "heave up", "raise"],
	"elevation": ["height", "loftiness", "heaving"],
	"elevator": ["lift", "lifter"],
	"elite": ["picky"],
	"ellipse": ["-"],
	"elocution": ["-"],
	"elongate": ["lengthen", "stretch"],
	"eloquent": ["silver-tongued", "well-spoken"],
	"email": ["-"],
	"emanate": ["cast", "give out", "send out"],
	"emasculate": ["unman"],
	"embarrass": ["faze"],
	"embody": ["inbody", "inflesh"],
	"embrace": ["fathom"],
	"embroidery": ["needlework", "needlecraft"],
	"embryo": ["-"],
	"emerge": ["come up", "crop up", "spring up"],
	"emigrant": ["-"],
	"eminence": ["hill", "knoll", "link", "mound", "barrow", "hurst", "down", "wold"],
	"emissary": ["-"],
	"emit": ["forthsend", "give out", "send out", "shine", "give off", "outsend"],
	"emotion": ["warmth", "white heat", "feeling"],
	"emotional": ["heartfelt", "overwrought", "worked up"],
	"empathy": ["fellow-feel", "samefeel"],
	"emperor": ["king of kings"],
	"emphasize": ["underscore", "highlight"],
	"empire": ["-"],
	"empiricism": ["-"],
	"employ": ["hire"],
	"employee": ["underling", "hireling", "worker", "staff"],
	"employer": ["hirer"],
	"employment": ["-"],
	"empress": ["-"],
	"emulate": ["ape", "underfollow"],
	"emulsion": ["forblending"],
	"en-": ["um/em-, in-, on-, be-"],
	"enable": ["let"],
	"enact": ["-"],
	"en masse": ["in bulk"],
	"en route": ["on the way"],
	"enchant": ["spellbind; wile, bewitch"],
	"enchantment": ["bliss; spell", "witchcraft"],
	"enchantress": ["witch"],
	"encircle": ["begird", "beclip", "beset", "gird"],
	"enclose": ["bound", "wrap", "pound", "pen", "hedge", "hem in", "wall in"],
	"enclosure": ["haw", "pen", "paddock", "field", "yard"],
	"encompass": ["hold", "deal with", "take in; ring", "girdle"],
	"encounter": ["meet", "live through", "undergo"],
	"encourage": ["hearten on", "mood on", "foster", "upprop", "help", "egg on", "goad", "spur", "will on"],
	"encroachment": ["inroads"],
	"encryption": ["-"],
	"encumber": ["block", "burden", "hinder"],
	"encumbrance": ["burden", "hindering"],
	"encyclopedia": ["-"],
	"encyclopedic": ["all-in", "in-depth", "thorough"],
	"endeavour": ["-"],
	"endoplasmic reticulum": ["-"],
	"endow": ["gift; underwrite", "give"],
	"endowment": ["knack"],
	"endure": ["hold out", "thole", "dree", "abear", "withstand", "undergo", "bear", "keep on", "put up with", "hold through", "stand through", "bear through"],
	"edurance": ["strength", "doggedness; lastingness"],
	"enemy": ["foe", "the other side"],
	"energy": ["beans", "drive\nfeel energetic: feel one's oats"],
	"enervate": ["unman", "weaken", "unsettle", "faze"],
	"engaged": ["working", "busy", "tied up; betrothed", "pledged"],
	"engine": ["means", "gearwork"],
	"engineer": ["wright"],
	"enigma": ["riddle", "brainteaser"],
	"enjoyment": ["fun", "gladness", "happiness", "use"],
	"enlarge": ["swell", "greaten"],
	"enmity": ["hatred", "bitterness", "bab blood", "ill will"],
	"ennui": ["boredom", "tiredness", "listlessness"],
	"enrich": ["make wealthy"],
	"enrichment": ["-"],
	"ensnare": ["-"],
	"ensue": ["follow", "come after"],
	"ensure": ["see to it"],
	"enter": ["go into", "come into", "begin", "in faredata entry: key in", "input"],
	"enterprise": ["business", "undertaking; readiness", "get-up-and-go"],
	"enthusiasm": ["white heat; keenness", "warmth"],
	"entice": ["draw to", "spur", "goad", "wheedle", "sweet talk"],
	"entire": ["whole", "full; sound", "unharmed", "without a scratch"],
	"entirely": ["fully", "thoroughly", "outright", "wholly", "altogether"],
	"entirety": ["whole", "fullness"],
	"entrance": ["key", "doorway", "in faringvb: bewitch", "spellbind"],
	"entrepreneur": ["business(wo)man"],
	"entry": ["threshold", "way in", "gateway, infaring"],
	"enumerate": ["-"],
	"envelop": ["shroud", "wrap", "hide", "swaddle"],
	"envelope": ["-"],
	"envious": ["-"],
	"environment": ["setting"],
	"envision": ["foretell", "foresee"],
	"envy": ["-"],
	"enzyme": ["-"],
	"ephemeral": ["fleeting", "short-lived"],
	"epic": ["adj:lofty", "high-flown"],
	"epicentrum": ["-"],
	"epilepsy": ["falling sickness"],
	"epilogue": ["afterword"],
	"epiphany": ["-"],
	"epistemology": ["-"],
	"epithet": ["byname", "handle"],
	"equal": ["match"],
	"equality": ["fairness; sameness", "likeness", "evenness"],
	"equanimity": ["steadiness"],
	"equate": ["match", "even up; offset", "liken"],
	"equation": ["match", "likeness"],
	"equator": ["-"],
	"equidistant": ["midway", "evenfar"],
	"equines": ["steeds"],
	"equinox": ["-"],
	"equip": ["graith", "(be)gear", "fit (out)", "gear up", "outfit", "rig up", "beweapon"],
	"equipment": ["gear", "graith"],
	"equitable": ["evenhanded"],
	"equivalent": ["fellow", "like", "match"],
	"era": ["timespan", "time", "world"],
	"eradicate": ["wipe out"],
	"erase": ["rub out", "root out", "wipe out"],
	"eraser": ["rubber"],
	"erect": ["uprightrear", "set up", "lift up"],
	"erection": ["-"],
	"ergo": ["therefore", "thusforthy (att'd < OE for + thy", "the instrumental form of the article)"],
	"erinacine": ["hedgehog"],
	"eritrocyte": ["-"],
	"erotic": ["lovely", "lewd", "kinky"],
	"err": ["wander"],
	"error": ["dwale", "wrong", "slip", "slip-up", "mistake"],
	"erupt": ["flare up", "blow up", "break out", "burst out"],
	"eruption": ["outburst", "outbreak"],
	"escape": ["vb: break out", "flee", "run off; shun", "weasel out of\nn: breakout", "flight", "getaway", "slip; dodging", "ducking", "shunning"],
	"especially": ["namely", "moreso", "above all"],
	"essay": ["-"],
	"essence": ["nub", "heart", "kernel", "pith", "being", "whatness", "broth"],
	"essential": ["key", "foremost"],
	"essentially": ["mostly", "all but", "all-in-all", "as good as", "as much as", "mainly", "at heart", "in itself", "on the whole", "uterrly", "well-nigh"],
	"establish": ["build", "begin", "settle", "install", "set up"],
	"established": ["longstanding"],
	"establishment": ["body", "steadyhood"],
	"esteem": ["-"],
	"estimate": ["guess; reckoning"],
	"estuary": ["mouth", "firth", "inlay"],
	"esurient": ["hungry", "greedy"],
	"et al.(ia)": ["and others"],
	"et cetera": ["and so on", "and so forth", "and the like", "and others", "and what-not"],
	"eternal": ["ay", "everlasting"],
	"ether": ["-"],
	"ethic": ["straight", "upright"],
	"ethnic group": ["folkstock"],
	"ethnic minority": ["-"],
	"etymology": ["wordlore"],
	"eu-": ["-"],
	"eukaryote": ["-"],
	"euphemism": ["-"],
	"euphoria": ["good-feeling"],
	"europe": ["-"],
	"euthanasia": ["-"],
	"evacuate": ["empty"],
	"evade": ["dodge", "sidestep"],
	"evaluate": ["-"],
	"evaluation": ["reckoning"],
	"evangelism": ["holy errand"],
	"event": ["happening", "hap"],
	"eventually": ["in time", "in the end"],
	"evidence": ["word", "witness", "truth of"],
	"evince": ["bespeak", "give away"],
	"evocative": ["mindful"],
	"evoke": ["awake, call up", "bring to mind", "stir up"],
	"evolution": ["unfolding"],
	"evolve": ["grow", "unfold"],
	"ex–": ["ere-", "fore-", "or-"],
	"exaggerate": ["overplay", "overdo"],
	"exaggeration": ["-"],
	"exalt": ["uplift", "heighten"],
	"examine": ["go over", "con"],
	"example": ["-"],
	"example (for)": ["thus"],
	"exaptation": ["kludging"],
	"exasperate": ["imbitter"],
	"excavate": ["delve", "unearth", "hollow out", "dig up"],
	"excavation": ["delving", "unearthing", "digging up"],
	"exceed": ["outreach", "outrun", "overrun", "overstep; outdo", "outshine", "overtop"],
	"excel": ["outdo", "outshine", "overtop"],
	"excellent": ["gilt-edged", "swell", "topping", "wonderful"],
	"except": ["but", "other than"],
	"exception": ["standout", "outstander", "outtake"],
	"exceptional": ["outstanding"],
	"excessive": ["overmuch", "steep", "sharp", "rank"],
	"excessively": ["overly"],
	"exchange": ["swap", "wrixle"],
	"excise": ["snithe", "cut out"],
	"excite": ["upedge", "thrill", "key up"],
	"exclude": ["outshut"],
	"excommunication": ["-"],
	"excoriate": ["chide", "flay"],
	"excrement": ["-"],
	"excursion": ["outing"],
	"excuse": ["forgive"],
	"ex-directory": ["unlisted"],
	"execute": ["kill", "quell", "slay", "put to death"],
	"executioner": ["halseman"],
	"exercise": ["work out"],
	"exert": ["put forth"],
	"exhale": ["breathe out"],
	"exhaust": ["overwork", "wear out", "forspend", "tire"],
	"exhausted": ["tired", "weary", "worn out", "drained", "overtired", "work-wearied", "fordone", "windless"],
	"exhaustive": ["thoroughgoing"],
	"exhibit": ["show"],
	"exhume": ["dig up", "unearth"],
	"exile": ["outcast", "outlaw", "castaway"],
	"exist": ["be", "live"],
	"existence": ["thingness"],
	"existent": ["living"],
	"exit": ["leave", "move out of", "go out"],
	"exotic": ["outlandish"],
	"expand": ["broaden", "greaten", "spread (out)", "unfold", "widen"],
	"expanse": ["spread"],
	"expect": ["await", "hope for", "watch for"],
	"expectation": ["-"],
	"expectorate": ["spit"],
	"expedient": ["makeshift", "stopgap"],
	"expedite": ["hurry", "quicken"],
	"expedition": ["outing"],
	"expeditious": ["fast", "quick", "swift", "speedy"],
	"expel": ["drive out", "throw out"],
	"expenditure": ["outgoing", "dole out"],
	"expenses": ["overheads", "dole outs"],
	"expensive": ["dear", "dearbought", "unthrifty"],
	"experience": ["bad: ordeal"],
	"experienced": ["wise"],
	"experiment": ["fand"],
	"expert": ["dab"],
	"expertise": ["know-how", "skill"],
	"expiate": ["atone"],
	"expiration date": ["sell-by"],
	"explain": ["spell out", "unriddle,"],
	"explanation": ["atelling"],
	"explicit": ["outfold"],
	"explode": ["burst", "toburst", "blow up"],
	"exploit": ["overwork"],
	"explore": ["delve", "look into"],
	"explorer": ["pathfinder", "foregoer", "forerunner", "groundbreaker"],
	"explosive": ["-"],
	"exponent(iate)": ["-"],
	"export": ["outsend"],
	"expose": ["nail", "show up; bare: lay out"],
	"exposé": ["-"],
	"exposition": ["-"],
	"expound": ["flesh out"],
	"express": ["say", "word"],
	"expression": ["-"],
	"expulsion": ["outcast", "driving out", "throwing out", "banning"],
	"extant": ["lasting", "still-living", "still being", "still going", "keeping on"],
	"extend": ["lengthen", "outstretch"],
	"extend for": ["span"],
	"extension": ["furthering"],
	"extensive": ["broad", "deep", "far-reaching", "fulsome", "far-flung", "sweeping", "wide", "widespread"],
	"extensively": ["fulsomely", "wholesale"],
	"extent": ["length", "breadth", "reach"],
	"exterior": ["adj: outer; n: shell", "outside"],
	"exterminate": ["wipe out", "kill all"],
	"external": ["outward", "outer"],
	"extinct": ["dead", "gone", "lost"],
	"extinction": ["death", "doom", "knell", "wiping out"],
	"extinguish": ["douse", "dout", "put out"],
	"extra": ["spare", "more", "more other", "more else", "othermore"],
	"extra time": ["overtime"],
	"extract": ["take out", "draw out", "pull out", "pluck", "unearth", "harvest", "worm out"],
	"extraordinary": ["amazing", "geason", "outstanding"],
	"extrapolate": ["draw out"],
	"extraterrestrial": ["-"],
	"extravagance": ["wanthrift"],
	"extreme": ["utmost"],
	"extrinsic": ["outborn", "outly"],
	"extrovert": ["backslapper", "glad-hander"],
	"extroverted": ["outgoing"],
	"exuberant": ["outgoing", "sparkling"],
	"exultation": ["glee"],
	"exuviate": ["shed", "cast off", "slough"],
	"fable": ["tale"],
	"fabric": ["argmt: shell", "framework"],
	"fabricate": ["bring into being", "build", "make", "put together", "run up", "set up", "shape; think up", "write; lie", "make up"],
	"fabulous": ["groovy", "amazing", "sterling", "top-shelf", "wonderful"],
	"facade": ["foreside", "forehead; outer-skin", "put-on", "show"],
	"face": ["shell", "cast", "side", "foreside"],
	"facet": ["side", "bearing"],
	"facetious": ["biting", "tung-in-cheek", "sharp-witted", "salty", "smart", "witty"],
	"facilitate": ["easen"],
	"fact": ["truth"],
	"fact, in": ["indeed", "in truth"],
	"factor": ["building block"],
	"factory": ["-"],
	"faculty": ["-"],
	"fad": ["hit", "brainstorm"],
	"fade": ["dwindle", "wane"],
	"faeces": ["shit", "shite", "stool", "dirt", "dung"],
	"faggot": ["-"],
	"faience": ["-"],
	"fail": ["fizzle", "flop", "flunk"],
	"failure": ["oversight", "blunder", "washout"],
	"faint": ["swoon", "flake out", "black out"],
	"fair": ["hoppings"],
	"fairy": ["gnome", "elf", "sprite"],
	"fairytale": ["-"],
	"fait accompli": ["done deed", "done deal", "fulfilled", "carried out", "(thing) over and done"],
	"faith": ["belief", "troth"],
	"faithful": ["down-the-line", "fast", "good", "steadfast", "steady", "true-blue"],
	"faith, to have": ["trust", "lief"],
	"falcon": ["-"],
	"fallible": ["unsound", "wanting"],
	"false": ["lease", "off", "unsound", "untrue, wrong; sham; crooked; flicke; misdealing", "misleading"],
	"falsely accuse": ["-"],
	"fame": ["name", "wellstanding", "stardom", "limelight", "greatness"],
	"familiar": ["friendly", "inward", "near", "thick", "tight; abreast; household"],
	"family": ["kin", "kindred", "kinfolk", "ilk", "sib"],
	"famine": ["dearth", "hunger"],
	"famished": ["hungry", "starving", "hunger-bitten"],
	"famous": ["well-known", "couth"],
	"fan": ["lover", "nut"],
	"fanatic": ["hardnose"],
	"fanaticism": ["-"],
	"fancy": ["showy"],
	"fantastic": ["wonderful"],
	"fantasy": ["daydream"],
	"farce": ["take-off", "dry-wit"],
	"farrago": ["mash", "mashing", "all-kinds-of"],
	"fasces": ["bundle"],
	"fascia": ["strip. band"],
	"fascism": ["-"],
	"fascinate": ["bewitch", "spellbind", "draw", "fire", "inthrall", "eyebite (cited by Richard Chenevix Trench)"],
	"fascinated": ["inthralled", "bewitched", "spellbound"],
	"fashion": ["trend", "way"],
	"fashionable": ["cool slang", "trendy; crowd-pleasing"],
	"fastidious": ["choosy", "picky"],
	"fatal": ["deadly"],
	"fatamorgana": ["-"],
	"fate": ["doom\nweird meaning was skewed by Shakespear's Weird Sisters", "revived after dying as a word meaning \"destiny\""],
	"fatigue": ["frazzle", "tiredness", "weariness"],
	"fatuous": ["brainless", "half-witted", "thickheaded"],
	"fault": ["shortcoming", "want", "weakness; mistake", "oversight", "trip; pockmark"],
	"fauna": ["wildlife"],
	"faux-pas": ["mistake", "misstep", "slipup"],
	"favor": ["kindness", "blessing; one-sideness", "shine"],
	"favourable": ["bright", "golden", "heartening", "hopeful"],
	"favourite": ["beloved", "darling", "fair-haired", "fond", "loved", "sweet", "white-headed; choses", "handpicked; crowd-pleasing"],
	"feasible": ["likely", "doingly", "seemingly", "timely", "welltimed", "wieldly", "worthwhile"],
	"feast": ["feed", "spread; wealth"],
	"feast day (religious)": ["-"],
	"feature": ["shape", "look", "make", "mark"],
	"february": ["-"],
	"feckless": ["bootless", "hamstrung"],
	"federal": ["-"],
	"federation": ["-"],
	"feeble": ["weak"],
	"fee simple": ["freehold"],
	"feign": ["sham", "put on"],
	"feint": ["blind", "hoodwinking", "put-on", "red herring"],
	"felicitate": ["hug"],
	"feline": ["catlike"],
	"female": ["she-kindpref: she-"],
	"feminism": ["-"],
	"femto (-byte)": ["fifteen-"],
	"femur": ["thigh bone"],
	"fence": ["wall", "hedge", "sundering"],
	"fend (off)": ["ward off", "hold off", "keep off"],
	"fender": ["shield", "windshield", "hob; midriff"],
	"fennec": ["-"],
	"feodalism": ["-"],
	"feral": ["wild", "untamed", "running mad", "tameless"],
	"feric": ["ironlike"],
	"feriferous": ["-"],
	"ferment": ["barm"],
	"ferocious": ["fiendish", "mad", "grim", "warlike", "wild", "frothing"],
	"ferret": ["hound", "harry", "seek out"],
	"fertile": ["fallow", "yielding", "loamy"],
	"fervent": ["glowing", "warm-blooded"],
	"fester": ["burn", "rot", "weep", "blain"],
	"festival": ["holiday"],
	"festive": ["festlike", "cheery", "grooving", "upbeat", "hearty", "merry", "gleeful"],
	"festoon": ["deck", "trim", "doll up"],
	"fetid": ["smelly", "stenchy", "rank"],
	"fetish": ["-"],
	"feudal": ["toll-run", "feeholding", "lendship"],
	"feud": ["foe-fighting", "bad blood", "ill-feeling"],
	"fever": ["ail", "sickness"],
	"fiancee": ["betrothed", "husband-to-be", "wife-to-be"],
	"fiasco": ["out-and out breakdown", "full-blight", "misdeal"],
	"fibre": ["bristle", "thread; backbone", "grit", "guts", "pluck"],
	"fibula": ["calf bone", "bow pin"],
	"fiction": ["-"],
	"fidelity": ["faithfullness", "troth"],
	"figment": ["daydream"],
	"figure out": ["riddle", "work out"],
	"filings": ["-"],
	"filter": ["sieve", "sift", "winnow", "trawl"],
	"final": ["last, last", "rearmost", "hindmost; flat", "frozen", "hard", "set", "settled"],
	"finale": ["ending", "showdown"],
	"finally": ["at last", "endily"],
	"finance": ["thrift"],
	"fine": ["dusty", "finespun", "hairline; neat", "straight", "spot-on; four-star; keen", "sharp; tasteful;\nadv: all right", "good", "middlingly"],
	"finish": ["ending"],
	"firm": ["fast", "bound", "unyielding", "stalwart"],
	"firmament": ["blue", "heaven", "high", "welkin"],
	"fiscal": ["-"],
	"fissure": ["crack", "split", "cleft"],
	"fix": ["fasten(ing)"],
	"fixed": ["given", "fast", "fastened"],
	"flaccid": ["limp"],
	"flagellate": ["lash", "leather", "rawhide"],
	"flagellum": ["whip"],
	"flame": ["blaze", "fire", "fire-shoot", "lowe"],
	"flamingo": ["-"],
	"flange": ["rim"],
	"flatulence": ["wind"],
	"flavour": ["tang", "smack", "smatch"],
	"flax": ["-"],
	"flensburg": ["-"],
	"flexible": ["lithe", "bendy", "limber", "bendfull", "bendsome", "bowsome"],
	"flexibility": ["limberness"],
	"flinch": ["draw back", "wince", "hang back", "reel", "shy", "blench"],
	"flirt": ["eye-tease", "eye play"],
	"floccinaucinihilipilificate": ["deem worthless"],
	"flora": ["green"],
	"florence": ["-"],
	"flour": ["meal"],
	"flourish": ["bloom", "blossom"],
	"flower": ["bloom", "blossom"],
	"fluctuate": ["swing"],
	"fluent": ["flowing", "smoothspoken"],
	"fluorescent": ["leaming"],
	"flux": ["flowing"],
	"focus": ["eye; lodestar"],
	"folly": ["dullness", "unwisdom", "witlessness", "boneheadedness"],
	"fondant": ["frosting", "icing"],
	"fondue": ["-"],
	"fool": ["dotty", "half-baked; sucker; halfwit", "bonehead", "meathead"],
	"fool's gold": ["mullock"],
	"foolhardy": ["brash", "bold", "headlong", "heedless", "hot-headed", "daring", "daresome", "reckless"],
	"footprint": ["footmark"],
	"force": ["strength", "dint", "might", "thring; thrust", "shove", "pull"],
	"forceps": ["tongs"],
	"forcible": ["strong-arm"],
	"foreign": ["new"],
	"foreign country": ["farland", "faraway land", "outland"],
	"foreigner": ["outlander", "outsider"],
	"forest": ["wald", "weald", "wold", "wood(land)", "holt", "frith", "timberland"],
	"forficula": ["earwig"],
	"forge": ["get along; carve out", "grind out", "thrash out", "work up; beat", "draw", "pound\nn: smithy", "hammermill"],
	"form": ["shape", "make", "begin", "build"],
	"formal": ["starchy", "stiff-necked", "stilted; lofty", "high-flown"],
	"formation": ["setting up", "shaping", "building", "making"],
	"formidable": ["stalwart"],
	"formula": ["1. draft"],
	"fornication": ["-"],
	"fort(ress)": ["keep", "stronghold", "fastness"],
	"fortification": ["stronghold"],
	"fortitude": ["backbone", "grit", "grittiness", "pluck"],
	"fortune": ["hap", "luck"],
	"forum": ["moot", "soapbox"],
	"fossil": ["forbone"],
	"fotanelle": ["mould"],
	"found": ["ground", "build", "begin", "settle"],
	"foundation": ["groundwork", "groundstone", "staddle"],
	"fountain": ["cradle", "root", "seedbed", "wellspringhead: headspring"],
	"foyer": ["waiting room"],
	"fraction": ["share", "lot", "deal", "breaking"],
	"fracture": ["break"],
	"fragile": ["brittle", "weak"],
	"fragment": ["thrum", "scrap"],
	"fragmentation": ["-"],
	"framboise": ["raspberry"],
	"francophone": ["French-speaking"],
	"fraternal": ["brotherly"],
	"fraternity": ["brotherhood"],
	"fraud": ["swindle"],
	"fray": ["frazzle"],
	"frenzy": ["madness"],
	"frequency": ["oftenness"],
	"frequent": ["hang at; adj: everyday", "household"],
	"frequently": ["often", "over and over"],
	"fresco": ["-"],
	"fresh": ["frim", "new"],
	"fricative": ["rubclank"],
	"friction": ["rubbing"],
	"fringe": ["edge", "outskirt"],
	"front": ["fore", "afore", "foreside"],
	"frontier": ["region: backlands", "backwater", "backwoods", "bush", "hinterland", "outback"],
	"fructose": ["-"],
	"fruit": ["seed", "spawn; output", "work", "yield"],
	"fruitful": ["lush"],
	"fruitfulness": ["-"],
	"frustrate": ["thwart"],
	"fucacae": ["seaweed"],
	"fuel": ["-"],
	"fugitive": ["runaway", "lamster"],
	"fulcrum": ["shaft", "heart", "swivel"],
	"fulfilment": ["fulfilling"],
	"fuliginous": ["sooty", "grimy", "blackish", "darkish", "dusty", "emberlike", "cinderly", "ashlike", "coomy"],
	"fulminate": ["huff"],
	"function": ["work"],
	"functional": ["working"],
	"fund": ["nest egg; wherewithal; stock"],
	"fundament": ["groundwork"],
	"fundamental": ["underlying", "innermost", "key"],
	"funeral": ["-"],
	"fungus": ["-"],
	"furnace": ["oven"],
	"furniture": ["fittings", "roomware", "houseware"],
	"fuse": ["meld", "cleave"],
	"futile": ["worthless"],
	"future": ["forthcoming", "upcoming unborn"],
	"gabbling": ["babbling"],
	"galactose": ["-"],
	"galaxy": ["spiral: starswirl; Milky Way"],
	"galleon": ["-"],
	"gallery": ["hallway"],
	"galley": ["-"],
	"garage": ["-"],
	"garden": ["grove", "(green)yard"],
	"gardener": ["green thumb", "handyman"],
	"garland": ["wreath", "helm"],
	"garments": ["clothes", "cladding", "wearing", "clothing"],
	"garrulous": ["long-winded", "jabber-jawed", "talksome", "wordy"],
	"gas": ["wind"],
	"gay": ["blithe", "blithesome", "blissful", "blissome", "merry", "happy"],
	"gazebo": ["summerhouse"],
	"gecko": ["-"],
	"gem": ["stone"],
	"gene": ["-"],
	"genealogy": ["birth", "blood line", "breeding", "stock"],
	"general": ["broad", "overall"],
	"generality": ["breadth"],
	"generally": ["broadly", "mainly", "mostly", "on the whole; widely"],
	"generate": ["make", "give rise to; beget", "breed"],
	"generation": ["time", "days", "lifetime", "span; wave", "crop", "batch; breeding", "begetting"],
	"generic": ["wide", "sweeping", "broad-brush", "overall"],
	"generous": ["kind", "openhanded"],
	"generously": ["kindly", "handsomely", "freely"],
	"genesis": ["beginning", "start"],
	"genetics": ["-"],
	"genial": ["mellow", "nice", "sweet; hail-fellow-well-met", "hearty, matey", "neighbourly", "warm-hearted; mild", "soft"],
	"genie": ["-"],
	"genitive case": ["-"],
	"genius": ["brain; head", "knack; leaning; clay", "self"],
	"genocide": ["-"],
	"genome": ["bequest", "growthplot"],
	"gentle": ["bland", "light", "mellow", "mild", "soft", "soothing"],
	"gentleman": ["lord; fellow"],
	"genuflect": ["kneel", "kneebow", "kneebend"],
	"genuine": ["sound", "true", "sterling; heartfelt", "earnest; straightforward", "upfront"],
	"geography": ["landscape"],
	"geology": ["-"],
	"geometry": ["-"],
	"geostationary": ["-"],
	"geothermal": ["-"],
	"geranium": ["cranesbill"],
	"gerbil": ["-"],
	"geriatric": ["long-lived", "over-the-hill"],
	"germ": ["bug(colloqial)"],
	"germanic": ["-"],
	"germany": ["-"],
	"germinate": ["bud", "sprout", "shoot", "blossom", "burst forth", "grow up", "put forth", "take root", "spring up"],
	"gesture": ["beckon", "flag", "wave"],
	"gesundheit": ["bless you"],
	"giant": ["-"],
	"gingiva": ["gum", "teeth('s) flesh"],
	"giraffe": ["-"],
	"glacial": ["icy", "biting", "cold", "freezing", "raw", "chill", "frosty"],
	"glacier": ["-"],
	"global": ["worldwide", "broad-brush", "overall"],
	"globalisation": ["-"],
	"globe": ["world", "earth"],
	"glorious": ["bright", "shining; wonderful", "heavenly"],
	"glory": ["-"],
	"glucose": ["-"],
	"glue": ["stick", "fix", "seal"],
	"gluttony": ["greed"],
	"glycerine": ["-"],
	"glycogeen": ["-"],
	"goddess": ["-"],
	"godparent": ["godfather", "godmother"],
	"goitre": ["-"],
	"gorilla": ["-"],
	"gossamer": ["thin", "flimsy"],
	"govern": ["lead", "hold sway over"],
	"governor": ["head", "leader"],
	"government": ["oversight", "stewardship"],
	"grace": ["-"],
	"gracious": ["sweet", "well-bread", "mannerly"],
	"gradual": ["steady", "even", "unhurried"],
	"gradually": ["step by step", "little by little", "bit by bit", "steply", "stepwise"],
	"grallatores": ["waders"],
	"grammar": ["-"],
	"grand": ["great", "lofty", "lordly"],
	"grandfather": ["-"],
	"grandiloquent": ["-"],
	"grandiose": ["proud; high-handed", "lah-di-dah"],
	"grandmother": ["-"],
	"granite": ["-"],
	"grant": ["give", "bestow"],
	"grape": ["-"],
	"graphic": ["-"],
	"graphite": ["-"],
	"grateful": ["thankful"],
	"gratitude": ["thank", "thankfulness"],
	"gratuitous": ["free; needless", "groundless", "uncalled-for"],
	"gravity": ["earnestness", "heftiness"],
	"grenade": ["-"],
	"gridiron": ["-"],
	"grief": ["ruth", "heartache", "sorrow"],
	"grieve": ["rue", "weep", "mourn", "sorrow"],
	"grocer": ["greenmonger"],
	"group": ["thede", "fay", "bunch", "crowd", "team", "gang", "cluster", "crop", "flock", "set", "shoal"],
	"grume": ["clot"],
	"guano": ["dung"],
	"guaranty": ["ice; n: bond", "deal"],
	"guardian": ["keeper", "warden", "warder"],
	"guide": ["show the way", "lead(er)"],
	"guerrilla": ["-"],
	"guinea pig": ["-"],
	"gulf": ["bight", "cove"],
	"gullet": ["throat", "craw", "maw"],
	"gully": ["draw (shallow)"],
	"gyroscope": ["-"],
	"haberdasher": ["-"],
	"habit": ["trend", "wont", "wone", "thew"],
	"háček": ["-"],
	"hadron": ["-"],
	"hagiography": ["-"],
	"hallucination": ["-"],
	"halophile": ["salt-loving"],
	"hamlet": ["hem", "thorpe"],
	"hand": ["hond"],
	"harass": ["harry", "bother", "stalk", "taw"],
	"harmony": ["bond", "overlay", "like-mindedness", "togetherness"],
	"harness": ["inspan"],
	"hashish": ["-"],
	"haste": ["speed"],
	"haunt": ["hound", "stalk", "ghost"],
	"headphone": ["headset", "earspeaker"],
	"hectare": ["-"],
	"heir": ["-"],
	"helicopter": ["eggbeater", "whirlybird"],
	"helix": ["writhe", "twist"],
	"helmet": ["helm"],
	"hen coop": ["henhouse"],
	"hepatitis": ["liver-sickness"],
	"herb": ["grass", "shrub", "wort"],
	"herbicide": ["weedkiller"],
	"herbivore": ["-"],
	"heresy": ["-"],
	"heritage": ["bequest", "birthright"],
	"hermaphrodite": ["-"],
	"hermit": ["loner"],
	"hero(in)": ["white hat"],
	"herpes": ["tetter"],
	"hesitate": ["dither"],
	"heterogeneous": ["mixed"],
	"heterosexual": ["straight"],
	"hiatus": ["gap", "break"],
	"hibernate": ["winter"],
	"hibiscus": ["rosemellow"],
	"hick": ["redneck"],
	"hicksville": ["backtown"],
	"hideous": ["awful", "dreadful", "evil", "foul", "fulsome", "loathsomeunfair sickening", "ugly"],
	"hippopotamus": ["-"],
	"histology": ["-"],
	"history": ["yesteryear", "yore"],
	"hodiernal": ["-"],
	"holocaust": ["bloodbath", "death", "slaughter"],
	"hologram": ["-"],
	"homicide": ["murder", "manslaughter"],
	"holy innocents day": ["Childermas"],
	"homily": ["chestnut"],
	"homogenous": ["samewise", "kindred"],
	"homosexuality": ["manlove"],
	"honest": ["truthful", "upright", "forthright"],
	"honesty": ["truthfulness", "forthrightness"],
	"honour": ["-"],
	"honourable": ["upright", "upstanding"],
	"hooligan": ["rough neck"],
	"horde": ["throng"],
	"horizon": ["skyline"],
	"horizontal": ["-"],
	"hormone": ["-"],
	"horology": ["-"],
	"horrible": ["awful", "dreadful", "fearful", "frightful", "ghastly", "grim", "grisly", "gruesome", "bloodcurdling", "hair-raising", "scary"],
	"horrify": ["scare"],
	"horror": ["awe", "dread", "fear", "fright"],
	"horticulture": ["-"],
	"hospice": ["inn"],
	"hospital": ["-"],
	"hospitable": ["-"],
	"hostage": ["-"],
	"hostile": ["foesome", "unfriendly"],
	"hostility": ["foehood", "unfriendliness"],
	"hotel": ["guesthouse", "inn"],
	"hour": ["-"],
	"huge": ["great", "big", "wide"],
	"hullabaloo": ["uproar"],
	"human": ["earthborn"],
	"humanitarian": ["do-good"],
	"humanity": ["folk", "world; kindheartedness", "ruth", "warmheartedness"],
	"humble": ["down-to-earth", "meek", "lowly"],
	"humerus": ["arm-bone"],
	"humid": ["dank", "damp", "sweltry", "sticky"],
	"humiliate": ["cheapen", "foul", "lower", "shame", "sink", "take down"],
	"humiliating": ["toe-curling", "cringe-making"],
	"humility": ["down-to-earthness", "lowiness", "meekness"],
	"humourous": ["funny", "witty", "side-splitting"],
	"hurricane": ["gale", "whirlwind"],
	"hurt": ["harm", "scathe"],
	"husband": ["-"],
	"hushed": ["still", "lown (dialect)"],
	"hyacinth": ["-"],
	"hybrid": ["-"],
	"hydraulics": ["waterworks"],
	"hydrogen": ["-"],
	"hydrotherapy": ["-"],
	"hyphen": ["dash"],
	"hypnosis": ["bedazzling", "spellbinding"],
	"hypnotise": ["bedazzle", "grip", "spellbind"],
	"hypnotic": ["bedazzling", "gripping", "spellbinding\nsleep soothing", "sleepy"],
	"hypocritical": ["Pecksniffian"],
	"hypocrisy": ["-"],
	"ibex": ["-"],
	// "-ic": ["-ish", "-some", "-ly"],
	"icthyology": ["-"],
	"idea": ["mind's eye; dream", "mark; understanding", "belief", "thought"],
	"identical": ["alike", "selfsame", "same; even"],
	"identify": ["finger"],
	"identity": ["sameness; selfhood"],
	"ideology": ["belief"],
	"idiosyncrasy": ["quirk"],
	"idiot": ["blockhead", "clot", "dumbbell", "half-wit", "fathead", "meathead", "thickhead"],
	"idol": ["god"],
	"idolatry": ["worshipping"],
	"idolize": ["worship", "look up to", "bow down before"],
	"i.e.": ["t.i. ~ that is"],
	// "-ify": ["be-", "-en"],
	"igloo": ["-"],
	"ignis fatuus": ["will-o-the-wisp"],
	"ignite": ["fire", "tend", "set alight"],
	"ignorance": ["benightedness", "shunning"],
	"ignorant": ["benighted", "unaware", "unlearned", "unread", "untaught"],
	"ignore": ["unheed", "forget", "overlook", "slight", "slur over"],
	"iguana": ["-"],
	"ill-conceived": ["-"],
	"illegal": ["unlawful", "lawless", "outlawed"],
	"illegalise": ["outlaw"],
	"illegitimate": ["misbegotten", "unfathered", "born out of wedlock", "ill-gotten", "unrightful"],
	"illuminate": ["brighten", "shed light on; bathe", "beacon", "inlighten; unriddle; foreground", "highlight"],
	"illusion": ["daydream; misbelief", "old wives' tale"],
	"image": ["look alike", "ringer", "twin: likeness; mind's eye"],
	"imagination": ["mind's eye", "fathoming"],
	"imaginative": ["thoughtful"],
	"imagine": ["fathom", "see"],
	"imitate": ["ape; copy: follow on the footsteps of", "take a leaf out of (someone's) book"],
	"immanent": ["inbuilt", "handwired", "inbred"],
	"immature": ["youthful", "green", "flaw", "unripe", "childish"],
	"immediately": ["forthwith", "headlong", "straight away", "at once", "now", "right now"],
	"immigrant": ["incomer", "settler", "comer"],
	"imminent": ["one the way", "near-at-hand", "nearing", "forthcoming", "oncoming", "upcoming; threatening"],
	"immoral": ["dark", "evil", "rotten", "sinful", "wicked", "wrong", "unripe", "unfledged", "babyish"],
	"immortal": ["deathless; everlasting", "undying"],
	"immutable": ["fixed", "hard-and-fast"],
	"impact": ["crash", "strike", "wallop: mark", "sway. hit"],
	"impair": ["break", "criplle", "harm", "hurt"],
	"impale": ["jab"],
	"impartial": ["evenhanded", "fairminded"],
	"impasse": ["deadlock", "halt", "standstill"],
	"impassive": ["cold-blooded; deadpan", "empty", "numb"],
	"impede": ["hinder", "hold back", "hold up", "thwart", "shackle", "stop"],
	"impenetrable": ["-"],
	"imperative": ["needed"],
	"imperialism": ["-"],
	"impertinent": ["bold; ill bred"],
	"implicate": ["2. inweave", "twist", "writhe"],
	"implicit": ["1. unspoken", "wordless"],
	"implode": ["-"],
	"implore": ["beseech", "bid", "beg"],
	"imply": ["hint", "infold"],
	"impolite": ["rough", "lewd", "ill-bred", "uncouth", "ill-mannered", "uncalled-for"],
	"importance": ["heft", "weightiness", "pith", "greatness"],
	"important": ["big", "far-reaching", "foremost", "outstanding", "weighty", "earthshattering", "great"],
	"impose": ["lay", "put"],
	"impossible": ["hopeless", "beyond bearing"],
	"impress": ["gladden"],
	"impression": ["reckoning"],
	"imprint": ["mark", "stamp"],
	"imprison": ["lock up"],
	"impromptu": ["offhand"],
	"improper": ["uncomely", "unfit", "untoward", "unright", "wrong"],
	"improve(ment)": ["shape up", "grow better", "help; breakthrough", "bettering"],
	"improvised": ["makeshift", "offhand"],
	"impudence": ["cheek"],
	"impudent": ["shameless", "cheeky"],
	"impulse": ["boost", "goad", "yeast; bone", "leaning", "want"],
	"impurity": ["lewdness", "unfreshness"],
	"inadvertent": ["unwitting"],
	"inalienable": ["-"],
	"inane": ["mindless"],
	"inanimate": ["heedingless", "still"],
	"inappropriate": ["unbecoming", "unfit", "untoward"],
	"inaudible": ["-"],
	"incalculable": ["untold"],
	"incantation": ["-"],
	"incarnate": ["inflesh"],
	"in case": ["lest", "for fear that", "the less"],
	"inception": ["birth", "dawn", "outset", "kickoff"],
	"incest": ["-"],
	"incident": ["hap", "happening"],
	"incise(sion)": ["cut", "slit"],
	"incisive": ["cutting"],
	"incite": ["spur", "goad", "egg"],
	"inclination": ["leaning", "tilt", "bowing\ndesire: wish", "need", "craving", "yearning"],
	"incline": ["sway", "lower", "bow", "stoop", "tip", "lean"],
	"inclined": ["given", "likely", "willing", "ready"],
	"include": ["inhold"],
	"incompassionate": ["ruthless", "heartless", "cold", "hard-hearted", "cold-hearted"],
	"incomplete": ["underdone", "less than whole", "unwhole", "underwhole", "unfullworked"],
	"inconsiderate": ["thoughtless", "uncaring", "unthinking", "careless", "ruthless", "reckless"],
	"incorporate": ["knit", "meld", "mingle", "mix"],
	"incorrect": ["wrong", "wide of the mark; unfit", "untoward; off", "unsound", "untrue"],
	"increase": ["swell", "up; rise", "snowball"],
	"increasingly": ["more and more", "risingly"],
	"incredible": ["-"],
	"incursion": ["raid", "inroad"],
	"incus": ["anvil"],
	"indebted": ["owing"],
	"indecent": ["shameless", "unseemly", "shameful", "unsightful"],
	"indecisive": ["wavering", "in two minds", "swithering", "halting", "half-hearted", "half-minded"],
	"indelicate": ["heavy handed", "stern", "gruff"],
	"independent": ["free", "selfstanding"],
	"independence": ["freedom"],
	"indicate": ["bespeak; flag up", "betoken", "show"],
	"indication": ["hint", "clue", "mark", "inkling"],
	"indigent": ["needy", "down at heel"],
	"indignity": ["brickbat", "slap", "slight", "slur"],
	"indiscriminatee": ["swoopstake", "wholesale", "hit-or-miss"],
	"indisposed": ["2. unsound", "unwell", "laid up"],
	"individual": ["-"],
	"individualism": ["selfdom"],
	"indocrinate": ["brainwash"],
	"indolent": ["idle", "shiftless", "slothful"],
	"induce": ["beget", "breed", "draw on", "set off", "give rise to", "make", "bring out", "bring", "lead to", "enkindle", "whip up"],
	"indulgence": ["kindness"],
	"industry": ["-"],
	"industrial action": ["strike"],
	"industrious": ["yielding", "working"],
	"inebriated": ["drunk", "smashed", "blasted", "baked", "half-cut", "hopped up"],
	"ineffable": ["nameless"],
	"ineffective": ["hamstrung", "bad"],
	"inept": ["clueless", "unhandy", "clumsy", "bad"],
	"inert": ["still", "lifeless", "idle", "undoing"],
	"inexperienced": ["unfledged", "callow", "raw", "green"],
	"infamous": ["shameful", "ill-named", "unworthy"],
	"infamy": ["shamefulness", "lowstanding", "ill-name", "bad name"],
	"infancy": ["bairnhood", "childhood"],
	"infant": ["newborn", "toddler", "suckling"],
	"infanticide": ["-"],
	"infect": ["-"],
	"infection": ["-"],
	"infectious": ["catching", "spreading"],
	"infer": ["deem", "gather", "make out", "see"],
	"inferior": ["lower", "nether; mean; shoddy", "worse"],
	"infernal": ["fiendish", "hellish", "wicked", "underhanded", "evil", "ill", "hateful", "all-fired"],
	"inferno": ["hell", "hellfire", "fire"],
	"infertile": ["barren", "unbearing"],
	"infidelity": ["backstabbing", "sellout", "two-timing"],
	"infinite": ["boundless", "endless", "everlasting", "never-ending", "timeless", "unbounded", "unmetely", "unrim", "untold", "without end"],
	"infinitive": ["-"],
	"infinity": ["everlasting", "foreverness"],
	"infirmed": ["sickly", "unhealthy", "wanhale"],
	"inflammation": ["burning", "redness", "soreness", "swelling", "itch"],
	"inflate": ["blow up", "fill"],
	"influence": ["inflow", "sway", "shape"],
	"inflict": ["lay on", "wreak", "meat or deal out", "deal"],
	"influx": ["inflow"],
	"informal": ["loose"],
	"informant": ["deep throat", "fink", "nark", "snitcher", "telltale", "whistleblower"],
	"information": ["knowledge", "tidings"],
	"infuriate": ["foaming", "shirty", "teed-off", "wroth", "madden"],
	"infuse": ["inset", "input", "inlay"],
	"ingenious": ["clever"],
	"ingenuity": ["cleverness"],
	"ingest": ["tuck", "down", "swallow"],
	"inhabit": ["dwell", "abide", "wone in", "inwone", "live in"],
	"inhabitance": ["abode", "dwelling"],
	"inhabitant": ["dweller", "abider"],
	"inhale": ["breathe in", "draw in", "suck"],
	"inherent": ["built-in", "inborn", "inbred", "indwelling"],
	"inherit": ["get"],
	"inheritance": ["birthright"],
	"inimical": ["foesome", "harmful", "unfriendly"],
	"initial": ["first", "beginning", "early"],
	"initiate": ["start", "begin", "bring on", "bring up", "goad", "spur"],
	"injection": ["jab"],
	"injure": ["harm", "hurt", "wound"],
	"ink": ["black (It's attested", "the color was \"swarth\"", "and it is still used in Scandenavia for \"ink\")"],
	"innate": ["built-in", "hardwired", "inbred"],
	"innocence": ["greenness", "guiltlessness", "youth"],
	"innocent": ["sinless", "white"],
	"innocuous": ["white", "hurtless"],
	"innovation": ["brainchild"],
	"innovative": ["clever", "groundbreaking"],
	"innovator": ["groundbreaker", "trendsetter"],
	"inquire": ["into: dig into", "delve into", "delve into", "ask"],
	"insane": ["bats", "mad", "having a screw loose", "out of one's mind"],
	"inscribe": ["inwrite", "write"],
	"insect": ["bug"],
	"insensitive": ["unfeeling", "unfeelsome", "heartless"],
	"inseparable": ["bound (up)", "hand-in-hand", "forever one", "thick"],
	"insert": ["input", "inset", "put", "put in", "place"],
	"insincere": ["hollow", "hollow-hearted", "unsoothfast", "unsoothful", "untruthfast", "untruthsome"],
	"insist": ["stand one's ground"],
	"insomnia": ["sleeplessness"],
	"inspect(ion)": ["inlook(ing)"],
	"inspiration": ["brainchild", "brainwave"],
	"inspire": ["beghast"],
	"instance": ["hap"],
	"instantly": ["at once", "forthwith", "swith", "now", "right now"],
	"instigate": ["fire up", "goad", "kindle", "rouse", "stir up", "spur"],
	"institute": ["set up"],
	"institution": ["body"],
	"instruct": ["teach; wise up", "tell what to do"],
	"instruction": ["behest", "word"],
	"instrument": ["tool", "means"],
	"insult": ["slight", "slur", "lambast", "roast"],
	"insurance": ["-"],
	"insurgent": ["red", "upriser"],
	"insurrection": ["uprising", "outbreak"],
	"integer": ["whole tel; being"],
	"intellectual": ["highbrowed", "long-haired"],
	"intelligence": ["brains; keenness", "wit", "braininess", "brightness", "cleverness"],
	"intelligent": ["brainy", "bright, clever", "nimble", "keen", "sharp-witted"],
	"intelligible": ["-"],
	"intend": ["look, mean"],
	"intense": ["fearful; warm-blooded", "frought"],
	"intention": ["-"],
	"inter": ["lay", "put away"],
	"inter-": ["between-"],
	"interact": ["n: dealings"],
	"intercede": ["-"],
	"intercept": ["block", "pick off"],
	"interdict": ["forbid"],
	"interfere": ["nose", "pry"],
	"intergovernmental": ["-"],
	"interjection": ["inset"],
	"interest": ["share", "stake; weal", "well-being; business", "outfit", "reck", "lean"],
	"interesting": ["gripping"],
	"interim/interval": ["midtime", "(long) far-between", "midwhile"],
	"interior": ["inside", "inner", "inliness"],
	"intermediary": ["go-between"],
	"intermission": ["break"],
	"intern": ["inworker"],
	"internal": ["inland", "inner", "inner-bodily", "inside"],
	"international": ["lands amongst"],
	"internet": ["the World Wide Web", "Web"],
	"interpol": ["worldwatcher"],
	"interpret": ["1. unriddle 2. play"],
	"interrogate": ["ask (about)"],
	"interrupt": ["break in", "cut in"],
	"interruption": ["breather"],
	"intervention": ["-"],
	"interview": ["-"],
	"intestine": ["tharm", "gut"],
	"intimacy": ["warmth", "warm friendship", "near friendship"],
	"intimidate": ["besmallen", "scare", "frighten", "overawe"],
	"intoxicate": ["-"],
	"intoxicating": ["heady", "breathtaking", "heart-stopping", "stirring"],
	"intoxication": ["drunkenness; cloud nine"],
	"introduce": ["bring up", "set forth", "put forward; lead in"],
	"introduction": ["lead-in"],
	"introverted": ["-"],
	"inundate": ["flood", "whelm", "overwhelm"],
	"invade": ["-"],
	"invader": ["-"],
	"invaluable": ["-"],
	"invariably": ["always"],
	"invasion": ["raid"],
	"invent": ["make up", "make"],
	"invention": ["-"],
	"inventor": ["-"],
	"inventory": ["goodslist"],
	"invertebrate": ["unbackboned"],
	"invest": ["plough into"],
	"investigate": ["sift"],
	"investigator": ["-"],
	"investigation": ["-"],
	"investor": ["shareholder", "stakeholder"],
	"inveterate": ["abiding", "deep-rooted", "deep-seated", "hardened", "lifelong", "long-lived", "settled"],
	"inviolable": ["hallowed", "holy"],
	"invisible": ["-"],
	"invite": ["-"],
	"involve": ["take in", "whelm"],
	"ion": ["-"],
	"ionosphere": ["-"],
	"iota": ["beans", "whit"],
	"ipseity": ["ass", "selfhood"],
	"irascible": ["prickly", "feisty", "edgy", "churlish", "bearish", "outburstish", "highly-strung", "wrathy", "wrongheaded", "crankisome"],
	"ire": ["wrath"],
	"iris": ["eyebow"],
	"irony": ["-"],
	"irregular": ["broken"],
	"irrelevant": ["without bearing", "bearingless", "unakinly"],
	"irresponsible": ["reckless", "heedless", "careless", "thoughtless", "unmindful", "unthinking", "unanswerly"],
	"irrigate": ["-"],
	"irritate (vex)": ["irk", "gall"],
	"irritating": ["irksome", "swinksome"],
	"ischium": ["sea-bone"],
	// "-ise": ["ledge (<OE -læcan)", "-ly"],
	"isle": ["island", "holm"],
	"islet": ["ait", "eyot", "iling"],
	// "-ism": ["-"],
	"isobar": ["-"],
	"isocracy": ["-"],
	"isolate": ["cut off", "sunder"],
	"isolation": ["loneliness", "alonehood", "asideness"],
	"ivory": ["tusk"],
	"ivory coast": ["-"],
	// "-ize": ["-en"],
	"jail": ["lockup"],
	"janitor": ["caretaker"],
	"january": ["-"],
	"japan": ["Land of the rising sun"],
	"jar": ["urn (from Latin \"urna\")"],
	"jargon": ["shoptalk", "speak"],
	"jaundiced": ["sallow"],
	"jealous": ["-"],
	"jehovah": ["Almighty", "Everlasting", "Father", "Godhead", "Lord"],
	"jellyfish": ["namby-pamby", "wimp"],
	"jester": ["funniman", "gleeman"],
	"jesus": ["Lamb of God"],
	"jewel": ["rock slang"],
	"jingoism": ["-"],
	"jinx": ["mishap"],
	"job": ["errand", "chore", "berth", "business", "worksecond: bywork"],
	"join": ["link", "fit", "fay", "tie"],
	"joint": ["limb", "lith"],
	"joke": ["one-liner", "trick"],
	"jolly": ["blithe", "gleeful", "mirthful", "merry"],
	"journal": ["logbook", "daybook"],
	"journalism": ["news"],
	"journalist": ["newsman"],
	"journey": ["ramble", "wayfaring", "fare"],
	"jovial": ["blithe", "gleeful", "merry", "mirthful"],
	"joy": ["gladness", "warm fuzzles", "mirth"],
	"joyful": ["blissful", "pleased", "tickled", "mirthful", "merry", "gleeful", "blithe"],
	"judaism": ["-"],
	"judge": ["deemer", "deemster"],
	"judgment": ["doom", "finding", "holding; call; belief", "eye", "mind; fix", "deemship"],
	"judicious": ["wise"],
	"juggernaut": ["drive", "push"],
	"juice": ["sap", "wos"],
	"juice up": ["fire", "liven up"],
	"july": ["-"],
	"jump": ["leap", "spring"],
	"june": ["-"],
	"junior": ["younger", "youth", "young", "underling"],
	"jurisdiction": ["law", "lawhood"],
	"just": ["barely", "hardy", "slightly; but", "merely", "only; full", "right", "sharp; nearly", "lately\nonly now", "anowly", "benowly I just saw that"],
	"justice": ["fair shake", "fairness", "rightfulness", "rightness"],
	"justify": ["uphold", "righten"],
	"juvenile": ["youngster", "youth", "stripling"],
	"kamikaze": ["daredevil", "devil-may-care", "hell-for-leather"],
	"kangaroo": ["-"],
	"karaoke": ["-"],
	"kennel": ["doghouse"],
	"kiln": ["-"],
	"kindergarten": ["-"],
	"kiosk": ["booth", "stall"],
	"kleptomania": ["mad theft"],
	"kleptomaniac": ["mad thief"],
	"korea": ["-"],
	"kowtow": ["-"],
	"labour": ["work", "elbow fatmed: childbearing"],
	"labourer": ["worker", "swinker"],
	"laboratory": ["workshop", "workhall"],
	"laborious": ["backbreaking", "burdensome"],
	"labyrinth": ["maze"],
	"lacerate": ["cut"],
	"lackadaisical": ["lackadaisy", "listless", "lazy"],
	"lacklustre": ["dim", "dull", "leaden", "lifeless", "dead", "brightless"],
	"lactose": ["-"],
	"lacuna": ["dearth"],
	"lager (beer)": ["-"],
	"lagoon": ["-"],
	"lambaste": ["berate", "flog", "scathe", "upbraid"],
	"lament": ["mourn", "weep", "yammer"],
	"lamentable": ["bemoaning", "doleful"],
	"lamp": ["beacon", "light"],
	"lampion": ["-"],
	"language": ["tung", "speech"],
	"languid": ["limp; down-and-out", "sapped", "wimpish"],
	"languish": ["pine", "dwindle", "droop", "ebb", "lessen", "wane", "wither", "weaken", "wear away", "swine"],
	"languor": ["listlessness; lowness", "wimpiness"],
	"lanolin": ["-"],
	"lapidary": ["-"],
	"lapse": ["fluff", "slip", "screwup", "backslide"],
	"large": ["big", "broad", "mickle"],
	"largely": ["mostly"],
	"lascivious": ["foul", "lewd; lustful"],
	"laud": ["-"],
	"launch": ["take off"],
	"launder": ["wash", "cleanse"],
	"laundrette": ["washhouse"],
	"laundry": ["wash", "washing"],
	"lava": ["molten rock"],
	"lawyer": ["lawman"],
	"lax": ["careless", "slack; loose", "slackened"],
	"laxative": ["-"],
	"lay (poem/song)": ["-"],
	"layman": ["newbie", "dabbler", "beginner"],
	"lcd": ["-"],
	"lease": ["let"],
	"leash": ["lead", "tether"],
	"lecher": ["masher", "wolf"],
	"lecherous": ["hot", "itchy", "lewd", "wanton"],
	"lecture": ["reading"],
	"lecturer": ["reader"],
	"lederhosen": ["-"],
	"leg": ["shank"],
	"legacy": ["bequest"],
	"legal": ["lawful", "aboveboard"],
	"legalize": ["-"],
	"legend": ["1. key 2. folktale"],
	"legible": ["-"],
	"legislator": ["lawmaker", "lawgiver"],
	"legislature": ["lawmaking body"],
	"legitimate": ["rightful", "(of birth) fullborn", "lawful"],
	"leisure": ["free", "busiless", "off"],
	"leisure, have": ["rest", "loaf", "while away the time"],
	"lemon": ["-"],
	"lemur": ["-"],
	"lenitive": ["soothing"],
	"lepidoptera": ["moths", "flinders (butterflies)"],
	"lepton": ["-"],
	"lesbian": ["dyke (slang)"],
	// "-let": ["-ling"],
	"lethal": ["deadly"],
	"lethargic": ["sluggish", "listless"],
	"lethargy": ["listlessness", "sluggishness"],
	"letter": ["character: rune", "bookstave"],
	"leukemia": ["-"],
	"level": ["-"],
	"lever": ["switch"],
	"leverage": ["heft", "pull", "sway"],
	"leveret": ["-"],
	"lexicon": ["wordhoard (<OE wordhord)", "wordlist"],
	"'liability": ["downside", "drawback"],
	"liable": ["-"],
	"liberal": ["broad-minded", "freehearted", "openhanded", "unstinting", "unselfish"],
	"liberalism": ["-"],
	"libertarian(ism)": ["-"],
	"liberate": ["free"],
	"liberation": ["-"],
	"liberty": ["freedom", "free will"],
	"library": ["bookhouse", "bookhoard"],
	"license": ["leave"],
	"licentious": ["hot", "lewd", "itchy"],
	"lichen": ["lungwort"],
	"lieutenant": ["helpmate", "sidekick"],
	"ligature": ["belt", "binding", "strap", "string"],
	"lily pad": ["-"],
	"limbo": ["-"],
	"limerence": ["crush"],
	"limit": ["bound", "tint", "narrow"],
	"limitation": ["cramp"],
	"limpid": ["see-through; cool", "smooth", "together", "unruffled", "unshaken", "unworried"],
	"line": ["wire\ndrawn: stroke", "slash", "dash"],
	"lineage": ["blood-ties", "house", "strain", "seed"],
	"linear": ["straight(wise)"],
	"lingerie": ["knickerwear", "smallclothes"],
	"lingua franca": ["shared tung"],
	"linguistic purism": ["-"],
	"linguistics": ["-"],
	"linguist": ["-"],
	"linoleum": ["-"],
	"lion": ["-"],
	"lipid": ["-"],
	"liquid": ["flowsome"],
	"liquor": ["-"],
	"litany": ["-"],
	"literary": ["written"],
	"literate": ["learned", "well-read"],
	"literature": ["bookcraft"],
	"lithography": ["-"],
	"littoral": ["-"],
	"liturgy": ["-"],
	"lizard": ["-"],
	"lobster": ["crayfish", "crawfish"],
	"local": ["-"],
	"locality": ["shire", "neighbourhood"],
	"locate": ["find; come upon"],
	"location, approx.": ["whereabouts"],
	"locomotive": ["-"],
	"lodge": ["dwell"],
	"lodger": ["boarder", "roomer"],
	"logarithm": ["-"],
	"logic": ["witcraft"],
	"logo": ["brandmark"],
	// "-logy, -log, -logue": ["-lore", "-craft"],
	"longitude": ["length"],
	"loquacious": ["feather-tunged", "gabby"],
	"lounge": ["idle", "lie", "moon"],
	"loyal": ["stalwart", "down-the-line", "true-hearted", "good", "fast", "steady", "true-blue,"],
	"loyalist": ["stalwart"],
	"loyalty": ["troth"],
	"lubricate": ["slick", "wax"],
	"lubricated": ["slippery"],
	"lubricious": ["hot", "lewd", "itchy", "wanton"],
	"lucid": ["shining", "glowing"],
	"lumpenproleteriat": ["rabble"],
	"lunacy": ["madness", "witlessness"],
	"lunar": ["moonly"],
	"lunatic": ["bats", "unhinged"],
	"luscious": ["lush", "tasteful; sweet", "good"],
	"luster": ["gloss"],
	"luxe": ["silken"],
	"luxuriant": ["green", "leefy"],
	"lycanthropy": ["-"],
	"lynx": ["-"],
	"macabre": ["gruesome", "grisly"],
	"macerate": ["soak", "steep"],
	"machine": ["vehicle: horseless", "wheels slang"],
	"machine gun": ["chain gun"],
	"magazine": ["-"],
	"magic": ["bad: spellcraft", "witchcraft"],
	"magician": ["wizard", "witch"],
	"magistrate": ["deemer", "deemster(Female)"],
	"magnesium oxide": ["-"],
	"magnate": ["-"],
	"magnet": ["-"],
	"magnitude": ["weight", "greatness", "micklehood."],
	"magnolia": ["-"],
	"maggot": ["worm", "grub"],
	"mail (armor)": ["-"],
	"maim": ["cripple"],
	"maintain": ["keep up", "uphold", "hold"],
	"maintenance": ["upkeep"],
	"maître d'hôtel": ["-"],
	"majestic": ["high-flown", "lofty"],
	"majesty": ["highness", "lordship", "loftiness"],
	"major": ["higher", "overling"],
	"majority": ["-"],
	"maladjusted": ["misfit"],
	"malady": ["sickness", "illness", "unwellness"],
	"malapert": ["brazen"],
	"male": ["buck", "chap", "fellow", "ladstate: manhood"],
	"malefactor": ["sinner", "wrongdoer: crook", "lawbreaker"],
	"malevolence": ["hatefulness", "meanness"],
	"malevolent": ["bad", "mean"],
	"malfeasance": ["misdoing", "wrongdoing"],
	"malfunction": ["misbehave"],
	"malice": ["cattiness", "hatefulness", "meanness"],
	"malicious": ["-"],
	"malign": ["-"],
	"malnourish": ["misfeed", "underfeed"],
	"maltose": ["-"],
	"maltreat": ["manhandle", "rough upmess over slang"],
	"malware": ["-"],
	"mammal": ["-"],
	"mammary": ["breast", "tit"],
	"manage": ["handle", "run", "deal with", "fare", "keep", "keep up"],
	"manager": ["foreman"],
	"mandrake": ["-"],
	"mandrill": ["-"],
	"manga": ["-"],
	"manger": ["trough"],
	"mangrove": ["-"],
	"mania": ["madness"],
	"maniac": ["mad", "crazy"],
	"manifest(ed)": ["bald", "ringing", "straightforward"],
	"manifest": ["bespeak", "give away"],
	"manifestation": ["-"],
	"manifesto": ["-"],
	"manner": ["way"],
	"mansion": ["hall"],
	"mansuetude": ["tameness", "mildness"],
	"manta": ["-"],
	"mantis": ["-"],
	"mantle": ["wrap; hood", "shroud"],
	"manual": ["handly"],
	"manually": ["by hand"],
	"manufacture": ["frame", "beframe", "make up", "think up", "make"],
	"manure": ["dung"],
	"manuscript": ["handwrit"],
	"map": ["-"],
	"marble": ["-"],
	"march": ["-"],
	"marijuana": ["hash", "hempstreet talk: grass", "weed"],
	"marine": ["-"],
	"marine park": ["-"],
	"maritime": ["sealike"],
	"marjoram": ["-"],
	"market": ["-"],
	"marquess": ["-"],
	"marriage": ["wedding", "handfast", "wedlock"],
	"marry": ["wed", "tie"],
	"marsupial": ["-"],
	"martyr": ["-"],
	"martial art": ["-"],
	"marvel": ["wonder", "wilder"],
	"marvelous": ["wonderful", "wulderly", "selcouth"],
	"mask": ["hide"],
	"masochism": ["achelove", "achelust"],
	"masochist": ["seeksorrow", "achelover", "acheluster"],
	"mason": ["-"],
	"masonry": ["stonecraft", "stonework"],
	"masque": ["-"],
	"masquerade": ["-"],
	"mass": ["bulk", "inweight", "lot", "deal,"],
	"massacre": ["slaughter"],
	"masticate": ["chew"],
	"master": ["head"],
	"masturbate": ["Frig (OE: frygian (“to rub", "caress”))"],
	"match": ["game", "tie", "head-to-head; mate", "fellow; twin", "lookalike; light (stick)"],
	"material": ["weighty"],
	"maternal": ["motherly"],
	"mathematics": ["-"],
	"matrimony": ["wedlock"],
	"matter": ["-"],
	"mature": ["grown", "ripe"],
	"maximum": ["uttermost", "utmost", "most"],
	"may": ["-"],
	"mayhem": ["crippling,"],
	"mayonnaise": ["yolkdip"],
	"mayor": ["burgomaster (C.F Dutch)"],
	"measure": ["beat,"],
	"mechanics": ["-"],
	"mediate": ["halfway", "midmost"],
	"mediator": ["-"],
	"medicine": ["healing"],
	"medieval": ["-"],
	"mediocre": ["middling", "halfway"],
	"meditate": ["-"],
	"mediterranean sea": ["-"],
	"medium": ["-"],
	"mega-": ["-"],
	"megalopolis": ["-"],
	"megaphone": ["bullhorn", "loudhailer"],
	"meiosis": ["-"],
	"melancholy": ["dreary", "heartbreaking", "heartrending", "mournful", "saddening", "teary; cast down", "down in the-mouth", "forlorn", "gloomy", "woebegone"],
	"melee": ["tussle"],
	"melody": ["-"],
	"melon": ["-"],
	"member": ["limb", "fellow", "belonger", "link"],
	"membrane": ["film"],
	"memory": ["mind's eye", "mind's ear"],
	"meningitis": ["-"],
	"menstrual": ["monthly"],
	"menstruate": ["monthbleed"],
	"mental": ["mindly", "inward", "mindlike"],
	"mentality": ["mindset", "outlook"],
	"mention": ["name", "speak of", "say something of", "bring up", "hint at"],
	"menu": ["-"],
	"mercenary": ["-"],
	"merchant": ["chapman", "trader"],
	"merchandise": ["wares", "goods", "stocks"],
	"merchandising": ["-"],
	"merciful": ["forgiving", "mildhearted"],
	"merciless": ["-"],
	"mercy": ["kindness", "ruth"],
	"merge": ["blend", "meld"],
	"meridian": ["high noon", "high-water line"],
	"merit": ["meed", "worth"],
	"mesolithic": ["-"],
	"mesopotamia": ["-"],
	"meson": ["-"],
	"message": ["earful", "tiding", "wire", "word"],
	"metal": ["-"],
	"metamorphosis": ["-"],
	"metaphor": ["-"],
	"meteor": ["falling star", "shooting star"],
	"meter (poetry)": ["-"],
	"methane": ["-"],
	"method": ["way", "means"],
	"metropolis": ["-"],
	"mezozoicum": ["-"],
	"micro-": ["small-"],
	"microscope": ["-"],
	"midgard": ["-"],
	"migrate": ["-"],
	"militarist(ic)": ["hawk(ish)"],
	"military": ["landmight(ly)"],
	"militia": ["-"],
	"millennium": ["yearthousand"],
	"million": ["-"],
	"mince": ["-"],
	"mine": ["delve"],
	"mineral": ["ore"],
	"minimize": ["lessen", "downplay", "belittle"],
	"minister": ["-"],
	"minstrel": ["gleeman", "folksinger"],
	"minor": ["-"],
	"minority": ["-"],
	"minotaur": ["-"],
	"minute": ["-"],
	"miracle": ["flash", "wonder"],
	"mirror": ["looking-glass"],
	"misandrist": ["man-hater"],
	"miscellany(eous)": ["clatter", "jumble", "kitchen-sink", "mishmash", "mixed"],
	"misdemeanour": ["wrongdoing"],
	"miser": ["tightwad", "skinflint", "niggard"],
	"miserable": ["black", "bleak", "cheerless", "dark", "forlorn", "glum", "godforsaken", "grey", "sullen; downcast", "hangdog", "woeful; wreatched; ratty", "run-down", "threadbear"],
	"misery": ["distress", "weakness"],
	"misfortune": ["mishap"],
	"mismanage": ["mishandle"],
	"misogynist": ["-"],
	"misotheism": ["-"],
	"misplace": ["mislay"],
	"missile": ["-"],
	"mission": ["errand", "undertaking", "goal"],
	"missionary": ["sendling", "errander"],
	"mitigate": ["soften"],
	"mitochondrium": ["-"],
	"mitosis": ["-"],
	"mobile (phone)": ["handset", "handcaller"],
	"mock": ["man-made", "sham; send up"],
	"model": ["-"],
	"modern": ["newfangled"],
	"modernise": ["-"],
	"modest": ["down-to-earth", "meek"],
	"modify": ["-"],
	"modulation": ["-"],
	"moist": ["damp", "wet"],
	"molar": ["-"],
	"mold": ["build", "make", "shape"],
	"moment": ["eyeblinck", "flash", "heartbeat", "twinkling"],
	"monarch": ["king"],
	"monarchism": ["kingdom"],
	"monarchy": ["-"],
	"monastery": [""],
	"monasticism": ["-"],
	"money": ["fee", "geld", "brass", "mint", "silver", "sterling", "penny", "tradeworth\nslang: kale", "dough", "buck"],
	"monitor": ["watch", "oversee"],
	"monk": ["-"],
	"monologue": ["-"],
	"monster": ["fiend; dreadnaught"],
	"montenegro": ["-"],
	"monument": ["keepsake", "token; gravestone", "headstone"],
	"monumental": ["overwhelming"],
	"moor": ["heath"],
	"moral": ["-"],
	"morality": ["uprightness"],
	"morbid": ["cheerless", "forlorn"],
	"mordant": ["biting"],
	"morgue": ["deadhouse"],
	"moribund": ["dying", "deathbound"],
	"mortal": ["deadly"],
	"mortality": ["death", "end", "ending", "endless sleep", "forthfaring", "bane", "Grim Reaper"],
	"mortgage": ["wadset", "homeloan"],
	"mother nature": ["-"],
	"mortuary": ["-"],
	"mosaic": ["-"],
	"mosquito": ["gnat", "midge", "midgy"],
	"moth (native)": ["-"],
	"motion": ["-"],
	"motionless": ["stock-still"],
	"motive": ["-"],
	"motor": ["-"],
	"motorcycle": ["-"],
	"motorway": ["highway"],
	"mound": ["drift; heap; highland", "rise", "upland"],
	"mount": ["hill"],
	"mountain": ["highberg"],
	"moustache": ["kemp"],
	"move": ["shift; drive; stir; sway; set off;\npeel off"],
	"movement": ["shift", "stir; drive"],
	"movie": ["film", "flick"],
	"mr, sir": ["Lord"],
	"mrs, miss": ["Lady"],
	"mucus": ["slime", "snot"],
	"muffle": ["shroud"],
	"multiculturalism": ["-"],
	"multiple": ["many", "manifold"],
	"multiply": ["manifold"],
	"multi-": ["cluster-", "mani-"],
	"multi-language word": ["wanderword"],
	"multi-purpose": ["all-in-one"],
	"multitude": ["crowd", "throng", "flock", "folk", "cluster", "wave", "mow", "manifoldness"],
	"mummy": ["-"],
	"municipality": ["-"],
	"muscle": ["brawn", "thew", "sinew"],
	"muscular": ["brawny", "thewy", "sinewy", "thewsome"],
	"muse": ["mimmer/mammer"],
	"museum": ["-"],
	"mushroom": ["toadstool"],
	"music": ["glee"],
	"musical": ["-"],
	"musician": ["gleeman", "player", "songwright"],
	"musicology": ["-"],
	"muster": ["gather(ing)"],
	"mutate": ["-"],
	"mute": ["dumb", "hushed", "speechless"],
	"mutilate": ["-"],
	"mutton": ["sheepflesh"],
	"mutual": ["evenway"],
	"mycelium": ["-"],
	"mystery": ["wonder", "brain twister", "beyond man's ken", "hidden thing"],
	"myth": ["dreamtale"],
	"mythology": ["folklore", "dreamlore"],
	"nadir": ["depths"],
	"naive": ["craftless; self-taught"],
	"nano-technology": ["smart dust"],
	"narcolepsy": ["sleepsickness"],
	"narcotic": ["dope\nbenumbing", "deadening"],
	"narrate": ["yarn"],
	"narrative": ["tale"],
	"natatorium": ["swimming pool"],
	"nation": ["-"],
	"nationalism": ["flag-waving"],
	"native": ["homely", "built in", "inborn", "inbred"],
	"natural": ["clay", "self\ngrouping: feather", "ilk", "kind"],
	"natural logarithm": ["-"],
	"natural selection": ["drain of life"],
	"nature": ["clay", "self; wilderness; lik", "kind; being", "soul; world"],
	"naturism": ["-"],
	"naturists": ["barefolk"],
	"nausea": ["sickness", "loathing"],
	"nauseous": ["sickening", "loathsome"],
	"navigate": ["guide", "sail", "steer", "helm"],
	"navy": ["fleet", "shipfyrd"],
	"neanderthal": ["-"],
	"nebula": ["-"],
	"necessary": ["needful", "needed"],
	"necessitate": ["need", "behoove (att'd in impersonal sense)"],
	"necklace": ["-"],
	"necro-": ["dead-", "death-"],
	"necrology": ["-"],
	"necromancy": ["witchcraft"],
	"necrophagy": ["-"],
	"necrophilia": ["-"],
	"nectar": ["-"],
	"negate": ["gainsay"],
	"negative": ["naysaying", "untoward"],
	"neglect": ["forget", "overlook", "slight", "slur over"],
	"negligent": ["heedless", "reckless"],
	"negotiate": ["moot", "chaffer", "haggle"],
	"negro": ["black", "swart", "swarthy"],
	"neocortex": ["-"],
	"neolithic": ["-"],
	"neophyte": ["greenhorn", "incomer", "settler", "newcomer"],
	"nepenthe": ["-"],
	"nephew": ["-"],
	"nerve": ["mettle", "boldness", "doughtiness", "guts", "fastness", "fearlessness", "firmness", "pith", "pluck", "steadiness", "steel", "heart", "will"],
	"nervous": ["edgy", "keyed-up", "high strung"],
	"neurose": ["-"],
	"neurotransmitter": ["-"],
	"neutral": ["unsided", "sideless", "middlish", "in-between"],
	"neutrality": ["unsidedness,  fair-mindedness", "evenhandedness"],
	"neutron": ["-"],
	"niche": ["nook"],
	"niece": ["-"],
	"nihilism": ["-"],
	"nitrogen": ["-"],
	"noble": ["highbred; best kind: gilt-edged"],
	"nocturnal": ["nightly", "night-time"],
	"nocturne": ["-"],
	"noise": ["din", "clattering"],
	"noisy": ["loud"],
	"nolens volens": ["willy-nilly"],
	"nominative (case)": ["-"],
	"nominate": ["call; name"],
	"non-": ["un-", "-less", "not"],
	"non obstante": ["-"],
	"non-existent": ["beingless"],
	"nonsense": ["rubbish", "twaddle", "humbug", "gammon"],
	"noose": ["-"],
	"norm": ["rightline"],
	"normal": ["-"],
	"nostalgia": ["-"],
	"notable": ["bright", "outstanding", "star"],
	"notch": ["slit", "groove", "kerf (n.)", "carve (vb.)"],
	"notary public": ["-"],
	"note": ["-"],
	"note, of (famous)": ["-"],
	"notice": ["heed (take heed)"],
	"noticeable": ["-"],
	"noting": ["heeding"],
	"noun": ["nameword"],
	"nourish": ["feed", "fodder"],
	"novel": ["talebook"],
	"novelty": ["newness"],
	"november": ["-"],
	"novice": ["newling", "beginner", "fledgeling", "newcomer", "freshman", "greenhorn"],
	"nubile": ["wedworthy"],
	"nuclear weapon": ["-"],
	"nucleon": ["-"],
	"nucleus": ["kernel"],
	"nuisance": ["hindering", "besetter", "harrier", "hounder", "gadfly"],
	"nullify": ["naughten", "override"],
	"number": ["tally"],
	"numerator": ["-"],
	"numerous": ["many"],
	"nurse": ["carer", "caregiver"],
	"nursery": ["-"],
	"nurture": ["breed", "rear", "foster", "bring up"],
	"nutritious": ["feeding", "healthful", "wholesome"],
	"obedient": ["hearsome", "law-abiding"],
	"obedience": ["hearsomeness"],
	"obelisk": ["-"],
	"obese": ["full", "podgy", "overweight"],
	"obey": ["heed", "fulfill", "follow"],
	"obfuscate": ["becloud"],
	"object": ["ware", "thing", "mark"],
	"objection": ["gripe"],
	"objectionable": ["-"],
	"objective": ["goal", "target; fair-minded", "open-minded"],
	"objectivity": ["open-mindedness", "evenhandedness"],
	"obligate": ["bind", "make"],
	"obligation": ["binding", "making"],
	"obliged": ["bound"],
	"oblique": ["slanting", "sideways"],
	"obliquely": ["aslant"],
	"oblivion": ["forgetfullness", "unawareness"],
	"oblivious": ["clueless", "careles", "heedless", "unwitted"],
	"obscene": ["foul", "lewd", "shameless"],
	"obscure": ["thester", "dim", "unlit", "swart", "overmisted", "shady"],
	"obsequious": ["cringing", "beggarly", "bootlicking", "brownnosing", "fawning", "groveling", "sniveling", "spineless"],
	"observant": ["awake", "open-eyed"],
	"observe": ["follow", "goose-step; eye", "behold", "catch", "mark", "look at", "witness; mind", "watch", "keep an eye on"],
	"observer": ["witness", "onlooker", "beholder"],
	"obsess": ["grip"],
	"obsolete": ["outworn", "rust"],
	"obstacle": ["block", "hurdle"],
	"obstinate": ["headstrong", "willful", "steadfast"],
	"obstetrics": ["-"],
	"obstruct": ["block", "fetter", "hamstring", "shackle", "hold up"],
	"obstruction": ["hindering", "hinderness", "hitch"],
	"obtain": ["get", "reap", "win", "net", "come by", "draw", "land"],
	"obvious": ["straightforward"],
	"obviously": ["-"],
	"óðinn / odin": ["weden"],
	"occasion": ["time; opening"],
	"occasional": ["here and far between"],
	"occasionally": ["here and there", "now and then"],
	"occidental": ["western"],
	"occupied": ["busy", "tied-up"],
	"occur": ["happen", "befall", "come about"],
	"occurrence": ["happening"],
	"ocean": ["-"],
	"october": ["-"],
	"octopus": ["-"],
	"odds": ["likelihood; at odds: out of step"],
	"odour": ["smell", "stench"],
	"oenophilia": ["-"],
	"oesophagus": ["-"],
	"offend": ["smite", "upset", "gall", "wound"],
	"offer": ["bequeath", "agive"],
	"offering": ["gift", "handout"],
	"office": ["-"],
	"officer": ["beadle", "sheriff"],
	"official": ["steward", "sheriff", "reeve"],
	"oil": ["slick", "wax"],
	"ointment": ["salve"],
	"okay": ["all right"],
	"old fashioned": ["stick-in-the-mud", "old time", "old world", "old line"],
	"old testament": ["-"],
	"oleaginous": ["-"],
	"olfactory": ["smell"],
	"-ology": ["-lore", "-alogy (alog + -y)"],
	"omen": ["boding", "foreshadowing"],
	"ominous": ["doomy", "ill-boding", "threatening"],
	"omit": ["leave out", "drop"],
	"omnipotent": ["almighty"],
	"omniscient": ["all-knowing"],
	"onion": ["-"],
	"operate": ["work", "run"],
	"opinion": ["thought", "think-so,"],
	"opponent": ["witherling"],
	"opportune": ["timely", "well-timed"],
	"opportunity": ["opening"],
	"oppose": ["be against", "buck", "withstand; fight"],
	"opposite": ["withering"],
	"opposition": ["-"],
	"oppressed": ["downtrodden"],
	"opprobrium": ["shame"],
	"optimum": ["best"],
	"optimism": ["yaysaying", "hopethinking"],
	"optimist": ["yaysayer", "hopethinker"],
	"optional": ["-"],
	"oral": ["uttered; unwritten"],
	"orange": ["-"],
	"orangutan": ["-"],
	"oratory": ["-"],
	"orbit": ["-"],
	"orchestra": ["-"],
	"orchid": ["-"],
	"ordain": ["doom; call"],
	"order": ["-"],
	"orderly": ["smooth", "well-run", "shipshape", "trim", "spotless"],
	"ordination": ["-"],
	"organ": ["book; means", "tool"],
	"organization": ["board", "brotherhood", "fellowship"],
	"organize": ["-"],
	"oriental": ["eastern"],
	"orifice": ["hole", "mouth", "opening"],
	"origin": ["root", "wellspring", "beginning", "birth", "stem"],
	"original": ["firstling"],
	"originate": ["stem"],
	"ornament": ["bedeck", "deck", "trim"],
	"ornamentation": ["setoff", "trim"],
	"ornithology": ["-"],
	"orthodox": ["mainstream; by-the-book"],
	"osteology": ["-"],
	"osteoporosis": ["-"],
	"ostrich": ["-"],
	"outcry": ["uproar"],
	"outdated": ["outworn", "rusty"],
	"outmanoeuvre": ["outsmart", "outshine", "outwit"],
	"outperform": ["outdo", "outshine"],
	"overbalance": ["slip", "tumble", "lose your footing; upset", "keel over"],
	"overcharge": ["overload", "overweigh"],
	"overemphasize": ["overplay", "overshow"],
	"ovum": ["-"],
	"oxygen": ["breath of life"],
	"oyster": ["clam"],
	"pabulum": ["fodder", "food of thought"],
	"pace": ["speed; step", "walk", "stride", "tread"],
	"pacifist": ["-"],
	"package": ["wrapping"],
	"paedophilia": ["-"],
	"pagan": ["heathen"],
	"page": ["side", "sheet", "leaf"],
	"pacify": ["allay"],
	"pain": ["smart", "soreness", "acheness"],
	"painful": ["acheful", "hurting", "nasty", "sore", "harsh", "harrowing"],
	"paint": ["-"],
	"painting": ["-"],
	"palace": ["-"],
	"palate": ["roof of the mouth"],
	"pale": ["wall", "weir"],
	"paleolithic": ["-"],
	"palindrome": ["-"],
	"palisade": ["-"],
	"palliate": ["whitewash; ease", "soothe"],
	"pallid": ["ashen", "doughy", "mealy", "wan"],
	"palpitate": ["throb"],
	"pamphlet": ["flyer", "folder"],
	"panacea": ["-"],
	"pancreas": ["-"],
	"panda bear": ["-"],
	"pangolin": ["-"],
	"panic": ["fright"],
	"pant(aloon)s": ["breeches", "britches"],
	"pants, under-": ["undies", "underwear"],
	"paper": ["-"],
	"parable": ["likeness", "biword (Sir John Cheke)"],
	"parachute": ["-"],
	"paraclete": ["-"],
	"paradise": ["heaven", "the afterlife"],
	"paradisiacal": ["-"],
	"parallel": ["akin", "matching"],
	"paralysed(ysis)": ["lame(ness)", "lamed"],
	"paramour": ["lover"],
	"paranoia": ["-"],
	"paranoid": ["mad misgiver", "overmistruster"],
	"paraphrase": ["-"],
	"parasite": ["bloodsucker", "free rider"],
	"parasitism": ["bloodsucking", "freeriding"],
	"parasol": ["sunshade"],
	"parchment": ["bookfell"],
	"parent": ["elder; father or mother"],
	"parenting": ["elderhood", "child rearing", "raising children/a child"],
	"parenthesis": ["-"],
	"parents": ["elders", "folk"],
	"pariah": ["outcast", "castoff", "black sheep"],
	"parish": ["-"],
	"park": ["-"],
	"parliament": ["-"],
	"parrot": ["-"],
	"parsimonious": ["mean", "stinting", "tightfisted"],
	"parsley": ["-"],
	"part": ["split", "break", "sunder"],
	"partake": ["have"],
	"participate": ["-"],
	"participant": ["-"],
	"participle": ["-"],
	"particle": ["mote", "bit", "crumb", "mite", "nip", "shed; fleck", "flyspeck", "snip"],
	"particularly": ["namely", "above all", "all the more", "at length", "ever so", "in the main", "more than ever"],
	"partition": ["wall", "wough"],
	"partner": ["mate"],
	"party": ["gathering", "fungathering", "merrymaking", "bash"],
	"parvenu": ["upstart"],
	"pascal": ["-"],
	"pass": ["overtake"],
	"passage": ["path", "way", "pathway"],
	"passage of time": ["timeflow"],
	"passenger": ["faregoer"],
	"passive": ["idle"],
	"passport": ["-"],
	"past": ["bygone former", "last previous"],
	"pasta": ["noodle"],
	"pasture": ["grassland, lea, meadow"],
	"patella": ["kneecap"],
	"paternal": ["fatherly"],
	"paternoster": ["Our Father"],
	"pathetic": ["rueful", "ruthful"],
	"pathos": ["sadness"],
	"patience": ["forbearing"],
	"patient": ["forbearing"],
	"patria": ["homeland", "fatherland"],
	"patriarch": ["elder", "eldfather"],
	"patriarchy": ["-"],
	"patrician": ["-"],
	"patricide": ["-"],
	"patrimony": ["fathersland"],
	"patriotic": ["home-loving"],
	"patriotism": ["home-love"],
	"patron": ["backer", "bestower"],
	"patronage": ["business", "trade"],
	"pattern": ["cut", "doing", "doings", "folkway", "goings-on", "layout", "outline", "setting", "shape", "set-up", "warp & woof", "way", "ways", "weave", "web", "yardstick"],
	"pause": ["break", "let-up"],
	"paucity": ["lack", "fewness"],
	"pavement": ["sidewalk", "footpath", "walkway"],
	"pay": ["yield"],
	"payment": ["fee"],
	"peace": ["frith", "bliss"],
	"peaceful": ["-"],
	"peal": ["ring", "toll"],
	"pearl": ["-"],
	"peasant": ["churl", "boor", "yeoman", "husbandman", "landman"],
	"peculation": ["thefting"],
	"peculiar": ["freak", "unwonted"],
	"pedagogue": ["teacher"],
	"pedal": ["foot(ed)"],
	"pedantic": ["inkhorn(y)", "know-it-all,  nitpicking", "teachy;\nn: dryasdust"],
	"pedestal": ["-"],
	"pedestrian": ["walker"],
	"peel": ["rend", "skin", "shell", "tear", "pull off", "slough off"],
	"peep": ["cast", "eye\nslang: gander"],
	"pegasus": ["-"],
	"pejorative": ["slighting"],
	"pelican": ["-"],
	"pellucid": ["unclouded"],
	"pelt": ["fell", "hide"],
	"pen": ["marker"],
	"penchant": ["leaning", "fondness"],
	"pencil": ["-"],
	"penetrate": ["thrill", "bore"],
	"peninsula": ["arm", "foreland", "headland", "ness", "spit"],
	"pentagon": ["-"],
	"pentecost": ["Whitsunday"],
	"penultimate": ["last- but-one", "next-to-last", "forelast"],
	"penis": ["pintle", "yard"],
	"penitence": ["rueness (<OE hreonisse)", "ruefulness"],
	"penurious": ["stingy"],
	"people": ["folk; throng (group of people)"],
	"perceive": ["see", "smell", "smack", "fang", "wit", "witness; make out"],
	"percent": ["-"],
	"perception": ["insight", "grip", "hold"],
	"percolate": ["leach"],
	"perdition": ["forelornness"],
	"peregrine falcon": ["-"],
	"perfect": ["hone", "forfeit", "fullcome"],
	"perfidious": ["unfaithful", "untrustworthy"],
	"perforate": ["riddle", "thrill"],
	"perform": ["do forth", "do", "behave", "work", "play"],
	"perfume": ["-"],
	"perfunctory": ["halfhearted", "careless"],
	"period": ["while", "timespan", "time frame", "spell"],
	"perish": ["forfare", "forworth", "swelt (dialectal )"],
	"perjure": ["forswear", "lie under oath"],
	"perhaps": ["maybe", "mayhap"],
	"perimeter": ["brim", "hem", "rim", "skirt"],
	"permanent": ["everlasting"],
	"permission": ["letting", "leave", "green light"],
	"permit": ["green light", "leave", "let, go-ahead"],
	"pernicious": ["baleful", "baneful"],
	"pernio": ["chilblain"],
	"perpendicular": ["straight", "upright"],
	"perpetually": ["everlastingly", "aye", "unendingly"],
	"perpetuity, in": ["forevermore"],
	"perplex": ["bewilder", "bewonder"],
	"persecute": ["ail", " hound"],
	"persecution": ["witch hunt", "hounding"],
	"persistent": ["steadfast", "dogged", "bound", "fixed"],
	"person": ["being", "body", "fellow", "man", "soul", "wight", "bloke"],
	"personal": ["selfly", "monnly", "self", "own; inner", "innermost", "inmost; belittling; near"],
	"personality": ["egg", "mood", "selfhood"],
	"personnel": ["staff", "men", "ware"],
	"perspective": ["outlook"],
	"perspicacious": ["insightful", "keen", "shrewd"],
	"perspicacity": ["insightfulness", "keenness", "shrewdness"],
	"persuade": ["bring", "talk into", "win over"],
	"pertinacious": ["headstrong", "strong-willed"],
	"peruse": ["look through", "read through"],
	"pervade": ["-"],
	"perverse": ["-"],
	"pervert": ["-"],
	"petition": ["bene", "beseech", "beg", "ask"],
	"pet-name": ["nickname"],
	"petrify": ["-"],
	"petroleum": ["black gold"],
	"petulant": ["sour", "moody", "waspish"],
	"pessimism": ["naysaying", "gloomthinking"],
	"pessimistic": ["downbeat", "hopeless"],
	"phantasm": ["dream; shade", "shadow", "wraith"],
	"phantom": ["ghost"],
	"phalanx": ["-"],
	"pharisee": ["-"],
	"pharaoh": ["-"],
	"phenomenal": ["outstanding", "astounding"],
	"phenomenon": ["happening"],
	// "-philia": ["-lust"],
	"philistine": ["uncouth"],
	"philosophy": ["wisdom", "world outlook"],
	"phlebotomy": ["bloodletting"],
	"phloem tube": ["-"],
	"phobia": ["fear", "misfear", "fright", "dread"],
	"phobic": ["fearful"],
	"phosphorescent": ["-"],
	"phone": ["farspeaker"],
	"photograph": ["shot"],
	"photography": ["-"],
	"phrase": ["-"],
	"phylum": ["stem", "stock"],
	"physics": ["-"],
	"physical": ["bodily", "bodylike"],
	"pickaxe": ["pike"],
	"picture": ["-"],
	"picturesque": ["-"],
	"piece": ["bit", "snead"],
	"pier": ["landing", "wharf"],
	"pierce": ["bore", "hole; gore", "spear"],
	"pianoforte": ["-"],
	"pigeon": ["dove"],
	"pile": ["heap", "hill", "mound", "mow (hay)", "swath (corn)"],
	"pillage": ["sack"],
	"pillar": ["mast", "pole", "stake"],
	"pilot": ["lodeman", "skyship boss", "foreflyer", "loftman"],
	"pilot whale": ["-"],
	"pimple": ["wheal"],
	"piñata": ["-"],
	"pinch": ["nip", "squeeze", "steal", "scrimp", "nab"],
	"pine": ["fir", "firtree"],
	"pioneer": ["groundbreaker", "waymaker", "pathfinder"],
	"pioneering": ["groundbreaking", "waymaking"],
	"pious": ["godly"],
	"pip": ["seed; bee's knees", "day's eye"],
	"pipe": ["leat"],
	"pirate": ["-"],
	"pirate captain": ["-"],
	"pity": ["shame; kindheartedness", "ruth"],
	"pivotal": ["key"],
	"pizza": ["-"],
	"place": ["spot; berth: elbow room; dwelling", "fireside", "hearth; footing"],
	"place, special": ["-"],
	"placenta": ["-"],
	"plagiarism": ["thought-theft"],
	"plague": ["-"],
	"plan": ["layout", "outline", "draft"],
	"plank": ["board", "sill"],
	"plankton": ["-"],
	"planning": ["frame", "layout", "shape; look", "mean"],
	"planet": ["wanderstar", "world", "(heavenly) body"],
	"plant (fore-1066 latinate oe)": ["wort (herb", "grass or small plant)bloom (blossom", "flower)stand (plantation", "e.g. birchstand", "firstand)"],
	"plantation": ["-"],
	"plaster": ["stickum; besmear"],
	"plastic": ["-"],
	"plateau": ["dish; headland"],
	"plate of metal": ["-"],
	"platform": ["deck", "staddle; soapbox"],
	"platitude": ["hackneyed saying"],
	"pleasant": ["blessed", "darling", "dreamy", "good", "grateful", "heavenly", "sweet", "welcome"],
	"please": ["gladden", "queme"],
	"pleased": ["blissful", "thankful"],
	"pleasing": ["grateful", "welcome"],
	"pleasure": ["lust", "gladness"],
	"plebiscite": ["-"],
	"plectrum": ["-"],
	"pledge": ["swear", "sicker"],
	"plentiful": ["rife", "teeming", "manyful"],
	"plenty": ["-"],
	"plethora": ["overflow"],
	"-plex": ["-fold"],
	"plumage": ["feathers", "featherware", "hackles"],
	"plumber": ["-"],
	"plumbing": ["-"],
	"plumbline": ["-"],
	"plunge": ["dip", "dunk", "dive"],
	"plural": ["-"],
	"plutocracy": ["-"],
	"pluvial": ["rain"],
	"pneumatic": ["of a woman: shapely"],
	"poem": ["lay"],
	"poet": ["scop"],
	"poetry": ["-"],
	"point": ["tip", "tine", "nib\npoint out sth: betoken", "forewarn", "make smb aware of"],
	"poison": ["bane"],
	"pole (physics, geography)": [""],
	"polar (physics, geography)": [""],
	"polar zone": ["land of the midnight Sun"],
	"pole": ["-"],
	"polecat": ["-"],
	"polemic": ["rant"],
	"police": ["law"],
	"political": ["mootishparty: mootband"],
	"politician": ["lawmaker"],
	"politics": ["-"],
	"pollute": ["foul", "befoul"],
	"polycephaly": ["-"],
	"polygamist": ["-"],
	"polyglot": ["-"],
	"polygon": ["-"],
	"polyhedron": ["-"],
	"polytheism": ["-"],
	"pomegranate": ["-"],
	"pompous": ["showy", "overbearing; high-flown", "boastful"],
	"ponder": ["wonder", "eye", "think", "weigh", "wrestle with"],
	"pontoon": ["card game: twenty one"],
	"pony": ["-"],
	"poor": ["in need", "on the breadline; wretched", "ill-stared"],
	"pop (music)": ["folk"],
	"pope": ["Holy Father"],
	"popular": ["folkly"],
	"popularity": ["-"],
	"populate": ["-"],
	"population": ["-"],
	"population density": ["-"],
	"populous": ["-"],
	"porcine": ["pig", "boar", "hog", "swine", "sow", "yelt"],
	"porcupine": ["-"],
	"pore": ["hole", "hidehole", "skinhole"],
	"pork": ["pig"],
	"pornography": ["-"],
	"porous": ["holey", "seepsome"],
	"porpoise": ["mereswine"],
	"port": ["harbour", "haven"],
	"portable": ["-"],
	"portmanteau": ["-"],
	"portal": ["doorway", "gate", "gateway"],
	"portend": ["bode", "by-sen", "forerun", "ill-bode", "foreshadow", "forewarn"],
	"portent": ["-"],
	"portentous": ["doomy", "foreboding, ill-boding", "threatening; awesome", "stunning", "wonderful"],
	"portion": ["deal", "lot", "share", "dole"],
	"portrait": ["-"],
	"position": ["berth"],
	"positive (aspect)": ["upside"],
	"possess": ["own", "owe; devilsicken", "bewitch"],
	"possessed": ["devilsick", "owned", "ought", "owed", "own", "giddy", "bewitched", "deviltaken", "deviled (Sir John Cheke)"],
	"possession": ["ownership", "belonging", "ought"],
	"possibility": ["likeliness"],
	"possible": ["-"],
	"possibly": ["maybe", "likely"],
	"post-": ["after-"],
	"posterior": ["rump", "back(side)"],
	"posteriority": ["afterness"],
	"posterity": ["offspring"],
	"post-existence": ["afterlife", "afterbeing", "the beyond", "the great beyond", "the next world", "other world", "the great unknown"],
	"posthuman": ["-"],
	"posthumanism": ["-"],
	"postpone": ["forestall", "forslow", "put off", "call off"],
	"post script (p.s.)": ["afterthought"],
	"potassium": ["-"],
	"potato": ["spud", "tater", "tatty"],
	"potential": ["likely", "maybe"],
	"pouch": ["-"],
	"poultry": ["fowl"],
	"pour": ["teem"],
	"poverty": ["need", "want; dearth", "drought"],
	"powder": ["dust; beat", "crush", "grind"],
	"power": ["drive", "feed"],
	"power line": ["-"],
	"powerful": ["heavy", "mighty", "strong"],
	"practical": ["working; earthy", "down-to-earth"],
	"practically": ["about", "all-but", "fair", "fairly", "more or less", "nearly", "well-nigh"],
	"pragmatic": ["hardheaded", "down-to-earth"],
	"praise": ["-"],
	"pram": ["buggy"],
	"prayer": ["bead"],
	"prayerful": ["-"],
	// "pre-": ["fore-"],
	"preamble": ["foreword", "inleading", "forespell"],
	"precaution": ["forecare"],
	"precede": ["herald", "forerun"],
	"precinct": ["space: penpedestrian zone: walkway"],
	"precipitation": ["rainfall", "snowfall", "downsheet", "breefall"],
	"precious": ["dear", "dearworth", "dearworthly"],
	"preciousness,": ["dearworthiness"],
	"preclude": ["forestall", "foreclose"],
	"precocious": ["ahead"],
	"precognition": ["foreknowledge", "foreboding"],
	"precursor": ["forerunner", "forebear"],
	"predator": ["-"],
	"predecessor": ["forerunner; forebear", "forefather"],
	"predestination": ["wyrd", "doom"],
	"predetermine": ["foredoom"],
	"predicament": ["swamp", "catch 22", "sticky wicket"],
	"predict": ["foretell", "foresay", "foresee", "forecast", "soothsay"],
	"prediction": ["foretelling", "foresight", "foretelling", "forecast", "soothsaying"],
	"predominant": ["overweighing"],
	"pre-eminent": ["foremost"],
	"pre-existence": ["aforeness", "beforeness", "forebeing"],
	"prefabricated": ["ready-made", "ready-built", "forewrought"],
	"preface": ["foreword"],
	"prefer": ["-"],
	"prefigure": ["foreshadow", "foreshow"],
	"prefix": ["-"],
	"pregnant": ["-"],
	"prehistory": ["-"],
	"prejudice(al)": ["foredeem(ing)"],
	"prejudge": ["foredeem"],
	"prelude": ["foreword", "warm-up"],
	"premature": ["untimely"],
	"prematurely": ["beforehand", "oversoon"],
	"premeditated": ["forethought"],
	"premier": ["foremost"],
	"premise": ["given", "if; toft (building site')"],
	"premonition": ["forefeeling", "foreboding"],
	"preoccupy": ["-"],
	"preparation": ["-"],
	"prepare": ["taw", "fit", "fix", "groom", "lay", "ready; draft", "draw up", "frame; lay out"],
	"prepared": ["ready", "tawed", "neat"],
	"preposition": ["-"],
	"prepuce": ["foreskin"],
	"prescience": ["foreknowledge; farsightedness", "foresightedness", "forethought"],
	"prescient": ["farseeing", "farsighted", "forehanded", "foreseeing", "forethoughtful", "forward"],
	"prescribe": ["lay down"],
	"presence": ["sight; look", "outside"],
	"present": ["show", "give", "bestow"],
	"presentiment": ["forefeeling"],
	"preserve": ["forlast", "hain", "keep", "uphold", "aspare"],
	"preside": ["steward", "overlook"],
	"president": ["-"],
	"press": ["thring", "thrutch"],
	"pressure": ["-"],
	"presume": ["foreguess", "daresay"],
	"presumptuous": ["uppity", "overweening", "daring"],
	"presuppose": ["-"],
	"pretender": ["would-be"],
	"pretense": ["put-on", "show; high horse"],
	"pretentious": ["showy", "hoity-toity", "over the top", "kitsch"],
	"prevail": ["hold up", "keep up", "last"],
	"prevent": ["hinder", "forcome", "forbid", "forestop", "forestall", "forehinder"],
	"preview": ["forelook", "forepeek", "foreshow", "foreshowing"],
	"previous": ["former", "last", "latter", "foregoing", "earlier", "yester"],
	"previously": ["afore", "already", "before", "beforehand", "earlier", "formerly"],
	"prey": ["-"],
	"prima donna": ["leading lady"],
	"primacy": ["-"],
	"primary": ["foremost", "first", "erst"],
	"primer": ["-"],
	"primeval": ["hoary", "olden"],
	"prince": ["atheling"],
	"princess": ["-"],
	"principality": ["-"],
	"principle": ["main", "foremost", "first", "head"],
	"print": ["-"],
	"printing press": ["-"],
	"prior": ["before(hand)"],
	"priority": ["right-of-way"],
	"prism": ["block"],
	"prison": ["clink", "lockup"],
	"pristine": ["earliest", "firstness", "spotless", "yoreness", "orhood"],
	"private": ["hushed"],
	"privilege": ["right", "freedom"],
	"privileged": ["gifted"],
	"privy": ["outhouse"],
	"probable": ["likely"],
	"probably": ["likely", "in all likelihood", "maybe", "most likely", "belike"],
	"probity": ["uprightness"],
	"problem": ["worry", "kinch", "bugbear", "reck", "hang-up", "hitch", "snag", "rub"],
	"procedure": ["-"],
	"proceed": ["go forward", "go forth", "go on"],
	"proceeding": ["-"],
	"process": ["-"],
	"processor": ["computer: mainframe"],
	"proclivity": ["forelike", "forelove"],
	"procreate": ["beget", "breed"],
	"procure": ["-"],
	"product": ["ware"],
	"productive": ["waresome", "thrifty", "yoelding"],
	"prodigy": ["-"],
	"prodigal": ["spareless"],
	"produce": ["vb: beget", "breed", "bring about", "bring forth", "draw on", "work", "yield\nn: handiwork", "output", "thing", "work", "yield"],
	"production": ["yield", "output", "handiwork"],
	"proem": ["foreword"],
	"professional": ["worker"],
	"professor": ["lorespeaker", "loregiver"],
	"profit": ["gain", "boot", "yield", "winnings", "earnings"],
	"profitable": ["worthwhile"],
	"proficiency": ["skill"],
	"profound": ["underlying", "deep"],
	"profoundly": ["underlyingly", "deeply", "groundly"],
	"profusely": ["flow thickly", "running overly", "teemingly"],
	"profusion": ["beteeming"],
	"progenitor": ["begetter", "elder", "father", "forebear", "forefather", "fore-elder", "Forerunner"],
	"program": ["-"],
	"progress": ["inroads"],
	"progressive": ["forward", "late; broad-minded; cutting-edge"],
	"prohibit": ["forbid", "forfend"],
	"project": ["-"],
	"projector": ["beamer"],
	"prokaryote": ["-"],
	"prolific": ["fat", "lush", "rich"],
	"prologue": ["foretale"],
	"promise": ["behight", "swear; forebode"],
	"promontary": ["headland", "foreland", "ness", "hoe"],
	"promote": ["uprear", "(up)further", "boost"],
	"prone": ["given"],
	"pronghorn antelope": ["-"],
	"pronoun": ["-"],
	"pronounce": ["-"],
	"pronunciation": ["-"],
	"proof": ["witness"],
	"propel": ["thrust", "drive", "drive forth"],
	"proper": ["fitting", "meet", "seemly", "right", "true"],
	"property": ["ownings", "holdings; hallmark"],
	"prophesy": ["foresight", "boding", "foretelling", "soothsaying"],
	"prophet": ["seersoothsayer", "foresayer (Sir John Cheke)"],
	"proposal": ["forthput"],
	"propose": ["put forth", "forthsay"],
	"proprietor": ["householder", "owner", "landlord/lady"],
	"propulsion": ["thrust"],
	"proscribe": ["forbid"],
	"proselyte": ["freshman (Sir John Cheke)"],
	"prosopagnosia": ["-"],
	"prosper": ["thee"],
	"prosperity": ["theedom"],
	"prosperous": ["lush"],
	"prostitute": ["hooker", "whore", "streetwalker", "hustler"],
	"prostrate": ["aground"],
	"protarchaeopteryx": ["-"],
	"protect": ["ward", "shield", "forstand"],
	"protection": ["shield", "ward"],
	"protective": ["-"],
	"protector": ["warden"],
	"protégé": ["ward"],
	"protein": ["-"],
	"protest": ["uproar", "outcry\nwrangle", "gainsay"],
	"protestant": ["-"],
	"proton": ["-"],
	"protoplasm": ["-"],
	"protrude": ["stick out", "jut"],
	"proud": ["showy", "overbearing", "lofty", "stout"],
	"prove": ["show"],
	"proverb": ["byword", "saying", "saw", "folksay(ing)"],
	"provide": ["feed", "give", "hand over"],
	"province": ["-"],
	"prow": ["foreship"],
	"prudence": ["forewit", "sparefulness", "wariness", "wisdom"],
	"pry": ["1. key-hole 2. uproot"],
	"prying": ["key-holeing"],
	"pseudo-": ["fake", "-like"],
	"psychedelic": ["-"],
	"psychiatrist": ["shrink"],
	"psychiatry": ["-"],
	"psychic": ["-"],
	"psychologist": ["shrink"],
	"psychology": ["-"],
	"psychotropic": ["-"],
	"pub(lic house)": ["inn", "alehouse", "boozer"],
	"public": ["open", "mean"],
	"public servant": ["-"],
	"public toilet": ["-"],
	"publish": ["forthset", "bring out; forthsend"],
	"pulsate": ["beat", "throb"],
	"pulse": ["1. beat", "throb 2. bean"],
	"pumice": ["-"],
	"pumpkin": ["marrow"],
	"punch": ["clout"],
	"punish": ["-"],
	"pup": ["whelp"],
	"puppet": ["cat's paw"],
	"purchase": ["buy", "take"],
	"pure": ["clean", "sheer", "white"],
	"purgatory": ["-"],
	"purge": ["cleanse"],
	"purify": ["cleanse"],
	"purple": ["-"],
	"purpose": ["sake", "goal"],
	"pursue": ["follow", "shadow", "tail"],
	"pursuit": ["following", "shadowing", "tailing"],
	"purveyor": ["monger"],
	"push": ["shove", "thrust"],
	"pustule": ["pock"],
	"putrefaction": ["rot(ting)"],
	"pygmy": ["dwarf; Tom Thumb"],
	"pyromania": ["-"],
	"pyromaniac": ["-"],
	"pyrophobia": ["-"],
	"quadrupedal": ["four-footed"],
	"quadruple": ["fourfold"],
	"quadruplet": ["-"],
	"qualification": ["if"],
	"qualify": ["fit", "ready"],
	"quality": ["n: standing; hallmark\nadj: blue-chip, four-star, gilt-edged", "groovy", "keen", "lovely", "sterling", "tip-top", "topping", "wonderful\nslang: cool", "out-of-sight"],
	"quantity": ["boatload", "bunch", "bundle", "deal", "handful", "heap", "hundred", "lashings", "loads", "sheaf", "shipload", "stack", "wealth"],
	"quarry": ["stonepit", "stone-bed"],
	"quarter": ["fourth", "farthing"],
	"quartz": ["-"],
	"quasi-": ["almost", "nearly", "nigh-"],
	"quay": ["wharf"],
	"quest": ["fare", "hunt"],
	"question": ["ask", "bid"],
	"questionable": ["dodgy", "iffy", "shady", "shaky"],
	"queue": ["row", "line"],
	"qui pro quo": ["misunderstanding"],
	"quid pro quo": ["back-and-forth", "trade-off"],
	"quiet": ["hushed", "still; low-key; hidden", "sheltered"],
	"quieten": ["lull", "settle", "soothe", "still; hush"],
	"quince (fruit)": ["-"],
	"quintessential": ["-"],
	"quit": ["step down; give up", "knock off; forsake", "allay", "end"],
	"quite": ["altogether", "wholly; kind of", "more or less", "much", "fully", "even", "evenly"],
	"quotidian": ["daily"],
	"rabbit": ["hare", "coney"],
	"raccoon": ["washbear"],
	"race": ["kind", "stock"],
	"radar": ["-"],
	"radiant": ["shiny", "bright", "beaming", "glowing"],
	"radiate": ["shine", "gleam", "shed", "send out"],
	"radio": ["wireless (gadget)"],
	"radiotelegraphy": ["broadcasting"],
	"radius": ["-"],
	"rage": ["wrath"],
	"railroad": ["-"],
	"rancid": ["rotting", "reeking", "smelly", "stale", "foul", "dank", "rank", "taff"],
	"random": ["hit-or-miss", "slay", "may-fall", "pot shot."],
	"range": ["reach", "stretch"],
	"ranger": ["keeper", "warden", "overseer"],
	"rank": ["row", "standing,"],
	"rankle": ["gall", "irk"],
	"rape": ["-"],
	"rapid": ["fast", "quick", "speedy", "swift"],
	"rappel": ["abseil"],
	"rare": ["seldly", "seldom", "seldseen", "unlikely", "fewsome"],
	"rarely": ["seldom"],
	"rarified": ["fewsome", "thin"],
	"rarify": ["-"],
	"rarity": ["seldiness,seldomhood", "dearth", "fewness"],
	"raspberry": ["-"],
	"rate": ["speed,"],
	"rational": ["well-grounded"],
	"rationalism": ["-"],
	"ravage": ["-"],
	"ravine": ["chine", "gap", "ditch", "gulch", "ghyll"],
	"ray": ["beam"],
	"razor": ["shaver"],
	"re-": ["with-", "back-"],
	"realise": ["find out", "get on", "wise up, dawn upon"],
	"real": ["true", "heartfelt; weighty", "out-and-out"],
	"reality": ["being", "truth,"],
	"really": ["truly"],
	"realm (royal)": ["kingdom"],
	"realm": ["world", "land,"],
	"reason": ["grounds", "wherefore", "why\nvb: reckon", "make out", "work out\nfaculty:  mind", "brains", "understanding"],
	"reasonable": ["well-grounded"],
	"rebellion": ["outbreak", "uprising"],
	"rebuke": ["threap", "chide", "tick off; berate", "call down"],
	"recall": ["-"],
	"recapitulation": ["going over"],
	"receive": ["get", "win", "earn,"],
	"recently": ["lately", "newly"],
	"recite": ["yarn", "reel off"],
	"recline": ["lie back", "lie down", "stretch heel"],
	"recognise": ["acknowledge"],
	"recommend": ["-"],
	"recompense": ["-"],
	"reconsideration": ["afterthought"],
	"reconcile": ["key"],
	"reconciliation": ["-"],
	"record": ["log"],
	"recover": ["heal", "mend"],
	"recovery": ["comeback", "pick-up", "upwend", "upswing", "healing"],
	"recreation": ["1. fun and games"],
	"recriminate": ["-"],
	"recruit": ["fledgling", "freshman", "greenhorn", "newcomer"],
	"rectum": ["-"],
	"recurrence": ["comeback", "flashback"],
	"recurrent": ["on-and-off"],
	"redeem": ["gainbuy"],
	"redemption": ["-"],
	"red ochre (fe2o3)": ["-"],
	"reduce": ["lessen", "lower"],
	"redundance": ["-"],
	"refer (to)": ["-"],
	"referendum": ["-"],
	"refined": ["trim", "couth"],
	"reflect": ["show"],
	"reflection": ["glance", "backshine"],
	"reform": ["mend", "shape up", "straighten"],
	"reformer": ["-"],
	"refractory": ["froward", "wayward", "willful"],
	"refrain": ["forbear"],
	"refrigerator": ["-"],
	"refuge": ["haven", "bolt-hole", "harbour"],
	"refugee": ["runaway"],
	"refulgent": ["shining"],
	"refurbish": ["overhaul"],
	"refuse": ["spurn", "withhold"],
	"refute": ["belie"],
	"regard": ["cast", "eye", "peep"],
	"regarding": ["about", "as for", "as to"],
	"regenerate": ["freshen"],
	"regicide": ["-"],
	"regime": ["yoke", "rike"],
	"regiment": ["-"],
	"region": ["field; land", "neck"],
	"regret": ["rue"],
	"regular": ["everyday; steady"],
	"regulate": ["oversee", "wield", "rule"],
	"regulation": ["wielding", "overseeing", "rule", "law"],
	"regulator": ["overseer"],
	"reign": ["rule"],
	"reinforce": ["strengthen", "trim", "gird", "bolster", "harden up", "uphold", "make firm", "underset"],
	"reject": ["n: castoff", "outcast\nvb: nix; cast off", "dump", "fling off/away", "slough off", "throw away", "toss", "unload; spurn"],
	"rejuvenate": ["-"],
	"relapse": ["backslide"],
	"relate": ["bond", "click; link"],
	"related": ["akin (to)", "kindred", "sibbed to", "tosameness"],
	"relative": ["kin", "kindred", "kinfolk", "kinsmen", "kinship", "sib", "sibling", "bysib", "own flesh & blood"],
	"relations": ["dealings", "bond", "link up", "hook up", "tie up", "fellowship"],
	"relationship": ["kinship", "bearing; hookup", "linkup", "tie-up"],
	"relax": ["chill (out)", " loosen up", "mellow out", "unwind; ease", "loosen", "slack"],
	"relaxation": ["fun and games; ease"],
	"relaxed": ["smooth", "loose", "mellow"],
	"release": ["free", "let go", "loosen"],
	"reliable": ["trustworthy"],
	"relieve": ["lighten", "soothe", "unburden", "allay", "still (the fears)", "salve"],
	"religion": ["worship", "troth"],
	"religious": ["worshipful"],
	"relinquish": ["cough up", "give up", "hand over", "yield; step down"],
	"reluctant": ["chary", "unwilling", "loath"],
	"remain": ["stay"],
	"remainder": ["-"],
	"remains": ["ashes", "rubble", "wreck; bones", "stiff; leavings", "leftovers", "odds and ends"],
	"remedy": ["heeling", "salve", "boot (etymology 3)"],
	"remember": ["hark back", "mind", "think of\nmemorize: bear in mind"],
	"remind": ["-"],
	"reminder": ["-"],
	"reminisce": ["-"],
	"remnant": ["leftover"],
	"remote": ["slight", "slim", "small; cold-eyed", "stadoffish; hidden; deep", "far-flung"],
	"remove": ["foredo (with immaterial object)", "unstay", "take out", "draw out"],
	"renaissance": ["-"],
	"renal": ["kidney"],
	"rename": ["-"],
	"render": ["cough up", "give up", "hand over", "yield"],
	"renew": ["-"],
	"renewal": ["-"],
	"renewed": ["-"],
	"renounce": ["give up", "forsake", "step aside", "step down; foreswear", "take back", "unsay", "withdraw"],
	"renovate": ["fix Old French"],
	"reorganize": ["-"],
	"repartee": ["backchat"],
	"repeat": ["-"],
	"repel": ["beat off", "withdrive; buck", "withstand"],
	"repent": ["bemoan", "rue"],
	"repercussions": ["-"],
	"repetition": ["-"],
	"replace": ["-"],
	"replenish": ["fill up"],
	"reply": ["answer"],
	"report": ["-"],
	"repose": ["rest"],
	"reprehensible": ["-"],
	"represent": ["stand for", "betoken"],
	"representative": ["spokes(wo)man"],
	"repress": ["crack down on", "crush", "slap down", "snuff out; hold back", "sink", "swallow"],
	"reprimand": ["upbraid", "tell off"],
	"reprove": ["chide", "tick off: mislike", "tut over"],
	"reproach": ["bawl out", "berate", "call down", "flay", "rag", "upbraid: chide", "tick off"],
	"reptile": ["-"],
	"republic": [""],
	"reputation": ["mark", "name"],
	"request": ["ask", "put in: beseech", "call for", "seek", "plead for"],
	"require": ["need", "tharf"],
	"requirement": ["need", "must"],
	"rescribe": ["write back"],
	"rescue": ["free", "bring off"],
	"research": ["dig into, look into", "delve into"],
	"resemblance": ["alikeness", "look", "blee", "bly"],
	"resemble": ["seem like", "look like"],
	"resentment": ["down; huff", "miff"],
	"reservation": ["booking"],
	"reserve": ["spare"],
	"reserved": ["character: withdrawnbooked"],
	"reservoir": ["-"],
	"reside": ["live", "dwell"],
	"residence": ["home", "dwelling"],
	"residue": ["ashes", "rubble", "wreck; leavings", "leftovers", "odds and ends"],
	"resign": ["step down", "forlet", "bow out"],
	"resilient": ["springy", "limber"],
	"resist": ["withset", "withstand", "hinder", "stand up to"],
	"resistance": ["withsetting"],
	"resolute": ["set"],
	"resort": ["-"],
	"resource": ["-"],
	"respect": ["heed"],
	"respond": ["answer"],
	"response": ["answer", "feedback"],
	"responsible": ["trustworthy", "upstanding", "bedrock", "sound"],
	"responsive": ["quick", "awake", "sharp", "open-minded", "quick-minded", "willing", "answering"],
	"rest (else)": ["-"],
	"restart": ["-"],
	"restaurant": ["cheap: beanery\nfoodhouse"],
	"restore(ation)": ["freshen(ing)"],
	"restored to life": ["-"],
	"restrain": ["bridle", "fetter"],
	"restraint": ["bridle", "fetter"],
	"result": ["outcome", "outfollow", "upshot", "aftermath"],
	"resurrect": ["gainrise (Cheke)"],
	"resurrection": ["gainrising (Cheke)"],
	"retail": ["deal in", "sell", "put up"],
	"retain": ["keep", "withhold; hire"],
	"retaliate": ["hit back", "strike back", "take an eye for an eye"],
	"retard": ["break", "slacken"],
	"retardation": ["-"],
	"retirement": ["-"],
	"retort": ["yieldback", "wisecrack", "backlash"],
	"retract": ["take back", "withdraw"],
	"retreat": ["withdraw"],
	"retrograde": ["backward"],
	"return": ["-"],
	"reveal": ["bare", "unsheath"],
	"revel": ["bathe", "wallow", "frolic"],
	"revelry": ["merry-making"],
	"revenant": ["-"],
	"revenge": ["wrack", "wreak"],
	"revere": ["worship"],
	"reverend": ["hallowed"],
	"reverie": ["daydreaming", "woolgathering"],
	"reverse/reversal": ["knock", "setback; flip-flop"],
	"revert": ["-"],
	"revive": ["freshen"],
	"revolution": ["-"],
	"revolve": ["spin"],
	"reward": ["-"],
	"rhetoric": ["wind"],
	"rhinoceros": ["-"],
	"rhyme": ["rime"],
	"rhythm": ["riff"],
	"ridiculous": ["chucklesome", "sidesplitting"],
	"rifle": ["-"],
	"righteous(ness)": ["-"],
	"rigid": ["stiff", "hard"],
	"rigorous": ["thorough"],
	"riot": ["-"],
	"risk": ["gamble", "long shot"],
	"risky": ["gamblesome"],
	"river": ["ea", "aa"],
	"rite": ["-"],
	"river course": ["flow"],
	"rivulet": ["brook", "stream", "runnel", "rith", "sike\nrindle small water course or gutter"],
	"rob": ["sneaky filch\nviolent reave"],
	"robbery": ["sneaky filching\nviolent reaving"],
	"robin": ["redbreast"],
	"robust": ["fit", "hale", "hearty", "sound", "whole; flush", "lusty, ful-blooded: big", "full", "plush", "rich; strong"],
	"rocket": ["-"],
	"rodent": ["gnawer"],
	"role": ["playwork", "deedwork"],
	"roll": ["onspin"],
	"roman": ["-"],
	"romanticism": ["-"],
	"rooster": ["cock"],
	"rose (flower)": ["-"],
	"rotate": ["spin"],
	"rotund": ["wheelshaped"],
	"round": ["wheelshaped"],
	"route": ["pathway"],
	"royal": ["kingly", "cweenly"],
	"royalty": ["kingship"],
	"rude": ["unbehaved"],
	"ruin": ["wreck", "mar", "downfall"],
	"rule": ["lead", "look over", "oversee", "oversee", "rix (att'd <OE rīxian", "rīcsian)"],
	"ruler": ["drighten", "leader"],
	"ruling": ["leading", "lordly"],
	"rumour": ["hearsay"],
	"rural": ["outburg", "fieldly"],
	"rush": ["hurry"],
	"russia": ["-"],
	"rustic": ["backwoodsman", "boor", "bumpkin", "bushwhacker", "clodhopper", "churl", "crofter", "greenhorn", "hayseed", "hind", "hillbilly", "husbandman", "plowman", "redneck", "share-cropper", "swain", "woodsman"],
	"sabotage": ["cripple", "undermine"],
	"saboteur": ["-"],
	"sacred": ["holy", "hallowed"],
	"sacrament": ["holy oath", "holy undertaking", "hallowing"],
	"sacrifice": ["give", "give up,"],
	"sacrilege": ["unholiness"],
	"sacrilegious": ["unholy", "sinful"],
	"sacrosanct": ["holy", "hallowed"],
	"sadism": ["fiendishness", "heartlessness"],
	"sadistic": ["heartless"],
	"safe": ["sound", "fast; white; trusty", "good"],
	"safety": ["shelterness", "wholeness", "soundness"],
	"sagacious": ["insightful, wise, witty"],
	"saint (st.)": ["Holy"],
	"saint": ["-"],
	"salmon": ["-"],
	"salamander": ["-"],
	"salary": ["earnings", "income", "salt"],
	"salutary": ["friendly", "good", "helpful", "kindly; good", "healthy", "wholesome"],
	"salutation": ["greeting", "welcome", "hail"],
	"salvation": ["lifeline"],
	"salvo": ["unload", "outburst"],
	"samurai": ["-"],
	"sanctify": ["hallow"],
	"sanctuary": ["haven", "grith", "holyroom", "hallow", "holystead", "frithhouse", "frithstow"],
	"santa claus": ["Father Christmas"],
	"sapient": ["aware"],
	"sasquatch": ["Bigfoot"],
	"satanism": ["-"],
	"satchel": ["knapsack", "rucksack"],
	"satellite": ["moon"],
	"satiate": ["fulfill", "quench", "slake"],
	"satire(ist)": ["heaning", "heancraft(er)", "heanwriting(er)"],
	"satisfaction": ["gladness"],
	"satisfy": ["gladden", "slake", "fulfill", "sate", "quench"],
	"saturate": ["sop", "soak", "steep"],
	"saturday": ["-"],
	"sauce": ["dip"],
	"sauerkraut": ["-"],
	"sauna": ["steam room"],
	"sausage": ["pudding", "banger"],
	"savage": ["wild; wilder"],
	"save": ["keep", "store", "spare,"],
	"saviour": ["-"],
	"savory": ["-"],
	"scale": ["climb"],
	"scalpel": ["-"],
	"scapegoat": ["-"],
	"scar": ["blight", "blotch", "flaw", "pockmark, wale", "weal", "wheal", "wen", "welt"],
	"scarabaeus stercoreous": ["-"],
	"scarce": ["light", "sparing; lacking", "low", "shy", "wanting"],
	"scarcely": ["barely", "hardly", "narrowly", "slightly"],
	"scarcity": ["lack", "shortness", "seldomness", "fewness", "dearth"],
	"scarlet": ["-"],
	"scatophilia": ["-"],
	"scatter": ["broadcast", "cast", "deal out", "go-off", "go through", "let go", "oversow", "overspread", "put to flight", "spread", "strew"],
	"scene": ["background", "setting; blowup", "fireworks; footing"],
	"schizoid": ["-"],
	"schizophrenia": ["-"],
	"scholar": ["learner"],
	"scholarship": ["knowledge", "learning"],
	"science": ["lore", "wisdom"],
	"scientist": ["-"],
	"scientific": ["-"],
	"scientific language": ["-"],
	"scintillate": ["sparkle", "flash", "shine", "leam"],
	"scissors": ["-"],
	"-scope": ["-"],
	"scorpion": ["-"],
	"scout": ["pathfinder"],
	"scowling": ["-"],
	"screen": ["-"],
	"scrotum": ["ballsack"],
	"scrutinize": ["overlook"],
	"search": ["seek", "rake", "comb", "delve", "hunt"],
	"search word": ["-"],
	"season": ["time", "tide"],
	"sebum": ["tallow"],
	"secede": ["leave", "withdraw", "cleave", "sunder", "split off"],
	"secession": ["withdrawal", "breakaway", "parting", "breakup", "cleaving", "sundering", "splitting off"],
	"secessionist": ["-"],
	"second": ["-"],
	"secret": ["adj: dern", "hidden", "withdrawn", "unseen", "inward", "stealthy", "untold", "unbeheld", "underground", "underhanded", "hushhush", "inly                 \nn: dern"],
	"secret society": ["-"],
	"secretary": ["-"],
	"secrete": ["seep", "leak", "ooze"],
	"sect": ["block", "body"],
	"secular": ["worldhood"],
	"secularise/-ize": ["-"],
	"secure": ["bulwark", "shield", "ward; ice; fix", "more", "set"],
	"sediment": ["dregs", "silt", "draff", "dross"],
	"seduce": ["fortee", "lead on"],
	"segregation": ["-keeping/holding/setting apart"],
	"seize": ["hold", "hend", "clutch", "take"],
	"seizure": ["fit"],
	"select": ["choose", "pick", "wale"],
	"self-esteem": ["self-worth"],
	"semester": ["sixmonth", "half-year"],
	"seminar": ["workshop"],
	"sempiternity": ["-"],
	"semi-": ["half-", "sam-/sand-/some- (<OE sam-)"],
	"senate": ["-"],
	"senator": ["-"],
	"senile": ["doddery", "doddering", "elderly", "old", "doted"],
	"senior citizens": ["elderly", "old folks", "eldfolk", "eldman"],
	"sensate": ["feeling"],
	"sensation": ["1. feeling"],
	"sensational": ["amazing"],
	"sense": ["feel"],
	"sensible": ["-"],
	"sensitive": ["feeling", "keen", "sharp"],
	"sentence": ["doom"],
	"sententious": ["pithy"],
	"sentience": ["awareness"],
	"sentiment": ["feeling", "thought"],
	"separate": ["sundry", "freestanding", "sunderedcleave", "cloven"],
	"separation": ["splitting"],
	"september": ["-"],
	"septuagesima": ["-"],
	"sequence": ["aftermath", "backwash", "child", "outcome", "outgrowth", "upshot; string; setup"],
	"sequential": ["back-to-back", "straight", "through"],
	"series": ["line", "stream"],
	"serious": ["earnest", "unfunny", "heavy", "weighty"],
	"seriously": ["earnestly", "thoroughly", "wholeheartedly", "with heart & soul", "willingly", "agoodly", "weightily"],
	"serpent": ["snake"],
	"servant": ["housekeeper", "maid (fm.)", "dey (fm.)", "bondsman", "loaf-eater", "knight", "shalk", "boy\nthane (<OE þegn)"],
	"serve": ["help", "dish", "hye"],
	"service": ["-"],
	"session": ["sitting", "stint"],
	"several": ["sundry"],
	"severe": ["stern", "hard", "harsh", "tough", "thorough"],
	"severely": ["hardly", "roughly", "sternly", "stiffly;"],
	"sewer": ["drain", "sieve"],
	"sex": ["folkhalf"],
	"sex act": ["-"],
	"sexual reproduction": ["breeding"],
	"sexy": ["hot"],
	"shantytown": ["tinstow", "hutstead", "slum"],
	"shark": ["-"],
	"shingles": ["tetter"],
	"shrapnel": ["-"],
	"siege": ["(um)beset"],
	"sign": ["-"],
	"signal": ["beckon"],
	"significantly": ["weightily"],
	"'signification": ["drift"],
	"signify": ["betoken", "mean"],
	"silence": ["stillness"],
	"silent": ["still"],
	"silhouette": ["outline", "shadow"],
	"silicic acid": ["-"],
	"similar(ly/ity)": ["like(wise)", "alike(ness)", "same(wise)", "likekind"],
	"simple": ["straightforward", "fewfold", "onefold"],
	"simpleton": ["half-wit", "gowk"],
	"simultaneously": ["at once", "with"],
	"single": ["lone", "alone", "one", "unwed", "by itself"],
	"single out": ["key in on"],
	"sinister": ["ill-boding", "boding evil", "foreshadowing darkness", "forbidding", "threatening", "black", "black-in-deed"],
	"site": ["put"],
	"situation": ["onstand", "setting", "stand", "footing"],
	"size": ["bulkness", "bigness"],
	"skeleton": ["framework"],
	"sketch": ["draw", "inword", "write"],
	"ski (c. 1755 norwegian loanword)": ["-"],
	"skunk": ["-"],
	"slander": ["-"],
	"slanderer": ["-"],
	"slash": ["-"],
	"slave": ["bondman"],
	"slave driver": ["-"],
	"slavery": ["bondage"],
	"sluggard": ["slug", "slacker", "sloth", "slouch", "loafer", "bum", "deadbeat", "do-nothing", "idler", "sleepyhead", "drone"],
	"smartphone": ["-"],
	"snooping": ["key-holeing"],
	"soccer": ["football"],
	"socialism": ["-"],
	"socialist": ["-"],
	"socialize": ["chat", "hobnob"],
	"society": ["guild", "fellowship", "folkset"],
	"sociology": ["-"],
	"sofa": ["-"],
	"soil": ["earth", "ground", "dirt", "mold"],
	"solar": ["-"],
	"soldier": ["-"],
	"sole": ["-"],
	"solemn": ["heavy"],
	"solicit": ["seek", "tout", "bead"],
	"solid": ["-"],
	"solitary": ["lonesome", "alone"],
	"solitude": ["onesomehood", "loneliness", "aloneness", "lonehood"],
	"solstice": ["sunstead (<OE sunstede)"],
	"solution": ["answer"],
	"somnolent": ["drowsy", "sleepy", "yawny", "weary", "heavy-eyed", "half-asleep", "sloomy"],
	"sophisticated": ["worldly"],
	"soporific": ["drowsy", "sleepy"],
	"sordid": ["bedraggled", "befouled", "begrimed", "bemired", "besmirched", "black", "blackened", "cruddy", "dingy", "draggled", "dusty", "filthy", "foul", "grimy", "grotty", "grubby", "grungy", "mucky", "muddy", "nasty", "smudged", "smutty", "stained", "sullied", "unclean", "uncleanly; dirty", "low", "low-down", "low-minded", "mean", "nasty", "snide", "wretched"],
	"sorority": ["sisterhood"],
	"sort": ["kind"],
	"sort of": ["somewhat", "kind of"],
	"sound": ["-"],
	"soup": ["bree", "broth"],
	"source": ["cradle", "root", "seedbed", "spring", "well", "wellspring"],
	"souvenir": ["keepsake", "token"],
	"space": ["elbow room", "way; bit", "spell", "stretch; leeway", "stead", "stow", "room"],
	"spacious": ["roomy", "gapful"],
	"spade": ["sword", "sull-blade"],
	"spaghetti": ["strings (calque from original word", "plural of \"spaghetto\"", "meaning string)"],
	"spam": ["trashmail"],
	"spasm": ["throe", "pang"],
	"spastic": ["catchy", "choppy", "spotty", "unsteady"],
	"spatialize": ["-"],
	"special": ["alone", "lone", "one", "one-off; beloved", "dear", "fair-haired", "dond", "loved", "sweet", "white-headed; set"],
	"species": ["kind", "set; breed", "feather", "ilk", "kidney", "kind", "like", "manner", "strain"],
	"specific(ally)": ["set"],
	"specified": ["hone", "spell out"],
	"specify": ["lay down"],
	"specious": ["misleading"],
	"spectacle": ["sight"],
	"spectacles": ["eyeglasses", "glasses"],
	"spectator": ["bystander", "onlooker", "watcher"],
	"spend(ing)": ["drop", "fork out", "give", "lay out; outlay", "shell out; burn", "drain", "draw down", "play out; blow", "fiddle away", "lose", "misspend", "run through", "through away"],
	"speleothem": ["-"],
	"sphere": ["game", "kingdom", "line", "walk; sun\nshape ball"],
	"spice": ["-"],
	"spine": ["backbone"],
	"spiral": ["vb: twine", "twistn: whirladj:screwlike", "winding"],
	"spirit": ["1.geist (The spirit of an individual or group. OED)", "ghost (as in 'Holy Ghost'", "\"Holy Spirit\")\nwraith (as in specter)\n2. heart", "keenness", "might"],
	"spiritual": ["bodiless"],
	"spirituality": ["church", "cloth"],
	"spleen": [""],
	"splendour": ["-"],
	"splenetic": ["bloody-tempered"],
	"spoil": ["rot", "mar"],
	"sponge": ["verb: soak"],
	"sponsor": ["backer"],
	"spontaneous": ["knee-jerk"],
	"spool": ["reel"],
	"sports": ["games"],
	"sporty": ["-"],
	"spouse": ["helpmeet", "helpmate", "mate"],
	"sprachbund": ["speechband"],
	"spurious": ["sham", "snide; mock", "put-on", "strained; misbegotten"],
	"spy": ["eavesdropper", "watchman", "eye", "misleader", "onlooker"],
	"square": ["vb:answer", "dovetail", "fit", "go", "tally; buy", "haveadj:evenminded"],
	"squeamish": ["ill", "sick"],
	"squid": ["inkfish"],
	"squirrel": ["-"],
	"stable": ["selfstanding", "upright", "staddlefast", "steadfast"],
	"stack": ["heap"],
	"stagnant": ["forstilled", "gone orf", "still", "unflowing"],
	"stain": ["spot", "fleck", "blot"],
	"stainless steel": ["-"],
	"stampede": ["headlong rush", "wild flight", "stamping", "stampet (stamp + -et)"],
	"stanch/staunch": ["stem", "halt"],
	"standard": ["set way (of)", "benchmark"],
	"standardize": ["-"],
	"state": ["say", "foresay"],
	"stateless": ["-"],
	"station": ["house", "stead", "stell", "stopstead"],
	"statism": ["-"],
	"statistical": ["-"],
	"status": ["standing"],
	"status quo": ["as was"],
	"stellar": ["star (in compounds)", "starly"],
	"stelliferous": ["starry", "star-filled"],
	"sternum": ["breastbone"],
	"stimulate": ["kittle", "whet", "quicken"],
	"stingray": ["-"],
	"stipulate": ["-"],
	"stomach": ["belly", "midriff", "riff", "mawvb: bear", "abide", "brook", "handle", "meet", "sweat-out", "wear"],
	"stop": ["halt"],
	"store": ["keep", "hoard"],
	"story": ["tale", "yarn"],
	"strange": ["far-out", "offbeat", "off-the-wall", "out-of-the-way", "way-out", "wild; outlandish; unheard-of; weird"],
	"strangle": ["choke", "throttle"],
	"stratagem": ["wile"],
	"strict(ly)": ["narrow(ly)"],
	"structure": ["frame", "framework", "shapework", "brandrod"],
	"struggle": ["camp", "clash", "unfrith", "fight", "strithe", "strout"],
	"student": ["learner"],
	"studio": ["workroom", "workfloor"],
	"study": ["alog", "learn", "con"],
	"stuff": ["pack"],
	"stupefy": ["amaze", "bewilder"],
	"stupid": ["dumb", "dull", "dim", "daft", "dumheaded"],
	"stuttgart": ["-"],
	"stylish": ["trim", "dapper"],
	"styria(an)": ["-"],
	"subconscious": ["undermind"],
	"subdue": ["overcome", "quell", "tame"],
	"sublime": ["awesome", "lofty", "lordly"],
	"subliminal": ["-"],
	"submarine": ["U-boat"],
	"subordinate": ["underling"],
	"subjugate(tion)": ["yoke"],
	"submerge": ["whelm", "overwhelm", "dip", "dunk"],
	"submission": ["yielding", "underbringing", "underwilling"],
	"submissive": ["weak", "yieldly", "underwillful"],
	"submit": ["yield", "buckle", "abow", "underwill", "give in", "bend to; put forward", "bring before", "set down"],
	"subsequent": ["following", "later"],
	"subsequently": ["afterward", "thereafter (formal)"],
	"substance": ["pith\nwerewithal", "worth"],
	"substantial": ["big", "earth-shaking", "meaningful"],
	"substitute": ["backup", "fill-in"],
	"subterranean": ["underground"],
	"subtract": ["take away", "withdraw"],
	"suburbs": ["outskirts"],
	"subvert": ["cheapen"],
	"succeed": ["come off", "work out"],
	"success": ["speed"],
	"successful": ["speedful", "booming"],
	"successive": ["back-to-back"],
	"successor": ["aftercomer", "afterfollow"],
	"succour": ["-"],
	"succumb": ["die", "yield", "give in"],
	"sudden": ["headlong", "hasty", "swift; unforeseen", "unlooked-for"],
	"suddenly": ["straightaway", "swiftly"],
	"suet": ["tallow", "wightfat"],
	"suffer": ["bear", "undergo", "stand", "put up with", "live through", "given to", "abide", "brook", "not forbid", "adree"],
	"suffice": ["be enough", "answer", "do"],
	"sufficient": ["fuldoing", "enough"],
	"suffix": ["endfastening"],
	"suffocate": ["choke", "achoke", "throttle", "smother", "stop the breath"],
	"sugar": ["-"],
	"suicide": ["selfslaughter", "selfkilling", "selfmurder"],
	"suit": ["befit", "beseem", "fit"],
	"suitable": ["seemly", "fitting", "becoming", "comely"],
	"sullen": ["sulky"],
	"sulphur": ["-"],
	"sulphuric acid": ["-"],
	"sulphurous": ["-"],
	"summary": ["outline", "rundown"],
	"summit": ["peak", "top", "brow", "cop", "knap"],
	"summons": ["draw on", "call for"],
	"superficial": ["shallow", "skin-deep"],
	"superfluous": ["overmuch", "overneeded", "more than is needed", "unneeded"],
	"superior": ["better", "higher", "oversome", "overling", "chest beating", "greater"],
	"superiority": ["higherness", "betterhood", "betterness", "oversomeness", "overmight", "overlayingness"],
	"supernatural": ["otherwordly"],
	"superstition": ["-"],
	"superstructure": ["overworks"],
	"supervise": ["handle", "head", "overlook; steward; care for", "mind", "oversee", "watch"],
	"supervisor": ["overseer", "foreman", "overlooker"],
	"supple": ["nimble", "lithe", "limber"],
	"supplement": ["eke"],
	"supplies": ["bearings", "gear", "faregoods", "trekgoods"],
	"supply": ["bear", "keep full", "fill up", "give", "hand over"],
	"support": ["underhold", "undergird", "prop", "crutch", "backup", "staddle"],
	"suppose": ["call", "guess", "put", "deem", "make", "gather; feel", "hold"],
	"supposed to": ["meant to"],
	"suppress": ["dampen", "hold down", "keep in", "crush", "quell", "underthrutch", "stifle", "smother"],
	"supremacy": ["overship"],
	"supreme": ["uppermost", "over all", "above all", "highest", "best", "utmost"],
	"supreme power": ["-"],
	"sure": ["Iwis"],
	"surface": ["topside", "skin", "husk"],
	"surgery": ["fleshwork", "cutwork"],
	"surname": ["aftername", "byname", "lastname"],
	"surpass": ["overtake", "outdo", "beat", "draw away", "overstride"],
	"surplice": ["nightshirt", "sark"],
	"surplus": ["overmuch"],
	"surprise": ["take aback", "strike with wonder", "floor", "waylay", "come upon", "take unaware", "fall upon"],
	"surprising": ["eye-opening", "stunning; unforeseen"],
	"surrender": ["yield; bow", "knuckle under"],
	"surround": ["hem", "gird", "bego", "beset"],
	"surrounded": ["hemmed", "umbset", "begone", "girded", "beset"],
	"surrounding": ["hemming"],
	"survey": ["overlook"],
	"survive": ["ride out", "weather"],
	"suspend": ["hang", "(ban) undershut", "stop"],
	"suspense": ["deep freeze"],
	"suspicion": ["misgiving", "underfeel", "inkling"],
	"suspicious": ["shady", "queer", "mistrustful", "misdeemful", "guessing"],
	"sustain": ["keep going", "bear", "bolster", "uphold"],
	"sustenance": ["food"],
	"svelte": ["slim"],
	"swastika": ["-"],
	"sweet potato": ["-"],
	"swiss": ["-"],
	"sycophant": ["-"],
	"syllable": ["-"],
	"symbol(ise)": ["(be)token"],
	"sympathy": ["feeling; ruth"],
	"symphony": ["-"],
	"symptom": ["betokener", "forerunner"],
	"synchronicity": ["-"],
	"synchronize(d)": ["match", "play together"],
	"syncopate(tion)": ["withdraw(ing)", "withhold", "withstrike", "shift"],
	"synonym": ["-"],
	"synopsis": ["outline"],
	"synthetic": ["man-made"],
	"syphillis": ["great pox"],
	"syphon": ["draw from", "draw out", "suck out"],
	"system": ["framework", "make-up", "set-up"],
	"tabernacle": ["-"],
	"table": ["board; listing", "spreadsheet"],
	"taboo": ["ban", "out"],
	"tacit": ["unspoken", "wordless", "understood"],
	"taciturn": ["tight-lipped"],
	"tactics": ["how", "way"],
	"tailor": ["fit", "put", "shape"],
	"talkative": ["talksome", "chatty", "gabby", "outspoken", "long-winded"],
	"tank": ["pond", "pool", "vat"],
	"target": ["goal", "mark"],
	"task": ["char; errand", "undertaking"],
	"taste (sense)": ["smack; fondness"],
	"taste": ["smack", "smatch"],
	"tautology": ["-"],
	"tattoo": ["-"],
	"tavern": ["alehouse"],
	"tax": ["geld"],
	"taxation": ["-"],
	"taxman": ["toller"],
	"tea": ["-"],
	"technical": ["craftly (Barnes)"],
	"technical language": ["-"],
	"technically": ["lorewise"],
	"technology": ["-"],
	"tedious": ["dreary", "leaden", "humming"],
	"telegram": ["-"],
	"telegraph": ["-"],
	"telepathy": ["mindreading"],
	"telephone": ["farspeaker"],
	"telescope": ["-"],
	"television": ["-"],
	"televisual": ["-"],
	"temper": ["vb: moodn: anneal"],
	"temperament": ["-"],
	"temperate": ["mild"],
	"temperate zone": ["-"],
	"temperature": ["-"],
	"tempest": ["storm"],
	"tempestuous": ["blood-and-guts", "hammer-and-tongs", "stormy"],
	"temple": ["-"],
	"temporal": ["earthborn", "earthbound", "freshly", "worldly"],
	"temporary": ["flash", "short-lived"],
	"tempt": ["whet"],
	"temptation": ["-"],
	"tenacious": ["dogged; clingy"],
	"tend": ["tilt towards", "lean", "slant", "look after"],
	"tendon": ["sinew"],
	"tenebrous": ["dark", "gloomy", "thester"],
	"tense": ["edgy", "uptight; hairy", "nail-biting"],
	"tent": ["roof"],
	"tepid": ["halfhearted; lukewarm"],
	"term": ["name", "word"],
	"terminal": ["rearmost"],
	"terminate": ["end (Barnes)"],
	"terminology": ["wording (Barnes)"],
	"terminus": ["end"],
	"termite": ["white ant"],
	"terrible": ["dreadful", "fearsome", "frightening", "ghastly; frightful; awful", "rotten"],
	"terrific": ["awesome", "top-shelf; awfil", "nightmare"],
	"terrify": ["fright"],
	"territory": ["land", "turf"],
	"terror": ["hang-up; dread", "fright"],
	"terrorism": ["-"],
	"test": ["-"],
	"testament (will)": ["will"],
	"testator": ["willwriter"],
	"testicle": ["bollock", "ball"],
	"testimony": ["witness"],
	"text": ["-"],
	"textbook": ["handbook"],
	"textile": ["-"],
	"thatched": ["-"],
	"theatre": ["-"],
	"theme": ["-"],
	"theology": ["godlore"],
	"theory": ["thought", "thoughtlay", "belief", "guesspell"],
	"thesaurus": ["wordnet"],
	"they/them/their": ["-"],
	"throne": ["seat"],
	"thug": ["outlaw"],
	"tibia": ["shank-bone", "shinbone"],
	"tiger": ["-"],
	"till": ["-"],
	"timid": ["shy", "meek", "thewless"],
	"tint": ["blee", "hue"],
	"title": ["name", "right", "sterling"],
	"tmesis": ["-"],
	"toast": ["thanksgiving"],
	"tobacco": ["-"],
	"toboggan": ["slide", "slider"],
	"toilet": ["bathroom", "washroom", "restroom"],
	"toilet (bowl)": ["-"],
	"tolerate": ["thole", "bear", "put up with"],
	"tomato": ["loveapple"],
	"tomb": ["grave"],
	"topic": ["-"],
	"topography": ["landscape"],
	"torch": ["fire", "light"],
	"torment": ["bedevil n: hang-up"],
	"tornado": ["whirlwind", "whirlstorm", "twister"],
	"torso": ["upperbody"],
	"tortoise": ["-"],
	"torture": ["bedevil"],
	"total": ["utter", "full", "all-out", "full-on"],
	"totalitarian(ism)": ["-"],
	"totally": ["altogether", "fully", "wholly", "outright", "utterly", "full-on"],
	"totem": ["hallmark"],
	"touch": ["handle", "feel", "finger", "rine"],
	"tourist": ["-"],
	"tower": ["-"],
	"toxic(ity)": ["-"],
	"trachea": ["-"],
	"track": ["path", "way"],
	"tractor": ["tug", "tower"],
	"tradition": ["trend", "folklore", "folkways", "oldenway", "thew"],
	"traditional": ["old-line"],
	"traffic": ["-"],
	"tragedy": ["ill", "knock", "mishap"],
	"tragic": ["heartbreaking", "unlucky", "woeful"],
	"trailblazing": ["groundbreaking"],
	"train": ["tow", "tug"],
	"trait": ["tie"],
	"traitor": ["backstabber"],
	"transcend": ["-"],
	"transcribe": ["downwrite"],
	"transfer": ["send", "bring over", "hand to/over", "shift (Barnes)"],
	"transfigure": ["-"],
	"transfiguration (rel.)": ["-"],
	"transform": ["-"],
	"transgress": ["-"],
	"transhuman": ["-"],
	"transhumanism": ["-"],
	"transit": ["thoroughfare", "faring"],
	"transition": ["shift"],
	"transitional": ["-"],
	"transitive": ["overfaresome (Barnes)"],
	"transitive (grammar)": ["-"],
	"transitory": ["fleeting"],
	"translate": ["wend", "put into (Barnes)", "overset", "set over"],
	"transliminal": ["-"],
	"transliteratetion": ["-"],
	"translucent": ["-"],
	"transmit": ["spread; ship; hand over"],
	"transmission": ["broadcast"],
	"transparent": ["see-through; bright-linethrough-showing (Barnes)", "clear"],
	"transpire": ["1. sweat2. happen", "come to happen", "leak out", "come out"],
	"transport": ["ferry"],
	"transsexual": ["she-man", "he-lady", "ladyboy", "folkhalf shifter", "folkhalf switcher"],
	"transsubstantiate": ["-"],
	"transvestite": ["-"],
	"trauma": ["wound", "aftershock"],
	"travel": ["fare (Barnes)", "wayfare", "yondfare", "lithe"],
	"traveller": ["wayfarer (Barnes)"],
	"traverse": ["tread", "yondfare"],
	"treachery": ["-"],
	"treason": [""],
	"treasure": ["hoard", "wealth hoard", "dearworthness (<OE déorwyrðnes)"],
	"treasury": ["-"],
	"treat": ["-"],
	"treatise": ["-"],
	"treatment": ["-"],
	"treaty": ["truce\nbargain (Barnes)"],
	"tremble": ["bive", "shiver", "quiver", "shudder"],
	"tremor": ["quake", "quiver", "shake", "shudder"],
	"trench": ["-"],
	"trespass": ["overstep"],
	"triangle": ["-"],
	"tribal leader": ["-"],
	"tribe": ["kindred"],
	"tribulation": ["woe"],
	"tribute": ["-"],
	"tributary": ["brook"],
	"trichology": ["hairlore"],
	"tricycle": ["-"],
	"trick": ["wile"],
	"trilobite": ["-"],
	"trinidad and tobago": ["-"],
	"trinity": ["-"],
	"tripartite": ["threefold"],
	"triple": ["threefold (Barnes)"],
	"triplet": ["threeling"],
	"tristful": ["downcast", "gloomy", "unblithe", "unglad", "wretched"],
	"triumph": ["win", "sig"],
	"triumvirate": ["-"],
	"trivial": ["paltry"],
	"tropical (climate)": ["wethot"],
	"tropical zone": ["-"],
	"trouble": ["ail", "illness", "woe; harm's way\nin trouble: on the ropes"],
	"troublesome": ["-"],
	"truck": ["lorry"],
	"truncheon": ["cudgel", "nightstick", "club"],
	"trunk": ["-"],
	"try": ["forseek"],
	"tsunami": ["-"],
	"tuition": ["teaching"],
	"tumor": ["amper (OE: ampre )"],
	"tundra": ["northgrass", "coldgrass"],
	"tunnel": ["-"],
	"turn": ["wend", "writhe"],
	"turn against": ["-"],
	"turning point": ["watershed"],
	"turn into": ["become", "char"],
	"turquoise": ["teal"],
	"turret": ["small keep"],
	"turtle": ["shell-paddock (rare)"],
	"turtoise": ["shellpad"],
	"tutelage": ["-"],
	"tutor": ["teacher", "leerer"],
	"tweezers": ["nippers"],
	"type": ["key", "truckle"],
	"typhus": ["-"],
	"typify": ["kinden", "mark", "inbody"],
	"typical": ["-"],
	"typographer": ["-"],
	"tyrannosaurus rex": ["-"],
	"tyranny": ["-"],
	"tyrant": ["-"],
	"tyre": ["wheelring"],
	"ubiquitous": ["everywhere", "all-over; everyday", "household; wall-to-wall"],
	"ubiquity": ["everywhereness"],
	"unidentified flying object": ["-"],
	"ulcer": ["-"],
	"ulna": ["-"],
	"ulterior": ["later"],
	"ultimate": ["last"],
	"ultimately": ["someday", "sometime; after all", "sooner or later; deep down"],
	"umbrella": ["rainshade"],
	"unabated": ["-"],
	"unanimous": ["kindred", "like-minded"],
	"unanimously": ["-"],
	"unanticipated": ["unforeseen"],
	"unassailable": ["hallowed", "holly"],
	"unbalanced": ["barmy", "bats", "haywire", "unhinged; unsteady"],
	"uncelebrated": ["nameless", "unsung"],
	"uncertain": ["flickery", "unsettled", "trustless"],
	"uncertainty": ["mistrustfulness"],
	"uncle": ["-"],
	"unconscious": ["cold; clueless"],
	"unctuous": ["smarmy"],
	"undercurrent": ["undertow", "tideway"],
	"underdeveloped": ["underbuilt", "undergrown"],
	"undermine": ["hinder"],
	"undistinguished": ["unknown"],
	"undress": ["strip", "unclothe"],
	"undulating": ["wavering"],
	"uneasy": ["restless", "ill at ease"],
	"unedifying": ["unwholesome", "unhealthy"],
	"uneducated": ["unread", "unlearnt", "untaught; lowbrow"],
	"unemployed": ["jobless", "idle", "unhired", "workless"],
	"unexpected": ["unforeseen"],
	"unfamiliar": ["unheard of", "unknown", "unkindred", "beyond your ken"],
	"unfavourable": ["unfriendly", "untoward"],
	"unfortunate": ["hapless", "hardluck", "ill-starred (Barnes)", "snakebit; heartbreaking", "woeful"],
	"unhabited": ["undwelled"],
	"unharness": ["outspan"],
	"unicorn": ["-"],
	"uniformity": ["evenness"],
	"unintelligent": ["bonehead", "witless"],
	"uninteresting": ["leaden", "reckless", "unrecking"],
	"union": ["-"],
	"unionism": ["-"],
	"unionist": ["-"],
	"unique": ["one-off", "one-of-a-kind", "one and only"],
	"unit": ["-"],
	"unite": ["knit", "link up"],
	"united": ["knitted"],
	"united states of america": ["-"],
	"unity": ["oneness (Barnes)", "onehead", "onehood", "togetherness", "wholeness"],
	"universal": ["broad-brush", "overall; all-in; wall-to-wall"],
	"universality": ["allness"],
	"universe": ["world"],
	"university": ["-"],
	"unjustified": ["unshown"],
	"unleash": ["loosen", "unlock"],
	"unleashed": ["unbound"],
	"unlimited": ["unbounded (<Barnes)", "unstinted"],
	"unmaintained": ["unkempt"],
	"unmanageable": ["headstrong", "untoward"],
	"unnecessary": ["needless", "uncalled for", "unneeded"],
	"unnerve": ["unsettle", "faze"],
	"update": ["-"],
	"unpleasant": ["bad", "bitter", "rotten", "unlovely", "wicked"],
	"unproductive": ["bony", "geason", "unbearing", "unyielding"],
	"unprofitable": ["barren"],
	"unprogressive": ["hidebound"],
	"unreservedly": ["wholeheartedly"],
	"unresponsive": ["-"],
	"unrestrained": ["loose"],
	"unrevealed": ["untold", "hidden", "in dern"],
	"unsuccessful": ["-"],
	"unsuitable": ["unbefitting"],
	"unsympathetic": ["slash-and-burn", "unfeeling; untoward"],
	"unusual": ["funny", "out-of-the-way", "weird"],
	"unveil": ["bare", "let on about", "spill", "tell", "unbosom"],
	"urban": ["townish"],
	"urbanite": ["townsman"],
	"urge": ["plead", "goadn: craving", "lust", "thirst", "yearning"],
	"urination": ["weeing slang"],
	"urine": ["wee slang"],
	"urinate": ["wee slang", "wet"],
	"ursa major": ["The Plough", "The Great Bear"],
	"use": ["brook", "handle", "deal with", "milk"],
	"used to": ["1. formerly 2. wont to", "weaned to"],
	"useful": ["handy"],
	"useless": ["idle", "unhandy"],
	"usual": ["household; cut-and-dried"],
	"usurer": ["loan shark"],
	"usury": ["-"],
	"utensil": ["tool"],
	"uterus": ["womb"],
	"uxorious": ["-"],
	"vacancy": ["black hole", "emptyness; bareness"],
	"vacant": ["bare; fallow", "off; deadpan", "numb; forgotten", "forsaken"],
	"vacate": ["empty"],
	"vacation": ["break", "holiday", "leave"],
	"vaccine": ["jab"],
	"vacuity": ["black hole", "emptiness; bareness"],
	"vacuum": ["-"],
	"vague": ["fuzzy; dim"],
	"vagina": ["-"],
	"vain": ["1. cocky", "high-and-mighty", "snotty; 2. worthless", "idle 3. empty", "shallow", "worthless", "hollow"],
	"vain, in": ["for nothing", "worthlessly", "in wanhope"],
	"valediction": ["goodbye", "farewell", "leave-taking"],
	"valerian": ["all-heal"],
	"valet": ["theen", "steward"],
	"valiant": ["bold", "doughty", "fearless", "stalworth"],
	"valid": ["sound", "well-grounded"],
	"valley": ["daledeep", "of a stream: denewide", "grassy: sladenarrow", "steep: clove"],
	"value": ["worthen"],
	"vampire": ["bloodsucker", "shark", "wolf"],
	"vanguard": ["-"],
	"vanir": ["-"],
	"vanish": ["melt", "sink"],
	"vanity": ["pride"],
	"vapour": ["-"],
	"variant": ["sundering"],
	"variation": ["-"],
	"variegated": ["rainbow; dotted"],
	"variety": ["kind"],
	"various": ["rainbow"],
	"vas deferens": ["-"],
	"vassal": ["feeman"],
	"vast": ["great", "endless"],
	"vault of heaven": ["-"],
	"veal": ["-"],
	"veer": ["swerve", "trundle"],
	"veil": ["wimple"],
	"vegetable": ["-"],
	"vehicle": ["-"],
	"vein": ["-"],
	"velcro": ["-"],
	"velociraptor": ["-"],
	"vendor": ["seller", "dealer"],
	"venesection": ["bloodletting"],
	"venison": ["-"],
	"venom": ["-"],
	"vent": ["hole"],
	"venturesome": ["daring", "free-swinging"],
	"veracious": ["true"],
	"verb": ["-"],
	"verbal": ["wordy; spoken", "unwritten", "word-of-mouth"],
	"verbose": ["long-winded"],
	"verbosity": ["wordiness"],
	"verdant": ["green", "lush"],
	"verge": ["brink", "edge", "threshold"],
	"verify": ["check"],
	"verily": ["truly", "soothly", "indeed", "forsooth"],
	"verity": ["truth. (see Truth and sooth", "verity and reality)"],
	"vernacular": ["unbookish"],
	"vernal": ["spring"],
	"verse": ["-"],
	"version": ["reading", "betokening"],
	"versus": ["against"],
	"vertical": ["standing", "upright"],
	"vertically": ["heightwise"],
	"vertigo": ["-"],
	"veruca": ["wart"],
	"vervain": ["-"],
	"very": ["1. through-", "ful-", "for-", "so", "highly; greatly", "mighty", "sorely", "sore; way; 2. much", "truly", "soothly", "forsooth", "indeed", "rather", "rattling", "mickle", "dead", "fele", "fell; 3. same", "selfsame; 4. sheer; utter; 5. true", "truly", "full; 6. true; 7. rightful", "lawful\n\n\nvery much: most (att'd <OE mǽst)", "well"],
	"vesica": ["bladder"],
	"vespertilines": ["bat"],
	"vessel": ["vat", "ship"],
	"vest": ["British: undershirtAmerican: waistcoat"],
	"vex": ["nettle"],
	"vexation": ["feaze"],
	"via": ["by"],
	"vibrate": ["shiver", "shudder", "quiver", "shake"],
	"vicar": ["-"],
	"vicarious": ["-"],
	"viceroy": ["-"],
	"vicinity": ["nearness; neighbourhood"],
	"vicious": ["-"],
	"vicissitude": ["ups and downs", "seesaw"],
	"victim": ["-"],
	"victor": ["winner"],
	"victory": ["win"],
	"video": ["-"],
	"video cd": ["-"],
	"video game": ["-"],
	"view": ["look", "watch", "see", "gaze", "gawk"],
	"viewer": ["onlooker", "witness", "watcher"],
	"vigil": ["wakefulness", "wake", "watch"],
	"vigilance": ["heedness", "wareness", "watchfulnes"],
	"vigilant": ["eye-bright", "wakeful", "aware", "wary", "watchful", "wide awake", "wakerife", "ware", "sharp"],
	"vigilante": ["watchman", "warder", "ward", "keeper", "overseer"],
	"vigour": ["liveliness", "drive"],
	"vigorous": ["hearty", "rathe", "lusty", "driving", "lively", "hale", "yauld"],
	"vile": ["evil", "wicked", "loathsome"],
	"village": ["wick", "town", "whistle-stop"],
	"villain": ["black hat"],
	"vine": ["-"],
	"violate": ["breach"],
	"violence": ["foul play"],
	"violent": ["stormy; dreadful; mad"],
	"violet": ["-"],
	"violin": ["fiddle"],
	"violoncello": ["-"],
	"virgin": ["maiden"],
	"virginity": ["maidenhood"],
	"virtually": ["almost", "nearly", "seemingly"],
	"virtue": ["worth", "uprightness; doughtiness", "heart"],
	"virtuous": ["right-minded"],
	"virus": ["-"],
	"visage": ["blee", "likeness"],
	"viscosity": ["stickiness", "clinginess"],
	"viscous": ["sticky", "clingy", "ropy"],
	"viscum": ["mistletoe", "balder's bane"],
	"visible": ["-"],
	"vision": ["sight; dream", "sweven"],
	"visionary": ["farsighted", "foresighted"],
	"visit": ["-"],
	"visitor": ["caller", "guest"],
	"vital": ["flush", "lusty", "red-blooded; mettlesome", "springy; needed; fell; key"],
	"vitality": ["liveliness", "beans"],
	"vocabulary": ["word-hoard"],
	"vocal": ["loud", "outspoken"],
	"vociferous": ["outspoken", "loudmouthed"],
	"vodka": ["-"],
	"voice": ["-"],
	"voiced": ["soft", "weak", "flat"],
	"voiceless": ["hard", "strong", "sharp"],
	"void": ["n: black hole", "emptiness\nadj: bereft"],
	"volcano": ["-"],
	"völkisch": ["folkish (att'd; <OE folcisc)"],
	"volume": ["book: wadacoustics: din", "loudness"],
	"voluntary": ["willing", "freewilling"],
	"volunteer": ["-"],
	"vomer": ["-"],
	"vomit": ["spew", "puke", "sick", "throw-up", "hurl"],
	"vote": ["poll", "show of handsvb: choose"],
	"vow": ["oath", "behest", "pledge", "troth", "word"],
	"vowel": ["-"],
	"voyage": ["sail"],
	"vulgar": ["low", "filthy", "ill-bred"],
	"vulpine": ["foxlike"],
	"vulture": ["-"],
	"wager": ["lay", "bet", "stake", "pledge", "flutter", "put on", "long shot"],
	"walrus": ["-"],
	"war": [""],
	"warrior": ["fighter"],
	"waste": ["bony", "dead", "stark"],
	"wasteland": ["barren", "dryland", "heath", "no-man's-land"],
	"watch cap": ["beanie"],
	"waive": ["yield", "forsake", "forgo; overlook"],
	"whiskey": ["-"],
	"woodpecker": ["-"],
	"wreckage": ["loss", "ashes", "wrack", "wreck"],
	"x-ray": ["-"],
	"xanthous": ["-"],
	"xenophilia": ["-"],
	"xenophobia": ["-"],
	"xerophobia": ["-"],
	"xiphoid": ["-"],
	"xyloid": ["woodlike"],
	"xylology": ["-"],
	"xylophone": ["-"],
	"xyster": ["-"],
	"yahoo": ["-"],
	"yeti": ["-"],
	"yogurt": ["-"],
	"yo-yo": ["-"],
	"zabaglione": ["-"],
	"zany": ["brainless", "half-witted", "unwise", "weak minded", "witless"],
	"zeal": ["keenness", "warmth"],
	"zealot": ["diehard"],
	"zealotry": ["-"],
	"zealous": ["keen", "earnest"],
	"zeitgeist": ["-"],
	"zenith": ["high noon", "high tide", "highwater mark", "tip-top"],
	"zephyr": ["-"],
	"zeppelin": ["-"],
	"zero": ["naught", "goose egg", "nothing; lightweight; bedrock", "bottom", "depth"],
	"zest": ["nip", "zing; skin", "peel"],
	"zig-zag": ["stepside", "reel"],
	"zodiac": ["-"],
	"zombie": ["undead"],
	"zone": ["belt", "land", "neck; field"],
	"zoo": ["-"],
	"zoology": ["-"],
	"zucchini": ["-"],
	"zymolysis": ["-"]
};

function getType(x) {
	var currentType = Object.prototype.toString.call(x).slice(8, -1).toLowerCase();
	if (currentType === 'array' && x.length > 0) {
		return '[array of ' + getType(x[0]) + 's]';
	}
	return currentType;
}

function typeStringFromArray(arr) {
	if (arr.length === 1) {
		return arr[0].type;
	}
	return arr.map(function(typeCheckFn) {
		return typeCheckFn.type;
	}).join(' || ');
}

function T(schema) {

	return function(props, label) {

		var loop = function ( key ) {

			if (schema.hasOwnProperty(key)) {

				var rules = Array.isArray(schema[key]) ? schema[key] : [schema[key]];
				var success = rules.reduce(function(prev, rule) {
					return prev || rule(props[key]);
				}, false);

				if (!success) {

					// recursive call will report errors in next round of checks
					if (typeStringFromArray(rules).indexOf('interface') > -1) {
						return;
					}

					var errorMessage =
						'Failed type check in ' + (label || 'unknown object') + '\n' +
						'Expected prop \'' + key + '\' of type ' + typeStringFromArray(rules) + '\n' +
						'You provided \'' + key + '\' of type ' + getType(props[key]);

					console.error(errorMessage);
					return { v: errorMessage };
				}
			
			}

		};

		for (var key in schema) {
			var returned = loop( key );

			if ( returned ) return returned.v;
		}

		for (var key$1 in props) {
			if (props.hasOwnProperty(key$1) && !schema.hasOwnProperty(key$1)) {
				var errorMessage$1 = 'Did not expect to find prop \'' + key$1 + '\' in ' + label;
				console.error(errorMessage$1);
				return errorMessage$1;
			}
		}

		return null;

	};

}

T.fn = T['function'] = function(x) {
	return typeof x === 'function';
};

T.fn.type = 'function';

T.str = T.string = function(x) {
	return typeof x === 'string';
};

T.str.type = 'string';

T.num = T.number = function(x) {
	return typeof x === 'number';
};

T.num.type = 'number';

T.date = function(x) {
	return getType(x) === 'date';
};

T.date.type = 'date';

T.NULL = T['null'] = function(x) {
	return getType(x) === 'null';
};

T.NULL.type = 'null';

T.nil = function(x) {
	return typeof x === 'undefined' || getType(x) === 'null';
};

T.nil.type = 'nil';

T.obj = T.object = function(x) {
	return getType(x) === 'object';
};

T.obj.type = 'object';

T.arr = T.array = function(x) {
	return Array.isArray(x);
};

T.arr.type = 'array';

T.arrayOf = function(propType) {

	var arrayOfType = function(x) {

		if (!Array.isArray(x)) {
			return false;
		}

		for (var i = 0; i < x.length; i++) {
			if (!propType(x[i])) {
				return false;
			}
		}

		return true;

	};

	arrayOfType.type = '[array of ' + propType.type + 's]';

	return arrayOfType;

};

T['int'] = T.integer = function(x) {
	return typeof x === 'number' && isFinite(x) && Math.floor(x) === x;
};


T.integer.type = 'integer';

T.optional = T.undefined = function(x) {
	return typeof x === 'undefined';
};

T.optional.type = 'undefined';

T.bool = T['boolean'] = function(x) {
	return typeof x === 'boolean';
};

T.bool.type = 'boolean';

T.any = function() {
	return true;
};

T.any.type = 'any';

// recursive
T.schema = T['interface'] = function(schema) {
	var schemaType = function(prop) {
		return !T(schema)(prop, 'nested interface'); // returns null if success, so invert as boolean
	};
	schemaType.type = 'interface';
	return schemaType;
};

var index$1 = T;

var TooltipType = index$1({
	value: index$1.string
});

function keepInBounds(ref) {
	var dom = ref.dom;

	var tooltipEl = dom.querySelector('.Tooltip');
	var rect = tooltipEl.getBoundingClientRect();
	var halfWidth = Math.round(rect.width / 2);
	var rightOffset = Math.round(window.innerWidth - rect.right);
	if (rect.left < 20) {
		tooltipEl.style.left = halfWidth + "px";
	}
	else if (rect.right > window.innerWidth) {
		tooltipEl.style.left = rightOffset + "px";
	}
}

function view$1(ref) {
	var attrs = ref.attrs;
	var children = ref.children;


	if (window.__DEV__) {
		TooltipType(attrs);
	}

	return (
		mithril('.Tooltip-wrap', { oncreate: keepInBounds },
			children,
			mithril('.Tooltip', attrs.value)
		)
	);
}

var Tooltip = {
	view: view$1
};

var WordType = index$1({
	word: index$1.string,
	wordClass: index$1.string,
	replacements: index$1.arrayOf(index$1.string)
});

function tooltipValue(replacements) {

	if (replacements.length === 1 && replacements[0] === '-') {
		return 'No replacements found';
	}

	return ("Use: " + (replacements.join(', ')));

}

function view(ref) {
	var attrs = ref.attrs;


	if (window.__DEV__) {
		WordType(attrs);
	}

	if (attrs.replacements.length === 0) {
		return mithril('span.Word', attrs.word);
	}
	return (
		mithril(Tooltip, { value: tooltipValue(attrs.replacements) },
			mithril('span.Word', { className: attrs.wordClass }, attrs.word)
		)
	);
}

var Word = {
	view: view
};

function getWordClass(word) {
	if (dictionary[word] === undefined) { return ''; }
	if (dictionary[word].length === 1 && dictionary[word][0] === '-') {
		return 'noReplacements';
	}
	return 'replaced';
}

function getReplacements(word) {
	return dictionary[word] || [];
}

var model = {
	inputText: stream(''),
	parsedText: [],
	parse: function parse() {
		model.parsedText = model.inputText().split(' ').map(function(word) {
			return {
				word: word,
				wordClass: getWordClass(word.toLowerCase()),
				replacements: getReplacements(word.toLowerCase())
			};
		});
	}
};

var App = {
	view: function view() {
		return (
			mithril('.pad20',
				mithril('textarea.Input', {
					className: 'small',
					value: model.inputText(),
					oninput: mithril.withAttr('value', model.inputText)
				}),
				mithril('.center.pad20',
					mithril('button.Button', { onclick: model.parse }, 'Parse for Anglish origin')
				),
				mithril('hr'),
				mithril('.Output', model.parsedText.map(function (data) { return mithril(Word, data); }))
			)
		);
	}
};

window.__DEV__ = window.location.hostname === 'localhost';

mithril.mount(document.getElementById('app'), App);

}());
