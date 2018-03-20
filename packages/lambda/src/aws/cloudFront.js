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

const AWS = require('aws-sdk');

/**
 * CloudFront constructor
 *
 * @constructor
 */
function CloudFront() {
}

/**
 * Create an AWS CloudFront invalidation
 *
 * @param {String} id
 * @param {[]} paths
 * @return {Promise}
 */
CloudFront.prototype.createInvalidation = function (id, paths) {
	const awsCloudFront = new AWS.CloudFront();
	return new Promise(function (resolve, reject) {
		const timestamp = new Date().getTime();
		const params = {
			DistributionId: id,
			InvalidationBatch: {
				CallerReference: timestamp.toString(),
				Paths: {
					Quantity: paths.length,
					Items: [
						paths.join(',')
					]
				}
			}
		};
		awsCloudFront.createInvalidation(params, function (err, data) {
			if (err) {
				reject(err);
			}
			resolve(data);
		});
	});
};

/**
 * Get an AWS CloudFront distribution config
 *
 * @param {String} id
 * @return {Promise}
 */
CloudFront.prototype.getDistributionConfig = function (id) {
	const awsCloudFront = new AWS.CloudFront();
	return new Promise(function (resolve, reject) {
		const params = {
			Id: id
		};
		awsCloudFront.getDistributionConfig(params, function (err, data) {
			if (err) {
				reject(err);
			}
			resolve(data);
		});
	});
};

/**
 * Update an AWS CloudFront distribution
 *
 * @param {String} id
 * @param {String} eTag
 * @param {{}} config
 * @return {Promise}
 */
CloudFront.prototype.updateDistribution = function (id, eTag, config) {
	const awsCloudFront = new AWS.CloudFront();
	return new Promise(function (resolve, reject) {
		const params = {
			Id: id,
			IfMatch: eTag,
			DistributionConfig: config
		};
		awsCloudFront.updateDistribution(params, function (err, data) {
			if (err) {
				reject(err);
			}
			resolve(data);
		});
	});
};

module.exports = CloudFront;