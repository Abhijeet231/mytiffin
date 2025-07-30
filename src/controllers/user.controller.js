import { asyncHandler } from "../utils/AsyncHandler.js";
import {ApiError} from "../utils/ApiErrors.js";
import {User} from "../models/user.model.js";
import {uploadOnCloudinary} from "../utils/cloudinary.js";
import {ApiResponse} from "../utils/ApiResponse.js";

//Generating Access and Refresh Token
const genAccessAndRefreshTkn = async(userId) =>{
    try{
       const user = await User.findById(userId);
       const accessToken = user.generateAccessToken();
       const refreshToken = user.generateRefreshToken();

       user.refreshToken = refreshToken;
       await user.save({validateBeforeSave: false});

       return {accessToken,refreshToken};

    }catch(err){
        throw new ApiError(500, 'Error while generating REFRESH and ACCESS token')
    }
}


//REGISTER USER 
const registerUser = asyncHandler (async(req,res) => {
   
    const {fullName, email, userName, password} = req.body;

//Schema Validation for User model
if(
    [fullName,email,userName,password].some((field) => field ?.trim() === "" )
){
    throw new ApiError(400, "All fields are Required !")
};

//Check for Duplicate Users
const existedUser =  await User.findOne({
    $or: [ { userName }, { email } ]
});

if(existedUser){
    throw new ApiError (409, 'User Already Exists')
};

// Hnadling images from Multer
const avatarLocalPath =  req.files?.avatar[0]?.path ; 
// const coverImgLocalPath = req.files?.coverImage[0]?.path;

let coverImgLocalPath;
if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
    coverImgLocalPath = req.files.coverImage[0].path
};


if(!avatarLocalPath){
    throw new ApiError(400, "Avatar file is required")
};

//Uploading to Cloudinary
const avatar = await uploadOnCloudinary(avatarLocalPath);
const coverImg = await uploadOnCloudinary(coverImgLocalPath);



if(!avatar){
    throw new ApiError(400, "Avatar file is required.. C..")
};


//Creating User and entry of that user to DBs
const user = await User.create({
    fullName,
    avatar: avatar.url,
    coverImg: coverImg?.url || "", //bcz we didn't check for coverimage
    email,
    password,
    userName: userName.toLowerCase()
});

 const createdUser =  await user.findById(user._id).select(
    "-password -refreshToken"
 ) // now these two fileds will not come 

if(!createdUser){
    throw new ApiError(500, "Something Went wrong while Registering the User.....")
}

return res.stauts(201).json(
    new ApiResponse(200, createdUser, "User Registered Successfully")
)

}); // end of register user .....


//LOGIN USER
const loginUser = asyncHandler (async(req,res) => {

    const {email, username, password} = req.body;
//checking if username or email matches or not
    if(!username || !email) {
        throw new ApiError(400, "username or email is required!")
    };

 const user = User.findOne({
         $or: [{username}, {email}]
    });

if(!user){
    throw new ApiError(404, "User does not exist")
} ;

//checking password
const isPassValid =  await user.isPasswordCorrect(password);

if(!isPassValid){
    throw new ApiError(401, "Incorrect Password")
};

const {accessToken,refreshToken} = await generateAccessToken(user._id);

const loggedInUser = await User.findById(user._id).select("-password -refreshToken"); 

//setting up cookie options
const options = {
    httpOnly: true,
    secure: true
};

return res
.stauts(200)
.cookie("accessToken", accessToken, options)
.cookie("refreshToken", refreshToken, options)
.json(
    new ApiResponse(
        200,
        {
            user: loggedInUser,accessToken,refreshToken
        },
        "User LoggedIn Successfully"
    )
)

});

//LOGOUT USER
const logoutUser = asyncHandler(async(req,res) => {
   await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined
            }
        },
        {
            new: true
        }
    )

    const options = {
        httpOnly: true,
        secure: true
    };

    return res
    .stauts(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User Logged Out "))
})





export {
    registerUser,
    loginUser,
    logoutUser
};