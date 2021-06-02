import * as React from 'preact'

const modeNameCodes = ['01-star-wars-01', '02-mountain-01', '03-space-01', '04-batman-01']

export default class extends React.Component {
  constructor (props) {
    super(props)
    this.dialog = null
    this.selectedtId = 0
    this.toggleShow = this.toggleShow.bind(this)
  }

  toggleShow () {
    this.dialog && this.dialog.toggle()
  }

  render () {
    const { ui, api, themes } = this.props
    const { Dialog, Button } = ui

    return (
      <Dialog
        bgClose
        header="Other Themes"
        ref={ref => this.dialog = ref}
      >
        <div style={styles.body}>
          <div style={styles.modes}>
            {
              [0, 1, 2, 3].map((el, i) =>
                <div
                  key={i}
                  style={{...styles.mode, borderColor: this.selectedId === i? 'var(--box-2)' : 'transparent'}}
                  onClick={() => {
                    this.selectedId = i
                    this.forceUpdate()
                  }}
                >
                  <img
                    style={styles.img}
                    alt={modeNameCodes[i]}
                    src={`/plugins/nisdos/extra-themes/themes/${modeNameCodes[i].replace(/-/g, '_')}.jpg`}
                  />
                </div>
              )
            }
          </div>
          <br/>
          <Button
            primary
            onClick={() => {
              api('setTheme', {name: modeNameCodes[this.selectedId], data: themes[this.selectedId]})
            }}
          >
            Use this theme
          </Button>
        </div>
      </Dialog>
    )
  }
}

const styles = {
  body: {
    display: 'flex',
    alignItems: 'center',
    flexDirection: 'column',
    maxWidth: '512px',
  },
  modes: {
    display: 'flex',
    overflow: 'auto',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  mode: {
    display: 'flex',
    cursor: 'pointer',
    borderRadius: '8px',
    borderWidth: '2px',
    borderStyle: 'solid',
    overflow: 'hidden',
    margin: '0 6px 1rem',
  },
  img: {
    width: '237px',
    height: '72px',
  },
  warning: {
    textAlign: 'center',
    marginBottom: '0.8rem',
  },
}
