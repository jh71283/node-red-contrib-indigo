/*

  Indigo nodes for IBM's Node-Red
  https://github.com/pdmangel/node-red-contrib-indigo
  (c) 2017, Peter De Mangelaere <peter.demangelaere@gmail.com>

  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at

  http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.
  
*/
var EventSource = require('@joeybaker/eventsource');
var indigodomo = require('indigodomo-node');

function getConnectionString(config) {
	var url;
	
	if ( config.protocol )
		url = config.protocol;
	else
		url = "http";
	
	url += "://";

	if ( (config.username != undefined) && (config.username.trim().length != 0) )
	{
		url += config.username.trim();
		
		if ( (config.password != undefined) && (config.password.length != 0) )
		{
			url += ":" + config.password;
		}
		url += "@";
	}
	url +=  config.host;
	
	if ( (config.port != undefined) && (config.port.trim().length != 0) )
	{
		url += ":" + config.port.trim();
	}

	if ( (config.path != undefined) && (config.path.trim().length != 0) )
	{
		var path = config.path.trim();

		path = path.replace(/^[\/]+/, '');
		path = path.replace(/[\/]+$/, '');
		
		url += "/" + path;
	}
	
	return url;
}

module.exports = function(RED) {

	
	/**
	* ====== indigo-controller ================
	* Holds the hostname and port of the  
	* Indigo server
	* ===========================================
	*/
	function IndigoControllerNode(config) {
		console.log('controller node initialised')
		indigodomo.init(config.protocol + "://" + config.host, config.port,config.username, config.password )
		RED.nodes.createNode(this, config);
		
		this.getConfig = function () {
			return config;
		}

		var node = this;

		node.log(JSON.stringify(config));
		
		// this controller node handles all communication with the configured indigo server

		this.connection = function(){
			return indigodomo;
		}

		function getStateOfItems(config) {
			return;
			node.log("getStateOfItems : config = " + JSON.stringify(config));
			
          
			
		}
		
		function startEventSource() {
			return;
			// register for all item events
			
			node.es= new EventSource(getConnectionString(config) + "/rest/events?topics=smarthome/items", {});
			
			// handle the 'onopen' event
			
			node.es.onopen = function(event) {

				// get the current state of all items
	            getStateOfItems(config);
	       	};

			// handle the 'onmessage' event
			
	       	node.es.onmessage = function(msg) {
			    //node.log(msg.data);
				try
				{
        			// update the node status with the Item's new state
				    msg = JSON.parse(msg.data);
				    msg.payload = JSON.parse(msg.payload);
				    
				    const itemStart = ("smarthome/items/").length;
				    var item = msg.topic.substring(itemStart, msg.topic.indexOf('/',itemStart));
				    
				    node.emit(item + "/RawEvent", msg);
				    node.emit("RawEvent", msg);
				    
				    if ( (msg.type == "ItemStateEvent") || (msg.type == "ItemStateChangedEvent") || (msg.type == "GroupItemStateChangedEvent"))
				    	node.emit(item + "/StateEvent", {type: msg.type, state: msg.payload.value});

				}
				catch(e)
				{
					// report an unexpected error
					node.error("Unexpected Error : " + e)
				}
				
			};
			
			// handle the 'onerror' event
			
	       	node.es.onerror = function(err) {
				if( err.type && (JSON.stringify(err.type) === '{}') )
					return; // ignore
	       		
	       		node.warn('ERROR ' +	JSON.stringify(err));
				node.emit('CommunicationError', JSON.stringify(err));
				
				
				if ( err.status )
				{
					if ( (err.status == 503) || (err.status == "503") || (err.status == 404) || (err.status == "404") )
						// the EventSource object has given up retrying ... retry reconnecting after 10 seconds
						
						node.es.close();
						delete node.es;
						
						node.emit('CommunicationStatus', "OFF");

						setTimeout(function() {
							startEventSource();
						}, 10000);
				}
				else if ( err.type && err.type.code )
				{
					// the EventSource object is retrying to reconnect
				}
				else
				{
					// no clue what the error situation is
				}
			  };

		}
		
	    //startEventSource();
		// give the system few seconds 
		setTimeout(function() {
			
			startEventSource();
		}, 5000);

		this.getDevice= function(name){
			return indigodomo.GetDevice(name);
		};
		this.setDevice= function(name,key,value){
			return indigodomo.SetDevicePropertyValue(name,key,value);
		};
		this.getVariable= function(name){
			return indigodomo.GetVariable(name);
		};
		this.execAction= function(name){
			return indigodomo.ExecuteActionGroup(name);
		};
		this.setVariable= function(name,value){
			return indigodomo.SetVariable(name,value);
		};
		this.getActionGroup= function(name){
			return indigodomo.GetActionGroup(name);
		};
		
			
	

		this.on("close", function() {
			node.log('close');
			node.emit('CommunicationStatus', "OFF");
		});

	}
    RED.nodes.registerType("indigo-controller", IndigoControllerNode);

  // start a web service for enabling the node configuration ui to query for available Indigo items
    
	RED.httpNode.get("/indigo/devices",function(req, res, next) {
		console.log('getting devices')
	
		indigodomo.GetDevices().then((response)=> res.send(response))
		

	});
	RED.httpNode.get("/indigo/variables",function(req, res, next) {
		console.log('getting variables')
	
		indigodomo.GetVariables().then((response)=> res.send(response))
		

	});
	RED.httpNode.get("/indigo/actions",function(req, res, next) {
		console.log('getting actions')
	
		indigodomo.GetActionGroups().then((response)=> res.send(response))
		

	});
	

	
	
	/**
	* ====== indigo-in ========================
	* Handles incoming indigo events, injecting 
	* json into node-red flows
	* ===========================================
	*/
	function IndigoIn(config) {
		RED.nodes.createNode(this, config);
		this.name = config.name;
		var node = this;
		var indigoController = RED.nodes.getNode(config.controller);
		var itemName = config.itemname;
		
		if ( itemName != undefined ) itemName = itemName.trim();
		
		//node.log('IndigoIn, config: ' + JSON.stringify(config));

		
		this.refreshNodeStatus = function() {
			var currentState = node.context().get("currentState");
			
		    if ( currentState == null )
		        node.status({fill:"yellow", shape: "ring", text: "state:" + currentState});		    	
		    else if ( currentState == "ON" )
		        node.status({fill:"green", shape: "dot", text: "state:" + currentState});
		    else if ( currentState == "OFF" )
		        node.status({fill:"green", shape: "ring", text: "state:" + currentState});
		    else
		        node.status({fill:"blue", shape: "ring", text: "state:" + currentState});
		};
		
		this.processStateEvent = function(event) {
			
			var currentState = node.context().get("currentState");
			
			if ( (event.state != currentState) && (event.state != "null") )
			{
				// update node's context variable
				currentState = event.state;
				node.context().set("currentState", currentState);
				
				// update node's visual status
				node.refreshNodeStatus();
				
			    // inject the state in the node-red flow
			    var msgid = RED.util.generateId();
	            node.send([{_msgid:msgid, payload: currentState, item: itemName, event: "StateEvent"}, null]);
				
			}			
		};
		
		this.processRawEvent = function(event) {
		    // inject the state in the node-red flow
		    var msgid = RED.util.generateId();
            node.send([null, {_msgid:msgid, payload: event, item: itemName, event: "RawEvent"}]);
			
		};
		
		node.context().set("currentState", "?");
		indigoController.addListener(itemName + '/RawEvent', node.processRawEvent);
		indigoController.addListener(itemName + '/StateEvent', node.processStateEvent);
		node.refreshNodeStatus();		
				
		/* ===== Node-Red events ===== */
		this.on("input", function(msg) {
			if (msg != null) {
				
			};
		});
		this.on("close", function() {
			node.log('close');
			indigoController.removeListener(itemName + '/StateEvent', node.processStateEvent);
			indigoController.removeListener(itemName + '/RawEvent', node.processRawEvent);
		});
		
	}
	//
	RED.nodes.registerType("indigo-in", IndigoIn);
	


		/**
	* ====== indigo-get-device ===================
	* Gets the device data when
	* messages received via node-red flows
	* =======================================
	*/
	function IndigoSetDevice(config) {
		RED.nodes.createNode(this, config);
		this.name = config.name;
		var indigoController = RED.nodes.getNode(config.controller);
		var node = this;
		
		// handle incoming node-red message
		this.on("input", function(msg) {

            var item = (config.itemname && (config.itemname.length != 0)) ? config.itemname : msg.item;
			var key = (config.key && (config.key.length != 0)) ? config.key : msg.topic;
			var value = msg.payload;
			
			indigoController.setDevice(item, key,value)
				.then((res) => {
					
					node.status({fill:"green", shape: "dot", text: " "});
                					msg.payload_in = msg.payload;
                					msg.payload = JSON.parse(JSON.stringify(res));
                					node.send(msg);})
				.catch((err)=>{	
					node.status({fill:"red", shape: "ring", text: err});
                					node.warn(err);})
            
			
		});
		this.on("close", function() {
			node.log('close');
		});
	}
	//
	RED.nodes.registerType("indigo-set-device", IndigoSetDevice);




	/**
	* ====== indigo-get-device ===================
	* Gets the device data when
	* messages received via node-red flows
	* =======================================
	*/
	function IndigoGetDevice(config) {
		RED.nodes.createNode(this, config);
		this.name = config.name;
		var indigoController = RED.nodes.getNode(config.controller);
		var node = this;
		
		// handle incoming node-red message
		this.on("input", function(msg) {

            var item = (config.itemname && (config.itemname.length != 0)) ? config.itemname : msg.item;
			console.log('getting device: ' + item)
			indigoController.getDevice(item)
				.then((res) => {
					
					node.status({fill:"green", shape: "dot", text: " "});
                					msg.payload_in = msg.payload;
                					msg.payload = JSON.parse(JSON.stringify(res));
                					node.send(msg);})
				.catch((err)=>{	
					node.status({fill:"red", shape: "ring", text: err});
                					node.warn(err);})
            
			
		});
		this.on("close", function() {
			node.log('close');
		});
	}
	//
	RED.nodes.registerType("indigo-get-device", IndigoGetDevice);

	function IndigoExecAction(config) {
		RED.nodes.createNode(this, config);
		this.name = config.name;
		var indigoController = RED.nodes.getNode(config.controller);
		var node = this;
		
		// handle incoming node-red message
		this.on("input", function(msg) {

            var item = (config.itemname && (config.itemname.length != 0)) ? config.itemname : msg.topic;
			
			indigoController.execAction(item)
				.then((res) => {
					
					node.status({fill:"green", shape: "dot", text: " "});
                					msg.payload_in = msg.payload;
                					msg.payload = JSON.parse(JSON.stringify(res));
                					node.send(msg);})
				.catch((err)=>{	
					node.status({fill:"red", shape: "ring", text: err});
                					node.warn(err);})
            
			
		});
		this.on("close", function() {
			node.log('close');
		});
	}
	//
	RED.nodes.registerType("indigo-exec-action", IndigoExecAction);


	function IndigoGetVariable(config) {
		RED.nodes.createNode(this, config);
		this.name = config.name;
		var indigoController = RED.nodes.getNode(config.controller);
		var node = this;
		
		// handle incoming node-red message
		this.on("input", function(msg) {

            var item = (config.itemname && (config.itemname.length != 0)) ? config.itemname : msg.item;
			
			indigoController.getVariable(item)
				.then((res) => {
					
					node.status({fill:"green", shape: "dot", text: " "});
                					msg.payload_in = msg.payload;
                					msg.payload = JSON.parse(JSON.stringify(res));
                					node.send(msg);})
				.catch((err)=>{	
					node.status({fill:"red", shape: "ring", text: err});
                					node.warn(err);})
            
			
		});
		this.on("close", function() {
			node.log('close');
		});
	}
	//
	RED.nodes.registerType("indigo-get-variable", IndigoGetVariable);

	function IndigoSetVariable(config) {
		RED.nodes.createNode(this, config);
		this.name = config.name;
		var indigoController = RED.nodes.getNode(config.controller);
		var node = this;
		
		// handle incoming node-red message
		this.on("input", function(msg) {

            var item = (config.itemname && (config.itemname.length != 0)) ? config.itemname : msg.topic;
			var value = msg.payload;
			indigoController.setVariable(item, value)
				.then((res) => {
					
					node.status({fill:"green", shape: "dot", text: " "});
                					msg.payload_in = msg.payload;
                					msg.payload = JSON.parse(JSON.stringify(res));
                					node.send(msg);})
				.catch((err)=>{	
					node.status({fill:"red", shape: "ring", text: err});
                					node.warn(err);})
            
			
		});
		this.on("close", function() {
			node.log('close');
		});
	}
	//
	RED.nodes.registerType("indigo-set-variable", IndigoSetVariable);


} 
