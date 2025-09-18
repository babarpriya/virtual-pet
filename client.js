const io = require("socket.io-client");
const readline = require("readline");

// Connect to server
const socket = io("http://localhost:3000");

// Store pet ID after creation
let myPetId = null;

// Setup terminal input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Listen to server events
socket.on("connect", () => {
  console.log("Connected to server. Type 'create' to make a pet or 'action' to interact.");
  promptUser();
});

// Store pet ID after creation
socket.on("pet_created", (data) => {
  console.log(data.message);
  myPetId = data.pet._id; // Store the pet's ObjectId
  promptUser();
});

// Receive action results
socket.on("action_result", (data) => {
  console.log(data.message);
  if (data.pet && data.needs) {
    console.log("Pet status:", data.pet);
    console.log(data.needs);
  }
  promptUser();
});

// Function to prompt user for commands
function promptUser() {
  rl.question("> ", (input) => {
    const args = input.split(" ");
    const command = args[0].toLowerCase();

    if (command === "exit") {
      console.log("Exiting...");
      rl.close();
      socket.disconnect();
      return;
    }

    if (command === "create") {
      const name = args[1] || "Diamond";      // Default name
      const type = args[2] || "dog";          // Default type
      socket.emit("create_pet", { userId: "priya", name, type });
    } else if (command === "action") {
      if (!myPetId) {
        console.log("Create a pet first!");
        promptUser();
      } else {
        const action = args[1] ? args[1].toLowerCase() : null;
        if (!action) {
          console.log("Specify an action: feed, play, rest, water");
          promptUser();
        } else {
          socket.emit("action_pet", { petId: myPetId, action });
        }
      }
    } else if (command === "stats") {
      if (!myPetId) {
        console.log("Create a pet first!");
        promptUser();
      } else {
        socket.emit("get_pet", myPetId);
      }
    } else {
      console.log("Unknown command. Use: create, action, stats, exit");
      promptUser();
    }
  });
}
