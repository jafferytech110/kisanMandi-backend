import jwt from 'jsonwebtoken';

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization']; // Bearer TOKEN
    const token = authHeader && authHeader.split(' ')[1];
    
    if (token == null) {
        return res.status(401).json({ error: "Null Token" });
    }
    
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (error, user) => {
        if (error) {
            console.error("Token verification error:", error.message);
            return res.status(403).json({ error: "Token verification failed" });
        }
        req.user = user;
        next();
    });
}

export { authenticateToken };
