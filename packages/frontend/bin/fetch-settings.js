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

const AWS = require('aws-sdk');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

dotenv.config({path: `${__dirname}/../../../.env`});

const describeStack = function (cloudFormation, stackName) {
	return new Promise(function (resolve, reject) {
		const params = {
			StackName: stackName
		};
		cloudFormation.describeStacks(params, (error, data) => {
			if (error) {
				return reject(error);
			}
			if (!data) {
				return reject(new Error('describeStacks returned no data'));
			}
			const stacks = data.Stacks;
			if (!stacks || stacks.length !== 1) {
				return reject(new Error('describeStacks unexpected number of stacks'));
			}
			resolve(stacks[0]);
		})
	});
};

const findOutputKey = function (outputs, outputKey) {
	let value;
	outputs.forEach((output) => {
		if (output.OutputKey === outputKey) {
			value = output.OutputValue;
		}
	});
	if (value === undefined) {
		throw new Error(outputKey + ' not found');
	}
	return value;
};

const getSettings = function () {
	return new Promise(function (resolve, reject) {
		const stackName = process.env.AWS_STACK_NAME;
		const region = process.env.AWS_DEPLOY_REGION;
		const cloudFormation = new AWS.CloudFormation({region: region});

		describeStack(cloudFormation, stackName).then(function (stack) {
			resolve({
				AdminPagesCloudFrontUrl: findOutputKey(stack.Outputs, 'AdminPagesCloudFrontUrl'),
				ClientId: findOutputKey(stack.Outputs, 'UserPoolClientId'),
				InvocationUrl: findOutputKey(stack.Outputs, 'InvocationUrl'),
				PublicPagesCloudFrontUrl: findOutputKey(stack.Outputs, 'PublicPagesCloudFrontUrl'),
				PublicPagesS3: findOutputKey(stack.Outputs, 'PublicPagesS3BucketName'),
				UserPoolId: findOutputKey(stack.Outputs, 'UserPoolId')
			});
		}).catch(function (err) {
			reject(err);
		});
	});
};

const getBucketInfo = function () {
	return new Promise(function (resolve, reject) {
		const stackName = process.env.AWS_STACK_NAME;
		const region = process.env.AWS_DEPLOY_REGION;
		const cloudFormation = new AWS.CloudFormation({region: region});

		describeStack(cloudFormation, stackName).then(function (stack) {
			resolve({
				adminPagesS3BucketName: findOutputKey(stack.Outputs, 'AdminPagesS3BucketName'),
				adminPagesS3BucketUrl: findOutputKey(stack.Outputs, 'AdminPagesS3BucketUrl'),
				publicPagesS3BucketName: findOutputKey(stack.Outputs, 'PublicPagesS3BucketName'),
				publicPagesS3BucketUrl: findOutputKey(stack.Outputs, 'PublicPagesS3BucketUrl'),
			});
		}).catch(function (err) {
			reject(err);
		});
	});
};

getSettings().then(function (data) {
	const json = JSON.stringify(data, null, 2);
	const configDir = path.normalize(`${__dirname}/../config`);
	fs.writeFileSync(`${configDir}/settings.json`, json);
	console.log('settings.json created');
}).catch(function (err) {
	console.error(err, err.stack);
	process.exit(1);
});

getBucketInfo().then(function (data) {
	const json = JSON.stringify(data, null, 2);
	const configDir = path.normalize(`${__dirname}/../config`);
	fs.writeFileSync(`${configDir}/deploy-info.json`, json);
	console.log('deploy-info.json created');
}).catch(function (err) {
	console.error(err, err.stack);
	process.exit(1);
});