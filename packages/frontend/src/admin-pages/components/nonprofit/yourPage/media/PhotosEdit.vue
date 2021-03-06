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
        <navigation :nonprofitUuid="nonprofitUuid"></navigation>
        <main class="o-app__main o-app__main--compact">
            <div class="o-app_main-content o-app_main-content--md">
                <api-error v-model="apiError"></api-error>

                <div class="o-page-header" v-if="isAdmin">
                    <div class="o-page-header__text">
                        <nav class="o-page-header-nav c-breadcrumb">
                            <span><router-link :to="{ name: 'nonprofits-list' }">Nonprofits</router-link></span>
                            <span v-if="nonprofit.legalName"><router-link :to="{ name: 'nonprofit-your-page'}">Manage {{ nonprofit.legalName }}'s Donation Page</router-link></span>
                            <span v-else><router-link :to="{ name: 'nonprofit-your-page'}">Manage Donation Page</router-link></span>
                            <span><router-link :to="{ name: 'nonprofit-your-page', query: { tab: 'media' }}">Manage Image & Videos</router-link></span>
                        </nav>
                        <h1 class="o-page-header-title" v-if="nonprofit.legalName">{{ nonprofit.legalName }} - Edit Image</h1>
                    </div>
                </div>

                <div class="o-page-header" v-else>
                    <div class="o-page-header__text">
                        <nav class="o-page-header-nav c-breadcrumb">
                            <span><router-link :to="{ name: 'nonprofit-your-page'}">Manage Donation Page</router-link></span>
                            <span><router-link :to="{ name: 'nonprofit-your-page', query: { tab: 'media' }}">Manage Image & Videos</router-link></span>
                        </nav>
                        <h1 class="o-page-header-title">Edit Image</h1>
                    </div>
                </div>

                <div class="o-app-main-content">
                    <form v-on:submit="submit">
                        <section class="c-page-section c-page-section--border c-page-section--shadow c-page-section--headless">
                            <div class="c-page-section__main">

                                <div class="c-form-item">
                                    <div class="c-form-item__label">
                                        <strong>Preview</strong>
                                    </div>
                                    <div class="c-alert c-alert--expand c-alert--neutral u-flex u-justify-center">
                                        <div class="c-alert__body u-flex u-flex-column u-items-center">
                                            <img :src="imageUrl" :alt="formData.caption" style="width: auto; max-height: 443px;">
                                            <div class="c-btn-group u-margin-top-thin">
                                                <a :href="imageUrl" target="_blank" rel="noreferrer noopener" role="button"
                                                   class="c-btn c-btn--sm c-btn--icon c-btn--flat c-btn--reverse">
                                                    <i class="fa fa-search" aria-hidden="true"></i>View Image
                                                </a>
                                                <input v-on:change="onFileChange" ref="fileInput" type="file" name="fileUpload" id="fileUpload" class="u-none" accept="image/*">
                                                <a v-on:click="replaceImage" href="#" role="button" class="c-btn c-btn--sm c-btn--icon c-btn--flat c-btn--reverse">
                                                    <i class="fa fa-refresh" aria-hidden="true"></i>Replace Image
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <!--<div class="c-form-item c-form-item&#45;&#45;text" :class="{ 'c-form-item&#45;&#45;has-error': formErrors.caption }">-->
                                    <!--<div class="c-form-item__label">-->
                                        <!--<label for="caption" class="c-form-item-label-text">Caption (100 characters or less)</label>-->
                                    <!--</div>-->
                                    <!--<div class="c-form-item__control">-->
                                        <!--<input v-model="formData.caption" type="text" name="caption" id="caption" maxlength="100" :class="{ 'has-error': formErrors.caption }"-->
                                               <!--v-auto-focus>-->
                                        <!--<div v-if="formErrors.caption" class="c-notes c-notes&#45;&#45;below c-notes&#45;&#45;bad c-form-control-error">-->
                                            <!--{{ formErrors.caption }}-->
                                        <!--</div>-->
                                    <!--</div>-->
                                <!--</div>-->
                            </div>
                        </section>

                        <footer class="c-form-actions">
                            <button v-on:click="save" type="submit" class="c-btn">Save Changes</button>
                            <button v-on:click="cancel" type="submit" class="c-btn c-btn--text c-btn--neutral">Cancel</button>
                        </footer>

                    </form>
                </div>

            </div>
        </main>
    </div>
</template>

<script>
	import Vue from "vue";

	export default {
		data: function () {
			return {
				file: {},
				newFile: null,
				slide: {},
				nonprofit: {},

				// Form Data
				formData: {
					url: '',
					caption: '',
				},

				// Errors
				formErrors: {},
                apiError: {},
			};
		},
		computed: {
			isAdmin: function () {
				return this.isSuperAdminUser() || this.isAdminUser();
			},
			imageUrl: function () {
				return this.file.hasOwnProperty('path') ? this.$store.getters.setting('UPLOADS_CLOUD_FRONT_URL') + '/' + this.file.path : false;
			}
		},
		props: [
			'nonprofitUuid',
			'slideUuid'
		],
		watch: {
			formData: {
				handler: function () {
					const vue = this;
					if (Object.keys(vue.formErrors).length) {
						vue.formErrors = vue.validate(vue.formData, vue.getConstraints());
					}
				},
				deep: true
			},
			slide: {
				handler: function () {
					const vue = this;
					vue.formData = vue.sync(vue.formData, vue.slide);
				},
				deep: true
			},
		},
		beforeRouteEnter: function (to, from, next) {
			next(function (vue) {
				vue.$request.get('/nonprofits/' + to.params.nonprofitUuid).then(function (response) {
					vue.nonprofit = response.data;
					return vue.$request.get('nonprofits/' + to.params.nonprofitUuid + '/slides/' + to.params.slideUuid);
				}).then(function (response) {
					vue.slide = response.data;
					if (vue.slide.fileUuid) {
						return vue.$request.get('files/' + vue.slide.fileUuid);
					} else {
						return Promise.resolve(null);
					}
				}).then(function (response) {
					if (response) {
						vue.file = response.data;
					}
				}).catch(function (err) {
                    vue.apiError = err.response.data.errors;
                    next();
                });
			});
		},
		beforeRouteUpdate: function (to, from, next) {
			const vue = this;

			vue.$request.get('/nonprofits/' + to.params.nonprofitUuid).then(function (response) {
				vue.nonprofit = response.data;
				return vue.$request.get('nonprofits/' + to.params.nonprofitUuid + '/slides/' + to.params.slideUuid);
			}).then(function (response) {
				vue.slide = response.data;
				if (vue.slide.fileUuid) {
					return vue.$request.get('files/' + vue.slide.fileUuid);
				} else {
					return Promise.resolve(null);
				}
			}).then(function (response) {
				if (response) {
					vue.file = response.data;
				}
				next();
			}).catch(function (err) {
                vue.apiError = err.response.data.errors;
				next();
			});
		},
		created: function () {
			const vue = this;

			vue.bus.$on('photoEditorSave-Edit', function (data, file) {
				vue.uploadFile(data, file);
			});
		},
		beforeDestroy: function () {
			const vue = this;

			vue.bus.$off('photoEditorSave-Edit');
		},
		methods: {
			getConstraints: function () {
				return {
					caption: {
						presence: false,
						length: {
							maximum: 100
						}
					}
				}
			},
			submit: function (event) {
				event.preventDefault();
			},
			save: function () {
				const vue = this;

				vue.addModal('spinner');

				vue.formErrors = vue.validate(vue.formData, vue.getConstraints());
				if (Object.keys(vue.formErrors).length) {
					vue.clearModals();
				} else {
					vue.updateNonprofitSlide();
				}
			},
			cancel: function () {
				const vue = this;

				if (vue.newFile) {
					vue.addModal('spinner');
					vue.$request.delete('files/' + vue.newFile.uuid).then(function () {
						vue.clearModals();
						vue.newFile = null;
						vue.$router.push({name: 'nonprofit-your-page', query: {tab: 'media'}});
					}).catch(function (err) {
						vue.clearModals();
                        vue.apiError = err.response.data.errors;
					});
				} else {
					vue.$router.push({name: 'nonprofit-your-page', query: {tab: 'media'}});
				}
			},
			replaceImage: function (event) {
				event.preventDefault();
				const vue = this;

				if (vue.newFile) {
					vue.$request.delete('files/' + vue.newFile.uuid).then(function () {
						vue.newFile = null;
					}).catch(function (err) {
                        vue.apiError = err.response.data.errors;
					});
				}

				vue.$refs.fileInput.click();
			},
			onFileChange: function (event) {
				const vue = this;

				const extensions = ['gif', 'jpeg', 'jpg', 'png'];
				const files = event.target.files || event.dataTransfer.files;
				if (files.length && files[0] instanceof File && extensions.indexOf(files[0].name.toLowerCase().split('.').pop()) > -1) {
					vue.addModal('photo-editor', {
						file: files[0],
						listener: 'photoEditorSave-Edit',
						width: 770,
						height: 443
					});
					vue.addModal('spinner');
				}
			},
			uploadFile: function (fileData, file) {
				const vue = this;

				vue.addModal('spinner');

				vue.$request.post('files', {
					content_type: fileData.type,
					filename: fileData.name
				}).then(function (response) {
					vue.newFile = response.data.file;
					const signedUrl = response.data.upload_url;

					const defaultHeaders = JSON.parse(JSON.stringify(axios.defaults.headers));
					let instance = axios.create();
					instance.defaults.headers.common['Content-Type'] = fileData.type || 'application/octet-stream';
					instance.defaults.headers.put['Content-Type'] = fileData.type || 'application/octet-stream';
					axios.defaults.headers = defaultHeaders;
					return instance.put(signedUrl, file);
				}).then(function () {
					vue.clearModals();
					vue.file = vue.newFile;
				}).catch(function (err) {
					vue.clearModals();
                    vue.apiError = err.response.data.errors;
				});
			},
			updateNonprofitSlide: function () {
				const vue = this;
				const params = {};

				if (vue.newFile) {
					params['fileUuid'] = vue.newFile.uuid;
				}

				if (vue.formData.caption !== vue.slide.caption) {
					params['caption'] = vue.formData.caption;
				}

				if (Object.keys(params).length === 0) {
					vue.clearModals();
					return vue.$router.push({name: 'nonprofit-your-page', query: {tab: 'media'}});
				}

				vue.$request.patch('nonprofits/' + vue.nonprofitUuid + '/slides/' + vue.slideUuid, params).then(function () {
					if (vue.newFile) {
						return vue.$request.delete('files/' + vue.slide.fileUuid);
					}
				}).then(function () {
					vue.$store.commit('generateCacheKey');
					vue.clearModals();
					vue.$router.push({name: 'nonprofit-your-page', query: {tab: 'media'}});
				}).catch(function (err) {
					vue.clearModals();
                    vue.apiError = err.response.data.errors;
				});
			},
		}
	};
</script>