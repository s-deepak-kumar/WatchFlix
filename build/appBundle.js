/**
 * App version: 1.0.0
 * SDK version: 4.8.1
 * CLI version: 2.7.2
 * 
 * Generated: Sun, 27 Feb 2022 06:59:06 GMT
 */

var APP_com_sdeepakkumar_app_watchflix = (function () {
  'use strict';

  /*
   * If not stated otherwise in this file or this component's LICENSE file the
   * following copyright and licenses apply:
   *
   * Copyright 2020 Metrological
   *
   * Licensed under the Apache License, Version 2.0 (the License);
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   * http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */
  const settings = {};
  const subscribers = {};
  const initSettings = (appSettings, platformSettings) => {
    settings['app'] = appSettings;
    settings['platform'] = platformSettings;
    settings['user'] = {};
  };

  const publish = (key, value) => {
    subscribers[key] && subscribers[key].forEach(subscriber => subscriber(value));
  };

  const dotGrab = (obj = {}, key) => {
    if (obj === null) return undefined;
    const keys = key.split('.');

    for (let i = 0; i < keys.length; i++) {
      obj = obj[keys[i]] = obj[keys[i]] !== undefined ? obj[keys[i]] : {};
    }

    return typeof obj === 'object' && obj !== null ? Object.keys(obj).length ? obj : undefined : obj;
  };

  var Settings = {
    get(type, key, fallback = undefined) {
      const val = dotGrab(settings[type], key);
      return val !== undefined ? val : fallback;
    },

    has(type, key) {
      return !!this.get(type, key);
    },

    set(key, value) {
      settings['user'][key] = value;
      publish(key, value);
    },

    subscribe(key, callback) {
      subscribers[key] = subscribers[key] || [];
      subscribers[key].push(callback);
    },

    unsubscribe(key, callback) {
      if (callback) {
        const index = subscribers[key] && subscribers[key].findIndex(cb => cb === callback);
        index > -1 && subscribers[key].splice(index, 1);
      } else {
        if (key in subscribers) {
          subscribers[key] = [];
        }
      }
    },

    clearSubscribers() {
      for (const key of Object.getOwnPropertyNames(subscribers)) {
        delete subscribers[key];
      }
    }

  };

  /*
   * If not stated otherwise in this file or this component's LICENSE file the
   * following copyright and licenses apply:
   *
   * Copyright 2020 Metrological
   *
   * Licensed under the Apache License, Version 2.0 (the License);
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   * http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */

  const prepLog = (type, args) => {
    const colors = {
      Info: 'green',
      Debug: 'gray',
      Warn: 'orange',
      Error: 'red'
    };
    args = Array.from(args);
    return ['%c' + (args.length > 1 && typeof args[0] === 'string' ? args.shift() : type), 'background-color: ' + colors[type] + '; color: white; padding: 2px 4px; border-radius: 2px', args];
  };

  var Log = {
    info() {
      Settings.get('platform', 'log') && console.log.apply(console, prepLog('Info', arguments));
    },

    debug() {
      Settings.get('platform', 'log') && console.debug.apply(console, prepLog('Debug', arguments));
    },

    error() {
      Settings.get('platform', 'log') && console.error.apply(console, prepLog('Error', arguments));
    },

    warn() {
      Settings.get('platform', 'log') && console.warn.apply(console, prepLog('Warn', arguments));
    }

  };

  var executeAsPromise = ((method, args = null, context = null) => {
    let result;

    if (method && typeof method === 'function') {
      try {
        result = method.apply(context, args);
      } catch (e) {
        result = e;
      }
    } else {
      result = method;
    } // if it looks like a duck .. ehm ... promise and talks like a promise, let's assume it's a promise


    if (result !== null && typeof result === 'object' && result.then && typeof result.then === 'function') {
      return result;
    } // otherwise make it into a promise
    else {
      return new Promise((resolve, reject) => {
        if (result instanceof Error) {
          reject(result);
        } else {
          resolve(result);
        }
      });
    }
  });

  /*
   * If not stated otherwise in this file or this component's LICENSE file the
   * following copyright and licenses apply:
   *
   * Copyright 2020 Metrological
   *
   * Licensed under the Apache License, Version 2.0 (the License);
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   * http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */

  let sendMetric = (type, event, params) => {
    Log.info('Sending metric', type, event, params);
  };

  const initMetrics = config => {
    sendMetric = config.sendMetric;
  }; // available metric per category

  const metrics$1 = {
    app: ['launch', 'loaded', 'ready', 'close'],
    page: ['view', 'leave'],
    user: ['click', 'input'],
    media: ['abort', 'canplay', 'ended', 'pause', 'play', // with some videos there occur almost constant suspend events ... should investigate
    // 'suspend',
    'volumechange', 'waiting', 'seeking', 'seeked']
  }; // error metric function (added to each category)

  const errorMetric = (type, message, code, visible, params = {}) => {
    params = {
      params,
      ...{
        message,
        code,
        visible
      }
    };
    sendMetric(type, 'error', params);
  };

  const Metric = (type, events, options = {}) => {
    return events.reduce((obj, event) => {
      obj[event] = (name, params = {}) => {
        params = { ...options,
          ...(name ? {
            name
          } : {}),
          ...params
        };
        sendMetric(type, event, params);
      };

      return obj;
    }, {
      error(message, code, params) {
        errorMetric(type, message, code, params);
      },

      event(name, params) {
        sendMetric(type, name, params);
      }

    });
  };

  const Metrics = types => {
    return Object.keys(types).reduce((obj, type) => {
      // media metric works a bit different!
      // it's a function that accepts a url and returns an object with the available metrics
      // url is automatically passed as a param in every metric
      type === 'media' ? obj[type] = url => Metric(type, types[type], {
        url
      }) : obj[type] = Metric(type, types[type]);
      return obj;
    }, {
      error: errorMetric,
      event: sendMetric
    });
  };

  var Metrics$1 = Metrics(metrics$1);

  /*
   * If not stated otherwise in this file or this component's LICENSE file the
   * following copyright and licenses apply:
   *
   * Copyright 2020 Metrological
   *
   * Licensed under the Apache License, Version 2.0 (the License);
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   * http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */
  var events$1 = {
    abort: 'Abort',
    canplay: 'CanPlay',
    canplaythrough: 'CanPlayThrough',
    durationchange: 'DurationChange',
    emptied: 'Emptied',
    encrypted: 'Encrypted',
    ended: 'Ended',
    error: 'Error',
    interruptbegin: 'InterruptBegin',
    interruptend: 'InterruptEnd',
    loadeddata: 'LoadedData',
    loadedmetadata: 'LoadedMetadata',
    loadstart: 'LoadStart',
    pause: 'Pause',
    play: 'Play',
    playing: 'Playing',
    progress: 'Progress',
    ratechange: 'Ratechange',
    seeked: 'Seeked',
    seeking: 'Seeking',
    stalled: 'Stalled',
    // suspend: 'Suspend', // this one is called a looooot for some videos
    timeupdate: 'TimeUpdate',
    volumechange: 'VolumeChange',
    waiting: 'Waiting'
  };

  /*
   * If not stated otherwise in this file or this component's LICENSE file the
   * following copyright and licenses apply:
   *
   * Copyright 2020 Metrological
   *
   * Licensed under the Apache License, Version 2.0 (the License);
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   * http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */
  var autoSetupMixin = ((sourceObject, setup = () => {}) => {
    let ready = false;

    const doSetup = () => {
      if (ready === false) {
        setup();
        ready = true;
      }
    };

    return Object.keys(sourceObject).reduce((obj, key) => {
      if (typeof sourceObject[key] === 'function') {
        obj[key] = function () {
          doSetup();
          return sourceObject[key].apply(sourceObject, arguments);
        };
      } else if (typeof Object.getOwnPropertyDescriptor(sourceObject, key).get === 'function') {
        obj.__defineGetter__(key, function () {
          doSetup();
          return Object.getOwnPropertyDescriptor(sourceObject, key).get.apply(sourceObject);
        });
      } else if (typeof Object.getOwnPropertyDescriptor(sourceObject, key).set === 'function') {
        obj.__defineSetter__(key, function () {
          doSetup();
          return Object.getOwnPropertyDescriptor(sourceObject, key).set.sourceObject[key].apply(sourceObject, arguments);
        });
      } else {
        obj[key] = sourceObject[key];
      }

      return obj;
    }, {});
  });

  /*
   * If not stated otherwise in this file or this component's LICENSE file the
   * following copyright and licenses apply:
   *
   * Copyright 2020 Metrological
   *
   * Licensed under the Apache License, Version 2.0 (the License);
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   * http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */
  let timeout = null;
  var easeExecution = ((cb, delay) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      cb();
    }, delay);
  });

  /*
   * If not stated otherwise in this file or this component's LICENSE file the
   * following copyright and licenses apply:
   *
   * Copyright 2020 Metrological
   *
   * Licensed under the Apache License, Version 2.0 (the License);
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   * http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */
  let basePath;
  let proxyUrl;
  const initUtils = config => {
    basePath = ensureUrlWithProtocol(makeFullStaticPath(window.location.pathname, config.path || '/'));

    if (config.proxyUrl) {
      proxyUrl = ensureUrlWithProtocol(config.proxyUrl);
    }
  };
  var Utils = {
    asset(relPath) {
      return basePath + relPath;
    },

    proxyUrl(url, options = {}) {
      return proxyUrl ? proxyUrl + '?' + makeQueryString(url, options) : url;
    },

    makeQueryString() {
      return makeQueryString(...arguments);
    },

    // since imageworkers don't work without protocol
    ensureUrlWithProtocol() {
      return ensureUrlWithProtocol(...arguments);
    }

  };
  const ensureUrlWithProtocol = url => {
    if (/^\/\//.test(url)) {
      return window.location.protocol + url;
    }

    if (!/^(?:https?:)/i.test(url)) {
      return window.location.origin + url;
    }

    return url;
  };
  const makeFullStaticPath = (pathname = '/', path) => {
    // ensure path has traling slash
    path = path.charAt(path.length - 1) !== '/' ? path + '/' : path; // if path is URL, we assume it's already the full static path, so we just return it

    if (/^(?:https?:)?(?:\/\/)/.test(path)) {
      return path;
    }

    if (path.charAt(0) === '/') {
      return path;
    } else {
      // cleanup the pathname (i.e. remove possible index.html)
      pathname = cleanUpPathName(pathname); // remove possible leading dot from path

      path = path.charAt(0) === '.' ? path.substr(1) : path; // ensure path has leading slash

      path = path.charAt(0) !== '/' ? '/' + path : path;
      return pathname + path;
    }
  };
  const cleanUpPathName = pathname => {
    if (pathname.slice(-1) === '/') return pathname.slice(0, -1);
    const parts = pathname.split('/');
    if (parts[parts.length - 1].indexOf('.') > -1) parts.pop();
    return parts.join('/');
  };

  const makeQueryString = (url, options = {}, type = 'url') => {
    // add operator as an option
    options.operator = 'metrological'; // Todo: make this configurable (via url?)
    // add type (= url or qr) as an option, with url as the value

    options[type] = url;
    return Object.keys(options).map(key => {
      return encodeURIComponent(key) + '=' + encodeURIComponent('' + options[key]);
    }).join('&');
  };

  /*
   * If not stated otherwise in this file or this component's LICENSE file the
   * following copyright and licenses apply:
   *
   * Copyright 2020 Metrological
   *
   * Licensed under the Apache License, Version 2.0 (the License);
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   * http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */

  const initProfile = config => {
  };

  /*
   * If not stated otherwise in this file or this component's LICENSE file the
   * following copyright and licenses apply:
   *
   * Copyright 2020 Metrological
   *
   * Licensed under the Apache License, Version 2.0 (the License);
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   * http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */
  var Lightning = window.lng;

  /*
   * If not stated otherwise in this file or this component's LICENSE file the
   * following copyright and licenses apply:
   *
   * Copyright 2020 Metrological
   *
   * Licensed under the Apache License, Version 2.0 (the License);
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   * http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */

  /*
   * If not stated otherwise in this file or this component's LICENSE file the
   * following copyright and licenses apply:
   *
   * Copyright 2020 Metrological
   *
   * Licensed under the Apache License, Version 2.0 (the License);
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   * http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */
  const events = ['timeupdate', 'error', 'ended', 'loadeddata', 'canplay', 'play', 'playing', 'pause', 'loadstart', 'seeking', 'seeked', 'encrypted'];

  let mediaUrl$1 = url => url;

  const initMediaPlayer = config => {
    if (config.mediaUrl) {
      mediaUrl$1 = config.mediaUrl;
    }
  };
  class Mediaplayer extends Lightning.Component {
    _construct() {
      this._skipRenderToTexture = false;
      this._metrics = null;
      this._textureMode = Settings.get('platform', 'textureMode') || false;
      Log.info('Texture mode: ' + this._textureMode);
      console.warn(["The 'MediaPlayer'-plugin in the Lightning-SDK is deprecated and will be removed in future releases.", "Please consider using the new 'VideoPlayer'-plugin instead.", 'https://rdkcentral.github.io/Lightning-SDK/#/plugins/videoplayer'].join('\n\n'));
    }

    static _template() {
      return {
        Video: {
          VideoWrap: {
            VideoTexture: {
              visible: false,
              pivot: 0.5,
              texture: {
                type: Lightning.textures.StaticTexture,
                options: {}
              }
            }
          }
        }
      };
    }

    set skipRenderToTexture(v) {
      this._skipRenderToTexture = v;
    }

    get textureMode() {
      return this._textureMode;
    }

    get videoView() {
      return this.tag('Video');
    }

    _init() {
      //re-use videotag if already there
      const videoEls = document.getElementsByTagName('video');
      if (videoEls && videoEls.length > 0) this.videoEl = videoEls[0];else {
        this.videoEl = document.createElement('video');
        this.videoEl.setAttribute('id', 'video-player');
        this.videoEl.style.position = 'absolute';
        this.videoEl.style.zIndex = '1';
        this.videoEl.style.display = 'none';
        this.videoEl.setAttribute('width', '100%');
        this.videoEl.setAttribute('height', '100%');
        this.videoEl.style.visibility = this.textureMode ? 'hidden' : 'visible';
        document.body.appendChild(this.videoEl);
      }

      if (this.textureMode && !this._skipRenderToTexture) {
        this._createVideoTexture();
      }

      this.eventHandlers = [];
    }

    _registerListeners() {
      events.forEach(event => {
        const handler = e => {
          if (this._metrics && this._metrics[event] && typeof this._metrics[event] === 'function') {
            this._metrics[event]({
              currentTime: this.videoEl.currentTime
            });
          }

          this.fire(event, {
            videoElement: this.videoEl,
            event: e
          });
        };

        this.eventHandlers.push(handler);
        this.videoEl.addEventListener(event, handler);
      });
    }

    _deregisterListeners() {
      Log.info('Deregistering event listeners MediaPlayer');
      events.forEach((event, index) => {
        this.videoEl.removeEventListener(event, this.eventHandlers[index]);
      });
      this.eventHandlers = [];
    }

    _attach() {
      this._registerListeners();
    }

    _detach() {
      this._deregisterListeners();

      this.close();
    }

    _createVideoTexture() {
      const stage = this.stage;
      const gl = stage.gl;
      const glTexture = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, glTexture);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      this.videoTexture.options = {
        source: glTexture,
        w: this.videoEl.width,
        h: this.videoEl.height
      };
    }

    _startUpdatingVideoTexture() {
      if (this.textureMode && !this._skipRenderToTexture) {
        const stage = this.stage;

        if (!this._updateVideoTexture) {
          this._updateVideoTexture = () => {
            if (this.videoTexture.options.source && this.videoEl.videoWidth && this.active) {
              const gl = stage.gl;
              const currentTime = new Date().getTime(); // When BR2_PACKAGE_GST1_PLUGINS_BAD_PLUGIN_DEBUGUTILS is not set in WPE, webkitDecodedFrameCount will not be available.
              // We'll fallback to fixed 30fps in this case.

              const frameCount = this.videoEl.webkitDecodedFrameCount;
              const mustUpdate = frameCount ? this._lastFrame !== frameCount : this._lastTime < currentTime - 30;

              if (mustUpdate) {
                this._lastTime = currentTime;
                this._lastFrame = frameCount;

                try {
                  gl.bindTexture(gl.TEXTURE_2D, this.videoTexture.options.source);
                  gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
                  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.videoEl);
                  this._lastFrame = this.videoEl.webkitDecodedFrameCount;
                  this.videoTextureView.visible = true;
                  this.videoTexture.options.w = this.videoEl.videoWidth;
                  this.videoTexture.options.h = this.videoEl.videoHeight;
                  const expectedAspectRatio = this.videoTextureView.w / this.videoTextureView.h;
                  const realAspectRatio = this.videoEl.videoWidth / this.videoEl.videoHeight;

                  if (expectedAspectRatio > realAspectRatio) {
                    this.videoTextureView.scaleX = realAspectRatio / expectedAspectRatio;
                    this.videoTextureView.scaleY = 1;
                  } else {
                    this.videoTextureView.scaleY = expectedAspectRatio / realAspectRatio;
                    this.videoTextureView.scaleX = 1;
                  }
                } catch (e) {
                  Log.error('texImage2d video', e);

                  this._stopUpdatingVideoTexture();

                  this.videoTextureView.visible = false;
                }

                this.videoTexture.source.forceRenderUpdate();
              }
            }
          };
        }

        if (!this._updatingVideoTexture) {
          stage.on('frameStart', this._updateVideoTexture);
          this._updatingVideoTexture = true;
        }
      }
    }

    _stopUpdatingVideoTexture() {
      if (this.textureMode) {
        const stage = this.stage;
        stage.removeListener('frameStart', this._updateVideoTexture);
        this._updatingVideoTexture = false;
        this.videoTextureView.visible = false;

        if (this.videoTexture.options.source) {
          const gl = stage.gl;
          gl.bindTexture(gl.TEXTURE_2D, this.videoTexture.options.source);
          gl.clearColor(0, 0, 0, 1);
          gl.clear(gl.COLOR_BUFFER_BIT);
        }
      }
    }

    updateSettings(settings = {}) {
      // The Component that 'consumes' the media player.
      this._consumer = settings.consumer;

      if (this._consumer && this._consumer.getMediaplayerSettings) {
        // Allow consumer to add settings.
        settings = Object.assign(settings, this._consumer.getMediaplayerSettings());
      }

      if (!Lightning.Utils.equalValues(this._stream, settings.stream)) {
        if (settings.stream && settings.stream.keySystem) {
          navigator.requestMediaKeySystemAccess(settings.stream.keySystem.id, settings.stream.keySystem.config).then(keySystemAccess => {
            return keySystemAccess.createMediaKeys();
          }).then(createdMediaKeys => {
            return this.videoEl.setMediaKeys(createdMediaKeys);
          }).then(() => {
            if (settings.stream && settings.stream.src) this.open(settings.stream.src);
          }).catch(() => {
            console.error('Failed to set up MediaKeys');
          });
        } else if (settings.stream && settings.stream.src) {
          // This is here to be backwards compatible, will be removed
          // in future sdk release
          if (Settings.get('app', 'hls')) {
            if (!window.Hls) {
              window.Hls = class Hls {
                static isSupported() {
                  console.warn('hls-light not included');
                  return false;
                }

              };
            }

            if (window.Hls.isSupported()) {
              if (!this._hls) this._hls = new window.Hls({
                liveDurationInfinity: true
              });

              this._hls.loadSource(settings.stream.src);

              this._hls.attachMedia(this.videoEl);

              this.videoEl.style.display = 'block';
            }
          } else {
            this.open(settings.stream.src);
          }
        } else {
          this.close();
        }

        this._stream = settings.stream;
      }

      this._setHide(settings.hide);

      this._setVideoArea(settings.videoPos);
    }

    _setHide(hide) {
      if (this.textureMode) {
        this.tag('Video').setSmooth('alpha', hide ? 0 : 1);
      } else {
        this.videoEl.style.visibility = hide ? 'hidden' : 'visible';
      }
    }

    open(url, settings = {
      hide: false,
      videoPosition: null
    }) {
      // prep the media url to play depending on platform (mediaPlayerplugin)
      url = mediaUrl$1(url);
      this._metrics = Metrics$1.media(url);
      Log.info('Playing stream', url);

      if (this.application.noVideo) {
        Log.info('noVideo option set, so ignoring: ' + url);
        return;
      } // close the video when opening same url as current (effectively reloading)


      if (this.videoEl.getAttribute('src') === url) {
        this.close();
      }

      this.videoEl.setAttribute('src', url); // force hide, then force show (in next tick!)
      // (fixes comcast playback rollover issue)

      this.videoEl.style.visibility = 'hidden';
      this.videoEl.style.display = 'none';
      setTimeout(() => {
        this.videoEl.style.display = 'block';
        this.videoEl.style.visibility = 'visible';
      });

      this._setHide(settings.hide);

      this._setVideoArea(settings.videoPosition || [0, 0, 1920, 1080]);
    }

    close() {
      // We need to pause first in order to stop sound.
      this.videoEl.pause();
      this.videoEl.removeAttribute('src'); // force load to reset everything without errors

      this.videoEl.load();

      this._clearSrc();

      this.videoEl.style.display = 'none';
    }

    playPause() {
      if (this.isPlaying()) {
        this.doPause();
      } else {
        this.doPlay();
      }
    }

    get muted() {
      return this.videoEl.muted;
    }

    set muted(v) {
      this.videoEl.muted = v;
    }

    get loop() {
      return this.videoEl.loop;
    }

    set loop(v) {
      this.videoEl.loop = v;
    }

    isPlaying() {
      return this._getState() === 'Playing';
    }

    doPlay() {
      this.videoEl.play();
    }

    doPause() {
      this.videoEl.pause();
    }

    reload() {
      var url = this.videoEl.getAttribute('src');
      this.close();
      this.videoEl.src = url;
    }

    getPosition() {
      return Promise.resolve(this.videoEl.currentTime);
    }

    setPosition(pos) {
      this.videoEl.currentTime = pos;
    }

    getDuration() {
      return Promise.resolve(this.videoEl.duration);
    }

    seek(time, absolute = false) {
      if (absolute) {
        this.videoEl.currentTime = time;
      } else {
        this.videoEl.currentTime += time;
      }
    }

    get videoTextureView() {
      return this.tag('Video').tag('VideoTexture');
    }

    get videoTexture() {
      return this.videoTextureView.texture;
    }

    _setVideoArea(videoPos) {
      if (Lightning.Utils.equalValues(this._videoPos, videoPos)) {
        return;
      }

      this._videoPos = videoPos;

      if (this.textureMode) {
        this.videoTextureView.patch({
          smooth: {
            x: videoPos[0],
            y: videoPos[1],
            w: videoPos[2] - videoPos[0],
            h: videoPos[3] - videoPos[1]
          }
        });
      } else {
        const precision = this.stage.getRenderPrecision();
        this.videoEl.style.left = Math.round(videoPos[0] * precision) + 'px';
        this.videoEl.style.top = Math.round(videoPos[1] * precision) + 'px';
        this.videoEl.style.width = Math.round((videoPos[2] - videoPos[0]) * precision) + 'px';
        this.videoEl.style.height = Math.round((videoPos[3] - videoPos[1]) * precision) + 'px';
      }
    }

    _fireConsumer(event, args) {
      if (this._consumer) {
        this._consumer.fire(event, args);
      }
    }

    _equalInitData(buf1, buf2) {
      if (!buf1 || !buf2) return false;
      if (buf1.byteLength != buf2.byteLength) return false;
      const dv1 = new Int8Array(buf1);
      const dv2 = new Int8Array(buf2);

      for (let i = 0; i != buf1.byteLength; i++) if (dv1[i] != dv2[i]) return false;

      return true;
    }

    error(args) {
      this._fireConsumer('$mediaplayerError', args);

      this._setState('');

      return '';
    }

    loadeddata(args) {
      this._fireConsumer('$mediaplayerLoadedData', args);
    }

    play(args) {
      this._fireConsumer('$mediaplayerPlay', args);
    }

    playing(args) {
      this._fireConsumer('$mediaplayerPlaying', args);

      this._setState('Playing');
    }

    canplay(args) {
      this.videoEl.play();

      this._fireConsumer('$mediaplayerStart', args);
    }

    loadstart(args) {
      this._fireConsumer('$mediaplayerLoad', args);
    }

    seeked() {
      this._fireConsumer('$mediaplayerSeeked', {
        currentTime: this.videoEl.currentTime,
        duration: this.videoEl.duration || 1
      });
    }

    seeking() {
      this._fireConsumer('$mediaplayerSeeking', {
        currentTime: this.videoEl.currentTime,
        duration: this.videoEl.duration || 1
      });
    }

    durationchange(args) {
      this._fireConsumer('$mediaplayerDurationChange', args);
    }

    encrypted(args) {
      const video = args.videoElement;
      const event = args.event; // FIXME: Double encrypted events need to be properly filtered by Gstreamer

      if (video.mediaKeys && !this._equalInitData(this._previousInitData, event.initData)) {
        this._previousInitData = event.initData;

        this._fireConsumer('$mediaplayerEncrypted', args);
      }
    }

    static _states() {
      return [class Playing extends this {
        $enter() {
          this._startUpdatingVideoTexture();
        }

        $exit() {
          this._stopUpdatingVideoTexture();
        }

        timeupdate() {
          this._fireConsumer('$mediaplayerProgress', {
            currentTime: this.videoEl.currentTime,
            duration: this.videoEl.duration || 1
          });
        }

        ended(args) {
          this._fireConsumer('$mediaplayerEnded', args);

          this._setState('');
        }

        pause(args) {
          this._fireConsumer('$mediaplayerPause', args);

          this._setState('Playing.Paused');
        }

        _clearSrc() {
          this._fireConsumer('$mediaplayerStop', {});

          this._setState('');
        }

        static _states() {
          return [class Paused extends this {}];
        }

      }];
    }

  }

  class localCookie {
    constructor(e) {
      return e = e || {}, this.forceCookies = e.forceCookies || !1, !0 === this._checkIfLocalStorageWorks() && !0 !== e.forceCookies ? {
        getItem: this._getItemLocalStorage,
        setItem: this._setItemLocalStorage,
        removeItem: this._removeItemLocalStorage,
        clear: this._clearLocalStorage
      } : {
        getItem: this._getItemCookie,
        setItem: this._setItemCookie,
        removeItem: this._removeItemCookie,
        clear: this._clearCookies
      };
    }

    _checkIfLocalStorageWorks() {
      if ("undefined" == typeof localStorage) return !1;

      try {
        return localStorage.setItem("feature_test", "yes"), "yes" === localStorage.getItem("feature_test") && (localStorage.removeItem("feature_test"), !0);
      } catch (e) {
        return !1;
      }
    }

    _getItemLocalStorage(e) {
      return window.localStorage.getItem(e);
    }

    _setItemLocalStorage(e, t) {
      return window.localStorage.setItem(e, t);
    }

    _removeItemLocalStorage(e) {
      return window.localStorage.removeItem(e);
    }

    _clearLocalStorage() {
      return window.localStorage.clear();
    }

    _getItemCookie(e) {
      var t = document.cookie.match(RegExp("(?:^|;\\s*)" + function (e) {
        return e.replace(/([.*+?\^${}()|\[\]\/\\])/g, "\\$1");
      }(e) + "=([^;]*)"));
      return t && "" === t[1] && (t[1] = null), t ? t[1] : null;
    }

    _setItemCookie(e, t) {
      var o = new Date(),
          r = new Date(o.getTime() + 15768e7);
      document.cookie = `${e}=${t}; expires=${r.toUTCString()};`;
    }

    _removeItemCookie(e) {
      document.cookie = `${e}=;Max-Age=-99999999;`;
    }

    _clearCookies() {
      document.cookie.split(";").forEach(e => {
        document.cookie = e.replace(/^ +/, "").replace(/=.*/, "=;expires=Max-Age=-99999999");
      });
    }

  }

  /*
   * If not stated otherwise in this file or this component's LICENSE file the
   * following copyright and licenses apply:
   *
   * Copyright 2020 Metrological
   *
   * Licensed under the Apache License, Version 2.0 (the License);
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   * http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */
  const initStorage = () => {
    Settings.get('platform', 'id'); // todo: pass options (for example to force the use of cookies)

    new localCookie();
  };

  /*
   * If not stated otherwise in this file or this component's LICENSE file the
   * following copyright and licenses apply:
   *
   * Copyright 2020 Metrological
   *
   * Licensed under the Apache License, Version 2.0 (the License);
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   * http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */
  const hasRegex = /\{\/(.*?)\/([igm]{0,3})\}/g;
  const isWildcard = /^[!*$]$/;
  const hasLookupId = /\/:\w+?@@([0-9]+?)@@/;
  const isNamedGroup = /^\/:/;
  /**
   * Test if a route is part regular expressed
   * and replace it for a simple character
   * @param route
   * @returns {*}
   */

  const stripRegex = (route, char = 'R') => {
    // if route is part regular expressed we replace
    // the regular expression for a character to
    // simplify floor calculation and backtracking
    if (hasRegex.test(route)) {
      route = route.replace(hasRegex, char);
    }

    return route;
  };

  /*
   * If not stated otherwise in this file or this component's LICENSE file the
   * following copyright and licenses apply:
   *
   * Copyright 2020 Metrological
   *
   * Licensed under the Apache License, Version 2.0 (the License);
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   * http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */

  /**
   * Create a local request register
   * @param flags
   * @returns {Map<any, any>}
   */
  const createRegister = flags => {
    const reg = new Map() // store user defined and router
    // defined flags in register
    ;
    [...Object.keys(flags), ...Object.getOwnPropertySymbols(flags)].forEach(key => {
      reg.set(key, flags[key]);
    });
    return reg;
  };

  /*
   * If not stated otherwise in this file or this component's LICENSE file the
   * following copyright and licenses apply:
   *
   * Copyright 2020 Metrological
   *
   * Licensed under the Apache License, Version 2.0 (the License);
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   * http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */
  class Request {
    constructor(hash = '', navArgs, storeCaller) {
      /**
       * Hash we navigate to
       * @type {string}
       * @private
       */
      this._hash = hash;
      /**
       * Do we store previous hash in history
       * @type {boolean}
       * @private
       */

      this._storeCaller = storeCaller;
      /**
       * Request and navigate data
       * @type {Map}
       * @private
       */

      this._register = new Map();
      /**
       * Flag if the instance is created due to
       * this request
       * @type {boolean}
       * @private
       */

      this._isCreated = false;
      /**
       * Flag if the instance is shared between
       * previous and current request
       * @type {boolean}
       * @private
       */

      this._isSharedInstance = false;
      /**
       * Flag if the request has been cancelled
       * @type {boolean}
       * @private
       */

      this._cancelled = false;
      /**
       * if instance is shared between requests we copy state object
       * from instance before the new request overrides state
       * @type {null}
       * @private
       */

      this._copiedHistoryState = null; // if there are arguments attached to navigate()
      // we store them in new request

      if (isObject(navArgs)) {
        this._register = createRegister(navArgs);
      } else if (isBoolean(navArgs)) {
        // if second navigate() argument is explicitly
        // set to false we prevent the calling page
        // from ending up in history
        this._storeCaller = navArgs;
      } // @todo: remove because we can simply check
      // ._storeCaller property


      this._register.set(symbols.store, this._storeCaller);
    }

    cancel() {
      Log.debug('[router]:', `cancelled ${this._hash}`);
      this._cancelled = true;
    }

    get url() {
      return this._hash;
    }

    get register() {
      return this._register;
    }

    get hash() {
      return this._hash;
    }

    set hash(args) {
      this._hash = args;
    }

    get route() {
      return this._route;
    }

    set route(args) {
      this._route = args;
    }

    get provider() {
      return this._provider;
    }

    set provider(args) {
      this._provider = args;
    }

    get providerType() {
      return this._providerType;
    }

    set providerType(args) {
      this._providerType = args;
    }

    set page(args) {
      this._page = args;
    }

    get page() {
      return this._page;
    }

    set isCreated(args) {
      this._isCreated = args;
    }

    get isCreated() {
      return this._isCreated;
    }

    get isSharedInstance() {
      return this._isSharedInstance;
    }

    set isSharedInstance(args) {
      this._isSharedInstance = args;
    }

    get isCancelled() {
      return this._cancelled;
    }

    set copiedHistoryState(v) {
      this._copiedHistoryState = v;
    }

    get copiedHistoryState() {
      return this._copiedHistoryState;
    }

  }

  /*
   * If not stated otherwise in this file or this component's LICENSE file the
   * following copyright and licenses apply:
   *
   * Copyright 2020 Metrological
   *
   * Licensed under the Apache License, Version 2.0 (the License);
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   * http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */
  class Route {
    constructor(config = {}) {
      // keep backwards compatible
      let type = ['on', 'before', 'after'].reduce((acc, type) => {
        return isFunction(config[type]) ? type : acc;
      }, undefined);
      this._cfg = config;

      if (type) {
        this._provider = {
          type,
          request: config[type]
        };
      }
    }

    get path() {
      return this._cfg.path;
    }

    get component() {
      return this._cfg.component;
    }

    get options() {
      return this._cfg.options;
    }

    get widgets() {
      return this._cfg.widgets;
    }

    get cache() {
      return this._cfg.cache;
    }

    get hook() {
      return this._cfg.hook;
    }

    get beforeNavigate() {
      return this._cfg.beforeNavigate;
    }

    get provider() {
      return this._provider;
    }

  }

  /*
   * If not stated otherwise in this file or this component's LICENSE file the
   * following copyright and licenses apply:
   *
   * Copyright 2020 Metrological
   *
   * Licensed under the Apache License, Version 2.0 (the License);
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   * http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */
  /**
   * Simple route length calculation
   * @param route {string}
   * @returns {number} - floor
   */

  const getFloor = route => {
    return stripRegex(route).split('/').length;
  };
  /**
   * return all stored routes that live on the same floor
   * @param floor
   * @returns {Array}
   */

  const getRoutesByFloor = floor => {
    const matches = []; // simple filter of level candidates

    for (let [route] of routes$1.entries()) {
      if (getFloor(route) === floor) {
        matches.push(route);
      }
    }

    return matches;
  };
  /**
   * return a matching route by provided hash
   * hash: home/browse/12 will match:
   * route: home/browse/:categoryId
   * @param hash {string}
   * @returns {boolean|{}} - route
   */


  const getRouteByHash = hash => {
    // @todo: clean up on handleHash
    hash = hash.replace(/^#/, '');
    const getUrlParts = /(\/?:?[^/]+)/g; // grab possible candidates from stored routes

    const candidates = getRoutesByFloor(getFloor(hash)); // break hash down in chunks

    const hashParts = hash.match(getUrlParts) || []; // to simplify the route matching and prevent look around
    // in our getUrlParts regex we get the regex part from
    // route candidate and store them so that we can reference
    // them when we perform the actual regex against hash

    let regexStore = [];
    let matches = candidates.filter(route => {
      let isMatching = true; // replace regex in route with lookup id => @@{storeId}@@

      if (hasRegex.test(route)) {
        const regMatches = route.match(hasRegex);

        if (regMatches && regMatches.length) {
          route = regMatches.reduce((fullRoute, regex) => {
            const lookupId = regexStore.length;
            fullRoute = fullRoute.replace(regex, `@@${lookupId}@@`);
            regexStore.push(regex.substring(1, regex.length - 1));
            return fullRoute;
          }, route);
        }
      }

      const routeParts = route.match(getUrlParts) || [];

      for (let i = 0, j = routeParts.length; i < j; i++) {
        const routePart = routeParts[i];
        const hashPart = hashParts[i]; // Since we support catch-all and regex driven name groups
        // we first test for regex lookup id and see if the regex
        // matches the value from the hash

        if (hasLookupId.test(routePart)) {
          const routeMatches = hasLookupId.exec(routePart);
          const storeId = routeMatches[1];
          const routeRegex = regexStore[storeId]; // split regex and modifiers so we can use both
          // to create a new RegExp
          // eslint-disable-next-line

          const regMatches = /\/([^\/]+)\/([igm]{0,3})/.exec(routeRegex);

          if (regMatches && regMatches.length) {
            const expression = regMatches[1];
            const modifiers = regMatches[2];
            const regex = new RegExp(`^/${expression}$`, modifiers);

            if (!regex.test(hashPart)) {
              isMatching = false;
            }
          }
        } else if (isNamedGroup.test(routePart)) {
          // we kindly skip namedGroups because this is dynamic
          // we only need to the static and regex drive parts
          continue;
        } else if (hashPart && routePart.toLowerCase() !== hashPart.toLowerCase()) {
          isMatching = false;
        }
      }

      return isMatching;
    });

    if (matches.length) {
      if (matches.indexOf(hash) !== -1) {
        const match = matches[matches.indexOf(hash)];
        return routes$1.get(match);
      } else {
        // we give prio to static routes over dynamic
        matches = matches.sort(a => {
          return isNamedGroup.test(a) ? -1 : 1;
        }); // would be strange if this fails
        // but still we test

        if (routeExists(matches[0])) {
          return routes$1.get(matches[0]);
        }
      }
    }

    return false;
  };
  const getValuesFromHash = (hash = '', path) => {
    // replace the regex definition from the route because
    // we already did the matching part
    path = stripRegex(path, '');
    const getUrlParts = /(\/?:?[\w%\s:.-]+)/g;
    const hashParts = hash.match(getUrlParts) || [];
    const routeParts = path.match(getUrlParts) || [];
    const getNamedGroup = /^\/:([\w-]+)\/?/;
    return routeParts.reduce((storage, value, index) => {
      const match = getNamedGroup.exec(value);

      if (match && match.length) {
        storage.set(match[1], decodeURIComponent(hashParts[index].replace(/^\//, '')));
      }

      return storage;
    }, new Map());
  };
  const getOption = (stack, prop) => {
    // eslint-disable-next-line
    if (stack && stack.hasOwnProperty(prop)) {
      return stack[prop];
    } // we explicitly return undefined since we're testing
    // for explicit test values

  };
  /**
   * create and return new Route instance
   * @param config
   */

  const createRoute = config => {
    // we need to provide a bit of additional logic
    // for the bootComponent
    if (config.path === '$') {
      let options = {
        preventStorage: true
      };

      if (isObject(config.options)) {
        options = { ...config.options,
          ...options
        };
      }

      config.options = options; // if configured add reference to bootRequest
      // as router after provider

      if (bootRequest) {
        config.after = bootRequest;
      }
    }

    return new Route(config);
  };
  /**
   * Create a new Router request object
   * @param url
   * @param args
   * @param store
   * @returns {*}
   */

  const createRequest = (url, args, store) => {
    return new Request(url, args, store);
  };
  const getHashByName = obj => {
    if (!obj.to && !obj.name) {
      return false;
    }

    const route = getRouteByName(obj.to || obj.name);
    const hasDynamicGroup = /\/:([\w-]+)\/?/;
    let hash = route; // if route contains dynamic group
    // we replace them with the provided params

    if (hasDynamicGroup.test(route)) {
      if (obj.params) {
        const keys = Object.keys(obj.params);
        hash = keys.reduce((acc, key) => {
          return acc.replace(`:${key}`, obj.params[key]);
        }, route);
      }

      if (obj.query) {
        return `${hash}${objectToQueryString(obj.query)}`;
      }
    }

    return hash;
  };

  const getRouteByName = name => {
    for (let [path, route] of routes$1.entries()) {
      if (route.name === name) {
        return path;
      }
    }

    return false;
  };

  const keepActivePageAlive = (route, request) => {
    if (isString(route)) {
      const routes = getRoutes();

      if (routes.has(route)) {
        route = routes.get(route);
      } else {
        return false;
      }
    }

    const register = request.register;
    const routeOptions = route.options;

    if (register.has('keepAlive')) {
      return register.get('keepAlive');
    } else if (routeOptions && routeOptions.keepAlive) {
      return routeOptions.keepAlive;
    }

    return false;
  };

  /*
   * If not stated otherwise in this file or this component's LICENSE file the
   * following copyright and licenses apply:
   *
   * Copyright 2020 Metrological
   *
   * Licensed under the Apache License, Version 2.0 (the License);
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   * http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */
  var emit$1 = ((page, events = [], params = {}) => {
    if (!isArray(events)) {
      events = [events];
    }

    events.forEach(e => {
      const event = `_on${ucfirst(e)}`;

      if (isFunction(page[event])) {
        page[event](params);
      }
    });
  });

  /*
   * If not stated otherwise in this file or this component's LICENSE file the
   * following copyright and licenses apply:
   *
   * Copyright 2020 Metrological
   *
   * Licensed under the Apache License, Version 2.0 (the License);
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   * http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */
  let activeWidget = null;
  const getReferences = () => {
    if (!widgetsHost) {
      return;
    }

    return widgetsHost.get().reduce((storage, widget) => {
      const key = widget.ref.toLowerCase();
      storage[key] = widget;
      return storage;
    }, {});
  };
  /**
   * update the visibility of the available widgets
   * for the current page / route
   * @param page
   */

  const updateWidgets = (widgets, page) => {
    // force lowercase lookup
    const configured = (widgets || []).map(ref => ref.toLowerCase());
    widgetsHost.forEach(widget => {
      widget.visible = configured.indexOf(widget.ref.toLowerCase()) !== -1;

      if (widget.visible) {
        emit$1(widget, ['activated'], page);
      }
    });

    if (app.state === 'Widgets' && activeWidget && !activeWidget.visible) {
      app._setState('');
    }
  };

  const getWidgetByName = name => {
    name = ucfirst(name);
    return widgetsHost.getByRef(name) || false;
  };
  /**
   * delegate app focus to a on-screen widget
   * @param name - {string}
   */


  const focusWidget = name => {
    const widget = getWidgetByName(name);

    if (widget) {
      setActiveWidget(widget); // if app is already in 'Widgets' state we can assume that
      // focus has been delegated from one widget to another so
      // we need to set the new widget reference and trigger a
      // new focus calculation of Lightning's focuspath

      if (app.state === 'Widgets') {
        app.reload(activeWidget);
      } else {
        app._setState('Widgets', [activeWidget]);
      }
    }
  };
  const restoreFocus = () => {
    activeWidget = null;

    app._setState('');
  };
  const getActiveWidget = () => {
    return activeWidget;
  };
  const setActiveWidget = instance => {
    activeWidget = instance;
  };

  /*
   * If not stated otherwise in this file or this component's LICENSE file the
   * following copyright and licenses apply:
   *
   * Copyright 2020 Metrological
   *
   * Licensed under the Apache License, Version 2.0 (the License);
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   * http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */
  const createComponent = (stage, type) => {
    return stage.c({
      type,
      visible: false,
      widgets: getReferences()
    });
  };

  /*
   * If not stated otherwise in this file or this component's LICENSE file the
   * following copyright and licenses apply:
   *
   * Copyright 2020 Metrological
   *
   * Licensed under the Apache License, Version 2.0 (the License);
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   * http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */
  /**
   * Simple flat array that holds the visited hashes + state Object
   * so the router can navigate back to them
   * @type {Array}
   */

  let history = [];
  const updateHistory = request => {
    const hash = getActiveHash();

    if (!hash) {
      return;
    } // navigate storage flag


    const register = request.register;
    const forceNavigateStore = register.get(symbols.store); // test preventStorage on route configuration

    const activeRoute = getRouteByHash(hash);
    const preventStorage = getOption(activeRoute.options, 'preventStorage'); // we give prio to navigate storage flag

    let store = isBoolean(forceNavigateStore) ? forceNavigateStore : !preventStorage;

    if (store) {
      const toStore = hash.replace(/^\//, '');
      const location = locationInHistory(toStore);
      const stateObject = getStateObject(getActivePage(), request);
      const routerConfig = getRouterConfig(); // store hash if it's not a part of history or flag for
      // storage of same hash is true

      if (location === -1 || routerConfig.get('storeSameHash')) {
        history.push({
          hash: toStore,
          state: stateObject
        });
      } else {
        // if we visit the same route we want to sync history
        const prev = history.splice(location, 1)[0];
        history.push({
          hash: prev.hash,
          state: stateObject
        });
      }
    }
  };

  const locationInHistory = hash => {
    for (let i = 0; i < history.length; i++) {
      if (history[i].hash === hash) {
        return i;
      }
    }

    return -1;
  };

  const getHistoryState = hash => {
    let state = null;

    if (history.length) {
      // if no hash is provided we get the last
      // pushed history record
      if (!hash) {
        const record = history[history.length - 1]; // could be null

        state = record.state;
      } else {
        if (locationInHistory(hash) !== -1) {
          const record = history[locationInHistory(hash)];
          state = record.state;
        }
      }
    }

    return state;
  };
  const replaceHistoryState = (state = null, hash) => {
    if (!history.length) {
      return;
    }

    const location = hash ? locationInHistory(hash) : history.length - 1;

    if (location !== -1 && isObject(state)) {
      history[location].state = state;
    }
  };

  const getStateObject = (page, request) => {
    // if the new request shared instance with the
    // previous request we used the copied state object
    if (request.isSharedInstance) {
      if (request.copiedHistoryState) {
        return request.copiedHistoryState;
      }
    } else if (page && isFunction(page.historyState)) {
      return page.historyState();
    }

    return null;
  };

  const getHistory = () => {
    return history.slice(0);
  };
  const setHistory = (arr = []) => {
    if (isArray(arr)) {
      history = arr;
    }
  };

  var isMergeableObject = function isMergeableObject(value) {
    return isNonNullObject(value) && !isSpecial(value);
  };

  function isNonNullObject(value) {
    return !!value && typeof value === 'object';
  }

  function isSpecial(value) {
    var stringValue = Object.prototype.toString.call(value);
    return stringValue === '[object RegExp]' || stringValue === '[object Date]' || isReactElement(value);
  } // see https://github.com/facebook/react/blob/b5ac963fb791d1298e7f396236383bc955f916c1/src/isomorphic/classic/element/ReactElement.js#L21-L25


  var canUseSymbol = typeof Symbol === 'function' && Symbol.for;
  var REACT_ELEMENT_TYPE = canUseSymbol ? Symbol.for('react.element') : 0xeac7;

  function isReactElement(value) {
    return value.$$typeof === REACT_ELEMENT_TYPE;
  }

  function emptyTarget(val) {
    return Array.isArray(val) ? [] : {};
  }

  function cloneUnlessOtherwiseSpecified(value, options) {
    return options.clone !== false && options.isMergeableObject(value) ? deepmerge(emptyTarget(value), value, options) : value;
  }

  function defaultArrayMerge(target, source, options) {
    return target.concat(source).map(function (element) {
      return cloneUnlessOtherwiseSpecified(element, options);
    });
  }

  function getMergeFunction(key, options) {
    if (!options.customMerge) {
      return deepmerge;
    }

    var customMerge = options.customMerge(key);
    return typeof customMerge === 'function' ? customMerge : deepmerge;
  }

  function getEnumerableOwnPropertySymbols(target) {
    return Object.getOwnPropertySymbols ? Object.getOwnPropertySymbols(target).filter(function (symbol) {
      return target.propertyIsEnumerable(symbol);
    }) : [];
  }

  function getKeys(target) {
    return Object.keys(target).concat(getEnumerableOwnPropertySymbols(target));
  }

  function propertyIsOnObject(object, property) {
    try {
      return property in object;
    } catch (_) {
      return false;
    }
  } // Protects from prototype poisoning and unexpected merging up the prototype chain.


  function propertyIsUnsafe(target, key) {
    return propertyIsOnObject(target, key) // Properties are safe to merge if they don't exist in the target yet,
    && !(Object.hasOwnProperty.call(target, key) // unsafe if they exist up the prototype chain,
    && Object.propertyIsEnumerable.call(target, key)); // and also unsafe if they're nonenumerable.
  }

  function mergeObject(target, source, options) {
    var destination = {};

    if (options.isMergeableObject(target)) {
      getKeys(target).forEach(function (key) {
        destination[key] = cloneUnlessOtherwiseSpecified(target[key], options);
      });
    }

    getKeys(source).forEach(function (key) {
      if (propertyIsUnsafe(target, key)) {
        return;
      }

      if (propertyIsOnObject(target, key) && options.isMergeableObject(source[key])) {
        destination[key] = getMergeFunction(key, options)(target[key], source[key], options);
      } else {
        destination[key] = cloneUnlessOtherwiseSpecified(source[key], options);
      }
    });
    return destination;
  }

  function deepmerge(target, source, options) {
    options = options || {};
    options.arrayMerge = options.arrayMerge || defaultArrayMerge;
    options.isMergeableObject = options.isMergeableObject || isMergeableObject; // cloneUnlessOtherwiseSpecified is added to `options` so that custom arrayMerge()
    // implementations can use it. The caller may not replace it.

    options.cloneUnlessOtherwiseSpecified = cloneUnlessOtherwiseSpecified;
    var sourceIsArray = Array.isArray(source);
    var targetIsArray = Array.isArray(target);
    var sourceAndTargetTypesMatch = sourceIsArray === targetIsArray;

    if (!sourceAndTargetTypesMatch) {
      return cloneUnlessOtherwiseSpecified(source, options);
    } else if (sourceIsArray) {
      return options.arrayMerge(target, source, options);
    } else {
      return mergeObject(target, source, options);
    }
  }

  deepmerge.all = function deepmergeAll(array, options) {
    if (!Array.isArray(array)) {
      throw new Error('first argument should be an array');
    }

    return array.reduce(function (prev, next) {
      return deepmerge(prev, next, options);
    }, {});
  };

  var deepmerge_1 = deepmerge;
  var cjs = deepmerge_1;

  /*
   * If not stated otherwise in this file or this component's LICENSE file the
   * following copyright and licenses apply:
   *
   * Copyright 2020 Metrological
   *
   * Licensed under the Apache License, Version 2.0 (the License);
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   * http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */
  let warned = false;

  const deprecated = (force = false) => {
    if (force === true || warned === false) {
      console.warn(["The 'Locale'-plugin in the Lightning-SDK is deprecated and will be removed in future releases.", "Please consider using the new 'Language'-plugin instead.", 'https://rdkcentral.github.io/Lightning-SDK/#/plugins/language'].join('\n\n'));
    }

    warned = true;
  };

  class Locale {
    constructor() {
      this.__enabled = false;
    }
    /**
     * Loads translation object from external json file.
     *
     * @param {String} path Path to resource.
     * @return {Promise}
     */


    async load(path) {
      if (!this.__enabled) {
        return;
      }

      await fetch(path).then(resp => resp.json()).then(resp => {
        this.loadFromObject(resp);
      });
    }
    /**
     * Sets language used by module.
     *
     * @param {String} lang
     */


    setLanguage(lang) {
      deprecated();
      this.__enabled = true;
      this.language = lang;
    }
    /**
     * Returns reference to translation object for current language.
     *
     * @return {Object}
     */


    get tr() {
      deprecated(true);
      return this.__trObj[this.language];
    }
    /**
     * Loads translation object from existing object (binds existing object).
     *
     * @param {Object} trObj
     */


    loadFromObject(trObj) {
      deprecated();
      const fallbackLanguage = 'en';

      if (Object.keys(trObj).indexOf(this.language) === -1) {
        Log.warn('No translations found for: ' + this.language);

        if (Object.keys(trObj).indexOf(fallbackLanguage) > -1) {
          Log.warn('Using fallback language: ' + fallbackLanguage);
          this.language = fallbackLanguage;
        } else {
          const error = 'No translations found for fallback language: ' + fallbackLanguage;
          Log.error(error);
          throw Error(error);
        }
      }

      this.__trObj = trObj;

      for (const lang of Object.values(this.__trObj)) {
        for (const str of Object.keys(lang)) {
          lang[str] = new LocalizedString(lang[str]);
        }
      }
    }

  }
  /**
   * Extended string class used for localization.
   */


  class LocalizedString extends String {
    /**
     * Returns formatted LocalizedString.
     * Replaces each placeholder value (e.g. {0}, {1}) with corresponding argument.
     *
     * E.g.:
     * > new LocalizedString('{0} and {1} and {0}').format('A', 'B');
     * A and B and A
     *
     * @param  {...any} args List of arguments for placeholders.
     */
    format(...args) {
      const sub = args.reduce((string, arg, index) => string.split(`{${index}}`).join(arg), this);
      return new LocalizedString(sub);
    }

  }

  var Locale$1 = new Locale();

  /*
   * If not stated otherwise in this file or this component's LICENSE file the
   * following copyright and licenses apply:
   *
   * Copyright 2020 Metrological
   *
   * Licensed under the Apache License, Version 2.0 (the License);
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   * http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */
  class VersionLabel extends Lightning.Component {
    static _template() {
      return {
        rect: true,
        color: 0xbb0078ac,
        h: 40,
        w: 100,
        x: w => w - 50,
        y: h => h - 50,
        mount: 1,
        Text: {
          w: w => w,
          h: h => h,
          y: 5,
          x: 20,
          text: {
            fontSize: 22,
            lineHeight: 26
          }
        }
      };
    }

    _firstActive() {
      this.tag('Text').text = `APP - v${this.version}\nSDK - v${this.sdkVersion}`;
      this.tag('Text').loadTexture();
      this.w = this.tag('Text').renderWidth + 40;
      this.h = this.tag('Text').renderHeight + 5;
    }

  }

  /*
   * If not stated otherwise in this file or this component's LICENSE file the
   * following copyright and licenses apply:
   *
   * Copyright 2020 Metrological
   *
   * Licensed under the Apache License, Version 2.0 (the License);
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   * http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */
  class FpsIndicator extends Lightning.Component {
    static _template() {
      return {
        rect: true,
        color: 0xffffffff,
        texture: Lightning.Tools.getRoundRect(80, 80, 40),
        h: 80,
        w: 80,
        x: 100,
        y: 100,
        mount: 1,
        Background: {
          x: 3,
          y: 3,
          texture: Lightning.Tools.getRoundRect(72, 72, 36),
          color: 0xff008000
        },
        Counter: {
          w: w => w,
          h: h => h,
          y: 10,
          text: {
            fontSize: 32,
            textAlign: 'center'
          }
        },
        Text: {
          w: w => w,
          h: h => h,
          y: 48,
          text: {
            fontSize: 15,
            textAlign: 'center',
            text: 'FPS'
          }
        }
      };
    }

    _setup() {
      this.config = { ...{
          log: false,
          interval: 500,
          threshold: 1
        },
        ...Settings.get('platform', 'showFps')
      };
      this.fps = 0;
      this.lastFps = this.fps - this.config.threshold;

      const fpsCalculator = () => {
        this.fps = ~~(1 / this.stage.dt);
      };

      this.stage.on('frameStart', fpsCalculator);
      this.stage.off('framestart', fpsCalculator);
      this.interval = setInterval(this.showFps.bind(this), this.config.interval);
    }

    _firstActive() {
      this.showFps();
    }

    _detach() {
      clearInterval(this.interval);
    }

    showFps() {
      if (Math.abs(this.lastFps - this.fps) <= this.config.threshold) return;
      this.lastFps = this.fps; // green

      let bgColor = 0xff008000; // orange

      if (this.fps <= 40 && this.fps > 20) bgColor = 0xffffa500; // red
      else if (this.fps <= 20) bgColor = 0xffff0000;
      this.tag('Background').setSmooth('color', bgColor);
      this.tag('Counter').text = `${this.fps}`;
      this.config.log && Log.info('FPS', this.fps);
    }

  }

  /*
   * If not stated otherwise in this file or this component's LICENSE file the
   * following copyright and licenses apply:
   *
   * Copyright 2020 Metrological
   *
   * Licensed under the Apache License, Version 2.0 (the License);
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   * http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */
  let meta = {};
  let translations = {};
  let language = null;
  const initLanguage = (file, language = null) => {
    return new Promise((resolve, reject) => {
      fetch(file).then(response => response.json()).then(json => {
        setTranslations(json); // set language (directly or in a promise)

        typeof language === 'object' && 'then' in language && typeof language.then === 'function' ? language.then(lang => setLanguage(lang).then(resolve).catch(reject)).catch(e => {
          Log.error(e);
          reject(e);
        }) : setLanguage(language).then(resolve).catch(reject);
      }).catch(() => {
        const error = 'Language file ' + file + ' not found';
        Log.error(error);
        reject(error);
      });
    });
  };

  const setTranslations = obj => {
    if ('meta' in obj) {
      meta = { ...obj.meta
      };
      delete obj.meta;
    }

    translations = obj;
  };

  const setLanguage = lng => {
    language = null;
    return new Promise((resolve, reject) => {
      if (lng in translations) {
        language = lng;
      } else {
        if ('map' in meta && lng in meta.map && meta.map[lng] in translations) {
          language = meta.map[lng];
        } else if ('default' in meta && meta.default in translations) {
          const error = 'Translations for Language ' + language + ' not found. Using default language ' + meta.default;
          Log.warn(error);
          language = meta.default;
        } else {
          const error = 'Translations for Language ' + language + ' not found.';
          Log.error(error);
          reject(error);
        }
      }

      if (language) {
        Log.info('Setting language to', language);
        const translationsObj = translations[language];

        if (typeof translationsObj === 'object') {
          resolve();
        } else if (typeof translationsObj === 'string') {
          const url = Utils.asset(translationsObj);
          fetch(url).then(response => response.json()).then(json => {
            // save the translations for this language (to prevent loading twice)
            translations[language] = json;
            resolve();
          }).catch(e => {
            const error = 'Error while fetching ' + url;
            Log.error(error, e);
            reject(error);
          });
        }
      }
    });
  };

  /*
   * If not stated otherwise in this file or this component's LICENSE file the
   * following copyright and licenses apply:
   *
   * Copyright 2020 Metrological
   *
   * Licensed under the Apache License, Version 2.0 (the License);
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   * http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */
  const registry = {
    eventListeners: [],
    timeouts: [],
    intervals: [],
    targets: []
  };
  var Registry = {
    // Timeouts
    setTimeout(cb, timeout, ...params) {
      const timeoutId = setTimeout(() => {
        registry.timeouts = registry.timeouts.filter(id => id !== timeoutId);
        cb.apply(null, params);
      }, timeout, params);
      Log.info('Set Timeout', 'ID: ' + timeoutId);
      registry.timeouts.push(timeoutId);
      return timeoutId;
    },

    clearTimeout(timeoutId) {
      if (registry.timeouts.indexOf(timeoutId) > -1) {
        registry.timeouts = registry.timeouts.filter(id => id !== timeoutId);
        Log.info('Clear Timeout', 'ID: ' + timeoutId);
        clearTimeout(timeoutId);
      } else {
        Log.error('Clear Timeout', 'ID ' + timeoutId + ' not found');
      }
    },

    clearTimeouts() {
      registry.timeouts.forEach(timeoutId => {
        this.clearTimeout(timeoutId);
      });
    },

    // Intervals
    setInterval(cb, interval, ...params) {
      const intervalId = setInterval(() => {
        registry.intervals.filter(id => id !== intervalId);
        cb.apply(null, params);
      }, interval, params);
      Log.info('Set Interval', 'ID: ' + intervalId);
      registry.intervals.push(intervalId);
      return intervalId;
    },

    clearInterval(intervalId) {
      if (registry.intervals.indexOf(intervalId) > -1) {
        registry.intervals = registry.intervals.filter(id => id !== intervalId);
        Log.info('Clear Interval', 'ID: ' + intervalId);
        clearInterval(intervalId);
      } else {
        Log.error('Clear Interval', 'ID ' + intervalId + ' not found');
      }
    },

    clearIntervals() {
      registry.intervals.forEach(intervalId => {
        this.clearInterval(intervalId);
      });
    },

    // Event listeners
    addEventListener(target, event, handler) {
      target.addEventListener(event, handler);
      const targetIndex = registry.targets.indexOf(target) > -1 ? registry.targets.indexOf(target) : registry.targets.push(target) - 1;
      registry.eventListeners[targetIndex] = registry.eventListeners[targetIndex] || {};
      registry.eventListeners[targetIndex][event] = registry.eventListeners[targetIndex][event] || [];
      registry.eventListeners[targetIndex][event].push(handler);
      Log.info('Add eventListener', 'Target:', target, 'Event: ' + event, 'Handler:', handler.toString());
    },

    removeEventListener(target, event, handler) {
      const targetIndex = registry.targets.indexOf(target);

      if (targetIndex > -1 && registry.eventListeners[targetIndex] && registry.eventListeners[targetIndex][event] && registry.eventListeners[targetIndex][event].indexOf(handler) > -1) {
        registry.eventListeners[targetIndex][event] = registry.eventListeners[targetIndex][event].filter(fn => fn !== handler);
        Log.info('Remove eventListener', 'Target:', target, 'Event: ' + event, 'Handler:', handler.toString());
        target.removeEventListener(event, handler);
      } else {
        Log.error('Remove eventListener', 'Not found', 'Target', target, 'Event: ' + event, 'Handler', handler.toString());
      }
    },

    // if `event` is omitted, removes all registered event listeners for target
    // if `target` is also omitted, removes all registered event listeners
    removeEventListeners(target, event) {
      if (target && event) {
        const targetIndex = registry.targets.indexOf(target);

        if (targetIndex > -1) {
          registry.eventListeners[targetIndex][event].forEach(handler => {
            this.removeEventListener(target, event, handler);
          });
        }
      } else if (target) {
        const targetIndex = registry.targets.indexOf(target);

        if (targetIndex > -1) {
          Object.keys(registry.eventListeners[targetIndex]).forEach(_event => {
            this.removeEventListeners(target, _event);
          });
        }
      } else {
        Object.keys(registry.eventListeners).forEach(targetIndex => {
          this.removeEventListeners(registry.targets[targetIndex]);
        });
      }
    },

    // Clear everything (to be called upon app close for proper cleanup)
    clear() {
      this.clearTimeouts();
      this.clearIntervals();
      this.removeEventListeners();
      registry.eventListeners = [];
      registry.timeouts = [];
      registry.intervals = [];
      registry.targets = [];
    }

  };

  /*
   * If not stated otherwise in this file or this component's LICENSE file the
   * following copyright and licenses apply:
   *
   * Copyright 2020 Metrological
   *
   * Licensed under the Apache License, Version 2.0 (the License);
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   * http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */
  const isObject$1 = v => {
    return typeof v === 'object' && v !== null;
  };
  const isString$1 = v => {
    return typeof v === 'string';
  };
  const getRgbaComponents = argb => {
    return {
      r: (argb / 65536 | 0) % 256,
      g: (argb / 256 | 0) % 256,
      b: argb * 1 % 256,
      a: argb / 16777216 | 0
    };
  };
  const mergeColors = (c1, c2, p) => {
    let r1 = (c1 / 65536 | 0) % 256;
    let g1 = (c1 / 256 | 0) % 256;
    let b1 = c1 % 256;
    let a1 = c1 / 16777216 | 0;
    let r2 = (c2 / 65536 | 0) % 256;
    let g2 = (c2 / 256 | 0) % 256;
    let b2 = c2 % 256;
    let a2 = c2 / 16777216 | 0;
    let r = r1 * p + r2 * (1 - p);
    let g = g1 * p + g2 * (1 - p);
    let b = b1 * p + b2 * (1 - p);
    let a = a1 * p + a2 * (1 - p);
    return Math.round(a) * 16777216 + Math.round(r) * 65536 + Math.round(g) * 256 + Math.round(b);
  };
  const calculateAlpha = (argb, p) => {
    if (p > 1) {
      p /= 100;
    } else if (p < 0) {
      p = 0;
    }

    let r = (argb / 65536 | 0) % 256;
    let g = (argb / 256 | 0) % 256;
    let b = argb % 256;
    return (r << 16) + (g << 8) + b + (p * 255 | 0) * 16777216;
  };

  const getArgbNumber = rgba => {
    rgba[0] = Math.max(0, Math.min(255, rgba[0]));
    rgba[1] = Math.max(0, Math.min(255, rgba[1]));
    rgba[2] = Math.max(0, Math.min(255, rgba[2]));
    rgba[3] = Math.max(0, Math.min(255, rgba[3]));
    let v = ((rgba[3] | 0) << 24) + ((rgba[0] | 0) << 16) + ((rgba[1] | 0) << 8) + (rgba[2] | 0);

    if (v < 0) {
      v = 0xffffffff + v + 1;
    }

    return v;
  };
  const argbToHSLA = argb => {
    const col = getRgbaComponents(argb);
    const r = col.r / 255;
    const g = col.g / 255;
    const b = col.b / 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0;
    let s = 0;
    const l = (min + max) * 0.5;

    if (l > 0) {
      const maxMin = max - min;

      if (maxMin > 0) {
        const r2 = (max - r) / maxMin;
        const g2 = (max - g) / maxMin;
        const b2 = (max - b) / maxMin;

        if (l < 0.5) {
          s = max + min;
        } else {
          s = 2 - max - min;
        }

        if (r === max && g === min) {
          h = 5.0 + b2;
        } else if (r === max) {
          h = 1.0 - g2;
        } else if (g === max && b === min) {
          h = 1.0 + r2;
        } else if (g === max) {
          h = 3.0 - b2;
        } else if (b === max) {
          h = 3.0 + g2;
        } else {
          h = 5.0 - r2;
        }

        h = h / 6;
      }
    }

    return {
      h: h % 1,
      s,
      l,
      a: col.a
    };
  };
  const hslaToARGB = hsla => {
    let r = 1;
    let g = 1;
    let b = 1;
    let h = hsla.h;
    let s = hsla.s;
    let l = hsla.l;

    if (h < 0) {
      h += 1;
    }

    let max = 0;

    if (l <= 0.5) {
      max = l * (1.0 + s);
    } else {
      max = l + s - l * s;
    }

    if (max > 0) {
      h *= 6.0;
      const min = l + l - max;
      const minMax = (max - min) / max;
      const sextant = Math.floor(h);
      const fract = h - sextant;
      const minMaxFract = max * minMax * fract;
      const mid1 = min + minMaxFract;
      const mid2 = max - minMaxFract;

      if (sextant === 0) {
        r = max;
        g = mid1;
        b = min;
      }

      if (sextant === 1) {
        r = mid2;
        g = max;
        b = min;
      }

      if (sextant === 2) {
        r = min;
        g = max;
        b = mid1;
      }

      if (sextant === 3) {
        r = min;
        g = mid2;
        b = max;
      }

      if (sextant === 4) {
        r = mid1;
        g = min;
        b = max;
      }

      if (sextant === 5) {
        r = max;
        g = min;
        b = mid2;
      }
    }

    return getArgbNumber([Math.floor(r * 255), Math.floor(g * 255), Math.floor(b * 255), hsla.a]);
  };

  /*
   * If not stated otherwise in this file or this component's LICENSE file the
   * following copyright and licenses apply:
   *
   * Copyright 2020 Metrological
   *
   * Licensed under the Apache License, Version 2.0 (the License);
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   * http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */
  let colors = {
    white: '#ffffff',
    black: '#000000',
    red: '#ff0000',
    green: '#00ff00',
    blue: '#0000ff',
    yellow: '#feff00',
    cyan: '#00feff',
    magenta: '#ff00ff'
  };
  const normalizedColors = {//store for normalized colors
  };

  const addColors = (colorsToAdd, value) => {
    if (isObject$1(colorsToAdd)) {
      // clean up normalizedColors if they exist in the to be added colors
      Object.keys(colorsToAdd).forEach(color => cleanUpNormalizedColors(color));
      colors = Object.assign({}, colors, colorsToAdd);
    } else if (isString$1(colorsToAdd) && value) {
      cleanUpNormalizedColors(colorsToAdd);
      colors[colorsToAdd] = value;
    }
  };

  const cleanUpNormalizedColors = color => {
    for (let c in normalizedColors) {
      if (c.indexOf(color) > -1) {
        delete normalizedColors[c];
      }
    }
  };

  const initColors = file => {
    return new Promise((resolve, reject) => {
      if (typeof file === 'object') {
        addColors(file);
        resolve();
      }

      fetch(file).then(response => response.json()).then(json => {
        addColors(json);
        resolve();
      }).catch(() => {
        const error = 'Colors file ' + file + ' not found';
        Log.error(error);
        reject(error);
      });
    });
  };

  const normalizeColorToARGB = color => {
    let targetColor = normalizedColors[color] || colors[color] || color;

    if (!targetColor) {
      targetColor = color;
    }

    const check = /^#([0-9A-F]{3}|[0-9A-F]{6})$/i;

    if (isString$1(targetColor) && check.test(targetColor)) {
      let hex = check.exec(targetColor)[1];

      if (hex.length === 3) {
        hex = hex.split('').map(value => {
          return value + value;
        }).join('');
      }

      targetColor = `0xff${hex}` * 1;
    }

    if (!normalizedColors[color]) {
      normalizedColors[color] = targetColor;
    }

    return targetColor || 0xffffffff;
  };

  var Colors = (color => {
    return Color.generate(color);
  });
  const Color = {
    color: null,
    generate: function (value = this.color) {
      if (normalizedColors[value]) {
        this.color = normalizedColors[value];
      } else {
        this.color = normalizeColorToARGB(value);
      }

      return this;
    },

    get() {
      return this.color;
    },

    alpha: function (percentage) {
      this.color = calculateAlpha(this.color, Math.abs(percentage));
      return this;
    },

    darker(percentage) {
      const hsl = argbToHSLA(this.color);
      hsl.l = hsl.l * (1 - percentage);
      this.color = hslaToARGB(hsl);
      return this;
    },

    lighter(percentage) {
      const hsl = argbToHSLA(this.color);
      hsl.l = hsl.l + (1 - hsl.l) * percentage;
      this.color = hslaToARGB(hsl);
      return this;
    },

    saturation(percentage) {
      const hsl = argbToHSLA(this.color);
      hsl.s = percentage;
      this.color = hslaToARGB(hsl);
      return this;
    },

    lightness(percentage) {
      const hsl = argbToHSLA(this.color);
      hsl.l = percentage;
      this.color = hslaToARGB(hsl);
      return this;
    },

    hue(degrees) {
      const hsl = argbToHSLA(this.color);
      hsl.h = degrees;
      this.color = hslaToARGB(hsl);
      return this;
    },

    mix(argb, p) {
      this.color = mergeColors(this.color, argb, p);
      return this;
    }

  };

  var name = "@lightningjs/sdk";
  var version = "4.8.1";
  var license = "Apache-2.0";
  var scripts = {
  	postinstall: "node ./scripts/postinstall.js",
  	lint: "eslint '**/*.js'",
  	release: "npm publish --access public"
  };
  var husky = {
  	hooks: {
  		"pre-commit": "lint-staged"
  	}
  };
  var dependencies = {
  	"@babel/polyfill": "^7.11.5",
  	"@lightningjs/core": "*",
  	"@michieljs/execute-as-promise": "^1.0.0",
  	deepmerge: "^4.2.2",
  	localCookie: "github:WebPlatformForEmbedded/localCookie",
  	shelljs: "^0.8.4",
  	"url-polyfill": "^1.1.10",
  	"whatwg-fetch": "^3.0.0"
  };
  var devDependencies = {
  	"@babel/core": "^7.11.6",
  	"@babel/plugin-transform-parameters": "^7.10.5 ",
  	"@babel/plugin-transform-spread": "^7.11.0",
  	"@babel/preset-env": "^7.11.5",
  	"babel-eslint": "^10.1.0",
  	eslint: "^7.10.0",
  	"eslint-config-prettier": "^6.12.0",
  	"eslint-plugin-prettier": "^3.1.4",
  	husky: "^4.3.0",
  	"lint-staged": "^10.4.0",
  	prettier: "^1.19.1",
  	rollup: "^1.32.1",
  	"rollup-plugin-babel": "^4.4.0"
  };
  var repository = {
  	type: "git",
  	url: "git@github.com:rdkcentral/Lightning-SDK.git"
  };
  var bugs = {
  	url: "https://github.com/rdkcentral/Lightning-SDK/issues"
  };
  var packageInfo = {
  	name: name,
  	version: version,
  	license: license,
  	scripts: scripts,
  	"lint-staged": {
  	"*.js": [
  		"eslint --fix"
  	],
  	"src/startApp.js": [
  		"rollup -c ./rollup.config.js"
  	]
  },
  	husky: husky,
  	dependencies: dependencies,
  	devDependencies: devDependencies,
  	repository: repository,
  	bugs: bugs
  };

  /*
   * If not stated otherwise in this file or this component's LICENSE file the
   * following copyright and licenses apply:
   *
   * Copyright 2020 Metrological
   *
   * Licensed under the Apache License, Version 2.0 (the License);
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   * http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */
  let AppInstance;
  const defaultOptions = {
    stage: {
      w: 1920,
      h: 1080,
      clearColor: 0x00000000,
      canvas2d: false
    },
    debug: false,
    defaultFontFace: 'RobotoRegular',
    keys: {
      8: 'Back',
      13: 'Enter',
      27: 'Menu',
      37: 'Left',
      38: 'Up',
      39: 'Right',
      40: 'Down',
      174: 'ChannelDown',
      175: 'ChannelUp',
      178: 'Stop',
      250: 'PlayPause',
      191: 'Search',
      // Use "/" for keyboard
      409: 'Search'
    }
  };
  const customFontFaces = [];

  const fontLoader = (fonts, store) => new Promise((resolve, reject) => {
    fonts.map(({
      family,
      url,
      urls,
      descriptors
    }) => () => {
      const src = urls ? urls.map(url => {
        return 'url(' + url + ')';
      }) : 'url(' + url + ')';
      const fontFace = new FontFace(family, src, descriptors || {});
      store.push(fontFace);
      Log.info('Loading font', family);
      document.fonts.add(fontFace);
      return fontFace.load();
    }).reduce((promise, method) => {
      return promise.then(() => method());
    }, Promise.resolve(null)).then(resolve).catch(reject);
  });

  function Application (App, appData, platformSettings) {
    const {
      width,
      height
    } = platformSettings;

    if (width && height) {
      defaultOptions.stage['w'] = width;
      defaultOptions.stage['h'] = height;
      defaultOptions.stage['precision'] = width / 1920;
    } // support for 720p browser


    if (!width && !height && window.innerHeight === 720) {
      defaultOptions.stage['w'] = 1280;
      defaultOptions.stage['h'] = 720;
      defaultOptions.stage['precision'] = 1280 / 1920;
    }

    return class Application extends Lightning.Application {
      constructor(options) {
        const config = cjs(defaultOptions, options); // Deepmerge breaks HTMLCanvasElement, so restore the passed in canvas.

        if (options.stage.canvas) {
          config.stage.canvas = options.stage.canvas;
        }

        super(config);
        this.config = config;
      }

      static _template() {
        return {
          w: 1920,
          h: 1080
        };
      }

      _setup() {
        Promise.all([this.loadFonts(App.config && App.config.fonts || App.getFonts && App.getFonts() || []), // to be deprecated
        Locale$1.load(App.config && App.config.locale || App.getLocale && App.getLocale()), App.language && this.loadLanguage(App.language()), App.colors && this.loadColors(App.colors())]).then(() => {
          Metrics$1.app.loaded();
          AppInstance = this.stage.c({
            ref: 'App',
            type: App,
            zIndex: 1,
            forceZIndexContext: !!platformSettings.showVersion || !!platformSettings.showFps
          });
          this.childList.a(AppInstance);

          this._refocus();

          Log.info('App version', this.config.version);
          Log.info('SDK version', packageInfo.version);

          if (platformSettings.showVersion) {
            this.childList.a({
              ref: 'VersionLabel',
              type: VersionLabel,
              version: this.config.version,
              sdkVersion: packageInfo.version,
              zIndex: 1
            });
          }

          if (platformSettings.showFps) {
            this.childList.a({
              ref: 'FpsCounter',
              type: FpsIndicator,
              zIndex: 1
            });
          }

          super._setup();
        }).catch(console.error);
      }

      _handleBack() {
        this.closeApp();
      }

      _handleExit() {
        this.closeApp();
      }

      closeApp() {
        Log.info('Signaling App Close');

        if (platformSettings.onClose && typeof platformSettings.onClose === 'function') {
          platformSettings.onClose(...arguments);
        } else {
          this.close();
        }
      }

      close() {
        Log.info('Closing App');
        Settings.clearSubscribers();
        Registry.clear();
        this.childList.remove(this.tag('App'));
        this.cleanupFonts(); // force texture garbage collect

        this.stage.gc();
        this.destroy();
      }

      loadFonts(fonts) {
        return platformSettings.fontLoader && typeof platformSettings.fontLoader === 'function' ? platformSettings.fontLoader(fonts, customFontFaces) : fontLoader(fonts, customFontFaces);
      }

      cleanupFonts() {
        if ('delete' in document.fonts) {
          customFontFaces.forEach(fontFace => {
            Log.info('Removing font', fontFace.family);
            document.fonts.delete(fontFace);
          });
        } else {
          Log.info('No support for removing manually-added fonts');
        }
      }

      loadLanguage(config) {
        let file = Utils.asset('translations.json');
        let language = config;

        if (typeof language === 'object') {
          language = config.language || null;
          file = config.file || file;
        }

        return initLanguage(file, language);
      }

      loadColors(config) {
        let file = Utils.asset('colors.json');

        if (config && (typeof config === 'string' || typeof config === 'object')) {
          file = config;
        }

        return initColors(file);
      }

      set focus(v) {
        this._focussed = v;

        this._refocus();
      }

      _getFocused() {
        return this._focussed || this.tag('App');
      }

    };
  }

  /*
   * If not stated otherwise in this file or this component's LICENSE file the
   * following copyright and licenses apply:
   *
   * Copyright 2020 Metrological
   *
   * Licensed under the Apache License, Version 2.0 (the License);
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   * http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */
  /**
   * @type {Lightning.Application}
   */

  let application;
  /**
   * Actual instance of the app
   * @type {Lightning.Component}
   */

  let app;
  /**
   * Component that hosts all routed pages
   * @type {Lightning.Component}
   */

  let pagesHost;
  /**
   * @type {Lightning.Stage}
   */

  let stage$1;
  /**
   * Platform driven Router configuration
   * @type {Map<string>}
   */

  let routerConfig;
  /**
   * Component that hosts all attached widgets
   * @type {Lightning.Component}
   */

  let widgetsHost;
  /**
   * Hash we point the browser to when we boot the app
   * and there is no deep-link provided
   * @type {string|Function}
   */

  let rootHash;
  /**
   * Boot request will fire before app start
   * can be used to execute some global logic
   * and can be configured
   */

  let bootRequest;
  /**
   * Flag if we need to update the browser location hash.
   * Router can work without.
   * @type {boolean}
   */

  let updateHash = true;
  /**
   * Will be called before a route starts, can be overridden
   * via routes config
   * @param from - route we came from
   * @param to - route we navigate to
   * @returns {Promise<*>}
   */
  // eslint-disable-next-line

  let beforeEachRoute = async (from, to) => {
    return true;
  };
  /**
   *  * Will be called after a navigate successfully resolved,
   * can be overridden via routes config
   */

  let afterEachRoute = () => {};
  /**
   * All configured routes
   * @type {Map<string, object>}
   */

  let routes$1 = new Map();
  /**
   * Store all page components per route
   * @type {Map<string, object>}
   */

  let components = new Map();
  /**
   * Flag if router has been initialised
   * @type {boolean}
   */

  let initialised = false;
  /**
   * Current page being rendered on screen
   * @type {null}
   */

  let activePage = null;
  let activeHash;
  let activeRoute;
  /**
   *  During the process of a navigation request a new
   *  request can start, to prevent unwanted behaviour
   *  the navigate()-method stores the last accepted hash
   *  so we can invalidate any prior requests
   */

  let lastAcceptedHash;
  /**
   * With on()-data providing behaviour the Router forced the App
   * in a Loading state. When the data-provider resolves we want to
   * change the state back to where we came from
   */

  let previousState;

  const mixin = app => {
    // by default the Router Baseclass provides the component
    // reference in which we store our pages
    if (app.pages) {
      pagesHost = app.pages.childList;
    } // if the app is using widgets we grab refs
    // and hide all the widgets


    if (app.widgets && app.widgets.children) {
      widgetsHost = app.widgets.childList; // hide all widgets on boot

      widgetsHost.forEach(w => w.visible = false);
    }

    app._handleBack = e => {
      step(-1);
      e.preventDefault();
    };
  };

  const bootRouter = (config, instance) => {
    let {
      appInstance,
      routes
    } = config; // if instance is provided and it's and Lightning Component instance

    if (instance && isPage(instance)) {
      app = instance;
    }

    if (!app) {
      app = appInstance || AppInstance;
    }

    application = app.application;
    pagesHost = application.childList;
    stage$1 = app.stage;
    routerConfig = getConfigMap();
    mixin(app);

    if (isArray(routes)) {
      setup(config);
    } else if (isFunction(routes)) {
      console.warn('[Router]: Calling Router.route() directly is deprecated.');
      console.warn('Use object config: https://rdkcentral.github.io/Lightning-SDK/#/plugins/router/configuration');
    }
  };

  const setup = config => {
    if (!initialised) {
      init$1(config);
    }

    config.routes.forEach(r => {
      const path = cleanHash(r.path);

      if (!routeExists(path)) {
        const route = createRoute(r);
        routes$1.set(path, route); // if route has a configured component property
        // we store it in a different map to simplify
        // the creating and destroying per route

        if (route.component) {
          let type = route.component;

          if (isComponentConstructor(type)) {
            if (!routerConfig.get('lazyCreate')) {
              type = createComponent(stage$1, type);
              pagesHost.a(type);
            }
          }

          components.set(path, type);
        }
      } else {
        console.error(`${path} already exists in routes configuration`);
      }
    });
  };

  const init$1 = config => {
    rootHash = config.root;

    if (isFunction(config.boot)) {
      bootRequest = config.boot;
    }

    if (isBoolean(config.updateHash)) {
      updateHash = config.updateHash;
    }

    if (isFunction(config.beforeEachRoute)) {
      beforeEachRoute = config.beforeEachRoute;
    }

    if (isFunction(config.afterEachRoute)) {
      afterEachRoute = config.afterEachRoute;
    }

    if (config.bootComponent) {
      console.warn('[Router]: Boot Component is now available as a special router: https://rdkcentral.github.io/Lightning-SDK/#/plugins/router/configuration?id=special-routes');
      console.warn('[Router]: setting { bootComponent } property will be deprecated in a future release');

      if (isPage(config.bootComponent)) {
        config.routes.push({
          path: '$',
          component: config.bootComponent,
          // we try to assign the bootRequest as after data-provider
          // so it will behave as any other component
          after: bootRequest || null,
          options: {
            preventStorage: true
          }
        });
      } else {
        console.error(`[Router]: ${config.bootComponent} is not a valid boot component`);
      }
    }

    initialised = true;
  };

  const storeComponent = (route, type) => {
    if (components.has(route)) {
      components.set(route, type);
    }
  };
  const getComponent = route => {
    if (components.has(route)) {
      return components.get(route);
    }

    return null;
  };
  /**
   * Test if router needs to update browser location hash
   * @returns {boolean}
   */

  const mustUpdateLocationHash = () => {
    if (!routerConfig || !routerConfig.size) {
      return false;
    } // we need support to either turn change hash off
    // per platform or per app


    const updateConfig = routerConfig.get('updateHash');
    return !(isBoolean(updateConfig) && !updateConfig || isBoolean(updateHash) && !updateHash);
  };
  /**
   * Will be called when a new navigate() request has completed
   * and has not been expired due to it's async nature
   * @param request
   */

  const onRequestResolved = request => {
    const hash = request.hash;
    const route = request.route;
    const register = request.register;
    const page = request.page; // clean up history if modifier is set

    if (getOption(route.options, 'clearHistory')) {
      setHistory([]);
    } else if (hash && !isWildcard.test(route.path)) {
      updateHistory(request);
    } // we only update the stackLocation if a route
    // is not expired before it resolves


    storeComponent(route.path, page);

    if (request.isSharedInstance || !request.isCreated) {
      emit$1(page, 'changed');
    } else if (request.isCreated) {
      emit$1(page, 'mounted');
    } // only update widgets if we have a host


    if (widgetsHost) {
      updateWidgets(route.widgets, page);
    } // we want to clean up if there is an
    // active page that is not being shared
    // between current and previous route


    if (getActivePage() && !request.isSharedInstance) {
      cleanUp(activePage, request);
    } // provide history object to active page


    if (register.get(symbols.historyState) && isFunction(page.historyState)) {
      page.historyState(register.get(symbols.historyState));
    }

    setActivePage(page);
    activeHash = request.hash;
    activeRoute = route.path; // cleanup all cancelled requests

    for (let request of navigateQueue.values()) {
      if (request.isCancelled && request.hash) {
        navigateQueue.delete(request.hash);
      }
    }

    afterEachRoute(request);
    Log.info('[route]:', route.path);
    Log.info('[hash]:', hash);
  };

  const cleanUp = (page, request) => {
    const route = activeRoute;
    const register = request.register;
    const lazyDestroy = routerConfig.get('lazyDestroy');
    const destroyOnBack = routerConfig.get('destroyOnHistoryBack');
    const keepAlive = register.get('keepAlive');
    const isFromHistory = register.get(symbols.backtrack);
    let doCleanup = false; // if this request is executed due to a step back in history
    // and we have configured to destroy active page when we go back
    // in history or lazyDestory is enabled

    if (isFromHistory && (destroyOnBack || lazyDestroy)) {
      doCleanup = true;
    } // clean up if lazyDestroy is enabled and the keepAlive flag
    // in navigation register is false


    if (lazyDestroy && !keepAlive) {
      doCleanup = true;
    } // if the current and new request share the same route blueprint


    if (activeRoute === request.route.path) {
      doCleanup = true;
    }

    if (doCleanup) {
      // grab original class constructor if
      // statemachine routed else store constructor
      storeComponent(route, page._routedType || page.constructor); // actual remove of page from memory

      pagesHost.remove(page); // force texture gc() if configured
      // so we can cleanup textures in the same tick

      if (routerConfig.get('gcOnUnload')) {
        stage$1.gc();
      }
    } else {
      // If we're not removing the page we need to
      // reset it's properties
      page.patch({
        x: 0,
        y: 0,
        scale: 1,
        alpha: 1,
        visible: false
      });
    }
  };

  const getActiveHash = () => {
    return activeHash;
  };
  const setActivePage = page => {
    activePage = page;
  };
  const getActivePage = () => {
    return activePage;
  };
  const getActiveRoute = () => {
    return activeRoute;
  };
  const getLastHash = () => {
    return lastAcceptedHash;
  };
  const setLastHash = hash => {
    lastAcceptedHash = hash;
  };
  const getPreviousState = () => {
    return previousState;
  };
  const routeExists = key => {
    return routes$1.has(key);
  };
  const getRootHash = () => {
    return rootHash;
  };
  const getBootRequest = () => {
    return bootRequest;
  };
  const getRouterConfig = () => {
    return routerConfig;
  };
  const getRoutes = () => {
    return routes$1;
  };

  /*
   * If not stated otherwise in this file or this component's LICENSE file the
   * following copyright and licenses apply:
   *
   * Copyright 2020 Metrological
   *
   * Licensed under the Apache License, Version 2.0 (the License);
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   * http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */
  const isFunction = v => {
    return typeof v === 'function';
  };
  const isObject = v => {
    return typeof v === 'object' && v !== null;
  };
  const isBoolean = v => {
    return typeof v === 'boolean';
  };
  const isPage = v => {
    if (v instanceof Lightning.Element || isComponentConstructor(v)) {
      return true;
    }

    return false;
  };
  const isComponentConstructor = type => {
    return type.prototype && 'isComponent' in type.prototype;
  };
  const isArray = v => {
    return Array.isArray(v);
  };
  const ucfirst = v => {
    return `${v.charAt(0).toUpperCase()}${v.slice(1)}`;
  };
  const isString = v => {
    return typeof v === 'string';
  };
  const isPromise = method => {
    let result;

    if (isFunction(method)) {
      try {
        result = method.apply(null);
      } catch (e) {
        result = e;
      }
    } else {
      result = method;
    }

    return isObject(result) && isFunction(result.then);
  };
  const cleanHash = (hash = '') => {
    return hash.replace(/^#/, '').replace(/\/+$/, '');
  };
  const getConfigMap = () => {
    const routerSettings = Settings.get('platform', 'router');
    const isObj = isObject(routerSettings);
    return ['backtrack', 'gcOnUnload', 'destroyOnHistoryBack', 'lazyCreate', 'lazyDestroy', 'reuseInstance', 'autoRestoreRemote', 'numberNavigation', 'updateHash', 'storeSameHash'].reduce((config, key) => {
      config.set(key, isObj ? routerSettings[key] : Settings.get('platform', key));
      return config;
    }, new Map());
  };
  const getQueryStringParams = (hash = getActiveHash()) => {
    const resumeHash = getResumeHash();

    if ((hash === '$' || !hash) && resumeHash) {
      if (isString(resumeHash)) {
        hash = resumeHash;
      }
    }

    let parse = '';
    const getQuery = /([?&].*)/;
    const matches = getQuery.exec(hash);
    const params = {};

    if (document.location && document.location.search) {
      parse = document.location.search;
    }

    if (matches && matches.length) {
      let hashParams = matches[1];

      if (parse) {
        // if location.search is not empty we
        // remove the leading ? to create a
        // valid string
        hashParams = hashParams.replace(/^\?/, ''); // we parse hash params last so they we can always
        // override search params with hash params

        parse = `${parse}&${hashParams}`;
      } else {
        parse = hashParams;
      }
    }

    if (parse) {
      const urlParams = new URLSearchParams(parse);

      for (const [key, value] of urlParams.entries()) {
        params[key] = value;
      }

      return params;
    } else {
      return false;
    }
  };
  const objectToQueryString = obj => {
    if (!isObject(obj)) {
      return '';
    }

    return '?' + Object.keys(obj).map(key => {
      return `${key}=${obj[key]}`;
    }).join('&');
  };
  const symbols = {
    route: Symbol('route'),
    hash: Symbol('hash'),
    store: Symbol('store'),
    fromHistory: Symbol('fromHistory'),
    expires: Symbol('expires'),
    resume: Symbol('resume'),
    backtrack: Symbol('backtrack'),
    historyState: Symbol('historyState'),
    queryParams: Symbol('queryParams')
  };

  /*
   * If not stated otherwise in this file or this component's LICENSE file the
   * following copyright and licenses apply:
   *
   * Copyright 2020 Metrological
   *
   * Licensed under the Apache License, Version 2.0 (the License);
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   * http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */
  const dataHooks = {
    on: request => {
      app.state || '';

      app._setState('Loading');

      return execProvider(request);
    },
    before: request => {
      return execProvider(request);
    },
    after: request => {
      try {
        execProvider(request, true);
      } catch (e) {// for now we fail silently
      }

      return Promise.resolve();
    }
  };

  const execProvider = (request, emitProvided) => {
    const route = request.route;
    const provider = route.provider;
    const expires = route.cache ? route.cache * 1000 : 0;
    const params = addPersistData(request);
    return provider.request(request.page, { ...params
    }).then(() => {
      request.page[symbols.expires] = Date.now() + expires;

      if (emitProvided) {
        emit$1(request.page, 'dataProvided');
      }
    });
  };

  const addPersistData = ({
    page,
    route,
    hash,
    register = new Map()
  }) => {
    const urlValues = getValuesFromHash(hash, route.path);
    const queryParams = getQueryStringParams(hash);
    const pageData = new Map([...urlValues, ...register]);
    const params = {}; // make dynamic url data available to the page
    // as instance properties

    for (let [name, value] of pageData) {
      params[name] = value;
    }

    if (queryParams) {
      params[symbols.queryParams] = queryParams;
    } // check navigation register for persistent data


    if (register.size) {
      const obj = {};

      for (let [k, v] of register) {
        obj[k] = v;
      }

      page.persist = obj;
    } // make url data and persist data available
    // via params property


    page.params = params;
    emit$1(page, ['urlParams'], params);
    return params;
  };
  /**
   * Test if page passed cache-time
   * @param page
   * @returns {boolean}
   */

  const isPageExpired = page => {
    if (!page[symbols.expires]) {
      return false;
    }

    const expires = page[symbols.expires];
    const now = Date.now();
    return now >= expires;
  };
  const hasProvider = path => {
    if (routeExists(path)) {
      const record = routes$1.get(path);
      return !!record.provider;
    }

    return false;
  };
  const getProvider = route => {
    // @todo: fix, route already is passed in
    if (routeExists(route.path)) {
      const {
        provider
      } = routes$1.get(route.path);
      return {
        type: provider.type,
        provider: provider.request
      };
    }
  };

  /*
   * If not stated otherwise in this file or this component's LICENSE file the
   * following copyright and licenses apply:
   *
   * Copyright 2020 Metrological
   *
   * Licensed under the Apache License, Version 2.0 (the License);
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   * http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */
  const fade = (i, o) => {
    return new Promise(resolve => {
      i.patch({
        alpha: 0,
        visible: true,
        smooth: {
          alpha: [1, {
            duration: 0.5,
            delay: 0.1
          }]
        }
      }); // resolve on y finish

      i.transition('alpha').on('finish', () => {
        if (o) {
          o.visible = false;
        }

        resolve();
      });
    });
  };

  const crossFade = (i, o) => {
    return new Promise(resolve => {
      i.patch({
        alpha: 0,
        visible: true,
        smooth: {
          alpha: [1, {
            duration: 0.5,
            delay: 0.1
          }]
        }
      });

      if (o) {
        o.patch({
          smooth: {
            alpha: [0, {
              duration: 0.5,
              delay: 0.3
            }]
          }
        });
      } // resolve on y finish


      i.transition('alpha').on('finish', () => {
        resolve();
      });
    });
  };

  const moveOnAxes = (axis, direction, i, o) => {
    const bounds = axis === 'x' ? 1920 : 1080;
    return new Promise(resolve => {
      i.patch({
        [`${axis}`]: direction ? bounds * -1 : bounds,
        visible: true,
        smooth: {
          [`${axis}`]: [0, {
            duration: 0.4,
            delay: 0.2
          }]
        }
      }); // out is optional

      if (o) {
        o.patch({
          [`${axis}`]: 0,
          smooth: {
            [`${axis}`]: [direction ? bounds : bounds * -1, {
              duration: 0.4,
              delay: 0.2
            }]
          }
        });
      } // resolve on y finish


      i.transition(axis).on('finish', () => {
        resolve();
      });
    });
  };

  const up = (i, o) => {
    return moveOnAxes('y', 0, i, o);
  };

  const down = (i, o) => {
    return moveOnAxes('y', 1, i, o);
  };

  const left = (i, o) => {
    return moveOnAxes('x', 0, i, o);
  };

  const right = (i, o) => {
    return moveOnAxes('x', 1, i, o);
  };

  var Transitions = {
    fade,
    crossFade,
    up,
    down,
    left,
    right
  };

  /*
   * If not stated otherwise in this file or this component's LICENSE file the
   * following copyright and licenses apply:
   *
   * Copyright 2020 Metrological
   *
   * Licensed under the Apache License, Version 2.0 (the License);
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   * http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */
  /**
   * execute transition between new / old page and
   * toggle the defined widgets
   * @todo: platform override default transition
   * @param pageIn
   * @param pageOut
   */

  const executeTransition = (pageIn, pageOut = null) => {
    const transition = pageIn.pageTransition || pageIn.easing;
    const hasCustomTransitions = !!(pageIn.smoothIn || pageIn.smoothInOut || transition);
    const transitionsDisabled = getRouterConfig().get('disableTransitions');

    if (pageIn.easing) {
      console.warn('easing() method is deprecated and will be removed. Use pageTransition()');
    } // default behaviour is a visibility toggle


    if (!hasCustomTransitions || transitionsDisabled) {
      pageIn.visible = true;

      if (pageOut) {
        pageOut.visible = false;
      }

      return Promise.resolve();
    }

    if (transition) {
      let type;

      try {
        type = transition.call(pageIn, pageIn, pageOut);
      } catch (e) {
        type = 'crossFade';
      }

      if (isPromise(type)) {
        return type;
      }

      if (isString(type)) {
        const fn = Transitions[type];

        if (fn) {
          return fn(pageIn, pageOut);
        }
      } // keep backwards compatible for now


      if (pageIn.smoothIn) {
        // provide a smooth function that resolves itself
        // on transition finish
        const smooth = (p, v, args = {}) => {
          return new Promise(resolve => {
            pageIn.visible = true;
            pageIn.setSmooth(p, v, args);
            pageIn.transition(p).on('finish', () => {
              resolve();
            });
          });
        };

        return pageIn.smoothIn({
          pageIn,
          smooth
        });
      }
    }

    return Transitions.crossFade(pageIn, pageOut);
  };

  /*
   * If not stated otherwise in this file or this component's LICENSE file the
   * following copyright and licenses apply:
   *
   * Copyright 2020 Metrological
   *
   * Licensed under the Apache License, Version 2.0 (the License);
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   * http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */
  /**
   * The actual loading of the component
   * */

  const load = async request => {
    let expired = false;

    try {
      request = await loader$1(request);

      if (request && !request.isCancelled) {
        // in case of on() providing we need to reset
        // app state;
        if (app.state === 'Loading') {
          if (getPreviousState() === 'Widgets') ; else {
            app._setState('');
          }
        } // Do page transition if instance
        // is not shared between the routes


        if (!request.isSharedInstance && !request.isCancelled) {
          await executeTransition(request.page, getActivePage());
        }
      } else {
        expired = true;
      } // on expired we only cleanup


      if (expired || request.isCancelled) {
        Log.debug('[router]:', `Rejected ${request.hash} because route to ${getLastHash()} started`);

        if (request.isCreated && !request.isSharedInstance) {
          // remove from render-tree
          pagesHost.remove(request.page);
        }
      } else {
        onRequestResolved(request); // resolve promise

        return request.page;
      }
    } catch (request) {
      if (!request.route) {
        console.error(request);
      } else if (!expired) {
        // @todo: revisit
        const {
          route
        } = request; // clean up history if modifier is set

        if (getOption(route.options, 'clearHistory')) {
          setHistory([]);
        } else if (!isWildcard.test(route.path)) {
          updateHistory(request);
        }

        if (request.isCreated && !request.isSharedInstance) {
          // remove from render-tree
          pagesHost.remove(request.page);
        }

        handleError(request);
      }
    }
  };

  const loader$1 = async request => {
    const route = request.route;
    const hash = request.hash;
    const register = request.register; // todo: grab from Route instance

    let type = getComponent(route.path);
    let isConstruct = isComponentConstructor(type);
    let provide = false; // if it's an instance bt we're not coming back from
    // history we test if we can re-use this instance

    if (!isConstruct && !register.get(symbols.backtrack)) {
      if (!mustReuse(route)) {
        type = type.constructor;
        isConstruct = true;
      }
    } // If page is Lightning Component instance


    if (!isConstruct) {
      request.page = type; // if we have have a data route for current page

      if (hasProvider(route.path)) {
        if (isPageExpired(type) || type[symbols.hash] !== hash) {
          provide = true;
        }
      }

      let currentRoute = getActivePage() && getActivePage()[symbols.route]; // if the new route is equal to the current route it means that both
      // route share the Component instance and stack location / since this case
      // is conflicting with the way before() and after() loading works we flag it,
      // and check platform settings in we want to re-use instance

      if (route.path === currentRoute) {
        request.isSharedInstance = true; // since we're re-using the instance we must attach
        // historyState to the request to prevent it from
        // being overridden.

        if (isFunction(request.page.historyState)) {
          request.copiedHistoryState = request.page.historyState();
        }
      }
    } else {
      request.page = createComponent(stage$1, type);
      pagesHost.a(request.page); // test if need to request data provider

      if (hasProvider(route.path)) {
        provide = true;
      }

      request.isCreated = true;
    } // we store hash and route as properties on the page instance
    // that way we can easily calculate new behaviour on page reload


    request.page[symbols.hash] = hash;
    request.page[symbols.route] = route.path;

    try {
      if (provide) {
        // extract attached data-provider for route
        // we're processing
        const {
          type: loadType,
          provider
        } = getProvider(route); // update running request

        request.provider = provider;
        request.providerType = loadType;
        await dataHooks[loadType](request); // we early exit if the current request is expired

        if (hash !== getLastHash()) {
          return false;
        } else {
          if (request.providerType !== 'after') {
            emit$1(request.page, 'dataProvided');
          } // resolve promise


          return request;
        }
      } else {
        addPersistData(request);
        return request;
      }
    } catch (e) {
      request.error = e;
      return Promise.reject(request);
    }
  };

  const handleError = request => {
    if (request && request.error) {
      console.error(request.error);
    } else if (request) {
      Log.error(request);
    }

    if (request.page && routeExists('!')) {
      navigate('!', {
        request
      }, false);
    }
  };

  const mustReuse = route => {
    const opt = getOption(route.options, 'reuseInstance');
    const config = routerConfig.get('reuseInstance'); // route always has final decision

    if (isBoolean(opt)) {
      return opt;
    }

    return !(isBoolean(config) && config === false);
  };

  /*
   * If not stated otherwise in this file or this component's LICENSE file the
   * following copyright and licenses apply:
   *
   * Copyright 2020 Metrological
   *
   * Licensed under the Apache License, Version 2.0 (the License);
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   * http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */
  class RoutedApp extends Lightning.Component {
    static _template() {
      return {
        Pages: {
          forceZIndexContext: true
        },

        /**
         * This is a default Loading page that will be made visible
         * during data-provider on() you CAN override in child-class
         */
        Loading: {
          rect: true,
          w: 1920,
          h: 1080,
          color: 0xff000000,
          visible: false,
          zIndex: 99,
          Label: {
            mount: 0.5,
            x: 960,
            y: 540,
            text: {
              text: 'Loading..'
            }
          }
        }
      };
    }

    static _states() {
      return [class Loading extends this {
        $enter() {
          this.tag('Loading').visible = true;
        }

        $exit() {
          this.tag('Loading').visible = false;
        }

      }, class Widgets extends this {
        $enter(args, widget) {
          // store widget reference
          this._widget = widget; // since it's possible that this behaviour
          // is non-remote driven we force a recalculation
          // of the focuspath

          this._refocus();
        }

        _getFocused() {
          // we delegate focus to selected widget
          // so it can consume remotecontrol presses
          return this._widget;
        } // if we want to widget to widget focus delegation


        reload(widget) {
          this._widget = widget;

          this._refocus();
        }

        _handleKey() {
          const restoreFocus = routerConfig.get('autoRestoreRemote');
          /**
           * The Router used to delegate focus back to the page instance on
           * every unhandled key. This is barely usefull in any situation
           * so for now we offer the option to explicity turn that behaviour off
           * so we don't don't introduce a breaking change.
           */

          if (!isBoolean(restoreFocus) || restoreFocus === true) {
            Router.focusPage();
          }
        }

      }];
    }
    /**
     * Return location where pages need to be stored
     */


    get pages() {
      return this.tag('Pages');
    }
    /**
     * Tell router where widgets are stored
     */


    get widgets() {
      return this.tag('Widgets');
    }
    /**
     * we MUST register _handleBack method so the Router
     * can override it
     * @private
     */


    _handleBack() {}
    /**
     * We MUST return Router.activePage() so the new Page
     * can listen to the remote-control.
     */


    _getFocused() {
      return Router.getActivePage();
    }

  }

  /*
   * If not stated otherwise in this file or this component's LICENSE file the
   * following copyright and licenses apply:
   *
   * Copyright 2020 Metrological
   *
   * Licensed under the Apache License, Version 2.0 (the License);
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   * http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */
  /*
  rouThor ==[x]
   */

  let navigateQueue = new Map();
  let forcedHash = '';
  let resumeHash = '';
  /**
   * Start routing the app
   * @param config - route config object
   * @param instance - instance of the app
   */

  const startRouter = (config, instance) => {
    bootRouter(config, instance);
    registerListener();
    start();
  }; // start translating url


  const start = () => {
    let hash = (getHash() || '').replace(/^#/, '');
    const bootKey = '$';
    const params = getQueryStringParams(hash);
    const bootRequest = getBootRequest();
    const rootHash = getRootHash();
    const isDirectLoad = hash.indexOf(bootKey) !== -1; // prevent direct reload of wildcard routes
    // expect bootComponent

    if (isWildcard.test(hash) && hash !== bootKey) {
      hash = '';
    } // store resume point for manual resume


    resumeHash = isDirectLoad ? rootHash : hash || rootHash;

    const ready = () => {
      if (!hash && rootHash) {
        if (isString(rootHash)) {
          navigate(rootHash);
        } else if (isFunction(rootHash)) {
          rootHash().then(res => {
            if (isObject(res)) {
              navigate(res.path, res.params);
            } else {
              navigate(res);
            }
          });
        }
      } else {
        queue(hash);
        handleHashChange().then(() => {
          app._refocus();
        }).catch(e => {
          console.error(e);
        });
      }
    };

    if (routeExists(bootKey)) {
      if (hash && !isDirectLoad) {
        if (!getRouteByHash(hash)) {
          navigate('*', {
            failedHash: hash
          });
          return;
        }
      }

      navigate(bootKey, {
        resume: resumeHash,
        reload: bootKey === hash
      }, false);
    } else if (isFunction(bootRequest)) {
      bootRequest(params).then(() => {
        ready();
      }).catch(e => {
        handleBootError(e);
      });
    } else {
      ready();
    }
  };

  const handleBootError = e => {
    if (routeExists('!')) {
      navigate('!', {
        request: {
          error: e
        }
      });
    } else {
      console.error(e);
    }
  };
  /**
   * start a new request
   * @param url
   * @param args
   * @param store
   */


  const navigate = (url, args = {}, store) => {
    if (isObject(url)) {
      url = getHashByName(url);

      if (!url) {
        return;
      }
    }

    let hash = getHash();

    if (!mustUpdateLocationHash() && forcedHash) {
      hash = forcedHash;
    }

    if (hash.replace(/^#/, '') !== url) {
      // push request in the queue
      queue(url, args, store);
      setHash(url);

      if (!mustUpdateLocationHash()) {
        forcedHash = url;
        handleHashChange(url).then(() => {
          app._refocus();
        }).catch(e => {
          console.error(e);
        });
      }
    } else if (args.reload) {
      // push request in the queue
      queue(url, args, store);
      handleHashChange(url).then(() => {
        app._refocus();
      }).catch(e => {
        console.error(e);
      });
    }
  };

  const queue = (hash, args = {}, store) => {
    hash = cleanHash(hash);

    if (!navigateQueue.has(hash)) {
      for (let request of navigateQueue.values()) {
        request.cancel();
      }

      const request = createRequest(hash, args, store);
      navigateQueue.set(decodeURIComponent(hash), request);
      return request;
    }

    return false;
  };
  /**
   * Handle change of hash
   * @param override
   * @returns {Promise<void>}
   */


  const handleHashChange = async override => {
    const hash = cleanHash(override || getHash());
    const queueId = decodeURIComponent(hash);
    let request = navigateQueue.get(queueId); // handle hash updated manually

    if (!request && !navigateQueue.size) {
      request = queue(hash);
    }

    const route = getRouteByHash(hash);

    if (!route) {
      if (routeExists('*')) {
        navigate('*', {
          failedHash: hash
        });
      } else {
        console.error(`Unable to navigate to: ${hash}`);
      }

      return;
    } // update current processed request


    request.hash = hash;
    request.route = route;
    let result = await beforeEachRoute(getActiveHash(), request); // test if a local hook is configured for the route

    if (route.beforeNavigate) {
      result = await route.beforeNavigate(getActiveHash(), request);
    }

    if (isBoolean(result)) {
      // only if resolve value is explicitly true
      // we continue the current route request
      if (result) {
        return resolveHashChange(request);
      }
    } else {
      // if navigation guard didn't return true
      // we cancel the current request
      request.cancel();
      navigateQueue.delete(queueId);

      if (isString(result)) {
        navigate(result);
      } else if (isObject(result)) {
        let store = true;

        if (isBoolean(result.store)) {
          store = result.store;
        }

        navigate(result.path, result.params, store);
      }
    }
  };
  /**
   * Continue processing the hash change if not blocked
   * by global or local hook
   * @param request - {}
   */


  const resolveHashChange = request => {
    const hash = request.hash;
    const route = request.route;
    const queueId = decodeURIComponent(hash); // store last requested hash so we can
    // prevent a route that resolved later
    // from displaying itself

    setLastHash(hash);

    if (route.path) {
      const component = getComponent(route.path); // if a hook is provided for the current route

      if (isFunction(route.hook)) {
        const urlParams = getValuesFromHash(hash, route.path);
        const params = {};

        for (const key of urlParams.keys()) {
          params[key] = urlParams.get(key);
        }

        route.hook(app, { ...params
        });
      } // if there is a component attached to the route


      if (component) {
        // force page to root state to prevent shared state issues
        const activePage = getActivePage();

        if (activePage) {
          const keepAlive = keepActivePageAlive(getActiveRoute(), request);

          if (activePage && route.path === getActiveRoute() && !keepAlive) {
            activePage._setState('');
          }
        }

        if (isPage(component)) {
          load(request).then(() => {
            app._refocus();

            navigateQueue.delete(queueId);
          });
        } else {
          // of the component is not a constructor
          // or a Component instance we can assume
          // that it's a dynamic import
          component().then(contents => {
            return contents.default;
          }).then(module => {
            storeComponent(route.path, module);
            return load(request);
          }).then(() => {
            app._refocus();

            navigateQueue.delete(queueId);
          });
        }
      } else {
        navigateQueue.delete(queueId);
      }
    }
  };
  /**
   * Directional step in history
   * @param direction
   */


  const step = (level = 0) => {
    if (!level || isNaN(level)) {
      return false;
    }

    const history = getHistory(); // for now we only support negative numbers

    level = Math.abs(level); // we can't step back past the amount
    // of history entries

    if (level > history.length) {
      if (isFunction(app._handleAppClose)) {
        return app._handleAppClose();
      }

      return false;
    } else if (history.length) {
      // for now we only support history back
      const route = history.splice(history.length - level, level)[0]; // store changed history

      setHistory(history);
      return navigate(route.hash, {
        [symbols.backtrack]: true,
        [symbols.historyState]: route.state
      }, false);
    } else if (routerConfig.get('backtrack')) {
      const hashLastPart = /(\/:?[\w%\s-]+)$/;
      let hash = stripRegex(getHash());
      let floor = getFloor(hash); // test if we got deep-linked

      if (floor > 1) {
        while (floor--) {
          // strip of last part
          hash = hash.replace(hashLastPart, ''); // if we have a configured route
          // we navigate to it

          if (getRouteByHash(hash)) {
            return navigate(hash, {
              [symbols.backtrack]: true
            }, false);
          }
        }
      }
    }

    return false;
  };
  /**
   * Resume Router's page loading process after
   * the BootComponent became visible;
   */

  const resume = () => {
    if (isString(resumeHash)) {
      navigate(resumeHash, false);
      resumeHash = '';
    } else if (isFunction(resumeHash)) {
      resumeHash().then(res => {
        resumeHash = '';

        if (isObject(res)) {
          navigate(res.path, res.params);
        } else {
          navigate(res);
        }
      });
    } else {
      console.warn('[Router]: resume() called but no hash found');
    }
  };
  /**
   * Force reload active hash
   */


  const reload = () => {
    if (!isNavigating()) {
      const hash = getActiveHash();
      navigate(hash, {
        reload: true
      }, false);
    }
  };
  /**
   * Query if the Router is still processing a Request
   * @returns {boolean}
   */


  const isNavigating = () => {
    if (navigateQueue.size) {
      let isProcessing = false;

      for (let request of navigateQueue.values()) {
        if (!request.isCancelled) {
          isProcessing = true;
        }
      }

      return isProcessing;
    }

    return false;
  };

  const getResumeHash = () => {
    return resumeHash;
  };
  /**
   * By default we return the location hash
   * @returns {string}
   */

  let getHash = () => {
    return document.location.hash;
  };
  /**
   * Update location hash
   * @param url
   */


  let setHash = url => {
    document.location.hash = url;
  };
  /**
   * This can be called from the platform / bootstrapper to override
   * the default getting and setting of the hash
   * @param config
   */


  const initRouter = config => {
    if (config.getHash) {
      getHash = config.getHash;
    }

    if (config.setHash) {
      setHash = config.setHash;
    }
  };
  /**
   * On hash change we start processing
   */

  const registerListener = () => {
    Registry.addEventListener(window, 'hashchange', async () => {
      if (mustUpdateLocationHash()) {
        try {
          await handleHashChange();
        } catch (e) {
          console.error(e);
        }
      }
    });
  };
  /**
   * Navigate to root hash
   */


  const root = () => {
    const rootHash = getRootHash();

    if (isString(rootHash)) {
      navigate(rootHash);
    } else if (isFunction(rootHash)) {
      rootHash().then(res => {
        if (isObject(res)) {
          navigate(res.path, res.params);
        } else {
          navigate(res);
        }
      });
    }
  }; // export API


  var Router = {
    startRouter,
    navigate,
    resume,
    step,
    go: step,
    back: step.bind(null, -1),
    activePage: getActivePage,

    getActivePage() {
      // warning
      return getActivePage();
    },

    getActiveRoute,
    getActiveHash,
    focusWidget,
    getActiveWidget,
    restoreFocus,
    isNavigating,
    getHistory,
    setHistory,
    getHistoryState,
    replaceHistoryState,
    getQueryStringParams,
    reload,
    symbols,
    App: RoutedApp,
    // keep backwards compatible
    focusPage: restoreFocus,
    root: root,

    /**
     * Deprecated api methods
     */
    setupRoutes() {
      console.warn('Router: setupRoutes is deprecated, consolidate your configuration');
      console.warn('https://rdkcentral.github.io/Lightning-SDK/#/plugins/router/configuration');
    },

    on() {
      console.warn('Router.on() is deprecated, consolidate your configuration');
      console.warn('https://rdkcentral.github.io/Lightning-SDK/#/plugins/router/configuration');
    },

    before() {
      console.warn('Router.before() is deprecated, consolidate your configuration');
      console.warn('https://rdkcentral.github.io/Lightning-SDK/#/plugins/router/configuration');
    },

    after() {
      console.warn('Router.after() is deprecated, consolidate your configuration');
      console.warn('https://rdkcentral.github.io/Lightning-SDK/#/plugins/router/configuration');
    }

  };

  /*
   * If not stated otherwise in this file or this component's LICENSE file the
   * following copyright and licenses apply:
   *
   * Copyright 2020 Metrological
   *
   * Licensed under the Apache License, Version 2.0 (the License);
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   * http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */
  const defaultChannels = [{
    number: 1,
    name: 'Metro News 1',
    description: 'New York Cable News Channel',
    entitled: true,
    program: {
      title: 'The Morning Show',
      description: "New York's best morning show",
      startTime: new Date(new Date() - 60 * 5 * 1000).toUTCString(),
      // started 5 minutes ago
      duration: 60 * 30,
      // 30 minutes
      ageRating: 0
    }
  }, {
    number: 2,
    name: 'MTV',
    description: 'Music Television',
    entitled: true,
    program: {
      title: 'Beavis and Butthead',
      description: 'American adult animated sitcom created by Mike Judge',
      startTime: new Date(new Date() - 60 * 20 * 1000).toUTCString(),
      // started 20 minutes ago
      duration: 60 * 45,
      // 45 minutes
      ageRating: 18
    }
  }, {
    number: 3,
    name: 'NBC',
    description: 'NBC TV Network',
    entitled: false,
    program: {
      title: 'The Tonight Show Starring Jimmy Fallon',
      description: 'Late-night talk show hosted by Jimmy Fallon on NBC',
      startTime: new Date(new Date() - 60 * 10 * 1000).toUTCString(),
      // started 10 minutes ago
      duration: 60 * 60,
      // 1 hour
      ageRating: 10
    }
  }];
  const channels = () => Settings.get('platform', 'tv', defaultChannels);
  const randomChannel = () => channels()[~~(channels.length * Math.random())];

  /*
   * If not stated otherwise in this file or this component's LICENSE file the
   * following copyright and licenses apply:
   *
   * Copyright 2020 Metrological
   *
   * Licensed under the Apache License, Version 2.0 (the License);
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   * http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */
  let currentChannel;
  const callbacks = {};

  const emit = (event, ...args) => {
    callbacks[event] && callbacks[event].forEach(cb => {
      cb.apply(null, args);
    });
  }; // local mock methods


  let methods = {
    getChannel() {
      if (!currentChannel) currentChannel = randomChannel();
      return new Promise((resolve, reject) => {
        if (currentChannel) {
          const channel = { ...currentChannel
          };
          delete channel.program;
          resolve(channel);
        } else {
          reject('No channel found');
        }
      });
    },

    getProgram() {
      if (!currentChannel) currentChannel = randomChannel();
      return new Promise((resolve, reject) => {
        currentChannel.program ? resolve(currentChannel.program) : reject('No program found');
      });
    },

    setChannel(number) {
      return new Promise((resolve, reject) => {
        if (number) {
          const newChannel = channels().find(c => c.number === number);

          if (newChannel) {
            currentChannel = newChannel;
            const channel = { ...currentChannel
            };
            delete channel.program;
            emit('channelChange', channel);
            resolve(channel);
          } else {
            reject('Channel not found');
          }
        } else {
          reject('No channel number supplied');
        }
      });
    }

  };
  const initTV = config => {
    methods = {};

    if (config.getChannel && typeof config.getChannel === 'function') {
      methods.getChannel = config.getChannel;
    }

    if (config.getProgram && typeof config.getProgram === 'function') {
      methods.getProgram = config.getProgram;
    }

    if (config.setChannel && typeof config.setChannel === 'function') {
      methods.setChannel = config.setChannel;
    }

    if (config.emit && typeof config.emit === 'function') {
      config.emit(emit);
    }
  }; // public API

  /*
   * If not stated otherwise in this file or this component's LICENSE file the
   * following copyright and licenses apply:
   *
   * Copyright 2020 Metrological
   *
   * Licensed under the Apache License, Version 2.0 (the License);
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   * http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */
  const initPurchase = config => {
    if (config.billingUrl) ;
  };

  /*
   * If not stated otherwise in this file or this component's LICENSE file the
   * following copyright and licenses apply:
   *
   * Copyright 2020 Metrological
   *
   * Licensed under the Apache License, Version 2.0 (the License);
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   * http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */

  class PinInput extends Lightning.Component {
    static _template() {
      return {
        w: 120,
        h: 150,
        rect: true,
        color: 0xff949393,
        alpha: 0.5,
        shader: {
          type: Lightning.shaders.RoundedRectangle,
          radius: 10
        },
        Nr: {
          w: w => w,
          y: 24,
          text: {
            text: '',
            textColor: 0xff333333,
            fontSize: 80,
            textAlign: 'center',
            verticalAlign: 'middle'
          }
        }
      };
    }

    set index(v) {
      this.x = v * (120 + 24);
    }

    set nr(v) {
      this._timeout && clearTimeout(this._timeout);

      if (v) {
        this.setSmooth('alpha', 1);
      } else {
        this.setSmooth('alpha', 0.5);
      }

      this.tag('Nr').patch({
        text: {
          text: v && v.toString() || '',
          fontSize: v === '*' ? 120 : 80
        }
      });

      if (v && v !== '*') {
        this._timeout = setTimeout(() => {
          this._timeout = null;
          this.nr = '*';
        }, 750);
      }
    }

  }

  class PinDialog extends Lightning.Component {
    static _template() {
      return {
        zIndex: 1,
        w: w => w,
        h: h => h,
        rect: true,
        color: 0xdd000000,
        alpha: 0.000001,
        Dialog: {
          w: 648,
          h: 320,
          y: h => (h - 320) / 2,
          x: w => (w - 648) / 2,
          rect: true,
          color: 0xdd333333,
          shader: {
            type: Lightning.shaders.RoundedRectangle,
            radius: 10
          },
          Info: {
            y: 24,
            x: 48,
            text: {
              text: 'Please enter your PIN',
              fontSize: 32
            }
          },
          Msg: {
            y: 260,
            x: 48,
            text: {
              text: '',
              fontSize: 28,
              textColor: 0xffffffff
            }
          },
          Code: {
            x: 48,
            y: 96
          }
        }
      };
    }

    _init() {
      const children = [];

      for (let i = 0; i < 4; i++) {
        children.push({
          type: PinInput,
          index: i
        });
      }

      this.tag('Code').children = children;
    }

    get pin() {
      if (!this._pin) this._pin = '';
      return this._pin;
    }

    set pin(v) {
      if (v.length <= 4) {
        const maskedPin = new Array(Math.max(v.length - 1, 0)).fill('*', 0, v.length - 1);
        v.length && maskedPin.push(v.length > this._pin.length ? v.slice(-1) : '*');

        for (let i = 0; i < 4; i++) {
          this.tag('Code').children[i].nr = maskedPin[i] || '';
        }

        this._pin = v;
      }
    }

    get msg() {
      if (!this._msg) this._msg = '';
      return this._msg;
    }

    set msg(v) {
      this._timeout && clearTimeout(this._timeout);
      this._msg = v;

      if (this._msg) {
        this.tag('Msg').text = this._msg;
        this.tag('Info').setSmooth('alpha', 0.5);
        this.tag('Code').setSmooth('alpha', 0.5);
      } else {
        this.tag('Msg').text = '';
        this.tag('Info').setSmooth('alpha', 1);
        this.tag('Code').setSmooth('alpha', 1);
      }

      this._timeout = setTimeout(() => {
        this.msg = '';
      }, 2000);
    }

    _firstActive() {
      this.setSmooth('alpha', 1);
    }

    _handleKey(event) {
      if (this.msg) {
        this.msg = false;
      } else {
        const val = parseInt(event.key);

        if (val > -1) {
          this.pin += val;
        }
      }
    }

    _handleBack() {
      if (this.msg) {
        this.msg = false;
      } else {
        if (this.pin.length) {
          this.pin = this.pin.slice(0, this.pin.length - 1);
        } else {
          Pin.hide();
          this.resolve(false);
        }
      }
    }

    _handleEnter() {
      if (this.msg) {
        this.msg = false;
      } else {
        Pin.submit(this.pin).then(val => {
          this.msg = 'Unlocking ...';
          setTimeout(() => {
            Pin.hide();
          }, 1000);
          this.resolve(val);
        }).catch(e => {
          this.msg = e;
          this.reject(e);
        });
      }
    }

  }

  /*
   * If not stated otherwise in this file or this component's LICENSE file the
   * following copyright and licenses apply:
   *
   * Copyright 2020 Metrological
   *
   * Licensed under the Apache License, Version 2.0 (the License);
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   * http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */

  let unlocked = false;
  const contextItems = ['purchase', 'parental'];

  let submit = (pin, context) => {
    return new Promise((resolve, reject) => {
      if (pin.toString() === Settings.get('platform', 'pin', '0000').toString()) {
        unlocked = true;
        resolve(unlocked);
      } else {
        reject('Incorrect pin');
      }
    });
  };

  let check = context => {
    return new Promise(resolve => {
      resolve(unlocked);
    });
  };

  const initPin = config => {
    if (config.submit && typeof config.submit === 'function') {
      submit = config.submit;
    }

    if (config.check && typeof config.check === 'function') {
      check = config.check;
    }
  };
  let pinDialog = null;

  const contextCheck = context => {
    if (context === undefined) {
      Log.info('Please provide context explicitly');
      return contextItems[0];
    } else if (!contextItems.includes(context)) {
      Log.warn('Incorrect context provided');
      return false;
    }

    return context;
  }; // Public API


  var Pin = {
    show() {
      return new Promise((resolve, reject) => {
        pinDialog = ApplicationInstance.stage.c({
          ref: 'PinDialog',
          type: PinDialog,
          resolve,
          reject
        });
        ApplicationInstance.childList.a(pinDialog);
        ApplicationInstance.focus = pinDialog;
      });
    },

    hide() {
      ApplicationInstance.focus = null;
      ApplicationInstance.children = ApplicationInstance.children.map(child => child !== pinDialog && child);
      pinDialog = null;
    },

    submit(pin, context) {
      return new Promise((resolve, reject) => {
        try {
          context = contextCheck(context);

          if (context) {
            submit(pin, context).then(resolve).catch(reject);
          } else {
            reject('Incorrect Context provided');
          }
        } catch (e) {
          reject(e);
        }
      });
    },

    unlocked(context) {
      return new Promise((resolve, reject) => {
        try {
          context = contextCheck(context);

          if (context) {
            check(context).then(resolve).catch(reject);
          } else {
            reject('Incorrect Context provided');
          }
        } catch (e) {
          reject(e);
        }
      });
    },

    locked(context) {
      return new Promise((resolve, reject) => {
        try {
          context = contextCheck(context);

          if (context) {
            check(context).then(unlocked => resolve(!!!unlocked)).catch(reject);
          } else {
            reject('Incorrect Context provided');
          }
        } catch (e) {
          reject(e);
        }
      });
    }

  };

  /*
   * If not stated otherwise in this file or this component's LICENSE file the
   * following copyright and licenses apply:
   *
   * Copyright 2020 Metrological
   *
   * Licensed under the Apache License, Version 2.0 (the License);
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   * http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */
  let ApplicationInstance;
  var Launch = ((App, appSettings, platformSettings, appData) => {
    initSettings(appSettings, platformSettings);
    initUtils(platformSettings);
    initStorage(); // Initialize plugins

    if (platformSettings.plugins) {
      platformSettings.plugins.profile && initProfile(platformSettings.plugins.profile);
      platformSettings.plugins.metrics && initMetrics(platformSettings.plugins.metrics);
      platformSettings.plugins.mediaPlayer && initMediaPlayer(platformSettings.plugins.mediaPlayer);
      platformSettings.plugins.mediaPlayer && initVideoPlayer(platformSettings.plugins.mediaPlayer);
      platformSettings.plugins.ads && initAds(platformSettings.plugins.ads);
      platformSettings.plugins.router && initRouter(platformSettings.plugins.router);
      platformSettings.plugins.tv && initTV(platformSettings.plugins.tv);
      platformSettings.plugins.purchase && initPurchase(platformSettings.plugins.purchase);
      platformSettings.plugins.pin && initPin(platformSettings.plugins.pin);
    }

    const app = Application(App, appData, platformSettings);
    ApplicationInstance = new app(appSettings);
    return ApplicationInstance;
  });

  /*
   * If not stated otherwise in this file or this component's LICENSE file the
   * following copyright and licenses apply:
   *
   * Copyright 2020 Metrological
   *
   * Licensed under the Apache License, Version 2.0 (the License);
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   * http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */
  class VideoTexture extends Lightning.Component {
    static _template() {
      return {
        Video: {
          alpha: 1,
          visible: false,
          pivot: 0.5,
          texture: {
            type: Lightning.textures.StaticTexture,
            options: {}
          }
        }
      };
    }

    set videoEl(v) {
      this._videoEl = v;
    }

    get videoEl() {
      return this._videoEl;
    }

    get videoView() {
      return this.tag('Video');
    }

    get videoTexture() {
      return this.videoView.texture;
    }

    get isVisible() {
      return this.videoView.alpha === 1 && this.videoView.visible === true;
    }

    _init() {
      this._createVideoTexture();
    }

    _createVideoTexture() {
      const stage = this.stage;
      const gl = stage.gl;
      const glTexture = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, glTexture);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      this.videoTexture.options = {
        source: glTexture,
        w: this.videoEl.width,
        h: this.videoEl.height
      };
      this.videoView.w = this.videoEl.width / this.stage.getRenderPrecision();
      this.videoView.h = this.videoEl.height / this.stage.getRenderPrecision();
    }

    start() {
      const stage = this.stage;
      this._lastTime = 0;

      if (!this._updateVideoTexture) {
        this._updateVideoTexture = () => {
          if (this.videoTexture.options.source && this.videoEl.videoWidth && this.active) {
            const gl = stage.gl;
            const currentTime = new Date().getTime();
            const getVideoPlaybackQuality = this.videoEl.getVideoPlaybackQuality(); // When BR2_PACKAGE_GST1_PLUGINS_BAD_PLUGIN_DEBUGUTILS is not set in WPE, webkitDecodedFrameCount will not be available.
            // We'll fallback to fixed 30fps in this case.
            // As 'webkitDecodedFrameCount' is about to deprecate, check for the 'totalVideoFrames'

            const frameCount = getVideoPlaybackQuality ? getVideoPlaybackQuality.totalVideoFrames : this.videoEl.webkitDecodedFrameCount;
            const mustUpdate = frameCount ? this._lastFrame !== frameCount : this._lastTime < currentTime - 30;

            if (mustUpdate) {
              this._lastTime = currentTime;
              this._lastFrame = frameCount;

              try {
                gl.bindTexture(gl.TEXTURE_2D, this.videoTexture.options.source);
                gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
                gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.videoEl);
                this._lastFrame = this.videoEl.webkitDecodedFrameCount;
                this.videoView.visible = true;
                this.videoTexture.options.w = this.videoEl.width;
                this.videoTexture.options.h = this.videoEl.height;
                const expectedAspectRatio = this.videoView.w / this.videoView.h;
                const realAspectRatio = this.videoEl.width / this.videoEl.height;

                if (expectedAspectRatio > realAspectRatio) {
                  this.videoView.scaleX = realAspectRatio / expectedAspectRatio;
                  this.videoView.scaleY = 1;
                } else {
                  this.videoView.scaleY = expectedAspectRatio / realAspectRatio;
                  this.videoView.scaleX = 1;
                }
              } catch (e) {
                Log.error('texImage2d video', e);
                this.stop();
              }

              this.videoTexture.source.forceRenderUpdate();
            }
          }
        };
      }

      if (!this._updatingVideoTexture) {
        stage.on('frameStart', this._updateVideoTexture);
        this._updatingVideoTexture = true;
      }
    }

    stop() {
      const stage = this.stage;
      stage.removeListener('frameStart', this._updateVideoTexture);
      this._updatingVideoTexture = false;
      this.videoView.visible = false;

      if (this.videoTexture.options.source) {
        const gl = stage.gl;
        gl.bindTexture(gl.TEXTURE_2D, this.videoTexture.options.source);
        gl.clearColor(0, 0, 0, 1);
        gl.clear(gl.COLOR_BUFFER_BIT);
      }
    }

    position(top, left) {
      this.videoView.patch({
        smooth: {
          x: left,
          y: top
        }
      });
    }

    size(width, height) {
      this.videoView.patch({
        smooth: {
          w: width,
          h: height
        }
      });
    }

    show() {
      this.videoView.setSmooth('alpha', 1);
    }

    hide() {
      this.videoView.setSmooth('alpha', 0);
    }

  }

  /*
   * If not stated otherwise in this file or this component's LICENSE file the
   * following copyright and licenses apply:
   *
   * Copyright 2020 Metrological
   *
   * Licensed under the Apache License, Version 2.0 (the License);
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   * http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */
  let mediaUrl = url => url;
  let videoEl;
  let videoTexture;
  let metrics;
  let consumer$1;
  let precision = 1;
  let textureMode = false;
  const initVideoPlayer = config => {
    if (config.mediaUrl) {
      mediaUrl = config.mediaUrl;
    }
  }; // todo: add this in a 'Registry' plugin
  // to be able to always clean this up on app close

  let eventHandlers = {};
  const state$1 = {
    adsEnabled: false,
    playing: false,
    _playingAds: false,

    get playingAds() {
      return this._playingAds;
    },

    set playingAds(val) {
      if (this._playingAds !== val) {
        this._playingAds = val;
        fireOnConsumer$1(val === true ? 'AdStart' : 'AdEnd');
      }
    },

    skipTime: false,
    playAfterSeek: null
  };
  const hooks = {
    play() {
      state$1.playing = true;
    },

    pause() {
      state$1.playing = false;
    },

    seeked() {
      state$1.playAfterSeek === true && videoPlayerPlugin.play();
      state$1.playAfterSeek = null;
    },

    abort() {
      deregisterEventListeners();
    }

  };

  const withPrecision = val => Math.round(precision * val) + 'px';

  const fireOnConsumer$1 = (event, args) => {
    if (consumer$1) {
      consumer$1.fire('$videoPlayer' + event, args, videoEl.currentTime);
      consumer$1.fire('$videoPlayerEvent', event, args, videoEl.currentTime);
    }
  };

  const fireHook = (event, args) => {
    hooks[event] && typeof hooks[event] === 'function' && hooks[event].call(null, event, args);
  };

  let customLoader = null;
  let customUnloader = null;

  const loader = (url, videoEl, config) => {
    return customLoader && typeof customLoader === 'function' ? customLoader(url, videoEl, config) : new Promise(resolve => {
      url = mediaUrl(url);
      videoEl.setAttribute('src', url);
      videoEl.load();
      resolve();
    });
  };

  const unloader = videoEl => {
    return customUnloader && typeof customUnloader === 'function' ? customUnloader(videoEl) : new Promise(resolve => {
      videoEl.removeAttribute('src');
      videoEl.load();
      resolve();
    });
  };

  const setupVideoTag = () => {
    const videoEls = document.getElementsByTagName('video');

    if (videoEls && videoEls.length) {
      return videoEls[0];
    } else {
      const videoEl = document.createElement('video');
      const platformSettingsWidth = Settings.get('platform', 'width') ? Settings.get('platform', 'width') : 1920;
      const platformSettingsHeight = Settings.get('platform', 'height') ? Settings.get('platform', 'height') : 1080;
      videoEl.setAttribute('id', 'video-player');
      videoEl.setAttribute('width', withPrecision(platformSettingsWidth));
      videoEl.setAttribute('height', withPrecision(platformSettingsHeight));
      videoEl.style.position = 'absolute';
      videoEl.style.zIndex = '1';
      videoEl.style.display = 'none';
      videoEl.style.visibility = 'hidden';
      videoEl.style.top = withPrecision(0);
      videoEl.style.left = withPrecision(0);
      videoEl.style.width = withPrecision(platformSettingsWidth);
      videoEl.style.height = withPrecision(platformSettingsHeight);
      document.body.appendChild(videoEl);
      return videoEl;
    }
  };
  const setUpVideoTexture = () => {
    if (!ApplicationInstance.tag('VideoTexture')) {
      const el = ApplicationInstance.stage.c({
        type: VideoTexture,
        ref: 'VideoTexture',
        zIndex: 0,
        videoEl
      });
      ApplicationInstance.childList.addAt(el, 0);
    }

    return ApplicationInstance.tag('VideoTexture');
  };

  const registerEventListeners = () => {
    Log.info('VideoPlayer', 'Registering event listeners');
    Object.keys(events$1).forEach(event => {
      const handler = e => {
        // Fire a metric for each event (if it exists on the metrics object)
        if (metrics && metrics[event] && typeof metrics[event] === 'function') {
          metrics[event]({
            currentTime: videoEl.currentTime
          });
        } // fire an internal hook


        fireHook(event, {
          videoElement: videoEl,
          event: e
        }); // fire the event (with human friendly event name) to the consumer of the VideoPlayer

        fireOnConsumer$1(events$1[event], {
          videoElement: videoEl,
          event: e
        });
      };

      eventHandlers[event] = handler;
      videoEl.addEventListener(event, handler);
    });
  };

  const deregisterEventListeners = () => {
    Log.info('VideoPlayer', 'Deregistering event listeners');
    Object.keys(eventHandlers).forEach(event => {
      videoEl.removeEventListener(event, eventHandlers[event]);
    });
    eventHandlers = {};
  };

  const videoPlayerPlugin = {
    consumer(component) {
      consumer$1 = component;
    },

    loader(loaderFn) {
      customLoader = loaderFn;
    },

    unloader(unloaderFn) {
      customUnloader = unloaderFn;
    },

    position(top = 0, left = 0) {
      videoEl.style.left = withPrecision(left);
      videoEl.style.top = withPrecision(top);

      if (textureMode === true) {
        videoTexture.position(top, left);
      }
    },

    size(width = 1920, height = 1080) {
      videoEl.style.width = withPrecision(width);
      videoEl.style.height = withPrecision(height);
      videoEl.width = parseFloat(videoEl.style.width);
      videoEl.height = parseFloat(videoEl.style.height);

      if (textureMode === true) {
        videoTexture.size(width, height);
      }
    },

    area(top = 0, right = 1920, bottom = 1080, left = 0) {
      this.position(top, left);
      this.size(right - left, bottom - top);
    },

    open(url, config = {}) {
      if (!this.canInteract) return;
      metrics = Metrics$1.media(url);
      this.hide();
      deregisterEventListeners();

      if (this.src == url) {
        this.clear().then(this.open(url, config));
      } else {
        const adConfig = {
          enabled: state$1.adsEnabled,
          duration: 300
        };

        if (config.videoId) {
          adConfig.caid = config.videoId;
        }

        Ads.get(adConfig, consumer$1).then(ads => {
          state$1.playingAds = true;
          ads.prerolls().then(() => {
            state$1.playingAds = false;
            loader(url, videoEl, config).then(() => {
              registerEventListeners();
              this.show();
              this.play();
            }).catch(e => {
              fireOnConsumer$1('error', {
                videoElement: videoEl,
                event: e
              });
            });
          });
        });
      }
    },

    reload() {
      if (!this.canInteract) return;
      const url = videoEl.getAttribute('src');
      this.close();
      this.open(url);
    },

    close() {
      Ads.cancel();

      if (state$1.playingAds) {
        state$1.playingAds = false;
        Ads.stop(); // call self in next tick

        setTimeout(() => {
          this.close();
        });
      }

      if (!this.canInteract) return;
      this.clear();
      this.hide();
      deregisterEventListeners();
    },

    clear() {
      if (!this.canInteract) return; // pause the video first to disable sound

      this.pause();
      if (textureMode === true) videoTexture.stop();
      return unloader(videoEl).then(() => {
        fireOnConsumer$1('Clear', {
          videoElement: videoEl
        });
      });
    },

    play() {
      if (!this.canInteract) return;
      if (textureMode === true) videoTexture.start();
      executeAsPromise(videoEl.play, null, videoEl).catch(e => {
        fireOnConsumer$1('error', {
          videoElement: videoEl,
          event: e
        });
      });
    },

    pause() {
      if (!this.canInteract) return;
      videoEl.pause();
    },

    playPause() {
      if (!this.canInteract) return;
      this.playing === true ? this.pause() : this.play();
    },

    mute(muted = true) {
      if (!this.canInteract) return;
      videoEl.muted = muted;
    },

    loop(looped = true) {
      videoEl.loop = looped;
    },

    seek(time) {
      if (!this.canInteract) return;
      if (!this.src) return; // define whether should continue to play after seek is complete (in seeked hook)

      if (state$1.playAfterSeek === null) {
        state$1.playAfterSeek = !!state$1.playing;
      } // pause before actually seeking


      this.pause(); // currentTime always between 0 and the duration of the video (minus 0.1s to not set to the final frame and stall the video)

      videoEl.currentTime = Math.max(0, Math.min(time, this.duration - 0.1));
    },

    skip(seconds) {
      if (!this.canInteract) return;
      if (!this.src) return;
      state$1.skipTime = (state$1.skipTime || videoEl.currentTime) + seconds;
      easeExecution(() => {
        this.seek(state$1.skipTime);
        state$1.skipTime = false;
      }, 300);
    },

    show() {
      if (!this.canInteract) return;

      if (textureMode === true) {
        videoTexture.show();
      } else {
        videoEl.style.display = 'block';
        videoEl.style.visibility = 'visible';
      }
    },

    hide() {
      if (!this.canInteract) return;

      if (textureMode === true) {
        videoTexture.hide();
      } else {
        videoEl.style.display = 'none';
        videoEl.style.visibility = 'hidden';
      }
    },

    enableAds(enabled = true) {
      state$1.adsEnabled = enabled;
    },

    /* Public getters */
    get duration() {
      return videoEl && (isNaN(videoEl.duration) ? Infinity : videoEl.duration);
    },

    get currentTime() {
      return videoEl && videoEl.currentTime;
    },

    get muted() {
      return videoEl && videoEl.muted;
    },

    get looped() {
      return videoEl && videoEl.loop;
    },

    get src() {
      return videoEl && videoEl.getAttribute('src');
    },

    get playing() {
      return state$1.playing;
    },

    get playingAds() {
      return state$1.playingAds;
    },

    get canInteract() {
      // todo: perhaps add an extra flag wether we allow interactions (i.e. pauze, mute, etc.) during ad playback
      return state$1.playingAds === false;
    },

    get top() {
      return videoEl && parseFloat(videoEl.style.top);
    },

    get left() {
      return videoEl && parseFloat(videoEl.style.left);
    },

    get bottom() {
      return videoEl && parseFloat(videoEl.style.top - videoEl.style.height);
    },

    get right() {
      return videoEl && parseFloat(videoEl.style.left - videoEl.style.width);
    },

    get width() {
      return videoEl && parseFloat(videoEl.style.width);
    },

    get height() {
      return videoEl && parseFloat(videoEl.style.height);
    },

    get visible() {
      if (textureMode === true) {
        return videoTexture.isVisible;
      } else {
        return videoEl && videoEl.style.display === 'block';
      }
    },

    get adsEnabled() {
      return state$1.adsEnabled;
    },

    // prefixed with underscore to indicate 'semi-private'
    // because it's not recommended to interact directly with the video element
    get _videoEl() {
      return videoEl;
    },

    get _consumer() {
      return consumer$1;
    }

  };
  var VideoPlayer = autoSetupMixin(videoPlayerPlugin, () => {
    precision = ApplicationInstance && ApplicationInstance.stage && ApplicationInstance.stage.getRenderPrecision() || precision;
    videoEl = setupVideoTag();
    textureMode = Settings.get('platform', 'textureMode', false);

    if (textureMode === true) {
      videoEl.setAttribute('crossorigin', 'anonymous');
      videoTexture = setUpVideoTexture();
    }
  });

  /*
   * If not stated otherwise in this file or this component's LICENSE file the
   * following copyright and licenses apply:
   *
   * Copyright 2020 Metrological
   *
   * Licensed under the Apache License, Version 2.0 (the License);
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   * http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */
  let consumer;

  let getAds = () => {
    // todo: enable some default ads during development, maybe from the settings.json
    return Promise.resolve({
      prerolls: [],
      midrolls: [],
      postrolls: []
    });
  };

  const initAds = config => {
    if (config.getAds) {
      getAds = config.getAds;
    }
  };
  const state = {
    active: false
  };

  const playSlot = (slot = []) => {
    return slot.reduce((promise, ad) => {
      return promise.then(() => {
        return playAd(ad);
      });
    }, Promise.resolve(null));
  };

  const playAd = ad => {
    return new Promise(resolve => {
      if (state.active === false) {
        Log.info('Ad', 'Skipping add due to inactive state');
        return resolve();
      } // is it safe to rely on videoplayer plugin already created the video tag?


      const videoEl = document.getElementsByTagName('video')[0];
      videoEl.style.display = 'block';
      videoEl.style.visibility = 'visible';
      videoEl.src = mediaUrl(ad.url);
      videoEl.load();
      let timeEvents = null;
      let timeout;

      const cleanup = () => {
        // remove all listeners
        Object.keys(handlers).forEach(handler => videoEl.removeEventListener(handler, handlers[handler]));
        resolve();
      };

      const handlers = {
        play() {
          Log.info('Ad', 'Play ad', ad.url);
          fireOnConsumer('Play', ad);
          sendBeacon(ad.callbacks, 'defaultImpression');
        },

        ended() {
          fireOnConsumer('Ended', ad);
          sendBeacon(ad.callbacks, 'complete');
          cleanup();
        },

        timeupdate() {
          if (!timeEvents && videoEl.duration) {
            // calculate when to fire the time based events (now that duration is known)
            timeEvents = {
              firstQuartile: videoEl.duration / 4,
              midPoint: videoEl.duration / 2,
              thirdQuartile: videoEl.duration / 4 * 3
            };
            Log.info('Ad', 'Calculated quartiles times', {
              timeEvents
            });
          }

          if (timeEvents && timeEvents.firstQuartile && videoEl.currentTime >= timeEvents.firstQuartile) {
            fireOnConsumer('FirstQuartile', ad);
            delete timeEvents.firstQuartile;
            sendBeacon(ad.callbacks, 'firstQuartile');
          }

          if (timeEvents && timeEvents.midPoint && videoEl.currentTime >= timeEvents.midPoint) {
            fireOnConsumer('MidPoint', ad);
            delete timeEvents.midPoint;
            sendBeacon(ad.callbacks, 'midPoint');
          }

          if (timeEvents && timeEvents.thirdQuartile && videoEl.currentTime >= timeEvents.thirdQuartile) {
            fireOnConsumer('ThirdQuartile', ad);
            delete timeEvents.thirdQuartile;
            sendBeacon(ad.callbacks, 'thirdQuartile');
          }
        },

        stalled() {
          fireOnConsumer('Stalled', ad);
          timeout = setTimeout(() => {
            cleanup();
          }, 5000); // make timeout configurable
        },

        canplay() {
          timeout && clearTimeout(timeout);
        },

        error() {
          fireOnConsumer('Error', ad);
          cleanup();
        },

        // this doesn't work reliably on sky box, moved logic to timeUpdate event
        // loadedmetadata() {
        //   // calculate when to fire the time based events (now that duration is known)
        //   timeEvents = {
        //     firstQuartile: videoEl.duration / 4,
        //     midPoint: videoEl.duration / 2,
        //     thirdQuartile: (videoEl.duration / 4) * 3,
        //   }
        // },
        abort() {
          cleanup();
        } // todo: pause, resume, mute, unmute beacons


      }; // add all listeners

      Object.keys(handlers).forEach(handler => videoEl.addEventListener(handler, handlers[handler]));
      videoEl.play();
    });
  };

  const sendBeacon = (callbacks, event) => {
    if (callbacks && callbacks[event]) {
      Log.info('Ad', 'Sending beacon', event, callbacks[event]);
      return callbacks[event].reduce((promise, url) => {
        return promise.then(() => fetch(url) // always resolve, also in case of a fetch error (so we don't block firing the rest of the beacons for this event)
        // note: for fetch failed http responses don't throw an Error :)
        .then(response => {
          if (response.status === 200) {
            fireOnConsumer('Beacon' + event + 'Sent');
          } else {
            fireOnConsumer('Beacon' + event + 'Failed' + response.status);
          }

          Promise.resolve(null);
        }).catch(() => {
          Promise.resolve(null);
        }));
      }, Promise.resolve(null));
    } else {
      Log.info('Ad', 'No callback found for ' + event);
    }
  };

  const fireOnConsumer = (event, args) => {
    if (consumer) {
      consumer.fire('$ad' + event, args);
      consumer.fire('$adEvent', event, args);
    }
  };

  var Ads = {
    get(config, videoPlayerConsumer) {
      if (config.enabled === false) {
        return Promise.resolve({
          prerolls() {
            return Promise.resolve();
          }

        });
      }

      consumer = videoPlayerConsumer;
      return new Promise(resolve => {
        Log.info('Ad', 'Starting session');
        getAds(config).then(ads => {
          Log.info('Ad', 'API result', ads);
          resolve({
            prerolls() {
              if (ads.preroll) {
                state.active = true;
                fireOnConsumer('PrerollSlotImpression', ads);
                sendBeacon(ads.preroll.callbacks, 'slotImpression');
                return playSlot(ads.preroll.ads).then(() => {
                  fireOnConsumer('PrerollSlotEnd', ads);
                  sendBeacon(ads.preroll.callbacks, 'slotEnd');
                  state.active = false;
                });
              }

              return Promise.resolve();
            },

            midrolls() {
              return Promise.resolve();
            },

            postrolls() {
              return Promise.resolve();
            }

          });
        });
      });
    },

    cancel() {
      Log.info('Ad', 'Cancel Ad');
      state.active = false;
    },

    stop() {
      Log.info('Ad', 'Stop Ad');
      state.active = false; // fixme: duplication

      const videoEl = document.getElementsByTagName('video')[0];
      videoEl.pause();
      videoEl.removeAttribute('src');
    }

  };

  /*
   * If not stated otherwise in this file or this component's LICENSE file the
   * following copyright and licenses apply:
   *
   * Copyright 2020 Metrological
   *
   * Licensed under the Apache License, Version 2.0 (the License);
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   * http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */
  class ScaledImageTexture extends Lightning.textures.ImageTexture {
    constructor(stage) {
      super(stage);
      this._scalingOptions = undefined;
    }

    set options(options) {
      this.resizeMode = this._scalingOptions = options;
    }

    _getLookupId() {
      return `${this._src}-${this._scalingOptions.type}-${this._scalingOptions.w}-${this._scalingOptions.h}`;
    }

    getNonDefaults() {
      const obj = super.getNonDefaults();

      if (this._src) {
        obj.src = this._src;
      }

      return obj;
    }

  }

  /*
   * If not stated otherwise in this file or this component's LICENSE file the
   * following copyright and licenses apply:
   *
   * Copyright 2020 Metrological
   *
   * Licensed under the Apache License, Version 2.0 (the License);
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   * http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */
  var Img = ((imageUrl, options) => {
    const imageServerUrl = Settings.get('platform', 'imageServerUrl'); // make and return ScaledImageTexture

    const make = options => {
      // local asset, wrap it in Utils.asset()
      if (!/^(?:https?:)?\/\//i.test(imageUrl)) {
        imageUrl = Utils.asset(imageUrl);
      } // only pass to image server if imageServerUrl is configured
      // and if the asset isn't local to the app (i.e. has same origin)


      if (imageServerUrl && imageUrl.indexOf(window.location.origin) === -1) {
        imageUrl = Utils.ensureUrlWithProtocol(imageServerUrl + '?' + Utils.makeQueryString(imageUrl, options));
      } else {
        // Lightning will handle the resizing and has only 2 flavours (cover and contain)
        if (options.type === 'crop') options.type = 'cover';else options.type = 'contain';
      }

      return {
        type: ScaledImageTexture,
        src: imageUrl,
        options: options
      };
    }; // merge options with default


    const setOptions = options => {
      options = { ...{
          type: 'contain',
          w: 0,
          h: 0
        },
        ...options
      };
      const imageQuality = Math.max(0.1, Math.min(1, (parseFloat(Settings.get('platform', 'image.quality')) || 100) / 100));
      options.w = options.w * imageQuality;
      options.h = options.h * imageQuality;
      return options;
    }; // if options are passed, return scaled image right away


    if (options) {
      return make(setOptions(options));
    } // otherwise return 'chained' functions


    return {
      // official api
      exact: (w, h) => make(setOptions({
        type: 'exact',
        w,
        h
      })),
      landscape: w => make(setOptions({
        type: 'landscape',
        w
      })),
      portrait: h => make(setOptions({
        type: 'portrait',
        h
      })),
      cover: (w, h) => make(setOptions({
        type: 'cover',
        w,
        h
      })),
      contain: (w, h) => make(setOptions({
        type: 'contain',
        w,
        h
      })),
      original: () => make(setOptions({
        type: 'contain'
      })) // todo: add positioning - i.e. top, bottom, center, left etc.

    };
  });

  /*
   * If not stated otherwise in this file or this component's LICENSE file the
   * following copyright and licenses apply:
   *
   * Copyright 2021 Metrological
   *
   * Licensed under the Apache License, Version 2.0 (the License);
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   * http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */
  class CollectionWrapper extends Lightning.Component {
    static _template() {
      return {
        Wrapper: {}
      };
    }

    _construct() {
      this._direction = CollectionWrapper.DIRECTION.row;
      this._scrollTransitionSettings = this.stage.transitions.createSettings({});
      this._spacing = 0;
      this._autoResize = false;
      this._requestingItems = false;
      this._requestThreshold = 1;
      this._requestsEnabled = false;
      this._gcThreshold = 5;
      this._gcIncrement = 0;
      this._forceLoad = false;
      this.clear();
    }

    _setup() {
      this._updateScrollTransition();
    }

    _updateScrollTransition() {
      const axis = this._direction === 1 ? 'y' : 'x';
      this.wrapper.transition(axis, this._scrollTransitionSettings);
      this._scrollTransition = this.wrapper.transition(axis);
    }

    _indexChanged(obj) {
      let {
        previousIndex: previous,
        index: target,
        dataLength: max,
        mainIndex,
        previousMainIndex,
        lines
      } = obj;

      if (!isNaN(previousMainIndex) && !isNaN(mainIndex) && !isNaN(lines)) {
        previous = previousMainIndex;
        target = mainIndex;
        max = lines;
      }

      if (this._requestsEnabled && !this._requestingItems) {
        if (previous < target && target + this._requestThreshold >= max) {
          this._requestingItems = true;
          this.signal('onRequestItems', obj).then(response => {
            const type = typeof response;

            if (Array.isArray(response) || type === 'object' || type === 'string' || type === 'number') {
              this.add(response);
            }

            if (response === false) {
              this.enableRequests = false;
            }

            this._requestingItems = false;
          });
        }
      }

      this._refocus();

      this.scrollCollectionWrapper(obj);
      this.signal('onIndexChanged', obj);
    }

    setIndex(index) {
      const targetIndex = limitWithinRange(index, 0, this._items.length - 1);
      const previousIndex = this._index;
      this._index = targetIndex;

      this._indexChanged({
        previousIndex,
        index: targetIndex,
        dataLength: this._items.length
      });

      return previousIndex !== targetIndex;
    }

    clear() {
      this._uids = [];
      this._items = [];
      this._index = 0;

      if (this.wrapper) {
        const hadChildren = this.wrapper.children > 0;
        this.wrapper.patch({
          x: 0,
          y: 0,
          children: []
        });

        if (hadChildren) {
          this._collectGarbage(true);
        }
      }
    }

    add(item) {
      this.addAt(item);
    }

    addAt(item, index = this._items.length) {
      if (index >= 0 && index <= this._items.length) {
        if (!Array.isArray(item)) {
          item = [item];
        }

        const items = this._normalizeDataItems(item);

        this._items.splice(index, 0, ...items);

        this.plotItems();
        this.setIndex(this._index);
      } else {
        throw new Error('addAt: The index ' + index + ' is out of bounds ' + this._items.length);
      }
    }

    remove(item) {
      if (this.hasItems && item.assignedID) {
        for (let i = 0; i < this.wrapper.children.length; i++) {
          if (this.wrapper.children[i].assignedID === item.assignedID) {
            return this.removeAt(i);
          }
        }
      } else {
        throw new Error('remove: item not found');
      }
    }

    removeAt(index, amount = 1) {
      if (index < 0 && index >= this._items.length) {
        throw new Error('removeAt: The index ' + index + ' is out of bounds ' + this._items.length);
      }

      const item = this._items[index];

      this._items.splice(index, amount);

      this.plotItems();
      return item;
    }

    reload(item) {
      this.clear();
      this.add(item);
    }

    plotItems(items, options) {//placeholder
    }

    reposition(time = 70) {
      if (this._repositionDebounce) {
        clearTimeout(this._repositionDebounce);
      }

      this._repositionDebounce = setTimeout(() => {
        this.repositionItems();
      }, time);
    }

    repositionItems() {
      //placeHolder
      this.signal('onItemsRepositioned');
    }

    up() {
      return this._attemptNavigation(-1, 1);
    }

    down() {
      return this._attemptNavigation(1, 1);
    }

    left() {
      return this._attemptNavigation(-1, 0);
    }

    right() {
      return this._attemptNavigation(1, 0);
    }

    first() {
      return this.setIndex(0);
    }

    last() {
      return this.setIndex(this._items.length - 1);
    }

    next() {
      return this.setIndex(this._index + 1);
    }

    previous() {
      return this.setIndex(this._index - 1);
    }

    _attemptNavigation(shift, direction) {
      if (this.hasItems) {
        return this.navigate(shift, direction);
      }

      return false;
    }

    navigate(shift, direction = this._direction) {
      if (direction !== this._direction) {
        return false;
      }

      return this.setIndex(this._index + shift);
    }

    scrollCollectionWrapper(obj) {
      let {
        previousIndex: previous,
        index: target,
        dataLength: max,
        mainIndex,
        previousMainIndex,
        lines
      } = obj;

      if (!isNaN(previousMainIndex) && !isNaN(mainIndex) && !isNaN(lines)) {
        previous = previousMainIndex;
        target = mainIndex;
        max = lines;
      }

      const {
        directionIsRow,
        main,
        mainDim,
        mainMarginFrom,
        mainMarginTo
      } = this._getPlotProperties(this._direction);

      const cw = this.currentItemWrapper;
      let bound = this[mainDim];

      if (bound === 0) {
        bound = directionIsRow ? 1920 : 1080;
      }

      const offset = Math.min(this.wrapper[main], this._scrollTransition && this._scrollTransition.targetValue || 0);

      const sizes = this._getItemSizes(cw);

      const marginFrom = sizes[mainMarginFrom] || sizes.margin || 0;
      const marginTo = sizes[mainMarginTo] || sizes.margin || 0;
      let scroll = this._scroll;

      if (!isNaN(scroll)) {
        if (scroll >= 0 && scroll <= 1) {
          scroll = bound * scroll - (cw[main] + cw[mainDim] * scroll);
        } else {
          scroll = scroll - cw[main];
        }
      } else if (typeof scroll === 'function') {
        scroll = scroll.apply(this, [cw, obj]);
      } else if (typeof scroll === 'object') {
        const {
          jump = false,
          after = false,
          backward = 0.0,
          forward = 1.0
        } = scroll;

        if (jump) {
          let mod = target % jump;

          if (mod === 0) {
            scroll = marginFrom - cw[main];
          }

          if (mod === jump - 1) {
            const actualSize = marginFrom + cw[mainDim] + marginTo;
            scroll = mod * actualSize + marginFrom - cw[main];
          }
        } else if (after) {
          scroll = 0;

          if (target >= after - 1) {
            const actualSize = marginFrom + cw[mainDim] + marginTo;
            scroll = (after - 1) * actualSize + marginFrom - cw[main];
          }
        } else {
          const backwardBound = bound * this._normalizePixelToPercentage(backward, bound);

          const forwardBound = bound * this._normalizePixelToPercentage(forward, bound);

          if (target < max - 1 && previous < target && offset + cw[main] + cw[mainDim] > forwardBound) {
            scroll = forwardBound - (cw[main] + cw[mainDim]);
          } else if (target > 0 && target < previous && offset + cw[main] < backwardBound) {
            scroll = backwardBound - cw[main];
          } else if (target === max - 1) {
            scroll = bound - (cw[main] + cw[mainDim]);
          } else if (target === 0) {
            scroll = marginFrom - cw[main];
          }
        }
      } else if (isNaN(scroll)) {
        if (previous < target && offset + cw[main] + cw[mainDim] > bound) {
          scroll = bound - (cw[main] + cw[mainDim]);
        } else if (target < previous && offset + cw[main] < 0) {
          scroll = marginFrom - cw[main];
        }
      }

      if (this.active && !isNaN(scroll) && this._scrollTransition) {
        if (this._scrollTransition.isRunning()) {
          this._scrollTransition.reset(scroll, 0.05);
        } else {
          this._scrollTransition.start(scroll);
        }
      } else if (!isNaN(scroll)) {
        this.wrapper[main] = scroll;
      }
    }

    $childInactive({
      child
    }) {
      if (typeof child === 'object') {
        const index = child.componentIndex;

        for (let key in this._items[index]) {
          if (child.component[key] !== undefined) {
            this._items[index][key] = child.component[key];
          }
        }
      }

      this._collectGarbage();
    }

    $getChildComponent({
      index
    }) {
      return this._items[index];
    }

    _resizeWrapper(crossSize) {
      let obj = crossSize;

      if (!isNaN(crossSize)) {
        const {
          main,
          mainDim,
          crossDim
        } = this._getPlotProperties(this._direction);

        const lastItem = this.wrapper.childList.last;
        obj = {
          [mainDim]: lastItem[main] + lastItem[mainDim],
          [crossDim]: crossSize
        };
      }

      this.wrapper.patch(obj);

      if (this._autoResize) {
        this.patch(obj);
      }
    }

    _generateUniqueID() {
      let id = '';

      while (this._uids[id] || id === '') {
        id = Math.random().toString(36).substr(2, 9);
      }

      this._uids[id] = true;
      return id;
    }

    _getPlotProperties(direction) {
      const directionIsRow = direction === 0;
      return {
        directionIsRow: directionIsRow ? true : false,
        mainDirection: directionIsRow ? 'rows' : 'columns',
        main: directionIsRow ? 'x' : 'y',
        mainDim: directionIsRow ? 'w' : 'h',
        mainMarginTo: directionIsRow ? 'marginRight' : 'marginBottom',
        mainMarginFrom: directionIsRow ? 'marginLeft' : 'marginUp',
        crossDirection: !directionIsRow ? 'columns' : 'rows',
        cross: directionIsRow ? 'y' : 'x',
        crossDim: directionIsRow ? 'h' : 'w',
        crossMarginTo: directionIsRow ? 'marginBottom' : 'marginRight',
        crossMarginFrom: directionIsRow ? 'marginUp' : 'marginLeft'
      };
    }

    _getItemSizes(item) {
      const itemType = item.type;

      if (item.component && item.component.__attached) {
        item = item.component;
      }

      return {
        w: item.w || itemType && itemType['width'],
        h: item.h || itemType && itemType['height'],
        margin: item.margin || itemType && itemType['margin'] || 0,
        marginLeft: item.marginLeft || itemType && itemType['marginLeft'],
        marginRight: item.marginRight || itemType && itemType['marginRight'],
        marginTop: item.marginTop || itemType && itemType['marginTop'],
        marginBottom: item.marginBottom || itemType && itemType['marginBottom']
      };
    }

    _collectGarbage(immediate) {
      this._gcIncrement++;

      if (immediate || this.active && this._gcThreshold !== 0 && this._gcIncrement >= this._gcThreshold) {
        this._gcIncrement = 0;
        this.stage.gc();
      }
    }

    _normalizeDataItems(array) {
      return array.map((item, index) => {
        return this._normalizeDataItem(item) || index;
      }).filter(item => {
        if (!isNaN(item)) {
          console.warn(`Item at index: ${item}, is not a valid item. Removing it from dataset`);
          return false;
        }

        return true;
      });
    }

    _normalizeDataItem(item, index) {
      if (typeof item === 'string' || typeof item === 'number') {
        item = {
          label: item.toString()
        };
      }

      if (typeof item === 'object') {
        let id = this._generateUniqueID();

        return {
          assignedID: id,
          type: this.itemType,
          collectionWrapper: this,
          isAlive: false,
          ...item
        };
      }

      return index;
    }

    _normalizePixelToPercentage(value, max) {
      if (value && value > 1) {
        return value / max;
      }

      return value || 0;
    }

    _getFocused() {
      if (this.hasItems) {
        return this.currentItemWrapper;
      }

      return this;
    }

    _handleRight() {
      return this.right();
    }

    _handleLeft() {
      return this.left();
    }

    _handleUp() {
      return this.up();
    }

    _handleDown() {
      return this.down();
    }

    _inactive() {
      if (this._repositionDebounce) {
        clearTimeout(this._repositionDebounce);
      }

      this._collectGarbage(true);
    }

    static get itemType() {
      return undefined;
    }

    set forceLoad(bool) {
      this._forceLoad = bool;
    }

    get forceLoad() {
      return this._forceLoad;
    }

    get requestingItems() {
      return this._requestingItems;
    }

    set requestThreshold(num) {
      this._requestThreshold = num;
    }

    get requestThreshold() {
      return this._requestThreshold;
    }

    set enableRequests(bool) {
      this._requestsEnabled = bool;
    }

    get enableRequests() {
      return this._requestsEnabled;
    }

    set gcThreshold(num) {
      this._gcThreshold = num;
    }

    get gcThreshold() {
      return this._gcThreshold;
    }

    get wrapper() {
      return this.tag('Wrapper');
    }

    get hasItems() {
      return this.wrapper && this.wrapper.children && this.wrapper.children.length > 0;
    }

    get currentItemWrapper() {
      return this.wrapper.children[this._index];
    }

    get currentItem() {
      return this.currentItemWrapper.component;
    }

    set direction(string) {
      this._direction = CollectionWrapper.DIRECTION[string] || CollectionWrapper.DIRECTION.row;
    }

    get direction() {
      return Object.keys(CollectionWrapper.DIRECTION)[this._direction];
    }

    set items(array) {
      this.clear();
      this.add(array);
    }

    get items() {
      const itemWrappers = this.itemWrappers;
      return this._items.map((item, index) => {
        if (itemWrappers[index] && itemWrappers[index].component.isAlive) {
          return itemWrappers[index].component;
        }

        return item;
      });
    }

    get length() {
      return this._items.length;
    }

    set index(index) {
      this.setIndex(index);
    }

    get itemWrappers() {
      return this.wrapper.children;
    }

    get index() {
      return this._index;
    }

    set scrollTransition(obj) {
      this._scrollTransitionSettings.patch(obj);

      if (this.active) {
        this._updateScrollTransition();
      }
    }

    get scrollTransition() {
      return this._scrollTransition;
    }

    set scroll(value) {
      this._scroll = value;
    }

    get scrollTo() {
      return this._scroll;
    }

    set autoResize(bool) {
      this._autoResize = bool;
    }

    get autoResize() {
      return this._autoResize;
    }

    set spacing(num) {
      this._spacing = num;
    }

    get spacing() {
      return this._spacing;
    }

  }
  CollectionWrapper.DIRECTION = {
    row: 0,
    column: 1
  };

  /*
   * If not stated otherwise in this file or this component's LICENSE file the
   * following copyright and licenses apply:
   *
   * Copyright 2021 Metrological
   *
   * Licensed under the Apache License, Version 2.0 (the License);
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   * http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */
  class Cursor extends Lightning.Component {
    static _template() {
      return {
        alpha: 0
      };
    }

    _construct() {
      this._blink = true;
    }

    _init() {
      this._blinkAnimation = this.animation({
        duration: 1,
        repeat: -1,
        actions: [{
          p: 'alpha',
          v: {
            0: 0,
            0.5: 1,
            1: 0
          }
        }]
      });
    }

    show() {
      if (this._blink) {
        this._blinkAnimation.start();
      } else {
        this.alpha = 1;
      }
    }

    hide() {
      if (this._blink) {
        this._blinkAnimation.stop();
      } else {
        this.alpha = 0;
      }
    }

    set blink(bool) {
      this._blink = bool;

      if (this.active) {
        if (bool) {
          this.show();
        } else {
          this.hide();
        }
      }
    }

    get blink() {
      return this._blink;
    }

  }

  /*
   * If not stated otherwise in this file or this component's LICENSE file the
   * following copyright and licenses apply:
   *
   * Copyright 2021 Metrological
   *
   * Licensed under the Apache License, Version 2.0 (the License);
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   * http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */
  class ItemWrapper$1 extends Lightning.Component {
    static _template() {
      return {
        clipbox: true
      };
    }

    create() {
      if (this.children.length > 0) {
        return;
      }

      const component = this.fireAncestors('$getChildComponent', {
        index: this.componentIndex
      });
      component.isAlive = true;
      const {
        w,
        h,
        margin,
        marginUp,
        marginBottom,
        marginRight,
        marginLeft
      } = this;
      this.children = [{ ...component,
        w,
        h,
        margin,
        marginUp,
        marginRight,
        marginLeft,
        marginBottom
      }];

      if (this.hasFocus()) {
        this._refocus();
      }
    }

    get component() {
      return this.children[0] || this.fireAncestors('$getChildComponent', {
        index: this.componentIndex
      });
    }

    _setup() {
      if (this.forceLoad) {
        this.create();
      }
    }

    _active() {
      this.create();
    }

    _inactive() {
      if (!this.forceLoad) {
        this.children[0].isAlive = false;
        this.fireAncestors('$childInactive', {
          child: this
        });
        this.childList.clear();
      }
    }

    _getFocused() {
      return this.children && this.children[0] || this;
    }

  }

  /*
   * If not stated otherwise in this file or this component's LICENSE file the
   * following copyright and licenses apply:
   *
   * Copyright 2021 Metrological
   *
   * Licensed under the Apache License, Version 2.0 (the License);
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   * http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */
  class KeyWrapper extends Lightning.Component {
    static _template() {
      return {
        clipbox: true
      };
    }

    _update() {
      let currentKey = this.children && this.children[0];

      if (currentKey && currentKey.action === this._key.data.action) {
        currentKey.patch({ ...this._key
        });
      } else {
        this.children = [{
          type: this._key.keyType,
          ...this._key
        }];
      }

      if (this.hasFocus()) {
        this._refocus();
      }
    }

    set key(obj) {
      this._key = obj;

      if (this.active) {
        this._update();
      }
    }

    get key() {
      return this._key;
    }

    _active() {
      this._update();
    }

    _inactive() {
      this.childList.clear();
    }

    _getFocused() {
      return this.children && this.children[0] || this;
    }

  }

  /*
   * If not stated otherwise in this file or this component's LICENSE file the
   * following copyright and licenses apply:
   *
   * Copyright 2021 Metrological
   *
   * Licensed under the Apache License, Version 2.0 (the License);
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   * http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */
  const limitWithinRange = (num, min, max) => {
    return Math.min(Math.max(num, min), max);
  };

  /*
   * If not stated otherwise in this file or this component's LICENSE file the
   * following copyright and licenses apply:
   *
   * Copyright 2021 Metrological
   *
   * Licensed under the Apache License, Version 2.0 (the License);
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   * http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */
  class InputField extends Lightning.Component {
    static _template() {
      return {
        PreLabel: {
          renderOffscreen: true
        },
        PostLabel: {
          renderOffscreen: true
        },
        Cursor: {
          type: Cursor,
          rect: true,
          w: 4,
          h: 54,
          x: 0,
          y: 0
        }
      };
    }

    _construct() {
      this._input = '';
      this._previousInput = '';
      this._description = '';
      this._cursorX = 0;
      this._cursorIndex = 0;
      this._passwordMask = '*';
      this._passwordMode = false;
      this._autoHideCursor = true;
    }

    _init() {
      this.tag('PreLabel').on('txLoaded', () => {
        this._labelTxLoaded();
      });
      this.tag('PostLabel').on('txLoaded', () => {
        this._labelTxLoaded;
      });
    }

    onInputChanged({
      input = ''
    }) {
      let targetIndex = Math.max(input.length - this._input.length + this._cursorIndex, 0);
      this._input = input;

      this._update(targetIndex);
    }

    toggleCursor(bool = !this._cursorVisible) {
      this._cursorVisible = bool;
      this.cursor[bool ? 'show' : 'hide']();
    }

    _labelTxLoaded() {
      const preLabel = this.tag('PreLabel');
      const cursor = this.tag('Cursor');
      const postLabel = this.tag('PostLabel');
      this.h = preLabel.renderHeight || postLabel.renderHeight;
      cursor.x = preLabel.renderWidth + this._cursorX;
      postLabel.x = cursor.x + cursor.w * (1 - cursor.mountX);

      if (!this.autoHideCursor) {
        this.toggleCursor(true);
      }
    }

    _update(index = 0) {
      const hasInput = this._input.length > 0;
      let pre = this._description + '';
      let post = '';

      if (hasInput) {
        pre = this._input.substring(0, index);
        post = this._input.substring(index, this._input.length);

        if (this._passwordMode) {
          pre = this._passwordMask.repeat(pre.length);
          post = this._passwordMask.repeat(post.length);
        }

        this.toggleCursor(true);
      } else if (this._autoHideCursor) {
        this.toggleCursor(false);
      }

      this.patch({
        PreLabel: {
          text: {
            text: pre
          }
        },
        PostLabel: {
          text: {
            text: post
          }
        }
      });

      if (this.h === 0) {
        this.tag('PreLabel').loadTexture();
        this.h = this.tag('PreLabel').renderHeight;
      }

      this._cursorIndex = index;
    }

    _handleRight() {
      this._update(Math.min(this._input.length, this._cursorIndex + 1));
    }

    _handleLeft() {
      this._update(Math.max(0, this._cursorIndex - 1));
    }

    _firstActive() {
      this._labelTxLoaded();

      this._update();
    }

    get input() {
      return this._input;
    }

    get hasInput() {
      return this._input.length > 0;
    }

    get cursorIndex() {
      return this._cursorIndex;
    }

    set inputText(obj) {
      this._inputText = obj;
      this.tag('PreLabel').patch({
        text: obj
      });
      this.tag('PostLabel').patch({
        text: obj
      });
    }

    get inputText() {
      return this._inputText;
    }

    set description(str) {
      this._description = str;
    }

    get description() {
      return this._description;
    }

    set cursor(obj) {
      if (obj.x) {
        this._cursorX = obj.x;
        delete obj.x;
      }

      this.tag('Cursor').patch(obj);
    }

    get cursor() {
      return this.tag('Cursor');
    }

    get cursorVisible() {
      return this._cursorVisible;
    }

    set autoHideCursor(bool) {
      this._autoHideCursor = bool;
    }

    get autoHideCursor() {
      return this._autoHideCursor;
    }

    set passwordMode(val) {
      this._passwordMode = val;
    }

    get passwordMode() {
      return this._passwordMode;
    }

    set passwordMask(str) {
      this._passwordMask = str;
    }

    get passwordmask() {
      return this._passwordMask;
    }

  }

  /*
   * If not stated otherwise in this file or this component's LICENSE file the
   * following copyright and licenses apply:
   *
   * Copyright 2021 Metrological
   *
   * Licensed under the Apache License, Version 2.0 (the License);
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   * http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */
  class Key extends Lightning.Component {
    static _template() {
      return {
        Background: {
          w: w => w,
          h: h => h,
          rect: true
        },
        Label: {
          mount: 0.5,
          x: w => w / 2,
          y: h => h / 2
        }
      };
    }

    _construct() {
      this._backgroundColors = {};
      this._labelColors = {};
    }

    set data(obj) {
      this._data = obj;

      this._update();
    }

    get data() {
      return this._data;
    }

    set labelText(obj) {
      this._labelText = obj;
      this.tag('Label').patch({
        text: obj
      });
    }

    get labelText() {
      return this._labelText;
    }

    set label(obj) {
      this.tag('Label').patch(obj);
    }

    get label() {
      return this.tag('Label');
    }

    set labelColors(obj) {
      this._labelColors = obj;

      this._update();
    }

    get labelColors() {
      return this._labelColors;
    }

    set backgroundColors(obj) {
      this._backgroundColors = obj;

      this._update();
    }

    get backgroundColors() {
      return this._backgroundColors;
    }

    set background(obj) {
      this.tag('Background').patch(obj);
    }

    get background() {
      return this.tag('Background');
    }

    _update() {
      if (!this.active) {
        return;
      }

      const {
        label = ''
      } = this._data;
      const hasFocus = this.hasFocus();
      let {
        focused,
        unfocused = 0xff000000
      } = this._backgroundColors;
      let {
        focused: labelFocused,
        unfocused: labelUnfocused = 0xffffffff
      } = this._labelColors;
      this.patch({
        Background: {
          color: hasFocus && focused ? focused : unfocused
        },
        Label: {
          text: {
            text: label
          },
          color: hasFocus && labelFocused ? labelFocused : labelUnfocused
        }
      });
    }

    _firstActive() {
      this._update();
    }

    _focus() {
      let {
        focused,
        unfocused = 0xff000000
      } = this._backgroundColors;
      let {
        focused: labelFocused,
        unfocused: labelUnfocused = 0xffffffff
      } = this._labelColors;
      this.patch({
        Background: {
          smooth: {
            color: focused || unfocused
          }
        },
        Label: {
          smooth: {
            color: labelFocused || labelUnfocused
          }
        }
      });
    }

    _unfocus() {
      let {
        unfocused = 0xff000000
      } = this._backgroundColors;
      let {
        unfocused: labelUnfocused = 0xffffffff
      } = this._labelColors;
      this.patch({
        Background: {
          smooth: {
            color: unfocused
          }
        },
        Label: {
          smooth: {
            color: labelUnfocused
          }
        }
      });
    }

    static get width() {
      return 80;
    }

    static get height() {
      return 80;
    }

  }

  /*
   * If not stated otherwise in this file or this component's LICENSE file the
   * following copyright and licenses apply:
   *
   * Copyright 2021 Metrological
   *
   * Licensed under the Apache License, Version 2.0 (the License);
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   * http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */
  class Keyboard extends Lightning.Component {
    static _template() {
      return {
        Keys: {
          w: w => w
        }
      };
    }

    _construct() {
      this._input = '';
      this._inputField = undefined;
      this._maxCharacters = 56;
      this.resetFocus();
    }

    resetFocus() {
      this._columnIndex = 0;
      this._rowIndex = 0;
      this._previousKey = null;
    }

    _setup() {
      this._keys = this.tag('Keys');

      this._update();
    }

    _update() {
      const {
        layouts,
        buttonTypes = {},
        styling = {}
      } = this._config;

      if (!this._layout || this._layout && layouts[this._layout] === undefined) {
        console.error(`Configured layout "${this._layout}" does not exist. Picking first available: "${Object.keys(layouts)[0]}"`);
        this._layout = Object.keys(layouts)[0];
      }

      const {
        horizontalSpacing = 0,
        verticalSpacing = 0,
        align = 'left'
      } = styling;
      let rowPosition = 0;
      const isEvent = /^[A-Z][A-Za-z0-9]{1}/;
      const hasLabel = /\:/;

      if (buttonTypes.default === undefined) {
        buttonTypes.default = Key;
      }

      this._keys.children = layouts[this._layout].map((row, rowIndex) => {
        const {
          x = 0,
          margin = 0,
          marginRight,
          marginLeft,
          marginTop,
          marginBottom,
          spacing: rowHorizontalSpacing = horizontalSpacing || 0,
          align: rowAlign = align
        } = styling[`Row${rowIndex + 1}`] || {};
        let keyPosition = 0;
        let rowHeight = 0;
        const rowKeys = row.map((key, keyIndex) => {
          const origin = key;
          let keyType = buttonTypes.default;
          let action = 'Input';
          let label = key;

          if (isEvent.test(key)) {
            if (hasLabel.test(key)) {
              key = key.split(':');
              label = key[1].toString();
              key = key[0];
            }

            if (buttonTypes[key]) {
              keyType = buttonTypes[key];
              action = key.action || key;
            }
          }

          const keySpacing = keyType.margin || keyType.type.margin;
          const {
            w = keyType.type.width || 0,
            h = keyType.type.height || 0,
            marginLeft = keyType.type.marginLeft || keySpacing || 0,
            marginRight = keyType.type.marginRight || keySpacing || rowHorizontalSpacing
          } = keyType;
          rowHeight = h > rowHeight ? h : rowHeight;
          const currentPosition = keyPosition + marginLeft;
          keyPosition += marginLeft + w + marginRight;
          return {
            ref: `Key-{${keyIndex + 1}}`,
            type: KeyWrapper,
            keyboard: this,
            x: currentPosition,
            w,
            h,
            key: {
              data: {
                origin,
                key,
                label,
                action
              },
              w,
              h,
              ...keyType
            }
          };
        });
        let rowOffset = x + (marginLeft || margin);
        let rowMount = 0;

        if (this.w && rowAlign === 'center') {
          rowOffset = this.w / 2;
          rowMount = 0.5;
        }

        if (this.w && rowAlign === 'right') {
          rowOffset = this.w - (marginRight || margin);
          rowMount = 1;
        }

        const currentPosition = rowPosition + (marginTop || margin);
        rowPosition = currentPosition + rowHeight + (marginBottom || margin || verticalSpacing);
        return {
          ref: `Row-${rowIndex + 1}`,
          x: rowOffset,
          mountX: rowMount,
          w: keyPosition,
          y: currentPosition,
          children: rowKeys
        };
      });

      this._refocus();
    }

    _getFocused() {
      return this.currentKeyWrapper || this;
    }

    _handleRight() {
      return this.navigate('row', 1);
    }

    _handleLeft() {
      return this.navigate('row', -1);
    }

    _handleUp() {
      return this.navigate('column', -1);
    }

    _handleDown() {
      return this.navigate('column', 1);
    }

    _handleKey({
      key,
      code = 'CustomKey'
    }) {
      if (code === 'Backspace' && this._input.length === 0) {
        return false;
      }

      if (key === ' ') {
        key = 'Space';
      }

      const targetFound = this._findKey(key);

      if (targetFound) {
        this._handleEnter();
      }

      return targetFound;
    }

    _findKey(str) {
      const rows = this._config.layouts[this._layout];
      let i = 0,
          j = 0;

      for (; i < rows.length; i++) {
        for (j = 0; j < rows[i].length; j++) {
          let key = rows[i][j];

          if (str.length > 1 && key.indexOf(str) > -1 || key.toUpperCase() === str.toUpperCase()) {
            this._rowIndex = i;
            this._columnIndex = j;
            return true;
          }
        }
      }

      return false;
    }

    _handleEnter() {
      const {
        origin,
        action
      } = this.currentKey.data;
      const event = {
        index: this._input.length,
        key: origin
      };

      if (this._inputField && this._inputField.cursorIndex) {
        event.index = this._inputField.cursorIndex;
      }

      if (action !== 'Input') {
        const split = event.key.split(':');
        const call = `on${split[0]}`;
        const eventFunction = this[call];
        event.key = split[1];

        if (eventFunction && eventFunction.apply && eventFunction.call) {
          eventFunction.call(this, event);
        }

        this.signal(call, event);
      } else {
        this.addAt(event.key, event.index);
      }
    }

    _changeInput(input) {
      if (input.length > this._maxCharacters) {
        return;
      }

      const eventData = {
        previousInput: this._input,
        input: this._input = input
      };

      if (this._inputField && this._inputField.onInputChanged) {
        this._inputField.onInputChanged(eventData);
      }

      this.signal('onInputChanged', eventData);
    }

    focus(str) {
      this._findKey(str);
    }

    add(str) {
      this._changeInput(this._input + str);
    }

    addAt(str, index) {
      if (index > this._input.length - 1) {
        this.add(str);
      } else if (index > -1) {
        this._changeInput(this._input.substring(0, index) + str + this._input.substring(index, this._input.length));
      }
    }

    remove() {
      this._changeInput(this._input.substring(0, this._input.length - 1));
    }

    removeAt(index) {
      if (index > this._input.length - 1) {
        this.remove();
      } else if (index > -1) {
        this._changeInput(this._input.substring(0, index - 1) + this._input.substring(index, this._input.length));
      }
    }

    clear() {
      this._changeInput('');
    }

    layout(key) {
      if (key === this._layout) {
        return;
      }

      this._layout = key;

      if (this.attached) {
        this.resetFocus();

        this._update();
      }
    }

    inputField(component) {
      if (component && component.isComponent) {
        this._rowIndex = 0;
        this._columnIndex = 0;
        this._input = component.input !== undefined ? component.input : '';
        this._inputField = component;
      } else {
        this._rowIndex = 0;
        this._columnIndex = 0;
        this._input = '';
        this._inputField = undefined;
      }
    }

    navigate(direction, shift) {
      const targetIndex = (direction === 'row' ? this._columnIndex : this._rowIndex) + shift;
      const currentRow = this.rows[this._rowIndex];

      if (direction === 'row' && targetIndex > -1 && targetIndex < currentRow.children.length) {
        this._previous = null;
        return this._columnIndex = targetIndex;
      }

      if (direction === 'column' && targetIndex > -1 && targetIndex < this.rows.length) {
        const currentRowIndex = this._rowIndex;
        const currentColumnIndex = this._columnIndex;

        if (this._previous && this._previous.row === targetIndex) {
          const tmp = this._previous.column;
          this._previous.column = this._columnIndex;
          this._columnIndex = tmp;
          this._rowIndex = this._previous.row;
        } else {
          const targetRow = this.rows[targetIndex];
          const currentKey = this.currentKeyWrapper;
          const currentRow = this.rows[this._rowIndex];
          const currentX = currentRow.x - currentRow.w * currentRow.mountX + currentKey.x;
          const m = targetRow.children.map(key => {
            const keyX = targetRow.x - targetRow.w * targetRow.mountX + key.x;

            if (keyX <= currentX && currentX < keyX + key.w) {
              return keyX + key.w - currentX;
            }

            if (keyX >= currentX && keyX <= currentX + currentKey.w) {
              return currentX + currentKey.w - keyX;
            }

            return -1;
          });
          let acc = -1;
          let t = -1;

          for (let i = 0; i < m.length; i++) {
            if (m[i] === -1 && acc > -1) {
              break;
            }

            if (m[i] > acc) {
              acc = m[i];
              t = i;
            }
          }

          if (t > -1) {
            this._rowIndex = targetIndex;
            this._columnIndex = t;
          }
        }

        if (this._rowIndex !== currentRowIndex) {
          this._previous = {
            column: currentColumnIndex,
            row: currentRowIndex
          };
          return this._rowIndex = targetIndex;
        }
      }

      return false;
    }

    onSpace({
      index
    }) {
      this.addAt(' ', index);
    }

    onBackspace({
      index
    }) {
      this.removeAt(index);
    }

    onClear() {
      this.clear();
    }

    onLayout({
      key
    }) {
      this.layout(key);
    }

    set config(obj) {
      this._config = obj;

      if (this.active) {
        this._update();
      }
    }

    get config() {
      return this._config;
    }

    set currentInputField(component) {
      this.inputField(component);
    }

    get currentInputField() {
      return this._inputField;
    }

    set currentLayout(str) {
      this.layout(str);
    }

    get currentLayout() {
      return this._layout;
    }

    set maxCharacters(num) {
      this._maxCharacters = num;
    }

    get maxCharacters() {
      return this._maxCharacters;
    }

    get rows() {
      return this._keys && this._keys.children;
    }

    get currentKeyWrapper() {
      return this.rows && this.rows[this._rowIndex].children[this._columnIndex];
    }

    get currentKey() {
      return this.currentKeyWrapper && this.currentKeyWrapper.key;
    }

  }

  /*
   * If not stated otherwise in this file or this component's LICENSE file the
   * following copyright and licenses apply:
   *
   * Copyright 2021 Metrological
   *
   * Licensed under the Apache License, Version 2.0 (the License);
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   * http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */
  class List$1 extends CollectionWrapper {
    plotItems() {
      const items = this._items;
      const wrapper = this.wrapper;

      const {
        directionIsRow,
        main,
        mainDim,
        mainMarginTo,
        mainMarginFrom,
        cross,
        crossDim
      } = this._getPlotProperties(this._direction);

      let crossPos = 0,
          crossSize = 0,
          position = 0;
      const animateItems = [];
      const viewboundMain = directionIsRow ? 1920 : 1080;
      const viewboundCross = directionIsRow ? 1080 : 1920;
      const renderContext = this.core.renderContext;
      const newChildren = items.map((item, index) => {
        const sizes = this._getItemSizes(item);

        position += sizes[mainMarginFrom] || sizes.margin || 0;

        if (crossSize < sizes[crossDim]) {
          crossSize = sizes[crossDim];
        }

        const ref = `IW-${item.assignedID}`;
        let mainPos = position;
        crossPos = item[cross] || crossPos;
        let tmp = mainPos;
        let tcp = crossPos;
        const existingItemWrapper = wrapper.tag(ref);

        if (existingItemWrapper && (existingItemWrapper.active && (crossPos !== existingItemWrapper[cross] || mainPos !== existingItemWrapper[main]) || !existingItemWrapper.active && (renderContext[`p${main}`] + wrapper[main] + mainPos <= viewboundMain || renderContext[`p${cross}`] + wrapper[cross] + crossPos <= viewboundCross))) {
          tmp = existingItemWrapper[main];
          tcp = existingItemWrapper[cross];
          animateItems.push(index);
        }

        position += sizes[mainDim] + (sizes[mainMarginTo] || sizes.margin || this._spacing);
        return {
          ref,
          type: ItemWrapper$1,
          componentIndex: index,
          forceLoad: this._forceLoad,
          ...sizes,
          [`assigned${main.toUpperCase()}`]: mainPos,
          [`assigned${cross.toUpperCase()}`]: crossPos,
          [main]: tmp,
          [cross]: tcp
        };
      });
      wrapper.children = newChildren;
      animateItems.forEach(index => {
        const item = wrapper.children[index];
        item.patch({
          smooth: {
            x: item.assignedX,
            y: item.assignedY
          }
        });
      });

      this._resizeWrapper(crossSize);
    }

    repositionItems() {
      const wrapper = this.wrapper;

      if (!wrapper && wrapper.children.length) {
        return true;
      }

      const {
        main,
        mainDim,
        mainMarginTo,
        mainMarginFrom,
        cross,
        crossDim
      } = this._getPlotProperties(this._direction);

      let crossPos = 0,
          crossSize = 0,
          position = 0;
      wrapper.children.forEach(item => {
        const sizes = this._getItemSizes(item.component);

        position += sizes[mainMarginFrom] || sizes.margin || 0;
        crossPos = item[cross] || crossPos;

        if (crossSize < sizes[crossDim]) {
          crossSize = sizes[crossDim];
        }

        const mainPos = position;
        position += sizes[mainDim] + (sizes[mainMarginTo] || sizes.margin || this.spacing);
        item.patch({
          [`assigned${main.toUpperCase()}`]: mainPos,
          [`assigned${cross.toUpperCase()}`]: 0,
          [main]: mainPos,
          [cross]: crossPos,
          ...sizes
        });
      });

      this._resizeWrapper(crossSize);

      super.repositionItems();
    }

  }

  /*
   * If not stated otherwise in this file or this component's LICENSE file the
   * following copyright and licenses apply:
   *
   * Copyright 2021 Metrological
   *
   * Licensed under the Apache License, Version 2.0 (the License);
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   * http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */
  class ScrollingLabel extends Lightning.Component {
    static _template() {
      return {
        LabelClipper: {
          w: w => w,
          rtt: true,
          shader: {
            type: Lightning.shaders.FadeOut
          },
          LabelWrapper: {
            Label: {
              renderOffscreen: true
            },
            LabelCopy: {
              renderOffscreen: true
            }
          }
        }
      };
    }

    _construct() {
      this._autoStart = true;
      this._scrollAnimation = false;
      this._fade = 30;
      this._spacing = 30;
      this._label = {};
      this._align = 'left';
      this._animationSettings = {
        delay: 0.7,
        repeat: -1,
        stopMethod: 'immediate'
      };
    }

    _init() {
      const label = this.tag('Label');
      label.on('txLoaded', () => {
        this._update(label);

        this._updateAnimation(label);

        if (this._autoStart) {
          this.start();
        }
      });
    }

    _update(label = this.tag('Label')) {
      const renderWidth = label.renderWidth;
      const noScroll = renderWidth <= this.w;
      let labelPos = 0;

      if (noScroll && this._align !== 'left') {
        labelPos = (this.w - renderWidth) * ScrollingLabel.ALIGN[this._align];
      }

      this.tag('LabelClipper').patch({
        h: label.renderHeight,
        shader: {
          right: noScroll ? 0 : this._fade
        },
        LabelWrapper: {
          x: 0,
          Label: {
            x: labelPos
          },
          LabelCopy: {
            x: renderWidth + this._spacing
          }
        }
      });
    }

    _updateAnimation(label = this.tag('Label')) {
      if (this._scrollAnimation) {
        this._scrollAnimation.stopNow();
      }

      if (label.renderWidth > this.w) {
        if (!this._scrollAnimation.duration) {
          this._scrollAnimation.duration = label.renderWidth / 50;
        }

        this._scrollAnimation = this.animation({ ...this._animationSettings,
          actions: [{
            t: 'LabelWrapper',
            p: 'x',
            v: {
              sm: 0,
              0: 0,
              1.0: -(label.renderWidth + this._spacing)
            }
          }, {
            t: 'LabelClipper',
            p: 'shader.left',
            v: {
              0: 0,
              0.2: this._fade,
              0.8: this._fade,
              1.0: 0
            }
          }]
        });
      }
    }

    start() {
      if (this._scrollAnimation) {
        this._scrollAnimation.stopNow();

        this.tag('LabelCopy').patch({
          text: this._label
        });

        this._scrollAnimation.start();
      }
    }

    stop() {
      if (this._scrollAnimation) {
        this._scrollAnimation.stopNow();

        this.tag('LabelCopy').text = '';
      }
    }

    set label(obj) {
      if (typeof obj === 'string') {
        obj = {
          text: obj
        };
      }

      this._label = { ...this._label,
        ...obj
      };
      this.tag('Label').patch({
        text: obj
      });
    }

    get label() {
      return this.tag('Label');
    }

    set align(pos) {
      this._align = pos;
    }

    get align() {
      return this._align;
    }

    set repeat(num) {
      this.animationSettings = {
        repeat: num
      };
    }

    get repeat() {
      return this._animationSettings.repeat;
    }

    set delay(num) {
      this.animationSettings = {
        delay: num
      };
    }

    get delay() {
      return this._animationSettings.delay;
    }

    set duration(num) {
      this.animationSettings = {
        duration: num
      };
    }

    get duration() {
      return this._animationSettings.duration;
    }

    set animationSettings(obj) {
      this._animationSettings = { ...this._animationSettings,
        ...obj
      };

      if (this._scrollAnimation) {
        this._updateAnimation();
      }
    }

    get animationSettings() {
      return this._animationSettings;
    }

  }
  ScrollingLabel.ALIGN = {
    left: 0,
    center: 0.5,
    right: 1
  };

  class Main extends Lightning.Component {
    static _template() {
      return {
        Lists: {
          x: 100,
          y: 560,
          zIndex: 3,
          direction: "column",
          type: List$1,
          scroll: 0,
          scrollTransition: {
            duration: 0.4
          }
        }
      };
    }

    _init() {
      this._index = 0;
    }

    _active() {
      this.widgets.menu.visible = true;
    }

    set main(v) {
      this.tag("Lists").children = v;
      let y = 0;
      this.tag("Lists").children.forEach(child => {
        child.y = y;
        y += child.constructor.height;
      });
    }

    _focus() {
      this.patch({
        Lists: {
          smooth: {
            y: [560, {
              duration: .2,
              timingFunction: 'cubic-bezier(0.20, 1.00, 0.80, 1.00)'
            }]
          }
        }
      });
    }

    _unfocus() {
      this.patch({
        Lists: {
          smooth: {
            y: [600, {
              duration: .4,
              timingFunction: 'cubic-bezier(0.20, 1.00, 0.80, 1.00)'
            }]
          }
        }
      });
    }

    _handleUp() {
      Router.focusWidget("menu");
    }

    $firstItemCreated() {
      this._refocus();
    }

    _getFocused() {
      return this.tag("Lists").children[this._index];
    }

  }

  const getImgUrl = (imgPath, width = 185) => {
    return `//image.tmdb.org/t/p/w${width}${imgPath}`;
  };
  const getFormattedDuration = min => {
    if (min != null || min !== 0) {
      const hours = Math.floor(min / 60);
      const minutes = min % 60;
      return hours !== 0 ? hours + " hr" + " " + minutes + " min" : minutes + " min";
    } else {
      return "null";
    }
  };

  class Button extends Lightning.Component {
    static _template() {
      return {
        flex: {},
        Background: {
          flex: {},
          w: 300,
          rtt: true,
          shader: {
            type: Lightning.shaders.RoundedRectangle,
            radius: 14
          },
          rect: true,
          color: 0xff404249,
          transitions: {
            color: {
              duration: .6,
              timingFunction: 'cubic-bezier(0.20, 1.00, 0.30, 1.00)'
            },
            scale: {
              duration: .6,
              timingFunction: 'cubic-bezier(0.20, 1.00, 0.30, 1.00)'
            }
          },
          Label: {
            flexItem: {
              marginLeft: 115,
              marginRight: 115,
              marginTop: 10,
              marginBottom: 7
            },
            text: {
              fontFace: "SourceSansPro-Regular",
              fontSize: 25
            },
            transitions: {
              color: {
                duration: .6,
                timingFunction: 'cubic-bezier(0.20, 1.00, 0.30, 1.00)'
              },
              scale: {
                duration: .6,
                timingFunction: 'cubic-bezier(0.20, 1.00, 0.30, 1.00)'
              }
            }
          }
        }
      };
    }

    set label(v) {
      this._label = v;
      this.tag("Label").patch({
        text: {
          text: this._label
        }
      });
    }

    _focus() {
      this.patch({
        Background: {
          smooth: {
            color: 0xFFE50914
          },
          Label: {
            smooth: {
              color: 0xffffffff
            }
          }
        }
      });
    }

    _unfocus() {
      this.patch({
        Background: {
          smooth: {
            color: 0xff404249
          },
          Label: {
            smooth: {
              color: 0xffffffff
            }
          }
        }
      });
    }

    _handleEnter() {
      // const {id, media_type} = this._data;
      Router.navigate('player', {
        keepAlive: false
      });
    }

  }

  class TextWithBox extends Lightning.Component {
    static _template() {
      return {
        flex: {},
        Background: {
          flex: {},
          rtt: true,
          shader: {
            type: Lightning.shaders.RoundedRectangle,
            radius: 14
          },
          rect: true,
          color: 0xFFE50914,
          transitions: {
            color: {
              duration: .6,
              timingFunction: 'cubic-bezier(0.20, 1.00, 0.30, 1.00)'
            },
            scale: {
              duration: .6,
              timingFunction: 'cubic-bezier(0.20, 1.00, 0.30, 1.00)'
            }
          },
          Label: {
            flexItem: {
              marginLeft: 20,
              marginRight: 20,
              marginTop: 7,
              marginBottom: 7
            },
            text: {
              fontFace: "SourceSansPro-Regular",
              fontSize: 18,
              textColor: Colors('white').get(),
              fontStyle: 'bold'
            },
            transitions: {
              color: {
                duration: .6,
                timingFunction: 'cubic-bezier(0.20, 1.00, 0.30, 1.00)'
              },
              scale: {
                duration: .6,
                timingFunction: 'cubic-bezier(0.20, 1.00, 0.30, 1.00)'
              }
            }
          }
        }
      };
    }

    set label(v) {
      this._label = v;
      this.tag("Label").patch({
        text: {
          text: this._label
        }
      });
    }

  }

  class CustomTextBox extends Lightning.Component {
    static _template() {
      return {
        flex: {},
        Background: {
          flex: {},
          rtt: true,
          shader: {
            type: Lightning.shaders.RoundedRectangle,
            radius: 14
          },
          rect: true,
          color: 0xFFE50914,
          transitions: {
            color: {
              duration: .6,
              timingFunction: 'cubic-bezier(0.20, 1.00, 0.30, 1.00)'
            },
            scale: {
              duration: .6,
              timingFunction: 'cubic-bezier(0.20, 1.00, 0.30, 1.00)'
            }
          },
          Label: {
            flexItem: {
              marginLeft: 10,
              marginRight: 10,
              marginTop: 5,
              marginBottom: 0
            },
            text: {
              fontFace: "SourceSansPro-Regular",
              fontSize: 16,
              textColor: Colors('white').get(),
              fontStyle: 'bold'
            },
            transitions: {
              color: {
                duration: .6,
                timingFunction: 'cubic-bezier(0.20, 1.00, 0.30, 1.00)'
              },
              scale: {
                duration: .6,
                timingFunction: 'cubic-bezier(0.20, 1.00, 0.30, 1.00)'
              }
            }
          }
        }
      };
    }

    set label(v) {
      this._label = v;
      this.tag("Label").patch({
        text: {
          text: this._label
        }
      });
    }

  }

  class ImageButton extends Lightning.Component {
    static _template() {
      return {
        h: 80,
        w: 80,
        color: 0xff404249,
        rect: true,
        rtt: true,
        shader: {
          type: Lightning.shaders.RoundedRectangle,
          radius: 40
        },
        Icon: {
          w: 30,
          h: 30,
          x: 25,
          y: 25
        },
        Label: {
          x: w => w / 2,
          y: h => h / 2,
          mount: 0.5,
          text: {
            text: '',
            textColor: 0xff000000
          }
        }
      };
    }

    set index(v) {
      this.x = v * 70;
    }

    set icon(v) {
      if (v) {
        this.tag('Icon').src = Utils.asset('images/' + v + '.png');
      }
    }

    set label(v) {
      if (v) {
        this.tag('Label').text.text = v;
      }
    }

    _handleEnter() {
      this.action && this.fireAncestors(this.action);
    }

    _focus() {
      this.setSmooth('color', 0xFFE50914);
    }

    _unfocus() {
      this.setSmooth('color', 0xff404249);
    }

  }

  class Details$3 extends Lightning.Component {
    static _template() {
      return {
        x: 68,
        y: 200,
        flex: {
          direction: "column"
        },
        Header: {
          flex: {},
          PosterAndButton: {
            flex: {
              direction: "column"
            },
            Poster: {
              flexItem: {
                marginRight: 40
              },
              w: 300,
              h: 450,
              shader: {
                type: Lightning.shaders.RoundedRectangle,
                radius: 16
              },
              Image: {
                w: w => w,
                h: h => h
              }
            },
            Button: {
              flexItem: {
                marginTop: 30
              },
              type: Button,
              label: "Watch"
            }
          },
          Details: {
            flex: {
              direction: "column"
            },
            x: 90,
            transitions: {
              x: {
                duration: 1,
                timingFunction: 'cubic-bezier(0.20, 1.00, 0.80, 1.00)'
              }
            },
            IMDBRating: {
              flexItem: {},
              type: TextWithBox,
              label: "★  7.9"
            },
            ReleaseAndDuration: {
              y: 10,
              flex: {
                direction: "row"
              },
              ReleaseDate: {
                text: {
                  text: "02 October, 2021",
                  fontSize: 22
                }
              },
              Duration: {
                x: 10,
                text: {
                  textColor: Colors("white").get(),
                  text: " •  1 hr 20 min",
                  fontSize: 22,
                  fontFace: "SourceSansPro-Regular",
                  maxLines: 1
                }
              }
            },
            Title: {
              text: {
                fontSize: 64,
                fontFace: "SourceSansPro-Bold",
                wordWrapWidth: 960,
                maxLines: 2,
                lineHeight: 50
              }
            },
            Overview: {
              color: 0xFFD3D3D3,
              text: {
                fontSize: 22,
                fontFace: "SourceSansPro-Regular",
                wordWrapWidth: 960,
                lineHeight: 38
              }
            },
            GenreLayout: {
              y: 10,
              flex: {
                direction: "row"
              },
              GenreTitle: {
                flexItem: {},
                type: CustomTextBox,
                label: "Genre"
              },
              Genres: {
                x: 10,
                text: {
                  textColor: Colors("white").get(),
                  fontSize: 20,
                  fontFace: "SourceSansPro-Regular",
                  maxLines: 1
                }
              }
            },
            CastLayout: {
              y: 20,
              flex: {
                direction: "row"
              },
              CastTitle: {
                flexItem: {},
                type: CustomTextBox,
                label: "Cast"
              },
              Casts: {
                x: 10,
                text: {
                  textColor: Colors("white").get(),
                  fontSize: 20,
                  fontFace: "SourceSansPro-Regular",
                  maxLines: 1
                }
              }
            },
            DirectorLayout: {
              y: 30,
              flex: {
                direction: "row"
              },
              DirectorTitle: {
                flexItem: {},
                type: CustomTextBox,
                label: "Director"
              },
              Director: {
                x: 10,
                text: {
                  textColor: Colors("white").get(),
                  fontSize: 20,
                  fontFace: "SourceSansPro-Regular",
                  maxLines: 1
                }
              }
            },
            WriterLayout: {
              y: 40,
              flex: {
                direction: "row"
              },
              WriterTitle: {
                flexItem: {},
                type: CustomTextBox,
                label: "Writer"
              },
              Writer: {
                x: 10,
                text: {
                  textColor: Colors("white").get(),
                  fontSize: 22,
                  fontFace: "SourceSansPro-Regular",
                  maxLines: 1
                }
              }
            },
            LanguageLayout: {
              y: 50,
              flex: {
                direction: "row"
              },
              LanguageTitle: {
                flexItem: {},
                type: CustomTextBox,
                label: "Language"
              },
              Language: {
                x: 10,
                text: {
                  textColor: Colors("white").get(),
                  fontSize: 22,
                  fontFace: "SourceSansPro-Regular",
                  maxLines: 1
                }
              }
            }
          }
        }
      };
    }

    _active() {
      this.widgets.menu.visible = false;
      this.application.emit("setItem", this._details);
      this.application.emit("page", false);
      this.patch({
        Header: {
          Details: {
            smooth: {
              x: 40
            }
          }
        }
      });

      this._refocus();
    }

    _inactive() {
      this.tag("Details").setSmooth("x", 90);
    }

    set details(v) {
      this._details = v[0];
      this._credits = v[1];
      const image = getImgUrl(this._details.poster, 500);

      const genres = this._details.genres.map((genre, index) => {
        if (index < 4) {
          return genre.name;
        }
      }).filter(item => item).join(" • ");

      const casts = this._credits.cast.map((cast, index) => {
        if (index < 6) {
          return cast.name;
        }
      }).filter(item => item).join(", ");

      const directers = this._credits.crew.map((crew, index) => {
        if (crew.known_for_department.toLowerCase().includes("direct")) {
          if (index < 4) {
            return crew.name;
          }
        }
      }).filter(item => item).join(", ");

      const writers = this._credits.crew.map((crew, index) => {
        if (crew.known_for_department.toLowerCase().includes("writ")) {
          if (index < 4) {
            return crew.name;
          }
        }
      }).filter(item => item).join(", ");

      const languages = this._details.spokenLanguages.map((language, index) => {
        if (index < 2) {
          return language.name;
        }
      }).filter(item => item).join(", ");

      this.patch({
        Header: {
          PosterAndButton: {
            Poster: {
              Image: {
                texture: Img(image).contain(300, 450)
              }
            }
          },
          Details: {
            IMDBRating: {
              label: "★  " + this._details.voteAverage
            },
            ReleaseAndDuration: {
              ReleaseDate: {
                text: {
                  text: this._details.releaseDate.toDateString()
                }
              },
              Duration: {
                text: {
                  text: " •  " + getFormattedDuration(this._details.runtime)
                }
              }
            },
            Title: {
              text: {
                text: this._details.title
              }
            },
            Overview: {
              text: {
                text: this._details.overview
              }
            },
            GenreLayout: {
              Genres: {
                text: {
                  text: genres
                }
              }
            },
            CastLayout: {
              Casts: {
                text: {
                  text: casts
                }
              }
            },
            DirectorLayout: {
              Director: {
                text: {
                  text: directers
                }
              }
            },
            WriterLayout: {
              Writer: {
                text: {
                  text: writers
                }
              }
            },
            LanguageLayout: {
              Language: {
                text: {
                  text: languages
                }
              }
            }
          }
        }
      });
    }
    /*duration(min){
       if (min != null || min !== 0){
           const hours = Math.floor(min / 60);
           const minutes = min % 60;
           return hours + " hr" + " " + minutes + " min";
       }else{
           return "null";
       }
    }*/


    _handleUp() {
      Router.focusWidget("MenuWithBackButton");
    }

    _getFocused() {
      return this.tag("Button");
    }

  }

  class TVDetails extends Lightning.Component {
    static _template() {
      return {
        x: 68,
        y: 200,
        flex: {
          direction: "column"
        },
        Header: {
          flex: {},
          PosterAndButton: {
            flex: {
              direction: "column"
            },
            Poster: {
              flexItem: {
                marginRight: 40
              },
              w: 300,
              h: 450,
              shader: {
                type: Lightning.shaders.RoundedRectangle,
                radius: 16
              },
              Image: {
                w: w => w,
                h: h => h
              }
            },
            Button: {
              flexItem: {
                marginTop: 30
              },
              type: Button,
              label: "Watch"
            }
          },
          Details: {
            flex: {
              direction: "column"
            },
            x: 90,
            transitions: {
              x: {
                duration: 1,
                timingFunction: 'cubic-bezier(0.20, 1.00, 0.80, 1.00)'
              }
            },
            IMDBRating: {
              flexItem: {},
              type: TextWithBox,
              label: "★  7.9"
            },
            ReleaseAndDuration: {
              y: 10,
              flex: {
                direction: "row"
              },
              ReleaseDate: {
                text: {
                  text: "2021-2022",
                  fontSize: 22
                }
              },
              Duration: {
                x: 10,
                text: {
                  textColor: Colors("white").get(),
                  text: " •  1 hr 20 min",
                  fontSize: 22,
                  fontFace: "SourceSansPro-Regular",
                  maxLines: 1
                }
              }
            },
            Title: {
              text: {
                fontSize: 64,
                fontFace: "SourceSansPro-Bold",
                wordWrapWidth: 960,
                maxLines: 2,
                lineHeight: 50
              }
            },
            Overview: {
              color: 0xFFD3D3D3,
              text: {
                fontSize: 22,
                fontFace: "SourceSansPro-Regular",
                wordWrapWidth: 960,
                lineHeight: 38
              }
            },
            GenreLayout: {
              y: 10,
              flex: {
                direction: "row"
              },
              GenreTitle: {
                flexItem: {},
                type: CustomTextBox,
                label: "Genre"
              },
              Genres: {
                x: 10,
                text: {
                  textColor: Colors("white").get(),
                  fontSize: 20,
                  fontFace: "SourceSansPro-Regular",
                  maxLines: 1
                }
              }
            },
            CastLayout: {
              y: 20,
              flex: {
                direction: "row"
              },
              CastTitle: {
                flexItem: {},
                type: CustomTextBox,
                label: "Cast"
              },
              Casts: {
                x: 10,
                text: {
                  textColor: Colors("white").get(),
                  fontSize: 20,
                  fontFace: "SourceSansPro-Regular",
                  maxLines: 1
                }
              }
            },
            CreatorLayout: {
              y: 30,
              flex: {
                direction: "row"
              },
              DirectorTitle: {
                flexItem: {},
                type: CustomTextBox,
                label: "Creators"
              },
              Creators: {
                x: 10,
                text: {
                  textColor: Colors("white").get(),
                  fontSize: 20,
                  fontFace: "SourceSansPro-Regular",
                  maxLines: 1
                }
              }
            },
            OriginalNetworkLayout: {
              y: 40,
              flex: {
                direction: "row"
              },
              WriterTitle: {
                flexItem: {},
                type: CustomTextBox,
                label: "Original Network"
              },
              OriginalNetwork: {
                x: 10,
                text: {
                  textColor: Colors("white").get(),
                  fontSize: 22,
                  fontFace: "SourceSansPro-Regular",
                  maxLines: 1
                }
              }
            },
            LanguageLayout: {
              y: 50,
              flex: {
                direction: "row"
              },
              LanguageTitle: {
                flexItem: {},
                type: CustomTextBox,
                label: "Language"
              },
              Language: {
                x: 10,
                text: {
                  textColor: Colors("white").get(),
                  fontSize: 22,
                  fontFace: "SourceSansPro-Regular",
                  maxLines: 1
                }
              }
            },
            TotalSeasonLayout: {
              y: 60,
              flex: {
                direction: "row"
              },
              LanguageTitle: {
                flexItem: {},
                type: CustomTextBox,
                label: "Total Season"
              },
              TotalSeasons: {
                x: 10,
                text: {
                  textColor: Colors("white").get(),
                  fontSize: 22,
                  fontFace: "SourceSansPro-Regular",
                  maxLines: 1
                }
              }
            },
            TotalEpisodeLayout: {
              y: 60,
              flex: {
                direction: "row"
              },
              LanguageTitle: {
                flexItem: {},
                type: CustomTextBox,
                label: "Total Episodes"
              },
              TotalEpisodes: {
                x: 10,
                text: {
                  textColor: Colors("white").get(),
                  fontSize: 22,
                  fontFace: "SourceSansPro-Regular",
                  maxLines: 1
                }
              }
            }
          }
        }
      };
    }

    _active() {
      this.widgets.menu.visible = false;
      this.application.emit("setItem", this._details);
      this.patch({
        Header: {
          Details: {
            smooth: {
              x: 40
            }
          }
        }
      });

      this._refocus();
    }

    _inactive() {
      this.tag("Details").setSmooth("x", 90);
    }

    set details(v) {
      this._details = v[0];
      this._credits = v[1];
      const image = getImgUrl(this._details.poster, 500);

      const genres = this._details.genres.map((genre, index) => {
        if (index < 4) {
          return genre.name;
        }
      }).filter(item => item).join(" • ");

      const casts = this._credits.cast.map((cast, index) => {
        if (index < 6) {
          return cast.name;
        }
      }).filter(item => item).join(", ");

      const creators = this._details.created_by.map((creator, index) => {
        if (index < 4) {
          return creator.name;
        }
      }).filter(item => item).join(", ");

      const originalNetworks = this._details.original_network.map((network, index) => {
        if (index < 4) {
          return network.name;
        }
      }).filter(item => item).join(", ");

      const languages = this._details.spokenLanguages.map((language, index) => {
        if (index < 2) {
          return language.name;
        }
      }).filter(item => item).join(", ");

      this.patch({
        Header: {
          PosterAndButton: {
            Poster: {
              Image: {
                texture: Img(image).contain(300, 450)
              }
            }
          },
          Details: {
            IMDBRating: {
              label: "★  " + this._details.voteAverage
            },
            ReleaseAndDuration: {
              ReleaseDate: {
                text: {
                  text: this.getYear(new Date(this._details.first_release_date).getFullYear(), new Date(this._details.last_release_date).getFullYear())
                }
              },
              Duration: {
                text: {
                  text: " •  " + getFormattedDuration(this._details.runtime)
                }
              }
            },
            Title: {
              text: {
                text: this._details.title
              }
            },
            Overview: {
              text: {
                text: this._details.overview
              }
            },
            GenreLayout: {
              Genres: {
                text: {
                  text: genres
                }
              }
            },
            CastLayout: {
              Casts: {
                text: {
                  text: casts
                }
              }
            },
            CreatorLayout: {
              Creators: {
                text: {
                  text: creators
                }
              }
            },
            OriginalNetworkLayout: {
              OriginalNetwork: {
                text: {
                  text: originalNetworks
                }
              }
            },
            LanguageLayout: {
              Language: {
                text: {
                  text: languages
                }
              }
            },
            TotalSeasonLayout: {
              TotalSeasons: {
                text: {
                  text: this._details.total_seasons
                }
              }
            },
            TotalEpisodeLayout: {
              TotalEpisodes: {
                text: {
                  text: this._details.total_episodes
                }
              }
            }
          }
        }
      });
    }
    /*duration(min){
       if (min != null || min !== 0){
           const hours = Math.floor(min / 60);
           const minutes = min % 60;
           return hours + " hr" + " " + minutes + " min";
       }else{
           return "null";
       }
    }*/


    getYear(firstReleaseDate, lastReleaseDate) {
      return firstReleaseDate === lastReleaseDate ? firstReleaseDate : firstReleaseDate + "-" + lastReleaseDate;
    }

    _handleUp() {
      Router.focusWidget("MenuWithBackButton");
    }

    _getFocused() {
      return this.tag("Button");
    }

  }

  class NoiseShader extends Lightning.shaders.WebGLDefaultShader {
    constructor(context) {
      super(context);
      this._time = 0;
    }

    set time(v) {
      this._time = v;
      this.redraw();
    }

    setupUniforms(operation) {
      super.setupUniforms(operation);
      const owner = operation.shaderOwner;
      const renderPrecision = this.ctx.stage.getRenderPrecision();

      this._setUniform('time', this._time, this.gl.uniform1f);

      this._setUniform('resolution', new Float32Array([owner._w * renderPrecision, owner._h * renderPrecision]), this.gl.uniform2fv);
    }

  }
  NoiseShader.fragmentShaderSource = `
    #ifdef GL_ES
    precision lowp float;
    #endif

    #define PI 3.14159265359

    varying vec2 vTextureCoord;
    varying vec4 vColor;

    uniform sampler2D uSampler;
    uniform vec2 resolution;
    uniform float time;

    float random (in vec2 st, in float time) {
      return fract(sin(dot(st.xy,
                           vec2(12.9898,78.233)))
                   * (43758.5453123 + time/10.0));
    }

    void main() {
        vec4 color = texture2D(uSampler, vTextureCoord) * vColor;

        float random = random(vTextureCoord.xy/2.5, time);
        color = vec4(random * random * random * random);

        gl_FragColor = color;
    }
`;

  class ErrorScreen extends Lightning.Component {
    static _template() {
      return {
        w: w => w,
        h: h => h,
        Background: {
          w: w => w,
          h: h => h,
          rect: true,
          color: 0xff000000,
          shader: {
            type: NoiseShader,
            time: 0
          }
        },
        Popup: {
          x: w => w / 2,
          y: h => h / 2,
          mount: 0.5,
          texture: Lightning.Tools.getRoundRect(700, 220, 8, 0, null, true, 0xbb000000),
          flex: {
            direction: 'column',
            alignItems: 'center'
          },
          Title: {
            flexItem: {
              marginTop: 40
            },
            text: {
              text: 'ERROR',
              fontSize: 50
            }
          },
          Subtitle: {
            text: {
              text: "Failed To Open Video, Please Try Again!",
              fontSize: 35
            }
          }
        }
      };
    }

    updateNoise() {
      const time = new Date().getTime() % 1000;
      this.patch({
        Background: {
          shader: {
            time
          }
        }
      });
    }

    _active() {
      this._updateNoiseInterval = setInterval(() => this.updateNoise(), 100);
    }

    _inactive() {
      clearInterval(this._updateNoiseInterval);
    }

  }

  const formatTime = seconds => {
    if (seconds === Infinity) return '--';
    return ('0' + Math.floor(seconds / 60)).slice(-2) + ':' + ('0' + Math.floor(seconds % 60)).slice(-2);
  };
  const videos = ['http://video.metrological.com/surfing.mp4'];

  class IconButton extends Lightning.Component {
    static _template() {
      return {
        h: 60,
        w: 60,
        color: 0xff404249,
        rect: true,
        rtt: true,
        shader: {
          type: Lightning.shaders.RoundedRectangle,
          radius: 30
        },
        Icon: {
          w: 20,
          h: 20,
          x: 20,
          y: 20
        },
        Label: {
          x: w => w / 2,
          y: h => h / 2,
          mount: 0.5,
          text: {
            text: '',
            textColor: 0xff000000
          }
        }
      };
    }

    set index(v) {
      this.x = v * 70;
    }

    set icon(v) {
      if (v) {
        this.tag('Icon').src = Utils.asset('images/' + v + '.png');
      }
    }

    set label(v) {
      if (v) {
        this.tag('Label').text.text = v;
      }
    }

    _handleEnter() {
      this.action && this.fireAncestors(this.action);
    }

    _focus() {
      this.setSmooth('color', 0xFFE50914);
    }

    _unfocus() {
      this.setSmooth('color', 0xff404249);
    }

  }

  class ProgressBar extends Lightning.Component {
    static _template() {
      return {
        h: 30,
        w: w => w,
        Progress: {
          color: 0xff404249,
          rect: true,
          w: w => w - 200,
          h: h => h,
          shader: {
            type: Lightning.shaders.RoundedRectangle,
            radius: 15
          },
          InnerProgress: {
            rect: true,
            color: 0xFFE50914,
            x: 8,
            w: 0,
            y: h => (h - 16) / 2,
            h: 16,
            shader: {
              type: Lightning.shaders.RoundedRectangle,
              radius: 8
            }
          }
        },
        Timer: {
          color: 0xFFE50914,
          x: w => w - 180,
          w: 180,
          rect: true,
          h: 30,
          shader: {
            type: Lightning.shaders.RoundedRectangle,
            radius: 15
          },
          Text: {
            x: 32,
            y: 3,
            text: {
              textColor: Colors('white').get(),
              fontSize: 20,
              fontStyle: "bold"
            }
          }
        }
      };
    }

    set progress(v) {
      this.tag('Progress.InnerProgress').setSmooth('w', (this.renderWidth - 16) * v);
    }

    set duration(v) {
      this._duration = v;
    }

    get duration() {
      return this._duration || 0.0001;
    }

    set currentTime(v) {
      const ratio = Math.round(v / this.duration * 1000) / 1000;
      this.tag('Progress.InnerProgress').setSmooth('w', (this.tag('Progress').renderWidth - 16) * ratio);
      this.tag('Timer.Text').text = [formatTime(v || 0), formatTime(this.duration || 0)].join(' / ');
    }

  }

  class Background extends Lightning.Component {
    static _template() {
      return {
        Backgrounds: {
          BackgroundA: {
            colorTop: 0xff717171,
            colorBottom: 0xff000000,
            scale: 1.2,
            alpha: 0,
            transitions: {
              zIndex: {
                duration: 2,
                timingFunction: 'cubic-bezier(0.20, 1.00, 0.80, 1.00)'
              },
              alpha: {
                duration: 2,
                timingFunction: 'cubic-bezier(0.20, 1.00, 0.80, 1.00)'
              },
              scale: {
                duration: 2,
                timingFunction: 'cubic-bezier(0.20, 1.00, 0.80, 1.00)'
              }
            }
          },
          BackgroundB: {
            colorTop: 0xff717171,
            colorBottom: 0xff000000,
            transitions: {
              zIndex: {
                duration: 2,
                timingFunction: 'cubic-bezier(0.20, 1.00, 0.80, 1.00)'
              },
              alpha: {
                duration: 2,
                timingFunction: 'cubic-bezier(0.20, 1.00, 0.80, 1.00)'
              },
              scale: {
                duration: 2,
                timingFunction: 'cubic-bezier(0.20, 1.00, 0.80, 1.00)'
              }
            }
          }
        }
      };
    }

    _init() {
      this._backgroundIndex = 0;
      this.application.on("setItem", item => {
        if (item === this._item) {
          return;
        }

        this._item = item;
        const image = getImgUrl(item.background, 1280);

        this.tag("Backgrounds").children[this._backgroundIndex].patch({
          texture: Img(image).contain(1920, 1080),
          smooth: {
            scale: 1,
            alpha: 1
          }
        });

        this._backgroundIndex ^= 1;

        this.tag("Backgrounds").children[this._backgroundIndex].patch({
          texture: null,
          smooth: {
            scale: 1.2,
            alpha: 0
          }
        });
      });
      this.application.on("page", isHide => {
        if (isHide) {
          this.tag("Backgrounds").patch({
            visible: false
          });
        } else {
          this.tag("Backgrounds").patch({
            visible: true
          });
        }
      });
    }

  }

  const bgColor = 0xff404249;
  const buttons = [{
    icon: 'play',
    action: '$playPause',
    ref: 'PlayPause'
  }, {
    icon: 'stop',
    action: '$stop'
  }];
  const interfaceTimeout = 5000;
  class Player extends Lightning.Component {
    static _template() {
      return {
        w: 1920,
        h: 1080,
        color: bgColor,
        rect: true,
        Text: {
          x: w => w / 2,
          y: h => h / 2,
          mount: 0.5,
          text: {
            text: 'Wait, Video Starts Soon!',
            textColor: 0xffffffff
          }
        },
        TopHeader: {
          w: 1920,
          h: 130,
          rect: true,
          color: 0xff404249,
          flex: {
            direction: "row"
          },
          BackButton: {
            x: 68,
            y: 30,
            type: ImageButton,
            icon: "ic_back"
          },
          Title: {
            x: 100,
            y: 45,
            text: {
              text: "Hello How Are You?",
              fontSize: 30,
              fontFace: "SourceSansPro-Bold",
              wordWrapWidth: 960,
              maxLines: 1
            }
          }
        },
        ErrorScreen: {
          type: ErrorScreen,
          alpha: 0
        },
        Ui: {
          x: 20,
          y: 910,
          w: w => w - 40,
          mountY: 1,
          Buttons: {
            flex: {
              direction: 'row'
            }
          },
          ProgressBar: {
            y: 70,
            type: ProgressBar
          }
        }
      };
    }

    _init() {
      this.tag;
      this._index = 0;
      this._videoIndex = 0; // Initially video control interface is visible

      this._interfaceVisible = true; // This variable will store timeout id for the interface hide functionality

      this._timeout = null; // Fill Ui.Buttons tag with buttons from the buttons array

      this.tag('Ui.Buttons').children = buttons.map((button, index) => ({
        type: IconButton,
        icon: button.icon,
        action: button.action,
        ref: button.ref || 'Button' + index,
        flexItem: {
          marginRight: 20
        }
      }));
      this.$playPause(false);
      this.application.emit("page", true);
    }

    _toggleInterface(visible) {
      this.widgets.visible = false;
      this.patch({
        Ui: {
          smooth: {
            y: [visible ? 910 : 960],
            alpha: [visible ? 1 : 0]
          }
        },
        TopHeader: {
          smooth: {
            alpha: [visible ? 1 : 0]
          }
        }
      });
      this.tag('Ui').transition('y').on('finish', () => {
        this._interfaceVisible = visible;
      });

      if (visible) {
        this._setInterfaceTimeout();
      }
    }

    _setInterfaceTimeout() {
      // Clear timeout if it already exists
      if (this._timeout) {
        clearTimeout(this._timeout);
      }

      this._timeout = setTimeout(() => {
        this._toggleInterface(false);
      }, interfaceTimeout);
    }

    _active() {
      // Show video interface
      this._toggleInterface(true); // Set this object to receive VideoPlayer events


      VideoPlayer.consumer(this);
    }

    _inactive() {
      // Cleanup player and ui
      VideoPlayer.clear();
      this.patch({
        color: bgColor,
        Text: {
          alpha: 1
        },
        ErrorScreen: {
          alpha: 0
        }
      });
      this.playing = false;
      this.tag('Ui.ProgressBar').duration = 0;
      this.tag('Ui.ProgressBar').currentTime = 0;
    }

    _focus() {
      // Show video interface
      this._toggleInterface(true);
    } // Capture every key and toggle interface. If it is visible, pass event to event handlers


    _captureKey() {
      this._toggleInterface(true);

      return !this._interfaceVisible;
    }

    _handleUp() {
      this._index = this._index - 1;
    }

    _handleLeft() {
      this._index = Math.max(0, this._index - 1);
    }

    _handleRight() {
      this._index = Math.min(this.tag('Ui.Buttons').children.length - 1, this._index + 1);
    }

    _getFocused() {
      return this.tag('Ui.Buttons').children[this._index];
    }

    set playing(v) {
      this.tag('Ui.Buttons.PlayPause').icon = v === true ? 'pause' : 'play';
    } // Button actions


    $playPause(next = false) {
      // If next is true, clear VideoPlayer (which also sets src to null)
      next === true && VideoPlayer.clear();

      if (!VideoPlayer.src || VideoPlayer.src === 'error-video-url') {
        // Player first or second video of the videos list, with a chance of 33% to show error screen
        this._videoIndex = (this._videoIndex + 1) % 2;
        Math.random() > 0.66 ? 'error-video-url' : videos[this._videoIndex];
        VideoPlayer.open("http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4");
      } else {
        VideoPlayer.playPause();
      }
    }

    $stop() {
      VideoPlayer.clear();
    } // Hooks for VideoPlayer events


    $videoPlayerPlaying() {
      this.patch({
        smooth: {
          color: [0x00000000]
        },
        Text: {
          smooth: {
            alpha: [0]
          }
        },
        ErrorScreen: {
          smooth: {
            alpha: [0]
          }
        }
      });
      this.playing = true;
    }

    $videoPlayerPause() {
      this.playing = false;
    }

    $videoPlayerAbort() {
      this.patch({
        smooth: {
          color: [bgColor]
        },
        Text: {
          smooth: {
            alpha: [1]
          }
        }
      });
      this.playing = false;
      this.tag('Ui.ProgressBar').duration = 0;
      this.tag('Ui.ProgressBar').currentTime = 0;
    }

    $videoPlayerEnded() {
      // When current video ends, open next video
      this.$playPause(false);
    }

    $videoPlayerTimeUpdate() {
      this.tag('Ui.ProgressBar').currentTime = VideoPlayer.currentTime;
    }

    $videoPlayerLoadedMetadata() {
      this.tag('Ui.ProgressBar').duration = VideoPlayer.duration;
    }

    $videoPlayerError() {
      this.patch({
        ErrorScreen: {
          smooth: {
            alpha: [1]
          }
        },
        Text: {
          smooth: {
            alpha: [0]
          }
        }
      });
    }

  }

  class Error$1 extends Lightning.Component {
    static _template() {
      return {
        rect: true,
        w: 1920,
        h: 1080,
        color: 0xffb70606,
        Label: {
          x: 100,
          y: 100,
          text: {
            text: 'Error',
            fontSize: 22
          }
        }
      };
    }

    _handleEnter() {
      Router.navigate("main");
    }

    _focus() {
      console.log("focus error page");
    }

    set error(obj) {
      const {
        page,
        error
      } = obj;
      console.log(page, error);
      const errorMessage = `
error while loading page: ${page.constructor.name}
press enter to navigate to home
--
loaded via hash: ${page[Symbol.for("hash")]}
resulted in route: ${page[Symbol.for("route")]}
--
${error.toString()}`;
      this.tag("Label").text = errorMessage;
    }

    easing() {
      return "up";
    }

  }

  class NotFound extends Lightning.Component {
    static _template() {
      return {
        Label: {
          x: 960,
          y: 530,
          text: {
            text: 'Page not found!'
          }
        }
      };
    }

  }

  class Splash extends Lightning.Component {
    static _template() {
      return {
        Background: {
          w: 1920,
          h: 1080,
          colorBottom: 0xff000000,
          scale: 1.4,
          src: Utils.asset("images/background.jpg"),
          transitions: {
            scale: {
              duration: 1,
              timingFunction: 'cubic-bezier(0.20, 1.00, 0.80, 1.00)'
            }
          }
        },
        Rectangle: {
          w: 1920,
          h: 1080,
          color: 0xff000000,
          alpha: 0.8,
          rect: true
        },
        Logo: {
          src: Utils.asset("images/logo.png"),
          mount: .5,
          x: 960,
          y: 640,
          alpha: 0.001,
          //color: Colors('black').get(),
          transitions: {
            alpha: {
              duration: 1,
              timingFunction: 'cubic-bezier(0.20, 1.00, 0.80, 1.00)'
            },
            y: {
              duration: 1,
              timingFunction: 'cubic-bezier(0.20, 1.00, 0.80, 1.00)'
            }
          }
        },
        Spinner: {
          src: Utils.asset("images/spinner.png"),
          mountX: .5,
          x: 960,
          y: 920,
          alpha: 0.001,
          color: 0xaaffffff,
          transitions: {
            alpha: {
              duration: 1,
              timingFunction: 'cubic-bezier(0.20, 1.00, 0.80, 1.00)'
            }
          }
        }
      };
    }

    _init() {
      this.tag("Logo").on("txLoaded", () => {
        this.tag("Logo").setSmooth("alpha", 1);
        this.tag("Logo").setSmooth("y", 540);
        this.tag("Background").setSmooth("scale", 1);
      });
      this.tag("Spinner").on("txLoaded", () => {
        this.tag("Spinner").setSmooth("alpha", 1);

        this._spinnerAnimation.start();
      });
      this.application.on("booted", () => {
        Router.navigate("movies", false);
      });
      this._spinnerAnimation = this.animation({
        duration: 1,
        repeat: -1,
        actions: [{
          t: 'Spinner',
          p: "rotation",
          sm: 0,
          v: function (t) {
            if (t < .125) {
              return 45 * (Math.PI / 180);
            } else if (t < .250) {
              return 90 * (Math.PI / 180);
            } else if (t < .375) {
              return 135 * (Math.PI / 180);
            } else if (t < .500) {
              return 180 * (Math.PI / 180);
            } else if (t < .625) {
              return 225 * (Math.PI / 180);
            } else if (t < .750) {
              return 270 * (Math.PI / 180);
            } else if (t < .875) {
              return 315 * (Math.PI / 180);
            } else if (t < 1) {
              return 360 * (Math.PI / 180);
            }
          }
        }]
      });
      setTimeout(() => {
        Router.navigate("movies", false);
      }, 3000);
    }

    _active() {
      this.widgets.menu.visible = false;
    }

    _inactive() {
      this._spinnerAnimation.stop();
    }

  }

  class Container {
    constructor(obj, type, genres) {
      this._page = obj.page;
      this._total_results = obj.total_results;
      this._type = type;
      this._items = obj.results.map(item => {
        switch (type) {
          case "movie":
            let movie = new Movie(item, genres); //movie.runtime = runtime

            return movie;

          case "tv":
            return new Tv(item, genres);
        }
      });
    }

    get page() {
      return this._page;
    }

    get total() {
      return this._total_results;
    }

    get type() {
      return this._type;
    }

    get items() {
      return this._items;
    }

  }

  class Movie {
    constructor(obj, genres) {
      this._adult = obj.adult;
      this._backdrop_path = obj.backdrop_path;
      this._genres = obj.genre_ids.map(id => {
        return genres.find(genre => {
          return genre.id === id;
        });
      }).filter(item => item);
      this._id = obj.id;
      this._original_language = obj.original_language;
      this._overview = obj.overview;
      this._popularity = obj.popularity;
      this._poster_path = obj.poster_path;
      this._release_date = obj.release_date;
      this._runtime = obj.runtime;
      this._title = obj.title;
      this._type = "movie";
      this._video = obj.video;
      this._vote_average = obj.vote_average;
      this._vote_count = obj.vote_count;
    }

    get adult() {
      return this._adult;
    }

    get background() {
      return this._backdrop_path;
    }

    get genres() {
      return this._genres;
    }

    get id() {
      return this._id;
    }

    get originalLanguage() {
      return this._original_language;
    }

    get overview() {
      return this._overview;
    }

    get popularity() {
      return this._popularity;
    }

    get poster() {
      return this._poster_path;
    }

    get releaseDate() {
      return this._release_date;
    }

    set runtime(min) {
      this._runtime = min;
    }

    get runtime() {
      return this._runtime;
    }

    get title() {
      return this._title;
    }

    get type() {
      return this._type;
    }

    get video() {
      return this._video;
    }

    get voteAverage() {
      return this._vote_average;
    }

    get voteCount() {
      return this._vote_count;
    }

  }

  class Tv {
    constructor(obj, genres) {
      this._backdrop_path = obj.backdrop_path;
      this._first_air_date = obj.first_air_date;
      this._genres = obj.genre_ids.map(id => {
        return genres.find(genre => {
          return genre.id === id;
        });
      }).filter(item => item);
      this._id = obj.id;
      this._name = obj.name;
      this._origin_country = obj.origin_country;
      this._original_language = obj.original_language;
      this._original_name = obj.original_name;
      this._overview = obj.overview;
      this._popularity = obj.popularity;
      this._poster_path = obj.poster_path;
      this._title = obj.name;
      this._type = "tv";
      this._vote_average = obj.vote_average;
      this._vote_count = obj.vote_count;
    }

    get background() {
      return this._backdrop_path;
    }

    get firstAirDate() {
      return this._first_air_date;
    }

    get genres() {
      return this._genres;
    }

    get id() {
      return this._id;
    }

    get name() {
      return this._name;
    }

    get originalCountry() {
      return this._origin_country;
    }

    get originalLanguage() {
      return this._original_language;
    }

    get originalName() {
      return this._original_name;
    }

    get overview() {
      return this._overview;
    }

    get title() {
      return this._title;
    }

    get type() {
      return this._type;
    }

    get popularity() {
      return this._popularity;
    }

    get poster() {
      return this._poster_path;
    }

    get voteAverage() {
      return this._vote_average;
    }

    get voteCount() {
      return this._vote_count;
    }

  }

  class Details$2 {
    constructor(obj) {
      this._adult = obj.adult;
      this._backdrop_path = obj.backdrop_path;
      this._belong_to_collection = obj.belongs_to_collection;
      this._budget = obj.budget;
      this._genres = obj.genres;
      this._homepage = obj.homepage;
      this._id = obj.id;
      this._imdb_id = obj.imdb_id;
      this._original_language = obj.original_language;
      this._original_title = obj.original_title;
      this._overview = obj.overview;
      this._popularity = obj.popularity;
      this._poster_path = obj.poster_path;
      this._production_companies = obj.production_companies;
      this._production_countries = obj.production_countries;
      this._release_date = new Date(obj.release_date || obj.first_air_date);
      this._revenue = obj.revenue;
      this._runtime = obj.runtime;
      this._spoken_languages = obj.spoken_languages;
      this._status = obj.status;
      this._tagline = obj.tagline;
      this._title = obj.title || obj.name;
      this._video = obj._video;
      this._vote_average = obj.vote_average;
      this._vote_count = obj.vote_count;
    }

    get adult() {
      return this._adult;
    }

    get background() {
      return this._backdrop_path;
    }

    get belongToCollection() {
      return this._belong_to_collection;
    }

    get budget() {
      return this._budget;
    }

    get genres() {
      return this._genres;
    }

    get homepage() {
      return this._homepage;
    }

    get id() {
      return this._id;
    }

    get imdbId() {
      return this._imdb_id;
    }

    get originalLanguage() {
      return this._original_language;
    }

    get originalTitle() {
      return this._original_title;
    }

    get overview() {
      return this._overview;
    }

    get popularity() {
      return this._popularity;
    }

    get poster() {
      return this._poster_path;
    }

    get productionCompanies() {
      return this._production_companies;
    }

    get productionCountries() {
      return this._production_countries;
    }

    get releaseDate() {
      return this._release_date;
    }

    get revenue() {
      return this._revenue;
    }

    get runtime() {
      return this._runtime;
    }

    get spokenLanguages() {
      return this._spoken_languages;
    }

    get status() {
      return this._status;
    }

    get tagline() {
      return this._tagline;
    }

    get title() {
      return this._title;
    }

    get video() {
      return this._video;
    }

    get voteAverage() {
      return this._vote_average;
    }

    get voteCount() {
      return this._vote_count;
    }

  }

  class Details$1 {
    constructor(obj) {
      this._adult = obj.adult;
      this._backdrop_path = obj.backdrop_path;
      this._belong_to_collection = obj.belongs_to_collection;
      this._budget = obj.budget;
      this._genres = obj.genres;
      this._homepage = obj.homepage;
      this._id = obj.id;
      this._imdb_id = obj.imdb_id;
      this._original_language = obj.original_language;
      this._original_title = obj.original_title;
      this._overview = obj.overview;
      this._popularity = obj.popularity;
      this._poster_path = obj.poster_path;
      this._production_companies = obj.production_companies;
      this._production_countries = obj.production_countries;
      this._release_date = new Date(obj.release_date || obj.first_air_date);
      this._revenue = obj.revenue;
      this._runtime = obj.episode_run_time;
      this._spoken_languages = obj.spoken_languages;
      this._status = obj.status;
      this._tagline = obj.tagline;
      this._title = obj.title || obj.name;
      this._video = obj._video;
      this._vote_average = obj.vote_average;
      this._vote_count = obj.vote_count;
      this._created_by = obj.created_by;
      this._first_release_date = obj.first_air_date;
      this._last_release_date = obj.last_air_date;
      this._total_seasons = obj.number_of_seasons;
      this._total_episodes = obj.number_of_episodes;
      this._original_network = obj.networks;
    }

    get adult() {
      return this._adult;
    }

    get background() {
      return this._backdrop_path;
    }

    get belongToCollection() {
      return this._belong_to_collection;
    }

    get budget() {
      return this._budget;
    }

    get genres() {
      return this._genres;
    }

    get homepage() {
      return this._homepage;
    }

    get id() {
      return this._id;
    }

    get imdbId() {
      return this._imdb_id;
    }

    get originalLanguage() {
      return this._original_language;
    }

    get originalTitle() {
      return this._original_title;
    }

    get overview() {
      return this._overview;
    }

    get popularity() {
      return this._popularity;
    }

    get poster() {
      return this._poster_path;
    }

    get productionCompanies() {
      return this._production_companies;
    }

    get productionCountries() {
      return this._production_countries;
    }

    get releaseDate() {
      return this._release_date;
    }

    get revenue() {
      return this._revenue;
    }

    get runtime() {
      return this._runtime;
    }

    get spokenLanguages() {
      return this._spoken_languages;
    }

    get status() {
      return this._status;
    }

    get tagline() {
      return this._tagline;
    }

    get title() {
      return this._title;
    }

    get video() {
      return this._video;
    }

    get voteAverage() {
      return this._vote_average;
    }

    get voteCount() {
      return this._vote_count;
    }

    get created_by() {
      return this._created_by;
    }

    get first_release_date() {
      return this._first_release_date;
    }

    get last_release_date() {
      return this._last_release_date;
    }

    get total_seasons() {
      return this._total_seasons;
    }

    get total_episodes() {
      return this._total_episodes;
    }

    get original_network() {
      return this._original_network;
    }

  }

  class Details {
    constructor(obj) {
      this._id = obj.id;
      this._cast = obj.cast;
      this._crew = obj.crew;
    }

    get id() {
      return this._id;
    }

    get cast() {
      return this._cast;
    }

    set cast(value) {
      this._cast = value;
    }

    get crew() {
      return this._crew;
    }

    set crew(value) {
      this._crew = value;
    }

  }

  class Item extends Lightning.Component {
    static _template() {
      return {
        w: Item.width,
        h: Item.height,
        Poster: {
          w: w => w,
          h: h => h,
          pivotY: .7,
          rtt: true,
          shader: {
            type: Lightning.shaders.RoundedRectangle,
            radius: 10
          },
          transitions: {
            w: {
              duration: .6,
              timingFunction: 'cubic-bezier(0.20, 1.00, 0.80, 1.00)'
            },
            h: {
              duration: .6,
              timingFunction: 'cubic-bezier(0.20, 1.00, 0.80, 1.00)'
            }
          },
          Image: {
            w: w => w,
            h: h => h,
            scale: 1.2,
            color: 0xff2f2f2f,
            transitions: {
              w: {
                duration: .6,
                timingFunction: 'cubic-bezier(0.20, 1.00, 0.80, 1.00)'
              },
              h: {
                duration: .6,
                timingFunction: 'cubic-bezier(0.20, 1.00, 0.80, 1.00)'
              }
            }
          },
          BorderLeft: {
            w: 2,
            h: h => h,
            rect: true,
            color: 0x40ffffff
          }
          /*Rating: {
              mountX: .5, mountY: 1, x: w=>w / 2, y: 360,
              transitions: {
                  y: {duration: .6, timingFunction: 'cubic-bezier(0.20, 1.00, 0.80, 1.00)'}
              },
              texture: Lightning.Tools.getRoundRect(70, 70, 35, 0, 0x00ffffff, true, 0xff081C22),
              RatingNumber: {
                  mount: .5, x: w=>w / 2 + 4, y: h=>h / 2 + 2,
                  flex: {},
                  Number: {
                      text: {text: '0', fontSize: 26, fontFace: "SourceSansPro-Bold"}
                  },
                  Percentage: {
                      flexItem: {marginTop: 6},
                      text: {text: '%', fontSize: 12, fontFace: "SourceSansPro-Regular"}
                  }
              },
              RatingCircle: {
                  rect:true, color: 0x00ffffff, rtt:true, mount: .5, x: 36, y: 36, w: 60, h: 60, rotation: Math.PI * .5,
                  shader: {
                      type: CircleProgressShader, radius: 30, width: 3, angle: 0.0001, smooth: 0.005, color: 0xffd1215c, backgroundColor: 0xff204529
                  }
              }
          }*/

        }
      };
    }

    _init() {
      /*this._angle = 0.001;
      this._ratingNumber = 0;
       this._focusAnimation = this.tag("Rating").animation({
          duration: 1.2, stopDuration: .2, stopMethod: "immediate", actions:[
              {t: 'RatingCircle', p:'shader.angle', rv: 0.0001, v: () => {
                      if (this._angle < this._item.voteAverage / 10) {
                          this._angle += 0.01;
                      }
                       if (this._angle < 0.4) {
                          this.tag("RatingCircle").shader.color = 0xffd1215c;
                      } else if (this._angle > 0.4 && this._angle < 0.6) {
                          this.tag("RatingCircle").shader.color = 0xffd2d531;
                      } else if (this._angle > 0.6) {
                          this.tag("RatingCircle").shader.color = 0xff21d07a;
                      }
                       return this._angle;
                  }},
              {t: 'Number', p:'text.text', rv: 0, v: () => {
                      if (this._ratingNumber < this._item.voteAverage * 10) {
                          this._ratingNumber += 1;
                      }
                      return `${Math.floor(this._ratingNumber)}`;
                  }}
          ]
      });*/
    }

    set item(v) {
      this._item = v;
      const image = getImgUrl(this._item.poster, 500);
      this.patch({
        Poster: {
          Image: {
            texture: Img(image).contain(180 * 1.2, 270 * 1.2)
          }
        }
      });
    }

    set index(v) {
      this._index = v;

      if (this._index < 8) {
        this.tag("Image").color = 0xffffffff;
      }
    }

    _focus() {
      this._angle = 0.001;
      this._ratingNumber = 0;
      this.patch({
        Poster: {
          smooth: {
            scale: 1.2
          },
          Image: {
            smooth: {
              scale: 1
            }
          }
          /*Rating: {
              smooth: {y: 250}
          }*/

        }
      }); //this._focusAnimation.start();

      this.application.emit("setItem", this._item);
    }

    _unfocus() {
      this.patch({
        Poster: {
          smooth: {
            scale: 1
          },
          Image: {
            smooth: {
              scale: 1.2
            }
          }
          /*Rating: {
              smooth: {y: 360}
          }*/

        }
      }); //this._focusAnimation.stop();
    }

    static get width() {
      return 180;
    }

    static get height() {
      return 270;
    }

    static get offset() {
      return 40;
    }

  }

  class ItemWrapper extends Lightning.Component {
    static _template() {
      return {
        clipbox: true
      };
    }

    set index(v) {
      this._index = v;
    }

    get index() {
      return this._index;
    }

    set construct(v) {
      this._construct = v;
    }

    get construct() {
      return this._construct;
    }

    set item(obj) {
      this._item = obj;
    }

    get item() {
      return this._item;
    }

    set lngItem(v) {
      this._realItem = v;
    }

    get lngItem() {
      return this._realItem;
    }

    get child() {
      return this.children[0];
    }

    create() {
      const item = this._item;
      this.children = [{
        type: this._construct,
        item,
        index: this._index
      }]; // if item is flagged and has focus, notify parent
      // that focuspath can be recalculated

      if (this._notifyOnItemCreation && this.hasFocus()) {
        this._refocus();
      }
    }

    _firstActive() {
      this.create();

      if (!ItemWrapper.FIRST_CREATED) {
        this.fireAncestors("$firstItemCreated");
        ItemWrapper.FIRST_CREATED = true;
      }
    }

    _getFocused() {
      // due to lazy creation there is the possibility that
      // an component receives focus before the actual item
      // is created, therefore we set a flag
      if (!this.child) {
        this._notifyOnItemCreation = true;
      } else {
        return this.child;
      }
    }

  }
  ItemWrapper.FIRST_CREATED = false;

  class List extends Lightning.Component {
    static _template() {
      return {
        Items: {
          y: 154,
          forceZIndexContext: true,
          boundsMargin: [500, 100, 500, 100],
          transitions: {
            x: {
              duration: .3,
              timingFunction: 'cubic-bezier(0.20, 1.00, 0.80, 1.00)'
            }
          }
        },
        Focus: {
          x: -32,
          y: 102,
          color: 0xFFE50914,
          texture: Lightning.Tools.getRoundRect(236, 344, 16, 5, 0xffffffff, true, 0x00ffffff)
        },
        About: {
          x: -32,
          y: 0,
          mountY: 1,
          flex: {
            direction: "column"
          },
          RowTrendingAndDuration: {
            flex: {
              direction: "row"
            },
            wordWrapWidth: 960,
            Trending: {
              text: {
                text: "#Trending ",
                fontSize: 25,
                fontFace: "SourceSansPro-Bold",
                maxLines: 1,
                fontStyle: "italic"
              }
            },
            Duration: {
              x: 10,
              text: {
                textColor: Colors("white").get(),
                text: " •  1 hr 20 min",
                fontSize: 22,
                fontFace: "SourceSansPro-Regular",
                maxLines: 1
              }
            }
          },
          Title: {
            marginTop: 10,
            text: {
              fontSize: 50,
              fontFace: "SourceSansPro-Bold",
              wordWrapWidth: 960,
              maxLines: 1
            }
          },
          Genres: {
            flexItem: {
              marginTop: -10
            },
            color: 0xFFE50914,
            text: {
              fontSize: 22,
              fontFace: "SourceSansPro-Regular",
              wordWrapWidth: 960,
              maxLines: 1
            }
          },
          Overview: {
            color: 0xFFD3D3D3,
            text: {
              fontSize: 22,
              fontFace: "SourceSansPro-Regular",
              wordWrapWidth: 960,
              lineHeight: 38
            }
          }
        }
      };
    }

    _construct() {
      this._index = 0;
    }

    _init() {
      this.tag("Title").on("txLoaded", () => {
        this.tag("About").setSmooth("y", 90, {
          duration: 1,
          timingFunction: 'cubic-bezier(0.20, 1.00, 0.80, 1.00)'
        });
      });
      this.application.on("setItem", async item => {
        if (item === this._item) {
          return;
        }

        this._item = item;
        const genres = item.genres.map((genre, index) => {
          if (index < 2) {
            return genre.name;
          }
        }).filter(item => item).join(" • ");
        this.tag("About").setSmooth("y", 60, {
          duration: 0
        });
        let randomColor = this.randomColor;
        this.patch({
          Focus: {
            color: randomColor
          },
          About: {
            RowTrendingAndDuration: {
              Trending: {
                text: {
                  textColor: randomColor,
                  text: "#Popular " + (this._index + 1)
                }
              },
              Duration: {
                text: {
                  text: " •  " + getFormattedDuration(await getRuntime(item.type, item.id))
                }
              }
            },
            Title: {
              text: {
                text: item.title
              }
            },
            Genres: {
              text: {
                text: genres
              }
            },
            Overview: {
              text: {
                text: item.overview
              }
            }
          }
        });
      });
    }

    get activeItem() {
      return this.tag("Items").children[this._index];
    }

    set container(v) {
      this._container = v;
    }

    get container() {
      return this._container;
    }

    set itemConstruct(v) {
      this._itemConstruct = v;
    }

    get itemConstruct() {
      return this._itemConstruct;
    }

    get getRealComponent() {
      return this.activeItem.child;
    }

    get realWidth() {
      let construct = this._itemConstruct;
      return this._items.length * (construct.width + construct.offset);
    }

    set items(v) {
      let construct = this._itemConstruct;
      this._items = v; //@warn: since we lazy create all the items
      // we need to set the itemWrapper flag to false
      // so it can notify that the first item is created

      ItemWrapper.FIRST_CREATED = false;
      this.tag("Items").patch({
        children: this._createItems({
          items: this._items,
          construct
        })
      });
    }

    get items() {
      return this._items;
    }

    get randomColor() {
      let colorNameArray = ["white", "magenta", "yellow", "green", "blue", "cyan"];
      const random = Math.floor(Math.random() * colorNameArray.length);
      return Colors(colorNameArray[random]).get();
    }

    _createItems({
      items,
      construct
    }) {
      return items.map((item, index) => {
        return {
          type: ItemWrapper,
          construct,
          index: index,
          item: item,
          x: index * (construct.width + construct.offset),
          w: construct.width,
          h: construct.height
        };
      });
    }

    _animateToSelected(index = this._index) {
      this.tag("Items").children.forEach((item, idx) => {
        const child = item.child;

        if (child) {
          if (idx > index - 1 && idx < index + 8) {
            child.tag("Image").setSmooth("color", 0xffffffff);
          } else if (idx === index - 1 || idx === index + 8) {
            child.tag("Image").setSmooth("color", 0xff2f2f2f);
          }
        }
      });
      this.tag("Items").setSmooth("x", -this.activeItem.finalX);
    }

    _focus() {
      this.patch({
        smooth: {
          x: [0, {
            duration: .2,
            timingFunction: 'cubic-bezier(0.20, 1.00, 0.80, 1.00)'
          }]
        },
        Focus: {
          smooth: {
            alpha: [1, {
              duration: .4,
              timingFunction: 'cubic-bezier(0.20, 1.00, 0.80, 1.00)'
            }]
          }
        },
        About: {
          smooth: {
            x: [-32, {
              duration: .2,
              timingFunction: 'cubic-bezier(0.20, 1.00, 0.80, 1.00)'
            }],
            y: [90, {
              duration: .2,
              timingFunction: 'cubic-bezier(0.20, 1.00, 0.80, 1.00)'
            }]
          }
        }
      });

      this._animateToSelected();
    }

    _unfocus() {
      this.patch({
        smooth: {
          x: [-32, {
            duration: .4,
            timingFunction: 'cubic-bezier(0.20, 1.00, 0.80, 1.00)'
          }]
        },
        Focus: {
          smooth: {
            alpha: [0, {
              duration: .2,
              timingFunction: 'cubic-bezier(0.20, 1.00, 0.80, 1.00)'
            }]
          }
        },
        About: {
          smooth: {
            y: [130, {
              duration: .4,
              timingFunction: 'cubic-bezier(0.20, 1.00, 0.80, 1.00)'
            }],
            x: [0, {
              duration: .4,
              timingFunction: 'cubic-bezier(0.20, 1.00, 0.80, 1.00)'
            }]
          }
        }
      });
      this.stage.gc();
    }

    _handleLeft() {
      if (this._index > 0) {
        this.select({
          direction: -1
        });
      } else {
        return false;
      }
    }

    _handleRight() {
      if (this._index < this.tag("Items").children.length - 1) {
        this.select({
          direction: 1
        });
      } else {
        return false;
      }
    }

    _handleEnter() {
      const item = this.activeItem.item;
      Router.navigate(`details/${item.type}/${item.id}`, {
        keepAlive: true
      });
    }

    setIndex(index) {
      this._index = index;

      this._animateToSelected();

      this._refocus();
    }

    select({
      direction
    }) {
      this._index += direction;

      this._animateToSelected();
    }

    $itemCreatedForFocus() {
      this.application.updateFocusPath();
    }

    _getFocused() {
      return this.activeItem;
    }

    static get height() {
      return 560;
    }

  }

  const apiKey = `66683917a94e703e14ca150023f4ea7c`;
  const listComponents = new Map();
  const itemComponents = new Map();
  let stage;
  let genres;
  listComponents.set("movie", List);
  listComponents.set("tv", List);
  itemComponents.set("movie", Item);
  itemComponents.set("tv", Item);
  const init = stageInstance => {
    stage = stageInstance;
  };
  const getMovies = async () => {
    const movies = await _getPopular("movie");
    const models = [movies];
    return _lists(models);
  };
  const getSportMovies = async () => {
    const movies = await _getSportMovies("movie");
    const models = [movies];
    return _lists(models);
  };

  const _getSportMovies = async type => {
    if (!genres) {
      genres = await _getGenres();
    }

    return _getMovieSportsData(`/search/${type}`).then(response => {
      return new Container(response, type, genres);
    });
  };

  const getTv = async () => {
    const tv = await _getPopular("tv");
    const models = [tv];
    return _lists(models);
  };
  const getDetails = async (type, id) => {
    const itemDetails = await _get(`/${type}/${id}`).then(response => {
      return type === "movie" ? new Details$2(response) : new Details$1(response);
    });
    const credits = await _get(`/${type}/${id}/credits`).then(response => {
      return new Details(response);
    });
    /*console.log(movieDetails)
    console.log(credits)*/

    return [itemDetails, credits];
  };
  const getRuntime = async (type, id) => {
    return await _get(`/${type}/${id}`).then(response => {
      return type === "movie" ? response.runtime : response.episode_run_time;
    });
  };

  const _getGenres = async () => {
    const movie = await _get(`/genre/movie/list`).then(response => {
      return response.genres;
    });
    const tv = await _get(`/genre/tv/list`).then(response => {
      return response.genres;
    });
    return [...movie, ...tv];
  };

  const _getPopular = async type => {
    if (!genres) {
      genres = await _getGenres();
    }

    return _get(`/${type}/popular`).then(response => {
      return new Container(response, type, genres);
    });
  };

  const _get = (url, params) => {
    let params_str = `?api_key=${apiKey}`;

    for (let key in params) {
      if (params.hasOwnProperty(key)) {
        params_str += "&" + key + "=" + encodeURIComponent(params[key]);
      }
    }

    return fetch(`https://api.themoviedb.org/3${url}${params_str}`, {
      'Accept': 'application/json'
    }).then(response => {
      if (!response.ok) throw "Response not ok";
      return response.json();
    }).catch(error => {
      console.error('Error loading ' + url, error);
      throw error;
    });
  };

  const _getMovieSportsData = (url, params) => {
    let params_str = `?api_key=${apiKey}&query=sport&include_adult=false`;

    for (let key in params) {
      if (params.hasOwnProperty(key)) {
        params_str += "&" + key + "=" + encodeURIComponent(params[key]);
      }
    }

    console.log(`https://api.themoviedb.org/3${url}${params_str}`);
    return fetch(`https://api.themoviedb.org/3${url}${params_str}`, {
      'Accept': 'application/json'
    }).then(response => {
      if (!response.ok) throw "Response not ok";
      return response.json();
    }).catch(error => {
      console.error('Error loading ' + url, error);
      throw error;
    });
  };

  const _lists = (models = []) => {
    if (!Array.isArray(models)) {
      models = [models];
    }

    return models.map(list => {
      return stage.c({
        type: listComponents.get(list.type),
        itemConstruct: itemComponents.get(list.type),
        items: list.items
      });
    });
  };

  //     Router.root('splash', Splash);
  //
  //     Router.route('movies', Main);
  //     Router.route('tv', Main);
  //     Router.route('details/:itemType/:itemId', Details);
  //
  //     Router.start();
  // }

  var routes = {
    root: "splash",
    routes: [{
      path: 'splash',
      component: Splash
    },
    /*{
        path: 'home',
        component: Main,
        before: async(page)=>{
            const main = await getMovies();
            page.main = main;
        },
        widgets:["Menu"],
    },*/
    {
      path: 'movies',
      component: Main,
      before: async page => {
        const main = await getMovies();
        page.main = main;
      },
      widgets: ["Menu"]
    }, {
      path: 'tvshows',
      component: Main,
      before: async page => {
        const main = await getTv();
        page.main = main;
      },
      widgets: ["Menu"]
    }, {
      path: 'sports',
      component: Main,
      before: async page => {
        const main = await getSportMovies();
        page.main = main;
      },
      widgets: ["Menu"]
    }, {
      path: 'details/movie/:itemId',
      component: Details$3,
      before: async (page, {
        itemId
      }) => {
        const details = await getDetails("movie", itemId);
        page.details = details;
      },
      widgets: ["MenuWithBackButton"]
    }, {
      path: 'details/tv/:itemId',
      component: TVDetails,
      before: async (page, {
        itemId
      }) => {
        const details = await getDetails("tv", itemId);
        page.details = details;
      },
      widgets: ["MenuWithBackButton"]
    }, {
      path: 'player',
      component: Player
    }, {
      path: '*',
      component: NotFound
    }, {
      path: '!',
      component: Error$1
    }]
  };
  /*
  export const applyPlayerModel = (item) => {
      const {id, title, name, media_type, images: {backdrops}} = item;
      const backdropPath = backdrops.length > 0 ? backdrops[Math.min(1, backdrops.length-1)].file_path : '';
      return {
          id,
          title: media_type === 'tv' ? name : title,
          backdrop: `http://image.tmdb.org/t/p/original/${backdropPath}`
      }
  }*/

  class Menu extends Lightning.Component {
    static _template() {
      return {
        TopHeader: {
          flex: {
            direction: "row"
          },
          Logo: {
            w: 214,
            h: 52,
            src: Utils.asset("images/logo.png")
          },
          MenuItems: {
            x: 100,
            Items: {
              //y: 68,
              flex: {}
            },
            Focus: {
              rect: true,
              colorLeft: 0xFFE50914,
              colorRight: 0xFFE50914,
              h: 6,
              y: 39,
              rtt: true,
              shader: {
                type: Lightning.shaders.RoundedRectangle,
                radius: 3
              },
              transitions: {
                alpha: {
                  duration: .3,
                  timingFunction: 'cubic-bezier(0.20, 1.00, 0.80, 1.00)'
                },
                w: {
                  duration: .3,
                  timingFunction: 'cubic-bezier(0.20, 1.00, 0.80, 1.00)'
                }
              }
            }
          }
        }
      };
    }

    _init() {
      this._index = 0;
    }

    get activeItem() {
      return this.tag("Items").children[this._index];
    }

    _handleDown() {
      Router.restoreFocus();
      this._selectedChild.selected = true;
    }

    _handleLeft() {
      if (this._index > 0) {
        this._select(-1);
      }
    }

    _handleRight() {
      //console.log(this.tag("Items").children.length)
      if (this._index < this.tag("Items").children.length - 1) {
        this._select(1);
      }
    }

    _focus() {
      this.tag("Focus").w = 0;
      this.tag("Focus").setSmooth("alpha", 1);

      this._animateToSelected();
    }

    _unfocus() {
      this.tag("Focus").setSmooth("alpha", 0);
    }

    _select(direction) {
      this._index += direction;

      if (this._index < this.tag("Items").children.length) {
        this._animateToSelected();
      }
    }

    _animateToSelected() {
      this.tag("Focus").patch({
        smooth: {
          x: this.activeItem.finalX,
          w: this.activeItem.finalW
        }
      });
    }

    _handleEnter() {
      if (this.activeItem.id === 'exit') {
        this.application.closeApp();
      } else {
        Router.navigate(`${this.activeItem.id}`, false);
        Router.restoreFocus();
      }
    }

    _getFocused() {
      return this.activeItem;
    }

    _setup() {
      this._items = ['Movies', 'TV Shows', 'Sports', 'Exit'];

      const items = this._items.map(item => {
        return {
          type: MenuItem,
          label: item,
          selected: false,
          id: item.toLocaleLowerCase()
        };
      });

      this.tag('Items').add(items);
    }

    _onActivated(page) {
      const list = this.tag('Items');
      const currentRouteId = page[Router.symbols['route']].toLocaleLowerCase();

      for (let i = 0; i < list.children.length; i++) {
        list.children[i].selected = list.children[i]._id === currentRouteId;

        if (list.children[i]._id === currentRouteId) {
          this._selectedChild = list.children[i];
        }
      }
    }

  }

  class MenuItem extends Lightning.Component {
    static _template() {
      return {
        flexItem: {
          marginRight: 25
        },
        text: {
          text: "Home",
          fontSize: 25,
          fontFace: "SourceSansPro-Regular",
          fontStyle: "bold"
        }
      };
    }

    set label(v) {
      this._label = v;
      this.patch({
        text: {
          text: this._label
        }
      });
    }

    set id(v) {
      this._id = v.replace(/ /g, "");
    }

    get id() {
      return this._id;
    }

    set selected(bool) {
      if (bool) {
        this.patch({
          text: {
            textColor: 0xFFE50914,
            alpha: 0.6
          }
        });
      } else {
        this.patch({
          text: {
            textColor: Colors('white').get(),
            alpha: 1
          }
        });
      }

      this._selected = bool;
    }

    get selected() {
      return this._selected;
    }

    _focus() {
      this.patch({
        text: {
          textColor: 0xFFE50914
        }
      });
    }

    _unfocus() {
      this.patch({
        text: {
          textColor: Colors('white').get()
        }
      });
    }

  }

  class MenuWithBackButton$1 extends Lightning.Component {
    static _template() {
      return {
        TopHeader: {
          flex: {
            direction: "row"
          },
          BackButton: {
            type: ImageButton,
            icon: "ic_back"
          }
        }
      };
    }

    _init() {
      this._index = 0;
    }

    _handleDown() {
      Router.restoreFocus();
    }

    _focus() {
      this.patch({
        TopHeader: {
          BackButton: {
            smooth: {
              color: 0xFFE50914
            }
          }
        }
      });
    }

    _unfocus() {
      this.patch({
        TopHeader: {
          BackButton: {
            smooth: {
              color: 0xff404249
            }
          }
        }
      });
    }

    _handleEnter() {
      Router.back();
    }

  }

  class MenuWithBackButton extends Lightning.Component {
    static _template() {
      return {
        TopHeader: {
          flex: {
            direction: "row"
          },
          BackButton: {
            type: ImageButton,
            icon: "ic_back"
          },
          Title: {
            x: 20,
            y: 25,
            text: {
              text: "Hello How Are You?",
              fontSize: 25,
              fontFace: "SourceSansPro-Bold",
              wordWrapWidth: 960,
              maxLines: 1
            }
          }
        }
      };
    }

    _init() {
      this._index = 0;
    }

    _handleDown() {
      Router.restoreFocus();
    }

    _focus() {
      this.patch({
        TopHeader: {
          BackButton: {
            smooth: {
              color: 0xFFE50914
            }
          }
        }
      });
    }

    _unfocus() {
      this.patch({
        TopHeader: {
          BackButton: {
            smooth: {
              color: 0xff404249
            }
          }
        }
      });
    }

    _handleEnter() {
      Router.back();
    }

  }

  class App extends Router.App {
    static getFonts() {
      return [{
        family: 'SourceSansPro-Regular',
        url: Utils.asset('fonts/SourceSansPro-Regular.ttf'),
        descriptors: {}
      }, {
        family: 'SourceSansPro-Black',
        url: Utils.asset('fonts/SourceSansPro-Black.ttf'),
        descriptors: {}
      }, {
        family: 'SourceSansPro-Bold',
        url: Utils.asset('fonts/SourceSansPro-Bold.ttf'),
        descriptors: {}
      }];
    } // when App instance is initialized we call the routes
    // this will setup all pages and attach them to there route


    _setup() {
      init(this.stage);
      Router.startRouter(routes, this);
    }

    static _template() {
      return {
        Background: {
          type: Background,
          visible: true
        },
        // we MUST spread the base-class template
        // if we want to provide Widgets.
        ...super._template(),
        Widgets: {
          Menu: {
            type: Menu,
            x: 68,
            y: 30,
            zIndex: 99,
            visible: false
          },
          MenuWithBackButton: {
            type: MenuWithBackButton$1,
            x: 68,
            y: 30,
            zIndex: 99,
            visible: true
          }
        },
        Loading: {}
      };
    }
    /**
     * Show app close dialogue
     * @private
     */


    _handleAppClose() {
      console.log("Close app");
    }

  }

  function index () {
    return Launch(App, ...arguments);
  }

  return index;

})();
//# sourceMappingURL=appBundle.js.map
