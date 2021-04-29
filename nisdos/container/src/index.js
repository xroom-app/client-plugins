import 'regenerator-runtime/runtime'
import * as React from 'preact'
import Containers from './containers'
import UI from './ui'

function onDataIn (data) {
  const { pluginId, layout } = data

  if (pluginId !== xroom.id) {
    return
  }

  if (this.containersRef) {
    this.containersRef.externalSync(layout)
  } else {
    this.addContainers(layout)
  }
}

xroom.plugin = {
  visible: false,
  containerId: null,

  events: {
    'data/in': onDataIn,
  },

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
        ref={(ref) => { this.uiRef = ref} }
        onAddContainers={layout => {
          this.removeContainers()
          this.addContainers(layout)
        }}
        onRemoveContainers={() => this.removeContainers()}
      />
    })
  },

  addContainers (layout) {
    this.containerId = xroom.api('addContainer', {
      size: 1,
      component: <Containers
        ref={(ref) => { this.containersRef = ref} }
        layout={layout}
        ui={xroom.ui}
        api={xroom.api}
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
