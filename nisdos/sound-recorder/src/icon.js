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
      <svg xmlns="http://www.w3.org/2000/svg" width={size || 24} height={size || 24} viewBox="0 0 50 50">
        <path fill={ color } d="M7.04 10.21H43c1.06 0 1.89.81 1.89 1.84v25.8c0 1.04-.83 1.85-1.9 1.85H7.05c-1.06 0-1.9-.81-1.9-1.84v-25.8c0-1.04.84-1.85 1.9-1.85zm0-1.84a3.75 3.75 0 0 0-3.79 3.68v25.8c0 2.03 1.7 3.7 3.79 3.7H43a3.75 3.75 0 0 0 3.78-3.7v-25.8c0-2.02-1.7-3.68-3.78-3.68zM6 9h38c1.12 0 2 .88 2 2v28c0 1.12-.88 2-2 2H6c-1.12 0-2-.88-2-2V11c0-1.12.88-2 2-2zm0-2c-2.2 0-4 1.8-4 4v28c0 2.2 1.8 4 4 4h38c2.2 0 4-1.8 4-4V11c0-2.2-1.8-4-4-4z"/>
        <path fill={ blink ? '#e04006' : color } d="M13 21a4 4 0 0 0-4 4 4 4 0 0 0 4 4 4 4 0 0 0 4-4 4 4 0 0 0-4-4z"/>
        <path fill={ color } d="M38.4 21.29c-2.12 0-3.42 1.4-3.42 3.7 0 2.3 1.3 3.72 3.41 3.72 1.81 0 3.12-1.13 3.18-2.75h-1.72a1.4 1.4 0 0 1-1.45 1.26c-.99 0-1.59-.85-1.59-2.23 0-1.37.6-2.2 1.58-2.2.77 0 1.35.5 1.45 1.27h1.72c-.05-1.6-1.4-2.77-3.17-2.77z"/>
        <path fill={ color } d="M28.66 21.48v7.04h4.83v-1.44h-3.04v-1.44h2.86v-1.32h-2.86v-1.4h3.04v-1.44z"/>
        <path fill={ color } d="M22.79 22.83h1.06c.64 0 1.05.38 1.05.98 0 .62-.39.98-1.05.98H22.8v-1.96zM21 21.48v7.04h1.8v-2.46h.92l1.2 2.46h2.02l-1.4-2.73a2.1 2.1 0 0 0 1.2-1.99c0-1.45-1-2.32-2.64-2.32z"/>
      </svg>
    )
  }
}
