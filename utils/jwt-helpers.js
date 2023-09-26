import jwt from "jsonwebtoken";

function jwtTokens({ phone_number }) {
  const user = { phone_number };

  // These env variables will be needed to set up during the deployment process
  const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '24h' });
  const refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '365d' });
  return ({accessToken,refreshToken});
}

export { jwtTokens };
