/*
 * L.Grid displays a grid of lat/lng lines on the map.
 */


L.Grid = L.LayerGroup.extend({
	options: {
		xticks: 16,
		yticks: 12,
		styles: {
			all: {
				stroke: true,
				color: '#111',
				weight: 5,
				opacity: 0.6
			},
			minor: {
				weight: 1,
				opacity: 0.6
			},
			major: {
				weight: 2,
				opacity: 0.9
			}
		}
	},

	initialize: function (options) {
		L.LayerGroup.prototype.initialize.call(this);
		L.Util.setOptions(this, options);

	},
	redraw: function () {
		this._bounds = this._map.getBounds().pad(0.5);

		var grid = [];
		var i;

		// Choose a major grid lines
		var majorLat = this._majorLatitude();
		grid.push(this._horizontalLine(majorLat, 'major'));
		grid.push(this._label('lat', majorLat));

		var minors = this._minorLatitudes(majorLat);
		for (i in minors) {
			grid.push(this._horizontalLine(minors[i], 'minor'));
			grid.push(this._label('lat', minors[i]));
		}

		var majorLng = this._majorLongitude();
		grid.push(this._verticalLine(majorLng, 'major'));
		grid.push(this._label('lng', majorLng));

		minors = this._minorLongitudes(majorLng);
		for (i in minors) {
			grid.push(this._verticalLine(minors[i], 'minor'));
			grid.push(this._label('lng', minors[i]));
		}

		this.eachLayer(this.removeLayer, this);

		for (i in grid) {
			this.addLayer(grid[i]);
		}
		return this;
	},

	onAdd: function (map) {
		this._map = map;

		var grid = this.redraw();
		this._map.on('viewreset move', function () {
			grid.redraw();
		});

		this.eachLayer(map.addLayer, map);
	},
	_majorLongitude: function () {
		if (this._bounds.getEast() > 0 && this._bounds.getWest() < 0) {
			// Greenwich 0-meredian
			return 0;
		} else {
			var dlng = this._bounds.getEast() - this._bounds.getWest();
			return this.round(this._bounds.getWest() + 2 * (dlng / this.options.xticks), dlng);
		}
	},
	_majorLatitude: function () {
		if (this._bounds.getSouth() < 0 && this._bounds.getNorth() > 0) {
			// equator
			return 0;
		} else {
			var dlat = this._bounds.getNorth() - this._bounds.getSouth();
			return this.round(this._bounds.getNorth() - dlat / this.options.yticks, dlat);
		}
	},

	_minorLatitudes: function (majorLat) {
		var ticks = this.options.yticks;
		var dlat = this._bounds.getNorth() - this._bounds.getSouth();
		var tick = dlat / ticks;
		var ret = [];

		for (var i = -1; i <= ticks; i++) {
			if (i === 0) {
				continue;
			}
			var lat = majorLat - (i * tick);
			ret.push(lat);

		}
		return ret;
	},
	_minorLongitudes: function (majorLng) {
		var ticks = this.options.yticks;
		var dlng = this._bounds.getEast() - this._bounds.getWest();
		var tick = dlng / ticks;
		var ret = [];

		for (var i = -1; i <= ticks; i++) {
			if (i === 0) {
				continue;
			}
			var lat = majorLng + (i * tick);
			ret.push(lat);

		}
		return ret;
	},

	_verticalLine: function (lng, type) {
		return new L.Polyline([
			[this._bounds.getNorth(), lng],
			[this._bounds.getSouth(), lng]
		], this._getTypeStyle(type));
	},
	_horizontalLine: function (lat, type) {
		return new L.Polyline([
			[lat, this._bounds.getWest()],
			[lat, this._bounds.getEast()]
		], this._getTypeStyle(type));
	},

	_getTypeStyle: function (type) {
		return L.Util.extend({}, this.options.styles.all, this.options.styles[type]);
	},

	round: function (num, delta) {
		var ret;

		delta = Math.abs(delta);
		var div = 60;
		if (delta > 100) {
			return Math.floor(num / 30) * 30;
		} else if (delta > 60) {
			return Math.floor(num / 15) * 15;
		} else if(delta > 10) {
			div = 6;
		}
		return Math.round(num * div) / div;
	},

	_label: function (axis, num) {
		var location;
		var bounds = this._map.getBounds().pad(-0.01);
		if (axis == 'lat') {
			location = L.latLng(num, bounds.getWest());
		} else {
			location = L.latLng(bounds.getNorth(), num);
		}
		console.log(location.toString());
		return L.marker(location, {
			icon: L.divIcon({
				iconSize: [0, 0],
				className: 'leaflet-grid-label leaflet-grid-label-' + axis,
				html: '<div class="' + axis + '">' + this.formatCoord(num) + '</div>'
			})
		});
	},

	formatCoord: function (coord) {
		// if (this.options.style === 'decimal') {
			return L.Util.formatNum(coord, 2);
		// } else {
			// return 'Not implemented';
		// }
	}

});

L.grid = function (options) {
	return new L.Grid(options);
};
