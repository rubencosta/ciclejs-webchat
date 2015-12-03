import {Observable} from 'rx'

export function makeLocalStorageSourceDriver(keyName) {
  return () => Observable.just(window.localStorage.getItem(keyName))
}

export function makeLocalStorageSinkDriver(keyName) {
  return keyValue$ => {
    keyValue$.subscribe(keyValue => {
      window.localStorage.setItem(keyName, keyValue)
    })
  }
}
