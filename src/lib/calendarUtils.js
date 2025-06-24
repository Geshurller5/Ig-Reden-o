import { parse } from 'date-fns';
import { format } from 'date-fns-tz';

export const generateGoogleCalendarLink = (event) => {
  if (!event || !event.details) return '';

  const { title, description, date, time } = event.details;
  
  const eventDate = parse(`${date} ${time}`, 'yyyy-MM-dd HH:mm', new Date());
  
  if (isNaN(eventDate)) {
    return '';
  }

  const startTime = format(eventDate, "yyyyMMdd'T'HHmmss");
  
  const endTimeDate = new Date(eventDate.getTime() + 60 * 60 * 1000);
  const endTime = format(endTimeDate, "yyyyMMdd'T'HHmmss");

  const url = new URL('https://www.google.com/calendar/render');
  url.searchParams.append('action', 'TEMPLATE');
  url.searchParams.append('text', encodeURIComponent(title));
  url.searchParams.append('dates', `${startTime}/${endTime}`);
  url.searchParams.append('details', encodeURIComponent(description));
  url.searchParams.append('ctz', 'America/Sao_Paulo');
  
  return url.toString();
};