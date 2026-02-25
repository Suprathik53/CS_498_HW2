const A = "http://34.56.88.16:8080";
const B = "http://34.53.148.76:8080";

async function LatencyTests() {
  console.log("Latency tests:");
  for(let x = 0; x < 2; x++) {

    let total = 0;
    for (let i = 0; i < 10; i++) {
      const username = `latency_test_${i}user`;

      const start = Date.now();
      if(x === 0) {
        await fetch(`${A}/register`,{
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({username}),
          }
        );
      } else {
        await fetch(`${B}/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username }),
        });
      }
      const end = Date.now();
      diff = end - start;
      total += diff;
    }
    if(x === 0) {
      console.log(`A /register avg: ${(total / 10)}`);
    }else{
      console.log(`B /register avg: ${(total / 10)}`);
    }
  }

  for(let x = 0; x < 2; x++) {
    total = 0;
    for (let i = 0; i < 10; i++) {
      const start = Date.now();
      if(x === 0) {
        await fetch(`${A}/list`);
      } else {
        await fetch(`${B}/list`);
      }
      const end = Date.now();

      diff = end-start
      total += diff;
    }

    if(x === 0) {
      console.log(`A /list avg: ${(total / 10)}`);
    } else {
      console.log(`B /list avg: ${(total / 10)}`);
    }
  }
  
  
}

async function ConsistencyTest() {
  console.log("\nEventual consistency test:");

  let missing = 0;
  for (let i = 0; i < 100; i++) {
    const username = `consistency_${i}user`;
    await fetch(`${A}/register`,{
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username }),
      }
    );

    const response = await fetch(`${B}/list`);
    const data = await response.json();
    const users = data.users || [];
    if (!users.includes(username)) {
      misses++;
    }
  }

  console.log(`Stale Reads: ${missing} / 100`);
}

(async () => {
  await fetch(`${A}/clear`, {method: "POST"});
  await LatencyTests();
  await fetch(`${A}/clear`, {method: "POST"});
  await ConsistencyTest();
})();
