const express = require('express')
const consola = require('consola')
const { Nuxt, Builder } = require('nuxt')
const app = express()

// Import and Set Nuxt.js options
const config = require('../nuxt.config.js')
config.dev = process.env.NODE_ENV !== 'production'

async function start () {
  // Init Nuxt.js
  const nuxt = new Nuxt(config)

  const { host, port } = nuxt.options.server

  await nuxt.ready()
  // Build only in dev mode
  if (config.dev) {
    const builder = new Builder(nuxt)
    await builder.build()
  }

  // Give nuxt middleware to express
  app.use(nuxt.render)

  // Listen the server
  let server = app.listen(port, host)
  consola.ready({
    message: `Server listening on http://${host}:${port}`,
    badge: true
  })

  // WebSocketの起動
  socketStart(server)
}

// roomID配列定義
let roomIds = []
let messages = {}

function socketStart(server) {
  const io = require('socket.io').listen(server)
  io.on('connection', socket => {

    // サーバ側で保持しているルームの一覧（ID）をクライアントに送る
    socket.on('get-rooms', () => {
      socket.emit('send-rooms', roomIds)
    })
    // ルームの存在チェック
    socket.on('is-room-exist', (targetRoomId, callback) => {
      callback(roomIds.findIndex(existRoomId => existRoomId == targetRoomId) > -1)
    })

    // ルームを作成する処理。サーバ側で配列に保持
    socket.on('create-room', roomId => {
      roomIds.push(roomId)
      // 更新したら全体に通知を送る
      io.emit('send-rooms', roomIds)
    })

    // roomへの参加
    socket.once('join', (roomId, callback) => {
      socket.join(roomId)
      callback()
    })

    // messageの送信
    socket.on('message', (roomId, message) => {
      io.in(roomId).emit('send-message', message)
    })
  })
}

start()
