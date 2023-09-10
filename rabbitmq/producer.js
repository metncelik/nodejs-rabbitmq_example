import amqp from 'amqplib/callback_api.js';

class Producer {
    constructor() {
        this.channel = null;
        this.exchangeName = null;
    }

    async start(uri, exchangName, exchangeType) {

        //connect
        amqp.connect(uri, (err, connection) => {
            if (err) {
                throw err;
            }
            connection.createChannel((err, channel) => {
                if (err) {
                    throw err;
                }
                channel.assertExchange(exchangName, exchangeType);
                this.channel = channel
            });
        });

        //create exchange
    }

    async publishMessage(routingKey, message) {
        await this.channel.publish(this.exchangeName, routingKey, Buffer.from(JSON.stringify(
            {
                message: message,
                date: Date.now()
            }
        )));
    }
}

export default Producer;