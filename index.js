const express=require('express')
const socketio=require('socket.io')
const http=require('http')
const router=require("./router")
const mongoose=require("mongoose")
const app = express();
const server=http.createServer(app) 
app.use(express.json());
const io = require('socket.io')(server, {
    cors: {
        origin: "https://chat-app-frontend-1lqo.onrender.com",
        methods: ["GET", "POST"]
    }
});
const secretKey="12351235"
const PORT=process.env.PORT || 3001;
const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require("jsonwebtoken");
const User = require("./userModel");
app.use(cors());
app.use(bodyParser.json());
 
// Handling post request
app.post("/login",
    async (req, res, next) => {
        let { email, password } = req.body;
 
        let existingUser;
        try {
            existingUser =
                await User.findOne({ email: email });
        } catch {
            const error =
                new Error(
                    "Error! Something went wrong."
                );
            return next(error);
        }
        if (!existingUser
            || existingUser.password
            != password) {
            const error =
                Error(
                    "Wrong details please check at once"
                );
            return next(error);
        }
        let token;
        try {
            //Creating jwt token
            token = jwt.sign(
                {
                    userId: existingUser.id,
                    email: existingUser.email
                },
                secretKey,
                { expiresIn: "1h" }
            );
        } catch (err) {
            console.log(err);
            const error =
                new Error("Error! Something went wrong.");
            return next(error);
        }
 
        res
            .status(200)
            .json({
                success: true,
                data: {
                    userId: existingUser.id,
                    email: existingUser.email,
                    token: token,
                },
            });
    });
 
// Handling post request
app.post("/signup",
    async (req, res, next) => {
        const {
            name,
            email,
            password
        } = req.body;
        console.log(req.body)
        const newUser =
            User({
                name,
                email,
                password,
            });
 
        try {
            await newUser.save();
        } catch {
            const error =
                new Error("Error! Something went wrong.");
            return next(error);
        }
        let token;
        try {
            token = jwt.sign(
                {
                    userId: newUser.id,
                    email: newUser.email
                },
                secretKey,
                { expiresIn: "1h" }
            );
        } catch (err) {
            const error =
                new Error("Error! Something went wrong.");
            return next(error);
        }
        res
            .status(201)
            .json({
                success: true,
                data: {
                    userId: newUser.id,
                    email: newUser.email,
                    token: token
                },
            });
    });
 
//Connecting tok the database
mongoose
    .connect("mongodb+srv://nkumawat34:nkumawat34@cluster0.6msxxm4.mongodb.net/chat_app")
    .then(() => {
        app.listen("3000",
            () => {
                console.log("Server is listening on port 3000");
            });
    })
    .catch(
        (err) => {
            console.log("Error Occurred");
        }
    );
   
  

io.on('connection',(socket)=>{
    const token = socket.handshake.auth.token;
   
    if (!token) {
        console.error('Authentication error: Token not provided');
        socket.disconnect(true);
        return;
    }

    jwt.verify(token, secretKey, (err, decoded) => {
        if (err) {
            console.error('Authentication error:', err.message);
            socket.disconnect(true);
            return ;
           
        }
    })
    console.log("We have a new connection");

    socket.on('join',({name,room})=>{
        
        console.log(name,room)
    })
    socket.on("message",({message,room})=>{
        console.log(message)
        io.to(room).emit("received-message",message)
    })
    socket.on("join-room",(room)=>{
        console.log("Hi")
        socket.join(room)
    })
    socket.on("disconnect",()=>{
        console.log("User had left");
    })
    socket.on("single",({message,id})=>{
        console.log(id)
        io.to(id).emit("received-message",message)
      
    })

})

app.use(router)
server.listen(PORT,()=>console.log('Server has started on the PORT '+PORT))
