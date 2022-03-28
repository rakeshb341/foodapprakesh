var express= require('express')
var fs=require('fs');
var multer=require('multer');
const upload = multer({dest:'uploads/'})
var cookieParser=require('cookie-parser');
var session =require('express-session');
var app = express();
var bodyParser = require('body-parser');
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended:false}));
app.use(cookieParser());
app.set('view engine','pug')
app.set('views','./views');

app.use(express.static(__dirname+"/uploads"))
app.use(express.static(__dirname+"/public"))
app.get("/authenticate",function(req,res){
	console.log("into login")
	var content = fs.readFileSync(__dirname + '/db.json');
	var data=JSON.parse(content);
	var usdata=data.credentials;
	// console.log(usdata);
	flag=0;
	usdata.forEach(function(a){
			if(a.username==req.query.username && a.password==req.query.password){
				flag=1
				res.cookie("username",req.query.username)
				// wres.redirect("/home");
			}
	})
	if(flag==1){
		res.redirect("/home");
	}
	else{
		res.redirect("/login.html")
	}

})
app.get("/home",function(req,res){
	if(req.cookies.username){
		console.log(req.cookies.username)
		console.log("cookie present")
		var fooddetail = fs.readFileSync(__dirname+'/db.json');
		var data=JSON.parse(fooddetail);
		var fooddata=data.details;
		res.render("homepage",{items:fooddata,usname:req.cookies.username})
	}	
	else{
		res.redirect("/login.html");
	}

})
app.get("/registerfood",function(req,res){
	res.sendFile(__dirname+"/registerfood.html")
})
var storage = multer.diskStorage({
	destination:function(req,file,cb){
		cb(null,'C:/Users/RAKESH/Desktop/Assaignments/Express/Foodapp/uploads')
	},
	filename:function(req,file,cb){
		cb(null,file.originalname);
	}
})
var img=multer({storage:storage})
app.post("/addfood",img.array('image'),function(req,res){
	// console.log(req.body);
	const obj=JSON.parse(JSON.stringify(req.body));
	var file=[]
	file=req.files;
	console.log("files",file);
	obj.chef=req.cookies.username;
	
	// var images=[];
	// file.forEach(function(a,i){
	// 	// images.push(a.originalname)
	// 	images.push(a.originalname)
	// })
	// console.log(images)
	// obj.files=images
	var da=fs.readFileSync(__dirname+'/db.json');
	da=JSON.parse(da);
	obj.id=da.details.length
	da.details.push(obj);
	fs.writeFileSync('db.json',JSON.stringify(da));

	// res.send("done")
	res.redirect("/home")
})
app.get("/myprepafd",function(req,res){
	var test =  fs.readFileSync(__dirname + '/db.json');
	var list = JSON.parse(test);
	var details = list.details;
	var chefd=[]
	details.forEach(function(a){
		var obj={}
		if(a.chef==req.cookies.username){
			obj.id=a.id;
			obj.food=a.name;
			obj.image=a.files[0];
			chefd.push(obj)
		}
	})
	// console.log("my chef food",cheffood1)
	res.render("mypreporders",{items:chefd})

})

app.get("/myprepord",function(req,res){
	var test =  fs.readFileSync(__dirname + '/db.json');
	var list = JSON.parse(test);
	var details = list.details;
	var cheffood1=[]

	details.forEach(function(a){
		var obj={}
		if(a.chef==req.cookies.username){
			obj.id=a.id;
			obj.food=a.name;
			obj.image=a.files[0];
			cheffood1.push(obj)
		}
	})
	console.log("my chef food",cheffood1)
	res.render("mypreporders",{items:cheffood1})
})
app.get("/itemlist",function(req,res){
	var test =  fs.readFileSync(__dirname + '/db.json');
	var list = JSON.parse(test);
	var details = list.details;
})
app.get("/deleteitem/:key",function(req,res){
	console.log("into deleteitem")
	var test =  fs.readFileSync(__dirname + '/db.json');
	var list = JSON.parse(test);
	var details = list.details;
	// delete details[]
	// details.forEach(function(a){
	// 	if(req.params.key==a.id){
	// 		details.pop(a);
	// 	}
	// })
	details.splice(req.params.key,1)
	fs.writeFileSync('db.json',JSON.stringify(details));
	// console.log("chef food 1",cheffood1)
	// forEach(function(a){
	// 	if(a.id==req.params.key){
	// 		a.splice(1)
	// 	}
	// })
	res.redirect("/myprepord")
	
})
app.get("/getdetails",function(req,res){
	var orders=[]
	var test =  fs.readFileSync(__dirname + '/db.json');
	var list = JSON.parse(test);
	var details = list.foodorder;
	details.forEach(function(a){
		obj={}
		if(req.cookies.username==a.username){
			console.log("into ")
			obj.food=a.food;
			obj.image=a.image
			orders.push(obj)
			console.log("ordered details",orders);
			
	
		}
	})
	console.log("before purchase")
	res.render("purchase",{items:orders});

})

app.get("/myorders",function(req,res){
	var cheffood=[]
	console.log("myorders");
	var fooddetail = fs.readFileSync(__dirname+'/db.json');
	var data=JSON.parse(fooddetail);
	var fooddata=data.foodorder;
	console.log("fooddata",fooddata);
	fooddata.forEach(function(a){
		if(req.cookies.username==a.chef){
			obj={}
			obj.food=a.food;
			obj.image=a.image
			cheffood.push(obj);
		}
	})
	console.log("cheffood",cheffood)
	res.render("chefprep",{items:cheffood})
})

app.get("/getfood",function(req,res){
	var fooddetail = fs.readFileSync(__dirname+'/db.json');
	var data=JSON.parse(fooddetail);
	var fooddata=data.details;
	// console.log(fooddata);
	var locations=[]
	fooddata.forEach(function(a,i){
		locations.push(a.location);
	})
	temp=[...new Set(locations)]
	// console.log(temp)
	res.render("displayitems",{items:temp});
	// res.send("data fetching")


})
app.get("/logout",function(req,res){
	res.clearCookie("username");
	res.redirect("/login.html")
})
app.get("/getlocdata",function(req,res) {
	var x= req.query.dropdown;
	var disparray=[]
	var fooddetail = fs.readFileSync(__dirname+'/db.json');
	var data=JSON.parse(fooddetail);
	var fooddata=data.details;
	fooddata.forEach(function(a){
		if(a.location==x){
			disparray.push(a)
		}
	})
	// console.log(disparray);
	res.render("output",{items:disparray});
})
app.get("/registerpage",function(req,res){
	console.log(req.query.username);	
	var userbuy=fs.readFileSync(__dirname+'/db.json');
	var data=JSON.parse(userbuy);
	// console.log(data);
	data.credentials.push(req.query);
	fs.writeFileSync('db.json',JSON.stringify(data));
	res.redirect("/login.html")
})
app.get("/purchaseitem/:key",function(req,res){
	console.log("purchase user",req.params.key);
	var x=req.params.key
	const myarray=x.split(" ");
	console.log("myarray",myarray);
	obj={}
	obj.username=req.cookies.username;
	obj.image=myarray[2];
	obj.chef=myarray[1];
	obj.food=myarray[0];
	var userbuy=fs.readFileSync(__dirname+'/db.json');
	var data=JSON.parse(userbuy);
	data.foodorder.push(obj);
	fs.writeFileSync('db.json',JSON.stringify(data));
	console.log(data);
	res.redirect("/home")

})
app.listen(process.env.PORT)