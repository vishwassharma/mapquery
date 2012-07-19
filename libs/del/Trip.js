/*
 * Trip : All the information is collected using Trip
 */
function Trip() {
	var map_option = {
		holder : 'map',     // Which layer should hold the map
		type: 'google',     // Type of map that we want to see
		
		// If dynamic map then 
		// url : is the data source
		// format: is the resultant data from the data source
		isDynamicFeature : true,
		url: '/Trip/kml/',  // Url from where we will fetch the data
		format: 'KML',
		protocol: 'HTTP',
		strategy: ['Fixed',],
		
		isRefresh : true,  // if refresh is the strategy
		interval: 5,       // then this will be the interval
		
		// Styling information
		isStyled: true,
		theme: null,
		
		// Event Listeners
		isListening: false,
		eventListeners: {},
		
		// Control Options
		isControl: true,
		controls: ['SelectFeature'],
	}
	
	this.map = new MapClient(map_option);
	this.fetchMap = fetchMap;
	/*
	 * fetchMap :
	 */
	function fetchMap() {
		
		//map.createGraph(map_option.type)
		console.log("[*] Initializing map");
		console.log(this.map);
		this.map.initMap();

		//Assign which map type we want
		console.log("[*] Map Type " +map_option.type);
		this.map.mapType(map_option.type);

		//is dynamic features
		if(map_option.isDynamicFeature === true) {
			console.log("[*] Adding Dynamic Features");
			this.map.addDynamicFeatures();
		} else {
			console.log("[*] Adding Static Features");
			this.map.addStaticFeatures('features', 'format');
		}
		
		//If style required add some
		console.log("[*] Some other options");

		// Initialize Vector
		console.log("[*] Initializing Vector");
		this.map.initVector();
		
		// Set center
		this.map.setCenter();
	}
	
	/*
	 * 
	 */
}