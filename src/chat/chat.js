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
  const intent = ({DOM, initialModel}) => ({
    changeOpenChat$: DOM
      .select('a')
      .events('click')
      .map(event => {
        return parseInt(event.target.getAttribute('href').replace('#/', ''))
      }),
    chats$: initialModel.map(model => model.chats)
  })

  const model = actions => actions.changeOpenChat$
    .startWith(1)
    .combineLatest(
      actions.chats$,
      (openChatId, chats) => ({
        chats,
        openChatId
      }))

  const view = state$ => {
    const title$ = Rx.Observable.just(<h1>Cicle WebChat</h1>)
    const chatList$ = state$.map(state =>
      <nav>
        <ul>
          {state.chats.map(chat => ChatListItem({
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

  return {DOM: view(model(intent(sources)))}
}
