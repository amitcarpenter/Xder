const { collection, getDocs } = require("firebase/firestore");
const { db } = require('../../config/firebase');
const { handleSuccess, handleError } = require('../../utils/responseHandler');


exports.getAllFirebaseUsers = async (req, res) => {
    try {
        const usersCollectionRef = collection(db, "user");
        const userDocs = await getDocs(usersCollectionRef);
        const usersList = userDocs.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        return handleSuccess(res, 200, "All Firebase User Data Retrieved", usersList);
    } catch (error) {
        return handleError(res, 500, "Failed to retrieve user data");
    }
};


exports.getChatGroups = async (req, res) => {
    try {
        const publicChatGroupRef = collection(db, "publicChatGroup");
        const privateChatGroupRef = collection(db, "privateChatGroup");
        const publicChatDocs = await getDocs(publicChatGroupRef);
        const privateChatDocs = await getDocs(privateChatGroupRef);
        const publicChats = publicChatDocs.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const privateChats = privateChatDocs.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        const data = {
            publicChatGroup: publicChats,
            privateChatGroup: privateChats
        };

        return handleSuccess(res, 200, "Data retrieved from both chat groups", data);
    } catch (error) {
        console.error("Error fetching chat groups:", error);
        return handleError(res, 500, "Failed to retrieve data from chat groups");
    }
};




