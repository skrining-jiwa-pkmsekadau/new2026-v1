const url = "https://cnernzpzhjcmmhfpamwo.supabase.co/rest/v1/";
const headers = {
  "apikey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNuZXJuenB6aGpjbW1oZnBhbXdvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE4MDc3NjMsImV4cCI6MjA4NzM4Mzc2M30.WGkJggavu929wAJbCu6QoVqtPDKqP7miO-4vLbDdOlA",
};
fetch(url, { headers })
  .then(r => r.json())
  .then(schema => {
    const props = schema.definitions.screenings.properties;
    console.log(JSON.stringify(Object.keys(props), null, 2));
  })
  .catch(e => console.error(e.message));
