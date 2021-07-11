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
        const ToDoTable = myDb.collection(`ToDoList`)
        
        //#region IDTable

        //kakaoLogin
        //id, name
        //데이터 저장, 리턴 없음
        //테스트 완료
        app.post('/kakaoLogin',(req, res)=>{
            console.log("kakaoLogin");
            //아이디 조회를 위한 쿼리
            const query ={
                id: req.body.id,
            }
            //아이디를 찾는다
            IDTable.findOne(query,(err,result)=>{
                //유저가 있음 => 불러옴
                if(result != null){
                    console.log(`log in Name : ${req.body.Name}`)
                    const objToSend = {
                        id: result.body.id,
                        name: result.body.name,
                        RoomName: result.body.RoomName
                    }
                    //정상 코드를 리턴
                    res.status(200).send()
                //유저가 없음 => 만듬
                }else{
                    console.log("new User!!")
                    const newUser={
                        id: req.body.id,
                        name: req.body.name,
                        RoomName: []
                    }
                    IDTable.insertOne(newUser, (err, result)=>{
                        res.status(200).send()
                        if(err){
                        console.log("insertErr")
                            res.status(404).send()
                        }
                    })
                }
                //오류
                if(err){
                    console.log("error")
                    res.status(400).send();
                }
            })
        })

        //findID
        //id
        //데이터 찾기
        //테스트 완료
        app.post('/findID',(req, res)=>{
            console.log("findID");
            //아이디 조회를 위한 쿼리
            const query ={
                id: req.body.id,
            }
            //아이디를 찾는다
            IDTable.findOne(query,(err,result)=>{
                //유저가 있음 => 불러옴
                if(result != null){
                    //정상 코드를 리턴
                    console.log("user is exist")
                    res.status(200).send()
                //유저가 없음 => 만듬
                }else{
                    console.log("user is null")
                    res.status(404).send()
                }
                //오류
                if(err){
                    console.log("error")
                    res.status(400).send();
                }
            })
        })
        //#endregion


        //#region TodoTable
        
        //getToDos
        //id, data(오늘 날짜 넣기)
        //todoList들 리턴
        //테스트 완료
        app.post('/getToDos',(req, res)=>{
            console.log("getToDos");
            const query ={
                id: req.body.id,
                date: req.body.date,
            }
            ToDoTable.find(query).toArray(function (err,result) {
                if(result.length==0){
                    //투두 없을 경우
                    console.log("Todois not have")
                    res.status(404).send()
                }
                else {
                    let arraay = []
                    //투두가 있을 경우
                    console.log(`getToDo!!`)
                    for(let i = 0 ; i < result.length;i++){
                        var objToSend = {
                            id: result[i].id,
                            title: result[i].title,
                            date: result[i].date,
                            photo: result[i].photo,
                            toDo: result[i].toDo,
                        }
                        // console.log(result[i].id)
                        arraay.push(objToSend)
                        console.log(objToSend)
                    }
                    //리스트 리턴 하는 방법 물어보기
                    res.status(200).send(arraay)
                }
                //오류
                if(err){
                    console.log("Error")
                    res.status(400).send();
                }
            })
        })

        //setToDoText
        //id,date,title,toDo
        //toDo업데이트함
        app.post('/setToDoText',(req, res)=>{
            console.log("setToDoText");
            const query ={
                id: req.body.id,
                date: req.body.date,
                title: req.body.title
            }
            ToDoTable.findOne(query,(err,result) => {
                //투두가 있을 경우
                if(result != null){
                    console.log(`setToDoText!!: ${req.body.name}`)
                    //업데이트 맞는지 확인
                    ToDoLists.update({_id:result.body._id},
                        {$set:{toDo:req.body.toDo}});
                    res.status(200).send()
                }else{
                    //투두 없을 경우
                    console.log("Wrong Access")
                    res.status(404).send()
                }
                //오류
                if(err){
                    console.log("Error")
                    res.status(400).send();
                }
            })
        })

        //setToDoPhoto
        //id,data,title,photo
        //포토를 업데이트 하고 반환값없음
        app.post('/setToDoPhoto',(req, res)=>{
            console.log("setToDoPhoto");
            const query ={
                id: req.body.id,
                date: req.body.date,
                title: req.body.title
            }
            ToDoTable.findOne(query,(err,result) => {
                //투두가 있을 경우
                if(result != null){
                    console.log(`setToDoPhoto!!: ${req.body.Name}`)
                    //업데이트 맞는지 확인
                    ToDoTable.update({_id:result.body._id},
                        {$set:{photo:req.body.photo}});
                    res.status(200).send()
                }else{
                    //투두 없을 경우
                    console.log("Wrong Access")
                    res.status(404).send()
                }
                //오류
                if(err){
                    console.log("Error")
                    res.status(400).send();
                }
            })
        })

        //getToDoByRoom 조회
        //roomName로 조회함
        //룸 있을 경우 투두 리스트 값반환
        app.post('/getToDoByRoom',(req, res)=>{
            console.log("getToDoByRoom");
             const query ={
                 roomName : req.body.roomName,
             }
             ToDoTable.find(query,(err,result) => {
                 //룸에 맞는 todo있을 경우
                 if(result != null){
                     console.log(`getToDoByRoom!!`)
                     const returntodo ={
                        title : result.body.title,
                        id : result.body.id,
                        date : result.body.date,
                        photo : result.body.photo,
                        toDo : result.body.toDo,
                     }
                     res.status(200).send(JSON.stringify(returntodo))
                 }else{
                     //룸에 맞는 todo가 없을 경우
                     console.log("not have todo")
                     res.status(404).send()
                 }
                 //오류
                 if(err){
                     console.log("Error")
                     res.status(400).send();
                 }
             })
        })

        //#endregion

        //#region RoomTable

        //makeRoom
        //roomName,id,guests,fine,fines,startDay,endDay받음
        //룸이 없으면 넣고 있으면 오류 출력
        app.post('/makeRoom',(req, res)=>{
            console.log("makeRoom");
            const query ={
                roomName : req.body.roomName
            }

            RoomTable.findOne(query,(err,result) => {
                //룸이 있을 경우
                if(result != null){
                    console.log(`RoomName is exist!!`)
                    res.status(404).send()
                }else{
                    //룸이 없을 경우
                    console.log("Room Can Make")
                    const newRoom ={     
                        roomName: req.body.roomName,
                        id: req.body.date,
                        //배열 전달 방법
                        guests: [
                            req.body.guests1,
                            req.body.guests2,
                            req.body.guests3],
                        fine: req.body.fine,
                        fines: {},
                        startDay: req.body.startDay,
                        endDay: req.body.startDay,
                    }
                    RoomTable.insertOne(newRoom, (err, result)=>{
                            res.status(200).send()
                        if(err){
                            console.log("insertErr")
                            res.status(404).send()
                        }
                    })
                    res.status(200).send()
                }
                //오류
                if(err){
                    console.log("Error")
                    res.status(400).send();
                }
            })
        })

        //룸 조회
        //id
        //룸들을 얻어옴
        app.post('/getRoom',(req, res)=>{
            console.log("getRoom");
            const query ={
                id : req.body.id,
            }
            RoomTable.find(query,(err,result) => {
                //룸이 있을 경우
                if(result != null){
                    console.log(`get Room!!`)
                    const returnRoom = {
                        // roomName = result.body.roomName,
                        guests : result.body.guests,
                        fine : result.body.fine,
                        fines : result.body.fines,
                        startDay : result.body.startDay,
                        endDay : result.body.endDay,
                    }
                    res.status(200).send(JSON.stringify(returnRoom))
                }else{
                    //룸이 없을 경우
                    console.log("not have room")
                    res.status(404).send()
                }
                //오류
                if(err){
                    console.log("Error")
                    res.status(400).send();
                }
            })
        })

        
        

    }  
})
app.use(express.json())

app.listen(80,()=>{
    console.log("listen port 80")
})