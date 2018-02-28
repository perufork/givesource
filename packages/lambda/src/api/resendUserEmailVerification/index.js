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

const Cognito = require('./../../aws/cognito');
const HttpException = require('./../../exceptions/http');
const Request = require('./../../aws/request');
const User = require('./../../models/user');
const UserGroupMiddleware = require('./../../middleware/userGroup');
const UsersRepository = require('./../../repositories/users');

exports.handle = function (event, context, callback) {
	const cognito = new Cognito();
	const repository = new UsersRepository();
	const request = new Request(event, context).middleware(new UserGroupMiddleware(['SuperAdmin', 'Admin', 'Nonprofit']));

	let user = null;
	request.validate().then(function () {
		return repository.get(request.urlParam('user_uuid'));
	}).then(function (result) {
		user = new User(result);
		user.populate(request._body);
		return user.validate();
	}).then(function () {
		return cognito.createUser(process.env.USER_POOL_ID, user.uuid, user.email, true).catch(function (err) {
			if (err.code === 'UserNotFoundException') {
				return cognito.createUser(process.env.USER_POOL_ID, user.uuid, user.email);
			} else {
				return Promise.reject(err);
			}
		});
	}).then(function () {
		callback();
	}).catch(function (err) {
		(err instanceof HttpException) ? callback(err.context(context)) : callback(err);
	});
};