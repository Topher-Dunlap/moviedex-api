require('dotenv').config()
const express = require('express')
const cors = require('cors')
const morgan = require('morgan')
const helmet = require('helmet')
const MOVIES = require('./movies-data-small.json')

const app = express()

const morganSetting = process.env.NODE_ENV === 'production' ? 'tiny' : 'common'
app.use(morgan(morganSetting))
app.use(helmet())
app.use(cors())

app.use(function validateBearerToken(req, res, next) {
    const apiToken = process.env.API_TOKEN
    const authToken = req.get('Authorization')

    if (!authToken || authToken.split(' ')[1] !== apiToken) {
        return res.status(401).json({error: 'Unauthorized request'})
    }
    // move to the next middleware
    next()
})

app.get('/larry', function getLarry(req, res) {
    const larryObj = {l:"larry"}
    res.json(larryObj)
})

app.get('/movie', function handleGetMovie(req, res) {
    let response = MOVIES;

    // filter our Movies by genre if name query param is present
    if (req.query.genre) {
        response = response.filter(movie =>
            // case insensitive searching
            movie.genre.toLowerCase().includes(req.query.genre.toLowerCase())
        )
    }

    // filter our Movies by country if name query param is present
    if (req.query.country) {
        response = response.filter(movie =>
            // case insensitive searching
            movie.country.toLowerCase().includes(req.query.country.toLowerCase())
        )
    }

    // filter our Movies by country if name query param is present
    if (req.query.avg_vote) {
        response = response.filter(movie =>
            Number(movie.avg_vote) >= Number(req.query.avg_vote)
        )
    }

    res.json(response)
})

// 4 parameters in middleware, express knows to treat this as error handler
app.use((error, req, res, next) => {
    let response
    if (process.env.NODE_ENV === 'production') {
        response = { error: { message: 'server error' }}
    } else {
        response = { error }
    }
    res.status(500).json(response)
})

const PORT = process.env.PORT || 8000

app.listen(PORT, () => {
    console.log(`Server listening at http://localhost:${PORT}`)
})