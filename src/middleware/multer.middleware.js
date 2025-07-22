import multer from "multer";

const Storage = multer.diskStorage ({
    destination: function (req,file,cb){
        cb(null, "./public/temp")
    },
    filename: function(req,file,cb){
        cb(null,file.originalname) // can tweak later file.filename or anything other , visite multer npm docs
    }
});

export const upload = multer({
    storage: Storage
})