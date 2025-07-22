const asyncHandler = (fn) => {
    return (req,res,next) => {
        Promise.resolve(fn(req,res,next)).catch((err) => next(err))
    }
}; // it will handle async errors specially and also sync errors.


// const asyncHandler = (fn) => (req,res,next) => Promise.resolve(fn(req,res,next)).catch(err => next(err))

export {asyncHandler}