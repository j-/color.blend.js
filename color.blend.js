(function (root) {

'use strict';

var R = Color.R, G = Color.G, B = Color.B;
var min = Math.min, max = Math.max, abs = Math.abs;
var ceil = Math.ceil, floor = Math.floor;

var Blend = function (fn) {
	this.colorBlend = fn;
};

Blend.defineColorBlendMode = function (fn) {
	return new Blend(fn);
};

Blend.defineChannelBlendMode = function (fn) {
	return new ChannelBlend(fn);
};

Blend.prototype.colorBlendAlpha = function (a, b, o) {
	throw new Error('Not yet implemented');
};

Blend.prototype.blend = function (a, b, o) {
	return this.colorBlendAlpha(a, b, o);
};

var ChannelBlend = function (fn) {
	this.channelBlend = fn;
};

var inherits = function (Child, Parent) {
	var Class = function () {
		this.constructor = Child;
	};
	Class.prototype = Parent.prototype;
	Child.prototype = new Class();
};

inherits(ChannelBlend, Blend);

ChannelBlend.prototype.channelBlendAlpha = function (a, b, o) {
	var fn = this.channelBlend;
	var result;
	a = fn(a, b);
	result = o * a + (1 - o) * b;
	return (a > b) ? floor(result) : ceil(result);
};

ChannelBlend.prototype.colorBlendAlpha = function (a, b, o) {
	var rgb_a = Color.getRGBArray(a);
	var rgb_b = Color.getRGBArray(b);
	return Color.parseRGBArray([
		this.channelBlendAlpha(rgb_a[R], rgb_b[R], o),
		this.channelBlendAlpha(rgb_a[G], rgb_b[G], o),
		this.channelBlendAlpha(rgb_a[B], rgb_b[B], o)
	]);
};

/*
 * Blend mode definitions.
 * See http://stackoverflow.com/q/5919663
 */

var modes = {};

modes.normal = Blend.defineChannelBlendMode(function (a, b) {
	return a;
});

modes.lighten = Blend.defineChannelBlendMode(function (a, b) {
	return (b > a) ? b : a;
});

modes.darken = Blend.defineChannelBlendMode(function (a, b) {
	return (b > a) ? a : b;
});

modes.multiply = Blend.defineChannelBlendMode(function (a, b) {
	return (a * b) / 0xff;
});

modes.average = Blend.defineChannelBlendMode(function (a, b) {
	return (a + b) / 2;
});

modes.add = Blend.defineChannelBlendMode(function (a, b) {
	return min(a + b, 0xff);
});

modes.subtract = Blend.defineChannelBlendMode(function (a, b) {
	return max(a + b - 0xff, 0);
});

modes.difference = Blend.defineChannelBlendMode(function (a, b) {
	return abs(a - b);
});

modes.negation = Blend.defineChannelBlendMode(function (a, b) {
	return 0xff - abs(0xff - a - b);
});

modes.screen = Blend.defineChannelBlendMode(function (a, b) {
	return 0xff - (((0xff - A) * (0xff - B)) >> 8);
});

// ...

// merge with base class
for (var name in modes) {
	if (Object.prototype.hasOwnProperty(modes, name)) {
		Blend[name] = modes[name];
	}
}

Color.Blend = Blend;

})();
