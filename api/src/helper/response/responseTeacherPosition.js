const responseSuccess = (res, data , msg ) => {
    return res.json({
        result: true,
        message: msg,
        data: data
    });
}

const responseError = (res ,  msg) => {
    return res.json({
        result: false,
        message: msg
    });
}


module.exports = {
    responseSuccess,
    responseError
}
