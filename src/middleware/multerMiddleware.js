import multer from "multer";

const storage = multer.memoryStorage();

export const uploadImage = multer({ storage });
