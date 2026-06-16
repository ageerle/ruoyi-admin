import dayjs from 'dayjs';

type DateInput = Date | number | string;

function normalizeDateInput(time: DateInput) {
  if (typeof time === 'string') {
    const trimmedTime = time.trim();

    if (/^\d{10}$/.test(trimmedTime)) {
      return Number(trimmedTime) * 1000;
    }

    if (/^\d{13}$/.test(trimmedTime)) {
      return Number(trimmedTime);
    }
  }

  if (typeof time !== 'number') {
    return time;
  }

  return time > 0 && time < 10_000_000_000 ? time * 1000 : time;
}

export function formatDate(
  time: DateInput | null | undefined,
  format = 'YYYY-MM-DD',
): number | string {
  if (time === null || time === undefined || time === '') {
    return '-';
  }

  if (typeof time === 'string' && /^\d{1,2}:\d{2}(:\d{2})?$/.test(time)) {
    return time;
  }

  const date = dayjs(normalizeDateInput(time));
  if (date.isValid()) {
    return date.format(format);
  }

  return typeof time === 'number' ? time : String(time);
}

export function formatDateTime(
  time: DateInput | null | undefined,
): number | string {
  return formatDate(time, 'YYYY-MM-DD HH:mm:ss');
}

export function isDate(value: any): value is Date {
  return value instanceof Date;
}

export function isDayjsObject(value: any): value is dayjs.Dayjs {
  return dayjs.isDayjs(value);
}
