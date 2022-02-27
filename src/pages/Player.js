import {Lightning, Router, Utils, VideoPlayer} from '@lightningjs/sdk'
import ErrorScreen from '../components/ErrorScreen.js'
import { videos } from '../lib/helpers'
import IconButton from '../components/IconButton'
import ProgressBar from '../components/ProgressBar'
import Background from "../Background";
import ImageButton from "../components/ImageButton";

const bgColor = 0xff404249
const buttons = [
    {
        icon: 'play',
        action: '$playPause',
        ref: 'PlayPause',
    },
    {
        icon: 'stop',
        action: '$stop',
    },
]
const interfaceTimeout = 5000

export default class Player extends Lightning.Component {
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
                    textColor: 0xffffffff,
                },
            },
            TopHeader: {
                w: 1920,
                h: 130,
                rect: true,
                color: 0xff404249,
                flex: {direction: "row"},
                BackButton: {
                    x: 68,
                    y: 30,
                    type: ImageButton, icon: "ic_back"
                },
                Title: {
                    x: 100,
                    y: 45,
                    text: {text: "Hello How Are You?", fontSize: 30, fontFace: "SourceSansPro-Bold", wordWrapWidth: 960, maxLines: 1}
                },
            },
            ErrorScreen: {
                type: ErrorScreen,
                alpha: 0,
            },
            Ui: {
                x: 20,
                y: 910,
                w: w => w - 40,
                mountY: 1,
                Buttons: {
                    flex: { direction: 'row' },
                },
                ProgressBar: {
                    y: 70,
                    type: ProgressBar,
                },
            },
        }
    }

    _init() {
        this.tag
        this._index = 0
        this._videoIndex = 0
        // Initially video control interface is visible
        this._interfaceVisible = true
        // This variable will store timeout id for the interface hide functionality
        this._timeout = null
        // Fill Ui.Buttons tag with buttons from the buttons array
        this.tag('Ui.Buttons').children = buttons.map((button, index) => ({
            type: IconButton,
            icon: button.icon,
            action: button.action,
            ref: button.ref || 'Button' + index,
            flexItem: { marginRight: 20 },
        }))

        this.$playPause(false)

        this.application.emit("page", true);
    }

    _toggleInterface(visible) {
        this.widgets.visible = false;
        this.patch({
            Ui: {
                smooth: {
                    y: [visible ? 910 : 960],
                    alpha: [visible ? 1 : 0],
                },
            },
            TopHeader: {
                smooth: {
                    alpha: [visible ? 1 : 0],
                },
            }
        })
        this.tag('Ui')
            .transition('y')
            .on('finish', () => {
                this._interfaceVisible = visible
            })
        if (visible) {
            this._setInterfaceTimeout()
        }
    }

    _setInterfaceTimeout() {
        // Clear timeout if it already exists
        if (this._timeout) {
            clearTimeout(this._timeout)
        }

        this._timeout = setTimeout(() => {
            this._toggleInterface(false)
        }, interfaceTimeout)
    }

    _active() {
        // Show video interface
        this._toggleInterface(true)
        // Set this object to receive VideoPlayer events
        VideoPlayer.consumer(this)
    }

    _inactive() {
        // Cleanup player and ui
        VideoPlayer.clear()
        this.patch({
            color: bgColor,
            Text: {
                alpha: 1,
            },
            ErrorScreen: {
                alpha: 0,
            },
        })
        this.playing = false
        this.tag('Ui.ProgressBar').duration = 0
        this.tag('Ui.ProgressBar').currentTime = 0
    }

    _focus() {
        // Show video interface
        this._toggleInterface(true)
    }

    // Capture every key and toggle interface. If it is visible, pass event to event handlers
    _captureKey() {
        this._toggleInterface(true)
        return !this._interfaceVisible
    }

    _handleUp() {
        this._index = this._index - 1;
    }

    _handleLeft() {
        this._index = Math.max(0, this._index - 1)
    }

    _handleRight() {
        this._index = Math.min(this.tag('Ui.Buttons').children.length - 1, this._index + 1)
    }

    _getFocused() {
        return this.tag('Ui.Buttons').children[this._index]
    }

    set playing(v) {
        this.tag('Ui.Buttons.PlayPause').icon = v === true ? 'pause' : 'play'
    }

    // Button actions
    $playPause(next = false) {
        // If next is true, clear VideoPlayer (which also sets src to null)
        next === true && VideoPlayer.clear()
        if (!VideoPlayer.src || VideoPlayer.src === 'error-video-url') {
            // Player first or second video of the videos list, with a chance of 33% to show error screen
            this._videoIndex = (this._videoIndex + 1) % 2
            const nextVideo = Math.random() > 0.66 ? 'error-video-url' : videos[this._videoIndex]
            VideoPlayer.open("http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4")
        } else {
            VideoPlayer.playPause()
        }
    }

    $stop() {
        VideoPlayer.clear()
    }

    // Hooks for VideoPlayer events
    $videoPlayerPlaying() {
        this.patch({
            smooth: {
                color: [0x00000000],
            },
            Text: {
                smooth: {
                    alpha: [0],
                },
            },
            ErrorScreen: {
                smooth: {
                    alpha: [0],
                },
            },
        })
        this.playing = true
    }

    $videoPlayerPause() {
        this.playing = false
    }

    $videoPlayerAbort() {
        this.patch({
            smooth: {
                color: [bgColor],
            },
            Text: {
                smooth: {
                    alpha: [1],
                },
            },
        })
        this.playing = false
        this.tag('Ui.ProgressBar').duration = 0
        this.tag('Ui.ProgressBar').currentTime = 0
    }

    $videoPlayerEnded() {
        // When current video ends, open next video
        this.$playPause(false)
    }

    $videoPlayerTimeUpdate() {
        this.tag('Ui.ProgressBar').currentTime = VideoPlayer.currentTime
    }

    $videoPlayerLoadedMetadata() {
        this.tag('Ui.ProgressBar').duration = VideoPlayer.duration
    }

    $videoPlayerError() {
        this.patch({
            ErrorScreen: {
                smooth: {
                    alpha: [1],
                },
            },
            Text: {
                smooth: {
                    alpha: [0],
                },
            },
        })
    }
}
