import React from 'react'
import UI from './ui'

const ROOT_URL = '/plugins/nisdos/masks/'

const masksData = [
  ['m1', -0.1,  0.1, 1.0, 1.0],
  ['m2', -0.4, -0.80, 1.8, 1.8],
  ['m3',  0.0, -0.85, 1.2, 1.2],
]

function onStreamChanged (data) {
  if (data.videoOn) {
    this.camLoaded = true
    this.videoStream = new MediaStream(data.stream.getVideoTracks())
    this.createMats()

    if (this.cvLoaded) {
      if (!this.cvVideoBuffer) {
        this.prepare()
      }

      this.cvVideoBuffer.srcObject = this.videoStream
      this.cvVideoBuffer.height = 320 * this.aspectRatio

      /*if (this.outputStream) {
        this.api('setLocalVideo', {track: this.outputStream.getVideoTracks()[0]})
      }*/
    }
  }
}

XROOM_PLUGIN({

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
  },

  async register () {
    // a bit risky to leave it async
    this.loadMasks()

    this.api('addUI', {
      component: <UI
        api={this.api}
        mbox={this.mbox}
        i18n={this.i18n}
        masksData={masksData}
        onMaskSelect={id => this.chooseMask(id)}
        ref={(ref) => { this.ui = ref} }
      />
    })

    await this.api('appendScript', { src: '/plugins/nisdos/masks/opencv.js' })

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

              const [ sysStream ] = await this.api('getLocalStream')

              if (!this.videoStream && sysStream) {
                this.videoStream = new MediaStream(sysStream.getVideoTracks())
                this.camLoaded = true
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
    this.api('removeIcon')
  },

  isSupported () {
    return window.navigator.mediaDevices && window.navigator.mediaDevices.getUserMedia && window.WebAssembly
  },

  addIcon () {
    this.api('addIcon', {
      title: () => this.i18n.t('iconCaption'),
      onClick: () => this.ui.toggleShow(),
      svg: props =>
        <svg xmlns="http://www.w3.org/2000/svg" width={props.size || 24} height={props.size || 24} viewBox="0 0 24 24">
          <path fill={props.color || '#000'} d="M21,13A9,9 0 0,1 12,22A9,9 0 0,1 3,13L3.03,4.43C5.68,2.88 8.76,2 12.05,2C15.3,2 18.36,2.87 21,4.38V13M13,19.93C16.39,19.44 19,16.5 19,13V5.59C16.9,4.57 14.54,4 12.05,4C9.5,4 7.08,4.6 4.94,5.66L5,13C5,16.5 7.63,19.44 11,19.93V18H13V19.93M11,16H8L6,13L9,14H10L11,13H13L14,14H15L18,13L16,16H13L12,15L11,16M6,9.03C6.64,8.4 7.5,8.05 8.5,8.05C9.45,8.05 10.34,8.4 11,9.03C10.34,9.65 9.45,10 8.5,10C7.5,10 6.64,9.65 6,9.03M13,9.03C13.64,8.4 14.5,8.05 15.5,8.05C16.45,8.05 17.34,8.4 18,9.03C17.34,9.65 16.45,10 15.5,10C14.5,10 13.64,9.65 13,9.03Z" />
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
      this.mbox({text: 'This browser does not support fully support masks. Video may be squeezed.'})
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
      return alert(this.i18n.t('notLoaded'))
    }

    if (!id) {
      this.currentMask = null
      this.api('setLocalVideo', {reset: true})
    } else {
      this.currentMask = masksData[id - 1]

      if (!this.cvVideoBuffer) {
        this.prepare()
      }

      this.cvVideoBuffer.srcObject = this.videoStream

      if (this.outputStream) {
        this.api('setLocalVideo', {track: this.outputStream.getVideoTracks()[0]})
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
})

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
