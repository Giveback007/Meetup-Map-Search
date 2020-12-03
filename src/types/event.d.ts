import type { Group, Venue } from "./events-response"


type Status =
    | "cancelled"
    | "upcoming"
    | "past"
    | "proposed"
    | "suggested"
    | "draft"

type Visibility =
    | "public"
    | "public_limited"
    | "members"

export interface Event {
    created?:                number;
    duration:                number;
    id:                      string;
    name:                    string;
    date_in_series_pattern?: boolean;
    status?:                 Status;
    time:                    number;
    local_date:              string;
    local_time:              string;
    updated?:                number;
    utc_offset:              number;
    waitlist_count:          number;
    yes_rsvp_count:          number;
    venue?:                  Venue;
    is_online_event?:        boolean;
    group:                   Group;
    link:                    string;
    description?:            string;
    visibility:              Visibility;
    pro_is_email_shared?:    boolean;
    member_pay_fee?:         boolean;
    how_to_find_us?:         string;
    rsvp_limit?:             number;
}
