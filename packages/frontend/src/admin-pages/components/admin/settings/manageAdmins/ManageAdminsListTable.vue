<!--
  ~ Copyright (C) 2017  Firespring
  ~
  ~ This program is free software: you can redistribute it and/or modify
  ~ it under the terms of the GNU General Public License as published by
  ~ the Free Software Foundation, either version 3 of the License, or
  ~ (at your option) any later version.
  ~
  ~ This program is distributed in the hope that it will be useful,
  ~ but WITHOUT ANY WARRANTY; without even the implied warranty of
  ~ MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
  ~ GNU General Public License for more details.
  ~
  ~ You should have received a copy of the GNU General Public License
  ~ along with this program.  If not, see <http://www.gnu.org/licenses/>.
  -->

<template>
    <table class="table-middle" :class="{ 'table-empty': !displayRows }">
        <thead>
        <tr>
            <th class="input">
                <div class="checkbox checkbox--sm">
                    <input type="checkbox" name="checkAllRows" id="checkAllRows-1" class="check-all-rows js-check-all-rows" value="1">
                    <label for="checkAllRows-1"></label>
                </div>
            </th>
            <th class="icon"><i class="fa fa-picture-o" aria-hidden="true"></i></th>
            <th class="u-width-100p sortable sortable--asc">
                <a href="#">Name</a>
            </th>
            <th class="sortable">
                <a href="#">Added</a>
            </th>
            <th></th>
        </tr>
        </thead>

        <tbody v-if="displayRows">
        <manage-admins-list-table-row v-for="adminUser in adminUsers" :adminUser="adminUser" :key="adminUser.uuid"></manage-admins-list-table-row>
        </tbody>

        <tbody v-else>
        <layout-empty-table-row :loaded="loaded" :colspan="5" message="There are no users."></layout-empty-table-row>
        </tbody>

    </table>
</template>

<script>
	module.exports = {
		data: function () {
			return {
				adminUsers: [],
				loaded: false
			};
		},
		computed: {
			displayRows: function () {
				return this.loaded && this.adminUsers.length;
			}
		},
		props: [
			'nonprofitUuid'
		],
		created: function () {
			const vue = this;

			axios.get(API_URL + 'users').then(function (response) {
				vue.adminUsers = response.data;
				vue.loaded = true;
			});
		},
		components: {
			'layout-empty-table-row': require('./../../../layout/EmptyTableRow.vue'),
			'manage-admins-list-table-row': require('./ManageAdminsListTableRow.vue')
		}
	};
</script>