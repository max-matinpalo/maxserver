//#region node_modules/preact/dist/preact.module.js
var e, t, n, r, i, a, o, s, c, l, u, d, f, p, m, h = {}, g = [], _ = /acit|ex(?:s|g|n|p|$)|rph|grid|ows|mnc|ntw|ine[ch]|zoo|^ord|itera/i, v = Array.isArray;
function y(e, t) {
	for (var n in t) e[n] = t[n];
	return e;
}
function b(e) {
	e && e.parentNode && e.parentNode.removeChild(e);
}
function x(t, n, r) {
	var i, a, o, s = {};
	for (o in n) o == "key" ? i = n[o] : o == "ref" ? a = n[o] : s[o] = n[o];
	if (arguments.length > 2 && (s.children = arguments.length > 3 ? e.call(arguments, 2) : r), typeof t == "function" && t.defaultProps != null) for (o in t.defaultProps) s[o] === void 0 && (s[o] = t.defaultProps[o]);
	return S(t, s, i, a, null);
}
function S(e, r, i, a, o) {
	var s = {
		type: e,
		props: r,
		key: i,
		ref: a,
		__k: null,
		__: null,
		__b: 0,
		__e: null,
		__c: null,
		constructor: void 0,
		__v: o ?? ++n,
		__i: -1,
		__u: 0
	};
	return o == null && t.vnode != null && t.vnode(s), s;
}
function C(e) {
	return e.children;
}
function ee(e, t) {
	this.props = e, this.context = t;
}
function w(e, t) {
	if (t == null) return e.__ ? w(e.__, e.__i + 1) : null;
	for (var n; t < e.__k.length; t++) if ((n = e.__k[t]) != null && n.__e != null) return n.__e;
	return typeof e.type == "function" ? w(e) : null;
}
function T(e) {
	if (e.__P && e.__d) {
		var n = e.__v, r = n.__e, i = [], a = [], o = y({}, n);
		o.__v = n.__v + 1, t.vnode && t.vnode(o), ie(e.__P, o, n, e.__n, e.__P.namespaceURI, 32 & n.__u ? [r] : null, i, r ?? w(n), !!(32 & n.__u), a), o.__v = n.__v, o.__.__k[o.__i] = o, oe(i, o, a), n.__e = n.__ = null, o.__e != r && E(o);
	}
}
function E(e) {
	if ((e = e.__) != null && e.__c != null) return e.__e = e.__c.base = null, e.__k.some(function(t) {
		if (t != null && t.__e != null) return e.__e = e.__c.base = t.__e;
	}), E(e);
}
function D(e) {
	(!e.__d && (e.__d = !0) && r.push(e) && !O.__r++ || i != t.debounceRendering) && ((i = t.debounceRendering) || a)(O);
}
function O() {
	try {
		for (var e, t = 1; r.length;) r.length > t && r.sort(o), e = r.shift(), t = r.length, T(e);
	} finally {
		r.length = O.__r = 0;
	}
}
function te(e, t, n, r, i, a, o, s, c, l, u) {
	var d, f, p, m, _, v, y = r && r.__k || g, b = t.length;
	for (c = k(n, t, y, c, b), d = 0; d < b; d++) (p = n.__k[d]) != null && (f = p.__i != -1 && y[p.__i] || h, p.__i = d, v = ie(e, p, f, i, a, o, s, c, l, u), m = p.__e, p.ref && f.ref != p.ref && (f.ref && le(f.ref, null, p), u.push(p.ref, p.__c || m, p)), _ == null && m != null && (_ = m), 4 & p.__u ? (c = ne(p, c, e), f.__e && (f.__e = null)) : typeof p.type == "function" && v !== void 0 ? c = v : m && (c = m.nextSibling), p.__u &= -7);
	return n.__e = _, c;
}
function k(e, t, n, r, i) {
	var a, o, s, c, l, u = n.length, d = u, f = 0;
	for (e.__k = Array(i), a = 0; a < i; a++) (o = t[a]) != null && typeof o != "boolean" && typeof o != "function" ? (typeof o == "string" || typeof o == "number" || typeof o == "bigint" || o.constructor == String ? o = e.__k[a] = S(null, o, null, null, null) : v(o) ? o = e.__k[a] = S(C, { children: o }, null, null, null) : o.constructor === void 0 && o.__b > 0 ? o = e.__k[a] = S(o.type, o.props, o.key, o.ref ? o.ref : null, o.__v) : e.__k[a] = o, c = a + f, o.__ = e, o.__b = e.__b + 1, s = null, (l = o.__i = A(o, n, c, d)) != -1 && (d--, (s = n[l]) && (s.__u |= 2)), s == null || s.__v == null ? (l == -1 && (i > u ? f-- : i < u && f++), typeof o.type != "function" && (o.__u |= 4)) : l != c && (l == c - 1 ? f-- : l == c + 1 ? f++ : (l > c ? f-- : f++, o.__u |= 4))) : e.__k[a] = null;
	if (d) for (a = 0; a < u; a++) (s = n[a]) != null && !(2 & s.__u) && (s.__e == r && (r = w(s)), ue(s, s));
	return r;
}
function ne(e, t, n) {
	var r, i;
	if (typeof e.type == "function") {
		for (r = e.__k, i = 0; r && i < r.length; i++) r[i] && (r[i].__ = e, t = ne(r[i], t, n));
		return t;
	}
	e.__e != t && (t && e.type && !t.parentNode && (t = w(e)), t = n.insertBefore(e.__e, t || null));
	do
		t &&= t.nextSibling;
	while (t != null && t.nodeType == 8);
	return t;
}
function A(e, t, n, r) {
	var i, a, o, s = e.key, c = e.type, l = t[n], u = l != null && !(2 & l.__u);
	if (l === null && s == null || u && s == l.key && c == l.type) return n;
	if (r > +!!u) {
		for (i = n - 1, a = n + 1; i >= 0 || a < t.length;) if ((l = t[o = i >= 0 ? i-- : a++]) != null && !(2 & l.__u) && s == l.key && c == l.type) return o;
	}
	return -1;
}
function j(e, t, n) {
	t[0] == "-" ? e.setProperty(t, n ?? "") : e[t] = n == null ? "" : typeof n != "number" || _.test(t) ? n : n + "px";
}
function M(e, t, n, r, i) {
	var a, o;
	n: if (t == "style") {
		if (typeof n == "string") e.style.cssText = n;
		else {
			if (typeof r == "string" && (e.style.cssText = r = ""), r) for (t in r) n && t in n || j(e.style, t, "");
			if (n) for (t in n) r && n[t] == r[t] || j(e.style, t, n[t]);
		}
	} else if (t[0] == "o" && t[1] == "n") a = t != (t = t.replace(u, "$1")), o = t.toLowerCase(), t = o in e || t == "onFocusOut" || t == "onFocusIn" ? o.slice(2) : t.slice(2), e.l ||= {}, e.l[t + a] = n, n ? r ? n[l] = r[l] : (n[l] = d, e.addEventListener(t, a ? p : f, a)) : e.removeEventListener(t, a ? p : f, a);
	else {
		if (i == "http://www.w3.org/2000/svg") t = t.replace(/xlink(H|:h)/, "h").replace(/sName$/, "s");
		else if (t != "width" && t != "height" && t != "href" && t != "list" && t != "form" && t != "tabIndex" && t != "download" && t != "rowSpan" && t != "colSpan" && t != "role" && t != "popover" && t in e) try {
			e[t] = n ?? "";
			break n;
		} catch {}
		typeof n == "function" || (n == null || !1 === n && t[4] != "-" ? e.removeAttribute(t) : e.setAttribute(t, t == "popover" && n == 1 ? "" : n));
	}
}
function re(e) {
	return function(n) {
		if (this.l) {
			var r = this.l[n.type + e];
			if (n[c] == null) n[c] = d++;
			else if (n[c] < r[l]) return;
			return r(t.event ? t.event(n) : n);
		}
	};
}
function ie(e, n, r, i, a, o, s, c, l, u) {
	var d, f, p, m, h, _, x, S, T, E, D, O, k, ne, A, j, M = n.type;
	if (n.constructor !== void 0) return null;
	128 & r.__u && (l = !!(32 & r.__u), o = [c = n.__e = r.__e]), (d = t.__b) && d(n);
	n: if (typeof M == "function") {
		f = s.length;
		try {
			if (T = n.props, E = M.prototype && M.prototype.render, D = (d = M.contextType) && i[d.__c], O = d ? D ? D.props.value : d.__ : i, r.__c ? S = (p = n.__c = r.__c).__ = p.__E : (E ? n.__c = p = new M(T, O) : (n.__c = p = new ee(T, O), p.constructor = M, p.render = de), D && D.sub(p), p.state || (p.state = {}), p.__n = i, m = p.__d = !0, p.__h = [], p._sb = []), E && p.__s == null && (p.__s = p.state), E && M.getDerivedStateFromProps != null && (p.__s == p.state && (p.__s = y({}, p.__s)), y(p.__s, M.getDerivedStateFromProps(T, p.__s))), h = p.props, _ = p.state, p.__v = n, m) E && M.getDerivedStateFromProps == null && p.componentWillMount != null && p.componentWillMount(), E && p.componentDidMount != null && p.__h.push(p.componentDidMount);
			else {
				if (E && M.getDerivedStateFromProps == null && T !== h && p.componentWillReceiveProps != null && p.componentWillReceiveProps(T, O), n.__v == r.__v || !p.__e && p.shouldComponentUpdate != null && !1 === p.shouldComponentUpdate(T, p.__s, O)) {
					n.__v != r.__v && (p.props = T, p.state = p.__s, p.__d = !1), n.__e = r.__e, n.__k = r.__k, n.__k.some(function(e) {
						e && (e.__ = n);
					}), g.push.apply(p.__h, p._sb), p._sb = [], p.__h.length && s.push(p), c = w(r);
					break n;
				}
				p.componentWillUpdate != null && p.componentWillUpdate(T, p.__s, O), E && p.componentDidUpdate != null && p.__h.push(function() {
					p.componentDidUpdate(h, _, x);
				});
			}
			if (p.context = O, p.props = T, p.__P = e, p.__e = !1, k = t.__r, ne = 0, E) p.state = p.__s, p.__d = !1, k && k(n), d = p.render(p.props, p.state, p.context), g.push.apply(p.__h, p._sb), p._sb = [];
			else do
				p.__d = !1, k && k(n), d = p.render(p.props, p.state, p.context), p.state = p.__s;
			while (p.__d && ++ne < 25);
			p.state = p.__s, p.getChildContext != null && (i = y(y({}, i), p.getChildContext())), E && !m && p.getSnapshotBeforeUpdate != null && (x = p.getSnapshotBeforeUpdate(h, _)), A = d != null && d.type === C && d.key == null ? se(d.props.children) : d, c = te(e, v(A) ? A : [A], n, r, i, a, o, s, c, l, u), p.base = n.__e, n.__u &= -161, p.__h.length && s.push(p), S && (p.__E = p.__ = null);
		} catch (e) {
			if (s.length = f, n.__v = null, l || o != null) {
				if (e.then) {
					for (n.__u |= l ? 160 : 128; c && c.nodeType == 8 && c.nextSibling;) c = c.nextSibling;
					o != null && (o[o.indexOf(c)] = null), n.__e = c;
				} else if (o != null) for (j = o.length; j--;) b(o[j]);
			} else n.__e = r.__e;
			n.__k ??= r.__k || [], e.then || ae(n), t.__e(e, n, r);
		}
	} else o == null && n.__v == r.__v ? (n.__k = r.__k, n.__e = r.__e) : c = n.__e = ce(r.__e, n, r, i, a, o, s, l, u);
	return (d = t.diffed) && d(n), 128 & n.__u ? void 0 : c;
}
function ae(e) {
	e && (e.__c && (e.__c.__e = !0), e.__k && e.__k.some(ae));
}
function oe(e, n, r) {
	for (var i = 0; i < r.length; i++) le(r[i], r[++i], r[++i]);
	t.__c && t.__c(n, e), e.some(function(n) {
		try {
			e = n.__h, n.__h = [], e.some(function(e) {
				e.call(n);
			});
		} catch (e) {
			t.__e(e, n.__v);
		}
	});
}
function se(e) {
	return typeof e != "object" || !e || e.__b > 0 ? e : v(e) ? e.map(se) : e.constructor === void 0 ? y({}, e) : null;
}
function ce(n, r, i, a, o, s, c, l, u) {
	var d, f, p, m, g, _, y, x = i.props || h, S = r.props, C = r.type;
	if (C == "svg" ? o = "http://www.w3.org/2000/svg" : C == "math" ? o = "http://www.w3.org/1998/Math/MathML" : o ||= "http://www.w3.org/1999/xhtml", s != null) {
		for (d = 0; d < s.length; d++) if ((g = s[d]) && "setAttribute" in g == !!C && (C ? g.localName == C : g.nodeType == 3)) {
			n = g, s[d] = null;
			break;
		}
	}
	if (n == null) {
		if (C == null) return document.createTextNode(S);
		n = document.createElementNS(o, C, S.is && S), l &&= (t.__m && t.__m(r, s), !1), s = null;
	}
	if (C == null) x === S || l && n.data == S || (n.data = S);
	else {
		if (s = C == "textarea" && S.defaultValue != null ? null : s && e.call(n.childNodes), !l && s != null) for (x = {}, d = 0; d < n.attributes.length; d++) x[(g = n.attributes[d]).name] = g.value;
		for (d in x) g = x[d], d == "dangerouslySetInnerHTML" ? p = g : d == "children" || d in S || d == "value" && "defaultValue" in S || d == "checked" && "defaultChecked" in S || M(n, d, null, g, o);
		for (d in S) g = S[d], d == "children" ? m = g : d == "dangerouslySetInnerHTML" ? f = g : d == "value" ? _ = g : d == "checked" ? y = g : l && typeof g != "function" || x[d] === g || M(n, d, g, x[d], o);
		if (f) l || p && (f.__html == p.__html || f.__html == n.innerHTML) || (n.innerHTML = f.__html), r.__k = [];
		else if (p && (n.innerHTML = ""), te(r.type == "template" ? n.content : n, v(m) ? m : [m], r, i, a, C == "foreignObject" ? "http://www.w3.org/1999/xhtml" : o, s, c, s ? s[0] : i.__k && w(i, 0), l, u), s != null) for (d = s.length; d--;) b(s[d]);
		l && C != "textarea" || (d = "value", C == "progress" && _ == null ? n.removeAttribute("value") : _ != null && (_ !== n[d] || C == "progress" && !_ || C == "option" && _ != x[d]) && M(n, d, _, x[d], o), d = "checked", y != null && y != n[d] && M(n, d, y, x[d], o));
	}
	return n;
}
function le(e, n, r) {
	try {
		if (typeof e == "function") {
			var i = typeof e.__u == "function";
			i && e.__u(), i && n == null || (e.__u = e(n));
		} else e.current = n;
	} catch (e) {
		t.__e(e, r);
	}
}
function ue(e, n, r) {
	var i, a;
	if (t.unmount && t.unmount(e), (i = e.ref) && (i.current && i.current != e.__e || le(i, null, n)), (i = e.__c) != null) {
		if (i.componentWillUnmount) try {
			i.componentWillUnmount();
		} catch (e) {
			t.__e(e, n);
		}
		i.base = i.__P = i.__n = null;
	}
	if (i = e.__k) for (a = 0; a < i.length; a++) i[a] && ue(i[a], n, r || typeof e.type != "function");
	r || b(e.__e), e.__c = e.__ = e.__e = void 0;
}
function de(e, t, n) {
	return this.constructor(e, n);
}
function fe(n, r, i) {
	var a, o, s, c;
	r == document && (r = document.documentElement), t.__ && t.__(n, r), o = (a = typeof i == "function") ? null : i && i.__k || r.__k, s = [], c = [], ie(r, n = (!a && i || r).__k = x(C, null, [n]), o || h, h, r.namespaceURI, !a && i ? [i] : o ? null : r.firstChild ? e.call(r.childNodes) : null, s, !a && i ? i : o ? o.__e : r.firstChild, a, c), oe(s, n, c), n.props.children = null;
}
function pe(e) {
	function t(e) {
		var n, r;
		return this.getChildContext || (n = /* @__PURE__ */ new Set(), (r = {})[t.__c] = this, this.getChildContext = function() {
			return r;
		}, this.componentWillUnmount = function() {
			n = null;
		}, this.shouldComponentUpdate = function(e) {
			this.props.value != e.value && n.forEach(function(e) {
				e.__e = !0, D(e);
			});
		}, this.sub = function(e) {
			n.add(e);
			var t = e.componentWillUnmount;
			e.componentWillUnmount = function() {
				n && n.delete(e), t && t.call(e);
			};
		}), e.children;
	}
	return t.__c = "__cC" + m++, t.__ = e, t.Provider = t.__l = (t.Consumer = function(e, t) {
		return e.children(t);
	}).contextType = t, t;
}
e = g.slice, t = { __e: function(e, t, n, r) {
	for (var i, a, o; t = t.__;) if ((i = t.__c) && !i.__) try {
		if ((a = i.constructor) && a.getDerivedStateFromError != null && (i.setState(a.getDerivedStateFromError(e)), o = i.__d), i.componentDidCatch != null && (i.componentDidCatch(e, r || {}), o = i.__d), o) return i.__E = i;
	} catch (t) {
		e = t;
	}
	throw e;
} }, n = 0, ee.prototype.setState = function(e, t) {
	var n = this.__s != null && this.__s != this.state ? this.__s : this.__s = y({}, this.state);
	typeof e == "function" && (e = e(y({}, n), this.props)), e && y(n, e), e != null && this.__v && (t && this._sb.push(t), D(this));
}, ee.prototype.forceUpdate = function(e) {
	this.__v && (this.__e = !0, e && this.__h.push(e), D(this));
}, ee.prototype.render = C, r = [], a = typeof Promise == "function" ? Promise.prototype.then.bind(Promise.resolve()) : setTimeout, o = function(e, t) {
	return e.__v.__b - t.__v.__b;
}, O.__r = 0, s = Math.random().toString(8), c = "__d" + s, l = "__a" + s, u = /(PointerCapture)$|Capture$/i, d = 0, f = re(!1), p = re(!0), m = 0;
//#endregion
//#region node_modules/preact/hooks/dist/hooks.module.js
var N, P, me, he, ge = 0, _e = [], F = t, ve = F.__b, ye = F.__r, be = F.diffed, xe = F.__c, Se = F.unmount, Ce = F.__;
function we(e, t) {
	F.__h && F.__h(P, e, ge || t), ge = 0;
	var n = P.__H || (P.__H = {
		__: [],
		__h: []
	});
	return e >= n.__.length && n.__.push({}), n.__[e];
}
function I(e) {
	return ge = 1, Te(Pe, e);
}
function Te(e, t, n) {
	var r = we(N++, 2);
	if (r.t = e, !r.__c && (r.__ = [n ? n(t) : Pe(void 0, t), function(e) {
		var t = r.__N ? r.__N[0] : r.__[0], n = r.t(t, e);
		t !== n && (r.__N = [n, r.__[1]], r.__c.setState({}));
	}], r.__c = P, !P.__f)) {
		var i = function(e, t, n) {
			if (!r.__c.__H) return !0;
			var i = !1, o = r.__c.props !== e;
			if (r.__c.__H.__.some(function(e) {
				if (e.__N) {
					i = !0;
					var t = e.__[0];
					e.__ = e.__N, e.__N = void 0, t !== e.__[0] && (o = !0);
				}
			}), a) {
				var s = a.call(this, e, t, n);
				return i ? s || o : s;
			}
			return !i || o;
		};
		P.__f = !0;
		var a = P.shouldComponentUpdate, o = P.componentWillUpdate;
		P.componentWillUpdate = function(e, t, n) {
			if (this.__e) {
				var r = a;
				a = void 0, i(e, t, n), a = r;
			}
			o && o.call(this, e, t, n);
		}, P.shouldComponentUpdate = i;
	}
	return r.__N || r.__;
}
function Ee(e, t) {
	var n = we(N++, 3);
	!F.__s && Ne(n.__H, t) && (n.__ = e, n.u = t, P.__H.__h.push(n));
}
function De(e) {
	var t = P.context[e.__c], n = we(N++, 9);
	return n.c = e, t ? (n.__ ?? (n.__ = !0, t.sub(P)), t.props.value) : e.__;
}
function Oe() {
	for (var e; e = _e.shift();) {
		var t = e.__H;
		if (e.__P && t) try {
			t.__h.some(je), t.__h.some(Me), t.__h = [];
		} catch (n) {
			t.__h = [], F.__e(n, e.__v);
		}
	}
}
F.__b = function(e) {
	P = null, ve && ve(e);
}, F.__ = function(e, t) {
	e && t.__k && t.__k.__m && (e.__m = t.__k.__m), Ce && Ce(e, t);
}, F.__r = function(e) {
	ye && ye(e), N = 0;
	var t = (P = e.__c).__H;
	t && (me === P ? (t.__h = [], P.__h = [], t.__.some(function(e) {
		e.__N && (e.__ = e.__N), e.u = e.__N = void 0;
	})) : (t.__h.some(je), t.__h.some(Me), t.__h = [], N = 0)), me = P;
}, F.diffed = function(e) {
	be && be(e);
	var t = e.__c;
	t && t.__H && (t.__H.__h.length && (_e.push(t) !== 1 && he === F.requestAnimationFrame || ((he = F.requestAnimationFrame) || Ae)(Oe)), t.__H.__.some(function(e) {
		e.u &&= (e.__H = e.u, void 0);
	})), me = P = null;
}, F.__c = function(e, t) {
	t.some(function(e) {
		try {
			e.__h.some(je), e.__h = e.__h.filter(function(e) {
				return !e.__ || Me(e);
			});
		} catch (n) {
			t.some(function(e) {
				e.__h &&= [];
			}), t = [], F.__e(n, e.__v);
		}
	}), xe && xe(e, t);
}, F.unmount = function(e) {
	Se && Se(e);
	var t, n = e.__c;
	n && n.__H && (n.__H.__.some(function(e) {
		try {
			je(e);
		} catch (e) {
			t = e;
		}
	}), n.__H = void 0, t && F.__e(t, n.__v));
};
var ke = typeof requestAnimationFrame == "function";
function Ae(e) {
	var t, n = function() {
		clearTimeout(r), ke && cancelAnimationFrame(t), setTimeout(e);
	}, r = setTimeout(n, 35);
	ke && (t = requestAnimationFrame(n));
}
function je(e) {
	var t = P, n = e.__c;
	typeof n == "function" && (e.__c = void 0, n()), P = t;
}
function Me(e) {
	var t = P;
	e.__c = e.__(), P = t;
}
function Ne(e, t) {
	return !e || e.length !== t.length || t.some(function(t, n) {
		return t !== e[n];
	});
}
function Pe(e, t) {
	return typeof t == "function" ? t(e) : t;
}
//#endregion
//#region src/spec.js
var Fe = [
	"get",
	"put",
	"post",
	"delete",
	"options",
	"head",
	"patch",
	"trace"
], Ie = /^#\/components\/schemas\/([^/]+)$/;
function Le(e, t) {
	if (typeof t != "string" || !t.startsWith("#/")) return;
	let n = e;
	for (let e of t.slice(2).split("/")) {
		let t = decodeURIComponent(e).replace(/~1/g, "/").replace(/~0/g, "~");
		if (typeof n != "object" || !n) return;
		n = n[t];
	}
	return n;
}
function Re(e) {
	let t = typeof e == "string" && e.match(Ie);
	return t ? decodeURIComponent(t[1]) : null;
}
function ze(e, t, n = /* @__PURE__ */ new Set()) {
	if (!t || typeof t != "object" || !t.$ref || n.has(t.$ref)) return t;
	n.add(t.$ref);
	let { $ref: r, ...i } = t, a = ze(e, Le(e, r), n);
	return a && typeof a == "object" ? {
		...a,
		...i
	} : i;
}
function Be(e) {
	return String(e).trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "default";
}
function Ve(e) {
	if (!e || typeof e != "object") return null;
	let t = e["application/json"] ? "application/json" : Object.keys(e)[0];
	return t ? {
		contentType: t,
		schema: e[t]?.schema ?? null
	} : null;
}
function He(e, t, n) {
	let r = /* @__PURE__ */ new Map();
	for (let i of [...t.parameters || [], ...n.parameters || []]) {
		let t = ze(e, i);
		t?.name && t.in && r.set(`${t.in}:${t.name}`, {
			name: t.name,
			in: t.in,
			required: t.in === "path" || !!t.required,
			description: t.description || "",
			schema: t.schema || {}
		});
	}
	let i = {
		path: [],
		query: [],
		header: [],
		cookie: []
	};
	for (let e of r.values()) i[e.in]?.push(e);
	return i;
}
function Ue(e, t) {
	let n = ze(e, t.requestBody), r = n && Ve(n.content);
	return r ? {
		...r,
		required: !!n.required,
		description: n.description || ""
	} : null;
}
function We(e, t) {
	return Object.entries(t.responses || {}).map(([t, n]) => {
		let r = ze(e, n) || {}, i = Ve(r.content);
		return {
			status: t,
			description: r.description || "",
			contentType: i?.contentType ?? null,
			schema: i?.schema ?? null
		};
	});
}
function Ge(e, t) {
	return (t.security ?? e.security ?? []).some((e) => e && Object.keys(e).length > 0);
}
function Ke(e) {
	if (!e || typeof e != "object" || Array.isArray(e)) throw Error("The document is not a JSON object.");
	if (!e.openapi && !e.swagger) throw Error("The document has no \"openapi\" version field.");
	if (e.paths && typeof e.paths != "object") throw Error("\"paths\" must be an object.");
	let t = [];
	for (let [n, r] of Object.entries(e.paths || {})) if (r && typeof r == "object") for (let i of Object.keys(r).filter((e) => Fe.includes(e))) {
		let a = r[i];
		a && typeof a == "object" && t.push({
			method: i.toUpperCase(),
			path: n,
			tag: Array.isArray(a.tags) && a.tags[0] ? String(a.tags[0]) : null,
			summary: a.summary || "",
			description: a.description || "",
			auth: Ge(e, a),
			params: He(e, r, a),
			body: Ue(e, a),
			responses: We(e, a)
		});
	}
	let n = new Map((e.tags || []).filter((e) => e?.name).map((e) => [e.name, e])), r = [...n.keys()];
	for (let e of t) e.tag && !r.includes(e.tag) && r.push(e.tag);
	let i = r.map((e) => ({
		name: e,
		id: `tag/${Be(e)}`,
		description: n.get(e)?.description || "",
		operations: t.filter((t) => t.tag === e)
	})).filter((e) => e.operations.length);
	for (let e of t) e.id = e.tag ? `tag/${Be(e.tag)}/${e.method}${e.path}` : `operation/${e.method}${e.path}`, e.label = e.summary || `${e.method} ${e.path}`;
	let a = Object.entries(e.components?.schemas || {}).map(([e, t]) => ({
		name: e,
		id: `model/${e}`,
		schema: t
	}));
	return {
		info: {
			title: e.info?.title || "API",
			version: e.info?.version || "",
			description: e.info?.description || ""
		},
		openapi: String(e.openapi || e.swagger),
		untagged: t.filter((e) => !e.tag),
		groups: i,
		models: a,
		operations: t
	};
}
//#endregion
//#region src/docContext.js
var qe = pe({}), Je = 120;
function Ye(e) {
	let [t, n] = I(() => decodeURIComponent(location.hash.slice(1)) || "introduction");
	return Ee(() => {
		if (!e) return;
		let t = decodeURIComponent(location.hash.slice(1));
		t && document.getElementById(t)?.scrollIntoView({
			behavior: "instant",
			block: "start"
		});
		let r = [...document.querySelectorAll("[data-anchor]")], i = 0, a = () => {
			i = 0;
			let e = r[0]?.id;
			for (let t of r) if (t.getBoundingClientRect().top - Je <= 0) e = t.id;
			else break;
			e && (n(e), decodeURIComponent(location.hash.slice(1)) !== e && history.replaceState(null, "", `#${e}`));
		}, o = () => {
			i ||= requestAnimationFrame(a);
		};
		return addEventListener("scroll", o, { passive: !0 }), () => {
			removeEventListener("scroll", o), cancelAnimationFrame(i);
		};
	}, [e]), t;
}
//#endregion
//#region node_modules/preact/jsx-runtime/dist/jsxRuntime.module.js
var Xe = 0;
Array.isArray;
function L(e, n, r, i, a, o) {
	n ||= {};
	var s, c, l = n;
	if ("ref" in l) for (c in l = {}, n) c == "ref" ? s = n[c] : l[c] = n[c];
	var u = {
		type: e,
		props: l,
		key: r,
		ref: s,
		__k: null,
		__: null,
		__b: 0,
		__e: null,
		__c: null,
		constructor: void 0,
		__v: --Xe,
		__i: -1,
		__u: 0,
		__source: a,
		__self: o
	};
	if (typeof e == "function" && (s = e.defaultProps)) for (c in s) l[c] === void 0 && (l[c] = s[c]);
	return t.vnode && t.vnode(u), u;
}
//#endregion
//#region src/ui/Icon.jsx
var Ze = {
	plus: "M8 3v10M3 8h10",
	minus: "M3 8h10",
	chevronRight: "M6 3l5 5-5 5",
	chevronDown: "M3 6l5 5 5-5",
	lock: "M4.5 7V5a3.5 3.5 0 0 1 7 0v2M3.5 7h9v6.5h-9z",
	copy: "M5.5 5.5h7v7h-7zM3.5 10.5v-7h7",
	check: "M3 8.5l3 3 7-7",
	menu: "M2.5 4h11M2.5 8h11M2.5 12h11",
	close: "M4 4l8 8M12 4l-8 8",
	download: "M8 2.5v8M4.5 7L8 10.5 11.5 7M3 13.5h10"
};
function R({ name: e, size: t = 16, class: n }) {
	return /* @__PURE__ */ L("svg", {
		class: n,
		width: t,
		height: t,
		viewBox: "0 0 16 16",
		fill: "none",
		stroke: "currentColor",
		"stroke-width": "1.5",
		"stroke-linecap": "round",
		"stroke-linejoin": "round",
		"aria-hidden": "true",
		children: /* @__PURE__ */ L("path", { d: Ze[e] })
	});
}
var Qe = {
	badge: "_badge_687h8_1",
	short: "_short_687h8_8",
	get: "_get_687h8_15",
	post: "_post_687h8_16",
	put: "_put_687h8_17",
	patch: "_patch_687h8_18",
	delete: "_delete_687h8_19",
	dark: "_dark_687h8_21"
}, $e = {
	DELETE: "DEL",
	OPTIONS: "OPT"
};
function et({ method: e, short: t = !1, dark: n = !1 }) {
	let r = e.toUpperCase();
	return /* @__PURE__ */ L("span", {
		class: `${Qe.badge} ${Qe[r.toLowerCase()] || ""} ${n ? Qe.dark : ""} ${t ? Qe.short : ""}`,
		children: t && $e[r] || r
	});
}
var z = {
	group: "_group_313i3_1",
	header: "_header_313i3_7",
	chevron: "_chevron_313i3_34",
	items: "_items_313i3_38",
	item: "_item_313i3_38",
	active: "_active_313i3_75",
	label: "_label_313i3_81"
};
//#endregion
//#region src/SidebarGroup.jsx
function tt({ title: e, items: t, open: n, onToggle: r, activeId: i, onNavigate: a }) {
	return /* @__PURE__ */ L("li", {
		class: z.group,
		children: [/* @__PURE__ */ L("button", {
			type: "button",
			class: z.header,
			"aria-expanded": n,
			onClick: r,
			children: [/* @__PURE__ */ L("span", { children: e }), /* @__PURE__ */ L(R, {
				name: n ? "chevronDown" : "chevronRight",
				size: 14,
				class: z.chevron
			})]
		}), n && /* @__PURE__ */ L("ul", {
			class: z.items,
			children: t.map((e) => /* @__PURE__ */ L("li", { children: /* @__PURE__ */ L("a", {
				href: `#${e.id}`,
				onClick: a,
				class: `${z.item} ${e.id === i ? z.active : ""}`,
				"aria-current": e.id === i ? "location" : void 0,
				children: [/* @__PURE__ */ L("span", {
					class: z.label,
					children: e.label
				}), e.method && /* @__PURE__ */ L(et, {
					method: e.method,
					short: !0
				})]
			}) }, e.id))
		})]
	});
}
var B = {
	sidebar: "_sidebar_kqgd5_1",
	list: "_list_kqgd5_7",
	link: "_link_kqgd5_16",
	active: "_active_kqgd5_34",
	label: "_label_kqgd5_40"
};
//#endregion
//#region src/Sidebar.jsx
function nt({ model: e, activeId: t, onNavigate: n }) {
	let [r, i] = I(() => /* @__PURE__ */ new Set()), a = t?.startsWith("model/") ? "models" : e.groups.find((e) => t === e.id || t?.startsWith(`${e.id}/`))?.id;
	Ee(() => {
		a && !r.has(a) && i(/* @__PURE__ */ new Set([...r, a]));
	}, [a]);
	let o = (e) => {
		let t = new Set(r);
		t.has(e) ? t.delete(e) : t.add(e), i(t);
	}, s = (e, r, i) => /* @__PURE__ */ L("li", { children: /* @__PURE__ */ L("a", {
		href: `#${e}`,
		onClick: n,
		class: `${B.link} ${e === t ? B.active : ""}`,
		"aria-current": e === t ? "location" : void 0,
		children: [/* @__PURE__ */ L("span", {
			class: B.label,
			children: r
		}), i && /* @__PURE__ */ L(et, {
			method: i,
			short: !0
		})]
	}) }, e);
	return /* @__PURE__ */ L("nav", {
		class: B.sidebar,
		"aria-label": "API reference",
		children: /* @__PURE__ */ L("ul", {
			class: B.list,
			children: [
				s("introduction", "Introduction"),
				e.untagged.map((e) => s(e.id, e.label, e.method)),
				e.groups.map((e) => /* @__PURE__ */ L(tt, {
					title: e.name,
					open: r.has(e.id),
					onToggle: () => o(e.id),
					items: e.operations.map((e) => ({
						id: e.id,
						label: e.label,
						method: e.method
					})),
					activeId: t,
					onNavigate: n
				}, e.id)),
				e.models.length > 0 && /* @__PURE__ */ L(tt, {
					title: "Models",
					open: r.has("models"),
					onToggle: () => o("models"),
					items: e.models.map((e) => ({
						id: e.id,
						label: e.name
					})),
					activeId: t,
					onNavigate: n
				})
			]
		})
	});
}
//#endregion
//#region src/markdown.js
var rt = /^(https?:|mailto:|#|\/|\.{0,2}\/|[^:]*$)/i;
function it(e) {
	let t = String(e).trim();
	return rt.test(t) ? t : null;
}
function V(e) {
	let t = [], n = /`([^`]+)`|\*\*([^*]+)\*\*|\*([^*]+)\*|\[([^\]]+)\]\(([^)\s]+)\)|(https?:\/\/[^\s<)]+)|([\w.+-]+@[\w-]+\.[\w.-]*\w)/g, r = 0, i;
	for (; i = n.exec(e);) {
		if (i.index > r && t.push({
			type: "text",
			text: e.slice(r, i.index)
		}), i[1] !== void 0) t.push({
			type: "code",
			text: i[1]
		});
		else if (i[2] !== void 0) t.push({
			type: "strong",
			children: V(i[2])
		});
		else if (i[3] !== void 0) t.push({
			type: "em",
			children: V(i[3])
		});
		else if (i[4] !== void 0) {
			let e = it(i[5]);
			t.push(e ? {
				type: "link",
				href: e,
				children: V(i[4])
			} : {
				type: "text",
				text: i[4]
			});
		} else i[6] === void 0 ? t.push({
			type: "link",
			href: `mailto:${i[7]}`,
			children: [{
				type: "text",
				text: i[7]
			}]
		}) : t.push({
			type: "link",
			href: i[6],
			children: [{
				type: "text",
				text: i[6]
			}]
		});
		r = n.lastIndex;
	}
	return r < e.length && t.push({
		type: "text",
		text: e.slice(r)
	}), t;
}
function at(e) {
	let t = String(e || "").replace(/\r\n?/g, "\n").split("\n"), n = [], r = 0;
	for (; r < t.length;) {
		let e = t[r];
		if (!e.trim()) {
			r++;
			continue;
		}
		if (/^```/.test(e.trim())) {
			let e = [];
			for (r++; r < t.length && !/^```/.test(t[r].trim());) e.push(t[r++]);
			r++, n.push({
				type: "codeblock",
				text: e.join("\n")
			});
			continue;
		}
		let i = e.match(/^(#{1,6})\s+(.*)$/);
		if (i) {
			n.push({
				type: "heading",
				level: i[1].length,
				children: V(i[2])
			}), r++;
			continue;
		}
		let a = /^\s*([-*+]|\d+[.)])\s+/;
		if (a.test(e)) {
			let i = /^\s*\d/.test(e), o = [];
			for (; r < t.length && a.test(t[r]);) o.push(V(t[r++].replace(a, "")));
			n.push({
				type: "list",
				ordered: i,
				items: o
			});
			continue;
		}
		let o = [];
		for (; r < t.length && t[r].trim() && !a.test(t[r]) && !/^(#{1,6}\s|```)/.test(t[r].trim());) o.push(t[r++].trim());
		n.push({
			type: "paragraph",
			children: V(o.join(" "))
		});
	}
	return n;
}
var H = {
	markdown: "_markdown_1u8a2_1",
	pre: "_pre_1u8a2_10",
	muted: "_muted_1u8a2_23",
	heading: "_heading_1u8a2_29",
	code: "_code_1u8a2_33",
	link: "_link_1u8a2_40"
};
//#endregion
//#region src/Markdown.jsx
function U(e) {
	return e.map((e, t) => {
		if (e.type === "text") return e.text;
		if (e.type === "code") return /* @__PURE__ */ L("code", {
			class: H.code,
			children: e.text
		}, t);
		if (e.type === "strong") return /* @__PURE__ */ L("strong", { children: U(e.children) }, t);
		if (e.type === "em") return /* @__PURE__ */ L("em", { children: U(e.children) }, t);
		let n = /^https?:/.test(e.href);
		return /* @__PURE__ */ L("a", {
			href: e.href,
			class: H.link,
			...n && {
				target: "_blank",
				rel: "noopener noreferrer"
			},
			children: U(e.children)
		}, t);
	});
}
function W({ text: e, muted: t = !1 }) {
	return e ? /* @__PURE__ */ L("div", {
		class: `${H.markdown} ${t ? H.muted : ""}`,
		children: at(e).map((e, t) => e.type === "paragraph" ? /* @__PURE__ */ L("p", { children: U(e.children) }, t) : e.type === "heading" ? /* @__PURE__ */ L("p", {
			class: H.heading,
			children: U(e.children)
		}, t) : e.type === "codeblock" ? /* @__PURE__ */ L("pre", {
			class: H.pre,
			children: e.text
		}, t) : /* @__PURE__ */ L(e.ordered ? "ol" : "ul", { children: e.items.map((e, t) => /* @__PURE__ */ L("li", { children: U(e) }, t)) }, t))
	}) : null;
}
var G = {
	intro: "_intro_7dyte_1",
	pills: "_pills_7dyte_6",
	pill: "_pill_7dyte_6",
	title: "_title_7dyte_23",
	download: "_download_7dyte_30"
};
//#endregion
//#region src/Introduction.jsx
function ot({ info: e, openapi: t, url: n }) {
	return /* @__PURE__ */ L("section", {
		id: "introduction",
		"data-anchor": !0,
		class: G.intro,
		children: [
			/* @__PURE__ */ L("div", {
				class: G.pills,
				children: [e.version && /* @__PURE__ */ L("span", {
					class: G.pill,
					children: ["v", e.version]
				}), /* @__PURE__ */ L("span", {
					class: G.pill,
					children: ["OpenAPI ", t]
				})]
			}),
			/* @__PURE__ */ L("h1", {
				class: G.title,
				children: e.title
			}),
			/* @__PURE__ */ L(W, { text: e.description }),
			/* @__PURE__ */ L("a", {
				class: G.download,
				href: n,
				download: "openapi.json",
				children: "Download OpenAPI Document"
			})
		]
	});
}
var K = {
	tag: "_tag_wuduw_1",
	title: "_title_wuduw_10",
	card: "_card_wuduw_17",
	cardTitle: "_cardTitle_wuduw_24",
	list: "_list_wuduw_32",
	item: "_item_wuduw_38",
	path: "_path_wuduw_45",
	method: "_method_wuduw_50"
};
//#endregion
//#region src/TagSection.jsx
function st({ group: e }) {
	return /* @__PURE__ */ L("section", {
		id: e.id,
		"data-anchor": !0,
		class: K.tag,
		children: [/* @__PURE__ */ L("div", {
			class: K.left,
			children: [/* @__PURE__ */ L("h2", {
				class: K.title,
				children: e.name
			}), /* @__PURE__ */ L(W, { text: e.description })]
		}), /* @__PURE__ */ L("div", {
			class: K.card,
			children: [/* @__PURE__ */ L("div", {
				class: K.cardTitle,
				children: "Operations"
			}), /* @__PURE__ */ L("ul", {
				class: K.list,
				children: e.operations.map((e) => /* @__PURE__ */ L("li", { children: /* @__PURE__ */ L("a", {
					class: K.item,
					href: `#${e.id}`,
					children: [/* @__PURE__ */ L("span", {
						class: K.method,
						children: /* @__PURE__ */ L(et, { method: e.method })
					}), /* @__PURE__ */ L("code", {
						class: K.path,
						children: e.path
					})]
				}) }, e.id))
			})]
		})]
	});
}
var ct = {
	pill: "_pill_fi44x_1",
	required: "_required_fi44x_13"
};
//#endregion
//#region src/ui/Pill.jsx
function lt({ children: e, tone: t = "plain" }) {
	return /* @__PURE__ */ L("span", {
		class: `${ct.pill} ${ct[t]}`,
		children: e
	});
}
var q = {
	section: "_section_1lkso_1",
	header: "_header_1lkso_5",
	title: "_title_1lkso_14",
	badges: "_badges_1lkso_21",
	fields: "_fields_1lkso_28"
};
//#endregion
//#region src/InputSection.jsx
function ut({ title: e, badges: t, children: n }) {
	return /* @__PURE__ */ L("section", {
		class: q.section,
		children: [/* @__PURE__ */ L("header", {
			class: q.header,
			children: [/* @__PURE__ */ L("h4", {
				class: q.title,
				children: e
			}), t && /* @__PURE__ */ L("span", {
				class: q.badges,
				children: t
			})]
		}), /* @__PURE__ */ L("div", {
			class: q.fields,
			children: n
		})]
	});
}
//#endregion
//#region src/schema.js
function dt(e, t) {
	if (!t || typeof t != "object" || !t.$ref) return {
		schema: t || {},
		model: null
	};
	let { $ref: n, ...r } = t;
	return {
		schema: {
			...Le(e, n) || {},
			...r
		},
		model: Re(n)
	};
}
function ft(e, t) {
	if (!Array.isArray(t?.allOf)) return t;
	let { allOf: n, ...r } = t, i = {
		...r,
		properties: { ...r.properties },
		required: [...r.required || []]
	};
	for (let t of n) {
		let n = ft(e, dt(e, t).schema);
		Object.assign(i.properties, n.properties), i.required.push(...n.required || []), !i.type && n.type && (i.type = n.type), !i.description && n.description && (i.description = n.description);
	}
	return Object.keys(i.properties).length || delete i.properties, i.required.length || delete i.required, i;
}
function pt(e) {
	let t = Array.isArray(e.type) ? e.type : e.type ? [e.type] : [], n = t.filter((e) => e !== "null").join(" | ");
	return !n && e.properties && (n = "object"), !n && e.items && (n = "array"), !n && e.enum && (n = typeof e.enum[0]), {
		type: n,
		nullable: t.includes("null") || e.nullable === !0
	};
}
function mt(e) {
	let t = [], n = (n, r) => e[n] !== void 0 && t.push(`${r}: ${e[n]}`);
	return n("minLength", "min length"), n("maxLength", "max length"), n("minimum", "min"), n("maximum", "max"), n("exclusiveMinimum", "greater than"), n("exclusiveMaximum", "less than"), n("minItems", "min items"), n("maxItems", "max items"), n("minProperties", "min properties"), n("maxProperties", "max properties"), n("pattern", "pattern"), e.default !== void 0 && t.push(`default: ${JSON.stringify(e.default)}`), t;
}
function ht(e) {
	if (Array.isArray(e.examples) && e.examples.length) return e.examples[0];
	if (e.example !== void 0) return e.example;
}
function gt(e, t, n = /* @__PURE__ */ new Set()) {
	let { schema: r, model: i } = dt(e, t), a = ft(e, r), { type: o, nullable: s } = pt(a), c = !!i && n.has(i), l = null;
	if (o === "array" && a.items) {
		let t = dt(e, a.items);
		l = {
			model: t.model,
			schema: ft(e, t.schema)
		};
	}
	let u = l?.schema.properties ? l.schema : a.properties ? a : null, d = a.oneOf || a.anyOf || null, f = l?.model || i, p = f ? /* @__PURE__ */ new Set([...n, f]) : n;
	return {
		schema: a,
		model: i,
		type: o,
		nullable: s,
		items: l,
		inner: c ? null : u,
		variants: c ? null : d,
		nextSeen: p
	};
}
function _t(e) {
	let { schema: t, nullable: n } = e, r = [];
	return t.format && r.push(t.format), n && r.push("nullable"), r.push(...mt(t)), Array.isArray(t.enum) && r.push(`enum: ${t.enum.map((e) => JSON.stringify(e)).join(", ")}`), r;
}
function vt(e) {
	let t = Object.keys(e?.properties || {});
	return t.length ? `{ ${t.slice(0, 4).join(", ")}${t.length > 4 ? ", …" : ""} }` : "";
}
var yt = {
	type: "_type_tj3j8_1",
	model: "_model_tj3j8_7"
};
//#endregion
//#region src/TypeLabel.jsx
function bt({ info: e }) {
	let { model: t, type: n, items: r, variants: i } = e, a = (e) => /* @__PURE__ */ L("a", {
		class: yt.model,
		href: `#model/${e}`,
		children: e
	});
	if (n === "array") {
		let e = r?.model ? a(r.model) : pt(r?.schema || {}).type || "any";
		return /* @__PURE__ */ L("span", {
			class: yt.type,
			children: [
				"array ",
				e,
				"[]"
			]
		});
	}
	return t ? a(t) : /* @__PURE__ */ L("span", {
		class: yt.type,
		children: n || (i ? "one of" : "any")
	});
}
//#endregion
//#region src/NestedFields.jsx
function xt({ info: e }) {
	if (e.variants) return e.variants.map((t, n) => /* @__PURE__ */ L(Ct, {
		name: `option ${n + 1}`,
		schema: t,
		seen: e.nextSeen
	}, n));
	let t = e.inner.required || [];
	return Object.entries(e.inner.properties || {}).map(([n, r]) => /* @__PURE__ */ L(Ct, {
		name: n,
		schema: r,
		required: t.includes(n),
		seen: e.nextSeen
	}, n));
}
var J = {
	foldable: "_foldable_lceok_1",
	row: "_row_lceok_5",
	tall: "_tall_lceok_15",
	toggle: "_toggle_lceok_21",
	title: "_title_lceok_48",
	right: "_right_lceok_53",
	body: "_body_lceok_57"
};
//#endregion
//#region src/ui/Foldable.jsx
function St({ title: e, right: t, children: n, defaultOpen: r = !1, label: i, tall: a = !1 }) {
	let [o, s] = I(r), c = () => s(!o);
	return /* @__PURE__ */ L("div", {
		class: J.foldable,
		children: [/* @__PURE__ */ L("div", {
			class: `${J.row} ${a ? J.tall : ""}`,
			onClick: (e) => {
				e.target.closest("a, button") || c();
			},
			children: [
				/* @__PURE__ */ L("button", {
					type: "button",
					class: J.toggle,
					"aria-expanded": o,
					"aria-label": i,
					onClick: c,
					children: /* @__PURE__ */ L(R, {
						name: o ? "minus" : "plus",
						size: 14
					})
				}),
				/* @__PURE__ */ L("span", {
					class: J.title,
					children: typeof e == "function" ? e(o) : e
				}),
				t && /* @__PURE__ */ L("span", {
					class: J.right,
					children: typeof t == "function" ? t(o) : t
				})
			]
		}), o && /* @__PURE__ */ L("div", {
			class: J.body,
			children: n
		})]
	});
}
var Y = {
	field: "_field_pv3dl_1",
	row: "_row_pv3dl_5",
	head: "_head_pv3dl_9",
	name: "_name_pv3dl_20",
	meta: "_meta_pv3dl_28",
	required: "_required_pv3dl_33",
	example: "_example_pv3dl_38",
	preview: "_preview_pv3dl_46",
	description: "_description_pv3dl_52"
};
//#endregion
//#region src/SchemaField.jsx
function Ct({ name: e, schema: t, required: n, seen: r = /* @__PURE__ */ new Set() }) {
	let i = gt(De(qe), t, r), a = ht(i.schema), o = vt(i.inner), s = /* @__PURE__ */ L("span", {
		class: Y.head,
		children: [
			e && /* @__PURE__ */ L("span", {
				class: Y.name,
				children: e
			}),
			/* @__PURE__ */ L(bt, { info: i }),
			_t(i).map((e, t) => /* @__PURE__ */ L("span", {
				class: Y.meta,
				children: ["· ", e]
			}, t)),
			n && /* @__PURE__ */ L("span", {
				class: Y.required,
				children: "required"
			}),
			a !== void 0 && /* @__PURE__ */ L("span", {
				class: Y.example,
				title: JSON.stringify(a, null, 2),
				children: "Example"
			}),
			o && /* @__PURE__ */ L("span", {
				class: Y.preview,
				children: o
			})
		]
	}), c = i.schema.description && /* @__PURE__ */ L("div", {
		class: Y.description,
		children: /* @__PURE__ */ L(W, {
			text: i.schema.description,
			muted: !0
		})
	});
	return !i.inner && !i.variants ? /* @__PURE__ */ L("div", {
		class: Y.field,
		children: [/* @__PURE__ */ L("div", {
			class: Y.row,
			children: s
		}), c]
	}) : /* @__PURE__ */ L("div", {
		class: Y.field,
		children: [/* @__PURE__ */ L(St, {
			title: s,
			label: `${e || "value"} fields`,
			children: /* @__PURE__ */ L(xt, { info: i })
		}), c]
	});
}
var wt = {
	fields: "_fields_bqq45_1",
	type: "_type_bqq45_5"
};
//#endregion
//#region src/SchemaFields.jsx
function Tt({ schema: e, showType: t = !1 }) {
	let n = De(qe);
	if (!e) return null;
	let r = gt(n, e, /* @__PURE__ */ new Set()), i = r.type === "object" && !r.model && !r.items;
	return /* @__PURE__ */ L("div", {
		class: wt.fields,
		children: [(t || !i) && /* @__PURE__ */ L("div", {
			class: wt.type,
			children: /* @__PURE__ */ L(bt, { info: r })
		}), (r.inner || r.variants) && /* @__PURE__ */ L(xt, { info: r })]
	});
}
var X = {
	responses: "_responses_f1ur8_1",
	title: "_title_f1ur8_5",
	head: "_head_f1ur8_14",
	status: "_status_f1ur8_22",
	summary: "_summary_f1ur8_27",
	empty: "_empty_f1ur8_31",
	description: "_description_f1ur8_37"
};
//#endregion
//#region src/Responses.jsx
function Et({ responses: e }) {
	return e.length ? /* @__PURE__ */ L("section", {
		class: X.responses,
		children: [/* @__PURE__ */ L("h4", {
			class: X.title,
			children: "Responses"
		}), e.map((e) => /* @__PURE__ */ L("div", {
			class: X.response,
			children: /* @__PURE__ */ L(St, {
				tall: !0,
				label: `Response ${e.status}`,
				title: (t) => /* @__PURE__ */ L("span", {
					class: X.head,
					children: [/* @__PURE__ */ L("span", {
						class: X.status,
						children: e.status
					}), !t && /* @__PURE__ */ L("span", {
						class: X.summary,
						children: e.description.split("\n")[0]
					})]
				}),
				right: (t) => t && e.contentType && /* @__PURE__ */ L(lt, { children: e.contentType }),
				children: [/* @__PURE__ */ L("div", {
					class: X.description,
					children: /* @__PURE__ */ L(W, {
						text: e.description,
						muted: !0
					})
				}), e.schema ? /* @__PURE__ */ L(Tt, {
					schema: e.schema,
					showType: !0
				}) : /* @__PURE__ */ L("p", {
					class: X.empty,
					children: "No body"
				})]
			})
		}, e.status))]
	}) : null;
}
var Dt = {
	bar: "_bar_1ab2x_1",
	path: "_path_1ab2x_17",
	param: "_param_1ab2x_25"
};
//#endregion
//#region src/EndpointBar.jsx
function Ot({ method: e, path: t }) {
	let n = t.split(/(\{[^}]+\})/);
	return /* @__PURE__ */ L("div", {
		class: Dt.bar,
		children: [/* @__PURE__ */ L(et, {
			method: e,
			dark: !0
		}), /* @__PURE__ */ L("code", {
			class: Dt.path,
			children: n.map((e, t) => e.startsWith("{") ? /* @__PURE__ */ L("span", {
				class: Dt.param,
				children: e
			}, t) : e)
		})]
	});
}
//#endregion
//#region src/example.js
var kt = {
	"date-time": "2026-01-01T00:00:00Z",
	date: "2026-01-01",
	time: "00:00:00Z",
	email: "user@example.com",
	uri: "https://example.com",
	url: "https://example.com",
	uuid: "123e4567-e89b-12d3-a456-426614174000",
	ipv4: "127.0.0.1",
	ipv6: "::1",
	hostname: "example.com"
}, At = 8;
function jt(e, t, n = 0, r = /* @__PURE__ */ new Set()) {
	let { schema: i, model: a } = dt(e, t);
	if (a && r.has(a)) return {};
	let o = a ? /* @__PURE__ */ new Set([...r, a]) : r, s = ft(e, i), c = ht(s);
	if (c !== void 0) return c;
	if (s.default !== void 0) return s.default;
	if (s.const !== void 0) return s.const;
	if (Array.isArray(s.enum) && s.enum.length) return s.enum[0];
	let l = s.oneOf || s.anyOf;
	if (Array.isArray(l) && l.length) return jt(e, l[0], n, o);
	if (n > At) return null;
	let { type: u } = pt(s);
	if (u === "object" || s.properties) {
		let t = {};
		for (let [r, i] of Object.entries(s.properties || {})) t[r] = jt(e, i, n + 1, o);
		return t;
	}
	return u === "array" ? s.items ? [jt(e, s.items, n + 1, o)] : [] : u === "string" ? kt[s.format] ?? "" : u === "integer" || u === "number" ? s.minimum ?? 1 : u === "boolean" || null;
}
var Mt = {
	tabs: "_tabs_1vlyl_1",
	tab: "_tab_1vlyl_1",
	active: "_active_1vlyl_25"
};
//#endregion
//#region src/ui/Tabs.jsx
function Nt({ tabs: e, active: t, onChange: n, label: r }) {
	return /* @__PURE__ */ L("div", {
		class: Mt.tabs,
		role: "tablist",
		"aria-label": r,
		children: e.map((e) => /* @__PURE__ */ L("button", {
			type: "button",
			role: "tab",
			"aria-selected": e === t,
			class: `${Mt.tab} ${e === t ? Mt.active : ""}`,
			onClick: () => n(e),
			children: e
		}, e))
	});
}
var Pt = {
	checkbox: "_checkbox_1ecj6_1",
	box: "_box_1ecj6_26"
};
//#endregion
//#region src/ui/Checkbox.jsx
function Ft({ label: e, checked: t, onChange: n }) {
	return /* @__PURE__ */ L("label", {
		class: Pt.checkbox,
		children: [
			/* @__PURE__ */ L("span", { children: e }),
			/* @__PURE__ */ L("input", {
				type: "checkbox",
				checked: t,
				onChange: (e) => n(e.currentTarget.checked)
			}),
			/* @__PURE__ */ L("span", {
				class: Pt.box,
				"aria-hidden": "true",
				children: t && /* @__PURE__ */ L(R, {
					name: "check",
					size: 12
				})
			})
		]
	});
}
//#endregion
//#region src/json.js
function It(e) {
	let t = [], n = /("(?:\\.|[^"\\])*")(\s*:)?|(-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)|\b(true|false|null)\b/g, r = 0, i;
	for (; i = n.exec(e);) i.index > r && t.push({
		type: "punct",
		text: e.slice(r, i.index)
	}), i[1] === void 0 ? i[3] === void 0 ? t.push({
		type: "literal",
		text: i[4]
	}) : t.push({
		type: "number",
		text: i[3]
	}) : (t.push({
		type: i[2] ? "key" : "string",
		text: i[1]
	}), i[2] && t.push({
		type: "punct",
		text: i[2]
	})), r = n.lastIndex;
	return r < e.length && t.push({
		type: "punct",
		text: e.slice(r)
	}), t;
}
var Lt = {
	code: "_code_pk0oo_1",
	key: "_key_pk0oo_12",
	string: "_string_pk0oo_13",
	number: "_number_pk0oo_14",
	literal: "_literal_pk0oo_15"
};
//#endregion
//#region src/ui/CodeBlock.jsx
function Rt({ value: e }) {
	let t = typeof e == "string" ? e : JSON.stringify(e, null, 2);
	return /* @__PURE__ */ L("pre", {
		class: Lt.code,
		children: /* @__PURE__ */ L("code", { children: It(t).map((e, t) => e.type === "punct" ? e.text : /* @__PURE__ */ L("span", {
			class: Lt[e.type],
			children: e.text
		}, t)) })
	});
}
var zt = { button: "_button_lse6e_1" };
//#endregion
//#region src/ui/CopyButton.jsx
function Bt({ text: e, label: t = "Copy" }) {
	let [n, r] = I(!1);
	async function i() {
		try {
			await navigator.clipboard.writeText(e), r(!0), setTimeout(() => r(!1), 1200);
		} catch {}
	}
	return /* @__PURE__ */ L("button", {
		type: "button",
		class: zt.button,
		onClick: i,
		"aria-label": t,
		title: t,
		children: /* @__PURE__ */ L(R, {
			name: n ? "check" : "copy",
			size: 15
		})
	});
}
var Z = {
	card: "_card_1xtgd_1",
	header: "_header_1xtgd_9",
	actions: "_actions_1xtgd_19",
	body: "_body_1xtgd_25",
	empty: "_empty_1xtgd_31",
	footer: "_footer_1xtgd_39"
};
//#endregion
//#region src/ExampleCard.jsx
function Vt({ responses: e }) {
	let t = De(qe), [n, r] = I(e[0]?.status), [i, a] = I(!1);
	if (!e.length) return null;
	let o = e.find((e) => e.status === n) || e[0], s = o.schema ? i ? o.schema : jt(t, o.schema) : null, c = s === null ? "" : JSON.stringify(s, null, 2);
	return /* @__PURE__ */ L("div", {
		class: Z.card,
		children: [
			/* @__PURE__ */ L("div", {
				class: Z.header,
				children: [/* @__PURE__ */ L(Nt, {
					tabs: e.map((e) => e.status),
					active: o.status,
					onChange: r,
					label: "Response status"
				}), /* @__PURE__ */ L("span", {
					class: Z.actions,
					children: [c && /* @__PURE__ */ L(Bt, {
						text: c,
						label: "Copy example"
					}), o.schema && /* @__PURE__ */ L(Ft, {
						label: "Show Schema",
						checked: i,
						onChange: a
					})]
				})]
			}),
			/* @__PURE__ */ L("div", {
				class: Z.body,
				children: c ? /* @__PURE__ */ L(Rt, { value: c }) : /* @__PURE__ */ L("p", {
					class: Z.empty,
					children: "No body"
				})
			}),
			o.description && /* @__PURE__ */ L("div", {
				class: Z.footer,
				children: o.description.split("\n")[0]
			})
		]
	});
}
var Q = {
	operation: "_operation_yif9z_1",
	left: "_left_yif9z_9",
	title: "_title_yif9z_13",
	right: "_right_yif9z_20",
	sticky: "_sticky_yif9z_24",
	actions: "_actions_yif9z_29"
}, Ht = [
	["path", "Path Parameters"],
	["query", "Query Parameters"],
	["header", "Headers"],
	["cookie", "Cookies"]
];
function Ut({ op: e }) {
	return /* @__PURE__ */ L("section", {
		id: e.id,
		"data-anchor": !0,
		class: Q.operation,
		children: [/* @__PURE__ */ L("div", {
			class: Q.left,
			children: [
				/* @__PURE__ */ L("h3", {
					class: Q.title,
					children: e.label
				}),
				/* @__PURE__ */ L(W, { text: e.description }),
				Ht.map(([t, n]) => e.params[t].length > 0 && /* @__PURE__ */ L(ut, {
					title: n,
					children: e.params[t].map((e) => /* @__PURE__ */ L(Ct, {
						name: e.name,
						required: e.required,
						schema: e.description ? {
							...e.schema,
							description: e.description
						} : e.schema
					}, e.name))
				}, t)),
				e.body && /* @__PURE__ */ L(ut, {
					title: "Body",
					badges: /* @__PURE__ */ L(C, { children: [e.body.required && /* @__PURE__ */ L(lt, {
						tone: "required",
						children: "required"
					}), /* @__PURE__ */ L(lt, { children: e.body.contentType })] }),
					children: [/* @__PURE__ */ L(W, {
						text: e.body.description,
						muted: !0
					}), /* @__PURE__ */ L(Tt, { schema: e.body.schema })]
				}),
				/* @__PURE__ */ L(Et, { responses: e.responses })
			]
		}), /* @__PURE__ */ L("div", {
			class: Q.right,
			children: /* @__PURE__ */ L("div", {
				class: Q.sticky,
				children: [
					/* @__PURE__ */ L("div", {
						class: Q.actions,
						children: e.auth && /* @__PURE__ */ L(C, { children: [/* @__PURE__ */ L(R, {
							name: "lock",
							size: 14
						}), " Auth Required"] })
					}),
					/* @__PURE__ */ L(Ot, {
						method: e.method,
						path: e.path
					}),
					/* @__PURE__ */ L(Vt, { responses: e.responses })
				]
			})
		})]
	});
}
var Wt = {
	models: "_models_jw02e_1",
	title: "_title_jw02e_7",
	model: "_model_jw02e_1",
	name: "_name_jw02e_20",
	body: "_body_jw02e_31"
};
//#endregion
//#region src/Models.jsx
function Gt({ models: e }) {
	return e.length ? /* @__PURE__ */ L("section", {
		id: "models",
		"data-anchor": !0,
		class: Wt.models,
		children: [/* @__PURE__ */ L("h2", {
			class: Wt.title,
			children: "Models"
		}), e.map((e) => /* @__PURE__ */ L("article", {
			id: e.id,
			"data-anchor": !0,
			class: Wt.model,
			children: [/* @__PURE__ */ L("h3", {
				class: Wt.name,
				children: e.name
			}), /* @__PURE__ */ L("div", {
				class: Wt.body,
				children: [/* @__PURE__ */ L(W, {
					text: e.schema?.description,
					muted: !0
				}), /* @__PURE__ */ L(Tt, { schema: e.schema })]
			})]
		}, e.id))]
	}) : null;
}
var $ = {
	app: "_app_134rt_1",
	sidebar: "_sidebar_134rt_5",
	content: "_content_134rt_16",
	topbar: "_topbar_134rt_22",
	backdrop: "_backdrop_134rt_26",
	message: "_message_134rt_30",
	topbarTitle: "_topbarTitle_134rt_56",
	menuButton: "_menuButton_134rt_63",
	sidebarOpen: "_sidebarOpen_134rt_86"
};
//#endregion
//#region src/App.jsx
function Kt({ url: e }) {
	let [t, n] = I({ status: "loading" }), [r, i] = I(!1), a = Ye(t.status === "ready");
	if (Ee(() => {
		fetch(e).then((t) => {
			if (!t.ok) throw Error(`Could not load ${e} (HTTP ${t.status}).`);
			return t.json().catch(() => {
				throw Error(`${e} is not valid JSON.`);
			});
		}).then((e) => {
			let t = Ke(e);
			document.title = `${t.info.title} – API Docs`, n({
				status: "ready",
				doc: e,
				model: t
			});
		}).catch((e) => n({
			status: "error",
			message: e.message
		}));
	}, [e]), t.status === "loading") return /* @__PURE__ */ L("p", {
		class: $.message,
		children: "Loading API docs…"
	});
	if (t.status === "error") return /* @__PURE__ */ L("div", {
		class: $.message,
		role: "alert",
		children: [/* @__PURE__ */ L("strong", { children: "The API docs could not be shown." }), /* @__PURE__ */ L("p", { children: t.message })]
	});
	let { doc: o, model: s } = t, c = () => i(!1);
	return /* @__PURE__ */ L(qe.Provider, {
		value: o,
		children: /* @__PURE__ */ L("div", {
			class: $.app,
			children: [
				/* @__PURE__ */ L("header", {
					class: $.topbar,
					children: [/* @__PURE__ */ L("button", {
						type: "button",
						class: $.menuButton,
						"aria-label": r ? "Close menu" : "Open menu",
						"aria-expanded": r,
						onClick: () => i(!r),
						children: /* @__PURE__ */ L(R, {
							name: r ? "close" : "menu",
							size: 18
						})
					}), /* @__PURE__ */ L("span", {
						class: $.topbarTitle,
						children: s.info.title
					})]
				}),
				/* @__PURE__ */ L("aside", {
					class: `${$.sidebar} ${r ? $.sidebarOpen : ""}`,
					children: /* @__PURE__ */ L(nt, {
						model: s,
						activeId: a,
						onNavigate: c
					})
				}),
				r && /* @__PURE__ */ L("div", {
					class: $.backdrop,
					onClick: c
				}),
				/* @__PURE__ */ L("main", {
					class: $.content,
					children: [
						/* @__PURE__ */ L(ot, {
							info: s.info,
							openapi: s.openapi,
							url: e
						}),
						s.untagged.map((e) => /* @__PURE__ */ L(Ut, { op: e }, e.id)),
						s.groups.map((e) => /* @__PURE__ */ L("div", { children: [/* @__PURE__ */ L(st, { group: e }), e.operations.map((e) => /* @__PURE__ */ L(Ut, { op: e }, e.id))] }, e.id)),
						/* @__PURE__ */ L(Gt, { models: s.models })
					]
				})
			]
		})
	});
}
//#endregion
//#region src/specUrl.js
function qt(e, t) {
	let n = new URLSearchParams(e.search).get("spec") || t?.dataset?.spec || "./openapi.json";
	return new URL(n, e.href).href;
}
//#endregion
//#region src/main.jsx
var Jt = document.getElementById("app") || document.body.appendChild(document.createElement("div"));
fe(/* @__PURE__ */ L(Kt, { url: qt(window.location, Jt) }), Jt);
//#endregion
