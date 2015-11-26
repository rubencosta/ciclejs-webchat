/** @jsx hJSX */
import {hJSX} from '@cycle/dom'
import Rx from 'rx'

function ChatListItem(sources) {
  const view = ({chat, selected}) =>
    <li style={selected ? {backgroundColor: 'green'} : {}}>
      <a href={`#/${chat.id}`}>{chat.user.name}</a>
    </li>
  return {
    DOM: sources.props$.map(props => view(props))
  }
}

function ChatMessageItem(sources) {
  const view = ({message}) =>
    <div>
      <p>
        {message.contents}
      </p>
    </div>
  return {
    DOM: sources.props$.map(props => view(props))
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
      ],
      openChatId: 1
    }, chatData))


  const intent = ({DOM}) => ({
    changeOpenChat$: DOM
      .select('a')
      .events('click')
      .map(event => parseInt(event.target.getAttribute('href').replace('#/', ''))),
    newMessage$: DOM
      .select('input')
      .events('keydown')
      .filter(event => event.keyCode === 13)
      .map(event => ({
        contents: event.target.value,
        timestamp: Date.now(),
        from: 1
      }))
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
            chatData.chats[chatData.openChatId - 1].messages.push(newMessage)
            return chatData
          })
      )
    )
    .scan((chatData, modifier) => {
      return modifier(chatData)
    })

  const view = state$ => {
    const title$ = Rx.Observable.just(<h1>Cicle WebChat</h1>)
    const chatList$ = state$.map(state =>
      <nav>
        <ul>
          {state.chats
            .map(chat => ChatListItem({
                props$: Rx.Observable.just({
                  chat: chat,
                  selected: state.openChatId === chat.id,
                }),
              }).DOM
            )}
        </ul>
      </nav>
    )
    const chatMessages$ = state$.map(state =>
      <div>
        {state.chats
          .filter(chat => state.openChatId === chat.id)
          .map(chat => chat.messages.map(message => ChatMessageItem({
              props$: Rx.Observable.just({
                message: message
              })
            }).DOM)
          )}
      </div>
    )
    return Rx.Observable.combineLatest(
      title$,
      chatList$,
      chatMessages$,
      (title, chatList, chatMessages) =>
        <div>
          {title}
          <aside>
            {chatList}
          </aside>
          <main>
            {chatMessages}
            <input type="text"/>
          </main>
        </div>
    )
  }

  const actions = intent(sources)
  var state$ = model(actions, sourceChatData$)

  return {
    DOM: view(state$),
    LocalStorageSink: state$.map(state => JSON.stringify(state))
  }
}
