const http = require('http');

const options = {
  hostname: 'localhost',
  port: 4000,
  path: '/api/dashboard/maintenance',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  }
};

const req1 = http.request(options, (res) => {
  res.on('data', console.log);
});
req1.write(JSON.stringify({
  title: "First Dummy Ticket",
  description: "Test 1",
  urgency: "routine",
  ownerId: "dummy-owner"
}));
req1.end();

const req2 = http.request(options, (res) => {
  res.on('data', console.log);
});
req2.write(JSON.stringify({
  title: "Second Dummy Ticket",
  description: "Test 2",
  urgency: "routine",
  ownerId: "dummy-owner"
}));
req2.end();
