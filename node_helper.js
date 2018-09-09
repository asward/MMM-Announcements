
const NodeHelper = require("node_helper");
const path = require("path");
const url = require("url");
const fs = require("fs");
const bodyParser = require("body-parser");
const express = require('express'); 


Module = {
	configDefaults: {},
	register: function (name, moduleDefinition) {
		// console.log("Module config loaded: " + name);
		Module.configDefaults[name] = moduleDefinition.defaults;
	}
};

module.exports = NodeHelper.create({
	// Subclass start method.
	start: function() {
        var self = this;
        
        self.textParser = bodyParser.text() ;   
        self.jsonParser = bodyParser.json() ;   

		console.log("Starting node helper for: " + self.name);

        this.updateAnnouncements() ;
        this.createRoutes();    
    },
    socketNotificationReceived: function(notification, payload) {
        var self = this ;
        console.log(this.name + " received a socket notification: " + notification + " - Payload: " + payload);

        if (notification == "GET_ANNOUNCEMENTS") {
            self.updateAnnouncements() ;
        } 
    },

    updateAnnouncements: function(){
        var self = this;

        console.log(this.name + " Updating Announcements ");

		fs.readFile(path.resolve(self.path + "/announcements.json"), "utf8", function(err, data) {
            self.sendSocketNotification('UPDATE_ANNOUNCEMENTS', data);
        });
    },
    
    createRoutes: function(){
        var self = this ;
        ////// API //////
        self.expressApp.post('/announcements/api/post_announcements', self.textParser, function (req, res) {
            if (!req.body){
                return res.sendStatus(400)
            } 
            console.log("POST_ANNOUCNEMENTS") ;
            console.log(req.body) ;
            fs.writeFile(path.resolve(self.path + "/announcements.json"), req.body);
            self.updateAnnouncements() ;
            res.send(req.body) ;
        });

        self.expressApp.get('/announcements/api/get_announcements', self.textParser, function (req, res) {

            fs.readFile(path.resolve(self.path + "/announcements.json"), "utf8", function(err, data) {
                res.setHeader("Content-Type",'application/json'); //Solution!
                res.writeHead(200);
                res.end(data) ;
            });
        });

        ////// STATIC //////
        this.expressApp.route('/announcements')
        .get(function (req, res) {
            res.sendFile(path.join(self.path + '/public/index.html'));
        });

        this.expressApp.route('/announcements/api/announcement_form')
        .get(function (req, res) {
            res.sendFile(path.join(self.path + '/public/form.html'));
        });

        this.expressApp.use('/announcements/public', express.static(path.join(self.path + '/public/')))

    },

});