import {
  Calendar,
  CalendarOptions,
  EventApi,
  EventDef,
} from "@fullcalendar/core";
import jaLocale from "@fullcalendar/core/locales/ja";
import dayGridPlugin from "@fullcalendar/daygrid";
import googleCalendarPlugin from "@fullcalendar/google-calendar";
import dayjs from "dayjs";
import "dayjs/locale/ja";
import { delegate, Props, Instance } from "tippy.js";
import getManupulatedDate, { Unit } from "./getManupulatedDate";
import { iframeSchema, argumentsSchema } from "./schema";
import logger from "./logger";
import "./polyfill";
import "tippy.js/dist/tippy.css";
import "./style/index.scss";

dayjs.locale("ja");

const main = (args: unknown) => {
  const requiredResult = argumentsSchema.required.safeParse(args);
  if (!requiredResult.success) {
    logger.error(requiredResult.error);
    return;
  }
  const { target, apiKey } = requiredResult.data;

  let option: argumentsSchema.Option = {};
  const optionalResult = argumentsSchema.optional.safeParse(args);
  if (!optionalResult.success) {
    logger.warn(optionalResult.error);
  } else {
    option = optionalResult.data;
  }
  const { color = {} } = option;

  const eventDataTransform: CalendarOptions["eventDataTransform"] = (event) => {
    let key = "";
    if (event.description === "祝日") {
      key = event.description;
    } else {
      key = event.title ?? "";
    }

    if (key in color) {
      event.color = color[key];
    }

    return event;
  };

  document.addEventListener("DOMContentLoaded", function () {
    const elements = document.querySelectorAll(target);

    for (const element of Array.from(elements)) {
      if (!(element instanceof HTMLIFrameElement)) {
        continue;
      }

      const result = iframeSchema.safeParse(element);
      if (!result.success) {
        logger.warn(result.error);
        continue;
      }
      const { calendars, firstDay, showDate, showNav } = result.data;

      const eventSources: Array<{ googleCalendarId: string }> = calendars.map(
        ({ id, ...rest }) => {
          return {
            ...rest,
            googleCalendarId: id,
          };
        }
      );

      const wrapperElement = document.createElement("div");
      wrapperElement.classList.add(...Array.from(element.classList), "gc");
      if (element.id) {
        wrapperElement.id = element.id;
      }

      let date = dayjs();
      const unitList: Unit[] = ["year", "month"];
      for (const name of unitList) {
        date = getManupulatedDate(date, name, element.dataset[name]);
        if (name in element.dataset) {
          wrapperElement.dataset[name] = element.dataset[name];
        }
      }
      date = date.set("date", 1);

      const calendarElement = document.createElement("div");
      wrapperElement.appendChild(calendarElement);
      element.replaceWith(wrapperElement);

      const headerToolbar: CalendarOptions["headerToolbar"] = {
        start: showDate ? "title" : "",
        center: "",
        end: showNav ? "today prev,next" : "",
      };

      const setPopup = (element: HTMLElement) => {
        delegate(element, {
          target: "a.fc-event",
          trigger: "click",
          allowHTML: true,
          onCreate: (instance) => {
            const event = (instance.reference as ExtendedReferenceElement)
              .$calendar_event;
            if (!event) {
              return;
            }
            let dateString: string = "";
            let dateFormat = "YYYY年M月D日（ddd）";
            if (event.allDay) {
              const startDate = dayjs(event.start);
              dateString = startDate.format(dateFormat);
              if (!startDate.add(1, "day").isSame(event.end)) {
                dateString += `〜${dayjs(event.end)
                  .add(-1, "day")
                  .format(dateFormat)}`;
              }
            } else {
              const timeFormat = "Ah:mm";
              dateString = `${dayjs(event.start).format(
                dateFormat + timeFormat
              )}〜${dayjs(event.end).format(timeFormat)}`;
            }
            instance.setContent(`${dateString}<br>${event.title}`);
          },
        });
      };

      const calendar = new Calendar(calendarElement, {
        plugins: [dayGridPlugin, googleCalendarPlugin],
        locale: jaLocale,
        height: "auto",
        showNonCurrentDates: false,
        fixedWeekCount: false,
        displayEventTime: false,
        headerToolbar,
        eventDataTransform,
        eventOrder: (a, b) => {
          const [aInt, bInt] = ([a, b] as EventDef[]).map((event) => {
            return event.extendedProps.description === "祝日"
              ? 0
              : parseInt(event.sourceId);
          });
          return aInt - bInt;
        },
        initialDate: date.toDate(),
        googleCalendarApiKey: apiKey,
        firstDay,
        eventSources,
        eventClick: function (info) {
          info.jsEvent.preventDefault();
        },
        eventDidMount: (e) => {
          e.el.$calendar_event = e.event;
        },
        viewDidMount: (view) => {
          setPopup(view.el);
        },
      });

      calendar.render();
    }
  });
};

interface ExtendedReferenceElement<TProps = Props> extends HTMLElement {
  _tippy?: Instance<TProps>;
}

declare global {
  interface Window {
    GoogleCalendar: typeof main;
  }

  interface HTMLElement {
    $calendar_event?: EventApi;
  }
}

window.GoogleCalendar = main;
