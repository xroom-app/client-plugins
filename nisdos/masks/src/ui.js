import * as React from 'preact'

class UI extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      selectedId: 0,
      isShown: false,
    }
    this.toggleShow = this.toggleShow.bind(this)
  }

  toggleShow () {
    const { isShown } = this.state

    this.setState({isShown: !isShown})
  }


  render () {
    const { isShown, selectedId } = this.state
    const { onMaskSelect, masksData } = this.props

    if (!isShown) {
      return null
    }

    return (
      <div style={styles.ui} onClick={() => this.setState({isShown: false})}>
        <div style={styles.box}>
          <div style={styles.masks}>
            <div
              key={0}
              style={{...styles.mask, ...(selectedId ? {} : styles.selectedMask)}}
              onClick={() => {
                onMaskSelect(0)
                this.setState({isShown: false, selectedId: 0})
              }}
            />
            {
              masksData.map((m, i) => {
                return (
                  <div
                    key={i + 1}
                    style={{...styles.mask, ...(i + 1 === selectedId ? styles.selectedMask : {})}}
                    onClick={() => {
                      onMaskSelect(i + 1)
                      this.setState({isShown: false, selectedId: i + 1})
                    }}
                  >
                    <img
                      style={styles.maskImg}
                      src={`/plugins/nisdos/masks/${m[0]}.png`}
                    />
                  </div>
                )
              })
            }
          </div>
        </div>
      </div>
    )
  }
}

const styles = {
  ui: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    background: 'transparent',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  box: {
    background: '#fff',
    display: 'flex',
    flexDirection: 'column',
    padding: '8px',
    borderRadius: '4px',
    border: '1px solid #eee',
    maxWidth: 'calc(100vw - 16px)',
  },
  masks: {
    display: 'flex',
    overflow: 'auto',
    flexWrap: 'wrap',
    justifyContent: 'space-evenly',
  },
  mask: {
    display: 'inline-block',
    margin: '16px',
    cursor: 'pointer',
    minWidth: '100px',
    width: '100px',
    height: '100px',
    backgroundImage: 'linear-gradient(135deg, #ffffff 25%, #ddd 25%, #ddd 50%, #ffffff 50%, #ffffff 75%, #ddd 75%, #ddd 100%)',
    backgroundSize: '20.00px 20.00px',
    borderRadius: '8px',
    border: '2px solid transparent',
  },
  selectedMask: {
    borderColor: '#666',
  },
  maskImg: {
    width: '100px',
    height: '100px',
    transform: 'scaleX(-1)',
  },
}

export default UI
