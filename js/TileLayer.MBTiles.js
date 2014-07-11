// source: https://github.com/stdavis/OfflineMbTiles/blob/master/www/js/TileLayer.MBTiles.js
L.TileLayer.MBTiles = L.TileLayer.extend({
	//db: SQLitePlugin
	mbTilesDB: null,

	initialize: function(url, options, db) {
		this.mbTilesDB = db;

		L.Util.setOptions(this, options);
	},
	getTileUrl: function (tilePoint, zoom, tile) {
		var z = this._getZoomForUrl();
		var x = tilePoint.x;
		var y = tilePoint.y;
		var base64Prefix = 'data:image/gif;base64,';

		this.mbTilesDB.transaction(function(tx) {
			tx.executeSql("SELECT tile_data FROM tiles WHERE zoom_level = ? AND tile_column = ? AND tile_row = ?;", [z, x, y], function (tx, res) {
				tile.src = base64Prefix + res.rows.item(0).tile_data;
			}, function (er) {
				console.log('error with executeSql', er);
			});
		});
	},
	_loadTile: function (tile, tilePoint, zoom) {
		tile._layer = this;
		tile.onload = this._tileOnLoad;
		tile.onerror = this._tileOnError;
		this.getTileUrl(tilePoint, zoom, tile);
	}
});
