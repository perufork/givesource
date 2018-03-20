/*
 * Copyright 2018 Firespring, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const assert = require('assert');
const Metric = require('../../src/models/metric');
const Model = require('../../src/models/model');
const TestHelper = require('../helpers/test');

describe('Metric', function () {

	describe('#construct()', function () {

		it('should be an instance of Model', function () {
			const model = new Metric();
			assert.ok(model instanceof Model);
		});

		it('should be an instance of Metric', function () {
			const model = new Metric();
			assert.ok(model instanceof Metric);
		});

	});

	describe('#populate()', function () {

		it('should only allow defined attributes', function () {
			const model = new Metric({test1: 123, test2: 'test', test3: true});
			assert.equal(model.test1, undefined);
			assert.equal(model.test2, undefined);
			assert.equal(model.test3, undefined);
		});

	});

	describe('#validate()', function () {
		const tests = [
			{model: TestHelper.generate.model('metric'), param: 'uuid', value: null, error: true},
			{model: TestHelper.generate.model('metric'), param: 'uuid', value: '1234567890', error: true},
			{model: TestHelper.generate.model('metric'), param: 'uuid', value: '9ba33b63-41f9-4efc-8869-2b50a35b53df', error: false},
			{model: TestHelper.generate.model('metric'), param: 'createdOn', value: null, error: true},
			{model: TestHelper.generate.model('metric'), param: 'createdOn', value: 'test', error: true},
			{model: TestHelper.generate.model('metric'), param: 'createdOn', value: '123456', error: true},
			{model: TestHelper.generate.model('metric'), param: 'createdOn', value: 123456, error: false},
			{model: TestHelper.generate.model('metric'), param: 'isDeleted', value: null, error: true},
			{model: TestHelper.generate.model('metric'), param: 'isDeleted', value: 'test', error: true},
			{model: TestHelper.generate.model('metric'), param: 'isDeleted', value: '123456', error: true},
			{model: TestHelper.generate.model('metric'), param: 'isDeleted', value: 123456, error: true},
			{model: TestHelper.generate.model('metric'), param: 'isDeleted', value: 0, error: false},
			{model: TestHelper.generate.model('metric'), param: 'isDeleted', value: 1, error: false},
			{model: TestHelper.generate.model('metric'), param: 'key', value: null, error: true},
			{model: TestHelper.generate.model('metric'), param: 'key', value: '', error: true},
			{model: TestHelper.generate.model('metric'), param: 'key', value: 'test', error: false},
			{model: TestHelper.generate.model('metric'), param: 'key', value: 123456, error: true},
			{model: TestHelper.generate.model('metric'), param: 'value', value: null, error: false},
			{model: TestHelper.generate.model('metric'), param: 'value', value: '', error: false},
			{model: TestHelper.generate.model('metric'), param: 'value', value: 'test', error: true},
			{model: TestHelper.generate.model('metric'), param: 'value', value: 123456, error: false},
		];
		TestHelper.validate(tests);
	});

});