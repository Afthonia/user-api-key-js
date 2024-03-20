const express = require('express'); // for api management
const dotenv = require('dotenv'); // for setting environment variables
const { v4: uuidv4 } = require('uuid');
const fs = require('node:fs');  // for file operations
const { open } = require('node:fs/promises'); // for checking the api key

dotenv.config();

// creating an application
const app = express();

// setting the port number
const port = process.env.PORT || 8081;

// some configurations
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// the directory to store user information
const userDir = './users';


// api request handling methods
//

app.get('/sign-up', (req, res) => {
    res.sendFile(__dirname + '/templates/index.html');
});

app.post('/register', (req, res) => {
    const { username, password } = req.body;

    var apiKey = '', userData = '';

    /* const user = {
        username,
        password,
        apiKey
    }; */

    if (!fs.existsSync(`${userDir}/${username}Info.txt`)) {
        apiKey = uuidv4();
        userData = `Username: ${username}\nPassword: ${password}\nAPI Key: ${apiKey}`;
        storeUser(username, userData);
        addApiKey(apiKey);
        res.json({ apiKey, username, password });
    } else {
        res.json({ error: 'there is a user with this username already' });
    }
});

// to test if the user can reach any other route without an api key
app.get('/test', (req, res) => {
    const apiKey = req.query.apiKey;

    checkApiKey(apiKey);
})

//
// end of route management


// opening the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});


// helper methods
//
const storeUser = (username, user) => {

    if (!fs.existsSync(`${userDir}`)) {
        fs.mkdirSync(`${userDir}`);
    }

    fs.writeFile(`${userDir}/${username}Info.txt`, user, { flag: 'w' }, (err) => {
        if (err) {
            console.error(err);
            //res.status(500).json({ error: 'Failed to store user information' })
        } else {
            console.log("store the user successful");
            //res.json({ apiKey });
        }
    });
}

const addApiKey = (apiKey) => {
    fs.appendFile(`${userDir}/api-keys.txt`, `${apiKey}\n`, { flag: 'a' }, (err) => {
        if (err) {
            console.error(err);
        } else {
            console.log("add api key successful");
        }
    });
}

async function checkApiKey(apiKey) {
    const keys = await open(`${userDir}/api-keys.txt`);
    for await (const key of keys.readLines()) {
        console.log(key === apiKey);
    }
}

//
// end of helpers