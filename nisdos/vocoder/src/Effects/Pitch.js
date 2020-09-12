/** Class creating an echo effect */
class Pitch {
  /**
   * Create effect
   * @param {AudioContext} ctx - audio context of app
   * @param {MediaStreamAudioSourceNode} source - audio source (microphone)
   * @property {DelayNode} delayNode - node that delays audio creating desirable effect
   * @property {GainNode} feedbackNode - node used to repeat effect multiple times
   * @property {GainNode} bypassNode - node used to control the volume of delayed sound
   * @property {GainNode} masterNode - node used to collect direct sound from source and delayed from delayNode and send them to audio destination
   */
  constructor(ctx, source, isMute) {
    this.ctx = ctx
    // this.source = source
    this.source = this.ctx.createBufferSource()
    this.source.detune.value = 0

    // this.delayNode = this.ctx.createDelay(100)
    // this.feedbackNode = this.ctx.createGain()
    // this.bypassNode = this.ctx.createGain()
    // this.masterNode = this.ctx.createGain()

    // this.delayNode.delayTime.value = 0.5
    // this.feedbackNode.gain.value = 0.7
    // this.bypassNode.gain.value = 0.5

    // this.source.connect(this.delayNode)
    // this.delayNode.connect(this.feedbackNode)
    // this.feedbackNode.connect(this.delayNode)

    // this.delayNode.connect(this.bypassNode)
    // this.bypassNode.connect(this.masterNode)
    // this.source.connect(this.masterNode)

    // !isMute && this.connect()
  }

  /**
   * Get title
   * @return {string} The title of effect
   */
  getTitle = 'pitch'

  /**
   * Get time
   * @return {number} The time interval between echoes
   */
  getdetune = () => this.source.detune.value

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
      label: 'detune',
      min: -1200,
      max: 1200,
      step: 50,
      default: 0,
      callback: (evt) => (this.source.detune.value = +evt.target.value),
    }
  ]

  /**
   * Connects audio nodes to audio destination, 'unmute'
   */
  connect() {
    this.source.connect(this.ctx.destination)
  }

  /**
   * @returns {GainNode}
   */
  getProcessor() {
    return this.source
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

export default Pitch
