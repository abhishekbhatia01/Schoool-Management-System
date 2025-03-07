const express = require('express');
const app = express();
const path = require('path');
const fs = require('fs');
const { stringify } = require('querystring');

app.set("view engine", 'ejs');
app.use(express.json());
app.use(express.urlencoded({extended : true}));
app.use(express.static(path.join(__dirname, 'public')));
const usersFilePath = path.join(__dirname, "students.json"); 
const accountsFilePath = path.join(__dirname, "accounts.json"); 


let users = [];
if (fs.existsSync(usersFilePath)) {
    const data = fs.readFileSync(usersFilePath, 'utf8');
    if (data) {
        users = JSON.parse(data);
    }
}

app.get('/',(req,res)=>{
    res.render("index")
});

app.get('/choose',(req,res)=>{
    res.render("choose");
});

// signup
const usersFile = "accounts.json";
let usersid = [];

if (fs.existsSync(usersFile)) {
    usersid = JSON.parse(fs.readFileSync(usersFile, "utf-8"));
}

app.get("/signup", (req, res) => {
    res.render("signup",{ message: '' });
});

app.post("/signup", (req, res) => {
    const { username, name, email,  password } = req.body;

    if (usersid.find((user) => user.username === username)) {
        return res.render("signup", { message: "User already exists!" });
    }

    usersid.push({ username, password });

    fs.writeFileSync(usersFile, JSON.stringify(usersid, null, 2));

    res.render("login", { message: "Signup successful! Please login." });
});

// login
app.get("/login", (req, res) => {
    res.render("login", { message: "" });
});

app.post("/login", (req, res) => {
    const { username, password } = req.body;
    const user = usersid.find((user) => user.username === username && user.password === password);

    if (!user) {
        return res.render("login", { message: "Invalid Credentials!" });
    }

    res.redirect('/dashome')
});

app.get('/dashome', (req, res) => {
    res.render("dashhome", { studentCount: users.length });
});


app.get('/admindash', (req, res)=>{
    res.render("dashboard");
});


// student add
app.get('/registeruser',(req,res)=>{
    res.render("student");
})

app.post('/registeruser',(req,res)=>{
    const{fname, lname, age, fathername, mobno, batch, dept} = req.body;

    let user_id;

    if(users.length == 0){
        user_id = 1;
    }else{
        user_id = users[users.length-1].id+1;
    }

    const new_user = {
        id: user_id,
        fname:req.body.fname,
        lname:req.body.lname,
        age:req.body.age,
        fathername:req.body.fathername,
        mobno:req.body.mobno,
        batch:req.body.batch,
    }

    users.push(new_user);
        
    fs.writeFile(usersFilePath, JSON.stringify(users, null, 2), (err)=>{
        if(err){
            console.log("Error",err);
            return res.status(500).json({message: "Internal server error"});
        }else{
            console.log("User register", new_user);
           res.redirect('/show');

        }
    });
});
    

app.get('/show', (req, res) => {
    res.render("show", { users: users }); // Pass users array to EJS template
});

app.get('/edit/:id', (req, res) => {
    const userId = Number(req.params.id);
    const user = users.find(user => user.id === userId);
    if (!user) {
        return res.status(404).send("User not found");
    }
    res.render('edit', { user });
});

app.post('/edit/:id', (req, res) => {
    const { fname, lname, age, fathername, mobno, batch} = req.body;
    const userId = Number(req.params.id);

    let userIndex = users.findIndex(user => user.id === userId);
    if (userIndex === -1) {
        return res.status(404).send("User not found");
    }
    users[userIndex] = { 
        ...users[userIndex], 
        fname, lname, age, fathername, mobno, batch
    };
    fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2));

    res.redirect('/show');
});

app.get("/delete/:id", (req, res) => {
    users = users.filter(user => user.id != req.params.id); // Remove user from array

    // Write updated data back to students.json
    fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2));

    res.redirect("/show"); // Redirect to student list
});



app.listen(3101);