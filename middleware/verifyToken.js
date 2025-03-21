import dotenv from "dotenv";
import jwt from "jsonwebtoken";
dotenv.config();

const verifyToken = async(req, res, next) => {
    const token = req?.headers?.authorization?.split("")[1];
    if(!token){
        return res.status(401).send({message: "Unauthorized access"});
    }

    jwt.verify(token, process.env.JWT_SECRET, (error, decoded) => {
        if(error){
        return res.status(401).send({message: "Unauthorized access"});
        }
        req.user = decoded;
        next();
    })
  }

  export default verifyToken;