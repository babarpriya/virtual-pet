const { getDB } = require("./db");
const { ObjectId } = require("mongodb");

function socketHandler(io) {
  io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);

    // Create pet
    socket.on("create_pet", async (data) => {
      const db = getDB();
      const pet = {
        userId: data.userId,
        name: data.name || "Diamond",
        type: data.type || "dog",
        hunger: 50,
        happiness: 80,
        energy: 70
      };

      const result = await db.collection("pets").insertOne(pet);
      pet._id = result.insertedId;

      socket.emit("pet_created", { message: "Pet created!", pet });
    });

    // Action on pet
    socket.on("action_pet", async (data) => {
      const db = getDB();
      try {
        const pet = await db.collection("pets").findOne({ _id: new ObjectId(data.petId) });

        if (!pet) {
          socket.emit("action_result", { message: "Pet not found!" });
          return;
        }

        // Update pet stats based on action
        switch (data.action) {
          case "feed":
            pet.hunger = Math.max(pet.hunger - 20, 0);
            pet.happiness = Math.min(pet.happiness + 5, 100);
            break;
          case "play":
            pet.happiness = Math.min(pet.happiness + 10, 100);
            pet.energy = Math.max(pet.energy - 10, 0);
            pet.hunger = Math.min(pet.hunger + 10, 100);
            break;
          case "rest":
            pet.energy = Math.min(pet.energy + 30, 100);
            break;
          case "water":
            pet.hunger = Math.max(pet.hunger - 10, 0);
            break;
          default:
            socket.emit("action_result", { message: "Unknown action!" });
            return;
        }

        await db.collection("pets").updateOne(
          { _id: new ObjectId(data.petId) },
          { $set: { hunger: pet.hunger, happiness: pet.happiness, energy: pet.energy } }
        );

        const needs = `Hunger: ${pet.hunger}%, Happiness: ${pet.happiness}%, Energy: ${pet.energy}%`;

        socket.emit("action_result", { message: `You ${data.action}ed ${pet.name}!`, pet, needs });
      } catch (error) {
        console.log("Error handling action:", error);
        socket.emit("action_result", { message: "Something went wrong." });
      }
    });

    // Get pet stats
    socket.on("get_pet", async (petId) => {
      const db = getDB();
      try {
        const pet = await db.collection("pets").findOne({ _id: new ObjectId(petId) });
        if (!pet) {
          socket.emit("action_result", { message: "Pet not found!" });
          return;
        }
        const needs = `Hunger: ${pet.hunger}%, Happiness: ${pet.happiness}%, Energy: ${pet.energy}%`;
        socket.emit("action_result", { message: `${pet.name} stats:`, pet, needs });
      } catch (error) {
        console.log("Error getting pet stats:", error);
        socket.emit("action_result", { message: "Something went wrong." });
      }
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });
}

module.exports = socketHandler;
