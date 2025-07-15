



const responseSuccess = (res, data , msg ) => {
    return res.status(200).json({
        result: true,
        message: msg,
        data: data
    });
}

const responseError = (res ,  msg) => {
    return res.status(400).json({
        result: false,
        message: msg
    });
}
module.exports = {
    responseSuccess,
    responseError
}