const HttpStatusCode = require("../utils/httpStatusCodes");
const AppError = require("../utils/appError");
const { chat } = require("../ai_chat_bot/openaiChat");

// chat bot controller
const chatController = async (req, res, next) => {
    const userInput = req.body.message;

    if (!userInput) {
        return res.status(HttpStatusCode.BAD_REQUEST).send({
            message: 'Please enter a message',
        });
    }

    try {
        const message = await chat(userInput);
        res.status(HttpStatusCode.OK).json({
            status: 'success',
            data: {
                message
            }
        });
    } catch (error) {
        console.error('Error in chatController:', error);
        const err = new AppError('Error sending message', HttpStatusCode.INTERNAL_SERVER_ERROR);
        next(err);
    }

}

module.exports = chatController;
