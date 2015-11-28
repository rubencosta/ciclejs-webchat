/** @jsx hJSX */
import {hJSX} from '@cycle/dom'
import Rx from 'rx'
import classNames from 'classnames'

function chatListItem(sources) {
  const view = ({chat, selected}) => {
    const className = classNames(`mdl-navigation__link`, {active: selected})
    const lastMessage = [...chat.messages].reverse().shift()
    return (
      <a className={className} href={`#/${chat.id}`}>
        <div className="chat-list-item">
          <div className="chat-list-image"
               style={{backgroundImage: `url("${chat.user.profilePicture}")`}}>
          </div>
          <div className="chat-list-name">
            {chat.user.name}
          </div>
          <div className="chat-user-list-timestamp">{lastMessage.timestamp}</div>
          <div className="chat-user-list-message">{lastMessage.contents}</div>
        </div>
      </a>
    )
  }
  return {
    DOM: sources.props$.map(props => view(props)),
  }
}

function chatMessageItem(sources) {
  const view = ({message, isReply}) => {
    const className = classNames(`chat-message-item`, {'reply-message': isReply})
    return (
      <div className={className}>
        <div className="mdl-shadow--2dp chat-message-item-content">{message.contents}</div>
      </div>
    )
  }
  return {
    DOM: sources.props$.map(props => view(props)),
  }
}

export default sources => {
  const sourceChatData$ = sources.LocalStorageSource
    .map(json => JSON.parse(json) || {})
    .map(chatData => Object.assign({
      chats: [
        {
          id: 1,
          user: {
            id: 2,
            profilePicture: `https://avatars0.githubusercontent.com/u/7922109?:3&:460`,
            name: `Ryan Clark`,
          },
          messages: [{
            contents: `Hey!`,
            from: 2,
            timestamp: 1424469793023,
          },
            {
              contents: `He, what's up?`,
              from: 1,
              timestamp: 1424469794000,
            }],
        },
        {
          id: 2,
          user: {
            id: 3,
            profilePicture: `https://avatars3.githubusercontent.com/u/2955483?:3&:460`,
            name: `Jilles Soeters`,
          },
          messages: [{
            contents: `Want a game of ping pong?`,
            from: 3,
            timestamp: 1424352522000,
          }],
        },
        {
          id: 3,
          user: {
            id: 4,
            profilePicture: `https://avatars1.githubusercontent.com/u/1655968?:3&:460`,
            name: `JTodd Motto`,
          },
          messages: [{
            contents: `Please follow me on twitter I'll pay you`,
            from: 4,
            timestamp: 1424423579000,
          }],
        },
      ],
      openChatId: 1,
    }, chatData))

  const intent = ({DOM}) => ({
    changeOpenChat$: DOM
      .select(`a`)
      .events(`click`)
      .map(event => parseInt(
        event.currentTarget.getAttribute(`href`).replace(`#/`, ``))
      ),
    newMessage$: DOM
      .select(`input`)
      .events(`keydown`)
      .filter(event => event.keyCode === 13)
      .map(event => ({
        contents: event.target.value,
        timestamp: Date.now(),
        from: 1,
      })),
  })
  const model = (actions, chatData$) => chatData$
    .merge(
      Rx.Observable.merge(
        actions.changeOpenChat$
          .map(openChatId => chatData => {
            chatData.openChatId = openChatId
            return chatData
          }),
        actions.newMessage$
          .map(newMessage => chatData => {
            chatData.chats
              .filter(chat => chat.id === chatData.openChatId)
              .shift()
              .messages.push(newMessage)
            return chatData
          })
      )
    )
    .scan((chatData, modifier) => {
      return modifier(chatData)
    })

  const view = state$ => {
    const renderChatList = state =>
      <div className="mdl-layout__drawer">
        <span className="mdl-layout-title">Cycle.js Chat</span>
        <nav className="mdl-navigation">
          {state.chats
            .sort((a, b) => {
              const lastMessageChatA = [...a.messages].reverse().shift()
              const lastMessageChatB = [...b.messages].reverse().shift()
              if (lastMessageChatA.timestamp > lastMessageChatB.timestamp) {
                return -1
              }
              if (lastMessageChatA.timestamp < lastMessageChatB.timestamp) {
                return 1
              }
              return 0
            })
            .map(chat => chatListItem(
              {
                props$: Rx.Observable.just({
                  chat: chat,
                  selected: state.openChatId === chat.id,
                }),
              }
              ).DOM
            )}
        </nav>
      </div>
    const renderChatMessages = state =>
      <main className="mdl-layout__content">
        <div className="page-content">
          {
            state.chats
              .filter(chat => state.openChatId === chat.id)
              .map(chat => chat.messages)
              .shift()
              .map(message => chatMessageItem({
                props$: Rx.Observable.just({
                  message: message,
                  isReply: message.from === 1,
                }),
              }).DOM)
          }
        </div>
        <div className="chat-reply-box">
          <input type="text" value="" placeholder="Type here and press enter to reply..."/>
        </div>
      </main>

    return state$.map(state =>
      <div className="mdl-layout mdl-js-layout mdl-layout--fixed-drawer">
        {renderChatList(state)}
        {renderChatMessages(state)}
      </div>
    )
  }

  const actions = intent(sources)
  const state$ = model(actions, sourceChatData$)

  return {
    DOM: view(state$),
    LocalStorageSink: state$.map(state => JSON.stringify(state)),
  }
}
