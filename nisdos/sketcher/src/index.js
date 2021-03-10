import 'regenerator-runtime/runtime'
import * as React from 'preact'
import UI from './ui'

xroom.plugin = {
  translations: {
    en: {
      iconCaption: 'Sketcher',
      confirmErase: 'Are you sure you want to erase everything?',
      yes: 'Yes',
      no: 'No',
      color: {
        black: 'Black',
        blue: 'Blue',
        green: 'Green',
        red: 'Red',
        yellow: 'Yellow',
      },
      tool: {
        0: 'Pencil',
        1: 'Rectangle',
        2: 'Ellips',
        3: 'Arrow',
        4: 'Text',
        5: 'Erase',
      },
      tab: 'Tab',
    },
    ru: {
      iconCaption: 'Рисовалка',
      confirmErase: 'Вы уверены, что хотите всё стереть?',
      yes: 'Да',
      no: 'Нет',
      color: {
        black: 'Черный',
        blue: 'Синий',
        green: 'Зелёный',
        red: 'Красный',
        yellow: 'Жёлтый',
      },
      tool: {
        0: 'Карандаш',
        1: 'Прямоугольник',
        2: 'Эллипс',
        3: 'Стрелка',
        4: 'Текст',
        5: 'Ластик',
      },
      tab: 'Вкладка',
    },
  },

  isSupported () {
    return true
  },

  async register () {
    xroom.api('addUI', { component:
      <UI
        api={xroom.api}
        mbox={xroom.mbox}
        i18n={xroom.i18n}
        ref={(ref) => { this.uiRef = ref } }
      />
    })

    xroom.api('addIcon', {
      title: () => xroom.i18n.t('iconCaption'),
      onClick: () => this.uiRef.toggle(),
      svg: props =>
        <svg width={props.size || 25} height={props.size || 25} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 27H6a1 1 0 01-1-1v-5.6a1 1 0 01.3-.7l15-15a1 1 0 011.4 0l5.6 5.6a1 1 0 010 1.4L12 27zM17 8l7 7" stroke={props.color} stroke-width={1.5 * 32/25} stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M27 27H12l-7-7" stroke={props.color} stroke-width={1.5 * 32/25} stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
    })
  },

  unregister () {
    xroom.api('removeIcon')
  },
}
