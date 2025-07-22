import { asyncHandler } from "../utils/AsyncHandler.js";


const registerUser = asyncHandler (async(req,res) => {
    res.send('hellow batman..')
    
    
});


export {registerUser}