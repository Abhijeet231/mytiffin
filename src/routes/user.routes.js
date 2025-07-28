import { Router } from "express";
import { registerUser } from "../controllers/user.controller.js";
import {upload} from "../middleware/multer.middleware.js"

const router = Router();

router.route("/register").post(
    upload.fields([
      {
        name: "avatar", // same name in frontend
        maxCount: 1
      }, // this is first object
      {
        name: 'coverImage', // same name in frontend
        maxCount: 1
      } // this is second object , if supposed to take another then just create another object after this . 
    ]),
    registerUser
);

export default router;