const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
    // Returns false if username already exists
    return !users.some(user => user.username === username);
};


const authenticatedUser = (username, password) => {
    return users.some(user => user.username === username && user.password === password);
};


//only registered users can login
regd_users.post("/login", (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    }

    if (authenticatedUser(username, password)) {
        // Generate JWT token
        const token = jwt.sign({ username }, "access_key", { expiresIn: "1h" });

        // Save username in session for review tasks
        req.session.user = username;

        return res.json({ message: "Login successful", token });
    } else {
        return res.status(401).json({ message: "Invalid username or password" });
    }
});


regd_users.put("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const review = req.query.review; // review is sent as query param
    const username = req.session.user;

    if (!username) {
        return res.status(401).json({ message: "Login first to add a review" });
    }

    if (!books[isbn]) {
        return res.status(404).json({ message: "Book not found" });
    }

    // Add or update review
    books[isbn].reviews[username] = review;

    return res.json({ message: `Review by ${username} added/updated successfully`, reviews: books[isbn].reviews });
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const username = req.session.user;

    if (!username) {
        return res.status(401).json({ message: "Login first to delete a review" });
    }

    if (!books[isbn] || !books[isbn].reviews[username]) {
        return res.status(404).json({ message: "No review by this user found for this book" });
    }

    delete books[isbn].reviews[username];

    return res.json({ message: `Review by ${username} deleted successfully`, reviews: books[isbn].reviews });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
