const express=require('express')
const socketio=require('socket.io')
const http=require('http')
const router=require("./router")
const app=express()
const server=http.createServer(app)
const io=socketio(server)
const PORT=process.env.PORT || 3000;
const cors = require('cors');

app.use(cors({
  origin: 'http://localhost:3001'
}));

io.on('connection',(socket)=>{
    console.log("We have a new connection");

    socket.on('join',({name,room})=>{
        
        console.log(name,room)
    })
    socket.on("message",({message,room})=>{
        console.log(message)
        socket.to(room).emit("received-message",message)
    })
    socket.on("join-room",(room)=>{
        console.log("Hi")
        socket.join(room)
    })
    socket.on("disconnect",()=>{
        console.log("User had left");
    })

})
app.use(router)
server.listen(PORT,()=>console.log('Server has started on the PORT '+PORT))
