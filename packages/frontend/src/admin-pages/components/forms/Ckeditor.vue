<!--
  ~ Copyright 2019 Firespring, Inc.
  ~
  ~ Licensed under the Apache License, Version 2.0 (the "License");
  ~ you may not use this file except in compliance with the License.
  ~ You may obtain a copy of the License at
  ~
  ~     http://www.apache.org/licenses/LICENSE-2.0
  ~
  ~ Unless required by applicable law or agreed to in writing, software
  ~ distributed under the License is distributed on an "AS IS" BASIS,
  ~ WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  ~ See the License for the specific language governing permissions and
  ~ limitations under the License.
  -->

<template>
    <component v-if="loaded" :is="editor" v-model="localValue" :type="type" :id="id" :height="height" :hasErrors="hasErrors"></component>
    <layout-spinner v-else :height="height"></layout-spinner>
</template>

<script>
	import ComponentCkeditor4 from './Ckeditor4.vue';
	import ComponentCkeditor5 from './Ckeditor5.vue';
	import ComponentSpinner from './../layout/Spinner.vue';

	export default {
		data() {
			return {
				localValue: this.value ? this.value : '',
			};
		},
		computed: {
			editor() {
				const vm = this;
				return vm.isInternetExplorer() || vm.isMicrosoftEdge() ? 'forms-ckeditor4' : 'forms-ckeditor5';
			}
		},
		props: {
			value: {},
			id: {
				type: String,
				default: ''
			},
			hasErrors: {
				type: Boolean,
				default: false
			},
			height: {
				type: String,
				default: '200'
			},
			loaded: {
				type: Boolean,
				default: true
			},
			type: {
				type: String,
				default: 'basic',
			}
		},
		watch: {
			localValue: function (value, oldValue) {
				if (value === oldValue) {
					return;
				}
				this.$emit('input', value);
			},
			value: function (value, oldValue) {
				if (value === oldValue) {
					return;
				}
				this.localValue = value;
			}
		},
		components: {
			'forms-ckeditor4': ComponentCkeditor4,
			'forms-ckeditor5': ComponentCkeditor5,
			'layout-spinner': ComponentSpinner,
		}
	};
</script>