import * as React from 'preact'

export default class extends React.Component {
  constructor (props) {
    super(props)
    this.toggleShow = this.toggleShow.bind(this)
  }

  toggleShow () {
    this.dialog && this.dialog.toggle()
  }

  render () {
    const { ui, onAddContainers, onRemoveContainers } = this.props
    const { Dialog } = ui

    return (
      <Dialog bgClose ref={ref => this.dialog = ref}>
        <div style={styles.modes}>
          <div style={styles.mode} onClick={() => { onRemoveContainers(); this.toggleShow() }}>❌</div>
          <div style={styles.mode} onClick={() => { onAddContainers(1); this.toggleShow() }}>🗔</div>
          <div style={styles.mode} onClick={() => { onAddContainers(2); this.toggleShow() }}>🗔 🗔</div>
        </div>
      </Dialog>
    )
  }
}

const styles = {
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
}
