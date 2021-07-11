const express = require('express')
const app = express()
const mongoClient = require('mongodb').MongoClient
const dbport = 27017

const url = `mongodb://localhost:${dbport}`

mongoClient.connect(url, (err,db)=>{
    if(err){
        console.log("Error Connect")
    }else{
        const myDb = db.db('AppData')
        const IDTable = myDb.collection(`IDList`)
        const RoomTable = myDb.collection(`RoomData`)

        //가입 함수
        app.post('/signup', (req,res)=>{
            console.log("signup");

            const newUser={
                _id : req.body._id,
                Name: req.body.Name,
                Photo: req.body.Photo,
                RoomName: [],
                ToDoLists:[],
            }
            const query = {_id : newUser._id}

            //아이디 쿼리 날려서 없으면 넣고 있으면 오류
            IDTable.findOne(query, (err,result)=>{
                if (result == null){
                    IDTable.insertOne(newUser, (err, result)=>{
                        res.status(200).send()
                    })
                }else{
                    res.status(400).send() 
                }
            })
        })

        //로그인 함수
        app.post('/login',(req, res)=>{
            console.log("login");

            const query ={
                _id: req.body._id,
                Name: req.body.Name,
                Number: req.body.Number,
            }

            IDTable.findOne(query,(err,result)=>{
                if(result != null){
                    const objToSend = {
                        _id: req.body._id,
                        Name: req.body.Name,
                        Number: req.body.Number,
                    }
                    console.log(`log in Name : ${req.body.Name}`)
                    res.status(200).send(JSON.stringify(objToSend))
                }else{
                    console.log("failed")
                    res.status(404).send();
                }
            })
        })
        
        //kakaoLogin
        app.post('/kakaoLogin',(req, res)=>{
            console.log("kakaoLogin");
            //아이디 조회를 위한 쿼리
            const query ={
                _id: req.body._id,
            }
            //아이디를 찾는다
            IDTable.findOne(query,(err,result)=>{
                //유저가 있음 => 불러옴
                if(result != null){
                    console.log(`log in Name : ${req.body.Name}`)
                    const objToSend = {
                        _id: result.body._id,
                        name: result.body.name,
                        RoomName: result.body.RoomName
                    }
                    //정상 코드를 리턴
                    res.status(200).send()
                //유저가 없음 = > 만듬
                }else{
                    console.log("new User!!")
                    const newUser={
                        _id: req.body._id,
                        name: req.body.name,
                        RoomName: req.body.RoomName
                    }
                    IDTable.insertOne(newUser, (err, result)=>{
                        res.status(200).send()
                    })
                }
                //오류
                if(err){
                    console.log("error")
                    res.status(400).send();
                }
            })
        })

        //getToDo
        app.post('/getToDo',(req, res)=>{
            console.log("getToDo");
            const query ={
                _id: req.body._id,
                date: req.body.date
            }
            ToDoLists.find(query,(err,result) => {
                //투두가 있을 경우
                if(result != null){
                    console.log(`getToDos!!: ${req.body.Name}`)
                    const todos = {
                        title = result.body.title,
                        //id는 없어도됨.
                        date = result.body.date,
                        Photo = result.body.Photo,
                        Todo = result.body.ToDo
                    }
                    //리스트 주는법 뭐지?
                    res.status(200).send(JSON.stringify(objToSend))
                }else{
                    //유저가 없을 경우
                    console.log("dont have Todo")
                    res.status(404).send()
                }
                //오류
                if(err)
                    res.status(400).send();
            })
        })

        // 만들기
        app.post('/makeRoom',(req, res)=>{
           
        })
        //룸 조회
        app.post('/getRoom',(req, res)=>{
           
        })
    }  
})
app.use(express.json())

app.listen(80,()=>{
    console.log("listen port 80")
})