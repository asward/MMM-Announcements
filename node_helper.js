
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

        
        //READ EXISTING ANNOUNCEMENTS 
        fs.readFile(path.resolve(self.path + "/announcements.json"), "utf8", function(err, data) {
            self.announcements  = JSON.parse(data) ;
        });


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
        self.sendSocketNotification('UPDATE_ANNOUNCEMENTS', self.announcements);
    },
    updateFile: function(){
        fs.writeFile(path.resolve(this.path + "/announcements.json"), JSON.stringify(this.announcements));
    },
    createRoutes: function(){
        var self = this ;
        // ////// API //////
        // self.expressApp.post('/announcements/api/create_json', self.textParser, function (req, res) {
        //     //POST JSON OF ALL ANNOUNCEMENTS
        //     if (!req.body){
        //         return res.sendStatus(400)
        //     } 
        //     console.log("POST_ANNOUCNEMENTS") ;
        //     console.log(req.body) ;
        //     var new_announcements = JSON.parse(req.body) ;
        //     self.announcements = new_announcements ;
        //     //Write to file then update the front end
        //     self.updateFile() ;
        //     self.updateAnnouncements() ;

        //     res.writeHead(200);
        //     res.end(req.body) ;
        // });

        



        
        // self.expressApp.put('/announcements/api/update/:id', self.textParser, function (req, res) {
        //     //PUT (UPDATE) ANNOUNCEMENT
        //     if (!req.body){
        //         return res.sendStatus(400)
        //     } 
        //     var updated_announcement = JSON.parse(req.body) ;

        //     const index = self.announcements.announcements.map(e => e.id).indexOf(req.params.id);
        //     existing_data.announcements.splice(index,1,updated_announcement) ;
                
        //     //Write to file then update the front end
        //     self.updateFile() ;
        //     self.updateAnnouncements() ;

        //     res.writeHead(200);
        //     res.end(req.body) ;
        // });

        
        // self.expressApp.get('/announcements/api/update/:id', self.textParser, function (req, res) {
        //     //GET ANNOUNCEMENT UPDATE FORM
        //     res.setHeader("Content-Type",'text/html'); //Solution!
        //     res.writeHead(200);
            
        //     fs.readFile(path.resolve(self.path + "/public/update.html"), "utf8", function(err, html) {
        //         html.replace('{{}}',);
        //         res.end(html) ;
        //     });
        // });

        
        
        // self.expressApp.get('/announcements/api/announcement/:id', self.textParser, function (req, res) {
        //     //GET SINGLE ANNOUNCEMENT (JSON)
            
        //     //DELETE
        //     const index = self.announcements.announcements.map(e => e.id).indexOf(req.params.id);
        //     self.announcements.announcements[index] ;
            
        //     //Write to file then update the front end
        //     self.updateFile() ;
        //     self.updateAnnouncements() ;

        //     res.writeHead(200);
        //     res.setHeader("Content-Type",'application/json'); //Solution!
        //     res.end(JSON.stringify(self.announcements.announcements[index])) ;
        // });



        // //DELETE
        // self.expressApp.delete('/announcements/api/delete/:id', self.textParser, function (req, res) {
        //     //DELETE ANNOUNCEMENT

        //     //POST JSON OF ALL ANNOUNCEMENTS
        //     if (!req.body){
        //         return res.sendStatus(400)
        //     } 
        //     var updated_announcement = JSON.parse(req.body) ;

        //     //DELETE
        //     const index = self.announcements.announcements.map(e => e.id).indexOf(req.params.id);
        //     self.announcements.announcements.splice(index,1) ;
            
        //     //Write to file then update the front end
        //     self.updateFile() ;
        //     self.updateAnnouncements() ;
        //     res.end(req.body) ;
        // });


        ///EDIT
        self.expressApp.get('/announcements/edit/:id', self.textParser, function (req, res) {
            //EDIT SINGLE ANNOUNCEMENT

            var id = parseInt(req.params.id);
            console.log(id); 
            const index = self.announcements.announcements.map(e => e.id).indexOf(id);
            if(index > -1){
                var announcement = self.announcements.announcements[index] ;

                var template = self.renderTemplate('/public/edit.html',announcement);
                template = self.renderTemplate('/public/template.html',{content: template});
                // res.status(200);
                res.send(template); 
            } else {
                console.log('404') ;
                var template = self.renderTemplate('/public/template.html',{content: self.get404()});
                // res.status(404);
                res.send(template); 
            }
        });
        
        self.expressApp.post('/announcements/edit/:id', bodyParser.urlencoded({
            extended: false
        }), function (req, res) {
            //UPDATE SINGLE ANNOUNCEMENT
            //PUT (UPDATE) ANNOUNCEMENT
            if (!req.body){
                return res.sendStatus(400)
            } 
            
            var updated_announcement = {} ;

            updated_announcement.id = parseInt(req.params.id);
            console.log(updated_announcement.id ); 
            const index = self.announcements.announcements.map(e => e.id).indexOf(updated_announcement.id);

            if(req.body.action == "Update"){
                updated_announcement.text = req.body.text ;
                updated_announcement.duration = parseInt(req.body.duration) ;
        
                self.announcements.announcements.splice(index,1,updated_announcement) ;
            } else if (req.body.action == "Delete"){
                self.announcements.announcements.splice(index,1) ;
            }

            //Write to file then update the front end
            self.updateFile() ;
            self.updateAnnouncements() ;

            res.redirect('/announcements');
        });

        //CREATE
        self.expressApp.post('/announcements/create', bodyParser.urlencoded({
            extended: false
        }), function (req, res) {
            //POST NEW ANNOUCNEMENT
            if (!req.body){
                return res.sendStatus(400)
            } 

            //VALIDATE FORM

            //IF FORM IS VALID
                //FIND MAX ID TO SET NEW ID (AUTO INCREMENT)
                var max_id = self.announcements.announcements
                    .reduce(
                        (a,c)=>{
                            var i = Math.max(a, parseInt(c.id));
                            if(isNaN(i) || i == undefined){
                                return a;
                            }
                            return i ;
                        },1);

                //AUTO INCREMENT
                new_announcement = {} ;

                new_announcement.id = max_id+1;
                new_announcement.text = req.body.text ;
                new_announcement.duration = parseInt(req.body.duration) ;

                //PUSH ITEM TO EXISTING ARRAY
                self.announcements.announcements.push(new_announcement) ;

                //Write to file then update the front end
                self.updateFile() ;
                self.updateAnnouncements() ;
                res.redirect('/announcements');
            //ELSE
                //RETURN FORM WITH DATA AND ERRORS
            
        });
                
        self.expressApp.get('/announcements/create', self.textParser, function (req, res) {
            //GET CREATE ANNOUNCEMENT FORM
            var template = self.renderTemplate('/public/create.html') ;
            res.send(template) ;
        });


        // self.expressApp.get('/announcements/api/json', self.textParser, function (req, res) {
        //     //GET ALL ANNOUNCEMENT (JSON)
        //     res.setHeader("Content-Type",'application/json'); //Solution!
        //     res.writeHead(200);
        //     res.end(JSON.stringify(self.announcements)) ;
        // });

        // self.expressApp.get('/announcements/api/html', self.textParser, function (req, res) {
        //     //GET  ANNOUNCEMENTS (HTML)
            
        //     res.setHeader("Content-Type",'text/html'); //Solution!
        //     res.writeHead(200);
            
        //     res.end(self.announcementHTML()) ;
        // });

        ////// STATIC //////
        this.expressApp.route('/announcements')
        .get(function (req, res) {
            var template =  self.renderTemplate('/public/template.html',{content:self.announcementHTML()}) ;
            res.send(template); 
        });

        this.expressApp.use('/announcements/public', express.static(path.join(self.path + '/public/')))

    },
    
    // renderTemplate: function({content= ''}){
    //     var template =  fs.readFileSync(path.resolve(this.path + "/public/template.html")).toString() ;
    //     template = template.replace('{{content}}',content) ;
    // },

    renderTemplate: function(template_path, data = {}){
        var template =  fs.readFileSync(path.resolve(this.path + template_path)).toString() ;

        //LOAD DATA
        Object.entries(data).forEach( (o) => {
            const regexp = new RegExp(`{{${o[0]}}}`,'g');
            template = template.replace(regexp,`${o[1]}`)  ;
        })
        
        //REMOVE EXTRA {{}}
        const regexp = new RegExp(`{{.*}}`,'g');
        template = template.replace(regexp,``)  ;
        

        return template ;
    },
    renderListTemplate: function(list_template_path, data = []){
        var template = '' ;
        data.forEach((item)=>{
            template += this.renderTemplate(list_template_path,item) ;
        }) ;
        
        return template ;
    },

    get404: function(){
        return fs.readFileSync(path.resolve(this.path + "/public/404.html")).toString() ;
    },

    announcementHTML: function(){
        var html = this.renderListTemplate('/public/announcement_list_item.html',this.announcements.announcements) ;
        html = this.renderTemplate('/public/announcement_list.html',{list: html}) ;
        return html ;
    },
});