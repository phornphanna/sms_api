const responseSuccess = (res, data, message) => {
    return res.status(200).json({
        result: true,
        message: message,
        data : data
    });
}


const responseError = (res, message) => {
    return res.status(400).json({
        result : false ,
        message: message,
        data: null
    });
}


module.exports = {
    responseSuccess,
    responseError
}
