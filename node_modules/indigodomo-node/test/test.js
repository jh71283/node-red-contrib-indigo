'use strict';
var expect = require('chai').expect;
var index = require('../dist/index.js');
var FirstDeviceName;
describe('global test', () => {
    it(' can connect', () => {
        var result = index.init('http://10.0.1.9',8176,'john','**REMOVED**');
        expect(result).result.equals(true);
        FirstDeviceName = result[0].Name;
    });
    it('should return more than 0 results', () => {
        var result = index.getDevices();
        expect(result).length.greaterThan(0);
        FirstDeviceName = result[0].Name;
    });

});

describe('device test', () => {
    it('should return more than 0 results', () => {
        var result = index.getDevices();
        expect(result).length.greaterThan(0);
    });

});