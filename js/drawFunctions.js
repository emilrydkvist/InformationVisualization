//Global variables
var currentView = "";
var hourMin = 0;
var hourMax = 24;
var overlays = [];
var trafficBehaviorArr = [];
trafficBehaviorArr[0] = "";


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

function latlonToMeters(lon1, lat1, lon2, lat2)
{
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

function intToColor(theInt)
{
	var colorArray = ['rgb(166,206,227)','rgb(31,120,180)','rgb(178,223,138)','rgb(51,160,44)','rgb(251,154,153)','rgb(227,26,28)','rgb(253,191,111)','rgb(255,127,0)','rgb(202,178,214)','rgb(106,61,154)','rgb(255,255,153)','rgb(177,89,40)'];
	var idx = theInt % 12;

	return colorArray[idx];
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
	else if(currentView == "cluster")
		drawCluster(min, max);
	else if(currentView == "behavior")
		drawTrafficBehavior(min, max);
}


function drawpathsInfo()
{
	clearBox('infobox');
	var box = document.getElementById('infobox');
	box.innerHTML = '<div id="title">All trajectories</div>';
	box.innerHTML += '<p>The blue lines on the map each represents the trajectory of a car.'+ 
	'The dataset which this visualization is based upon contains gps-data from 1239 cars that have been driving around Milano. <br/>'+ 
	'This view is not very useful but is quite beautiful to look at. <br/><br/>'+ 
	'You can mark an area of the interactive timeline at any time to filter the data.</p>';
}

function drawpaths(min, max)
{
	currentView = "standard";

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
			var paths = [];
			
			for(var j=0; j<carData[i].length; j++)
			{
				if(Number(carData[i][j]['hour']) >= hourMin && Number(carData[i][j]['hour']) <= hourMax)
				{
					paths.push(new google.maps.LatLng(carData[i][j]['lat'], carData[i][j]['lon']));
				}		
			}

			var path = new google.maps.Polyline({
			  path: paths,
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

	var hourMin = min||0;
	var hourMax = max||24;
	
	if ((max-min)==0){
		hourMin=0;
		hourMax=24;
	}

	$("#loading").show();
	document.getElementById('loading').style.visibility = 'visible';
	setTimeout(loop, 10);

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

	}
			
}

function drawSpeedInfo()
{
	clearBox('infobox');

	var infobox = document.getElementById('infobox');

	infobox.innerHTML = '<div id="title">Velocity</div>';

	infobox.innerHTML += '<p>The trajectories in this view of the map are colored by their velocities. '+
	'As you can see, the cars on the highways travels a lot faster than the cars in the core of Milano.</p>';

	var checkboxDivs ="";

	checkboxDivs += '<tr><td><div class="checkboxes2" id="checkboxSpeed0"></div></td><td><div id="checkboxDiv">< 10 km/h</div></td></tr>';	
	checkboxDivs += '<tr><td><div class="checkboxes2" id="checkboxSpeed1"></div></td><td><div id="checkboxDiv">10-30 km/h</div></td></tr>';
	checkboxDivs += '<tr><td><div class="checkboxes2" id="checkboxSpeed2"</div></td><td><div id="checkboxDiv">30-90 km/h</div></td></tr>';
	checkboxDivs += '<tr><td><div class="checkboxes2" id="checkboxSpeed3"></div></td><td><div id="checkboxDiv"> > 90 km/h</div></td></tr>';
	

	infobox.innerHTML += '<div id = "checkboxesDiv">'+'<table>' + checkboxDivs + '</table>' + '</div>';

	document.getElementById('checkboxSpeed0').style.backgroundColor = "#F00";
	document.getElementById('checkboxSpeed0').style.height = '20px';
	document.getElementById('checkboxSpeed0').style.width = '20px';
	document.getElementById('checkboxSpeed0').style.borderRadius='5px';
	document.getElementById('checkboxSpeed0').style.border = '1px solid';

	document.getElementById('checkboxSpeed1').style.backgroundColor = "#e59400";
	document.getElementById('checkboxSpeed1').style.height = '20px';
	document.getElementById('checkboxSpeed1').style.width = '20px';
	document.getElementById('checkboxSpeed1').style.borderRadius='5px';
	document.getElementById('checkboxSpeed1').style.border = '1px solid';

	document.getElementById('checkboxSpeed2').style.backgroundColor = "#FF0";
	document.getElementById('checkboxSpeed2').style.height = '20px';
	document.getElementById('checkboxSpeed2').style.width = '20px';
	document.getElementById('checkboxSpeed2').style.borderRadius='5px';
	document.getElementById('checkboxSpeed2').style.border = '1px solid';

	document.getElementById('checkboxSpeed3').style.backgroundColor = "#0F0";
	document.getElementById('checkboxSpeed3').style.height = '20px';
	document.getElementById('checkboxSpeed3').style.width = '20px';
	document.getElementById('checkboxSpeed3').style.borderRadius='5px';
	document.getElementById('checkboxSpeed3').style.border = '1px solid';
}


function animateInfo()
{
	var box = document.getElementById('infobox');
	box.innerHTML = '<div id="title">Car animation</div>';
	box.innerHTML += '<p>Each black dot represents a car travelling along its historical trajectory.'+
	' This view animates 100 cars. <br/><br/>'+
	'The next view is quite heavy to calculate, please be patient.</p>';
}

function animatePaths(min, max){

	currentView = "animate";

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
						  strokeColor: '#F00',
						  strokeOpacity: 0.2,
						  strokeWeight: 1,
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


function clusterInfo()
{
	var box = document.getElementById('infobox');
	box.innerHTML = '<div id="title">Tailback areas</div>';
	box.innerHTML += '<p>Based on the density of slow cars in certain areas, this view shows which areas have the highest possibility for tailbacks. '+
	'As you would expect, most of these areas are positioned around crossroads. '+
	'<br/>If you are in a hurry, you might want to avoid these areas. <br/><br/>'+
	'</p>';
}

function calculateCluster(min, max){

	currentView = "cluster"; 

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
				var carInfo = [];	

				var distance = latlonToMeters(Number(carData[i][j]['lon']), Number(carData[i][j]['lat']), Number(carData[i][j+1]['lon']), Number(carData[i][j+1]['lat']));
				var Date1 = new Date(07, 3, 4, carData[i][j]['hour'], carData[i][j]['min'], carData[i][j]['sec']);
				var Date2 = new Date(07, 3, 4, carData[i][j+1]['hour'], carData[i][j+1]['min'], carData[i][j+1]['sec']);
				var time = Math.abs(Date2-Date1)/1000;
			
				var velocity = distance/time*3.6;

				if(velocity < 10)
				{
						//direction = checkDirection(carData[i][j]['lat'], carData[i][j+1]['lat'], carData[i][j]['lon'], carData[i][j+1]['lon']);

						var carInfo = [];
						carInfo['lat'] = carData[i][j]['lat'];
						carInfo['lon'] = carData[i][j]['lon'];
						carInfo['hour'] = carData[i][j]['hour'];
						carInfo['visited'] = false;

						slowTrafficArr.push(carInfo);
				}					
			}
		}
		clusters = clusterDBS(slowTrafficArr, 0.0025, 20);
		//good values: rad = 0.0025, minPts = 20
		//or rad = 0.0023, minPts = 17

		drawCluster(hourMin, hourMax)

		document.getElementById('loading').style.visibility = 'hidden';
	}
}

function drawCluster(min, max)
{
	clearOverlays();

	var hourMin = min||0;
	var hourMax = max||24;
	
	if ((max-min)==0){
		hourMin=0;
		hourMax=24;
	}

	for (var i = 0; i < clusters.length; i++)
	{
		if(clusters[i].length > 15)
		{
			var dotColor = '#F00';
			for(var p = 0; p < clusters[i].length; p++)
			{
				if(Number(clusters[i][p]['hour']) >= hourMin && Number(clusters[i][p]['hour']) <= hourMax)
				{
					var dot = new google.maps.Circle({
							  center: new google.maps.LatLng(clusters[i][p]['lat'], clusters[i][p]['lon']),
							  radius: 150,
							  strokeColor: dotColor,
							  strokeOpacity: 0.2,
							  strokeWeight: 2,
							  fillColor: dotColor,
							  fillOpacity: 0.1,
							});

					//The path is drawn
					dot.setMap(map);
					overlays.push(dot);
				}
			}
		}
	}
}

var checked = [];
checked[0] = "unchecked";
checked[1] = "unchecked";
checked[2] = "unchecked";
checked[3] = "unchecked";
checked[4] = "unchecked";
checked[5] = "unchecked";

function handleCheck(number){
	if(checked[number] == "unchecked")
	{
		checked[number]="checked";
		document.getElementById('checkbox'+number).style.opacity = '1';
		document.getElementById('checkbox'+number).style.border = '1px solid';
	}
	else if(checked[number] == "checked")
	{
		checked[number] = "unchecked";
		document.getElementById('checkbox'+number).style.opacity = '0.5';
		document.getElementById('checkbox'+number).style.border = '1px solid #DDD';
	}
	drawTrafficBehavior(hourMin, hourMax);
}


//Looking at traffic passing a border around the inner city,
//either a direction towards the center or away from the center
function trafficBehavior(min, max)
{
	currentView = "behavior";

	//centerpoint
	var centerPoint = [45.467, 9.177317];
	var latDiff;
	var lonDiff;
	var distance;
	var rad = 0.05;
	var startLat;
	var startLon;
	var carsInCore = 0;

	$("#loading").show();
	document.getElementById('loading').style.visibility = 'visible';
	setTimeout(loop, 10);

	function loop()
	{
	for (var i = 1; i < carData.length; i++)
	{
		startLat = Number(carData[i][0]['lat']);
		startLon = Number(carData[i][0]['lon']);

		latDiff = startLat - centerPoint[0];
		lonDiff = startLon - centerPoint[1];

		distance = Math.sqrt(latDiff*latDiff + lonDiff*lonDiff);
		//console.log(distance);

		//Car starting outside center 
		if(distance > rad)
		{
			trafficBehaviorArr[i] = "passing by";

			for (var j = 1; j < (carData[i].length-1); j++) 
			{
				startLat = Number(carData[i][j]['lat']);
				startLon = Number(carData[i][j]['lon']);

				latDiff = startLat - centerPoint[0];
				lonDiff = startLon - centerPoint[1];

				distance = Math.sqrt(latDiff*latDiff + lonDiff*lonDiff);

				if(distance < rad)
					trafficBehaviorArr[i] = "going in";
			}
			startLat = Number(carData[i][j]['lat']);
			startLon = Number(carData[i][j]['lon']);

			latDiff = startLat - centerPoint[0];
			lonDiff = startLon - centerPoint[1];

			distance = Math.sqrt(latDiff*latDiff + lonDiff*lonDiff);

			if(distance > rad && trafficBehaviorArr[i]=="going in")
				trafficBehaviorArr[i] = "passing through";

		}//Car starting inside center
		else
		{
			trafficBehaviorArr[i] = "inside";

			for (var j = 1; j < (carData[i].length-1); j++) 
			{	
				startLat = Number(carData[i][j]['lat']);
				startLon = Number(carData[i][j]['lon']);

				latDiff = startLat - centerPoint[0];
				lonDiff = startLon - centerPoint[1];

				distance = Math.sqrt(latDiff*latDiff) + (lonDiff*lonDiff);

				if(distance > rad)
					trafficBehaviorArr[i] = "going out";
			}
			startLat = Number(carData[i][j]['lat']);
			startLon = Number(carData[i][j]['lon']);

			latDiff = startLat - centerPoint[0];
			lonDiff = startLon - centerPoint[1];

			distance = Math.sqrt(latDiff*latDiff + lonDiff*lonDiff);

			if(distance < rad && trafficBehaviorArr[i]=="going out")
				trafficBehaviorArr[i] = "native traffic";
		}
		if(trafficBehaviorArr[i] == "going in" || trafficBehaviorArr[i] == "passing through")
			carsInCore++;
	}

	/****************Content of infobox****************
	****************************************************/

	clearBox('infobox');
    var infobox = document.getElementById('infobox');

    infobox.innerHTML = '<div id="title">Traffic movement</div>';

    infobox.innerHTML += '<p>This view visualizes how much traffic is added to Milano\'s core during a day. Out of '+carData.length+' cars, '+carsInCore+' enters the core of Milano and adds to the traffic that is already there. <br/><br/>Click the boxes below to see how cars travel around the core of Milano.</p>';
	
	//check all checkboxes
	for (var i = 0; i < checked.length; i++) {
		checked[i] = "unchecked";
	}

	var boxOpacity = 0.5;

	/****************checkboxes******************/
	var checkboxDivs = "";

	checkboxDivs += '<tr><td><div class="checkboxes" id="checkbox0" onclick="handleCheck('+0+')"></div></td><td><div style="height: 18px; font-family: sans-serif; font-size: 13px;">Cars passing by Milano</div></td></tr>';
	checkboxDivs += '<tr><td><div class="checkboxes" id="checkbox1" onclick="handleCheck('+1+')"></div></td><td><div style="height: 30px; font-family: sans-serif; font-size: 13px;">Cars never leaving the core of Milano</div></td></tr>';
	checkboxDivs += '<tr><td><div class="checkboxes" id="checkbox2" onclick="handleCheck('+2+')"></div></td><td><div style="height: 30px; font-family: sans-serif; font-size: 13px;">Cars entering the core of Milano and staying</div></td></tr>';
	checkboxDivs += '<tr><td><div class="checkboxes" id="checkbox3" onclick="handleCheck('+3+')"></div></td><td><div style="height: 30px; font-family: sans-serif; font-size: 13px;">Cars leaving the core of Milano</div></td></tr>';
	checkboxDivs += '<tr><td><div class="checkboxes" id="checkbox4" onclick="handleCheck('+4+')"></div></td><td><div style="height: 30px; font-family: sans-serif; font-size: 13px;">Cars driving through the core of Milano</div></td></tr>';
	checkboxDivs += '<tr><td><div class="checkboxes" id="checkbox5" onclick="handleCheck('+5+')"></div></td><td><div style="height: 30px; font-family: sans-serif; font-size: 13px;">Cars leaving and returning to the core of Milano</div></td></tr>';

	infobox.innerHTML += '<table>'+checkboxDivs+'</table>';

	document.getElementById('checkbox0').style.backgroundColor = "#e41a1c";
	document.getElementById('checkbox1').style.backgroundColor = "#377eb8";
	document.getElementById('checkbox2').style.backgroundColor = "#a65628";
	document.getElementById('checkbox3').style.backgroundColor = "#984ea3";
	document.getElementById('checkbox4').style.backgroundColor = "#ff7f00";
	document.getElementById('checkbox5').style.backgroundColor = "#ffff33";


	for (var i = 0; i < checked.length; i++) {
		document.getElementById('checkbox'+i).style.height = '20px';
		document.getElementById('checkbox'+i).style.width = '20px';
		document.getElementById('checkbox'+i).style.borderRadius='5px';
		document.getElementById('checkbox'+i).style.opacity = boxOpacity;
		document.getElementById('checkbox'+i).style.border = '1px solid #DDD';
	}
	/************end of checkboxes**************/

	/************end of content for infobox**********
	*************************************************/

	drawTrafficBehavior(min, max);
	document.getElementById('loading').style.visibility = 'hidden';
	}
}

function drawTrafficBehavior(min, max)
{
	clearOverlays();

	var hourMin = min||0;
	var hourMax = max||24;
	
	if ((max-min)==0){
		hourMin=0;
		hourMax=24;
	}

	var checkStatus = [];
	checkStatus['passing by'] = 0;
	checkStatus['inside'] = 1;
	checkStatus['going in'] = 2;
	checkStatus['going out'] = 3;
	checkStatus['passing through'] = 4;
	checkStatus['native traffic'] = 5;

	for (var i = 1; i < carData.length; i++)
	{
		if(checked[checkStatus[trafficBehaviorArr[i]]] == "checked")
		{
			var paths = [];

			for (var j = 0; j < carData[i].length; j++)
			{
				if(Number(carData[i][j]['hour']) >= hourMin && Number(carData[i][j]['hour']) <= hourMax)
				{
					paths.push(new google.maps.LatLng(carData[i][j]['lat'], carData[i][j]['lon']));	
				}
			}

			var path = new google.maps.Polyline({
				  path: paths,
				  geodesic: true,
				  strokeColor: trafficBehaviorToColor(trafficBehaviorArr[i]),
				  strokeOpacity: 0.4,
				  strokeWeight: 1,
				});
			//The path is drawn
			path.setMap(map);
			overlays.push(path);
		}
	}	
}

function trafficBehaviorToColor(status)
{
	if (status == "passing by")
		return '#e41a1c'; //red
	else if(status == "inside")
		return '#377eb8'; //blue
	else if(status == "going in")
		return '#a65628'; //brown
	else if(status == "going out")
		return '#984ea3'; //purple
	else if(status == "passing through")
		return '#ff7f00'; //orange
	else if(status == "native traffic")
		return '#ffff33'; //yellow
	else
		return '#000;'

}
