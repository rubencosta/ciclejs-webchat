import {ReplaySubject} from 'rx'

export function makeLocalStorageDriver(keyName) {
  const localStorageDriver = source$ => {
    const sink$ = new ReplaySubject(1)

    source$.subscribe(data => {
      window.localStorage.setItem(keyName, data)
      sink$.onNext(data)
    })

    return sink$
  }

  return localStorageDriver
}

export function makeLocalStorageSourceDriver(keyName) {
  return () => Rx.Observable.just(localStorage.getItem(keyName))
}

export function makeLocalStorageSinkDriver(keyName) {
  return keyValue$ => {
    keyValue$.subscribe(keyValue => {
      localStorage.setItem(keyName, keyValue)
    })
  }
}
