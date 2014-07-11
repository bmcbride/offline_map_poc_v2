var map, db, lyr, mapquestOSM, mapquestOAM;

function onBodyLoad() {
	document.addEventListener("deviceready", go, false);
}

function go() {
	$('#button1').click(loadDatabase);
}

function onSuccess(fs) {
	fs.root.getDirectory("databases", { create: true }, function(dataEntry) {
		var ft = new FileTransfer();
		ft.download("http://bryanmcbride.com/offline_map_poc_v2/open-streets-dc.mbtiles",
			"cdvfile://localhost/persistent/../../databases/Database.db", function(entry) {
			$('#information').html(
				alertHtml("Successfully downloaded the file to " + entry.toURL()) 
			);
			$('#button1').unbind();
			$('#button1').html("Display");
			$('#button1').click(function () {
				$('#map').toggle();
				buildMap();
			});
		}, function(error) {
			$('#information').html(
				alertHtml("Error in dowloading the file from" + error.source + 
					"<br>error target" + error.target + ": " + error.code)
			);
			console.log("error source " + error.source);
			console.log("error target " + error.target);
			console.log("error code " + error.code);
		}, false, null);    
	}, function() {
		$('#information').html(alertHtml("Couldn't create a databases directory"));
	});
}

function onError() {
	$('#information').html(alertHtml("couldn't retrieve local file system"));
}

function loadDatabase() {
	window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, onSuccess, onError);
}

function buildMap() {
	db = window.sqlitePlugin.openDatabase({
		name : "Database"
	});

	map = new L.Map('map', {
		center : new L.LatLng(41.311000, -72.927000),
		zoom : 14
	});

	lyr = new L.TileLayer.MBTiles('', {
		maxZoom : 17,
		scheme : 'tms'/*,
		tms: true*/
	}, db);

	mapquestOSM = L.tileLayer("http://{s}.mqcdn.com/tiles/1.0.0/osm/{z}/{x}/{y}.png", {
	  maxZoom: 19,
	  subdomains: ["otile1", "otile2", "otile3", "otile4"],
	  attribution: 'Tiles courtesy of <a href="http://www.mapquest.com/" target="_blank">MapQuest</a> <img src="http://developer.mapquest.com/content/osm/mq_logo.png">. Map data (c) <a href="http://www.openstreetmap.org/" target="_blank">OpenStreetMap</a> contributors, CC-BY-SA.'
	});

	map.addLayer(mapquestOSM);

	mapquestOAM = L.tileLayer("http://{s}.mqcdn.com/tiles/1.0.0/sat/{z}/{x}/{y}.jpg", {
	  maxZoom: 18,
	  subdomains: ["oatile1", "oatile2", "oatile3", "oatile4"],
	  attribution: 'Tiles courtesy of <a href="http://www.mapquest.com/" target="_blank">MapQuest</a>. Portions Courtesy NASA/JPL-Caltech and U.S. Depart. of Agriculture, Farm Service Agency'
	});

	var baseLayers = {
	  "Street Map": mapquestOSM,
	  "Aerial Imagery": mapquestOAM
	};

	var overlayLayers = {
	  "Offline": lyr
	};

	L.control.layers(baseLayers, overlayLayers).addTo(map);
}

function alertHtml(content) {
	return '<div class="alert alert-info alert-dismissable">' +
	'<button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button>' + 
	'<strong>Info</strong>' + content + '</div>';
}
