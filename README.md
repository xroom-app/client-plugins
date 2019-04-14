### How to create a plugin
```js
XROOM_PLUGIN({
    isSupported () {
      // called to check if plugin is supported in the current browser
      // must return a boolean
    },
    register () {
      // called when plugin is loaded (both hot load and load on start)
    },
    unregister () {
      // called when plugin is unloaded
    }
})
```


### Exposed API
| Method            | Description           | Arguments                         |
| ---               | ---                   | ---                               |
| addIcon           | Add icon to UI        | `{title, onClick, svg}`           |
| removeIcon        | Remove icon from UI   | -                                 |
| renderControls    | Rerender UI, useful for dynamic icons | -                 |


### Exposed events
| Event             | Description           | Payload |
| ---               | ---                   | --- |
| room/enter        | User entered a room   | `{roomId, cameraStream, screenStream, remoteStreams}` |
| room/exit         | User quit a room      | `{roomId}` |
| streams/changed   | Media streams changed | `{cameraStream, screenStream, remoteStreams}` |
