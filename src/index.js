/** @jsx hJSX */
require('./app.styl')
import {run} from '@cycle/core'
import {makeDOMDriver} from '@cycle/dom'

import {makeLocalStorageSinkDriver, makeLocalStorageSourceDriver} from './drivers'
import chat from './chat/chat'

const main = chat

run(main, {
  DOM: makeDOMDriver(`#app`),
  LocalStorageSource: makeLocalStorageSourceDriver(`webchat-cycle`),
  LocalStorageSink: makeLocalStorageSinkDriver(`webchat-cycle`),
})
