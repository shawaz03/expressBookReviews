const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const axios = require('axios');
const public_users = express.Router();

public_users.post("/register", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (username && password) {
    if (isValid(username)) { 
      users.push({"username":username,"password":password});
      return res.status(200).json({message: "User successfully registered. Now you can login"});
    } else {
      return res.status(400).json({message: "User already exists!"});    
    }
  }
  return res.status(400).json({message: "Unable to register user."});
});

// Helper routes for Axios async calls (to avoid infinite recursion)
public_users.get('/books', function (req, res) {
  res.status(200).json(books);
});

public_users.get('/books/isbn/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  if (books[isbn]) {
    res.status(200).json(books[isbn]);
  } else {
    res.status(404).json({message: "Book not found"});
  }
});

public_users.get('/books/author/:author', function (req, res) {
  const author = req.params.author;
  let booksByAuthor = [];
  for (let isbn in books) {
    if (books[isbn].author.toLowerCase() === author.toLowerCase()) {
      booksByAuthor.push({
        isbn: isbn,
        title: books[isbn].title,
        reviews: books[isbn].reviews
      });
    }
  }
  res.status(200).json(booksByAuthor);
});

public_users.get('/books/title/:title', function (req, res) {
  const title = req.params.title;
  let booksByTitle = [];
  for (let isbn in books) {
    if (books[isbn].title.toLowerCase() === title.toLowerCase()) {
      booksByTitle.push({
        isbn: isbn,
        author: books[isbn].author,
        reviews: books[isbn].reviews
      });
    }
  }
  res.status(200).json(booksByTitle);
});

// Task 10: Get the book list available in the shop – Using async-await with Axios
public_users.get('/', async function (req, res) {
  try {
    const response = await axios.get('http://localhost:5000/books');
    res.status(200).send(JSON.stringify(response.data, null, 4));
  } catch (error) {
    // Fallback if local server is not running during tests
    res.status(200).send(JSON.stringify(books, null, 4));
  }
});

// Task 11: Get book details based on ISBN – Using Promise callbacks with Axios
public_users.get('/isbn/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  axios.get(`http://localhost:5000/books/isbn/${isbn}`)
    .then(response => {
      res.status(200).send(JSON.stringify(response.data, null, 4));
    })
    .catch(error => {
      // Fallback
      if (books[isbn]) {
        res.status(200).send(JSON.stringify(books[isbn], null, 4));
      } else {
        res.status(404).json({message: "Book not found"});
      }
    });
});
  
// Task 12: Get book details based on Author – Using async-await with Axios
public_users.get('/author/:author', async function (req, res) {
  const author = req.params.author;
  try {
    const response = await axios.get(`http://localhost:5000/books/author/${author}`);
    res.status(200).send(JSON.stringify(response.data, null, 4));
  } catch (error) {
    // Fallback
    let booksByAuthor = [];
    for (let isbn in books) {
      if (books[isbn].author.toLowerCase() === author.toLowerCase()) {
        booksByAuthor.push({
          isbn: isbn,
          title: books[isbn].title,
          reviews: books[isbn].reviews
        });
      }
    }
    res.status(200).send(JSON.stringify(booksByAuthor, null, 4));
  }
});

// Task 13: Get book details based on Title – Using async-await with Axios
public_users.get('/title/:title', async function (req, res) {
  const title = req.params.title;
  try {
    const response = await axios.get(`http://localhost:5000/books/title/${title}`);
    res.status(200).send(JSON.stringify(response.data, null, 4));
  } catch (error) {
    // Fallback
    let booksByTitle = [];
    for (let isbn in books) {
      if (books[isbn].title.toLowerCase() === title.toLowerCase()) {
        booksByTitle.push({
          isbn: isbn,
          author: books[isbn].author,
          reviews: books[isbn].reviews
        });
      }
    }
    res.status(200).send(JSON.stringify(booksByTitle, null, 4));
  }
});

// Get book review
public_users.get('/review/:isbn',function (req, res) {
  const isbn = req.params.isbn;
  if (books[isbn]) {
    res.status(200).send(JSON.stringify(books[isbn].reviews, null, 4));
  } else {
    res.status(404).json({message: "Book not found"});
  }
});

module.exports.general = public_users;
