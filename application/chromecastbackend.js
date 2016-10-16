"use strict";

var Client	= require('castv2-client').Client;
var DefaultMediaReceiver = require('castv2-client').DefaultMediaReceiver;
var mdns = require('mdns');


function ChromecastBackend()
{
var self = this;

var DEFAULT_TIMEOUT = 1000;

var devices = new Object();

var onDeviceFound = function(address, port)
	{
	var device = {id: address, host: address, port: port}
	devices[address] = device;
	};

self.refreshDevices = function(timeout, callback)
	{
	var browser = mdns.createBrowser(mdns.tcp('googlecast'));

	browser.on("serviceUp", function(service) 
		{
  		console.log('found device "%s" at %s:%d', service.name, service.addresses[0], service.port);
  		onDeviceFound(service.addresses[0], service.port);
  		//browser.stop();		//only finds one device
		});
		
	browser.start();
	var time = null;
	
	if (timeout)
		time = timeout;	
	else
		time = DEFAULT_TIMEOUT;
		
	setTimeout(function() 
		{
		browser.stop();
		callback();
		}, time);
	};	


self.getDevices = function(callback)
	{
	callback(devices);
	};
	
var playVideoOnDevice = function(device, paramsObj)
	{		
	var client = new Client();

	client.connect(device.host, function()
		{
    	console.log('connected, launching app ...');

    	client.launch(DefaultMediaReceiver, function(err, player) 
    		{
      		var media = 
      			{
				// Here you can plug an URL to any mp4, webm, mp3 or jpg file with the proper contentType.
        		contentId: paramsObj.mediaUrl,
        		contentType: paramsObj.mimeType,
        		streamType: 'BUFFERED', // or LIVE

        		// Title and cover displayed while buffering
        		/*
        		metadata: {
          					type: 0,
          					metadataType: 0,
          					title: "Big Buck Bunny", 
          					images: [
            						{ url: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/BigBuckBunny.jpg' }
          							]
        					}        */
      			};

      		player.on('status', function(status) 
      			{
        		console.log('status broadcast playerState=%s', status.playerState);
      			});

      		console.log('app "%s" launched, loading media %s ...', player.session.displayName, media.contentId);

      		player.load(media, { autoplay: true }, function(err, status) 
      			{
      			if (err)
      				console.log(err);
      			else	
        			console.log('media loaded playerState=%s', status.playerState);
				});

    		});
    	});	
	};

	
self.playVideo = function(deviceId, paramsObj)
	{
	if (!deviceId)
		{
		// play on all devices
		
		for (var i in devices)
			{
			playVideoOnDevice(devices[i], paramsObj);
			}
		}
		
	else
		playVideoOnDevice(devices[deviceId], paramsObj);	
	};	
	
self.showImage = function(deviceId, paramsObj)
	{
	self.playVideo(deviceId, paramsObj);
	};
	
self.init = function(callback)
	{
	self.refreshDevices(200, function()
		{
		callback();
		});
	};	
}

// Testing code

/*
var chromecastBackend = new ChromecastBackend();

chromecastBackend.refreshDevices(100, function()
	{	
	chromecastBackend.playVideo(null, {mediaUrl: "http://commondatastorage.googleapis.com/gtv-videos-bucket/big_buck_bunny_1080p.mp4", mimeType: "video/mp4"});
	//chromecastBackend.showImage(null, {mediaUrl: "http://www.wallpaperawesome.com/wallpapers-awesome/wallpapers-full-hd-1920-1080-widescreen-awesome/z-wallpaper-mother-nature-1920-x-1080-full-hd.jpg", mimeType: "image/jpeg"});
	});	
*/	

module.exports = ChromecastBackend;

