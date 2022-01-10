
const JWT = require('jsonwebtoken')

// Error Messages
const SERVER_ERROR = {
    error: true,
    message: 'Something went wrong on server-side'
}
const AUTHORIZATION_HEADER_ERROR = {
    error: true,
    message: "Invalid Authorization Header"
}
const INVALID_TOKEN_ERROR = {
    error: true,
    message: "Invalid JWT Token"
}
const FORBIDDEN_ERROR = {
    error: true,
    message: "You are not permitted to perform this action"
}

function authourize (req, res, proceed) {

    if (!req.header('authorization')) {
        return res.status(401).send(AUTHORIZATION_HEADER_ERROR)
    }

    // If one exists, attempt to get the header data
    let token = req.header('authorization').split('Bearer ')[1]

    // If there's nothing after "Bearer", send an error
    if (!token) {
        return res.status(401).send(AUTHORIZATION_HEADER_ERROR)
    }

    // If there is something, attemp to decode the payload

    let decodedPayload = JWT.decode(token)

    // If there's no userId in the token payload, send an error
    if (!decodedPayload.userId) {
        return res.status(401).send(INVALID_TOKEN_ERROR)
    }

    let decodedUserId = decodedPayload.userId


    User
        .findOne({ id: decodedUserId })
        .exec(function (error, user) {

            if (error) {
                sails.log.error('Error in finding the user from db')
                return res.serverError(SERVER_ERROR)
            }

            // If the user can't be found, send an error
            if (!user) {
                sails.log.error('No user found')
                return res.forbidden(FORBIDDEN_ERROR)
            }

        
            let jwtSecret = process.env.JWT_SECRET + '-' + user.password
            sails.log.info('Verifying the signature of the JWT')
            JWT.verify(token, jwtSecret, function (error, payload) {

             
                if (error) {
    
                    return res.status(401).send(INVALID_TOKEN_ERROR)
                }

                // Set user in request object
                req.user = user


                return proceed()
            })
        })
};