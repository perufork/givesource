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

const HttpException = require('./http');

/**
 * MissingRequiredParameter constructor
 *
 * @param {String} [message]
 * @constructor
 */
function MissingRequiredParameter (message) {
	HttpException.call(this, message);

	this._status = 400;
	this._type = 'missing_required_parameter';
	this.defaultMessage = 'A required parameter was not specified for this request.';
}

/**
 * Extend the base HttpException
 *
 * @type {HttpException}
 */
MissingRequiredParameter.prototype = new HttpException();

module.exports = MissingRequiredParameter;