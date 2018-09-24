"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
var _baseURL;
var _username;
var _password;
var _port;
var digestRequest;
function init(indigoServerURL, port, username, password) {
    return __awaiter(this, void 0, void 0, function* () {
        _baseURL = indigoServerURL;
        _username = username;
        _password = password;
        _port = port;
        digestRequest = require('request-digest')(username, password);
        var a = digestRequest.requestAsync({
            host: _baseURL,
            port: port,
            path: '/',
            method: 'GET'
        });
        return a.then(function (response) {
            //console.log(response.body);
            return true;
        })
            .catch(function (error) {
            console.log(error.statusCode);
            console.log(error.body);
            return false;
        });
    });
}
exports.init = init;
function GetDevices() {
    return __awaiter(this, void 0, void 0, function* () {
        return yield Get('/devices.json');
    });
}
exports.GetDevices = GetDevices;
function GetDevice(name) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield Get('/devices/' + name + '.json');
    });
}
exports.GetDevice = GetDevice;
function SetDeviceOnOff(name, isOn) {
    return __awaiter(this, void 0, void 0, function* () {
        var onstr = "0";
        if (isOn) {
            onstr = "1";
        }
        return SetDevicePropertyValue(name, 'isOn', onstr);
    });
}
exports.SetDeviceOnOff = SetDeviceOnOff;
function SetDevicePropertyValue(name, propertyname, propertyvalue) {
    return __awaiter(this, void 0, void 0, function* () {
        var path = '/devices/' + name + '.json?' + propertyname + '=' + propertyvalue + '&_method=put';
        return yield Get(path);
    });
}
exports.SetDevicePropertyValue = SetDevicePropertyValue;
function ToggleDeviceOnOff(name) {
    return __awaiter(this, void 0, void 0, function* () {
        var path = '/devices/' + name + '.json?toggle=1&_method=put';
        return yield Get(path);
    });
}
exports.ToggleDeviceOnOff = ToggleDeviceOnOff;
function SetDeviceBrightness(name, brightness) {
    return __awaiter(this, void 0, void 0, function* () {
        return SetDevicePropertyValue(name, 'brightness', brightness.toString());
    });
}
exports.SetDeviceBrightness = SetDeviceBrightness;
function GetVariable(name) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield Get('/variables/' + name + '.json');
    });
}
exports.GetVariable = GetVariable;
function GetVariableValue(name) {
    return __awaiter(this, void 0, void 0, function* () {
        var x = yield GetVariable(name);
        return x.value;
    });
}
exports.GetVariableValue = GetVariableValue;
function SetVariable(name, value) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield Get('/variables/' + name + '.json?_method=put&value=' + value);
    });
}
exports.SetVariable = SetVariable;
function GetActionGroup(name) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield Get('/actions/' + name + '.json');
    });
}
exports.GetActionGroup = GetActionGroup;
function ExecuteActionGroup(name) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield Get('/actions/' + name + '.json?_method=execute');
    });
}
exports.ExecuteActionGroup = ExecuteActionGroup;
function GetVariables() {
    return __awaiter(this, void 0, void 0, function* () {
        return yield Get('/variables.json');
    });
}
exports.GetVariables = GetVariables;
function GetActionGroups() {
    return __awaiter(this, void 0, void 0, function* () {
        return yield Get('/actions.json');
    });
}
exports.GetActionGroups = GetActionGroups;
function Get(path) {
    return __awaiter(this, void 0, void 0, function* () {
        var a = digestRequest.requestAsync({
            host: _baseURL,
            port: _port,
            path: path,
            method: 'GET'
        }).then((response) => {
            var obj = JSON.parse(response.body);
            return obj;
        }).catch((error) => {
            console.log(error);
        });
        return a;
    });
}
//# sourceMappingURL=index.js.map