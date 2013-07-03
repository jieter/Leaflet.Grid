/*
 * L.Grid displays a grid of lat/lng lines on the map.
 */


L.Grid = L.LayerGroup.extend({
	options: {
		xticks: 12,
		yticks: 8,

		coordStyle: 'MinDec', // decimal or one of the templates below
		coordTemplates: {
			'MinDec': '{deg}&deg;&nbsp;{minDec}\'{dir}',
			'DMS': '{degAbs}{dir}{min}\'{sec}"'
		},
		lineStyle: {
			stroke: true,
			color: '#111',
			opacity: 0.6,
			weight: 1
		}
	},

	initialize: function (options) {
		L.LayerGroup.prototype.initialize.call(this);
		L.Util.setOptions(this, options);

	},

	onAdd: function (map) {
		this._map = map;

		var grid = this.redraw();
		this._map.on('viewreset move', function () {
			grid.redraw();
		});

		this.eachLayer(map.addLayer, map);
	},

	redraw: function () {
		// pad the bounds to make sure we draw the lines a little longer
		this._bounds = this._map.getBounds().pad(0.5);

		var grid = [];
		var i;

		var latLines = this._latLines();
		for (i in latLines) {
			if (Math.abs(latLines[i]) > 90) {
				continue;
			}
			grid.push(this._horizontalLine(latLines[i]));
			grid.push(this._label('lat', latLines[i]));
		}

		var lngLines = this._lngLines();
		for (i in lngLines) {
			grid.push(this._verticalLine(lngLines[i]));
			grid.push(this._label('lng', lngLines[i]));
		}

		this.eachLayer(this.removeLayer, this);

		for (i in grid) {
			this.addLayer(grid[i]);
		}
		return this;
	},

	_latLines: function () {
		var ticks = this.options.yticks,
			north = this._bounds.getNorth(),
			south = this._bounds.getSouth();

		var delta = north - south,
			tick = this.snap(delta / ticks, delta);
		// TODO fix zero tick size

		if (this._containsEquator()) {
			north = Math.floor(north / tick) * tick;
		} else {
			north = this.snap(north + 0.5 * tick);
		}

		return this._lines(north, ticks, -tick);
	},
	_lngLines: function () {
		var ticks = this.options.xticks,
			west = this._bounds.getWest(),
			east = this._bounds.getEast();

		var delta = west - east;
			tick = this.snap(delta / ticks, delta);
		// TODO fix zero tick size

		if (this._containsIRM()) {
			west = Math.floor(west / tick) * tick;
		} else {
			west = this.snap(west + 0.5 * tick);
		}

		return this._lines(west, ticks, -tick);
	},

	_lines: function (base, count, size) {
		var lines = [];
		for (var i = 0; i <= count; i++) {
			lines.push(base + (i * size));
		}
		return lines;
	},

	_containsEquator: function () {
		var bounds = this._map.getBounds();

		return bounds.getSouth() < 0 && bounds.getNorth() > 0;
	},

	_containsIRM: function () {
		var bounds = this._map.getBounds();

		return bounds.getWest() < 0 && bounds.getEast() > 0;
	},

	_verticalLine: function (lng) {
		return new L.Polyline([
			[this._bounds.getNorth(), lng],
			[this._bounds.getSouth(), lng]
		], this.options.lineStyle);
	},
	_horizontalLine: function (lat) {
		return new L.Polyline([
			[lat, this._bounds.getWest()],
			[lat, this._bounds.getEast()]
		], this.options.lineStyle);
	},

	snap: function (num, delta) {
		var ret;

		delta = Math.abs(delta);
		var div = 60;
		if (delta > 100) {
			return Math.floor(num / 15) * 15;
		} else if (delta > 50) {
			return Math.floor(num / 5) * 5;
		} else if(delta > 10) {
			div = 6;
		} else {
			div = 1;
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

		return L.marker(location, {
			icon: L.divIcon({
				iconSize: [0, 0],
				className: 'leaflet-grid-label leaflet-grid-label-' + axis,
				html: '<div class="' + axis + '">' + this.formatCoord(num, axis) + '</div>'
			})
		});
	},

	formatCoord: function (num, axis, style) {
		if (!style) {
			style = this.options.coordStyle;
		}
		switch (style) {
			case 'decimal':
				var digits;
				if (num >= 10) {
					digits = 2;
				} else if (num >= 1) {
					digits = 3;
				} else {
					digits = 4;
				}
				return num.toFixed(digits);

			default:
				var deg = Math.floor(num);
				var min = ((num - deg) * 60);
				var sec = Math.floor((min - Math.floor(min)) * 60);

				var dir;
				if (deg === 0) {
					dir = '&nbsp;';
				} else {
					if (axis == 'lat') {
						dir = (deg > 0 ? 'N' : 'S');
					} else {
						dir = (deg > 0 ? 'E' : 'W');
					}
				}

				return L.Util.template(this.options.coordTemplates[style], {
					deg: deg,
					degAbs: Math.abs(deg),
					min: Math.floor(min),
					minDec: Math.round(min),
					sec: Math.floor(sec),
					dir: dir
				});
		}
	}

});

L.grid = function (options) {
	return new L.Grid(options);
};
