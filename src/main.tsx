import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { createMergeableStore, createStore } from 'tinybase'
import { createWsSynchronizer } from 'tinybase/synchronizers/synchronizer-ws-client'
import {createIndexedDbPersister} from 'tinybase/persisters/persister-indexed-db'
import ReconnectingWebSocket from 'reconnecting-websocket'

const WS_ADDRESS = import.meta.env.VITE_WS_ADDRESS || 'ws://localhost:3000'

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then(
      (registration) => {
        console.log('SW registered: ', registration)
      },
      (registrationError) => {
        console.log('SW registration failed: ', registrationError)
      }
    )
  })
}

const appStore = createStore().setTables({app: {ws: {
  connected: false,
  syncPending: false,
}}});

// Store Synch
const store = createMergeableStore().setTables({assets: {}, wallet: {}});
const ws = new ReconnectingWebSocket(WS_ADDRESS);
(async () => {
  // const synchronizer2 = await createWsSynchronizer(store, new ReconnectingWebSocket(WS_ADDRESS));
  const synchronizer2 = await createWsSynchronizer(store, ws);
  await synchronizer2.startSync();
})();
ws.addEventListener('open', () => {
  if (!appStore.getRow('app', 'ws').connected) appStore.setRow('app', 'ws', {connected: true});
  else appStore.setRow('app', 'ws', {syncPending: true});
});
// Store Offline Persister
(async () => {
  const persister = createIndexedDbPersister(store, 'theFactoryStore');
  persister.load();
  await persister.startAutoSave();
})();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App store={store} appStore={appStore}/>
  </StrictMode>,
)
