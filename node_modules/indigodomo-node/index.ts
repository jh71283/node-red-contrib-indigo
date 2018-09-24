
import { Device } from "./device";
import { ObjectHeader } from "./objectheader";
import { ActionGroup } from "./actiongroup";
import { Variable } from "./variable";


var _baseURL: string;
var _username: string;
var _password: string;
var _port: number;
var digestRequest : any;

  export async function init (indigoServerURL: string, port: number, username: string, password:string) : Promise<boolean> {
    _baseURL = indigoServerURL;
    _username = username;
    _password = password;
    _port = port;

    digestRequest = require('request-digest')(username, password);
   var a =  digestRequest.requestAsync({
        host: _baseURL,
        port:port,
        path: '/',
        method: 'GET'
      })

   return   a.then(function (response: any) {
        //console.log(response.body);
         return true;
      })
      .catch(function (error: any) {
        console.log(error.statusCode);
        console.log(error.body);
        return false;
      });
    }

    export async function GetDevices () : Promise<ObjectHeader[]> {
    
        return await  Get<ObjectHeader[]>('/devices.json')
     
    }
    export async function GetDevice (name:string) : Promise<Device> {
        return await Get<Device>('/devices/' + name + '.json')
    }
    export async function SetDeviceOnOff (name:string, isOn:boolean) : Promise<Device> {
        var onstr="0";
        if(isOn){
            onstr = "1"
        }
      return SetDevicePropertyValue(name, 'isOn', onstr);
    }
    export async function SetDevicePropertyValue (name:string, propertyname:string, propertyvalue:string) : Promise<Device> {
     
       var path:string = '/devices/' + name + '.json?' + propertyname + '=' + propertyvalue + '&_method=put';
        return await Get<Device>(path);
    }
    export async function ToggleDeviceOnOff (name:string) : Promise<Device> {
       
       var path:string = '/devices/' + name + '.json?toggle=1&_method=put';
        return await Get<Device>(path);
    }
    export async function SetDeviceBrightness (name:string, brightness:number) : Promise<Device> {
       
       return SetDevicePropertyValue(name, 'brightness', brightness.toString())
    }
    export async function GetVariable (name:string) : Promise<Variable> {
        return await Get<Variable>('/variables/' + name + '.json')
    }
    export async function GetVariableValue (name:string) : Promise<string> {
       var x = await GetVariable(name)
       
        return x.value;

    }
    export async function SetVariable (name:string, value:string) : Promise<Variable> {
        return await Get<Variable>('/variables/' + name + '.json?_method=put&value=' + value)
    }
    export async function GetActionGroup (name:string) : Promise<ActionGroup> {
        return await Get<ActionGroup>('/actions/' + name + '.json')
    }
    export async function ExecuteActionGroup (name:string) : Promise<ActionGroup> {
        return await Get<ActionGroup>('/actions/' + name + '.json?_method=execute')
    }
    export async function GetVariables () : Promise<ObjectHeader[]> {
       return await  Get<ObjectHeader[]>('/variables.json')
    }

    export async function GetActionGroups () : Promise<ObjectHeader[]> {
    
        return await  Get<ObjectHeader[]>('/actions.json')
        
     }
     async function Get<T> (path:string) : Promise<T> {
    
       var a =  digestRequest.requestAsync({
            host: _baseURL,
            port: _port,
            path: path,
            method: 'GET'
          }).then(
              (response:any)=>{
               var obj : T = JSON.parse(response.body);
               return obj;
              }
          ).catch(
              (error:any)=>{
                console.log(error); 
              }
          )
    
       return   a;
    }
