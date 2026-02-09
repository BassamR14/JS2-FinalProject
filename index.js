class Tamagotchi {
  constructor(name, animalType, energy, fullness, happiness) {
    this.name = name;
    this.animalType = animalType;
    this.energy = energy;
    this.fullness = fullness;
    this.happiness = happiness;
    this.timer = null;
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

  //decay all stats by 10
  decay() {
    this.energy = Math.max(0, this.energy - 10);
    this.fullness = Math.max(0, this.fullness - 10);
    this.happiness = Math.max(0, this.happiness - 10);

    //Check if any value reaches 0 due to decay
    const leavingTamas = Game.checkTamagotchis();

    if (leavingTamas.length > 0) {
      Game.handleLeavingTamas(leavingTamas);
    }

    Game.render();
  }

  //Since every tamagotchi has a timer, it belongs to the tamagochi class/instance
  startTimer() {
    let sec = 10;

    const tick = () => {
      this.timerDisplay.innerText = sec < 10 ? `00:0${sec}s` : `00:${sec}s`;

      // decay & reset + stop the function
      if (sec === 0) {
        this.decay();
        sec = 10;
        return;
      }

      sec--;
    };

    //run the function then after one second, run again
    tick();
    this.timer = setInterval(tick, 1000);

    //bind(this) is needed since setInterval doesn't know what this is, it becomes undefined.
    // this.timer = setInterval(this.decay.bind(this), 10000);
  }
}

class Game {
  static tamagotchis = [];

  static async generateTamagotchi() {
    try {
      //Max 4 tamagotchis
      if (Game.tamagotchis.length > 3) {
        alert("Can only have 4 Tamagotchis");
        return;
      }

      let response = await fetch("https://randomuser.me/api");
      let data = await response.json();

      //To get a random animal
      const animals = ["Tiger", "Wolf", "Dragon", "Phoenix"];
      const animalIndex = Math.floor(Math.random() * animals.length);

      const name = `${data.results[0].name.first} ${data.results[0].name.last}`;
      const animalType = animals[animalIndex];
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
      Game.render();
      newTama.startTimer();
    } catch (err) {
      console.log(err);
      alert("Something went wrong. Try again!");
    }
  }

  static checkTamagotchis() {
    //Separate tamagotchis with any value/s of 0 and all values above 0
    let leavingTamas = Game.tamagotchis.filter(
      (t) => t.energy === 0 || t.fullness === 0 || t.happiness === 0,
    );

    Game.tamagotchis = Game.tamagotchis.filter(
      (t) => t.energy > 0 && t.fullness > 0 && t.happiness > 0,
    );

    return leavingTamas;
  }

  //this code is used multiple time for the buttons, if there are any tamagotchies with any value of 0, add activity message
  static handleLeavingTamas(leavingTamas) {
    const activities = document.querySelector(".activities");
    const activityContainer = document.querySelector(".activity-container");
    activityContainer.style.display = "block";

    leavingTamas.forEach((tama) => {
      //stop the instance's timer
      clearInterval(tama.timer);

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

  static render() {
    const container = document.querySelector(".container");
    const activities = document.querySelector(".activities");
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

      //choose the image based on animal type
      const animalImages = {
        Tiger: "tiger.jpg",
        Wolf: "wolf.jpg",
        Dragon: "dragon.jpg",
        Phoenix: "phoenix.jpg",
      };

      animalImage.src = animalImages[tamagotchi.animalType];

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

      let message = document.createElement("p");

      napBtn.addEventListener("click", () => {
        tamagotchi.nap();
        const leavingTamas = Game.checkTamagotchis();
        Game.render();

        message.innerText = `${tamagotchi.name} took a nap!`;
        activities.prepend(message);

        Game.handleLeavingTamas(leavingTamas);
      });

      playBtn.addEventListener("click", () => {
        tamagotchi.play();
        const leavingTamas = Game.checkTamagotchis();
        Game.render();

        message.innerText = `You played with ${tamagotchi.name}!`;
        activities.prepend(message);

        Game.handleLeavingTamas(leavingTamas);
      });

      eatBtn.addEventListener("click", () => {
        tamagotchi.eat();
        const leavingTamas = Game.checkTamagotchis();
        Game.render();

        message.innerText = `You fed ${tamagotchi.name}!`;
        activities.prepend(message);

        Game.handleLeavingTamas(leavingTamas);
      });

      //If a tamagotchi doesn't have a timer, create DOM element, if it does, reuse it.
      let timerDisplay;
      if (!tamagotchi.timerDisplay) {
        timerDisplay = document.createElement("p");
        timerDisplay.innerText = "10s";
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

  static async runGame() {
    try {
      await Game.generateTamagotchi();
      console.log(Game.tamagotchis);
    } catch (err) {
      console.log(err);
      alert("Something went wrong. Try again!");
    }
  }
}

const addTamaBtn = document.querySelector("#tamagotchi-add");
addTamaBtn.addEventListener("click", () => {
  Game.runGame();
});
