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
| broadcastData     | Broadcasts RTC data   | Any data

### Exposed events
| Event             | Description           | Payload |
| ---               | ---                   | --- |
| room/enter        | User entered a room   | `{roomId, cameraStream, screenStream, remoteStreams}` |
| room/exit         | User quit a room      | `{roomId}` |
| streams/changed   | Media streams changed | `{cameraStream, screenStream, remoteStreams}` |
| data/in           | Media streams changed | `{pluginId, data}` |


### Translations support

1. Add `translations` object to the root.
2. Add keys for supported languages, e.g. `{ en: {...}, ru: {...} }`
3. English (en) must be present, as it is used as a fallback. If your plugin uses only one language that
is not English we recommend placing all the data into `en` for simplicity sake.
4. Language objects from p.2 must have keys, can be arranged in a tree if complexity needed, 
e.g. `en: { a: { b: 'hello'}, c: 'world }`
5. Use `this.i18n.t( /* your key here, e.g. 'a.c' from the example above */ )`
