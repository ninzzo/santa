game "Secret Santa"
=====

### Download project:<br>
-git remote add origin https://github.com/ninzzo/santa.git<br>
-git pull origin main<br>
-npm update<br>
-open .env and change PORT and DB_FILENAME (optional)<br>
-node index.js<br>

=====

### methods API:

#### POST /api/newGame
Delete all all gamers and wishes (new game

#### POST /api/newGame
Add gamer <br>
params:<br>
-first_name(string)<br>
-last_name(string)<br>
-wish(string or array)<br>

#### POST /api/shuffle
Start game and shuffle gamers

#### GET /api/getInfo/
Get information and wish list about recipient by ID of gamer <br>
params:<br>
-id(integer)
