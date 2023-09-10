import * as amqp from 'amqplib/callback_api.js'

class Consumer{
    constructor() {
        this.channel = null;
        this.exchangName = null;
    }

    async start (uri, exchangName, exchangeType) {
        this.exchangName = exchangName;
        //connect
        amqp.connect(uri, (err, connection)=>{
            this.channel = connection.createChannel()
            this.channel.assertExchange(exchangName, exchangeType);
        })
    }

    async createQueue (queueName, routingKey) {
        const queue = await this.assertQueue(queueName);
        await this.channel.bindQueue(queue, this.exchangName, routingKey);
    }

    async assertQueue (queueName) {
        const q = await this.channel.assertQueue(queueName);
        return q.queue;
    }
 }

 export default Consumer;