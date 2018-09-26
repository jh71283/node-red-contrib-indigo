# node-red-contrib-indigo
## Description

Nodes facilitating the automation of *Indigo* ( <http://www.indigodomo.com> ) items with Node-RED ( <http://nodered.org> ).

## Installation

```
$ cd ~/.node-red
$ npm install node-red-contrib-indigo
```

## Nodes

##### - indigo-controller

Configuration node for communication with an Indigo controller.

*Configuration:*
- Name : Specify a name for the configuration node
- Protocol : "http" or "https"
- Host : Specify the hostname or ip address
- Port : (Optionally) Specify the ip port
- Path : (Optionally) Specify the additional base path
- Username : (Optionally) Specify the username to authenticate
- Password : (Optionally) Specify the password to authenticate

##### - indigo-in

Listens to state changes of a selected Indigo Item.

*Configuration:*
- Name : Optionally specify a name
- Controller : Select the Indigo controller
- Item : Select the Item to monitor

*Messages injected in NodeRED flows (2 channels):*

Channel 1:
- <kbd>msg.item</kbd> : the item's itemname (not label)
- <kbd>msg.topic</kbd> : "StateEvent"
- <kbd>msg.payload</kbd> : the new state of the selected item

Channel 2:
- <kbd>msg.item</kbd> : the item's itemname (not label)
- <kbd>msg.topic</kbd> : "RawEvent"
- <kbd>msg.payload</kbd> :  raw (unprocessed) event for the selected item

##### - indigo-monitor

Monitors the indigo-controller node.

*Configuration:*
- Name : Optionally specify a name
- Controller : Select the Indigo controller

*Messages injected in NodeRED flows (3 channels):*

Channel 1:
- <kbd>msg.topic</kbd> : "ConnectionStatus"
- <kbd>msg.payload</kbd> : connection status ('ON' or 'OFF')

Channel 2:
- <kbd>msg.topic</kbd> : "ConnectionError"
- <kbd>msg.payload</kbd> : error message

Channel 3:
- <kbd>msg.topic</kbd> : "RawEvent"
- <kbd>msg.payload</kbd> :  raw (unprocessed) event for all items

##### - indigo-out

Sends commands or state updates to a selected Indigo Item.
E.g. "ON", "OFF", "REFRESH", ... 

*Configuration:*
- Name : Optionally specify a name
- Controller : Select the Indigo controller
- Item :  Optionally select the Item to address. If specified, it overrides the item specified in the incoming message.
- Topic : Optionally select "ItemCommand" or "ItemUpdate". If specified, it overrides the topic specified in the incoming message. 
- Payload : Optionally specify the command or update value to send to the selected item. If specified, it overrides the payload specified in the incoming message.


*Messages accepted by NodeRED flows:*

- <kbd>msg.item</kbd> : optionally the Item to address
- <kbd>msg.topic</kbd> :  optionally "ItemCommand", "ItemUpdate"
- <kbd>msg.payload</kbd> : optionally the fixed command or update value to send to the selected item

##### - indigo-get

Gets an Indigo Item on an input message.

*Configuration:*
- Name : Optionally specify a name
- Controller : Select the Indigo controller
- Item : Optionally select the Item to get. If specified, it overrides the item specified in the incoming message.

*Messages accepted by NodeRED flows:*

- <kbd>msg.item</kbd> : optionally the Item to address

*Messages injected in NodeRED flows (1 channel):*

Channel 1:
The input message with addition of :
- <kbd>msg.payload</kbd> : the item object (name, label, state, ...)
- <kbd>msg.payload_in</kbd> : copy of incoming message's payload
