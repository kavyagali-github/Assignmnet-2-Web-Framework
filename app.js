// Import the Express framework
const express = require('express');
// Import the Handlebars engine for templating
const { engine } = require('express-handlebars');
// Import the path module to handle file and directory paths
const path = require('path');
// For file system functionalities like reading and writing files
const fs = require('fs');

// Express application
const app = express(); 

// Set up Handlebars as the view engine with .hbs extension
app.engine('hbs', engine({ 
    extname: '.hbs',
    defaultLayout: 'main',
    helpers: {
        filterByMetascore: (movies, threshold) => {
            return movies.filter(movie => movie.Metascore >= threshold);
        },
        highlightIfBlank: (metascore) => {
            return (metascore === "" || metascore === "N/A") ? 'highlight' : '';
        }
    }
})); 
app.set('view engine', 'hbs'); 

// Define the port 
const port = process.env.PORT || 3000; 

// Serve static files from the directory public
app.use(express.static(path.join(__dirname, 'public'))); 

// Middleware to parse URL-encoded data
app.use(express.urlencoded({ extended: true }));

// Define the route for the home page
app.get('/', (req, res) => {
    res.render('index', { title: 'Express' }); 
});

// Define the route for the /users page
app.get('/users', (req, res) => {
    res.send('respond with a resource'); 
});

// Load JSON data route
app.get('/data', (req, res) => {
    const jsonFilePath = path.join(__dirname, 'movie-dataset-a2.json');
    fs.readFile(jsonFilePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error loading JSON data:', err);
            res.status(500).send('Error loading JSON data');
            return;
        }
        const movieData = JSON.parse(data); 
        console.log(movieData); 
        res.send('JSON data is loaded and ready!'); 
    });
});

// Display Movie_ID using req.params
app.get('/data/movie/:index', (req, res) => {
    const jsonFilePath = path.join(__dirname, 'movie-dataset-a2.json');
    fs.readFile(jsonFilePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error loading JSON data:', err);
            res.status(500).send('Error loading JSON data');
            return; 
        }

        const movieData = JSON.parse(data); 
        const index = parseInt(req.params.index); 

        if (index >= 0 && index < movieData.length) {
            const movie = movieData[index]; 
            res.send(`Movie ID at index ${index}: ${movie.Movie_ID}`); 
        } else {
            res.status(400).send('Invalid index. Please enter a valid index number.');
        }
    });
});

// Display form for searching by Movie ID
app.get('/data/search/id/', (req, res) => {
    res.send(`
        <form method="POST" action="/data/search/id/">
            <input type="text" name="movie_id" placeholder="Enter Movie ID" required>
            <input type="submit" value="Search">
        </form>
    `);
});

// Handle movie ID search 
app.post('/data/search/id/', (req, res) => {
    const movieID = parseInt(req.body.movie_id, 10); 
    const jsonFilePath = path.join(__dirname, 'movie-dataset-a2.json');

    fs.readFile(jsonFilePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error loading JSON data:', err);
            res.status(500).send('Error loading JSON data');
            return; 
        }

        const movieData = JSON.parse(data);
        const movie = movieData.find(movie => movie.Movie_ID === movieID);

        if (movie) {
            res.send(`
                <h2>Movie Information:</h2>
                <p>Movie ID: ${movie.Movie_ID}</p>
                <p>Title: ${movie.Title}</p>
                <p>Year: ${movie.Year}</p>
                <p>Rated: ${movie.Rated}</p>
                <p>Released: ${movie.Released}</p>
                <p>Runtime: ${movie.Runtime}</p>
                <p>Genre: ${movie.Genre}</p>
                <p>Director: ${movie.Director}</p>
                <p>Writer: ${movie.Writer}</p>
                <p>Actors: ${movie.Actors}</p>
                <p>Plot: ${movie.Plot}</p>
                <p>Language: ${movie.Language}</p>
                <p>Country: ${movie.Country}</p>
                <p>Awards: ${movie.Awards}</p>
                <p>IMDB Rating: ${movie.imdbRating}</p>
                <p>IMDB Votes: ${movie.imdbVotes}</p>
            `);
        } else {
            res.status(404).send('Cannot find movie with the given ID.');
        }
    });
});

// Display form for searching by Movie Title
app.get('/data/search/title/', (req, res) => {
    res.send(`
        <form method="POST" action="/data/search/title/result">
            <input type="text" name="movie_title" placeholder="Enter Movie Title" required>
            <input type="submit" value="Search">
        </form>
    `);
});

// Handle movie title search 
app.post('/data/search/title/result', (req, res) => {
    const searchTitle = req.body.movie_title.toLowerCase(); 
    const jsonFilePath = path.join(__dirname, 'movie-dataset-a2.json');

    fs.readFile(jsonFilePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error loading JSON data:', err);
            res.status(500).send('Error loading JSON data');
            return; 
        }

        const movieData = JSON.parse(data); 
        const matchingMovies = movieData.filter(movie => 
            movie.Title.toLowerCase().includes(searchTitle)
        );

        if (matchingMovies.length > 0) {
            let results = '<h2>Movies:</h2><ul>';
            matchingMovies.forEach(movie => {
                results += `
                    <li>
                        Movie ID: ${movie.Movie_ID}<br>
                        Title: ${movie.Title}<br>
                        Genre: ${movie.Genre}<br>
                        Director: ${movie.Director}<br>
                        Year: ${movie.Year}
                    </li>
                `;
            });
            results += '</ul>';
            res.send(results);
        } else {
            res.status(404).send('No movies found with that title.');
        }
    });
});

// Route to display all movie data
app.get('/allData', (req, res) => {
    const jsonFilePath = path.join(__dirname, 'movie-dataset-a2.json');
    
    fs.readFile(jsonFilePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error loading JSON data:', err);
            res.status(500).send('Error loading JSON data');
            return;
        }

        const movies = JSON.parse(data); 
        res.render('allData', { title: 'All Movie Data', movies: movies }); 
    });
});

// Error handling for unmatched routes
app.use((req, res) => {
    res.status(404).send('<h1>404 - ERROR: Try a different Route.</h1>');
});

// Start the server and listen on the defined port
app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`); 
});
