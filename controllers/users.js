const mysql=require("mysql");
const bcrypt=require("bcryptjs");
const jwt=require("jsonwebtoken");
const {promisify}=require("util");

const db=mysql.createConnection({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASS,
    database: process.env.DATABASE,
});

exports.login=async (req,res)=>{
try{
 const {email,password}=req.body;
 if(!email || !password)
 {
    return res.status(400).render("login",{msg:"please Enter your password and email"
    ,msg_type:"error", });

 }
 db.query('select* from users where email=?',
 [email],async(error,result)=>{
  if(result.length<=0){
        return res.status(401).render("login",{msg:"please Enter your password and email."
        ,msg_type:"error", });     }
        else{
            if (!(await bcrypt.compare(password, result[0].PASS))) {
                return res.status(401).render("login", {
                  msg: "please Enter your password and email.",
                  msg_type: "error",
                });
                }
                else{
                  // res.send("good") ;
                  const id=result[0].ID;
                  const token = jwt.sign({ id: id }, 
                    process.env.JWT_SECRET, {
                    expiresIn: process.env.JWT_EXPIRES_IN,
                  });
                console.log("TOKEN::"+token)
                 const cookieOptions={
                  expires:new Date(
                    Date.now()+
                    process.env.JWT_COOKIE_EXPIRES *24 *60 *60*1000
                  ) ,
                  httpOnly:true, 
                 };
                 res.cookie("poovarasan",token,cookieOptions);
                 res.status(200).redirect("/home");

                }
        } 
 });

}
catch(error){
    console.log(error)
}

};

exports.register=async (req,res)=>{
  console.log('register');
//res.send("Form submited...")
//  const name=req.body.name;
//  const email=req.body.email;
//  const password=req.body.password;
//  const confirm_password=req.body.confirm_password;

//  console.log(name);
//  console.log(email);
const{name,email,password,confirm_password}=req.body;
db.query('select email from users where email=?',
[email],async(error,result)=>{
    if(error){
        console.log(error)
    }
    else if(result.length>0){
        return res.render('register',{msg:"Email id already Taken."
       ,msg_type:"error", });
    }
    else if(password !==confirm_password){
        return res.render('register',{msg:"Password does not match"
        ,msg_type:"error", });
    }else {
    let hashedPassword=await bcrypt.hash(password,8);
   // console.log(hashedPassword);
   db.query("insert into users set ?",{
    name:name,
    email:email,
    pass:hashedPassword},
    (error,result)=>{
        if(error){
            console.log(error);
        }
        else{
            console.log(result);
            return res.render("register",{msg:"User registration success."
            ,msg_type:"good",})
        }
    });
}
    
}
);
}
exports.isLoggedIn=async(req,res,next)=>{
  // req.name="check login ." 
  //next();
  if(req.cookies.poovarasan){
    try{
const decode =await promisify(jwt.verify)(
    req.cookies.poovarasan,process.env.JWT_SECRET
);
//console.log(decode);
db.query('select * from users where id=?'
,[decode.id],(err,results)=>{
  // console.log(result); 
  if(!results){
    return next();
  }
  req.user=results[0];
  return next();
});
}
catch(error){
    console.log(error);
    return next();
}
  }else{
    next();
  }
};

exports.logout=async(req ,res)=>{
    res.cookie("poovarasan","logout",{
        expires:new Date(Date.now()+2*1000),
        httpOnly:true,  
      });
        res.status(200).redirect("/")
};


