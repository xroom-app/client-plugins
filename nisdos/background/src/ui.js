import React, { Component } from 'react'

const modeNameCodes = ['modeNormal', 'modeBlur', 'modeColorPop', 'modeImage']

export default class extends Component {
  constructor (props) {
    super(props)
    this.state = {
      selectedId: 0,
    }

    this.dialog = null
    this.toggleShow = this.toggleShow.bind(this)
  }

  toggleShow () {
    this.dialog && this.dialog.toggle()
  }

  render () {
    const { selectedId } = this.state
    const { onModeSelect, i18n, ui } = this.props

    const { Dialog, brandColor } = ui

    return (
      <Dialog bgClose ref={ref => this.dialog = ref}>
        <div style={styles.modes}>
          {
            [0, 1, 2, 3].map((el, i) =>
              <div
                key={i}
                style={{...styles.mode, ...(selectedId === i ? {color: brandColor, borderColor: brandColor} : {})}}
                onClick={() => {
                  onModeSelect(i)
                  this.setState({selectedId: i})
                }}
              >
                { i18n.t(modeNameCodes[i]) }
              </div>
            )
          }
        </div>
      </Dialog>
    )
  }
}

const styles = {
  modes: {
    display: 'flex',
    overflow: 'auto',
    flexWrap: 'wrap',
    justifyContent: 'space-evenly',
  },
  mode: {
    display: 'flex',
    margin: '16px',
    cursor: 'pointer',
    minWidth: '100px',
    width: '100px',
    height: '100px',
    borderRadius: '8px',
    borderWidth: '2px',
    borderStyle: 'solid',
    borderColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: '18px',
    fontWeight: '600',
    color: '#ccc',
  },
}
