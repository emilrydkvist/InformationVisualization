
function readData(data)
{
	console.log(data[1]['E_ID']);
	
	var carData = [];
	

	for(var i=0; i<data.length; i++)
	{
		var carInfo = [];
		
		carInfo['point_N'] = data[i]['point_N'];
		carInfo['hour'] = data[i]['hour'];
		carInfo['min'] = data[i]['min'];
		carInfo['sec'] = data[i]['sec'];
		carInfo['lat'] = data[i]['lat'];
		carInfo['lon'] = data[i]['lon'];
		
		carData[data[i]['T_ID']].push(carInfo);
	}
	
	return carData;
	
}