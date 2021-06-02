import * as React from 'preact'

const modeNameCodes = ['modeNormal', 'modeBlur', 'modeColorPop', 'modeImage']

export default class extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      selectedId: 0,
    }

    this.dialog = null
    this.videoMounted = false
    this.toggleShow = this.toggleShow.bind(this)
  }

  toggleShow () {
    if (this.dialog) {
      this.dialog.toggle()
      this.reconnect()
    }
  }

  reconnect () {
    setTimeout(() => {
      if (this.videoRef) {
        this.videoRef.srcObject = new MediaStream(this.props.api('getStreams').local.getVideoTracks())
      }
    }, 500)
  }

  componentDidUpdate() {
    this.reconnect()
  }

  render () {
    const { selectedId } = this.state
    const { onModeSelect, i18n, ui, api } = this.props
    const { Dialog, brandColor } = ui

    return (
      <Dialog
        bgClose
        ref={ref => this.dialog = ref}
        header="Backgrounds"
      >
        <div style={styles.body}>
          <div style={styles.preview} >
            <video
              style={styles.previewVideo}
              autoPlay
              playsInline
              ref={ref => this.videoRef = ref}
            />
          </div>
          <div style={styles.modes}>
            {
              [0, 1, 2, 3].map((el, i) =>
                <div
                  key={i}
                  style={{...styles.mode, ...(selectedId === i ? {color: brandColor, borderColor: brandColor} : {})}}
                  onClick={() => {
                    if (api('getFlags').camOn) {
                      onModeSelect(i)
                      this.setState({selectedId: i})
                    }
                  }}
                >
                  { i18n.t(modeNameCodes[i]) }
                </div>
              )
            }
          </div>
        </div>
      </Dialog>
    )
  }
}

const styles = {
  body: {
    display: 'flex',
  },
  preview: {
    borderRadius: 'var(--box-rh)',
    overflow: 'hidden',
  },
  previewVideo: {
    width: '304px',
    height: '228px',
    borderRadius: 'var(--box-rh)',
  },
  modes: {
    display: 'flex',
    flexDirection: 'column',
  },
  mode: {
    display: 'flex',
    margin: '1rem',
    cursor: 'pointer',
    borderRadius: '8px',
    borderWidth: '2px',
    borderStyle: 'solid',
    borderColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: '18px',
    fontWeight: '400',
    color: '#ccc',
    textAlign: 'center',
  },
}
