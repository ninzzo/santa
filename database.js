const sqlite3 = require('sqlite3').verbose();
require('dotenv').config();

let db = new sqlite3.Database(process.env.DB_FILENAME, (err) => {
    if (err) {
      // Cannot open database
      console.error(err.message);
      throw err
    } else {
        console.log('Connected to the SQLite database.')
        db.run(`CREATE TABLE "gamers" (
			"id"	INTEGER PRIMARY KEY AUTOINCREMENT,
			"first_name" TEXT NOT NULL,
			"last_name" TEXT NOT NULL,
			"recepient" INTEGER
		)`,
        (err) => {
            //console.log(err)
        });
        db.run(`CREATE TABLE "wishes" (
			"id"	INTEGER PRIMARY KEY AUTOINCREMENT,
			"gamer_id"	TEXT NOT NULL,
			"wish" TEXT NOT NULL
		)`,
        (err) => {
            //console.log(err)
        }); 
    }
});

module.exports = db