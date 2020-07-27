<template>
  <v-container>
    <v-list>
      <v-subheader>rooms</v-subheader>
      <v-list-item-group color="primary">
        <v-list-item
          v-for="(roomId, i) in this.roomIds"
          :key="i"
        >
          <v-list-item-content>
            <v-list-item-title v-text="roomId"></v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list-item-group>
    </v-list>
    <v-form ref="form" @submit.prevent v-model="valid">
      <v-row>
        <v-col
          cols="12"
        >
          <v-text-field
            v-model="roomId"
            :rules="roomIdRules"
            :counter="4"
            label="ROOM ID"
            required
            @change="clearErrorMessage"
          ></v-text-field>
        </v-col>
      </v-row>
      <v-row v-if="errorMessage != ''">
        <v-col
          cols="12"
        >
          <span class="error--text">{{errorMessage}}</span>
        </v-col>
      </v-row>
      <v-btn block x-large color="primary" @click="create">ルームを新しく作成する</v-btn>
    </v-form>
  </v-container>
</template>

<script>
import io from 'socket.io-client'

export default {
  data: () => ({
    socket: io(),
    roomId: '',
    roomIds: [],
    valid: false,
    errorMessage: '',
    roomIdRules: [
      v => !!v || 'ROOM IDは必須です',
      v => v.length == 4 || 'ROOM IDは4文字の半角数字です',
      v => /^[0-9]{4}$/.test(v) || 'ROOM IDは4文字の半角数字です'
    ]
  }),
  mounted() {
    this.socket.on('connect', socket => {
      this.socket.emit('get-rooms')
      this.socket.on('send-rooms', (roomIds) => {
        this.roomIds = roomIds
      })
    })
  },
  methods: {
    clearErrorMessage: function() {
      this.errorMessage = ''
    },
    create: function() {
      if (!this.valid) {
        return
      }
      this.socket.emit('is-room-exist', this.roomId, (result) => {
        if (!result) {
          this.socket.emit('create-room', this.roomId)
        } else {
          this.errorMessage = this.roomId + 'は存在します。違うIDを入力してください。'
        }
      })
    },
  }
}
</script>
