const express = require('express');
const app = express();
const db = require('./database.js');
var bodyParser = require("body-parser");
require('dotenv').config();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.post("/api/newGame", (req, res, next) => {
	db.run('DELETE FROM gamers',(err) => {
    	if (err) {res.status(500).json({"error":"Delete `gamers` error!"});}
    }); 
	db.run('DELETE FROM wishes',(err) => {
    	if (err) {res.status(500).json({"error":"Delete `wishes` error!"});}
    }); 
	res.json({"message": "success! A new game has started","error": false,});
})

app.post("/api/addGamer", (req, res, next) => {
	let errors=[]
    if (!req.body.first_name){
        errors.push("first_name is required");
    }
    if (!req.body.last_name){
        errors.push("last_name is required");
    }
    if (!req.body.wish){
        errors.push("wish is required");
    }
    if(Array.isArray(req.body.wish)){
    	if (req.body.wish.length > 10) {
    		errors.push("maximum 10 wishes");
    	}
    }
    if (errors.length){
        res.status(400).json({"error":errors.join(",")});
        return;
    }
    let data = {
        first_name: req.body.first_name,
        last_name: req.body.last_name,
        wish: req.body.wish
    }
    let params =[data.first_name, data.last_name]
    db.run('INSERT INTO gamers (first_name, last_name) VALUES (?,?)', params, function (err, result) {
        if (err){
            res.status(400).json({"error": err.message})
            return;
        }
        //better use transactions
        if(Array.isArray(req.body.wish)){
	    	req.body.wish.forEach(element => {
	    		db.run('INSERT INTO wishes (gamer_id, wish) VALUES (?,?)', [this.lastID, element]);
			});
	    } else {
	    	db.run('INSERT INTO wishes (gamer_id, wish) VALUES (?,?)', [this.lastID, req.body.wish]);
	    }
        res.json({
            "message": "success! Gamer was added",
            "data": data,
            "id" : this.lastID,
            "error": false,
        })
    });

});

app.get("/api/getInfo/",(req, res, next) => {
    if (!req.query.id){
        res.status(400).json({"error":'ID is required'});
    }
    let sql = `SELECT * FROM gamers as s 
    JOIN gamers as d ON s.recepient = d.id
    WHERE s.id = ?`;;
    db.get(sql, [req.query.id],(err, row) => {
    	if (err) {res.status(500).json({"error":"DB error!"});}
	    if (typeof(row) === "undefined"){
	    	res.status(400).json({"error":"User with id "+req.query.id+" not found"});
	    } else {
	    	db.all('SELECT wish FROM wishes WHERE gamer_id = ?', [row.id],(err, wish) => {
				if (err) {res.status(500).json({"error":"DB error!"});}
	    		res.json({
		            "message": "success! Recipient data found successfully",
		            "data": req.query.id,
		            "recepient" : {"first_name":row.first_name, "last_name":row.last_name, "wishes":wish},
		            "error": false,
		        })
	    	});
	    }
    });
});

app.post("/api/shuffle",(req, res, next) => {
	db.run("UPDATE gamers SET recepient=NULL"); //comment this line if not need shuffle every time 
	db.all('SELECT count(*) as count FROM gamers', [],(err, row) => {
	if (err) {
		return res.status(500).send(err);
	}
	if (row[0].count < 3) {
		return res.status(400).json({"error":"minimum 3 gamers"});
	} else if (row[0].count > 500) {
		return res.status(400).json({"error":"maximum 500 gamers"});
	} else {
		db.all('SELECT id FROM gamers', [],async (err, rows) => {
			if (err) {return res.status(500).json({"error":"DB error!"});} else {
				let gamers = [];
				let result = {};
				let key;
				//get all id
				await rows.forEach(element => {
					gamers.push(element.id)
				})
				//set random santa-recepient. Santa can be recepient.
				await rows.forEach(element => {
					key = Math.floor(Math.random() * gamers.length);
					result[element.id] = gamers[key];
					gamers = gamers.filter(item => item !== gamers[key]);
				});
				//save to DB
				await Object.keys(result).forEach(function(key) {
		  			db.run("UPDATE gamers SET recepient=? where id=?",[result[key], key],async (err, row) => {
						if (err) {return res.status(500).json({"error":"Update DB error!"});}
					});
				});
				//return data
				await db.all('SELECT id, recepient FROM gamers', [],async (err, rows) => {
					return res.json({
						"status": 'succes! Game completed successfully!', "data": rows
					})
					
				});
				
			}
		});
	}
	});
});

app.listen(process.env.PORT, () => {
  console.log(`Example app listening at http://localhost:${process.env.PORT}`);
})