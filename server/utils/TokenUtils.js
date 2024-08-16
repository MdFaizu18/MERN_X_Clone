import jwt from 'jsonwebtoken';

// using jwt sign method we are creating a token 
export const createToken = (payload) => {
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1d" });
    return token;
}

// using jwt verify method we are verifying the token
export const verifyToken = (token) => {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded;
}