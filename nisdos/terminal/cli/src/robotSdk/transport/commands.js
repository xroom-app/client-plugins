// SECTION Types

/** @typedef {import('./transport').CommandSender} CommandSender */

/** @typedef {1 | 2 | 3 | 4 | 5 } ClientEnum */

/**
 * @typedef {{
 *   data: boolean
 *   audio: { in: boolean, out: boolean }
 *   video: { in: boolean, out: boolean }
 * }} Strategy
 */

// SECTION Library

/**
 * Returns 'reconnect' command sender
 *
 * @param {CommandSender} send command sender
 *
 * @return {(data: { id: string, roomId: string, peerIds: Array<string>}) => boolean}
 */
function getReconnectCommand (send) {
  return (data) => send('reconnect', data)
}

/**
 * Returns 'requestId' command sender
 *
 * @param {CommandSender} send command sender
 *
 * @return {() => boolean}
 */
function getRequestIdCommand (send) {
  return () => send('requestId', {})
}

/**
 * Returns 'robotJoin' command sender
 *
 * @param {CommandSender} send command sender
 *
 * @return {(data: {
 *   roomId: string
 *   robotId: number
 *   connectKey: string
 *   options: import('./transport').RobotOptions
 * }) => boolean}
 */
function getRobotJoinCommand (send) {
  return (data) => send('robotJoin', data)
}

/**
 * Returns 'robotJoin' command sender
 *
 * @param {CommandSender} send command sender
 *
 * @return {(roomId: string) => boolean}
 */
function getReadRoomCommand (send) {
  return (roomId) => send('readRoom', roomId)
}

/**
 * Returns 'exchange' command sender
 *
 * @param {CommandSender} send command sender
 *
 * @return {(data: { to: string} & ({ candidates: Array<RTCIceCandidate> } | { sdp: string })) => boolean}
 */
function getExchangeCommand (send) {
  return (data) => send('exchange', data)
}

/**
 * Returns 'leave' command sender
 *
 * @param {CommandSender} send command sender
 *
 * @return {() => boolean}
 */
function getLeaveCommand (send) {
  return () => send('leave', {})
}

/**
 * Returns 'kick' command sender
 *
 * @param {CommandSender} send command sender
 *
 * @return {(peerId: string) => boolean}
 */
function getKickCommand (send) {
  return (peerId) => send('kick', { peerId })
}

/**
 * Returns 'setLockCommand' command sender
 *
 * @param {CommandSender} send command sender
 *
 * @return {(isLocked: boolean) => boolean}
 */
function getSetLockCommand (send) {
  return (isLocked) => send('setLock', isLocked)
}

/**
 * Returns 'setPassword' command sender
 *
 * @param {CommandSender} send command sender
 *
 * @return {(password: string) => boolean}
 */
function getSetPasswordCommand (send) {
  return (password) => send('setPassword', password)
}

/**
 * Returns 'resetPassword' command sender
 *
 * @param {CommandSender} send command sender
 *
 * @return {() => boolean}
 */
function getResetPasswordCommand (send) {
  return () => send('resetPassword', {})
}

/**
 * Returns 'destroyRoom' command sender
 *
 * @param {CommandSender} send command sender
 *
 * @return {() => boolean}
 */
function getDestroyRoomCommand (send) {
  return () => send('destroyRoom', {})
}

/**
 * Returns 'setCapacity' command sender
 *
 * @param {CommandSender} send command sender
 *
 * @return {(capacity: number) => boolean}
 */
function getSetCapacityCommand (send) {
  return (capacity) => send('setCapacity', capacity)
}

/**
 * Returns 'addRuleSet' command sender
 *
 * @param {CommandSender} send command sender
 *
 * @return {(ruleSet: ReadonlyArray<[[ClientEnum | string, ClientEnum | string], Strategy]>) => boolean}
 */
function getAddRuleSetCommand (send) {
  return (ruleSet) => send('addRuleSet', ruleSet)
}

// SECTION Exports

module.exports = {
  getReconnectCommand,
  getRequestIdCommand,
  getRobotJoinCommand,
  getReadRoomCommand,
  getExchangeCommand,
  getLeaveCommand,
  getKickCommand,
  getSetLockCommand,
  getSetPasswordCommand,
  getResetPasswordCommand,
  getDestroyRoomCommand,
  getSetCapacityCommand,
  getAddRuleSetCommand,
}
