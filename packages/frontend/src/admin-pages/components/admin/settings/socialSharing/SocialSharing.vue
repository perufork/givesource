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
    <div class="o-app">
        <navigation></navigation>

        <main class="o-app__main o-app__main--compact">
            <div class="o-app_main-content o-app_main-content--md">

                <div class="o-page-header">
                    <div class="o-page-header__text">
                        <nav class="o-page-header-nav c-breadcrumb">
                            <span><router-link :to="{ name: 'settings-list' }">Settings</router-link></span>
                        </nav>
                        <h1 class="o-page-header-title">Social Sharing Settings</h1>
                    </div>
                </div>

                <div class="o-app-main-content">

                    <form v-on:submit.prevent="submit">
                        <section class="c-page-section c-page-section--border c-page-section--shadow c-page-section--segmented">

                            <header class="c-page-section__header">
                                <div class="c-page-section-header-text">
                                    <h2 class="c-page-section-title">Social Sharing</h2>
                                    <div class="c-notes c-notes--below">
                                        This content will be used when someone shares your event via social media.
                                    </div>
                                </div>
                            </header>

                            <div class="c-page-section__main">

                                <div class="c-form-item c-form-item--file c-form-item--file-picker" :class="{ 'c-form-item--has-error': formErrors.SOCIAL_SHARING_IMAGE }">
                                    <div class="c-form-item__label">
                                        <label for="socialSharingImage" class="c-form-item-label-text">Social Image</label>

                                        <div class="c-notes">
                                            This image will appear when your event is shared via social media, If you do not select an image, your masthead image will be used.
                                        </div>
                                    </div>
                                    <forms-image-editor v-model="formData.SOCIAL_SHARING_IMAGE" name="socialSharingImage" id="socialSharingImage"></forms-image-editor>
                                    <div v-if="formErrors.SOCIAL_SHARING_IMAGE" class="c-notes c-notes--below c-notes--bad c-form-control-error">
                                        {{ formErrors.SOCIAL_SHARING_IMAGE }}
                                    </div>
                                </div>

                                <div class="c-form-item c-form-item--textarea" :class="{ 'c-form-item--has-error': formErrors.SOCIAL_SHARING_DESCRIPTION }">
                                    <div class="c-form-item__label">
                                        <label for="socialSharingDescription" class="c-form-item-label-text">Social Description</label>

                                        <div class="c-notes">
                                            This description will appear when your event is shared via social media.
                                        </div>
                                    </div>
                                    <div class="c-form-item__control">
                                        <textarea v-model="formData.SOCIAL_SHARING_DESCRIPTION" name="socialSharingDescription" id="socialSharingDescription"
                                                  :class="{ 'has-error': formErrors.SOCIAL_SHARING_DESCRIPTION }"></textarea>
                                        <div v-if="formErrors.SOCIAL_SHARING_DESCRIPTION" class="c-notes c-notes--below c-notes--bad c-form-control-error">
                                            {{ formErrors.SOCIAL_SHARING_DESCRIPTION }}
                                        </div>
                                    </div>
                                </div>

                                <div class="c-form-item" v-if="displayPreview">
                                    <div class="c-form-item__label">
                                        <label class="c-form-item-label-text">Preview</label>

                                        <div class="c-notes">
                                            This is an example how your event may appear when shared via social media.
                                        </div>
                                    </div>
                                    <div class="c-form-item__control">
                                        <social-card :description="formData.SOCIAL_SHARING_DESCRIPTION" :image="formData.SOCIAL_SHARING_IMAGE" :title="formData.EVENT_TITLE"
                                                     :url="formData.EVENT_URL"></social-card>
                                    </div>
                                </div>

                            </div>
                        </section>

                        <footer class="c-form-actions">
                            <button type="submit" class="c-btn">Save Changes</button>
                            <router-link :to="{ name: 'settings-list' }" class="c-btn c-btn--neutral c-btn--text">Cancel</router-link>
                        </footer>
                    </form>

                </div>
            </div>
        </main>
    </div>
</template>

<script>
	import ComponentImageEditor from './../../../forms/ImageEditor.vue';
	import ComponentSocialCard from './../../../media/SocialCard.vue';

	export default {
		data() {
			return {
				settings: [],

				// Form Data
				formData: {
					EVENT_TITLE: '',
                    EVENT_URL: '',
					SOCIAL_SHARING_IMAGE: null,
					SOCIAL_SHARING_DESCRIPTION: ''
				},

				// Errors
				formErrors: {}

			};
		},
        computed: {
			displayPreview() {
				return this.formData.EVENT_TITLE || this.formData.EVENT_URL || this.formData.SOCIAL_SHARING_IMAGE || this.formData.SOCIAL_SHARING_DESCRIPTION;
            }
        },
		beforeRouteEnter(to, from, next) {
			next(vm => {
				vm.$request.get('settings', {
					keys: Object.keys(vm.formData)
				}).then(response => {
					vm.settings = response.data;
				});
			});
		},
		watch: {
			formData: {
				handler() {
					const vm = this;
					if (Object.keys(vm.formErrors).length) {
						vm.formErrors = vm.validate(vm.formData, vm.getConstraints());
					}
				},
				deep: true
			},
			settings: {
				handler() {
					const vm = this;
					if (vm.settings.length) {
						Object.keys(vm.formData).forEach(key => {
							const setting = _.find(vm.settings, {key: key});
							if (setting) {
								if (!vm.isFileSetting(key)) {
									vm.formData[key] = setting.value;
								} else {
									if (setting.value) {
										vm.$request.get('files/' + setting.value).then(response => {
											vm.formData[key] = response.data;
										}).catch(() => {
											vm.formData[key] = null;
										});
									}
								}
							}
						});
					}
				},
				deep: true
			}
		},
		methods: {
			getConstraints() {
				return {
					SOCIAL_SHARING_DESCRIPTION: {
						presence: false
					},
					SOCIAL_SHARING_IMAGE: {
						presence: false,
						image: true,
					}
				};
			},
			submit() {
				const vm = this;

				vm.addModal('spinner');

				vm.formErrors = vm.validate(vm.formData, vm.getConstraints());
				if (Object.keys(vm.formErrors).length) {
					vm.clearModals();
				} else {
					vm.updateSettings();
				}
			},
			updateSettings() {
				const vm = this;

				vm.getSettingsToUpdate().then(settings => {
					const toUpdate = _.reject(settings, setting => {
						return (setting.value === '' || setting.value === null);
					});
					const toDelete = _.filter(settings, setting => {
						return (setting.value === '' || setting.value === null);
					});

					vm.$request.patch('settings', {
						settings: toUpdate
					}).then(response => {
						if (response.data.errorMessage) {
							console.log(response.data);
						}
						return vm.$request.delete('settings', {
							settings: toDelete
						});
					}).then(response => {
						if (response.data.errorMessage) {
							console.log(response.data);
						}

						// delete files that were replace or removed
						const filesToDelete = [];
						_.forEach(settings, setting => {
							if (vm.isFileSetting(setting.key)) {
								const originalSetting = _.find(vm.settings, {key: setting.key});
								if (originalSetting && originalSetting.value !== setting.value && originalSetting.value !== '' && originalSetting.value !== null) {
									filesToDelete.push(originalSetting.value);
								}
							}
						});

						if (filesToDelete.length > 0) {
							return vm.$request.delete('files', {
								files: filesToDelete
							});
						}

						return Promise.resolve();
					}).then(() => {
						vm.clearModals();
						vm.$router.push({name: 'settings-list'});
					}).catch(err => {
						vm.clearModals();
						console.log(err);
					});

				});

			},
			getSettingsToUpdate() {
				const vm = this;
				const settings = [];
				let promise = Promise.resolve();

				Object.keys(vm.formData).forEach(key => {
					if (vm.formData[key] instanceof File) {
						promise = promise.then(() => {
							return vm.uploadImage(key).then(uploadedFile => {
								vm.$store.commit('generateCacheKey');
								settings.push({
									key: key,
									value: uploadedFile && uploadedFile.hasOwnProperty('uuid') ? uploadedFile.uuid : ''
								});
							});
						});
					} else {
						promise = promise.then(() => {
							let settingValue = vm.formData[key];
							if (_.isPlainObject(vm.formData[key]) && vm.formData[key].hasOwnProperty('uuid')) {
								settingValue = vm.formData[key].uuid;
							}
							settings.push({
								key: key,
								value: settingValue
							});
						});
					}
				});

				promise = promise.then(() => {
					return settings;
				});

				return promise;
			},
			uploadImage(key) {
				const vm = this;
				let file = null;
				let promise = Promise.resolve();

				if (vm.formData[key]) {
					promise = promise.then(() => {
						return vm.$request.post('files', {
							content_type: vm.formData[key].type,
							filename: vm.formData[key].name
						});
					}).then(response => {
						file = response.data.file;
						const signedUrl = response.data.upload_url;

						const defaultHeaders = JSON.parse(JSON.stringify(axios.defaults.headers));
						let instance = axios.create();
						instance.defaults.headers.common['Content-Type'] = vm.formData[key].type || 'application/octet-stream';
						instance.defaults.headers.put['Content-Type'] = vm.formData[key].type || 'application/octet-stream';
						axios.defaults.headers = defaultHeaders;
						return instance.put(signedUrl, vm.formData[key]);
					}).then(() => {
						return file;
					});
				}
				return promise;
			},
			isFileSetting(settingKey) {
				const fileKeys = ['SOCIAL_SHARING_IMAGE'];
				return _.includes(fileKeys, settingKey);
			}
		},
		components: {
			'forms-image-editor': ComponentImageEditor,
            'social-card': ComponentSocialCard
		}
	};
</script>