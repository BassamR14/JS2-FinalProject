class Tamagotchi {
  constructor(name, animalType, energy, fullness, happiness) {
    this.name = name;
    this.animalType = animalType;
    this.energy = energy;
    this.fullness = fullness;
    this.happiness = happiness;
    this.timer = null;
    this.timerDisplay = null;
  }

  //To ensure that values remain between 0-100
  nap() {
    this.energy = Math.min(100, this.energy + 40);
    this.fullness = Math.max(0, this.fullness - 10);
    this.happiness = Math.max(0, this.happiness - 10);
  }

  play() {
    this.energy = Math.max(0, this.energy - 10);
    this.fullness = Math.max(0, this.fullness - 10);
    this.happiness = Math.min(100, this.happiness + 30);
  }

  eat() {
    this.energy = Math.max(0, this.energy - 15);
    this.fullness = Math.min(100, this.fullness + 30);
    this.happiness = Math.min(100, this.happiness + 5);
  }

  //decay all stats by 10, used in timer
  decay() {
    this.energy = Math.max(0, this.energy - 10);
    this.fullness = Math.max(0, this.fullness - 10);
    this.happiness = Math.max(0, this.happiness - 10);
  }

  //Since every tamagotchi has a timer, it belongs to the tamagochi class/instance + pass in a callback from the controller which is the Game class
  startTimer(decayCallback) {
    let sec = 10;
    const tick = () => {
      this.timerDisplay.innerText = sec < 10 ? `00:0${sec}s` : `00:${sec}s`;

      if (sec === 0) {
        // only update internal state
        this.decay();

        //if callback exists, run function for this instance
        if (decayCallback) {
          decayCallback(this);
        }
        sec = 10;
      } else {
        sec--;
      }
    };

    tick();
    this.timer = setInterval(tick, 1000);
  }
}

class Game {
  static tamagotchis = [];

  static async generateTamagotchi() {
    try {
      //Max 4 tamagotchis
      if (Game.tamagotchis.length >= 4) {
        alert("Can only have 4 Tamagotchis");
        return;
      }

      //Name logic + fallback
      let name;

      try {
        let response = await fetch("https://randomuser.me/api");
        let data = await response.json();
        name = `${data.results[0].name.first} ${data.results[0].name.last}`;
      } catch {
        alert("API is down. Name will be Random.");
        name = "Random";
      }

      //To get a random animal
      const animals = ["Tiger", "Wolf", "Dragon", "Phoenix"];
      const animalIndex = Math.floor(Math.random() * animals.length);
      const animalType = animals[animalIndex];

      //default values
      const energy = 50;
      const fullness = 50;
      const happiness = 50;

      //Create a new tamagotchi and push into array
      const newTama = new Tamagotchi(
        name,
        animalType,
        energy,
        fullness,
        happiness,
      );
      Game.tamagotchis.push(newTama);

      //Render & start timer for tamagotchi
      GameUI.render();

      // Pass a callback that handles decay render + if decay leads to leaving tamagotchis
      newTama.startTimer(() => {
        const leavingTamas = Game.getLeavingTamas();
        Game.removeLeavingTamas();
        if (leavingTamas.length > 0) {
          GameUI.handleLeavingTamas(leavingTamas);
        }
        GameUI.render();
      });
    } catch (err) {
      console.log(err);
      alert("Something went wrong while generating Tamagotchi. Try again!");
    }
  }

  //Separate tamagotchis with any value/s of 0 and all values above 0
  //This function does 2 different things, filters + mutates the array, better to seperate into 2 different functions.
  // static checkTamagotchis() {
  //   let leavingTamas = Game.tamagotchis.filter(
  //     (t) => t.energy === 0 || t.fullness === 0 || t.happiness === 0,
  //   );

  //   Game.tamagotchis = Game.tamagotchis.filter(
  //     (t) => t.energy > 0 && t.fullness > 0 && t.happiness > 0,
  //   );

  //   return leavingTamas;
  // }

  static getLeavingTamas() {
    return Game.tamagotchis.filter(
      (t) => t.energy === 0 || t.fullness === 0 || t.happiness === 0,
    );
  }

  static removeLeavingTamas() {
    Game.tamagotchis = Game.tamagotchis.filter(
      (t) => t.energy > 0 && t.fullness > 0 && t.happiness > 0,
    );
  }

  static restartGame() {
    // Stop all running timers
    Game.tamagotchis.forEach((tama) => {
      if (tama.timer) {
        clearInterval(tama.timer);
        tama.timer = null;
      }
    });

    //Clear game state
    Game.tamagotchis = [];

    //Clear UI
    const container = document.querySelector(".container");
    container.innerHTML = "";
    const activities = document.querySelector(".activities");
    activities.innerHTML = "";
  }

  static async runGame() {
    try {
      await Game.generateTamagotchi();
      console.log(Game.tamagotchis);
    } catch (err) {
      console.log(err);
      alert("Something went wrong while running the game. Try again!");
    }
  }
}

class GameUI {
  //If there are any tamagotchies with any value of 0, add activity message + stop its timer
  static handleLeavingTamas(leavingTamas) {
    const activities = document.querySelector(".activities");
    const activityContainer = document.querySelector(".activity-container");
    activityContainer.style.display = "block";

    leavingTamas.forEach((tama) => {
      //stop the instance's timer
      clearInterval(tama.timer);
      //So that the timer property doesn't hold the old value
      tama.timer = null;

      let reasons = [];
      if (tama.energy === 0) {
        reasons.push("energy");
      }
      if (tama.fullness === 0) {
        reasons.push("fullness");
      }
      if (tama.happiness === 0) {
        reasons.push("happiness");
      }

      let leavingMsg = document.createElement("p");
      leavingMsg.classList.add("leaving-msg");
      leavingMsg.innerText = `${tama.name} has left because their ${reasons.join(" & ")} reached 0`;
      activities.prepend(leavingMsg);
    });
  }

  //Code for activity button functions
  static btnHelperFunction(tama, activity, activityMsg) {
    //.call: invokes function with a specific "this" context, which here would be the tamagotchi instance
    activity.call(tama);
    const leavingTamas = Game.getLeavingTamas();

    if (leavingTamas.length > 0) {
      GameUI.handleLeavingTamas(leavingTamas);
    }

    Game.removeLeavingTamas();

    const activities = document.querySelector(".activities");
    const activityContainer = document.querySelector(".activity-container");
    let message = document.createElement("p");

    activityContainer.style.display = "block";
    message.innerText = activityMsg;

    activities.prepend(message);

    GameUI.render();
  }

  //choose the image based on animal type, make it static and outside of render so it isn't created everytime render runs.
  static animalImages = {
    Tiger: "tiger.jpg",
    Wolf: "wolf.jpg",
    Dragon: "dragon.jpg",
    Phoenix: "phoenix.jpg",
  };

  static render() {
    const container = document.querySelector(".container");
    container.innerHTML = "";

    Game.tamagotchis.forEach((tamagotchi) => {
      //Create DOM elements for name,animal,image,energy,fullness,happiness
      const tamaDiv = document.createElement("div");
      tamaDiv.classList.add("tama-div");
      const name = document.createElement("p");
      const animalType = document.createElement("p");
      const animalImage = document.createElement("img");
      const energyBar = document.createElement("progress");
      const energy = document.createElement("p");
      const fullnessBar = document.createElement("progress");
      const fullness = document.createElement("p");
      const happinessBar = document.createElement("progress");
      const happiness = document.createElement("p");

      name.innerText = `Name: ${tamagotchi.name}`;
      animalType.innerText = `Species: ${tamagotchi.animalType}`;
      energyBar.value = tamagotchi.energy;
      energyBar.max = "100";
      energy.innerText = `Energy: ${tamagotchi.energy}/100`;
      fullnessBar.value = tamagotchi.fullness;
      fullnessBar.max = "100";
      fullness.innerText = `Fullness: ${tamagotchi.fullness}/100`;
      happinessBar.value = tamagotchi.happiness;
      happinessBar.max = "100";
      happiness.innerText = `Happiness: ${tamagotchi.happiness}/100`;

      animalImage.src = GameUI.animalImages[tamagotchi.animalType];

      //Create buttons + add message of activity + check if any value reaches 0 after button press
      const btnDiv = document.createElement("div");
      const napBtn = document.createElement("button");
      napBtn.classList.add("activity-btn");
      const playBtn = document.createElement("button");
      playBtn.classList.add("activity-btn");
      const eatBtn = document.createElement("button");
      eatBtn.classList.add("activity-btn");

      napBtn.innerText = "Nap";
      playBtn.innerText = "Play";
      eatBtn.innerText = "Eat";

      napBtn.addEventListener("click", () => {
        GameUI.btnHelperFunction(
          tamagotchi,
          tamagotchi.nap,
          `${tamagotchi.name} took a nap!`,
        );
      });

      playBtn.addEventListener("click", () => {
        GameUI.btnHelperFunction(
          tamagotchi,
          tamagotchi.play,
          `You played with ${tamagotchi.name}!`,
        );
      });

      eatBtn.addEventListener("click", () => {
        GameUI.btnHelperFunction(
          tamagotchi,
          tamagotchi.eat,
          `You fed ${tamagotchi.name}!`,
        );
      });

      //If a tamagotchi doesn't have a timer DOM element, create one, if it does, reuse it.
      let timerDisplay;
      if (!tamagotchi.timerDisplay) {
        timerDisplay = document.createElement("p");
        tamagotchi.timerDisplay = timerDisplay;
      } else {
        timerDisplay = tamagotchi.timerDisplay;
      }

      //Append everything
      btnDiv.append(napBtn, playBtn, eatBtn);
      tamaDiv.append(
        timerDisplay,
        name,
        animalType,
        animalImage,
        energyBar,
        energy,
        fullnessBar,
        fullness,
        happinessBar,
        happiness,
        btnDiv,
      );
      container.append(tamaDiv);
    });
  }
}

const addTamaBtn = document.querySelector("#tamagotchi-add");
addTamaBtn.addEventListener("click", async () => {
  //to prevent fast button presses
  addTamaBtn.disabled = true;
  await Game.runGame();
  addTamaBtn.disabled = false;
});

const restartGameBtn = document.querySelector("#restart-game");
restartGameBtn.addEventListener("click", Game.restartGame);
