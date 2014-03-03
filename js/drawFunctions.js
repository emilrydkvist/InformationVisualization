//Global variables
var currentView = "";
var hourMin = 0;
var hourMax = 24;
var overlays = [];


//function to clear all overlays on the map
//each time an overlay is created it has to be added to the array overlays
function clearOverlays(){
	while(overlays[0])
	{
		overlays.pop().setMap(null);
	}
}


//function to clear information in the infobox before you print out new info
function clearBox(elementID)
{
    document.getElementById(elementID).innerHTML = "";
}

function latlonToMeters(lon1, lat1, lon2, lat2){
	var R = 6378.137; // Radius of earth in KM
    var dLat = (lat2 - lat1) * Math.PI / 180;
    var dLon = (lon2 - lon1) * Math.PI / 180;
    var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    	Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    	Math.sin(dLon/2) * Math.sin(dLon/2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    var d = R * c;
    return d * 1000; // meters
}

function velocityToColor(velocity){
	if(velocity < 7)
		return '#F00';
	else if(velocity >= 7 && velocity < 60)
		return '#e59400';
	else if(velocity >= 60 && velocity < 90)
		return '#FF0';
	else
		return '#0F0';
}

function directionToColor(direction)
{
	if(direction == "N")
		return '#e41a1c';
	else if(direction == "S")
		return '#377eb8';
	else if(direction == "E")
		return '#4daf4a';
	else if(direction == "W")
		return '#984ea3';
	else if(direction == "NE")
		return '#ff7f00';
	else if(direction == "NW")
		return '#ffff33';
	else if(direction == "SE")
		return '#a65628';
	else if(direction == "SW")
		return '#f781bf';

}

function checkDirection(lat1, lat2, lon1, lon2){
	var Direction;

	var latDiff = lat2 - lat1;
	var lonDiff = lon2 - lon1;
	var latDirDiff = latDiff - lonDiff;
	var lonDirDiff = lonDiff - latDiff;

	if(latDiff == 0 && lonDiff == 0)
		return -1;

	var diagConst = 0.707107;
	var vecLength = Math.sqrt((latDiff*latDiff) + (lonDiff*lonDiff));
	latDiff = latDiff/vecLength;
	lonDiff = lonDiff/vecLength;

	if(latDiff >= 0 && lonDiff >= 0) //First quadrant
	{
		if((latDiff*1 + lonDiff*0) > 0.75)
			Direction = "N";
		else if((latDiff*diagConst + lonDiff*diagConst) >= 0.75)
			Direction = "NE";
		else
			Direction = "E";

	}
	else if(latDiff >= 0 && lonDiff < 0) //Second quadrant
	{
		if((latDiff*1 + lonDiff*0) > 0.75)
			Direction = "N";
		else if((latDiff*diagConst - lonDiff*diagConst) >= 0.75)
			Direction = "NW";
		else
			Direction = "W";
	}
	else if(latDiff < 0 && lonDiff < 0) //Third quadrant
	{
		if((latDiff*0 - lonDiff*1) > 0.75)
			Direction = "W";
		else if((-latDiff*diagConst -lonDiff*diagConst) >= 0.75)
			Direction = "SW";
		else
			Direction = "S";				
	}
	else if(latDiff < 0 && lonDiff >= 0) //Fourth quadrant
	{
		if((-latDiff*1 + lonDiff*0) > 0.75)
			Direction = "S";
		else if((-latDiff*diagConst + lonDiff*diagConst) >= 0.75)
			Direction = "SE";
		else
			Direction = "E";
	}
	return Direction;
}


function drawCurrent(min, max){
	if(currentView == "standard")
		drawpaths(min, max);
	else if(currentView == "speed")
		drawPathSpeed(min, max);
	else if(currentView == "animate")
		animatePaths(min, max);
	else if(currentView == "slowTraffic")
		drawSlowTraffic(min, max);
	else
		alert("no view is currently set.");
}

function drawpaths(min, max)
{
	currentView = "standard";

	clearBox('infobox');

	var hourMin = min||0;
	var hourMax = max||24;

	if ((max-min)==0){
		hourMin=0;
		hourMax=24;
	}

	$("#loading").show();
	document.getElementById('loading').style.visibility = 'visible';
	setTimeout(loop, 5);

	function loop()
	{
		clearOverlays();

		var paths = [];
		
		for (var i=1; i<carData.length; i++)
		{
			var trajectory = [];
			
			for(var j=0; j<2; j++)
			{
				if(Number(carData[i][j]['hour']) >= hourMin && Number(carData[i][j]['hour']) <= hourMax)
				{
					trajectory.push(new google.maps.LatLng(carData[i][j]['lat'], carData[i][j]['lon']));
				}		
			}
			paths.push(trajectory);

		}
		
		for(var i=0; i<paths.length; i++)
		{
			var path = new google.maps.Polyline({
			  path: paths[i],
			  geodesic: true,
			  strokeColor: '#00F',
			  strokeOpacity: 0.2,
			  strokeWeight: 1,
			});

			//Pathen ritas ut
			path.setMap(map);
			overlays.push(path);
		}
		
		document.getElementById('loading').style.visibility = 'hidden';
	}
}


function drawPathSpeed(min, max){

	currentView = "speed";

	clearBox('infobox');

	var hourMin = min||0;
	var hourMax = max||24;
	
	if ((max-min)==0){
		hourMin=0;
		hourMax=24;
	}

	$("#loading").show();
	document.getElementById('loading').style.visibility = 'visible';
	setTimeout(loop, 5);

	function loop()
	{
		clearOverlays();

		for (var i=1; i<carData.length; i++)
		{
			for(var j=0; j<(carData[i].length-1); j++)
			{
				var paths = [];
				
				if(Number(carData[i][j]['hour']) >= hourMin && Number(carData[i][j]['hour']) <= hourMax)
				{

					paths.push(new google.maps.LatLng(carData[i][j]['lat'], carData[i][j]['lon']));	
					paths.push(new google.maps.LatLng(carData[i][j+1]['lat'], carData[i][j+1]['lon']));	

					var distance = latlonToMeters(Number(carData[i][j]['lon']), Number(carData[i][j]['lat']), Number(carData[i][j+1]['lon']), Number(carData[i][j+1]['lat']));

					var Date1 = new Date(07, 3, 4, carData[i][j]['hour'], carData[i][j]['min'], carData[i][j]['sec']);

					var Date2 = new Date(07, 3, 4, carData[i][j+1]['hour'], carData[i][j+1]['min'], carData[i][j+1]['sec']);

					var time = Math.abs(Date2-Date1)/1000;
					
					var velocity = distance/time*3.6;

					var path = new google.maps.Polyline({
					  path: paths,
					  geodesic: true,
					  strokeColor: velocityToColor(velocity),
					  strokeOpacity: 0.2,
					  strokeWeight: 1,
					});

					//Pathen ritas ut
					path.setMap(map);
					overlays.push(path);
				}
			}
		}
		document.getElementById('loading').style.visibility = 'hidden';

		//Update infobox

		//Create the squares
		var squares = '<rect x="20" y="100" rx="5" ry="5" width="20" height="20" stroke="black" stroke-width="1" fill="#F00"></rect>'+
		'<rect x="20" y="140" rx="5" ry="5" width="20" height="20" stroke="black" stroke-width="1" fill="#e59400"></rect>'+ 
		'<rect x="20" y="180" rx="5" ry="5" width="20" height="20" stroke="black" stroke-width="1" fill="#FF0"></rect>'+
		'<rect x="20" y="220" rx="5" ry="5" width="20" height="20" stroke="black" stroke-width="1" fill="#0F0"></rect>';

		var title = '<p>Current view: Car speeds </p>';

		var textList = '<li> < 7 km/h </li>'+ '<li> 7-30 km/h </li>'+ '<li> 30-90 km/h </li>'+ '<li> > 90 km/h </li>';
		var list = '<ol>' + textList + '</ol>';
		//<rect x="20" y="180" rx="10" ry="10" width="30" height="30" fill="#FF0"/>

		//Create the receptacle for the squares
		var receptacle = document.getElementById('infobox');

		//Wrap the svg string to a svg object
		var svgfragment = '<svg>' + squares + '</svg>';

		//Add the svg to the div
		receptacle.innerHTML='' + svgfragment + list + title;

	}
				
}


function animatePaths(min, max){

	currentView = "animate";

	clearBox('infobox');

	var hourMin = min||0;
	var hourMax = max||24;
	
	if ((max-min)==0){
		hourMin=0;
		hourMax=24;
	}

	var lineSymbol = {
		path: google.maps.SymbolPath.CIRCLE,
		scale: 2,
		strokeColor: '#000',
		strokeOpacity: 1
	};

	$("#loading").show();
	document.getElementById('loading').style.visibility = 'visible';
	setTimeout(loop, 5);

	function loop()
	{
		clearOverlays();

		var paths = [];
		
		for (var i=1; i<100; i++)
		{
			var trajectory = [];
			
			for(var j=0; j<carData[i].length; j++)
			{
				if(Number(carData[i][j]['hour']) >= hourMin && Number(carData[i][j]['hour']) <= hourMax)
				{
					trajectory.push(new google.maps.LatLng(carData[i][j]['lat'], carData[i][j]['lon']));
				}	
			}
			paths.push(trajectory);
		}
		
		for(var i=0; i<paths.length; i++)
		{
			var path = new google.maps.Polyline({
			  path: paths[i],
			  icons: [{icon: lineSymbol, offset: '100%'}],
			  geodesic: true,
			  strokeColor: '#00F',
			  strokeOpacity: 0,
			  strokeWeight: 1,
			  map: map,
			});

			//Path is painted
			overlays.push(path);
			animateCircle(path);
		}	
		document.getElementById('loading').style.visibility = 'hidden';
	}
}

function animateCircle(path) {
	var count = 0;
	window.setInterval(function() {
	  count = (count + 1) % 200;

	  var icons = path.get('icons');
	  icons[0].offset = (count / 3) + '%';
	  path.set('icons', icons);
	}, 30);
}



function drawSlowdots(min, max){

	currentView = "slowTraffic"; 

	clearBox('infobox');

	var slowTrafficArr = [];
	var direction;

	var hourMin = min||0;
	var hourMax = max||24;
	
	if ((max-min)==0){
		hourMin=0;
		hourMax=24;
	}

	$("#loading").show();
	document.getElementById('loading').style.visibility = 'visible';
	setTimeout(loop, 5);

	function loop()
	{
		clearOverlays();

		for (var i=1; i<500; i++)
		{
			for(var j=0; j<(carData[i].length-1); j++)
			{
				var paths = [];

				var carInfo = [];	

				var distance = latlonToMeters(Number(carData[i][j]['lon']), Number(carData[i][j]['lat']), Number(carData[i][j+1]['lon']), Number(carData[i][j+1]['lat']));

				var Date1 = new Date(07, 3, 4, carData[i][j]['hour'], carData[i][j]['min'], carData[i][j]['sec']);

				var Date2 = new Date(07, 3, 4, carData[i][j+1]['hour'], carData[i][j+1]['min'], carData[i][j+1]['sec']);

				var time = Math.abs(Date2-Date1)/1000;
				
				var velocity = distance/time*3.6;

				if(velocity < 10)
				{
					if(Number(carData[i][j]['hour']) >= hourMin && Number(carData[i][j]['hour']) <= hourMax)
					{

						direction = checkDirection(carData[i][j]['lat'], carData[i][j+1]['lat'], carData[i][j]['lon'], carData[i][j+1]['lon']);

						var center1 = new google.maps.LatLng(carData[i][j]['lat'], carData[i][j]['lon']);	
						var center2 = new google.maps.LatLng(carData[i][j+1]['lat'], carData[i][j+1]['lon']);	

						carInfo['lat1'] = carData[i][j]['lat'];
						carInfo['lat2'] = carData[i][j+1]['lat'];
						carInfo['lon1'] = carData[i][j]['lon'];
						carInfo['lon2'] = carData[i][j+1]['lon'];
						carInfo['vel'] = velocity;
						carInfo['dir'] = direction;

						slowTrafficArr.push(carInfo);

						var dot1 = new google.maps.Circle({
						  center: center1,
						  radius: 10,
						  strokeColor: directionToColor(direction),
						  strokeOpacity: 0.8,
						  fillColor: '#F00',
						  fillOpacity: 0.35,
						  strokeWeight: 2,
						});

						var dot2 = new google.maps.Circle({
						  center: center2,
						  radius: 10,
						  strokeColor: directionToColor(direction),
						  strokeOpacity: 0.8,
						  fillColor: '#F00',
						  fillOpacity: 0.35,
						  strokeWeight: 2,
						});

						//The path is drawn
						dot1.setMap(map);
						dot2.setMap(map);
						overlays.push(dot1);
						overlays.push(dot2);
					}
				}					

				
			}
		}
		document.getElementById('loading').style.visibility = 'hidden';
	}
}


function drawSlowTraffic(min, max){

	currentView = "slowTraffic"; 

	clearBox('infobox');

	var slowTrafficArr = [];
	var direction;

	var hourMin = min||0;
	var hourMax = max||24;
	
	if ((max-min)==0){
		hourMin=0;
		hourMax=24;
	}

	$("#loading").show();
	document.getElementById('loading').style.visibility = 'visible';
	setTimeout(loop, 5);

	function loop()
	{
		clearOverlays();

		for (var i=1; i<carData.length; i++)
		{
			for(var j=0; j<(carData[i].length-1); j++)
			{
				var paths = [];

				var carInfo = [];	

				var distance = latlonToMeters(Number(carData[i][j]['lon']), Number(carData[i][j]['lat']), Number(carData[i][j+1]['lon']), Number(carData[i][j+1]['lat']));

				var Date1 = new Date(07, 3, 4, carData[i][j]['hour'], carData[i][j]['min'], carData[i][j]['sec']);

				var Date2 = new Date(07, 3, 4, carData[i][j+1]['hour'], carData[i][j+1]['min'], carData[i][j+1]['sec']);

				var time = Math.abs(Date2-Date1)/1000;
				
				var velocity = distance/time*3.6;

				if(velocity < 10)
				{
					if(Number(carData[i][j]['hour']) >= hourMin && Number(carData[i][j]['hour']) <= hourMax)
					{

						direction = checkDirection(carData[i][j]['lat'], carData[i][j+1]['lat'], carData[i][j]['lon'], carData[i][j+1]['lon']);

						paths.push(new google.maps.LatLng(carData[i][j]['lat'], carData[i][j]['lon']));	
						paths.push(new google.maps.LatLng(carData[i][j+1]['lat'], carData[i][j+1]['lon']));	

						carInfo['lat1'] = carData[i][j]['lat'];
						carInfo['lat2'] = carData[i][j+1]['lat'];
						carInfo['lon1'] = carData[i][j]['lon'];
						carInfo['lon2'] = carData[i][j+1]['lon'];
						carInfo['vel'] = velocity;
						carInfo['dir'] = direction;

						slowTrafficArr.push(carInfo);

						var path = new google.maps.Polyline({
						  path: paths,
						  geodesic: true,
						  strokeColor: directionToColor(direction),
						  strokeOpacity: 0.8,
						  strokeWeight: 2,
						});

						//The path is drawn
						path.setMap(map);
						overlays.push(path);

					}
				}					
			}
		}
		document.getElementById('loading').style.visibility = 'hidden';
	}
}


function drawCluster(min, max){

	currentView = "slowTraffic"; 

	clearBox('infobox');

	var slowTrafficArr = [];
	var direction;

	var hourMin = min||0;
	var hourMax = max||24;
	
	if ((max-min)==0){
		hourMin=0;
		hourMax=24;
	}

	$("#loading").show();
	document.getElementById('loading').style.visibility = 'visible';
	setTimeout(loop, 5);

	function loop()
	{
		clearOverlays();

		for (var i=1; i<carData.length; i++)
		{
			for(var j=0; j<(carData[i].length-1); j++)
			{
				var paths = [];
				var carInfo = [];	

				var distance = latlonToMeters(Number(carData[i][j]['lon']), Number(carData[i][j]['lat']), Number(carData[i][j+1]['lon']), Number(carData[i][j+1]['lat']));

				var Date1 = new Date(07, 3, 4, carData[i][j]['hour'], carData[i][j]['min'], carData[i][j]['sec']);
				var Date2 = new Date(07, 3, 4, carData[i][j+1]['hour'], carData[i][j+1]['min'], carData[i][j+1]['sec']);
				var time = Math.abs(Date2-Date1)/1000;
			
				var velocity = distance/time*3.6;

				if(velocity < 10)
				{
					if(Number(carData[i][j]['hour']) >= hourMin && Number(carData[i][j]['hour']) <= hourMax)
					{

						direction = checkDirection(carData[i][j]['lat'], carData[i][j+1]['lat'], carData[i][j]['lon'], carData[i][j+1]['lon']);

						var carInfo = [];
						carInfo['lat'] = carData[i][j]['lat'];
						carInfo['lon'] = carData[i][j]['lon'];
						carInfo['visited'] = false;

						slowTrafficArr.push(carInfo);

					}
				}					
			}
		}

		console.log(clusterDBS(slowTrafficArr, 0.03, 4));
		document.getElementById('loading').style.visibility = 'hidden';
	}
}

