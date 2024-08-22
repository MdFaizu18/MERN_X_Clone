import notificationModel from "../models/notificationModel";

// to get the notification to show them to user 
export const getNotifications = async (req, res) => {
    try {
        const userId = req.user;
        const notifications = await notificationModel.find({ to: userId })
            .populate({
                path: "from",
                select: "userName profileImg"
            });
        await notificationModel.updateMany({ to: userId }, { read: true });
        res.status(200).json(notifications);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

// to all the delete the notification 
export const deleteNotification = async (req, res) => {
    try {
     const userId = req.user;
     await notificationModel.deleteMany({ to: userId });  
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

