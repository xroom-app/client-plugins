## How to create a plugin for xroom.app

#### Plugin directory structure:
* index.js — plugin code
* icon.png — icon for the marketplace
* any other files your plugin may need


#### index.js skeleton:

```
xroom.plugin = {
    /* Three required methods */
    isSupported () {
      // called to check if plugin is supported in the current browser
      // must return a boolean
    },
    register ({roomId: string, myPeerId: string}) {
      // called when plugin is loaded (both hot load and load on start)
      // roomId will be not null when plugin started when already in a room
      // myPeerId is a connection ID, equal to peerId of how other peers see it
    },
    unregister () {
      // called when plugin is unloaded
    },

    /* Optional stuff */
    events: { ... },
    translations: { ... },
}
```


## Exposed API
| Method              | Description | Arguments | Returns    
| ---                 | --- | --- | ---
| addIcon             | Add icon to UI | `{title: string, onClick: function, svg: Component}`
| addUI               | Add own UI | `{component: Component}` | Reference to component in DOM
| appendScript        | Load a script | `{src: string}` | Script ID
| appendStyle         | Load a style file | `{src: string}` | Style ID
| getStreams          | Get media streams | — | `{local: MediaStream, remote: Record<string, MediaStream>}`
| goToRoom            | Go to a new room | `{roomId: string, preview: boolean}`
| kickPeer            | Kick a peer | peerId
| listPeers           | List all room peers | — | Array of peers
| removeElement       | Remove an element from DOM | Element reference ID
| removeIcon          | Remove icon from UI | —
| renderControls      | Rerender UI, useful for dynamic icons | —
| sendData            | Send data to peer(s) with this plugin | `{data: string, to: string}`
| sendMessage         | Post a message to chat | `{type: string, content: string, to: string}`
| setPeerVis*         | Set peer container visibility | `{peerId: string, off: boolean}`
| setRoomLock         | Lock/unlock the current room | Lock flag
| setRoomPassword     | Set/reset room password | Password (null to reset)
| setLocalAP*         | Set local audio processor | A processing AudioNode
| setLocalVideo       | Substitute local video | `{track: MediaStreamTrack, reset: boolean}`
| suggestPlugin       | Suggest this plugin to all peers | —
| updateCard          | Update own user card elements | `{name: string}`

*) not yet available in v3 API

## Exposed events
| Event               | Description           | Payload 
| ---                 | ---                   | --- 
| data/in             | Incoming rtc data via plugins data channel | `{pluginId, data, peerId}` 
| localStream/changed | Local stream changed | —
| peer/added          | Peer entered a room   | `{peerId, peerCount}` 
| peer/card           | Peer card updated     | `{peerId, card}` 
| peer/muteSet        | Peer muted/unmuted self  | `{peerId, camOn, micOn}` 
| peer/removed        | Peer quit a room      | `{peerId, peerCount}` 
| room/exit           | You quit a room       | `{roomId}` 
| room/ready          | Room layout is ready after entry | `{roomId}` 
| ss/kick             | Server kicked you on behalf of peerId | `{peerId}` 
| ss/lockSet          | Room lock status changed | Lock flag 
| ss/onJoin           | You entered a room    | `{roomId, status, ?isLocked}` 
| ss/onReadRoom       | Room pre-enter status updated | `{id, ?type, ?access: {lock, password}, ?peerCount, ?hostCount}` 
| ss/passwordSet      | New room password | Password string
| ss/passwordReset    | Room password removed | —
| chat/message        | New message in chat | `{ peerId, data, type }`, peerId = 'me' for local posts
| chat/input          | Chat input changed | currentValue

`ss/...`&ndash;events are automatically generated events based on signaling server commands. We will add more to the
documentation soon.

## Using events
Starting from xroom.app v2 you can utilize automatic plugin event management. Simply define `events` field in your plugin
object with event keys and corresponding handlers, e.g.:
```
  this.events: {
    'room/ready': onRoomReady,
    'room/exit': onRoomExit,
    ...
  }
```

## Translations support
1. Add `translations` object to the root.
2. Add keys for supported languages, e.g. `{ en: {...}, ru: {...} }`
3. English (en) **must** be present, as it is used as a fallback. If your plugin uses only one language that
is not English we recommend placing all the data into `en` for simplicity's sake.
4. Language objects from p.2 must have keys, can be arranged in a tree if complexity needed, 
e.g. `en: { a: { b: 'hello'}, c: 'world }`
5. Use `xroom.i18n.t( /* your key here, e.g. 'a.c' from the example above */ )`

## Audio context
In case you need to access xroom.app's current audio context it is available as a read-only value `xroom.ac`.

## Message boxes
Message boxes are exposed to plugins as `xroom.mbox`. Example usage: 
```
/*
  key -- pressed button key
  value -- returned value
*/
const [key, value] = await xroom.mbox({
  title: 'Optional title',
  text: 'Optional content',
  html: 'Optional HTML content',
  input: 'text',                        // optional input mode: text, range
  buttons: [{                           // optional, defaults to one OK button
    ok: 'OK',
    cancel: 'Cancel',
  }],
  defaultValue: 'ololo',                // default value for inputs
  imageUrl: '...'                       // optional image URL (dataURL supported)
})
```

## Core UI components
Starting from Themes v2 core UI components are available for all the plugins. The library is exposed as `xroom.ui`. 
Here's a usage example:
```js
const { Dialog, Button } = xroom.ui

return (
 <Dialog>
   <Button primary>Hello</Button>
 </Dialog>
)
```

UI components manual will be added soon. Until then please refer to the examples in this repository.

## Developing locally
To be able to develop and test your code locally open the plugin manager on xroom.app, click Add on "Add new plugin" 
line, input plugin name and its root URL, that is a path to a remote directory. Both index.js and icon.png must be 
present in that directory.

As xroom.app loads a plugin from another origin (e.g. localhost:3000) so please assure your server feeds CORS headers,
at least: 
```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, OPTIONS
```

You can use [this](https://www.npmjs.com/package/http-server) package to solve CORS problem quickly:

```bash
# install
npm install http-server -g

# run from the build directory
http-server --cors
```

## License
MIT License

## Version
Version 2021-03-10
