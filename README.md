# Nuxt.js + socket.ioでルーム機能付きチャットアプリケーションのサンプル

## 1. 概要

socket.ioのルーム機能を使って簡単なチャットを作ります。

簡単化のため、DBへの永続化はせずチャットデータを持つことはしません。

jsが受信したデータをメモリに格納し、ブラウザに描画されたらそれっきりという形です。

Nuxt + socket.ioでさくっと何かを作る時に「どうやるんだっけ」という

コンポーネントフレームワークはVuetify.jsを使うこととします。

## 2. 動作確認

当リポジトリクローン後

```
docker-compose build
docker-compose up
```

## 3. 開発準備

### 3-1. 開発環境用意

/docker/nuxt/Dockerfileにある通り、nodeのイメージを利用します。

/docker-compose.ymlも最小限に書いておきます。

この段階でビルドだけしておきます。

```
docker-compose build
```

### 3-2. Nuxt.jsアプリケーションの作成

Nuxt.js公式が用意してくれているcli、create-nuxt-appを利用します。

[公式にも手順がある](https://ja.nuxtjs.org/guide/installation/)のでそちらを参考に以下のコマンドを叩いていきます。

```
# docker コンテナ内bashを叩く
docker-compose run nuxt bash

# SAOError or fiberのerror防止(2020/07/27エラー確認)にnode-gypをいれる。
# 解決しないようならDockerfileに入れてしまってもよいかも
yarn global add node-gyp

# 3系だとcustom server frameworkが選べないので今回は2.15をいれる。3系を使う場合はserverMiddlewareでExpressを使う
yarn global add create-nuxt-app@2.15.0

# Nuxt.jsのinstall用cliを利用してアプリケーションの雛形を作成
create-nuxt-app
```

作成時オプションを選べますが、今回は以下の通りに進めます。

```
? Project name nuxt-socketio-simple-chat
? Project description sample
? Author name 
? Choose programming language JavaScript
? Choose the package manager Yarn
? Choose UI framework Vuetify.js
? Choose custom server framework Express
? Choose Nuxt.js modules 
? Choose linting tools 
? Choose test framework None
? Choose rendering mode Universal (SSR)
? Choose development tools 
```

これで雛形が作成できました。

```
# コンテナのbashを終了
exit

# docker-compose起動
docker-compose up
```

この状態で[http://localhost:3000/](http://localhost:3000/)へアクセスするとVuetify＋nuxtのwelcomeページが起動されるはず。


### 3-3. socket.ioのインストール

```
# 再度コンテナ内bashを叩く
docker-compose run nuxt bash

# socket.ioのインストール
yarn add socket.io
yarn add socket.io-client
```

### 3-4. socket.io起動処理を書く

**server/index.js L27付近**

server変数を用意しておく

```
  let server = app.listen(port, host)
```

**server/index.js L34付近**

```
  // WebSocketの起動
  socketStart(server)
```

**server/index.js start()前にsocket.io用通信処理をまとめる場所を用意する**

```
function socketStart(server) {
}
```

以降server/index.jsではこのfunction内にsocket.io用通信処理を定義していく。

client側はsocket.io-clientをimportするだけでほとんどあとはライブラリ側がやってくれる。

client側とserver側で、送信する処理<->受信した際の処理 という形で相互にイベントのやり取りを定義していく。

## 4. ルーム作成画面

**pages/index.vue**

vue部分は説明省略

**server/index.js L38付近**

```
// roomID配列定義
let roomIds = []
```

**server/index.js socketStart内**

```
    ...
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
      // 更新したら通知を送る
      socket.emit('send-rooms', roomIds)
    })
    ...
```

このようにイベントを定義していく。

## 5. チャット画面

**vue部分は省略**

**server/index.js**

```
    // messageの送信
    socket.on('message', (roomId, message) => {
      io.in(roomId).emit('send-message', message)
    })
```

自身を含むルーム参加者に送信としている。[socket.ioの公式にあるチートシート](https://socket.io/docs/emit-cheatsheet/)を見るとよい。


## 6. herokuで動かす場合

src直下にProcfileを作成。

以下の内容を貼り付け

```
web: npm run start
```

srcディレクトリを独立させたgit管理下に置いてheroku cliか何かでプッシュしてやれば多分動く