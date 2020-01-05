## How to create a plugin

#### Plugin dir structure:
* index.js — plugin code
* icon.png — icon for the marketplace
* any other files your plugin may need


#### index.js skeleton:

```ts
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


## Exposed API
| Method            | Description           | Arguments                         
| ---               | ---                   | ---                               
| addIcon           | Add icon to UI        | `{title, onClick, svg}`           
| addUI             | Add own UI            | `{component}`                     
| removeIcon        | Remove icon from UI   | —                                 
| renderControls    | Rerender UI, useful for dynamic icons | —                 
| broadcastData     | Broadcasts RTC data   | Any data
| setHotKeysEnable  | Hot keys on/off, useful if your plugin interacts with keyboard | Enable flag           
| setRoomLock       | Lock/unlock the current room | Lock flag           
| appendScript      | Load a script | `{src}`           
| appendStyle       | Load a style file | `{src}`           
| removeElement     | Remove an element from DOM | Element reference ID           
| postToChat        | Post a message to chat | `{text, notLocal: false}`           
| fileToChat        | Post a file to chat for everyone | `{file}`           
| setLocalAP        | Set local audio processor | A processing AudioNode          
| goToRoom          | Go to a new room | `{roomId, preview: false}`          

## Exposed events
| Event             | Description           | Payload 
| ---               | ---                   | --- 
| room/enter        | You entered a room    | `{roomId, cameraStream, screenStream, remoteStreams}` 
| room/exit         | You quit a room       | `{roomId}` 
| room/lock-set     | Room lock status changed | `{lock, peerId}` 
| streams/changed   | Media streams changed | `{cameraStream, screenStream, remoteStreams}` 
| data/in           | Incoming rtc data via plugins data channel | `{pluginId, data}` 
| peer/enter        | Peer entered a room   | `{peerId}` 
| peer/exit         | Peer quit a room      | `{peerId}` 
| peer/card         | Peer card updated     | `{peerId, card}` 
| peer/mute-set     | Peer muted/unumuted   | `{peerId, camOn, micOn}` 


## Translations support
1. Add `translations` object to the root.
2. Add keys for supported languages, e.g. `{ en: {...}, ru: {...} }`
3. English (en) **must** be present, as it is used as a fallback. If your plugin uses only one language that
is not English we recommend placing all the data into `en` for simplicity sake.
4. Language objects from p.2 must have keys, can be arranged in a tree if complexity needed, 
e.g. `en: { a: { b: 'hello'}, c: 'world }`
5. Use `this.i18n.t( /* your key here, e.g. 'a.c' from the example above */ )`

## Audio context
In case you need to access XROOM's audio context it is available as `this.audioContext`.

## Message boxes
Message boxes (SweetAlert2) are exposed to plugins as `this.mbox`. See all the usage tricks
[here](https://sweetalert2.github.io/#examples).

## Testing locally
To be able to test your code locally open app's plugins manager, click Add on "Add new plugin" line, input
plugin name and its root URL, that is a path to a remote directory. Both index.js and icon.png must be 
present in that directory. 

As XROOM loads a plugin from another origin (e.g. localhost:3000) please assure your server feeds CORS headers,
at least: 
```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, OPTIONS
```

## License
All the plugins in this repository have GPLv3 license. We may later change it on MIT after we reach 
some critical mass of public plugins.
