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

const assert = require('assert');
const GetSettings = require('./../../../src/api/getSettings/index');
const SettingsRepository = require('./../../../src/repositories/settings');
const sinon = require('sinon');
const TestHelper = require('./../../helpers/test');

describe('GetSettings', function () {

	afterEach(function () {
		SettingsRepository.prototype.getAll.restore();
	});

	it('should return a list of settings', function () {
		const models = TestHelper.generate.modelCollection('setting', 3);
		sinon.stub(SettingsRepository.prototype, 'getAll').resolves(models);
		return GetSettings.handle({}, null, function (error, results) {
			assert(error === null);
			assert(results.length === 3);
			results.forEach(function (result, i) {
				assert(result.uuid === models[i].uuid);
			});
		});
	});

	it('should return error on exception thrown', function () {
		sinon.stub(SettingsRepository.prototype, 'getAll').rejects('Error');
		return GetSettings.handle({}, null, function (error) {
			assert(error instanceof Error);
		});
	});

});