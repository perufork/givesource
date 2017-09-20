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
const sinon = require('sinon');
const Model = require('../../src/models/model');
const Report = require('../../src/models/report');
const ReportHelper = require('../../src/helpers/report');
const TestHelper = require('../helpers/test');

describe('Report', function () {

	describe('#construct()', function () {

		it('should be an instance of Model', function () {
			const model = new Report();
			assert.ok(model instanceof Model);
		});

		it('should be an instance of Report', function () {
			const model = new Report();
			assert.ok(model instanceof Report);
		});

	});

	describe('#populate()', function () {

		it('should generate status', function () {
			const model = new Report();
			assert.equal(model.status, 'PENDING');
		});

		it('should only allow defined attributes', function () {
			const model = new Report({test1: 123, test2: 'test', test3: true});
			assert.equal(model.test1, undefined);
			assert.equal(model.test2, undefined);
			assert.equal(model.test3, undefined);
		});

	});

	describe('#validate()', function () {
		const tests = [
			{model: TestHelper.generate.model('report'), param: 'uuid', value: null, error: true},
			{model: TestHelper.generate.model('report'), param: 'uuid', value: '1234567890', error: true},
			{model: TestHelper.generate.model('report'), param: 'uuid', value: '9ba33b63-41f9-4efc-8869-2b50a35b53df', error: false},
			{model: TestHelper.generate.model('report'), param: 'createdOn', value: null, error: true},
			{model: TestHelper.generate.model('report'), param: 'createdOn', value: 'test', error: true},
			{model: TestHelper.generate.model('report'), param: 'createdOn', value: '123456', error: false},
			{model: TestHelper.generate.model('report'), param: 'createdOn', value: 123456, error: false},
			{model: TestHelper.generate.model('report'), param: 'status', value: null, error: true},
			{model: TestHelper.generate.model('report'), param: 'status', value: '', error: true},
			{model: TestHelper.generate.model('report'), param: 'status', value: 'test', error: true},
			{model: TestHelper.generate.model('report'), param: 'status', value: 123456, error: true},
			{model: TestHelper.generate.model('report'), param: 'status', value: ReportHelper.STATUS_FAILED, error: false},
			{model: TestHelper.generate.model('report'), param: 'status', value: ReportHelper.STATUS_PENDING, error: false},
			{model: TestHelper.generate.model('report'), param: 'status', value: ReportHelper.STATUS_SUCCESS, error: false},
			{model: TestHelper.generate.model('report'), param: 'type', value: null, error: true},
			{model: TestHelper.generate.model('report'), param: 'type', value: 'adsf', error: true},
			{model: TestHelper.generate.model('report'), param: 'type', value: '', error: true},
			{model: TestHelper.generate.model('report'), param: 'type', value: ReportHelper.TYPE_ALL_DONATIONS, error: false},
			{model: TestHelper.generate.model('report'), param: 'type', value: ReportHelper.TYPE_NONPROFIT_DONATIONS, error: false},
			{model: TestHelper.generate.model('report'), param: 'url', value: null, error: true},
			{model: TestHelper.generate.model('report'), param: 'url', value: '', error: true},
			{model: TestHelper.generate.model('report'), param: 'url', value: 'http://longreport.com/report/money/', error: false},
			{model: TestHelper.generate.model('report'), param: 'url', value: 123456, error: true},
		];
		TestHelper.validate(tests);
	});

});