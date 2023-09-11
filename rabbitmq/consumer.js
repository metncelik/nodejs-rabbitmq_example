import amqp from 'amqplib'
import rabbitMQ from '../config.js';

class Consumer{
    constructor() {
        this.channel;
        this.exchangName = rabbitMQ.exchangeName;
        this.exchangType = rabbitMQ.exchangeType;
        this.url = rabbitMQ.url;
    }
    
    async start () {
        const connection = await amqp.connect(this.url);
        this.channel =  await connection.createChannel();
        await this.channel.assertExchange(this.exchangName, this.exchangeType)
    }

    async createQueue (queueName, routingKey) {
        if (!this.channel) {
            console.log("consumer channel created.");
            await this.start();
        }
        const q = await this.channel.assertQueue(queueName, {durable: false});
        await this.channel.bindQueue(q.queue, this.exchangName, routingKey)
        console.log("queue created");
        return q;
    }
 }

 export default Consumer;