import * as React from 'preact'
import Container from './container'

export default class extends React.Component {
  constructor(props) {
    super()

    this.state = {
      layout: props.layout || [],
    }
  }

  /**
   * Data comes from another plugin
   *
   * @param layout
   */
  externalSync (layout) {
    // TODO: validate incoming data
    this.setState({layout})
  }

  /**
   * Container requested a sync, let's sync everything
   */
  internalSync ({id, url}) {
    const { layout } = this.state

    layout.forEach(c => {
      if (c.id === id) {
        c.url = url
      }
    })

    this.props.api('sendData', {
      data: { layout },
    })
  }

  componentWillReceiveProps(nextProps) {
    this.setState({layout: nextProps.layout || []})
  }

  render () {
    const { layout } = this.state

    const objs = []
    const count = layout.length
    const width = `calc(${100 / count}% - ${count === 1 ? 0 : 0.5} * var(--gap))`

    for (let i = 0; i < count; i++) {
      if (i) {
        objs.push(<div style={styles.separator} />)
      }
      objs.push(
        <Container
          {...this.props}
          id={layout[i].id}
          url={layout[i].url}
          width={width}
          internalSync={(data) => this.internalSync(data)}
        />
      )
    }

    return (
      <div style={styles.containers}>
        { objs }
      </div>
    )
  }
}

const styles = {
  containers: {
    width: '100%',
    height: '100%',
    display: 'flex',
  },
  separator: {
    width: 'var(--gap)',
    // cursor: 'col-resize',
  },
}
