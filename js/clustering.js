/******************************************************
clusterDBS(data, rad, minPts)
data: Array of latitudes, longitudes and 'visited'
rad: Radius of examination for each point in data
minPts: Minimum density of each circle of a point

returns clusterArr which is an array of clusters which conatins a set of points

*******************************************************/
function clusterDBS(data, rad, minPts)
{
	var clusterArr = [];
	var clusterIdx = 0;
	

	for (var i=0; i<data.length;i++){	
		if(data[i]['visited'] == false){
			data[i]['visited'] = true;
			var neighborPts = [];
			neighborPts = regionQuery(i, rad);

			if(neighborPts.length < minPts)
				data[i]['visited'] = 'NOISE';
			else{				
				clusterArr[clusterIdx] = [];
				expandCluster(i, neighborPts);
				clusterIdx++;
			}
		}
	}

	function expandCluster(pointIdx, neighborPts)
	{
		var point = [];
		point['lat'] = data[pointIdx]['lat'];
		point['lon'] = data[pointIdx]['lon'];
		point['hour'] = data[pointIdx]['hour'];
		clusterArr[clusterIdx].push(point);

		for (var n = 0; n < neighborPts.length; n++) 
		{
			if(data[neighborPts[n]]['visited'] == false)
			{
				data[neighborPts[n]]['visited'] = true;

				var neighborPts2 = [];
				neighborPts2 = regionQuery(neighborPts[n]);

				if(neighborPts2.length >= minPts)
				{
					//Join neighborPts with neighborPts2
					for (var j = 0; j < neighborPts2.length; j++) 
					{
						if(!(neighborPts2[j] in neighborPts))
							neighborPts.push(neighborPts2[j]);
					}
				}
				//if n isn't a member of any cluster
				//add it to a cluster
				var memberOfCluster = false;
				for (var k = 0; k < clusterArr.length; k++) 
				{
					if(neighborPts[n] in clusterArr[k])
						memberOfCluster = true;
				}			
				if(memberOfCluster == false)
				{	
					var point2 = [];
					point2['lat'] = data[neighborPts[n]]['lat'];
					point2['lon'] = data[neighborPts[n]]['lon'];
					point2['hour'] = data[neighborPts[n]]['hour'];
					clusterArr[clusterIdx].push(point2);
				}
			}
		}
	}

	function regionQuery(pointIdx)
	{
		var pointArr = [];

		for (var r = 0; r<data.length; r++) 
		{
			if(data[r]['visited'] == false)
			{
				var latRes = Number(data[pointIdx]['lat']) - Number(data[r]['lat']);
				var lonRes = Number(data[pointIdx]['lon']) - Number(data[r]['lon']);

				var distance = Math.sqrt(latRes*latRes + lonRes*lonRes);

				if(distance <= rad)
					pointArr.push(r);
			}
		}
		return pointArr;
	}
	return clusterArr;
}

//http://en.wikipedia.org/wiki/DBSCAN