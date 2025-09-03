import { Kafka, Producer } from "kafkajs";
import { MessageProducerBroker } from "../common/types/broker";

export class KafkaProducerBroker implements MessageProducerBroker {
    private producer: Producer;
    constructor(clientId: string, brokers: string[]) {
        const kafka = new Kafka({ clientId, brokers });
        this.producer = kafka.producer();
    }
    // connect the producer
    async connect() {
        await this.producer.connect();
    }
    // disconnect the producer
    async disconnect() {
        if (this.producer) {
            await this.producer.disconnect();
        }
    }

    //@param topic - the topic send the message to
    //@param messsage - the message to send
    //@throws{Error} - when the produces is not connected

    async sendMessage(topic: string, message: string) {
        await this.producer.send({
            topic,
            messages: [{ value: message }],
        });
    }
}
