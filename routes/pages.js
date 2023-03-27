const express=require("express");
const userContoller=require("../controllers/users")
const router=express.Router();
 
router.get(["/","/login"],(req,res)=>{
    //res.send("<h1>hello poovarasan</h1>");
    res.render("login");
});

router.get("/register",(req,res)=>{
        res.render("register");
});


router.get("/profile",userContoller.isLoggedIn ,(req,res)=>{
    //res.send("<h1>hello poovarasan</h1>");
    if(req.user){
    res.render("profile",{user:req.user});
    }else{
        res.redirect("/login");
    }
});

router.get("/home",userContoller.isLoggedIn ,(req,res)=>{
    //res.send("<h1>hello poovarasan</h1>");
    if(req.user){
    res.render("home",{user:req.user});
    }else{
        res.redirect("/login");
    }
});

module.exports=router;