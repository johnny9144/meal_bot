"use strict";
var debug = require('debug')('dev:lib:provider:api');
var _ = require('lodash');
var request = require('request');

debug( "load");
var API = module.exports = function() {
  this.baseUri = 'http://' + conf.provider.api.host + ':' + conf.provider.api.port  + '/v2';
  this.headers = {
    apikey: conf.provider.api.apikey,
    apisecret: conf.provider.api.apisecret
  };
};
API.prototype.request = function( method, uri, params, cb) {
  var opts = {
    method: method,
    uri: this.baseUri + uri,
    headers: this.headers,
    json: true,
    timeout: 60000
  };
  if (params) {
    if (method === 'POST' || method === 'PUT') {
      opts.body = params;
    } else {
      opts.qs = params;
    }
  }
  return request( opts, function ( err, result, body){
    cb( err, result, body);
  });
};

// Contact APIs
API.prototype.createContact = function(contactData, cb) {
  this.request('POST', '/contact/create', contactData, cb);
};

API.prototype.infoContact = function(contactId, cb) {
  this.request('GET', '/contact/info', { id: contactId }, cb);
};

API.prototype.updateContact = function(contactId, contactData, cb) {
  var params = _.assign({ id: contactId }, contactData);
  this.request('PUT', '/contact/update', params, cb);
};

// Domain APIs
API.prototype.checkDomain = function( domain, cb) {
  this.request('GET', '/domain/check', { domain: domain }, cb);
};

API.prototype.getClaimKey = function( domain, cb) {
  this.request('GET', '/domain/check', { domain: domain, claimsType: 'claims' }, cb);
};

API.prototype.getClaimData = function(claimsKey, cb) {
  this.request('GET', '/domain/claims', { key: claimsKey }, cb);
};

API.prototype.createDomainWithContactId = function(domain, year, contactId, claimsData, cb) {
  var params = {
    domain: domain,
    year: year,
    contactId: contactId,
    claims: claimsData,
  };
  this.request('POST', '/domain/create', params, cb);
};

API.prototype.infoDomain = function(domain, cb) {
  this.request('GET', '/domain/info', { domain: domain }, cb);
};

API.prototype.lockDomain = function( domain, lockFlag, force, cb) {
  var data = { domain: domain, lock: lockFlag};
  if ( force) {
    data.force = force;
  }
  this.request('PUT', '/domain/lock', data, cb);
};

API.prototype.renewDomain = function(domain, year, expiration_date, cb) {
  this.request('POST', '/domain/renew', { domain: domain, year: year, expiration_date: expiration_date }, cb);
};

API.prototype.updateDomain = function(domain, contactIds, cb) {
  var params = _.extend({ domain: domain }, contactIds);
  this.request('PUT', '/domain/update', params, cb);
};

API.prototype.transferVerify = function( domain, code, cb) {
  this.request('GET', '/domain/transfer/verify', { domain: domain, code: code }, cb);
};

API.prototype.transferRequest = function ( domain, code, year, contactId, cb) {
  this.request('POST', "/domain/transfer/request", { domain: domain, code: code, year: year, contactId: contactId}, cb);
};

API.prototype.transferCancel = function ( domain, code, cb) {
  this.request('POST', "/domain/transfer/cancel", { domain: domain, code: code}, cb);
};

API.prototype.transferQuery = function ( domain, code, cb) {
  this.request('GET', "/domain/transfer/status", { domain: domain, code: code}, cb);
};

API.prototype.updateDNS = function(domain, rr, cb) {
  this.request('PUT', '/domain/dns/update', { domain: domain, rr: rr }, cb);
};

API.prototype.updateNS = function(domain, ns, cb) {
  this.request('PUT', '/domain/ns/update', { domain: domain, nameservers: ns }, cb);
};

API.prototype.whoisPrivacy = function( domain, privacyFlag, cb) {
  this.request('PUT', '/domain/privacy', { domain: domain, privacy: privacyFlag }, cb);
};

API.prototype.queryDNSZoneRRList = function ( domain, cb) {
  this.request('GET', '/domain/dns/info', { domain: domain }, cb);
};

API.prototype.redirect = function ( domain, url, cb) {
  this.request('PUT', '/domain/redirect', { domain: domain, url: url }, cb);
};
