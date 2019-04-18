<!--
  ~ Copyright 2018 Firespring, Inc.
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
    <textarea :id="id" :value="value" :class="{'has-error': hasErrors}" :height="height"></textarea>
</template>

<script>
	export default {
		data() {
			return {
				toolbars: {
					Basic: [
						{name: 'basicstyles', items: ['Bold', 'Italic', 'Strike', '-', 'RemoveFormat']},
						{name: 'links', items: ['Link', 'Unlink']},
					],
					Advanced: [
						{name: 'styles', items: ['Format']},
						{name: 'basicstyles', items: ['Bold', 'Italic', 'Strike', '-', 'RemoveFormat']},
						{name: 'paragraph', items: ['NumberedList', 'BulletedList', '-', 'Blockquote']},
						{name: 'colors', items: ['TextColor', 'BGColor']},
						{name: 'links', items: ['Link', 'Unlink']},
						{name: 'tools', items: ['Maximize']},
					]
				}
			};
		},
		props: {
			value: {
				type: String,
				default: '',
			},
			id: {
				type: String,
				default: '',
			},
			hasErrors: {
				type: Boolean,
				default: false
			},
			height: {
				type: String,
				default: '200',
			},
			language: {
				type: String,
				default: 'en-us'
			},
			type: {
				type: String,
				default: 'Basic'
			},
		},
		computed: {
			toolbar() {
				const vm = this;
				return (vm.type && vm.toolbars.hasOwnProperty(vm.type)) ? vm.toolbars[vm.type] : vm.toolbars.Basic;
			}
		},
		mounted() {
			const vm = this;

			const config = {
				disallowedContent: 'script',
				extraPlugins: 'colorbutton,colordialog',
				height: vm.height,
				language: vm.language,
				toolbar: vm.toolbar,
			};

			window.CKEDITOR.replace(vm.id, config);
			window.CKEDITOR.instances[vm.id].setData(vm.value);
			window.CKEDITOR.instances[vm.id].on('change', () => {
				const value = window.CKEDITOR.instances[vm.id].getData();

				if (value !== vm.value) {
					vm.$emit('input', value);
				}
			});
		},
		destroyed() {
			const vm = this;

			if (window.CKEDITOR.instances[vm.id]) {
				window.CKEDITOR.instances[vm.id].destroy();
			}
		},
		beforeUpdate() {
			const vm = this;

			if (vm.value !== window.CKEDITOR.instances[vm.id].getData()) {
				window.CKEDITOR.instances[vm.id].setData(vm.value);
			}
		}
	}
</script>