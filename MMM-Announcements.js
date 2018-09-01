Module.register("MMM-Announcements",{

    text: "",
    announcements: {},
    interval: {} ,
    index: 0,
	// Default module config.
	defaults: {
        announcements: [" ˁ˚ᴥ˚ˀ ","?"],
        cycletime: 20000,
        fadetime: 4000
	},

    getFilteredAnnouncements: function(){
        //FILTER ANNOUNCEMENTS TO THOSE APPLICABLE TO CURRENT STATE
        var self = this ;
        //RETURN ONLY THE TEXT
        // var aarray = self.announcements['announcements'] ;

        if(Array.isArray(self.announcements)){
            var fa = self.announcements.slice();
            //DATE
            fa = fa.map(x=>moment().range(new Date(x.date_start),new Date(date_end)).contains(moment()) ) ;
            //DOW
            fa = fa.map(x=>x ) ;
            //TIME
            fa = fa.map(x=>x ) ;
            //WEATHER
            fa = fa.map(x=>x ) ;

            if (fa === undefined || fa.length == 0) {
                return  self.defaults.announcements;
            } 
            return fa.map(x=>x['text']) ; //TODO
        }

        return self.defaults.announcements ;
    },

    getAnnouncement: function(){
        var self = this ;
        var filteredAnnouncements = self.getFilteredAnnouncements() ;
        var maxIndex = filteredAnnouncements.length-1 ;

        if(++self.index > maxIndex){
            self.index = 0 ;
        }
        return filteredAnnouncements[self.index] ;

    },


	// Override dom generator.
	getDom: function() {
        var self = this ;
        var announcementText = self.getAnnouncement() ;
		var wrapper = document.createElement("div");
		wrapper.innerHTML = announcementText;
		return wrapper;
    },

    start: function() {
        var self = this ;
        this.config.initialized = false ;
        this.sendSocketNotification('GET_ANNOUNCEMENTS', "");
        Log.log(this.name + ' is started!');

        self.interval = setInterval(function(){
            self.updateDom(self.defaults.fadetime);
        },self.defaults.cycletime)  
    },

    socketNotificationReceived:function(notification, payload) {
        var self = this ;
        if (notification == "UPDATE_ANNOUNCEMENTS") {
            
            Log.log(this.name + " received a module notification: " + notification);
            self.announcements = JSON.parse(payload)["announcements"] 
        } 
    },

    notificationReceived: function(notification, payload, sender) {
        var self = this ;
        if (notification == "CURRENTWEATHER_DATA") {
			this.setCurrentWeatherType(payload.data);
		}
    },
    
	// From data currentweather set weather type
	setCurrentWeatherType: function(data) {
		var weatherIconTable = {
			"01d": "day_sunny",
			"02d": "day_cloudy",
			"03d": "cloudy",
			"04d": "cloudy_windy",
			"09d": "showers",
			"10d": "rain",
			"11d": "thunderstorm",
			"13d": "snow",
			"50d": "fog",
			"01n": "night_clear",
			"02n": "night_cloudy",
			"03n": "night_cloudy",
			"04n": "night_cloudy",
			"09n": "night_showers",
			"10n": "night_rain",
			"11n": "night_thunderstorm",
			"13n": "night_snow",
			"50n": "night_alt_cloudy_windy"
		};
		this.currentWeatherType = weatherIconTable[data.weather[0].icon];
    },
    
	getScripts: function() {
        return ["moment.js"];
	},
});