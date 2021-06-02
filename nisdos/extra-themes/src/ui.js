import * as React from 'preact/compat'

let selectedId = 0
const modeNameCodes = ['01-star-wars-01', '02-mountain-01', '03-space-01', '04-batman-01']

export default React.forwardRef(({ ui, api, themes, pluginId }, ref) => {
  const { Dialog, Button } = ui

  return (
    <Dialog
      bgClose
      ref={ref}
      header="Other themes"
    >
      <div style={styles.body}>
        <div style={styles.modes}>
          {
            [0, 1, 2, 3].map((el, i) =>
              <div
                key={i}
                id={`${pluginId}-mode-${i}`}
                className={`${pluginId}-mode`}
                style={{...styles.mode, borderColor: selectedId === i? 'var(--box-2)' : 'transparent'}}
                onClick={() => {
                  selectedId = i
                  Array.from(document.getElementsByClassName(`${pluginId}-mode`)).forEach(el => el.style.borderColor = 'transparent')
                  document.getElementById(`${pluginId}-mode-${i}`).style.borderColor = 'var(--box-2)'
                }}
              >
                <img
                  style={styles.img}
                  alt={modeNameCodes[i]}
                  src={`/plugins/${pluginId}/themes/${modeNameCodes[i].replace(/-/g, '_')}.jpg`}
                />
              </div>
            )
          }
        </div>
        <br/>
        <Button
          primary
          onClick={() => {
            api('setTheme', {name: modeNameCodes[selectedId], data: themes[selectedId]})
          }}
        >
          Use this theme
        </Button>
      </div>
    </Dialog>
  )
})

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
