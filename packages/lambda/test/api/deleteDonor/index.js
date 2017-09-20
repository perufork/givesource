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
const DeleteDonor = require('../../../src/api/deleteDonor/index');
const DonorsRepository = require('../../../src/repositories/donors');
const TestHelper = require('../../helpers/test');

describe('DeleteDonor', function () {

	afterEach(function () {
		DonorsRepository.prototype.delete.restore();
	});

	it('should delete a donor', function () {
		const model = TestHelper.generate.model('donor');
		sinon.stub(DonorsRepository.prototype, 'delete').resolves(model);
		const params = {
			params: {
				donorUuid: model.uuid
			}
		};
		return DeleteDonor.handle(params, null, function (error, result) {
			assert(error === null);
			assert(result === null);
		});
	});

	it('should return error on exception thrown', function () {
		sinon.stub(DonorsRepository.prototype, 'delete').rejects('Error');
		const params = {
			params: {
				donorUuid: '1234'
			}
		};
		return DeleteDonor.handle(params, null, function (error, result) {
			assert(error instanceof Error);
		});
	});

});