fetch('http://localhost:3000/api/energy/total_power?country=de')
  .then(res => res.json())
  .then(data => console.log('Power:', Object.keys(data)))
  .catch(err => console.error(err));
fetch('http://localhost:3000/api/energy/price?country=de')
  .then(res => res.json())
  .then(data => console.log('Price:', Object.keys(data)))
  .catch(err => console.error(err));
fetch('http://localhost:3000/api/weather')
  .then(res => res.json())
  .then(data => console.log('Weather:', Object.keys(data)))
  .catch(err => console.error(err));
