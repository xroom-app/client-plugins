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
      <svg width={size || 25} height={size || 25} fill="none" viewBox="0 0 27 25" xmlns="http://www.w3.org/2000/svg">
        <path d="M4.7 18.8h15.6c.9 0 1.6-.7 1.6-1.6v-11c0-.8-.7-1.5-1.6-1.5H4.7c-.9 0-1.6.7-1.6 1.5v11c0 .9.7 1.6 1.6 1.6zM15.6 21.9H9.4" stroke={ color } stroke-width={1.5 * 32/25} stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M15.6 11.7L11 8.6v6.2l4.7-3z" stroke={ color } stroke-width={1.5 * 32/25} stroke-linecap="round" stroke-linejoin="round"/>
        <circle cx="21" cy="20" r="5" fill={ blink ? '#e04006' : 'transparent' } stroke={ blink ? '#e04006' : 'transparent' } />
      </svg>
    )
  }
}
