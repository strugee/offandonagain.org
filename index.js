#!/usr/bin/env node

/*

Copyright 2017 AJ Jordan <alex@strugee.net>.

This file is part of offandonagain.org.

offandonagain.org is free software: you can redistribute it and/or
modify it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

offandonagain.org is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public
License along with offandonagain.org. If not, see
<https://www.gnu.org/licenses/>.

*/

var express = require('express'),
    compression= require('compression'),
    serveRandom = require('serve-random'),
    yargs = require('yargs'),
    resolve = require('path').resolve;

var argv = require('yargs')
	    .usage('Usage: $0 [options]')
	    .alias({'help': 'h', 'config': 'c', 'port': 'p', 'address': 'a'})
	    .describe({port: 'Port that the HTTP server will bind to', address: 'Address that the HTTP server will bind to'})
	    .default({ config: '/etc/offandonagain.org.json', address: '0.0.0.0', port: 8000 })
	    .config()
	    .env('OFFANDONAGAIN')
	    .help()
	    .version()
	    .argv;

var app = express();

app.use(compression());

app.use(serveRandom(resolve(__dirname, 'imgs')));

var server = app.listen(argv.port, argv.address, function() {
	var host = server.address().address;
	var port = server.address().port;
	console.log('Server listening at http://%s:%s/', host, port);
});
