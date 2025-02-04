import { WebSocketServer } from 'ws'
import {createWsServer} from 'tinybase/synchronizers/synchronizer-ws-server'
import { createMergeableStore } from 'tinybase'
import { createWsSynchronizer } from 'tinybase/synchronizers/synchronizer-ws-client'
import sqlite3 from 'sqlite3'
import { createSqlite3Persister } from 'tinybase/persisters/persister-sqlite3'

// ------------------------------------
// Server
// ------------------------------------

const PORT = process.env.PORT || 3000
const VITE_WS_ADDRESS = process.env.VITE_WS_ADDRESS || `ws://localhost:${PORT}`
const wsServer = new WebSocketServer({ port: PORT })
createWsServer(wsServer)
console.log(`WebSocket server started on ${VITE_WS_ADDRESS}`)

// ------------------------------------
// SYNC and persist
// ------------------------------------

// synchronizer
const store = createMergeableStore().setTables({wallet: {}})
const synchronizer = await createWsSynchronizer(
  store,
  new WebSocket(`${VITE_WS_ADDRESS}`),
);
await synchronizer.startSync()
// persister
const db = new sqlite3.Database('database.sqlite')
const persister = createSqlite3Persister(store, db, 'wallet')
persister.load()
await persister.startAutoSave()
