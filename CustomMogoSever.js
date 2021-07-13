const express = require('express')
const app = express()
const mongoClient = require('mongodb').MongoClient
const dbport = 27017
const schedule = require('node-schedule');

const url = `mongodb://localhost:${dbport}`

mongoClient.connect(url, (err,db)=>{
    if(err){
        console.log("Error Connect")
    }else{
        const myDb = db.db('AppData')
        const IDTable = myDb.collection(`IDList`)
        const RoomTable = myDb.collection(`RoomList`)
        const ToDoTable = myDb.collection(`ToDoList`)
        
        //#region IDTable

        //kakaoLogin
        //id, name
        //데이터 저장, 리턴 없음
        //처음에 로그인시 해야함
        //테스트 완료
        //연결 완료
        app.post('/kakaoLogin',(req, res)=>{
            console.log("kakaoLogin");
            //아이디 조회를 위한 쿼리
            const query ={
                id: req.body.id,
            }
            console.log(req.body)
            //아이디를 찾는다
            IDTable.findOne(query,(err,result)=>{
                //유저가 있음 => 불러옴
                if(result != null){
                    console.log(`log in Name : ${req.body.name}`)
                    //정상 코드를 리턴
                    IDTable.updateOne(query,{$set : {photo : req.body.photo}})
                    res.status(200).send()
                //유저가 없음 => 만듬
                }else{
                    console.log("new User!!")
                    const newUser={
                        id: req.body.id,
                        name: req.body.name,
                        photo : req.body.photo,
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
        //Room만들때 아이디 추가할 경우 조회해야함.
        //테스트 완료
        app.post('/findID',(req, res)=>{
            console.log("findID");
            //아이디 조회를 위한 쿼리
            //아이디를 찾는다
            IDTable.find( {} ).toArray(function (err,result) {
                if(result.length==0){
                    //투두 없을 경우
                    console.log("ID is null")
                    res.status(404).send()
                }
                else {
                    console.log(`getIDs!!`)
                    let arraay = []
                    //투두가 있을 경우
                    for(let i = 0 ; i < result.length;i++){
                        var objToSend = {
                            id: result[i].id,
                            name: result[i].name,
                            photo: result[i].photo,
                        }
                        arraay.push(objToSend)
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
        //#endregion

        //#region TodoTable
        

        //setToDoText
        //id, title,toDo
        //toDo업데이트함
        //테스트 완료
        //연결 완료
        app.post('/setToDoText',(req, res)=>{
            console.log("setToDoText");
            const query ={
                id: req.body.id,
                date: getToDay(),
                title: req.body.title
            }
            console.log(req.body)
            ToDoTable.findOne(query,(err,result) => {
                //투두가 있을 경우
                if(result != null){
                    //업데이트 맞는지 확인
                    ToDoTable.updateOne(query,{$set:{toDo:req.body.toDo}});
                    res.status(200).send()
                }else{
                    //투두 없을 경우
                    console.log("toDo is not exist")
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
        //테스트 완료
        app.post('/setToDoPhoto',(req, res)=>{
            console.log("setToDoPhoto");
            const query ={
                id: req.body.id,
                date: getToDay(),
                title: req.body.title
            }
            console.log(query)
            ToDoTable.findOne(query,(err,result) => {
                //투두가 있을 경우
                if(result != null){
                    console.log(`setToDoPhoto!!: ${req.body.Name}`)
                    //업데이트 맞는지 확인
                    ToDoTable.updateOne(query,{$set:{photo:req.body.photo}});
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

        //getToDos
        //id, data(오늘 날짜 넣기)
        //todoList들 리턴
        //테스트 완료
        //연결 완료
        app.post('/getToDoByid',(req, res)=>{
            console.log("getToDos");
            const query ={
                id: req.body.id,
                date: getToDay(),
            }
            console.log(query);
            ToDoTable.find(query).toArray(function (err,result) {
                if(result.length==0){
                    //투두 없을 경우
                    console.log("Todois not have")
                    res.status(404).send()
                }
                else {
                    console.log(`getToDo!!`)
                    let arraay = []
                    //투두가 있을 경우
                    for(let i = 0 ; i < result.length;i++){
                        var objToSend = {
                            id: result[i].id,
                            title: result[i].title,
                            date: result[i].date,
                            photo: result[i].photo,
                            toDo: result[i].toDo,
                        }
                        arraay.push(objToSend)
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

        //getToDoByRoomtitle 조회
        //roomName로 조회함
        //룸 있을 경우 투두 리스트 값반환
        //테스트 완료
        app.post('/getToDoByRoomtitle',(req, res)=>{
            console.log("getToDoByRoomtitle");
             const query ={
                 title : req.body.title,
             }
             console.log(query)
             ToDoTable.find(query).toArray(function (err,result) {
                console.log(result.length)
                if(result.length==0){
                    //투두 없을 경우
                    console.log("Todois not have")
                    res.status(404).send()
                }
                else {
                    console.log(`getToDoByRoomTitle!!`)
                    let arraay = []
                    //투두가 있을 경우
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

        //#endregion

        //#region RoomTable

        //makeRoom
        //roomName,id,guests,fine,fines,startDay,endDay받음
        //룸이 없으면 넣고 있으면 오류 출력
        //테스트 완료
        //게스트 아이디 추가할때마다 findID로 아이디 찾아주기
        //게스트 업데이트 추가해야함, 테스트 해봐야함
        app.post('/makeRoom',(req, res)=>{
            console.log("makeRoom");
            const query ={
                roomName : req.body.roomName
            }
            RoomTable.findOne(query,(err,result) => {
                //룸이 있을 경우
                if(result != null){
                    console.log(`RoomName is exist!!`)
                    res.status(400).send()
                }else{
                    //룸이 없을 경우
                    console.log("Room Can Make")
                    const newRoom ={     
                        roomName: req.body.roomName,
                        id: req.body.id,
                        //배열 전달 방법
                        guests: [
                            req.body.guests1,
                            req.body.guests2,
                            req.body.guests3
                        ],
                        fine: req.body.fine,
                        fines: [0,0,0,0],
                        startDay: req.body.startDay,
                        endDay: req.body.endDay,
                    }
                    for(let i = 0 ; i < 3; i++){
                        IDTable.update({id:newRoom.guests[i]},{$push:{roomName:req.body.roomName}})
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
        //name
        //룸들을 얻어옴
        //테스트 완료
        app.post('/getRoombyRoomName',(req, res)=>{
            console.log("getRoom");
            console.log(req.body)
            const query ={
                roomName : req.body.roomName,
            }
            console.log(query)
            RoomTable.findOne(query,(err,result) => {
                console.log(result)
                //룸이 있을 경우
                if(result != null){
                    console.log(`get Room!!`)
                    const returnRoom = {
                        roomName : result.roomName,
                        id:result.id,
                        guest1: result.guests[0],
                        guest2: result.guests[1],
                        guest3: result.guests[2],
                        fine : result.fine,
                        totalFine1: result.fines[0],
                        totalFine2: result.fines[1],
                        totalFine3: result.fines[2],
                        totalFine4: result.fines[3],
                        startDay : result.startDay,
                        endDay : result.endDay,
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
        //#endregion
        
        //#region Timetable
        // s m h d m dayOfWeek
        //서버 시간이 -9시 이기 떄문에 매 15시로 설정
        var k = schedule.scheduleJob('0 59 14 * * *', function(){
            console.log(`${getToDay()} 에서 하루가 지났습니당~`);
        });

        var k = schedule.scheduleJob('0 58 14 * * *', function(){
            endOfDayFunction("20.05.30")
            console.log(`${getToDay()} 에서 하루가 지났습니당~`);
        });
        //#endregion

        //#region TimeEvent
        function endOfDayFunction(time){
            console.log("end Of Day")
            ToDoTable.find({date:time}).toArray(function (err,result) {
                console.log(`length ${result.length}`)
                //오류
                if(err){
                    console.log("Error")
                    return
                }
                if(result.length==0){
                    //투두 없을 경우
                    console.log("Todois not have")
                    return
                } else {
                    //투두가 있을 경우
                    for(let i = 0 ; i < result.length; i++){
                        console.log(i)
                        //포토 빌 경우
                        if(result[i].photo == undefined){
                            console.log("photo 정의안됨")
                        }else{
                            if(result[i].photo == ""){
                                console.log(`${result[i].id} todo 안함`)
                                const querys = {
                                    roomName : result[i].title
                                }
                                console.log(querys)
                                RoomTable.findOne(querys,(err,results) => {
                                    var index;
                                    switch(result[i].id){
                                        case results.id:
                                            index = 0;
                                            break;
                                        case results.guests[0]:
                                            index = 1;
                                            break;
                                        case results.guests[1]:
                                            index = 2;
                                            break;
                                        case results.guests[2]:
                                            index = 3;
                                            break;
                                        default:
                                            index = -1;
                                    }
                                    if(index !== -1){
                                        results.fines[index] = results.fines[index]*1 + results.fine*1 +0
                                        RoomTable.updateOne(querys,{$set:{fines: results.fines}})
                                        console.log(`change room : ${result[i].title} name : ${result[i].id} \ntotalFine : ${results.fines}`)
                                    }
                                })
                            } else {
                                console.log("photo있음 (toDo 함)")
                            }
                        }
                    }
        
                }
            })
        }
        
        //#endregion

    }  
})
 
//#region TimeFunction
function getKoreaTime(){
    const curr = new Date();

    // 2. UTC 시간 계산
    const utc = 
        curr.getTime() + 
        (curr.getTimezoneOffset() * 60 * 1000);

    // 3. UTC to KST (UTC + 9시간)
    const KR_TIME_DIFF = 9 * 60 * 60 * 1000;
    const kr_curr = new Date(utc + (KR_TIME_DIFF));
    return kr_curr;
}

function getToDay(){
    const date = getKoreaTime()
    // console.log(date)
    var year = date.getFullYear() +"";
    var month = date.getMonth() + 1;
    var day = date.getDate();
    year = year.slice(-2)
    if(month < 10)
        month = 0 + "" + month
    if(day < 10)
        day = 0 + "" + day
    return year+"."+month+"."+day
}

//#endregion

console.log(`서버가 ${getToDay()}에 켜졌습니당`)

app.use(express.json())

app.listen(80,()=>{
    console.log("listen port 80")
})