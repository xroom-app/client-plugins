/** Class creating an pitch effect */
class Morpher {
  /**
   * Create effect
   * @param {AudioContext} ctx - audio context of app
   * @param {MediaStreamAudioSourceNode} source - audio source (microphone)
   */
  constructor(ctx, source, forceUpdate) {
    this.ctx = ctx;
    this.source = source;

    this.morpher = new AudioWorkletNode(this.ctx, "morpher-processor");
    this.source.connect(this.morpher);
  }

  /**
   * Get title
   * @return {string} The title of effect
   */
  getTitle = "morpher";

  /**
   * Get time
   * @return {number} The time interval between echoes
   */
  getvolume = () => this.masterNode.gain.value;

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
    // {
    //   type: 'file',
    //   label: 'file',
    //   callback: evt => this.onUpload(evt.target.files[0]),
    // },
    // {
    //   type: 'range',
    //   label: 'volume',
    //   min: 0,
    //   max: 1,
    //   step: 0.05,
    //   default: 0.5,
    //   callback: (evt) => (this.masterNode.gain.value = +evt.target.value),
    //   isShown: () => this.file,
    // },
    // {
    //   type: 'button',
    //   label: 'start',
    //   isShown: () => this.file && !this.isPlaying,
    //   callback: () => this.start(),
    // },
    // {
    //   type: 'button',
    //   label: 'stop',
    //   isShown: () => this.file && this.isPlaying,
    //   callback: () => this.stop(),
    // },
    // {
    //   type: 'button',
    //   label: 'pause',
    //   isShown: () => this.file,
    //   callback: () => this.toggle(),
    // }
  ];

  /**
   * Connects audio nodes to audio destination, 'unmute'
   */
  connect() {
    // return null
    this.buffer.connect(this.ctx.destination)
    // this.source.connect(this.ctx.destination)
  }

  /**
   * @returns {GainNode}
   */
  getProcessor() {
    // this.masterNode.connect(this.ctx.destination)
    console.log('this.morpher', this.morpher);
    return this.morpher;
  }

  /**
   * Connects audio nodes to audio destination, 'unmute'
   */
  disconnect() {
    try {
      this.source.disconnect(/*this.ctx.destination*/);
    } catch (e) {
      console.log("disconnect() error", e);
    }
  }
}

export default Morpher;
