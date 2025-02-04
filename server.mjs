import { WebSocketServer } from 'ws'
import express from 'express'
import path from 'path'
import {createWsServer} from 'tinybase/synchronizers/synchronizer-ws-server'
import { fileURLToPath } from 'url'
import http from 'http'
import { createMergeableStore } from 'tinybase'
import { createWsSynchronizer } from 'tinybase/synchronizers/synchronizer-ws-client'
import sqlite3 from 'sqlite3'
import { createSqlite3Persister } from 'tinybase/persisters/persister-sqlite3'
import ReconnectingWebSocket from 'reconnecting-websocket'

// ------------------------------------
// Server
// ------------------------------------

const app = express()
const PORT = process.env.PORT || 3000
const VITE_WS_ADDRESS = process.env.VITE_WS_ADDRESS || `ws://localhost:${PORT}`
const __dirname = path.dirname(fileURLToPath(import.meta.url))

app
  .use(express.static(path.join(__dirname, 'dist')))
  .use((req, res) => {
    res.status(404).send('404 Not Found')
  })
  .get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'))
  })

const httpServer = http.createServer(app)
const wsServer = new WebSocketServer({ server: httpServer })
createWsServer(wsServer)

httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on http://localhost:${PORT}`)
})

// ------------------------------------
// SYNC and persist
// ------------------------------------

// synchronizer
const store = createMergeableStore().setTables({wallet: {}})
const synchronizer = await createWsSynchronizer(
  store,
  new ReconnectingWebSocket(`${VITE_WS_ADDRESS}`),
);
await synchronizer.startSync()
// persister
const db = new sqlite3.Database('database.sqlite')
const persister = createSqlite3Persister(store, db, 'wallet')
persister.load()
await persister.startAutoSave()
