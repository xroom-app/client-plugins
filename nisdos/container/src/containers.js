import * as React from 'preact'
import Container from './container'

export default class extends React.Component {
  render () {
    const { amount } = this.props
    const width = `calc(${100 / amount}% - ${amount === 1 ? 0 : 0.5} * var(--gap))`
    const objs = [<Container {...this.props} width={width} />]

    for (let i = 1; i < amount; i++) {
      objs.push(<div style={styles.separator}/>)
      objs.push(<Container {...this.props} width={width} />)
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
