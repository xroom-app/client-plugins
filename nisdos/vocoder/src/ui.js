import React, { Component } from 'react'
import { effectsList } from './Effects'
import DropDown from './DropDown/DropDown'

const getEffects = i18n =>
  Object.keys(effectsList).map(effect => ({
      key: effect,
      value: i18n.t(effect + '.label')
  }))

class UI extends Component {

  constructor(props) {
    super(props)

    this.state = {
      isMute: false,
      isShown: false,
      effects: [],
    }
  }

  toggle(ctx, source) {
    this.ctx = this.ctx || ctx
    this.source = this.source || source
    this.setState({ isShown: !this.state.isShown })
  }

  addEffect = effect => {
    const effectClass = effectsList[effect]
    const effectInstance = new effectClass(this.ctx, this.source, () => this.forceUpdate())
    const effects = [...this.state.effects]
    effects.push(effectInstance)
    this.setState({effects})

    this.props.api('setLocalAP', effectInstance.getProcessor())
  }

  removeEffect = index => {
    const effects = [...this.state.effects]
    effects[index].disconnect()
    this.props.api('setLocalAP', null)
    effects.splice(index, 1)
    this.setState({effects})
  }

  close = () => this.setState({isShown: false})

  toggleMute = () => {
    const { isMute } = this.state

    if (isMute) {
      this.state.effects.map(effect => {
        // effect.connect()
        this.props.api('setLocalAP', effect.getProcessor())
      })
    } else {
      this.state.effects.map(effect => {
        effect.disconnect()
        this.props.api('setLocalAP', null)
      })
    }

    this.setState({isMute: !isMute})
  }

  render () {
    const { i18n } = this.props
    const { isShown, isMute } = this.state

    if (!isShown) {
      return null
    }

    return (
      <div style={styles.ui}>
        <div style={styles.box}>
          <div style={styles.header}>{i18n.t('iconCaption')}</div>
          <svg viewBox="0 0 24 24" style={styles.ui_close} onClick={this.close}>
            <title>Close</title>
            <path fill="#fff" d="M12,2C17.53,2 22,6.47 22,12C22,17.53 17.53,22 12,22C6.47,22 2,17.53 2,12C2,6.47 6.47,2 12,2M15.59,7L12,10.59L8.41,7L7,8.41L10.59,12L7,15.59L8.41,17L12,13.41L15.59,17L17,15.59L13.41,12L17,8.41L15.59,7Z" />
          </svg>
          <div>
            {this.state.effects.map((effect, index) => (
              <div style={styles.effect}>
                <div style={styles.effect_title}>
                  {i18n.t(effect.getTitle + '.label')}
                  <span
                    style={styles.effect_remove}
                    onClick={() => this.removeEffect(index)}
                    >
                      &times;
                  </span>
                </div>
                {effect.getControls.map(control => {
                  if (typeof control.isShown === 'function' && !control.isShown()) return

                  if (control.type === "range") return (
                    <div style={styles.effect_control}>
                      <label style={styles.effect_control__label}>{i18n.t(`${effect.getTitle}.${control.label}`)}</label>
                      <input
                        style={styles.effect_control__input}
                        type="range"
                        min={control.min}
                        max={control.max}
                        step={control.step}
                        onChange={control.callback}
                        defaultValue={effect["get" + control.label]()}
                      />
                    </div>
                  )
                  if (control.type === "file") return (
                    <div style={styles.effect_control__file}>
                      <label style={styles.effect_control__label}>{i18n.t(`${effect.getTitle}.${control.label}`)}</label>
                      <input
                        type="file"
                        onChange={control.callback}
                      />
                    </div>
                  )
                  if (control.type === "button") return (
                    <div>
                      <button style={styles.effect_control__button} onClick={control.callback}>{i18n.t(`${effect.getTitle}.${control.label}`)}</button>
                    </div>
                  )
                })}
              </div>
            ))}
            <div style={styles.select_container}>
              <DropDown
                options={getEffects(i18n)}
                onClick={effect => this.addEffect(effect)}
                placeholder={i18n.t('placeholder')}
                size="medium"
              />
            </div>
          </div>

          <button
            onClick={this.toggleMute}
            style={styles.button}
          >
            { i18n.t(isMute ? 'unmute' : 'mute') }
          </button>
        </div>
      </div>
    )
  }
}

const styles = {
  ui: {
    position: 'fixed',
    top: 0,
    right: 0,
    width: '260px',
    height: '100vh',
    background: 'rgba(40, 40, 40, .7)',
    color: '#fff',
    padding: '8px',
    fontSize: '14px',
    overflowY: 'auto',
  },
  ui_close: {
    width: 24,
    height: 24,
    cursor: 'pointer',
    opacity: .75,
    position: 'absolute',
    top: 8,
    right: 8,
  },
  header: {
    lineHeight: '100%',
    textAlign: 'center',
    marginBottom: '16px',
    fontWeight: '400',
  },
  effect: {
    border: '1px solid #dddddd',
    borderRadius: 4,
    padding: '4px 10px',
    marginBottom: 10,
  },
  effect_title: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: 10,
    fontSize: 16,
    fontWeight: 'bold',
  },
  effect_remove: {
    cursor: 'pointer',
  },
  effect_control: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  effect_control__file: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginTop: 10,
  },
  effect_control__button: {
    marginTop: 10,
    width: '50%',
  },
  effect_control__input: {
    maxWidth: 120,
  },
  select_container: {
    display: 'flex',
    justifyContent: 'center',
  },
  button: {
    marginTop: '8px',
  },
}

export default UI

