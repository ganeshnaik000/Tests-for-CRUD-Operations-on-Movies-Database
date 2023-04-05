const express = require("express");
const { open } = require("sqlite");

const path = require("path");
const sqlite3 = require("sqlite3");

const dbPath = path.join(__dirname, "moviesData.db");

const app = express();
app.use(express.json());

let db = null;

const initilizeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server is running at http://localhost:3000");
    });
  } catch (error) {
    console.log(`DB Error: ${error.message}`);
    process.exit(1);
  }
};

initilizeDBAndServer();

//GET ALL MOVIES
app.get("/movies/", async (request, response) => {
  const getmovieQuery = `
    SELECT
     movie_name
      FROM
    movie 
    ORDER BY 
    movie_id ASC;`;
  let movieArray = [];
  let listOfMovies = await db.all(getmovieQuery);
  response.send(listOfMovies);
});

//POST METHOD ADD MOVIE

app.post("/movies/", async (request, response) => {
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;
  const addMovieQuery = `
    INSERT INTO 
        movie(director_id,movie_name,lead_actor)

    VALUES 
    (
        ${directorId},
       '${movieName}',
       '${leadActor}'
    );`;
  const dbResponse = await db.run(addMovieQuery);
  const movieId = dbResponse.lastID;
  response.send("Movie Successfully Added");
});

//GET METHOD ONE MOVIE ONLY
app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getmovieQuery = `
    SELECT 
    *
    FROM
      movie
    WHERE 
      movie_id = ${movieId};`;
  const getMovie = await db.get(getmovieQuery);
  response.send(getMovie);
});

//PUT METHOD UPDATE MOVIE
app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;
  const updateQuery = `
  UPDATE 
      movie
  SET
     director_id = ${directorId},
     movie_name = '${movieName}',
     lead_actor = '${leadActor}'
  WHERE 
     movie_id = ${movieId};`;
  await db.run(updateQuery);
  response.send("Movie Details Updated");
});

//DELETE METHOD
app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const deleteQuery = `
    DELETE 
       FROM 
    movie
    WHERE
       movie_id = ${movieId};`;
  await db.run(deleteQuery);
  response.send("Movie Removed");
});

//GET ALL DIRECTORS
app.get("/directors/", async (request, response) => {
  const alldirectorQuery = `
    SELECT 
    * 
    FROM 
      director;`;
  const listOfDirectors = await db.all(alldirectorQuery);
  response.send(listOfDirectors);
});

//GET METHOD BUT SPECIFIC DIRECTOR AND MOVIE
app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const directedMovieQuery = `
SELECT * FROM 
  director INNER JOIN movie 
  ON director.director_id = movie.director_id
  WHERE 
  director_id = ${directorId};`;

  const allMovieDirector = await db.all(directedMovieQuery);
  response.send(allMovieDirector);
});

module.exports = app;
