import 'regenerator-runtime/runtime'
import * as React from 'preact'
import Containers from './containers'
import UI from './ui'

xroom.plugin = {
  visible: false,
  containerId: null,

  async register () {
    this.addUi()
    this.addIcon()
  },

  unregister () {
    xroom.api('removeIcon')

    if (this.containerId) {
      xroom.api('removeContainer', this.containerId)
    }
  },

  isSupported () {
    return true
  },

  addUi () {
    xroom.api('addUI', {
      component: <UI
        ui={xroom.ui}
        api={xroom.api}
        mbox={xroom.mbox}
        i18n={xroom.i18n}
        ref={(ref) => { this.uiRef = ref} }
        onAddContainers={amount => {
          this.removeContainers()
          this.addContainers(amount)
        }}
        onRemoveContainers={() => this.removeContainers()}
      />
    })
  },

  addContainers (amount) {
    this.containerId = xroom.api('addContainer', {
      size: 1,
      component: <Containers
        amount={amount}
        ui={xroom.ui}
        api={xroom.api}
        i18n={xroom.i18n}
      />,
    })
    this.visible = true
  },

  removeContainers () {
    if (this.containerId) {
      xroom.api('removeContainer', this.containerId)
      this.visible = false
    }
  },

  addIcon () {
    xroom.api('addIcon', {
      title: () => 'Manage containers',
      onClick: () => this.uiRef.toggleShow(),
      svg: props =>
        <svg width={props.size || 25} height={props.size || 25} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path stroke={props.color} d="M16 10h11a1 1 0 011 1v14a1 1 0 01-1 1H5a1 1 0 01-1-1V13" stroke-width={1.5 * 32/25} stroke-linecap="round" stroke-linejoin="round"/>
          <path stroke={props.color} d="M11.7 13H4V8a1 1 0 011-1h6.7c.2 0 .4 0 .6.2L16 10l-3.7 2.8a1 1 0 01-.6.2zM13 18.5h6M16 15.5v6" stroke-width={1.5 * 32/25} stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
    })
  },
}