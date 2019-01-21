/*
 * Copyright 2019 Firespring, Inc.
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

const FileRepository = require('./../../repositories/files');
const NonprofitsRepository = require('./../../repositories/nonprofits');
const RenderHelper = require('./../../helpers/render');
const SettingsRepository = require('./../../repositories/settings');
const SSM = require('./../../aws/ssm');

exports.handle = (event, context, callback) => {
	const request = event.Records[0].cf.request;
	const userAgent = request.headers['user-agent'][0].value;

	// request targets non-html files
	if (request.uri.match(/\.(js|css|xml|less|png|jpg|jpeg|gif|pdf|doc|txt|ico|rss|zip|mp3|rar|exe|wmv|avi|ppt|mpg|mpeg|tif|wav|mov|psd|ai|xls|mp4|m4a|swf|dat|dmg|iso|flv|m4v|torrent|ttf|woff|svg|eot)/i)) {
		callback(null, request);
		return;
	}

	// request is coming from a supported social sharing bot
	if (userAgent.match(/twitterbot|facebookexternalhit|linkedinbot|slackbot/i)) {
		console.log('user-agent: ' + userAgent);

		const ssm = new SSM();
		const functionName = process.env.AWS_LAMBDA_FUNCTION_NAME.replace(process.env.AWS_REGION + '.', '');

		let fileRepository = null;
		let nonprofitRepository = null;
		let settingsRepository = null;

		const settings = {
			EVENT_TITLE: null,
			EVENT_URL: null,
			MASTHEAD_IMAGE: null,
			SOCIAL_SHARING_DESCRIPTION: null,
			SOCIAL_SHARING_IMAGE: null,
			UPLOADS_CLOUD_FRONT_URL: null
		};

		const data = {
			description: null,
			event_title: null,
			image_url: null,
			title: null,
			url: null
		};

		let promise = Promise.resolve();
		promise = promise.then(() => {
			// get stack configuration
			return ssm.getParameter(process.env.AWS_REGION, '/' + functionName + '/config');
		}).then(response => {
			const config = JSON.parse(response.Parameter.Value);

			fileRepository = new FileRepository({
				region: config.AWS_STACK_REGION,
				table: config.AWS_STACK_NAME + '-Files'
			});

			nonprofitRepository = new NonprofitsRepository({
				region: config.AWS_STACK_REGION,
				table: config.AWS_STACK_NAME + '-Nonprofits'
			});

			settingsRepository = new SettingsRepository({
				region: config.AWS_STACK_REGION,
				table: config.AWS_STACK_NAME + '-Settings'
			});
		}).then(() => {
			// get event settings
			return settingsRepository.batchGet(Object.keys(settings));
		}).then(response => {
			response.forEach(setting => {
				if (settings.hasOwnProperty(setting.key)) {
					settings[setting.key] = setting.value;
				}
			});
		}).then(() => {
			// set sharing defaults
			data.description = settings.SOCIAL_SHARING_DESCRIPTION;
			data.event_title = settings.EVENT_TITLE;
			data.title = settings.EVENT_TITLE;
			data.url = settings.EVENT_URL;

			if (!settings.SOCIAL_SHARING_IMAGE) {
				settings.SOCIAL_SHARING_IMAGE = settings.MASTHEAD_IMAGE;
			}
		});

		// ff sharing a nonprofit's page, get nonprofit's share settings
		if (request.uri.indexOf('/nonprofits/') === 0) {
			let slug = request.uri.replace('/nonprofits/', '');
			slug = slug.split('/')[0].split('.')[0];

			if (slug) {
				console.log('slug: ' + slug);
				promise = promise.then(() => {
					return nonprofitRepository.getBySlug(slug).then(nonprofit => {
						data.url = settings.EVENT_URL + '/nonprofits/' + slug;
						if (nonprofit.socialSharingDescription) {
							data.description = nonprofit.socialSharingDescription;
						}
						if (nonprofit.legalName) {
							data.title = 'Support ' + nonprofit.legalName + ' at ' + settings.EVENT_TITLE;
						}
						if (nonprofit.socialSharingFileUuid) {
							settings.SOCIAL_SHARING_IMAGE = nonprofit.socialSharingFileUuid;
						}
					});
				});
			}
		}

		promise.then(() => {
			// get file url
			if (settings.SOCIAL_SHARING_IMAGE) {
				return fileRepository.get(settings.SOCIAL_SHARING_IMAGE).then(file => {
					data.image_url = (file) ? settings.UPLOADS_CLOUD_FRONT_URL + '/' + file.path : null;
				});
			}
		}).then(() => {
			// generate HTML response
			console.log('template-data: %j', data);
			return RenderHelper.renderTemplate('social.social-sharing', data);
		}).then(html => {
			const response = {
				status: '200',
				statusDescription: 'HTTP OK',
				body: html,
				headers: {
					'cache-control': [{
						key: 'Cache-Control',
						value: 'max-age=120'
					}],
					'content-type': [{
						key: 'Content-Type',
						value: 'text/html'
					}]
				}
			};
			callback(null, response);
		}).catch(err => {
			console.log(err);
			callback(null, response);
		});

		// pass on normal requests
	} else {
		callback(null, request);
	}
};