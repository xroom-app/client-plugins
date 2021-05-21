import * as React from 'preact'

export default class extends React.Component {
  constructor (props) {
    super(props)
    this.toggleShow = this.toggleShow.bind(this)
    this.invitePeers = this.invitePeers.bind(this)
    this.closeRemotely = this.closeRemotely.bind(this)
  }

  toggleShow () {
    this.dialog && this.dialog.toggle()
  }

  invitePeers () {
    this.props.api('suggestPlugin', {force: true})
    this.props.mbox({text: 'Invitation sent out to your peers'})
  }

  closeRemotely () {
    this.props.api('sendData', {
      data: { layout: [] },
    })
  }

  render () {
    const { ui, onAddContainers, onRemoveContainers } = this.props
    const { Dialog, Button } = ui

    return (
      <Dialog bgClose ref={ref => this.dialog = ref}>
        <div style={styles.header}>Amount of visible containers</div>
        <div style={styles.modes}>
          <div style={styles.mode} onClick={() => { onRemoveContainers(); this.toggleShow() }}>0</div>
          <div style={styles.mode} onClick={() => { onAddContainers([{id: 0}]); this.toggleShow() }}>1</div>
          <div style={styles.mode} onClick={() => { onAddContainers([{id: 0}, {id: 1}]); this.toggleShow() }}>2</div>
        </div>
        <div style={styles.buttons}>
          <Button
            primary
            onClick={this.invitePeers}
          >
            Open for peers
          </Button>
          &nbsp; &nbsp;
          <Button
            secondary
            onClick={this.closeRemotely}
          >
            Close for peers
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
  modes: {
    display: 'flex',
  },
  mode: {
    border: '1px solid var(--box-1)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    width: '8rem',
    height: '5rem',
    margin: '1rem',
    fontSize: '2rem',
    borderRadius: 'var(--box-r)',
    cursor: 'pointer',
  },
  buttons: {
    display: 'flex',
    justifyContent: 'center',
    marginTop: '1rem',
  },
}
