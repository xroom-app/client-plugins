import * as React from 'preact'

export default class IconSvg extends React.Component {
  constructor(props) {
    super(props)

    this.timer = null
    this.state = {
      blink: false,
    }

    if (this.props.on) {
      this.start()
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.on) {
      this.start()
    } else {
      this.stop()
    }
  }

  start() {
    if (this.timer) {
      this.stop()
    }

    this.timer = setInterval(() => {
      this.setState({blink: !this.state.blink})
    }, 500)

    this.setState({blink: true})
  }

  stop() {
    if (this.timer) {
      clearInterval(this.timer)
      this.setState({blink: false})
    }
    this.timer = null
  }

  render() {
    let { color, size } = this.props
    const { blink } = this.state

    color = color || '#000'

    return (
      <svg width={size || 25} height={size || 25} fill="none" viewBox="0 0 25 26" xmlns="http://www.w3.org/2000/svg">
        <path d="M12.5 7.3v10.4M15.6 10.4v4.2M18.8 8.3v8.4M21.9 13.5v-2M9.4 4.2v16.6M6.3 9.4v6.2M3.1 13.5v-2" stroke={ color } stroke-width={1.5 * 32/25} stroke-linecap="round"/>
        <circle cx="18" cy="20" r="5" fill={ blink ? '#e04006' : 'transparent' } stroke={ blink ? '#e04006' : 'transparent' } />
      </svg>
    )
  }
}
