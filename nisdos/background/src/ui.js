import * as React from 'preact'

const modeNameCodes = ['modeNormal', 'modeBlur', 'modeColorPop', 'modeImage']

export default class extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      selectedId: 0,
    }

    this.dialog = null
    this.videoRef = null
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
      } else {
        this.setState({random: Math.random()})
      }
    }, 100)
  }

  componentDidUpdate() {
    this.reconnect()
  }

  render () {
    const { selectedId } = this.state
    const { onModeSelect, i18n, ui, api } = this.props
    const { Dialog } = ui

    return (
      <Dialog
        bgClose
        ref={ref => this.dialog = ref}
        header="Backgrounds"
      >
        <div style={styles.body}>
          <div style={styles.preview} >
            <div style={styles.poster}>No video</div>
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
                  style={{...styles.mode, color: selectedId === i ? 'var(--box-2)' : 'var(--box-1)'}}
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
  poster: {
    width: '298px',
    height: '224px',
    borderRadius: 'var(--box-rh)',
    position: 'absolute',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: '1.5rem',
    letterSpacing: '3px',
  },
  previewVideo: {
    width: '298px',
    height: '224px',
    borderRadius: 'var(--box-rh)',
    transform: 'rotateY(180deg)',
  },
  modes: {
    display: 'flex',
    flexDirection: 'column',
  },
  mode: {
    display: 'flex',
    margin: '0 0 8px 10px',
    cursor: 'pointer',
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: '16px',
    fontWeight: '400',
    textAlign: 'center',
    background: 'var(--box-0d)',
    width: '170px',
    height: '50px',
    borderRadius: 'var(--bt-r)',
  },
}
