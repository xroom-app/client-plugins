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
      <svg width={size || 25} height={size || 25} fill="none" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
        <path d="M16 28a12 12 0 100-24 12 12 0 000 24z" stroke={ color } stroke-width={1.5 * 32/25} stroke-miterlimit="10" />
        <path d="M16 24a8 8 0 100-16 8 8 0 000 16z" stroke={ blink ? '#e04006' : color } stroke-width={1.5 * 32/25} stroke-miterlimit="10" />
      </svg>
    )
  }
}
