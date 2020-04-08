const express = require('express');
const app = express();
const ejs = require('ejs');
const path = require('path');
const crawl = require('./util/crawling');
const fm = require('./util/file_manage');

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, './views'));
app.use(express.static(path.join(__dirname, 'static')));
app.use(express.json());
app.use(express.urlencoded({extended: true}));

/* -------------------- GET -------------------- */

app.get('/', async(req, res) => {
    fm.fetch_local_table_info((dat)=>{
        console.log("Fetched local table info");
        res.render('index', {
            tableData: JSON.stringify(dat.table),
            tableId: dat.tableId,
        });
    });
});

app.get('/account-everytime', (req, res) => {
    res.render('account_everytime');
});

app.get('/account-icampus', (req, res) => {
    res.render('account_icampus');
});

app.get('/subject', (req, res) => {
    let subject_id = req.query.sid;
    let table_id = req.query.tid;
    
    fm.fetch_single_subject(table_id, subject_id, (code, dat)=>{
        if(code == 1000){
            res.render('subject',{
                subjectInfo: JSON.stringify(dat),
            });
        }else{
            throw new Error("Error occurred: "+code);
        }
    });
});

/* -------------------- POST -------------------- */

app.post('/authen-everytime', async(req, res) => {
    let everytime_id = req.body.ID;
    let everytime_pw = req.body.PW;
    let tableData = await crawl.get_timetable_list_data(everytime_id, everytime_pw);

    res.send(tableData);
});

app.post('/authen-icampus', async(req, res) => {
    let everytime_id = req.body.ID;
    let everytime_pw = req.body.PW;
    crawl.authen_icampus_account(everytime_id, everytime_pw, function(pass){
        res.send(pass);
    });
});

app.post('/save_everytime_account', async(req, res) => {
    const saveData = req.body;
    
    let accountData = {
        id: saveData.everytimeAccount.id,
        pw: saveData.everytimeAccount.pw,
        timetable_id: saveData.timetableInfo.id
    };

    fm.save_everytime_account_info(accountData);
    fm.save_timetable_info(saveData.timetableInfo);

    res.send({code: 1000});
});

app.post('/save_icampus_account', async(req, res) => {
    const saveData = req.body;
    console.log(saveData);
    
    let accountData = {
        id: saveData.ID,
        pw: saveData.PW,
    };

    fm.save_icampus_account_info(accountData);

    res.send({code: 1000});
});

app.listen(2700, () => {
    console.log('Server opened in localhost:2700');
});