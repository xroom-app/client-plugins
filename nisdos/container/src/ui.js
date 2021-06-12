import * as React from 'preact'
import Pictogram from './pictogram'

export default class extends React.Component {
  constructor (props) {
    super(props)
    this.toggleShow = this.toggleShow.bind(this)
    this.start = this.start.bind(this)
    this.stop = this.stop.bind(this)
    this.setState({
      selected: 1,
    })
  }

  toggleShow () {
    this.dialog && this.dialog.toggle()
  }

  start () {
    const { selected } = this.state
    const { onAddContainers, api, mbox } = this.props

    if (selected === 1) {
      onAddContainers([{id: 0}])
    }
    if (selected === 2) {
      onAddContainers([{id: 0}, {id: 1}])
    }

    this.toggleShow()

    api('suggestPlugin', {force: true})
    mbox({text: 'Invitation sent out to your peers'})
  }

  stop () {
    const { api, onRemoveContainers } = this.props

    onRemoveContainers()
    this.toggleShow()
    api('sendData', {
      data: { layout: [] },
    })
  }

  render () {
    const { ui } = this.props
    const { Dialog, Button } = ui
    const { selected } = this.state

    return (
      <Dialog
        bgClose
        header="Configure containers"
        ref={ref => this.dialog = ref}
      >
        <div style={styles.mode(selected === 1)} onClick={() => { this.setState({selected: 1}) }}>
          <div style={styles.modeName}>One</div>
          <Pictogram size="96" />
        </div>
        <div style={styles.mode(selected === 2)} onClick={() => { this.setState({selected: 2}) }}>
          <div style={styles.modeName}>Two</div>
          <Pictogram size="96" />
          <Pictogram size="96" style={{marginLeft: '1rem'}} />
        </div>
        <div style={styles.buttons}>
          <Button
            primary
            onClick={this.start}
          >
            Start
          </Button>
          &nbsp; &nbsp;
          <Button
            secondary
            onClick={this.stop}
          >
            Stop
          </Button>
        </div>
      </Dialog>
    )
  }
}

const styles = {
  header: {
    fontSize: '1rem',
    textAlign: 'center',
    marginBottom: '0.5rem',
  },
  mode: (isSelected) => ({
    background: 'var(--box-0d)',
    color: 'var(--box-1)',
    display: 'flex',
    border: '1px solid transparent',
    padding: '1rem',
    width: '22rem',
    borderRadius: 'var(--box-rh)',
    marginBottom: '1rem',
    cursor: 'pointer',
    borderColor: isSelected ? 'var(--box-2)' : 'transparent',
  }),
  modeName: {
    margin: '0 auto 0 0',
    fontSize: '1.1rem',
  },
  buttons: {
    display: 'flex',
    justifyContent: 'center',
    marginTop: '2rem',
  },
}
