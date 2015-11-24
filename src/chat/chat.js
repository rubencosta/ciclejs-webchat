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

function ChatList(sources) {
  const intent = ({DOM}) => ({
    changeOpenChat$: DOM
      .select('a')
      .events('click')
      .map(event => {
        return event.target.getAttribute('href').replace('#/', '')
      })
  })

  const actions = intent(sources)


  return {
    DOM: sources.initialModel
      .combineLatest(
        actions.changeOpenChat$.startWith(1),
        (intialModel, openChatId) => {
          return (
            <nav>
              <ul>
                {intialModel.chats.map(chat => ChatListItem({
                    props$: Rx.Observable.just({
                      chat: chat,
                      selected: openChatId == chat.id,
                    }),
                  }).DOM
                )}
              </ul>
            </nav>
          )
        }
      )
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

function ChatMessages({initialModel}) {
  // TODO: change defaultModel to sources
  return {
    DOM: initialModel
      .map(model => model.chats[model.openChatId].messages)
      .map(messages =>
          <div>
            {messages.map(message => ChatMessageItem({
                props$: Rx.Observable.just({
                  message: message
                })
              }).DOM
            )}
          </div>
        )
  }
}

export default sources => {
  const intent = ({DOM, initialModel}) => ({
    changeOpenChat$: DOM
      .select('a')
      .events('click')
      .map(event => {
        return event.target.getAttribute('href').replace('#/', '')
      })
  })

  const actions = intent(sources)

  const chatList = ChatList(sources)
  const chatMessages = ChatMessages(sources)

  const sinks = {
    DOM: Rx.Observable
      .just(<h1>Cicle WebChat</h1>)
      .combineLatest(
        chatList.DOM,
        chatMessages.DOM,
        (title, chatList, chatMessages) =>
          <div>
            {title}
            <aside>
              {chatList}
            </aside>
            <main>
              {chatMessages}
            </main>
          </div>
      )
  }

  return sinks
}
