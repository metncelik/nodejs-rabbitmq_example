import express from 'express';
import rabbitMQ from './config.js';
import Producer from './rabbitmq/producer.js';
import Consumer from './rabbitmq/consumer.js';
import bodyParser from 'body-parser';

const app = express()
app.use(bodyParser.json())
const producer = new Producer()
const consumer = new Consumer()

const queues = {}

producer.start(rabbitMQ.uri, "newExchange", "direct")

// consumer.start(rabbitMQ.uri, "newExchange", "direct")

const addQueue = async (queueName, routingKey) => {
    await consumer.createQueue(queueName, routingKey)
    queues[queueName]["messages"] = []
}

const sendMessage = async (routingKey, message) => {
    await producer.publishMessage(routingKey, message)
}

const consumeQueues = async () => {
    for (const queueName in queues) {
        const queue = await consumer.assertQueue(queueName); 
        consumer.channel.consume(queue, (msg) => {
            queues[queueName]["messages"].push(msg)
        })
    }
}

// consumeQueues()

app.get("/", (req, res) => {
    res.send(queues)
})

app.post("/add-queue", async (req, res) => {
    const reqData = req.data;
    const queueName = reqData.queueName;
    const routingKey = reqData.routingKey;
    await addQueue(queueName, routingKey)
    res.send("queue created.")
})

app.post("/send-message", async (req, res) => {
    const reqData = req.data;
    const routingKey = reqData.routingKey;
    const message = reqData.message;
    await sendMessage(queueName, message)
    res.send("message sended.")
})