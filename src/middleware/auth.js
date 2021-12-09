import jwt from 'jsonwebtoken'
import User from '../models/users.js'

const auth = async (req,res ,next)=>{
    try {
        const token = req.header('Authorization').replace('Bearer ','')
        
        const data=await jwt.verify(token,"jaymin")
        // console.log(data)
        const user = await User.findOne({_id:data._id,
            'tokens.token':token})
            if(!user){
                throw new Error("User not found")
            }
        req.user=user
        req.token=token
        next()
        
    } catch (error) {
        res.status(401).send("Please authenticate")
    }
}

export default auth