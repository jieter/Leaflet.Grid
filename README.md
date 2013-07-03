Leaflet.Grid
------------

Display a grid overlay on a Leaflet map.

Usage
-----
L.Grid currently needs some CSS to look nice:

```CSS
.leaflet-grid-label {
  border: 0;
}
.leaflet-grid-label .lng {
  margin-left: 8px;
  -webkit-transform: rotate(90deg);
  -ms-transform: rotate(90deg);
  -o-transform: rotate(90deg);
  transform: rotate(90deg);
}
```
Then, after including the `L.Grid.js` file and creating the map, just call:

```JavaScript
L.grid().addTo(map);
```

TODO
----
 - Fix snapping / tick size for small zoomlevels
 - Remove custom CSS someway.

Ideas
-----
 - Make center fixable
 - Wrapping of big longitudes


