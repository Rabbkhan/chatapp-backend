const express = require("express");
const { Server } = require("socket.io");
const getUserDetailsFromToken = require("../helpers/getUserDetailsFromToken");
const http = require("http");
const UserModel = require("../model/user.model");
const {
  ConversationModel,
  MessageModel,
} = require("../model/conversation.model");

const getConversation = require('../helpers/getConversation')
const app = express();

// Socket connection
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL,
    credentials: true,
  },
});

// Online users
const onlineUser = new Set();

io.on("connection", async (socket) => {
  console.log("connect user", socket.id);

  try {
    const token = socket.handshake.auth.token;
    const user = await getUserDetailsFromToken(token);

    if (!user) {
      console.log("Invalid token");
      socket.emit("error", "Invalid token");
      return socket.disconnect();
    }

    socket.join(user._id.toString());
    onlineUser.add(user._id.toString());

    io.emit("onlineUser", Array.from(onlineUser));

    socket.on("message-page", async (userId) => {
      console.log("userId", userId);

      const userDetails = await UserModel.findById(userId).select("-password");
      if (!userDetails) {
        console.log("User not found");
        socket.emit("error", "User not found");
        return;
      }

      const payload = {
        _id: userDetails._id,
        name: userDetails.name,
        profile_pic: userDetails.profile_pic,
        email: userDetails.email,
        online: onlineUser.has(userId),
      };

      socket.emit("message-user", payload);
      
      //previous message


      const getConversationMessage = await ConversationModel.findOne({
        $or: [
          { sender: user?._id, receiver: userId },
          { sender: userId, receiver: user?._id },
        ],
      })
        .populate("messages")
        .sort({ updatedAt: -1 });
     
        socket.emit("message", getConversationMessage?.messages || []);
     
        });





    // New message
    socket.on("new message", async (data) => {
      try {
        let conversation = await ConversationModel.findOne({
          $or: [
            { sender: data.sender, receiver: data.receiver },
            { sender: data.receiver, receiver: data.sender },
          ],
        });

        // If conversation is not available
        if (!conversation) {
          const createConversation = new ConversationModel({
            sender: data.sender,
            receiver: data.receiver,
          });

          conversation = await createConversation.save();
        }

        const message = new MessageModel({
          text: data.text,
          imageUrl: data.imageUrl,
          videoUrl: data.videoUrl,
          msgByUserId: data.msgByUserId,
        });

        const saveMessage = await message.save();

        await ConversationModel.updateOne(
          { _id: conversation._id },
          {
            $push: {
              messages: saveMessage._id,
            },
          }
        );

        const getConversationMessage = await ConversationModel.findOne({
          $or: [
            { sender: data.sender, receiver: data.receiver },
            { sender: data.receiver, receiver: data.sender },
          ],
        })
          .populate("messages")
          .sort({ updatedAt: -1 });
       
          socket.emit("message", getConversationMessage?.messages || []);
        console.log("getConversationMessage", getConversationMessage);
        io.to(data?.sender).emit(
          "message",
          getConversationMessage.messages || []
        );
        io.to(data?.receiver).emit(
          "message",
          getConversationMessage.messages || []
        );
      } catch (err) {
        console.error("Error in new message event", err);
        socket.emit("error", "Error sending message");
      }

      // send conversation 

      const conversationSender = await getConversation(data?.sender)
      const conversationReceiver = await getConversation(data?.receiver)

      io.to(data?.sender).emit(
        "conversation",conversationSender
      );
      io.to(data?.receiver).emit(
        "conversation",conversationReceiver
      );
    });


    // Sidebar
    socket.on("sidebar", async (currentUserId) => {
      const conversation = await getConversation(currentUserId)

      socket.emit("conversation", conversation)
    });



socket.on('seen',async(msgByUserId)=>{

const conversation = await ConversationModel.findOne({
  $or: [
    { sender: user?._id, receiver:msgByUserId },
    { sender: msgByUserId, receiver: user?._id },
  ],
})

const conversationMessageId = conversation?.messages || []

const updateMessages = await MessageModel.updateMany({
  _id: {"$in": conversationMessageId},
  msgByUserId : msgByUserId
},
{"$set": {seen :true}}
)


const conversationSender = await getConversation(user?._id.toString())
const conversationReceiver = await getConversation(msgByUserId)

io.to(user?._id.toString()).emit(
  "conversation",conversationSender
);
io.to(msgByUserId).emit(
  "conversation",conversationReceiver
);


})


    // Disconnect
    socket.on("disconnect", () => {
      onlineUser.delete(user._id.toString());
      socket.leave(user._id.toString());
      io.emit("onlineUser", Array.from(onlineUser));
      console.log("disconnect user", socket.id);
    });
  } catch (err) {
    console.error("Error in connection event", err);
    socket.emit("error", "Connection error");
    socket.disconnect();
  }
});

module.exports = {
  app,
  server,
};
