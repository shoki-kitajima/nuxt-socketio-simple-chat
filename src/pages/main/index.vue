<template>
  <v-container>
    <v-form v-model="valid">
      <v-row>
        <v-col
          cols="4"
        >
          <v-text-field
            v-model="name"
            label="name"
            required
          ></v-text-field>
        </v-col>

        <v-col
          cols="8"
        >
          <v-text-field
            v-model="message"
            label="message"
            required
          ></v-text-field>
        </v-col>
      </v-row>
      <v-row id="submit">
        <v-btn block color="primary" @click="send">submit</v-btn>
      </v-row>
    </v-form>
    <div id="message">
      <div
        class="message__row"
        v-for="log in reversedMessages"
        :key="log.time"
        v-bind:class="{ self: name == log.name}"
      >
        <span class="name">{{ log.name }}</span>
        <p>
          {{ log.body}}
        </p>
        <span class="time">{{ log.time }}</span>
      </div>
    </div>
  </v-container>
</template>

<script>
import io from 'socket.io-client'

export default {
  data: () => ({
    socket: {},
    roomId: null,
    valid: false,
    name: '',
    message: '',
    messages: []
  }),
  mounted() {
    this.socket = this.$route.params.socket
    this.roomId = this.$route.params.roomId
    this.socket.on('send-message', (message) => {
      this.messages.push(message)
    })
  },
  computed: {
    reversedMessages: function() {
      return this.messages.concat().reverse()
    }
  },
  methods: {
    send: function() {
      this.socket.emit('message',
        this.roomId,
        {
          name: this.name,
          body: this.message,
          time: new Date().toLocaleString()
        }
      )
    }
  }
}
</script>

<style scoped>
  #message {
    margin-top: 15px;
  }
  #message .row {
    padding: 0;
  }
  #submit {
    padding: 12px;
  }
  .message__row {
    position: relative;
  }
  .message__row p {
    padding-top: 15px;
    padding-bottom: 15px;
  }
  .message__row span {
    font-size: 3px;
    color: #bbb;
    position: absolute;
  }
  .time {
    bottom: 0;
  }
  .self {
    text-align: right;
  }
  .self span {
    right: 0;
  }
</style>
