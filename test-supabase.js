const url = "https://cnernzpzhjcmmhfpamwo.supabase.co/rest/v1/screenings?select=*&limit=1";
const headers = {
  "apikey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNuZXJuenB6aGpjbW1oZnBhbXdvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE4MDc3NjMsImV4cCI6MjA4NzM4Mzc2M30.WGkJggavu929wAJbCu6QoVqtPDKqP7miO-4vLbDdOlA",
  "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNuZXJuenB6aGpjbW1oZnBhbXdvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE4MDc3NjMsImV4cCI6MjA4NzM4Mzc2M30.WGkJggavu929wAJbCu6QoVqtPDKqP7miO-4vLbDdOlA"
};

async function test() {
  try {
    const res = await fetch(url, { headers });
    const data = await res.json();
    if (data.length > 0) {
      console.log(Object.keys(data[0]));
    } else {
      console.log("No data returned. Checking OpenAPI schema...");
      const schemaRes = await fetch("https://cnernzpzhjcmmhfpamwo.supabase.co/rest/v1/", { headers });
      const schema = await schemaRes.json();
      const props = schema.definitions.screenings.properties;
      console.log("Columns:", Object.keys(props));
    }
  } catch (e) {
    console.error(e);
  }
}
test();
