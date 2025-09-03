import { KafkaProducerBroker } from "../../config/kafka";
import { MessageProducerBroker } from "../types/broker";
import config from "config";

let messsageProducer: MessageProducerBroker | null = null;
export const createMessageProducerBroker = (): MessageProducerBroker => {
    // making singletone
    if (!messsageProducer) {
        messsageProducer = new KafkaProducerBroker("catalog-service", [
            config.get("kafka.broker"),
        ]);
    }
    return messsageProducer;
};
