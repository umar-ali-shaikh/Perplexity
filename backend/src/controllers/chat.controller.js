import Chat from "../models/chat.model.js";
import Message from "../models/message.model.js"
import User from "../models/user.model.js";
import { generateResponse, generateChatTitle } from "../services/ai.service.js";

export const FREE_MESSAGE_LIMIT = 5;

export async function sendMessage(req, res) {
    try {
        const { message: messageText, chatId } = req.body;

        const updatedUser = await User.findOneAndUpdate(
            { _id: req.user.userId, messageCount: { $lt: FREE_MESSAGE_LIMIT } },
            { $inc: { messageCount: 1 } },
            { returnDocument: "after" }
        );

        if (!updatedUser) {
            return res.status(403).json({
                message: `You've used all ${FREE_MESSAGE_LIMIT} free messages. Upgrade to keep chatting.`,
                code: "MESSAGE_LIMIT_REACHED"
            });
        }

        try {
            let chat = null;

            if (chatId) {
                chat = await Chat.findOne({ _id: chatId, user: req.user.userId });

                if (!chat) {
                    throw Object.assign(new Error("Chat not found"), { statusCode: 404 });
                }
            } else {
                const title = await generateChatTitle(messageText);

                chat = await Chat.create({
                    user: req.user.userId,
                    title
                });
            }

            const userMessage = await Message.create({
                chat: chat._id,
                content: messageText,
                role: "user"
            });

            const history = await Message.find({ chat: chat._id }).sort({ createdAt: 1 });

            const aiResponseText = await generateResponse(
                history.map((msg) => ({ role: msg.role, content: msg.content }))
            );

            const aiMessage = await Message.create({
                chat: chat._id,
                content: aiResponseText,
                role: "ai"
            });

            chat.updatedAt = new Date();
            await chat.save();

            return res.status(201).json({
                chat,
                userMessage,
                aiMessage,
                messageCount: updatedUser.messageCount
            });
        } catch (error) {
            // Something failed after the message quota was already spent —
            // give it back so the user isn't charged for a message that never went through.
            await User.updateOne(
                { _id: req.user.userId },
                { $inc: { messageCount: -1 } }
            );

            throw error;
        }
    } catch (error) {
        console.error("sendMessage error:", error);

        const statusCode = error.statusCode || 500;

        res.status(statusCode).json({
            message: statusCode === 404 ? error.message : "Something went wrong while sending the message",
            ...(statusCode === 500 && { error: error.message })
        });
    }
}

export async function getChats(req, res) {
    try {
        const chats = await Chat.find({ user: req.user.userId }).sort({ updatedAt: -1 });

        res.status(200).json({
            message: "Chat retrieved successfully",
            chats
        })
    } catch (error) {
        console.error("getChats error:", error);

        res.status(500).json({
            message: "Something went wrong while retrieving chats",
            error: error.message
        });
    }
}


export async function getMessages(req, res) {
    try {
        const { chatId } = req.params;
        const chat = await Chat.findOne({
            _id: chatId,
            user: req.user.userId
        });

        if (!chat) {
            return res.status(404).json({
                message: "Chat not found"
            })
        }

        const messages = await Message.find({
            chat: chatId
        }).sort({ createdAt: 1 });

        return res.status(200).json({
            message: "Message retrieved successfully",
            messages
        })
    } catch (error) {
        console.error("getMessages error:", error);

        res.status(500).json({
            message: "Something went wrong while retrieving messages",
            error: error.message
        });
    }
}


export async function deleteChat(req, res) {
    try {
        const { chatId } = req.params;

        const chat = await Chat.findOneAndDelete({
            _id: chatId,
            user: req.user.userId
        })

        if (!chat) {
            return res.status(404).json({
                message: "Chat not found"
            })
        }

        await Message.deleteMany({
            chat: chatId
        })

        return res.status(200).json({
            message: "Chat deleted successfully"
        })
    } catch (error) {
        console.error("deleteChat error:", error);

        res.status(500).json({
            message: "Something went wrong while deleting the chat",
            error: error.message
        });
    }
}