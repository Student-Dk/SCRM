const express = require('express');
const app = express();
const mongoose = require('mongoose');
const path = require('path');
const bodyparser = require('body-parser');
const Newuser = require('./models/user');
const usertk=require('./models/viewticket')
const bcrypt = require('bcrypt');

app.use(bodyparser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
//app.use(express.static('public'));
app.use(express.static(path.join(__dirname, 'public')));

// const userRoutes = require('./routes/admin');



//--------data base connection----------------

mongoose.connect("mongodb://localhost:27017/CRM")
    .then(() => {
        console.log("Database connected successfully");
    }).catch((err) => {
        console.log("Error" + err.message);
    })

//------------------------------------------------------------

app.get('/', (req, res) => {

    res.render('home');

})
app.get('/reg', (req, res) => {
    res.render('reg');
})
//-----------------------------------------------------

// app.post('/submit', async (req, res) => {
//     const { email, password, Repassword, name,contact,gender } = req.body

// //       try {
// //     const { username, password } = req.body;

// //     // generate salt and hash
// //     const saltRounds = 10;
// //     const hashedPassword = await bcrypt.hash(password, saltRounds);

// //     // Normally save username & hashedPassword to DB
// //     // Example:
// //     // await User.create({ username, password: hashedPassword });

// //     res.json({ message: "User registered successfully", hashedPassword });
// //   } catch (error) {
// //     res.status(500).json({ error: "Something went wrong" });
// //   }

//     const userexisted = await Newuser.findOne({ email });
//     if (userexisted) return res.send("this email is alrady registered");
//     if (password != Repassword) return res.send("Password not match");

//     try {


//            const hashedPassword = await bcrypt.hash(password, 10);

//         const user = await Newuser.create(name,email,password:hashedPassword,contact,gender);

//         return res.render('login');
//     } catch (err) {
//         res.status(400).json({ error: err.message });
//     }
// })

app.post('/submit', async (req, res) => {
    const { email, password, Repassword, name, contact, gender } = req.body;

    // Validate input

    // Check if email already exists
    const userExists = await Newuser.findOne({ email });
    if (userExists) {
        return res.status(409).json({ error: 'This email is already registered' });
    }

    // Check if passwords match
    if (password != Repassword) {
        return res.status(400).json({ error: 'Passwords do not match' });
    }

    try {
        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const user = await Newuser.create({
            name,
            email,
            password: hashedPassword,
            contact,
            gender,
        });

        // For an API, return JSON
        // return res.status(201).json({ message: 'User registered successfully' });

        // For a web app, render login view
        return res.render('login');
    } catch (err) {
        console.error(err); // Log error for debugging
        return res.status(500).json({ error: 'An error occurred during registration' });
    }
});

//-----------------------------------------------
app.get('/login', (req, res) => {
    res.render('login');

})

app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {


        //const userdata = await Newuser.find();
        if (email == 'thedhirajofficials@gmail.com' && password == '789') return res.redirect('/admindashboard');
        const user = await Newuser.findOne({ email });

        if (!user) return res.status(400).json({ error: "invalid email and password" });

        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if (!isPasswordMatch) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }
        // if (user._id == '688a38f5bdf168b395ee94ee') return res.render('admin', { userdata });
        //        if (user._id != '688a38f5bdf168b395ee94ee')
        return res.redirect('/dashboard/' + user._id);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
})


app.get('/dashboard/:id', async (req, res) => {
    const user = await Newuser.findById(req.params.id)
    const count = await usertk.countDocuments({ userid: user._id });
//console.log("Total rows with email:", count);
    return res.render('dashboard', { user,count })
})

//--------------------------------------------------



//------------------------------Delete-------------------------

app.post('/delete/:id', async (req, res) => {
    try {
        await Newuser.findByIdAndDelete(req.params.id)

        // const userdata = await Newuser.find();
        // res.render('admin', { userdata });
        res.redirect('/login');

    } catch (err) {
        console.log("error:" + err.message);
    }
})

//------------------------------edit------------------------------

app.get('/edit/:id', async (req, res) => {
    try {
        const user = await Newuser.findByIdAndUpdate(req.params.id);
        if (!user) return res.status(400).send('User not found');
        res.render('update', { user });

    } catch (err) {
        console.log("error:" + err);
    }
})

app.post('/update/:id', async (req, res) => {

    try {
        const { name, email, contact, gender } = req.body;
        await Newuser.findByIdAndUpdate(req.params.id, { name, email, contact, gender });
        const userdata = await Newuser.find();
        res.redirect('/login')
    } catch (err) {
        console.log("Error " + err);
    }
})

//-----change password------------
app.post('/change_password', async (req, res) => {
    try {
        const { id } = req.body

        const user = await Newuser.findById(id);
        res.render('change_password', { user });

    } catch (err) {
        res.status(400).json({ error: err });
    }
})

app.post('/change_password1', async (req, res) => {
    const { id, passwordo, passwordn, passwordc } = req.body;
    try {
        const user = await Newuser.findByIdAndUpdate(id)
         const isPasswordMatch = await bcrypt.compare(passwordo, user.password);
        if (!isPasswordMatch) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }
        // console.log(req.body)
       // if (passwordo != user.password) return res.status(400).json({ message: "invalid old password" });
        if (passwordn != passwordc) return res.status(400).json({ message: "password not match" });
       // const password = passwordc;
         const hashedPassword = await bcrypt.hash(passwordn, 10);
        await Newuser.findByIdAndUpdate(id, { password:hashedPassword });
        return res.redirect('/dashboard/' + user._id)

    } catch (err) {
        console.log("error" + err);
    }
})
//------------------------user profile--------------------------------------------------------------------

app.get('/profile/:id', async (req, res) => {
    const user = await Newuser.findByIdAndUpdate(req.params.id);
    return res.render('userprofile', { user });
})

app.post('/updateprofile', async (req, res) => {
    // const{name,email,contact,gender,address}=req.body;

    const { id } = req.body;


    try {
        await Newuser.findByIdAndUpdate(id, (req.body));
        const user = await Newuser.findById(id);
        // console.log(user)
        //  await Newuser.findByIdAndUpdate(req.params.id, (req.body))
        return res.redirect('/profile/' + user._id);

    } catch (err) {
        console.log("error" + err)
    }
})

//--------------------------------------------------------------------------------------------------------

app.get('/req_quote/:id', async (req, res) => {
    const user = await Newuser.findById(req.params.id);
    return res.render('req_quote', { user })
})
app.post('/submitRequestquote', async (req, res) => {
    //const {id,services}=req.body;
    //await Newuser.findByIdAndUpdate(id,(req.query))
    // const ss = req.query.services;
    // console.log(ss);
    // res.send(ss);
    //const selectedServices = req.query.services; // For GET request
    // const selectedServices = req.body.services; // For POST request
    //  // console.log(services);
    // return res.send(req.body) // Output will be an array like:

    const date = new Date();
    const { id, services, query, company } = req.body;
    const user = await Newuser.findByIdAndUpdate(id, { services, query, date, company });
    return res.redirect('/manage-quotes/' + user._id);






})


//------------------------------------------------

app.get('/manage-quotes/:id', async (req, res) => {
    const user = await Newuser.findById(req.params.id);
    return res.render('quotes_History', { user });
})


app.get('/quote_details/:id', async (req, res) => {
    const user = await Newuser.findById(req.params.id);
    res.render('quotesdetail', { user });
})


app.get('/create_ticket/:id', async (req, res) => {
    const user = await Newuser.findById(req.params.id);
    res.render('createticket', { user });
})
app.post('/submitticket', async (req, res) => {
    const date = new Date();
    const { userid, tasktype, priority, description, subject } = req.body;
    console.log(req.body);
    const userkaticket = await usertk.create({userid, tasktype, priority, description, subject ,date})
    const user=await Newuser.findOne({_id:userid});
    console.log(user);
    res.redirect('/dashboard/' + user._id)

})

app.get('/vtc/:id',async(req,res)=>{
    const user = await Newuser.findById(req.params.id);
    const ticket=await usertk.find({userid: user.id});
   // console.log(ticket);
    res.render('viewticket',{user,ticket})
})

//--------------admin---------------------------
app.get('/admindashboard', async (req, res) => {
    const users = await Newuser.find();
     const regs = await Newuser.countDocuments();
       const alltk = await usertk.countDocuments();
    res.render('admin', { users,regs ,alltk});
})
// app.use('/admin', userRoutes);

app.get('/manageticket', async (req, res) => {
    const users = await usertk.find();
    res.render('ManageTicket', { users });
})

app.get('/adminmanageqoutes', async (req, res) => {
    const users = await Newuser.find();
    res.render('adminmanagequotes', { users });
})

app.get('/adminview/:id', async (req, res) => {

    // const id=req.params.id;
    const user = await Newuser.findById(req.params.id);
    res.render('adview', { user });
})
app.post('/remark', async (req, res) => {
    const { id, remark } = req.body;
    const user = await Newuser.findByIdAndUpdate(id, { remark });

    res.redirect('/adminview/' + user._id);
})

app.get("/adimnchangepassword", async (req, res) => {

    res.render('ad_chpa');

})

app.get('/adminusers', async (req, res) => {
    const users = await Newuser.find();
    res.render('adminusers', { users });
})

app.post('/admindelete/:id', async (req, res) => {
    await Newuser.findByIdAndDelete(req.params.id);
    res.redirect('/adminusers');
})

app.get('/adminedit/:id', async (req, res) => {
    const user = await Newuser.findById(req.params.id);
    res.render('adminedit.ejs', { user });

})
app.post('/adminedit', async (req, res) => {
    const { id, name, contact, address } = req.body;
    await Newuser.findByIdAndUpdate(id, { name, contact, address });
    res.redirect('adminusers');
})

app.post('/ticketresponse', async (req, res) => {
    const { id, adminresponse } = req.body;
    await usertk.findByIdAndUpdate(id, { adminresponse });
    res.redirect('/admindashboard');
})
app.listen(1200, () => {
    console.log("server is running on 1200")
})