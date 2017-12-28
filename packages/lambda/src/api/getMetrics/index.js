/*
 * Copyright (C) 2017  Firespring
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

const HttpException = require('./../../exceptions/http');
const MetricsRepository = require('./../../repositories/metrics');
const Request = require('./../../aws/request');

exports.handle = function (event, context, callback) {
	const repository = new MetricsRepository();
	const request = new Request(event, context);
	const keys = request.queryParam('keys', '').split(',');

	request.validate().then(function () {
		if (keys.length) {
			return repository.batchGet(keys);
		} else {
			return repository.getAll();
		}
	}).then(function (metrics) {
		const results = metrics.map(function (metric) {
			return metric.all();
		});
		callback(null, results);
	}).catch(function (err) {
		(err instanceof HttpException) ? callback(err.context(context)) : callback(err);
	});
};