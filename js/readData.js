
function readData(data)
{
	
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
		
		var temp = [];
		temp = carData[data[i]['T_ID']] || [];
		temp.push(carInfo);
		
		carData[data[i]['T_ID']] = temp;
	}
	
	return carData;
	
}