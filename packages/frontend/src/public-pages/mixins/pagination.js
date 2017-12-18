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

module.exports = {
	data: function () {
		return {
			pagination: {
				items: [],
				loaded: false,
				size: 0,
				start: 0,
				total: 0
			}
		};
	},
	methods: {
		resetPaginationData: function () {
			const vue = this;

			vue.pagination = {
				items: [],
				loaded: false,
				size: 0,
				start: 0,
				total: 0
			};
		},
		setPaginationData: function (data) {
			const vue = this;

			vue.pagination.items = data.items;
			vue.pagination.size = data.size;
			vue.pagination.start = data.start;
			vue.pagination.total = data.total;

			vue.pagination.loaded = true;
		}
	}
};