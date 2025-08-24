
const responseSuccess = (res , msg , data) =>{
      return res.json({
            result: true,
            message: msg,
            data: data
      })
}

const responseError = (res , msg ) =>{
         return res.json({
            result: false,
            message: msg,
            data: null
      })
}


module.exports = {
      responseSuccess,
      responseError
}