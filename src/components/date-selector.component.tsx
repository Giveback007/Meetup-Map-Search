import React = require("react");
import { EventsDate } from "../types/events-date.type";

type dateSelectorProps = { data: EventsDate }
export const DateSelector = ({ data: { displayDate, events } }: dateSelectorProps) => (
    <div className="date-selector">
        <div className="display-date">{displayDate}</div>
        <div className="events-number">
            <span>{events.length}</span>
            <span>Events</span>
        </div>
    </div>
);
