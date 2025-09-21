const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const axios = require('axios');

async function getAllBooks() {
    try {
        const response = await axios.get('http://localhost:5000/');
        console.log("All Books:", response.data);
    } catch (error) {
        console.error("Error fetching all books:", error.message);
    }
}

getAllBooks();

async function getBookByISBN(isbn) {
    try {
        const response = await axios.get(`http://localhost:5000/isbn/${isbn}`);
        console.log(`Book with ISBN ${isbn}:`, response.data);
    } catch (error) {
        console.error(`Error fetching book with ISBN ${isbn}:`, error.message);
    }
}

// Example call
getBookByISBN(1);

async function getBooksByAuthor(author) {
    try {
        const encodedAuthor = encodeURIComponent(author);
        const response = await axios.get(`http://localhost:5000/author/${encodedAuthor}`);
        console.log(`Books by ${author}:`, response.data);
    } catch (error) {
        console.error(`Error fetching books by author ${author}:`, error.message);
    }
}

// Example call
getBooksByAuthor("Unknown");

async function getBooksByTitle(title) {
    try {
        const encodedTitle = encodeURIComponent(title);
        const response = await axios.get(`http://localhost:5000/title/${encodedTitle}`);
        console.log(`Books with title "${title}":`, response.data);
    } catch (error) {
        console.error(`Error fetching books with title "${title}":`, error.message);
    }
}

// Example call
getBooksByTitle("Things Fall Apart");



public_users.post("/register", (req,res) => {
  //Write your code here
  const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    }

    if (!isValid(username)) {
        return res.status(409).json({ message: "Username already exists" });
    }

    users.push({ username: username, password: password });
    return res.status(201).json({ message: "User registered successfully" });
});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
  //Write your code here
  return res.send(JSON.stringify(books,null,4));
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  //Write your code here
  const isbn=req.params.isbn;
  if(books[isbn]){
    return res.json(books[isbn]);
  }else{
    return res.status(404).json({ message: "Book not found" });
  }
 });
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
    const author=req.params.author.toLowerCase();
    const results = [];

    Object.values(books).forEach(book => {
        if (book.author.toLowerCase() === author) {
            results.push(book);
        }
    });

    if (results.length > 0) {
        return res.json(results);
    } else {
        return res.status(404).json({ message: "No books found for this author" });
    }
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
  //Write your code here
  const title = req.params.title.toLowerCase();
    const results = [];

    Object.values(books).forEach(book => {
        if (book.title.toLowerCase() === title) {
            results.push(book);
        }
    });

    if (results.length > 0) {
        return res.json(results);
    } else {
        return res.status(404).json({ message: "No books found with this title" });
    }
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  //Write your code here
  const isbn = req.params.isbn;

    if (books[isbn] && books[isbn].reviews) {
        return res.json(books[isbn].reviews);
    } else {
        return res.status(404).json({ message: "No reviews found for this book" });
    }
});

module.exports.general = public_users;
