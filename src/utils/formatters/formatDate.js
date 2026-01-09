const pad = (n) => String(n).padStart(2, "0");

export default function formatDate(input) {
  if (input === null || input === undefined) return "";

  if (typeof input === "string") {
    const isoDateOnly = /^\d{4}-\d{2}-\d{2}$/;
    if (isoDateOnly.test(input)) {
      const [y, m, d] = input.split("-");
      return `${d}/${m}/${y}`;
    }

    const dt = new Date(input);
    if (!isNaN(dt.getTime())) {
      return `${pad(dt.getDate())}/${pad(dt.getMonth() + 1)}/${dt.getFullYear()}`;
    }

    return input;
  }

  if (input instanceof Date && !isNaN(input.getTime())) {
    return `${pad(input.getDate())}/${pad(input.getMonth() + 1)}/${input.getFullYear()}`;
  }

  if (typeof input === "number") {
    const dt = new Date(input);
    if (!isNaN(dt.getTime())) {
      return `${pad(dt.getDate())}/${pad(dt.getMonth() + 1)}/${dt.getFullYear()}`;
    }
  }

  return String(input);
}
