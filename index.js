#!/usr/bin/env node

/*

Copyright 2017, 2018, 2019 AJ Jordan <alex@strugee.net>.

This work is free. You can redistribute it and/or modify it under the
terms of the Do What The Fuck You Want To Public License, Version 2,
as published by Sam Hocevar. See the COPYING file for more details.

*/

var express = require('express'),
    compression= require('compression'),
    serveRandom = require('serve-random'),
    yargs = require('yargs'),
    MatomoTracker = require('matomo-tracker'),
    // Why are ES6 modules the worst
    dnt = require('donottrack').default,
    resolve = require('path').resolve,
    fs = require('fs');

var argv = require('yargs')
	    .usage('Usage: $0 [options]')
	    .alias({'h': 'help', 'c': 'config', 'p': 'port', 'a': 'address', 'v': 'version', 't': 'matomo-token'})
	    .describe({port: 'Port that the HTTP server will bind to', address: 'Address that the HTTP server will bind to', 'matomo-token': 'Matomo user token for tracking submission'})
	    .default({ config: '/etc/offandonagain.org.json', address: '0.0.0.0', port: 8000, 'matomo-token': undefined })
	    .config()
	    .env('OFFANDONAGAIN')
	    .help()
	    .version()
	    .argv;

var matomo = new MatomoTracker(10, 'https://piwik.strugee.net/matomo.php'),
    staticFiles = fs.readdirSync(__dirname + '/static');

var app = express();

app.use(compression());

app.use(function(req, res, next) {
	res.setHeader('X-Source-Code', 'https://github.com/strugee/offandonagain.org');
	res.setHeader('X-SPDX-License', 'WTFPL');
	res.setHeader('X-Humans-Txt', '/humans.txt');
	next();
});

app.use(function(req, res, next) {
	var mayTrack = dnt(req.header('DNT') || '', true),
	    fullUrl = (req.header('X-Forwarded-Protocol') || req.protocol) + '://' + req.header('Host') + req.originalUrl;

	if (mayTrack) {
		matomo.track({
			url: fullUrl,
			action_name: staticFiles.includes(req.url.slice(1)) ? req.url.slice(1) : 'GIF',
			ua: req.header('User-Agent'),
			urlref: req.header('Referer'),
			lang: req.header('Accept-Language'),
			// Heroku
			cip: (req.header('X-Forwarded-For') || '').split(',')[0] || req.connection.remoteAddress,
			token_auth: argv.matomoToken
		});
	} else {
		// Record only the visit and no other identifiable information
		matomo.track({
			url: fullUrl,
			action_name: staticFiles.includes(req.url.slice(1)) ? req.url.slice(1) : 'GIF',
			cip: '0.0.0.0',
			token_auth: argv.matomoToken
		});
	}
	next();
});

app.use(express.static(resolve(__dirname, 'static')));

app.use(serveRandom(resolve(__dirname, 'imgs')));

var server = app.listen(argv.port, argv.address, function() {
	var host = server.address().address;
	var port = server.address().port;
	console.log('Server listening at http://%s:%s/', host, port);
});
