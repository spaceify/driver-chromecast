#!/usr/bin/env node
/**
 * driver-chromecast, 16.10.2016 Spaceify Oy
 *
 * @class ChromecastDriver
 */

var spaceify = require("/api/spaceifyapplication.js");

var ChromecastBackend = require("./chromecastbackend");

function ChromecastDriver()
{
var self = this;

var lightsServiceIds = {};

var videoPlayerService = null;
var imageViewerService = null;
var privateService = null;

var chromecastBackend = new ChromecastBackend();

// Exposed RPC methods

//paramsObj is a JS Object with attributes mediaUrl, mimeType

self.playVideo = function(paramsObj, callObj, callback)
	{
	// Play video on all connected devices	
	chromecastBackend.playVideo(null, paramsObj);
	callback(null, "OK");
	};	

self.showImage = function(paramsObj, callObj, callback)
	{
	// Show image on all connected devices	
	
	chromecastBackend.showImage(null, paramsObj);
	callback(null, "OK");
	};	


self.getDevices = function(callObj, callback)
	{
	chromecastBackend.getDevices(function(devices)
		{
		callback(null, devices);	
		});
	};
	
// Implementation of the start() and fail() callbacks required by Spaceify

self.start = function()
	{
	chromecastBackend.init(function()
		{
		videoPlayerService = spaceify.getProvidedService("spaceify.org/services/media/videoplayer");
		imageViewerService = spaceify.getProvidedService("spaceify.org/services/media/imageviewer");
	
		privateService = spaceify.getProvidedService("spaceify.org/services/lights/private/driver_chromecast");

		videoPlayerService.exposeRpcMethod("playVideo", self, self.playVideo);
		imageViewerService.exposeRpcMethod("showImage", self, self.showImage);

		videoPlayerService.exposeRpcMethod("getDevices", self, self.getDevices);
		imageViewerService.exposeRpcMethod("getDevices", self, self.getDevices);

		//privateService.exposeRpcMethod("getReachableLights", self, getReachableLights);
		});
	};

self.fail = function(err)
	{	
	};

var stop = function()
	{
	spaceify.stop();
	};

}

var chromecastDriver = new ChromecastDriver();

//philipsHueDriver.getLights(null, function(err,lights) {console.log("getLights palautti: " + JSON.stringify(lights));});
spaceify.start(chromecastDriver, {webservers: {http: true, https: true}});
