import React from 'react'

/** Class creating an echo effect */
class Background {
  /**
   * Create effect
   * @param {AudioContext} ctx - audio context of app
   * @param {MediaStreamAudioSourceNode} source - audio source (microphone)
   * @property {DelayNode} delayNode - node that delays audio creating desirable effect
   * @property {GainNode} feedbackNode - node used to repeat effect multiple times
   * @property {GainNode} bypassNode - node used to control the volume of delayed sound
   * @property {GainNode} masterNode - node used to collect direct sound from source and delayed from delayNode and send them to audio destination
   */
  constructor(ctx, source, forceUpdate) {
    this.ctx = ctx
    this.forceUpdate = forceUpdate
    this.file = null
    this.source = source
    this.buffer = null
    this.startTime = 0
    this.fileLoaded = false
    this.isPlaying = false

    this.masterNode = ctx.createGain()
    this.masterNode.gain.value = 0.5
  }

  /**
   * Get title
   * @return {string} The title of effect
   */
  getTitle = 'background'

  /**
   * Get time
   * @return {number} The time interval between echoes
   */
  getvolume = () => this.masterNode.gain.value

  /**
   * Get controls. Used to render ui that controls effect properties
   * @return {Object[]} controls Objects that describe controls used to change effect properties
   * @param {string} controls[].type Control input type: 'range', 'number' or other
   * @param {string} controls[].label Control title
   * @param {number} controls[].min Min value of controlled effect propertie
   * @param {number} controls[].max Max value of controlled effect propertie
   * @param {number} controls[].step Interval between allowed values of controlled effect propertie (for input field)
   * @param {number} controls[].default Default value of controlled effect propertie
   * @param {function} controls[].callback Function that updates value of controlled effect propertie
   */
  getControls = [
    {
      type: 'file',
      label: 'file',
      callback: evt => this.onUpload(evt.target.files[0]),
    },
    {
      type: 'range',
      label: 'volume',
      min: 0,
      max: 1,
      step: 0.05,
      default: 0.5,
      callback: (evt) => (this.masterNode.gain.value = +evt.target.value),
      isShown: () => this.file,
    },
    {
      type: 'button',
      label: 'start',
      isShown: () => this.file && !this.isPlaying,
      callback: () => this.start(),
    },
    {
      type: 'button',
      label: 'stop',
      isShown: () => this.file && this.isPlaying,
      callback: () => this.stop(),
    },
    {
      type: 'button',
      label: 'pause',
      isShown: () => this.file,
      callback: () => this.toggle(),
    }
  ]

  start = () => {
    this.buffer = this.ctx.createBufferSource()
    this.buffer.buffer = this.file
    this.buffer.loop = true
    this.buffer.connect(this.masterNode)
    this.startTime = this.ctx.currentTime
    this.buffer.start(this.startTime)
    this.isPlaying = true
    this.forceUpdate()
  }

  stop = () => {
    this.buffer.stop(this.ctx.currentTime)
    this.buffer.disconnect()
    this.buffer = null
    this.isPlaying = false
    this.forceUpdate()
  }

  toggle = () => {
    if (this.buffer) {
      this.stop()
    } else {
      this.buffer = this.ctx.createBufferSource()
      this.buffer.buffer = this.file
      this.buffer.connect(this.masterNode)
      this.buffer.start(this.ctx.currentTime, this.ctx.currentTime - this.startTime)
      this.isPlaying = true
      this.forceUpdate()
    }
  }

  onReaderLoad = (event, file) => {
    this.ctx.decodeAudioData(event.target.result).then(audioBuffer => {
      this.file = audioBuffer
      this.forceUpdate()
    })
  }


  onUpload = file => {
    console.log('file', file);

    if (!file.type || !file.type.match(/video.ogg|audio.*/)) {
      return
    }

    const reader = new FileReader();

    reader.onload = evt => this.onReaderLoad(evt, file);

    reader.readAsArrayBuffer(file);
  };

  /**
   * Connects audio nodes to audio destination, 'unmute'
   */
  connect() {
    // this.buffer.connect(this.source)
    // this.source.connect(this.ctx.destination)
  }

  /**
   * @returns {GainNode}
   */
  getProcessor() {
    return this.masterNode
  }

  /**
   * Connects audio nodes to audio destination, 'unmute'
   */
  disconnect() {
    try {
      this.source.disconnect(/*this.ctx.destination*/)
    } catch (e) {
      console.log('disconnect() error', e)
    }
  }
}

export default Background
