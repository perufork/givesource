/*
 * Copyright (C) 2018  Firespring
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

const _ = require('lodash');
const SettingHelper = require('./setting');
const Lambda = require('./../aws/lambda');

/**
 * Regenerate custom css if the appropriate settings have changed
 *
 * @param {Array} updatedSettings
 * @param {String} awsRegion
 * @param {String} awsStackName
 * @param {Boolean} force
 * @returns {Promise}
 */
exports.regenerateCustomCss = function (updatedSettings, awsRegion, awsStackName, force) {
	const settings = [
		SettingHelper.SETTING_ACCENT_COLOR
	];
	const changedSettings = _.intersection(settings, updatedSettings);
	let promise = Promise.resolve();
	if (changedSettings.length > 0 || force) {
		const lambda = new Lambda();
		promise = lambda.invoke(awsRegion, awsStackName + '-GenerateCustomFrontendCss', {});
	}

	return promise;
};

/**
 * Regenerate public index if the appropriate settings have changed
 *
 * @param {Array} updatedSettings
 * @param {String} awsRegion
 * @param {String} awsStackName
 * @param {Boolean} force
 * @returns {Promise}
 */
exports.regeneratePublicIndex = function (updatedSettings, awsRegion, awsStackName, force) {
	const settings = [
		SettingHelper.SETTING_EVENT_TITLE,
		SettingHelper.SETTING_EVENT_URL,
		SettingHelper.SETTING_SOCIAL_SHARING_DESCRIPTION,
		SettingHelper.SETTING_SOCIAL_SHARING_IMAGE,
	];
	const changedSettings = _.intersection(settings, updatedSettings);
	let promise = Promise.resolve();
	if (changedSettings.length > 0 || force) {
		const lambda = new Lambda();
		promise = lambda.invoke(awsRegion, awsStackName + '-GeneratePublicIndexFile', {});
	}

	return promise;
};

/**
 * Regenerate dynamic content
 *
 * @param {Array} updatedSettings
 * @param {String} awsRegion
 * @param {String} awsStackName
 * @param {Boolean} force
 * @returns {Promise}
 */
exports.regenerateDynamicContent = function (updatedSettings, awsRegion, awsStackName, force) {
	let promise = Promise.resolve();
	const helper = this;

	promise = promise.then(function () {
		return helper.regenerateCustomCss(updatedSettings, awsRegion, awsStackName, force);
	});

	promise = promise.then(function () {
		return helper.regeneratePublicIndex(updatedSettings, awsRegion, awsStackName, force);
	});

	return promise;
};