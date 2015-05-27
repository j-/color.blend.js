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
	return 0xff - (((0xff - a) * (0xff - b)) >> 8);
});

modes.exclusion = Blend.defineChannelBlendMode(function (a, b) {
	return a + b - 2 * a * b / 0xff;
});

modes.overlay = Blend.defineChannelBlendMode(function (a, b) {
	return (b < 0x80) ? (2 * a * b / 0xff) : (0xff - 2 * (0xff - a) * (0xff - b) / 0xff);
});

modes.softLight = Blend.defineChannelBlendMode(function (a, b) {
	if (b < 0x80) {
		return (2 * ((a >> 1) + 0x40)) * (b / 0xff);
	}
	return 0xff - (2 * (0xff - ((a >> 1) + 0x40)) * (0xff - b) / 0xff);
});

modes.hardLight = Blend.defineChannelBlendMode(function (a, b) {
	return modes.overlay.channelBlend(b, a);
});

modes.colorDodge = Blend.defineChannelBlendMode(function (a, b) {
	return (b === 0xff) ? b : min(0xff, ((a << 0x10) / (0xff - b)));
});

modes.colorBurn = Blend.defineChannelBlendMode(function (a, b) {
	return (b === 0) ? b : max(0, 0xff - ((0xff - a) << 0x10) / b);
});

modes.linearDodge = Blend.defineChannelBlendMode(function (a, b) {
	return modes.add.channelBlend(a, b);
});

modes.linearBurn = Blend.defineChannelBlendMode(function (a, b) {
	return modes.subtract.channelBlend(a, b);
});

modes.linearLight = Blend.defineChannelBlendMode(function (a, b) {
	if (b < 0x80) {
		return modes.linearBurn.channelBlend(a, 2 * b);
	}
	return modes.linearDodge.channelBlend(a, 2 * (b - 0x80));
});

modes.vividLight = Blend.defineChannelBlendMode(function (a, b) {
	if (b < 0x80) {
		return modes.colorBurn.channelBlend(a, 2 * b);
	}
	return modes.colorDodge.channelBlend(a, 2 * (b - 0x80));
});

modes.pinLight = Blend.defineChannelBlendMode(function (a, b) {
	if (b < 0x80) {
		return modes.darken.channelBlend(a, 2 * b);
	}
	return modes.lighten.channelBlend(a, 2 * (b - 0x80));
});

modes.hardMix = Blend.defineChannelBlendMode(function (a, b) {
	return (modes.vividLight.channelBlend(a, b) < 0x80) ? 0 : 0xff;
});

modes.reflect = Blend.defineChannelBlendMode(function (a, b) {
	return (b === 0xff) ? b : min(0xff, a * a / (0xff - b));
});

modes.glow = Blend.defineChannelBlendMode(function (a, b) {
	return modes.reflect.channelBlend(b, a);
});

modes.phoenix = Blend.defineChannelBlendMode(function (a, b) {
	return min(a, b) - max(a, b) + 0xff;
});

// ...

// merge with base class
Blend.modes = modes;
for (var name in modes) {
	Blend[name] = modes[name];
}

Color.Blend = Blend;

})();
