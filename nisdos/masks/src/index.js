import 'regenerator-runtime/runtime'
import * as React from 'preact'
import UI from './ui'

const ROOT_URL = '/plugins/nisdos/masks/'

const masksData = [
  ['m1', -0.1,  0.1, 1.0, 1.0],
  ['m2', -0.4, -0.80, 1.8, 1.8],
  ['m3',  0.0, -0.85, 1.2, 1.2],
]

function onStreamChanged (external) {
  if (external) {
    return
  }

  const { camOn } = xroom.api('getFlags')

  if (camOn && !this.active) {
    const cameraVT = xroom.api('getStreams').local.getVideoTracks().filter(t => !t.isScreen)[0]

    this.camLoaded = true
    this.videoStream = new MediaStream([cameraVT])
    this.createMats()

    if (this.cvLoaded) {
      if (!this.cvVideoBuffer) {
        this.prepare()
      }

      this.cvVideoBuffer.srcObject = this.videoStream
      this.cvVideoBuffer.height = 320 * this.aspectRatio
    }
    this.active = true
  } else if (!camOn && this.active) {
    this.active = false
  }
}

function onFlagsChange ({ peerId, mf }) {
  if (peerId === 'self') {
    if (!mf[1] && !this.paused) {
      this.paused = true
    } else if (mf[1] && this.paused) {
      const cameraVT = xroom.api('getStreams').local.getVideoTracks().filter(t => !t.isScreen)[0]

      this.videoStream = new MediaStream([cameraVT])
      this.camLoaded = true
      this.createMats()

      if (this.cvLoaded) {
        if (!this.cvVideoBuffer) {
          this.prepare()
        }

        this.cvVideoBuffer.srcObject = this.videoStream
        this.cvVideoBuffer.height = 320 * this.aspectRatio
      }
      this.active = true
    }
  }
}

xroom.plugin = {
  videoStream: null,
  active: false,
  cvLoaded: false,
  camLoaded: false,
  currentMask: null,
  cvVideoBuffer: null,
  outputStream: null,
  aspectRatio: 0.75,
  mats: { src: null, dst: null },

  translations: {
    en: {
      iconCaption: 'Masks',
      notLoaded: 'Not loaded yet. Strange.',
    },
    ru: {
      iconCaption: 'Маски',
      notLoaded: 'Ещё не загрузилось. Странно.',
    },
  },

  events: {
    'localStream/changed': onStreamChanged,
    'peer/flags': onFlagsChange,
  },

  async register () {
    // a bit risky to leave it async
    this.loadMasks()

    xroom.api('addUI', {
      component: <UI
        mbox={xroom.mbox}
        i18n={xroom.i18n}
        masksData={masksData}
        onMaskSelect={id => this.chooseMask(id)}
        ref={(ref) => { this.uiRef = ref} }
      />
    })

    await xroom.api('appendScript', { src: '/plugins/nisdos/masks/opencv.js' })

    await new Promise(resolve => {
      cv['onRuntimeInitialized'] = () => {
        const request = new XMLHttpRequest()

        request.open('GET', ROOT_URL + 'haarcascade_frontalface_default.xml', true)
        request.responseType = 'arraybuffer'
        request.onload = async () => {
          if (request.readyState === 4) {
            if (request.status === 200) {
              let data = new Uint8Array(request.response)
              cv.FS_createDataFile('/', 'haarcascade_frontalface_default.xml', data, true, false, false)
              console.log('Mask: AI ready')
              this.cvLoaded = true

              const cameraVT = xroom.api('getStreams').local.getVideoTracks().filter(t => !t.isScreen)[0]

              if (!this.videoStream && cameraVT) {
                this.videoStream = new MediaStream([cameraVT])
                this.camLoaded = true
                this.active = true
              }

              if (!this.mats.dst) {
                this.createMats()
              }

              if (!this.cvVideoBuffer) {
                this.prepare()
              }
            } else {
              console.log('Failed to load datafile. Status: ' + request.status)
            }
          }
        }
        request.send()
        resolve()
      }
    })

    this.addIcon()
  },

  unregister () {
    xroom.api('removeIcon')
  },

  isSupported () {
    return (
      window.navigator.mediaDevices &&
      window.navigator.mediaDevices.getUserMedia &&
      window.WebAssembly &&
      !window.matchMedia('(max-width: 480px)').matches
    )
  },

  addIcon () {
    xroom.api('addIcon', {
      title: () => xroom.i18n.t('iconCaption'),
      onClick: () => this.uiRef.toggleShow(),
      svg: props =>
        <svg width={props.size || 25} height={props.size || 25} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path stroke={props.color} d="M21 13H11a4 4 0 00-4 4v1a4 4 0 004 4h10a4 4 0 004-4v-1a4 4 0 00-4-4z" stroke-width={1.5 * 32/25} stroke-linecap="round" stroke-linejoin="round" />
          <path stroke={props.color} d="M11.5 19a1.5 1.5 0 100-3 1.5 1.5 0 000 3zM20.5 19a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" stroke-width={1.5 * 32/25} stroke-linecap="round" stroke-linejoin="round" />
          <path stroke={props.color} d="M3 8a3 3 0 116 0h14a3 3 0 016 0v10a8 8 0 01-8 8H11a8 8 0 01-8-8V8z" stroke-width={1.5 * 32/25} stroke-linecap="round" stroke-linejoin="round" />
        </svg>
    })
  },


  createMats() {
    const tracks = this.videoStream.getVideoTracks()

    if (!tracks.length) {
      return
    }

    const settings = tracks[0].getSettings()

    if (settings && settings.width) {
      this.aspectRatio = settings.height / settings.width
      this.mats.src = new cv.Mat(320 * this.aspectRatio, 320, cv.CV_8UC4)
      this.mats.dst = new cv.Mat(320 * this.aspectRatio, 320, cv.CV_8UC4)
      console.log('Aspect ratio', this.aspectRatio)
    } else {
      xroom.mbox({text: 'This browser does not support fully support masks. Video may be squeezed.'})
      this.mats.src = new cv.Mat(240, 320, cv.CV_8UC4)
      this.mats.dst = new cv.Mat(240, 320, cv.CV_8UC4)
    }
  },

  async loadMasks () {
    for (const m in masksData) if (masksData.hasOwnProperty(m) && masksData[m].length === 5) {
      await new Promise(resolve => {
        const img = new Image
        img.src = `${ROOT_URL}${masksData[m][0]}.png`
        img.onload = () => {
          masksData[m].push(img)
          resolve()
        }
        img.onerror = resolve
      })
    }
  },

  chooseMask (id) {
    if (!this.camLoaded || !this.cvLoaded) {
      return alert(xroom.i18n.t('notLoaded'))
    }

    if (!id) {
      this.currentMask = null
      xroom.api('setLocalVideo', {reset: true})
    } else {
      this.currentMask = masksData[id - 1]

      if (!this.cvVideoBuffer) {
        this.prepare()
      }

      this.cvVideoBuffer.srcObject = this.videoStream

      if (this.outputStream) {
        xroom.api('setLocalVideo', {track: this.outputStream.getVideoTracks()[0]})
      }
    }
  },

  prepare () {
    try {
      const
        video = document.createElement('video'),
        canvas = document.createElement('canvas')

      video.width = 320
      video.height = 320 * this.aspectRatio
      video.autoplay = true

      this.cvVideoBuffer = video

      const
        gray = new cv.Mat(),
        faces = new cv.RectVector(),
        cap = new cv.VideoCapture(video),
        classifier = new cv.CascadeClassifier()

      // load pre-trained classifiers
      classifier.load('haarcascade_frontalface_default.xml')

      const ctx = canvas.getContext('2d', { alpha: false })

      this.outputStream = canvas.captureStream(25)

      const processVideo = () => {
        try {
          if (this.currentMask && this.mats.src) {
            // capture and put ground layer
            cap.read(this.mats.src)
            this.mats.src.copyTo(this.mats.dst)

            cv.cvtColor(this.mats.dst, gray, cv.COLOR_RGBA2GRAY, 0)

            // detect faces.
          //  const x = window.performance.now()
            classifier.detectMultiScale(gray, faces, 1.2, 3, 0)
          //  console.log('dT', window.performance.now() - x)

            cv.imshow(canvas, this.mats.dst)

            if (faces.size()) {
              const f = faces.get(0)
              ctx.drawImage(this.currentMask[5], f.x + f.width * this.currentMask[1], f.y + f.height * this.currentMask[2], f.width * this.currentMask[3], f.height * this.currentMask[4])
            }
          }

          window.requestAnimationFrame(processVideo)
        } catch (err) {
          printCVError(err)
          window.requestAnimationFrame(processVideo)
        }
      }

      processVideo()
    } catch (e) {
      console.log('AI init error', e)
    }
  }
}

/**
 * OpenCV error printer
 *
 * @param err
 */
function printCVError (err) {
  if (typeof err === 'undefined') {
    err = ''
  } else if (typeof err === 'number') {
    if (!isNaN(err)) {
      if (typeof cv !== 'undefined') {
        err = 'Exception: ' + cv.exceptionFromPtr(err).msg
      }
    }
  } else if (typeof err === 'string') {
    const ptr = Number(err.split(' ')[0])

    if (!isNaN(ptr)) {
      if (typeof cv !== 'undefined') {
        err = 'Exception: ' + cv.exceptionFromPtr(ptr).msg
      }
    }
  } else if (err instanceof Error) {
    err = err.stack.replace(/\n/g, '<br>')
  }

  console.log('printCVError', err)
}
