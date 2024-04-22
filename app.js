const express = require('express')
const app = express()

app.use(express.json())

const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const path = require('path')

const dbPath = path.join(__dirname, 'moviesData.db')
let db = null

const initalDBandServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    console.log(db)
    app.listen(3000, () => {
      console.log('server is started to run on port number 3000')
    })
  } catch (error) {
    console.log(`this is error ${error.message}`)
    process.exit(1)
  }
}
initalDBandServer()

//Returns a list of all movie names in the movie table

app.get('/movies/', async (request, response) => {
  const getallMovienames = `select movie_name from Movie`
  const movieNames = await db.all(getallMovienames)
  response.send(
    movieNames.map(eachmovie => ({movieName: eachmovie.movie_name})),
  )
})

// Creates a new movie in the movie table. movie_id is auto-incremented
app.post('/movies/', async (request, response) => {
  const {directorId, movieName, leadActor} = request.body
  const addMovieDeatails = `
  INSERT INTO movie(director_id, movie_name, lead_actor) VALUES
  (
    ${directorId},
    '${movieName}',
    '${leadActor}'
  )`
  await db.run(addMovieDeatails)
  response.send('Movie Successfully Added')
})

// Returns a movie based on the movie ID
app.get('/movies/:movieId', async (request, response) => {
  const {movieId} = request.params
  const getMovieBasedId = `SELECT * FROM movie WHERE movie_id = ${movieId}`
  const dbresponse = await db.all(getMovieBasedId)
  response.send(dbresponse)
})

// Updates the details of a movie in the movie table based on the movie ID

app.put('/movies/:movieId/', async (request, response) => {
  const {directorId, movieName, leadActor} = request.body
  const {movieId} = request.params
  const updateDeatils = `UPDATE movie SET 
  director_id	= ${directorId},
  movie_name = '${movieName}',
  lead_actor = '${leadActor}'
  WHERE movie_id = ${movieId}
  ;`
  await db.run(updateDeatils)
  response.send('Movie Details Updated')
})

//Deletes a movie from the movie table based on the movie ID

app.delete('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const deleteMovieBasedOnId = `DELETE FROM movie WHERE movie_id = ${movieId}`
  await db.run(deleteMovieBasedOnId)
  response.send('Movie Removed')
})

// Returns a list of all directors in the director table
app.get('/directors/', async (request, response) => {
  const getAlldirectors = `SELECT * FROM director`
  const alldirectors = await db.all(getAlldirectors)
  response.send(alldirectors)
})

// Returns a list of all movie names directed by a specific director

app.get('/directors/:directorId/movies/', async (request, response) => {
  const {directorId} = request.params
  const getGirectormovienames = `SELECT movie_name as movieName FROM movie INNER JOIN director ON movie.director_id = director.director_id WHERE movied.irector_id = ${directorId}`
  const getResponse = await db.all(getGirectormovienames)
  response.send(getResponse)
})

module.exports = app
