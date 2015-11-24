import {ReplaySubject} from 'rx'

function makeDriver() {
  // Declare the actual driver function.
  const handshakeDriver = (source$) => {
    const sink$ = new ReplaySubject(1)

    return sink$
  }

  // We return the actual driver from our factory.
  return handshakeDriver
}