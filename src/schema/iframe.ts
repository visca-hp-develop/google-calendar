import queryString from "query-string";
import { z } from "zod";

type Calendar = {
  id: string;
  color?: string;
};

export const iframeSchema = z
  .instanceof(HTMLIFrameElement)
  .transform((iframe) => iframe.getAttribute("src"))
  .pipe(z.string().url("iframeにsrc属性がありません"))
  .transform((url) => {
    const query = queryString.parseUrl(url, { parseNumbers: true }).query;
    return query;
  })
  .pipe(
    z.object({
      color: z.array(z.string()),
      src: z.array(
        z.string().transform((encodedString) => atob(encodedString))
      ),
      wkst: z.number(),
      showDate: z.number().optional(),
      showNav: z.number().optional(),
    })
  )
  .transform((query) => {
    const calendars = query.src.reduce<Calendar[]>((prev, current, i) => {
      return [
        ...prev,
        {
          id: current,
          color: query.color[i],
        },
      ];
    }, []);

    const firstDay = query.wkst - 1;

    return {
      calendars,
      firstDay,
      showDate: !!query.showDate,
      showNav: !!query.showNav,
    };
  });
