import * as React from 'preact'
import CanvasDraw from './canvasDraw'
import DropDown from './DropDown/DropDown'

const tools = i18n => [
  {
    key: 0,
    icon: <path fill="#333" d="M20.71,7.04C21.1,6.65 21.1,6 20.71,5.63L18.37,3.29C18,2.9 17.35,2.9 16.96,3.29L15.12,5.12L18.87,8.87M3,17.25V21H6.75L17.81,9.93L14.06,6.18L3,17.25Z" />,
    value: i18n.t('tool.' + 0)
  },
  {
    key: 1,
    icon: <path fill="#333" d="M19,6H22V8H19V11H17V8H14V6H17V3H19V6M17,17V14H19V19H3V6H11V8H5V17H17Z" />,
    value: i18n.t('tool.' + 1)
  },
  {
    key: 2,
    icon: (<>
      <path fill="none" stroke="#333" strokeWidth="1.97675" d="M 17.97679,13.853333 A 7.182672,6.8464398 0 0 1 13.542807,20.178619 7.182672,6.8464398 0 0 1 5.7152018,18.694497 7.182672,6.8464398 0 0 1 4.1581943,11.233314 7.182672,6.8464398 0 0 1 10.794118,7.0068936" />
      <rect fill="#333" y="3" x="17" height="8" width="2" />
      <rect fill="#333" y="6" x="14" height="2" width="8" />
    </>),
    value: i18n.t('tool.' + 2)
  },
  {
    key: 3,
    icon: (<>
      <rect width="2" height="8" x="17" y="3" />
      <rect fill="#333" width="8" height="2" x="14" y="6" />
      <path d="M 5.5735473,18.850937 13.974937,10.991939" fill="none" stroke="#333" strokeWidth="1.99692" />
      <path transform="rotate(167.5,-2.4527899,0.53806368)" d="m -5.1658267,-16.921792 -2.413727,-4.158403 4.8081461,-0.01115 z" fill="#333" />
    </>),
    value: i18n.t('tool.' + 3)
  },
  {
    key: 4,
    icon: <path fill="#333" d="M9.6,14L12,7.7L14.4,14M11,5L5.5,19H7.7L8.8,16H15L16.1,19H18.3L13,5H11Z" />,
    value: i18n.t('tool.' + 4)
  },
  {
    key: 5,
    icon: (<>
      <path fill="none" d="M 10,7 H 4 v 11 h 14 v -8" stroke="#333333" strokeWidth="2"strokeDasharray="8,4" />
      <path fill="#333333" strokeWidth="0.4" d="m 17.98,1.2 c -0.204,0 -0.408,0.08 -0.564,0.236 L 12.96,5.892 c -0.312,0.308 -0.312,0.816 0,1.132 L 13.936,8 H 17 l 3.488,-3.492 c 0.316,-0.308 0.316,-0.816 0,-1.132 l -1.94,-1.94 C 18.392,1.28 18.184,1.2 17.98,1.2"/>
    </>),
    value: i18n.t('tool.' + 5)
  }
]

const getSizes = () =>
  [1, 2, 3, 4, 5].map(size => ({
    key: size,
    icon: <path d="M 2,12 C 3,10 5.0000578,9.0262711 7.0035965,9.0087257 8,9 10.99928,9.0002401 12.000781,12.003543 13,15 15.999992,15.007076 17.00288,15.004711 19,15 21,14 22,12" stroke="#333" strokeWidth={size} strokeLinecap="round" fill="none"/>,
    value: size + "px"
  }))

const getColors = i18n =>
  ['black', 'blue', 'green', 'red', 'yellow'].map(color => ({
    key: color,
    icon: <circle r="10" cy="12" cx="12" fill={color} />,
    value: i18n.t('color.' + color)
  }))

class UI extends React.Component {

  constructor(props) {
    super(props)

    this.state = {
      tool: 0,
      color: 'black',
      size: 1,
      isShown: false,
      saveData: '',
      keys: [],
      tabs: 3,
      currentTab: 0,
    }

    this.draw = null
    this.toggle = this.toggle.bind(this)
  }

  toggle () {
    const { isShown } = this.state
    if (!isShown) {
      document.addEventListener('keydown', this.handleKeyDown)
      document.addEventListener('keyup', this.handleKeyUp)
    } else {
      document.removeEventListener('keydown', this.handleKeyDown)
      document.removeEventListener('keyup', this.handleKeyUp)
    }
    this.setState({isShown: !isShown})
  }

  handleErase = async () => {
    const { mbox, i18n } = this.props

    if (await mbox({
      text: i18n.t('confirmErase'),
      buttons: { ok: i18n.t('yes'), cancel: i18n.t('no') },
    })) {
      this.draw.clear()
    }
  }

  saveImage = () => {
    const link = document.createElement('a')

    link.setAttribute('download', 'sketch.png')
    link.setAttribute('href', this.draw.canvas.drawing.toDataURL('image/png').replace('image/png', 'image/octet-stream'))
    link.click()
  }

  handleKeyDown = e => {
    const { keys } = this.state

    if (e.key === 'Control') {
      keys.push('Control')
      this.setState({keys})
    }
    if (keys.includes('Control')) {
      if (e.key === 'z') {
        this.draw.undo()
      }
      if (['Z', 'y'].includes(e.key)) {
        this.draw.redo()
      }
    }
  }

  handleKeyUp = e => {
    const { keys } = this.state

    if (e.key === 'Control') {
      keys.splice(keys.indexOf('Control'), 1)
      this.setState({keys})
    }
  }

  removeTab = (e, removedTab) => {
    e.stopPropagation()
    let { tabs, currentTab } = this.state

    tabs--
    if (currentTab === removedTab && currentTab > 0) currentTab--

    this.draw.removeTab(removedTab)
    this.setState({currentTab, tabs})
  }

  render () {
    const { isShown, color, tool, size, saveData, tabs, currentTab } = this.state

    if (!isShown) {
      return null
    }

    return (
      <div style={styles.ui}>
        <div style={styles.controls}>

          <div style={styles.controls__block}>
            <DropDown
              options={getColors(this.props.i18n)}
              current={color}
              onClick={color => this.setState({color})}
              style={styles.button}
              size="big"
            />
            <DropDown
              options={getSizes()}
              current={size}
              onClick={size => this.setState({size})}
              style={styles.button}
              size="small"
            />
            <DropDown
              options={tools(this.props.i18n)}
              current={tool}
              onClick={tool => this.setState({tool})}
              style={styles.button}
              size="big"
            />
          </div>

          <div style={styles.controls__block}>
            <div onClick={() => this.draw.undo()} style={styles.margin}>
              <svg style={{width: '32px', height: '32px'}} viewBox="0 0 24 24">
                <path fill="#333" d="M12.5,8C9.85,8 7.45,9 5.6,10.6L2,7V16H11L7.38,12.38C8.77,11.22 10.54,10.5 12.5,10.5C16.04,10.5 19.05,12.81 20.1,16L22.47,15.22C21.08,11.03 17.15,8 12.5,8Z" />
              </svg>
            </div>

            <div onClick={() => this.draw.redo()} style={styles.button}>
              <svg style={{width: '32px', height: '32px'}} viewBox="0 0 24 24">
              <path fill="#333" d="m 11.97,8 c 2.65,0 5.05,1 6.9,2.6 L 22.47,7 v 9 h -9 l 3.62,-3.62 C 15.7,11.22 13.93,10.5 11.97,10.5 8.43,10.5 5.42,12.81 4.37,16 L 2,15.22 C 3.39,11.03 7.32,8 11.97,8 Z" />
              </svg>
            </div>

            <div onClick={this.saveImage} style={styles.button}>
              <svg style={{width: '32px', height: '32px'}} viewBox="0 0 24 24">
                <path fill="#333" d="M8,13H10.55V10H13.45V13H16L12,17L8,13M19.35,10.04C21.95,10.22 24,12.36 24,15A5,5 0 0,1 19,20H6A6,6 0 0,1 0,14C0,10.91 2.34,8.36 5.35,8.04C6.6,5.64 9.11,4 12,4C15.64,4 18.67,6.59 19.35,10.04M19,18A3,3 0 0,0 22,15C22,13.45 20.78,12.14 19.22,12.04L17.69,11.93L17.39,10.43C16.88,7.86 14.62,6 12,6C9.94,6 8.08,7.14 7.13,8.97L6.63,9.92L5.56,10.03C3.53,10.24 2,11.95 2,14A4,4 0 0,0 6,18H19Z" />
              </svg>
            </div>

            <div onClick={this.handleErase} style={styles.button}>
              <svg style={{width: '32px', height: '32px'}} viewBox="0 0 24 24">
                <path fill="#333" d="M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z" />
              </svg>
            </div>
          </div>
        </div>

        <div style={styles.tabs}>
          {
            Array.from(Array(tabs).keys()).map(tab =>
              <div
                onClick={() => this.setState({currentTab: tab})}
                style={tab === currentTab ? {...styles.tab, ...styles.current_tab} : styles.tab}
                contentEditable={true}
              >
                { this.props.i18n.t('tab') } { tab+1 }
                { tabs > 1 && <span style={styles.remove_tab} onClick={e => this.removeTab(e, tab)}>&times;</span> }
              </div>
            )
          }
          <svg style={styles.add_tab} viewBox="0 0 24 24" onClick={() => this.setState({tabs: tabs+1})}>
            <path d="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z" />
          </svg>
        </div>

        <div style={styles.canvas}>
          <CanvasDraw
            ref={ref => this.draw = ref}
            canvasWidth="100%"
            canvasHeight="100%"
            brushRadius={size}
            saveData={saveData}
            updateSaveData={data => this.setState({saveData: data})}
            brushColor={color}
            drawingTool={tool}
            tabs={tabs}
            currentTab={currentTab}
          />
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
    height: '100%',
    backgroundColor: '#fff',
    color: '#000',
  },
  controls: {
    padding: '3px 2px',
    display: 'flex',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    position: 'fixed',
    background: '#fff',
    zIndex: 100,
    top: 650,
  },
  controls__block: {
    display: 'flex',
    justifyContent: 'space-between'
  },
  button: {
    cursor: 'pointer',
    margin: '0 2px',
    height: '32px',
    borderRadius: '4px',
  },
  margin: {
    cursor: 'pointer',
    height: '32px',
    margin: '0 0 0 auto',
  },
  tabs: {
    padding: '3px 4px 0',
    borderBottom: '1px solid #aaa',
    display: 'flex',
  },
  tab: {
    border: '1px solid #aaa',
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    borderBottom: 'none',
    background: '#eee',
    padding: '2px 10px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
  },
  current_tab: {
    boxShadow: '0px 1px 0px 0px #fff',
    background: '#fff',
  },
  add_tab: {
    width: 24,
    height: 24,
    fill: '#ccc',
    cursor: 'pointer',
  },
  remove_tab: {
    fontSize: 20,
    lineHeight: '16px',
    marginLeft: 5,
  },
  canvas: {
    width: '100%',
    height: '100%',
    cursor: 'crosshair',
  },
}

if (window.matchMedia('screen and (max-width: 480px)').matches) {
  styles.ui = {
    ...styles.ui,
    height: '100%',
  }
}

export default UI
