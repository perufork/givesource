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

const _ = require('lodash');
const logger = require('./../../helpers/log');
const HttpException = require('./../../exceptions/http');
const jsStringEscape = require('js-string-escape');
const S3 = require('./../../aws/s3');
const SettingsRepository = require('./../../repositories/settings');
const FileRepository = require('./../../repositories/files');
const Request = require('./../../aws/request');
const RenderHelper = require('./../../helpers/render');

exports.handle = function (event, context, callback) {
	logger.log('generatePublicIndexFile event: %j', event);

	const request = new Request(event, context);
	const repository = new SettingsRepository();
	const fileRepository = new FileRepository();

	const settings = {
		ADMIN_URL: null,
		API_URL: null,
		CONTACT_PHONE: null,
		DATE_DONATIONS_END: null,
		DATE_DONATIONS_START: null,
		DATE_EVENT: null,
		DATE_REGISTRATIONS_END: null,
		DATE_REGISTRATIONS_START: null,
		EVENT_LOGO: null,
		EVENT_TIMEZONE: null,
		EVENT_TITLE: null,
		EVENT_URL: null,
		FOUNDATION_LOGO: null,
		FOUNDATION_URL: null,
		GOOGLE_ANALYTICS_TRACKING_ID: null,
		MASTHEAD_IMAGE: null,
		PAGE_ABOUT_ENABLED: null,
		PAGE_FAQ_ENABLED: null,
		PAGE_TERMS_ENABLED: null,
		PAGE_TOOLKIT_ENABLED: null,
		PUBLIC_INDEX_TEMPLATE: null,
		SOCIAL_SHARING_DESCRIPTION: null,
		SOCIAL_SHARING_IMAGE: null,
		UPLOADS_CLOUD_FRONT_URL: null
	};

	const fileKeys = [
		'EVENT_LOGO',
		'FOUNDATION_LOGO',
		'MASTHEAD_IMAGE',
		'SOCIAL_SHARING_IMAGE',
	];

	request.validate().then(function () {
		return repository.batchGet(Object.keys(settings));
	}).then(function (response) {
		_.forEach(response, function (setting) {
			if (settings.hasOwnProperty(setting.key)) {
				settings[setting.key] = setting.value;
			}
		});

		let promise = Promise.resolve();
		const fileUuids = _.filter(_.values(_.pick(settings, fileKeys)));
		if (fileUuids.length) {
			promise = fileRepository.batchGet(fileUuids);
		}
		return promise;
	}).then(function (files) {
		fileKeys.forEach(function (settingKey) {
			if (!_.isEmpty(settings[settingKey])) {
				const file = _.find(files, {uuid: settings[settingKey]});
				settings[settingKey] = (file) ? settings.UPLOADS_CLOUD_FRONT_URL + '/' + file.path : null;
			}
		});

		return generateIndexBody(settings.PUBLIC_INDEX_TEMPLATE, _.omit(settings, 'PUBLIC_INDEX_TEMPLATE'));
	}).then(function (response) {
		return writeIndexFile(response);
	}).then(function () {
		callback();
	}).catch(function (err) {
		(err instanceof HttpException) ? callback(err.context(context)) : callback(err);
	});

	/**
	 * Generate contents of the index file
	 *
	 * @param template
	 * @param settings
	 * @returns {Promise}
	 */
	const generateIndexBody = function (template, settings) {
		const data = {
			settings: settings,
			e: function () {
				return function (text, render) {
					return jsStringEscape(render(text));
				}
			}
		};
		return RenderHelper.renderStringTemplate(template, data);
	};

	/**
	 * Write public index file to s3
	 *
	 * @param {String} body
	 * @returns {Promise}
	 */
	const writeIndexFile = function (body) {
		const s3 = new S3();
		const region = process.env.AWS_REGION;
		const bucket = process.env.PUBLIC_PAGES_S3_BUCKET;

		return s3.putObject(region, bucket, 'index.html', body);
	};

};