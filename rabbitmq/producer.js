import amqp from 'amqplib';
import rabbitMQ from '../config.js';

class Producer {
    constructor() {
        this.channel = null;
        this.exchangeName = null;
        this.url = rabbitMQ.url
    }

    async start(exchangName, exchangeType) {
        this.exchangeName = exchangName
        const connection = await amqp.connect(this.url);
        this.channel = await connection.createChannel()
        await this.channel.assertExchange(exchangName, exchangeType);
    }

    publishMessage(routingKey, message) {
        this.channel.publish(this.exchangeName, routingKey, Buffer.from(JSON.stringify(
            {
                message: message,
                date: Date.now()
            }
        )));
    }
}

export default Producer;