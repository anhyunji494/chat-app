const express = require('express');
const http = require('http');
const app = express();
const server = http.createServer(app);
const io = require('socket.io')(server, {
  cors: {
    origin: '*', // 모든 출처 허용. 보안상 주의가 필요하며, 프로덕션에서는 특정 도메인으로 제한하는 것이 좋습니다.
    methods: ['GET', 'POST'],
  },
});

const { addUser, removeUser, getUser, getUsersInRoom } = require('./users.js');

const PORT = process.env.PORT || 80;

// 라우터 설정
const router = require('./router');
app.use(router);

io.on('connection', (socket) => {
  console.log('We have a new connection!');

  socket.on('join', ({ name, room }, callback) => {
    const { error, user } = addUser({ id: socket.id, name, room });

    if (error) return callback(error);

    socket.emit('message', {
      user: 'admin',
      text: `${user.name}, welcome to the room ${user.room}`,
    });

    socket.broadcast.to(user.room).emit('message', {
      user: 'admin',
    });

    socket.join(user.room);

    io.to(user.room).emit('roomData', {
      room: user.room,
      users: getUsersInRoom(user.room),
    });

    callback();
  });

  socket.on('sendMessage', (message, callback) => {
    const user = getUser(socket.id);
    if (user) {
      io.to(user.room).emit('message', { user: user.name, text: message });
      io.to(user.room).emit('roomData', {
        room: user.room,
        users: getUsersInRoom(user.room),
      });
    } else {
      // 유효한 사용자가 없는 경우 처리
      console.log('Invalid user');
    }

    callback();
  });

  socket.on('disconnect', () => {
    const user = removeUser(socket.id);

    if (user) {
      io.to(user.room).emit('message', {
        user: 'admin',
        text: `${user.name} has left.`,
      });
      io.to(user.room).emit('roomData', {
        room: user.room,
        users: getUsersInRoom(user.room),
      });
    }
  });
});

// 서버 시작. '0.0.0.0'으로 바인딩
server.listen(PORT, '0.0.0.0', () =>
  console.log(`Server has started on port ${PORT}`)
);
