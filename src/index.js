/** @jsx hJSX */

import {run} from '@cycle/core'
import {makeDOMDriver} from '@cycle/dom'

import chat from './chat/chat'

const main = chat

run(main, {
  DOM: makeDOMDriver('#app'),
  //localStorageSource: CustomDrivers.makeLocalStorageSourceDriver('todos-cycle'),
  //localStorageSink: CustomDrivers.makeLocalStorageSinkDriver('todos-cycle'),
  initialModel: () => Rx.Observable.just({
      chats: [
        {
          id: 1,
          user: {
            id: 2,
            profilePicture: "https://avatars0.githubusercontent.com/u/7922109?:3&:460",
            name: "Ryan Clark"
          },
          messages: [{
            contents: "Hey!", from: 2, timestamp: 1424469793023
          },
            {
              contents: "He, what's up?", from: 1, timestamp: 1424469794000
            }]
        },
        {
          id: 2,
          user: {
            id: 3,
            profilePicture: "https://avatars3.githubusercontent.com/u/2955483?:3&:460",
            name: "Jilles Soeters"
          },
          messages: [{
            contents: "Want a game of ping pong?", from: 3, timestamp: 1424352522000
          }]
        },
        {
          id: 3,
          user: {
            id: 4,
            profilePicture: "https://avatars1.githubusercontent.com/u/1655968?:3&:460",
            name: "JTodd Motto"
          },
          messages: [{
            contents: "Please follow me on twitter I'll pay you", from: 4, timestamp: 1424423579000
          }]
        }
      ]
    }
  ),
  hashchange: () => Rx.Observable.fromEvent(window, 'hashchange')
});