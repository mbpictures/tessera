import ical from "ical-generator";
import { getEventTitle } from "../constants/util";

export const getIcalData = (eventDate) => {
    const calender = ical({
        name: getEventTitle(eventDate)
    });
    calender.createEvent({
        start: eventDate.date,
        summary: getEventTitle(eventDate)
    });
    return {
        filename: "event.ics",
        content: calender.toString()
    };
}
