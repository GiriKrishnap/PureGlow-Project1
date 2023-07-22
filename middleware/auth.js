
const verify_user = (req,res,next)=>{
    try {
        if(req.session.userId){
            next()
        }else{
            res.redirect('/login')
        }
        
    } catch (error) {
        console.log(error.message);
        res.status(500).json({error:true,message:'internal sever error'})
    }
}

const logout_user = (req,res,next)=>{
    try {
        if(req.session.userId){
           res.redirect('/');
        }else{
           next()
        }
        
    } catch (error) {
        console.log(error.message);
        res.status(500).json({error:true,message:'internal sever error'})
    }
}

module.exports={
    verify_user,
    logout_user
}