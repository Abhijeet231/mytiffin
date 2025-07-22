import mongoose from "mongoose";
import {DB_NAME} from "../constants.js"

const connectDB = async () => {

    try {
        const connectionInstanse = await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`);
    }catch(err){
        console.log('MONGODB CONNECTION ERROR :' , err);
        process.exit(1);
        
    }
}

export default connectDB ;
