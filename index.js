#!/usr/bin/env node

/*

Copyright 2017, 2018 AJ Jordan <alex@strugee.net>.

This work is free. You can redistribute it and/or modify it under the
terms of the Do What The Fuck You Want To Public License, Version 2,
as published by Sam Hocevar. See the COPYING file for more details.

*/

var express = require('express'),
    compression= require('compression'),
    serveRandom = require('serve-random'),
    yargs = require('yargs'),
    resolve = require('path').resolve;

var argv = require('yargs')
	    .usage('Usage: $0 [options]')
	    .alias({'h': 'help', 'c': 'config', 'p': 'port', 'a': 'address', 'v': 'version'})
	    .describe({port: 'Port that the HTTP server will bind to', address: 'Address that the HTTP server will bind to'})
	    .default({ config: '/etc/offandonagain.org.json', address: '0.0.0.0', port: 8000 })
	    .config()
	    .env('OFFANDONAGAIN')
	    .help()
	    .version()
	    .argv;

var app = express();

app.use(compression());

app.use(function(req, res, next) {
	res.setHeader('X-Source-Code', 'https://github.com/strugee/offandonagain.org');
	res.setHeader('X-Humans-Txt', '/humans.txt');
	next();
});

app.use(express.static(resolve(__dirname, 'static')));

app.use(serveRandom(resolve(__dirname, 'imgs')));

var server = app.listen(argv.port, argv.address, function() {
	var host = server.address().address;
	var port = server.address().port;
	console.log('Server listening at http://%s:%s/', host, port);
});
