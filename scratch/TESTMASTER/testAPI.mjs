fetch(`http://localhost:3000/api/debug`)
  .then(r => r.json())
  .then(data => {
     console.log("Status:", data);
  });
