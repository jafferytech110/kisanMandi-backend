import jwt from "jsonwebtoken";

function jwtTokens({ phone_number }) {
    const user = {phone_number}
    // these env variables will be needed to set up during deployment process
    const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {expiresIn: '1h'})
    const refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET, {expiresIn: '6M'})
    return ({accessToken,refreshToken})
}

export {jwtTokens}
