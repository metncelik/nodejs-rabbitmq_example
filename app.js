import express from 'express';
import Producer from './rabbitmq/producer.js';
import Consumer from './rabbitmq/consumer.js';
import bodyParser from 'body-parser';
import rabbitMQ from './config.js';

const app = express()
app.use(bodyParser.json())
const producer = new Producer()
const consumer = new Consumer()

const queues = {}
const handler = {
    set(target, key, value) {
        target[key] = value;
        consumer.channel.consume(key, (msg) => {
            const messageData = JSON.parse(msg.content)
            queues[key].last_update = messageData.date
            queues[key].messages.push(messageData.message)
            consumer.channel.ack(msg)
        })
        return true;
    }
}
const proxy = new Proxy(queues, handler)

producer.start(rabbitMQ.exchangeName, rabbitMQ.exchangeType)

app.get("/", (req, res) => {
    res.send(queues)
})

app.post("/add-queue", async (req, res) => {
    const reqData = req.body;
    const queueName = reqData.queueName;
    const routingKey = reqData.routingKey;
    const q = await consumer.createQueue(queueName, routingKey);
    const queue = q.queue
    proxy[queue] = {
        name: queue,
        routingKey: routingKey,
        messages: []
    };

    res.send(`queue created: ${queue}`);
})

app.post("/send-message", async (req, res) => {
    const reqData = req.body;
    const routingKey = reqData.routingKey;
    const message = reqData.message;
    producer.publishMessage(routingKey, message)
    res.send("message sended.")
})

app.post("/consume", (req, res) => {
    consumeQueues();
})

app.listen(5000, ()=>{
    console.log("live")
})