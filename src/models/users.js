import validator from "validator"
import  mongoose from "mongoose"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"

const schema = new mongoose.Schema({
    name:{
        type: String,
        require: true,
        trim: true
    },
    email:{
        type: String,
        // unique: true,
        require: true,
        trim: true,
        lowercase: true,
        validate(value) {
            if(!validator.isEmail(value)){
                throw new Error("email is invalid")
            }
        }
    },
    age:{
        type: Number,
        default: 0,
        validate(value) {
            if(value < 18 && value < 0) {
                throw new Error('Age must have positive or greter than 18')
            }
        }
    },
    password:{
        type: String,
        miLength:6,
        trim: true,
        
    },
    avatar:{
        type:Buffer
    },
    tokens:[
        {
            token:{
                type:String,
                required:true
            }
        }
    ]

},{
    timestamps:true
})

schema.virtual("tasks",{
    ref:'Task',
    localField:'_id',
    foreignField:'owner'
})

//hide private data
schema.methods.toJSON=function(){
    let user=this
    let userObject=user.toObject()
    delete userObject.password
    delete userObject.tokens
    return userObject
}

schema.methods.generateTokens= async function(){
    let user=this
    let token=await jwt.sign({
        _id:user._id.toString()
    },"jaymin")

    user.tokens = user.tokens.concat({token})
    await user.save()

    return token
}

schema.statics.findByCredentials = async(email, password)=>{
    const user = await User.findOne({ email })
    if(!user){
        throw new Error ("Unable to login")
    }
    const isMatch = await bcrypt.compare(password, user.password)

    if(!isMatch){
        throw new Error ("password does not match")
    }

    return user
}

schema.pre("save",async function(next){
    const user=this;

    if(user.isModified("password")){
        user.password= await bcrypt.hash(user.password,8)
    }
    
    next();
})

const User = mongoose.model('User', schema)

export default User
