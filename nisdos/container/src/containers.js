import * as React from 'preact'
import Container from './container'

export default class extends React.Component {
  render () {
    return (
      <div style={styles.containers}>
        <Container {...this.props} />
        <div style={styles.separator}/>
        <Container {...this.props} />
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
    width: '10px',
  },
}
