const jwt = require("jsonwebtoken");
 
const validateToken = async (req, res, next) => {
    let token;
    let authHeader = req.headers.authorization || req.headers.Authorization;
 
    if (authHeader && authHeader.startsWith("Bearer")) {
        token = authHeader.split(" ")[1];
 
        if (!token) {
            return res.status(401).json("This user is not authorized or token is missing");
        }
 
        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
            if (err) {
                return res.status(401).json("This user is not authorized");
            }
            req.user = decoded.user;
            next();
        });
    } else {
        return res.status(401).json("This user is not authorized or token is missing");
    }
};
 
 
module.exports = validateToken;