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

const slug = require('slug');

exports.STATUS_ACTIVE = 'ACTIVE';
exports.STATUS_DENIED = 'DENIED';
exports.STATUS_PENDING = 'PENDING';
exports.STATUS_REVOKED = 'REVOKED';

/**
 * Generate a slug from a string
 *
 * @param {String} string
 */
exports.generateSlug = function (string) {
	return slug(string, {lower: true});
};