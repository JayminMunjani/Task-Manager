import Task from '../models/task.js'
import express from 'express'
import auth from '../middleware/auth.js'

const router = new express.Router()


router.get("/task",auth,async(req,res)=>{
    const user=req.user
     let match={}
     let sort={}

     /*if(req.query.completed){
         match.completed=req.query.completed === "true"
     }*/
     if(req.query.match){
         let value = req.query.match
         let parts = value.split(":")
        match[parts[0]] = parts[1]
         
     }

     if(req.query.sortBy){
         let value = req.query.sortBy
         let parts=value.split(":")
         //sortBy=createdAt
         sort[parts[0]]=parts[1]==="desc" ? -1 : 1
     }
    try {
       await user.populate({
           path:'tasks',
           match,
           options:{
               limit: parseInt(req.query.limit),
               skip:parseInt(req.query.skip),
               sort
           } 
        })
       res.send(user.tasks)
    } catch (error) {
        res.status(400).send(error)
    }
})

router.post("/task",auth,async(req,res)=>{
    const user=req.user
    const task = new Task({...req.body,owner:user._id})
    try {
        await task.save()
        res.send(task)
    } catch (error) {
        res.status(400).send(error)
    }
})

router.get("/task/:id",auth,async(req,res)=>{
    const _id= req.params.id
    const user =req.user
    try {
        const task = await Task.find({_id,owner:user._id})
        if(!task){
            return res.status(404).send()
        }
        await user.populate('tasks')
        res.send(task)
    } catch (error) {
        res.status(400).send(error)
    }
})

router.put("/task/:id",auth,async(req,res)=>{
    const _id = req.params.id
    const user=req.user
   
    try{
        const task = await Task.find({_id,owner:user._id})
        if(!task){
            return res.status(404).send()
        }
        const allowKeys = ["description","completed"]
        const keySet = Object.keys(req.body)
        const isValid = keySet.every(key => allowKeys.includes(key))
        
        if(!isValid){
            res.status(400).send("Invalid data entred")
        }
        
        keySet.forEach(key =>{
            task[key]=req.body[key]
        })
        
        await task.save()
        console.log("heyyyyyy")
        res.send(task)

    }catch(error){
        res.status(404).send(error)
    }
})

router.delete("/task/:id",auth,async(req,res)=>{
    const _id = req.params.id
    const user=req.user
    try{
        const task = await Task.findOneAndDelete({_id,owner:user._id})
        if(!task){
            return res.status(404).send()
        }
        res.send('deleted')

    }catch(error){
        res.status(400).send(error)
    }
})

export default router