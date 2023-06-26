const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const port = process.env.PORT || 5000;
const app = express();
// middleware
app.use(cors());
app.use(express.json());




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.6kqiq.mongodb.net/?retryWrites=true&w=majority`;
console.log(uri)
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});
// display all student
async function run() {
    try {
        const studentListCollections = client.db('studentAttendence').collection('studentList');
        const studentAttendenceCollection = client.db('studentAttendence').collection('attendences');
        const teachersCollection = client.db('studentAttendence').collection('teacherList');

        // display all students
        app.get('/studentList', async (req, res) => {
            const query = {};
            // const date = req.query.date;
            // console.log('date:', date)
            const options = await studentListCollections.find(query).toArray()
            res.send(options)
        })


        // present / booking 

        app.post('/presents', async (req, res) => {
            const stdPresent = req.body;
            console.log('studend presnt', stdPresent)
            const query = {
                date: stdPresent.date,
                studentName: stdPresent.studentName,
                email: stdPresent.email
            }
            const alreadyPresent = await studentAttendenceCollection.find(query).toArray();
            if (alreadyPresent.length) {
                const message = `you already present on ${stdPresent.studentName}`;
                return res.send({ acknowledged: false, message })
            }

            const result = await studentAttendenceCollection.insertOne(stdPresent)
            res.send(result)
        })

        // get present with teacher email
        app.get('/attendence', async (req, res) => {
            const email = req.query.email
            const date = req.query.date
            console.log(date)
            const query = { email: email, date: date }
            const cursor = await studentAttendenceCollection.find(query).toArray();
            res.send(cursor)

        })

        // find on element 
        app.get('/studentList/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            // const id=req.params.roll;
            // const query = { title: id };
            const user = await studentListCollections.findOne(query);
            res.send(user)
        })
        // insert student
        app.post('/addStudent', async (req, res) => {
            const student = req.body
            // console.log(student);
            const result = await studentListCollections.insertOne(student)
            res.send(result)
        })

        // set teacher db 

        app.post('/teachers', async (req, res) => {
            const teacher = req.body;
            console.log('teacher server:', teacher)
            const result = await teachersCollection.insertOne(teacher);
            res.send(result)
        })
        // get teacher data 
        app.get('/teacher', async (req, res) => {
            const email = req.query.email

            const query = { email: email }
            console.log('teacher email:', query)
            const result = await teachersCollection.find(query).toArray()
            res.send(result)
        })




        // update Student information

        // app.put('/studentList/:id', async (req, res) => {
        //     const id = req.params.id;
        //     const filter = { _id: new ObjectId(id) };
        //     const user = req.body;
        //     const option = { upsert: true }
        //     const updatedUser = {
        //         $set: {
        //             name: user.name,
        //             email: user.email,
        //             roll: user.roll,
        //             phone: user.phone,
        //             status: 'Present'

        //         }
        //     }
        //     const result = await studentListCollections.updateOne(filter, updatedUser, option);
        //     res.send(result);
        // })


        // attendence 
        app.put('/studentList/:id', async (req, res) => {
            const id = req.params.id;

            const query = { _id: new ObjectId(id) };
            // const user = req.body;
            const option = { upsert: true }
            const updatedUser = {
                $set: {
                    status: 'Present'
                }
            }
            const result = await studentListCollections.updateOne(query, updatedUser, option);
            res.send(result);
        })


        // app.put('/studentList/:id', async (req, res) => {
        //     const id = req.params.id;
        //     const query = { _id: new ObjectId(id) };
        //     const user = req.body;
        //     console.log(user)

        //     const option = { upsert: true }
        //     const updatedUser = {
        //         $set: {
        //             status: 'Absence'
        //         }
        //     }
        //     const result = await studentListCollections.updateOne(query, updatedUser, option);
        //     res.send(result);
        // })

        // delete student
        app.delete('/studentList/:id', async (req, res) => {
            const id = req.params.id; //name params
            const query = ({ _id: new ObjectId(id) })
            // const id = req.params.name; 
            // console.log('trying to delete:', id)
            // const query = { title: id };
            const result = await studentListCollections.deleteOne(query)
            // console.log('result:', result);
            res.send(result)

        })

    } finally {

    }
}

run().catch(console.dir)



app.get('/', async (req, res) => {
    res.send("Attenden server")
})

app.listen(port, () => console.log(`Student server ${port}`))