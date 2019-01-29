import { eventCategory } from "./event-category.type";
import { eventSource } from "./event-source.type";

export type Event = {
    category: eventCategory;
    dateId: string;
    eventId: string;    
    eventSource: eventSource;
    link: string;
    location: [number, number];
    name: string;
    organization: string; // Group Name
    imgLink: string;
    imgThumbLink: string;
    timeDuration: number;
    timeOffset: number;
    timeUnix: number;
}
