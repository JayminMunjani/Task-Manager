import User from "../models/users.js"
import express from "express"
import auth from "../middleware/auth.js"
import multer from "multer"
import sharp from "sharp"

const router = new express.Router()

/*router.get("/users/:id",async(req,res)=>{
    
    const _id = req.params.id
    try{
        const user = await User.findById(_id)
        if(!user){
            return res.status(404).send()
        }
        res.send(user)
    }catch(error){
        res.status(400).send(error)
    }
})*/

router.get("/users/me",auth, async(req,res)=>{
    try{
        
        // const data = await User.find()
        res.send(req.user)
    }catch(error){
        res.status(404).send(error)
    }
})

router.post("/users/login",async(req,res)=>{
    try {
        const {email,password}= req.body
        const user = await User.findByCredentials(email,password)

        const token = await user.generateTokens()

        res.send(user)
    } catch (error) {
        res.status(400).send(error)
    }
})


router.post("/users",async(req,res)=>{
    const user = new User(req.body)

    try{
        await user.save()
        const token = await user.generateTokens()
        // console.log(token)
        res.status(201).send(user)
    }
    catch(error){
        console.log(error)
        res.status(400).send(error)
    }
})
router.put("/users/me",auth,async(req,res)=>{
    // const id= req.params.id
    try {
        // const user= await User.findById(id)
        // if(!user){
        //     return res.status(404).send()
        // }
        const user = req.user
        const allowKeys=["name","email","age","password"];
        const keySet = Object.keys(req.body)
        const isValid=keySet.every(key=> allowKeys.includes(key))

        if(!isValid){
            return res.status(400).send({error:"Invalid updates"})
        }
        keySet.forEach(key=>{
            user[key]=req.body[key]
        })
        await user.save()
        res.send(user)
    } catch (error) {
        res.status(400).send(error)
    }
})

router.delete("/users/me",auth,async(req,res)=>{
    const id = req.params.id
    try {
        // const user= await User.findById(id)
        // if(!user){
        //     return res.status(404).send()
        // }
        const user=req.user
        await user.remove()
        res.send(user)

    } catch (error) {
        res.status(400).send(error)
    }
})

router.post("/users/logout",auth,async (req,res)=>{
    // console.log("heyyyyy")
    try {
        let user=req.user
        user.tokens= user.tokens.filter(token=>token.token!==req.token)
        await user.save()
        res.send("You are now logout")
    } catch (error) {
        res.status(400).send(error)
    }
})

router.post("/users/logoutall",auth,async(req,res)=>{
    try {
        let user=req.user
        user.token=[]
        await user.save()
        res.send("You are now logout ALL")
    } catch (error) {
        res.status(400).send(error)
    }
})

let upload =multer({
    limits:{
        fileSize:1000000
    },
    fileFilter(req,file,cb){
        if(!file.originalname.match(/\.(png|jpg|jpeg)$/)){
            cb(new Error("please Upload valid image"))
        }
        cb(undefined,true)
    }
})

router.post("/users/me/avatar",auth,upload.single('avatar'),async(req,res)=>{

    const buffer = await sharp(req.file.buffer)
    .resize({width:250,height:250})
    .png()
    .toBuffer()

    req.user.avatar=req.file.buffer
    await req.user.save()
    res.send()
},(error, req, res, next)=>{
    res.status(400).send({error: error.message})
})

router.get("/users/:id/avatar",async(req,res)=>{
    try {
        const user = await User.findById(req.params.id)
        if(!user){
            return res.status(404).send({error : "User not found"})
        }
        res.set('Content-Type','image/jpg')
        res.send(user.avatar)
    } catch (error) {
        res.status(400).send()
    }
})

router.delete("/users/me/avatar",auth,async(req,res)=>{
    req.user.avatar=undefined
    await req.user.save()
    res.send()
})
export default router