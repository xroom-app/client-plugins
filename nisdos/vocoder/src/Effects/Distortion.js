/** Class creating an distortion effect */
class Distortion {
  /**
   * Create effect
   * @param {AudioContext} ctx - audio context of app
   * @param {MediaStreamAudioSourceNode} source - audio source (microphone)
   * @property {WaveShaperNode} dist - node that distorts audio creating desirable effect
   */
  constructor(ctx, source, isMute) {
    this.ctx = ctx
    this.source = source
    this.dist = this.ctx.createWaveShaper()
    this.gain = 200
    this.dist.curve = this.makeDistortionCurve()
    this.dist.oversample = '4x'
    this.source.connect(this.dist)
    // !isMute && this.connect()
  }

  /**
   * Get title
   * @return {string} The title of effect
   */
  getTitle = 'distortion'

  /**
   * Get current gain
   * @return {number} Current 'amount' of effect applied to source
   */
  getgain = () => this.gain

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
      type: 'range',
      label: 'gain',
      min: 0,
      max: 1000,
      step: 100,
      default: 400,
      callback: (evt) => {
        this.gain = +evt.target.value
        this.dist.curve = this.makeDistortionCurve()
      },
    },
  ]

  /**
   * Get the curve that modifies audio (actually, that is magic for me, it's copypasted from MDN)
   *
   * @returns {Float32Array}
   */
  makeDistortionCurve() {
    var k = typeof this.gain === 'number' ? this.gain : 50,
      n_samples = 44100,
      curve = new Float32Array(n_samples),
      deg = Math.PI / 180,
      i = 0,
      x
    for (; i < n_samples; ++i) {
      x = (i * 2) / n_samples - 1
      curve[i] = ((3 + k) * x * 20 * deg) / (Math.PI + k * Math.abs(x))
    }

    return curve
  }

  /**
   * Connects wave shaper to audio destination, 'unmute'
   */
  connect() {
    this.dist.connect(this.ctx.destination)
  }

  /**
   * @returns {WaveShaperNode}
   */
  getProcessor() {
    return this.dist
  }

  /**
   * Disconnects wave shaper from audio destination, 'mute'
   */
  disconnect() {
    try {
      this.dist.disconnect(/*this.ctx.destination*/)
    } catch (e) {
      console.log('disconnect() error', e)
    }
  }
}

export default Distortion
