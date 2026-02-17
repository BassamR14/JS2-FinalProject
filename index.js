class Tamagotchi {
  constructor(name, animalType, energy, fullness, happiness) {
    this.name = name;
    this.animalType = animalType;
    this.energy = energy;
    this.fullness = fullness;
    this.happiness = happiness;
    this.timer = null;
    this.timerDisplay = null;

    //To update UI - DOM references
    this.energyBar = null;
    this.energyText = null;
    this.fullnessBar = null;
    this.fullnessText = null;
    this.happinessBar = null;
    this.happinessText = null;
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

  //Name logic + backup API + fallback
  static async fetchName() {
    let name;
    try {
      let response = await fetch("https://randomuser.me/api");

      if (!response.ok) {
        throw new Error("Primary API failed");
      }

      let data = await response.json();
      name = `${data.results[0].name.first} ${data.results[0].name.last}`;
    } catch (err) {
      console.warn(
        "There is a problem with the connection to the API. An older version of the API will be used.",
        err,
      );

      try {
        let backupResponse = await fetch("https://randomuser.me/api/0.8");

        if (!backupResponse.ok) {
          throw new Error("Secondary API failed");
        }

        let backupData = await backupResponse.json();
        name = `${backupData.results[0].user.name.first} ${backupData.results[0].user.name.last}`;
      } catch (err) {
        alert(
          "There is a problem with the connection to the backup API. Name will be Random.",
        );
        name = "Random";
      }
    }

    return name;
  }

  static async generateTamagotchi() {
    //Max 4 tamagotchis
    if (Game.tamagotchis.length >= 4) {
      alert("Can only have 4 Tamagotchis");
      return;
    }

    const name = await Game.fetchName();

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
        GameUI.render();
      }
      GameUI.updateUI();
    });
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
    GameUI.clearUI();

    GameUI.startBootSequence();
  }

  static async runGame() {
    await Game.generateTamagotchi();
    console.log(Game.tamagotchis);
  }
}

class GameUI {
  //If there are any tamagotchies with any value of 0, add activity message + stop its timer
  static handleLeavingTamas(leavingTamas) {
    const activities = document.querySelector(".activities");

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

    Game.removeLeavingTamas();

    const activities = document.querySelector(".activities");
    let message = document.createElement("p");
    message.innerText = activityMsg;

    activities.prepend(message);

    if (leavingTamas.length > 0) {
      GameUI.handleLeavingTamas(leavingTamas);
      GameUI.render();
    }

    GameUI.updateUI();
  }

  static clearUI() {
    const container = document.querySelector(".container");
    container.innerHTML = "";
    const activities = document.querySelector(".activities");
    activities.innerHTML = "";
  }

  //choose the image based on animal type, make it static and outside of render so it isn't created everytime render runs.
  static animalImages = {
    Tiger: "tiger.jpg",
    Wolf: "wolf.jpg",
    Dragon: "dragon.jpg",
    Phoenix: "phoenix.jpg",
  };

  //Functions for DOM creation
  static createPara(paraText) {
    const paraName = document.createElement("p");
    paraName.innerText = paraText;

    return paraName;
  }

  static createImg(imageSrc) {
    const image = document.createElement("img");
    image.src = imageSrc;
    return image;
  }

  static createProgress(progressValue, progressMax, paraText) {
    const progressName = document.createElement("progress");
    progressName.value = progressValue;
    progressName.max = progressMax;
    const paraName = document.createElement("p");
    paraName.innerText = paraText;

    return {
      progress: progressName,
      label: paraName,
    };
  }

  static createActivityBtn(buttonText) {
    const buttonName = document.createElement("button");
    buttonName.innerText = buttonText;
    buttonName.classList.add("activity-btn");

    return buttonName;
  }

  static render() {
    const container = document.querySelector(".container");
    container.innerHTML = "";

    Game.tamagotchis.forEach((tamagotchi) => {
      //Create DOM elements for name,animal,image,energy,fullness,happiness
      const tamaDiv = document.createElement("div");
      tamaDiv.classList.add("tama-div");

      const name = GameUI.createPara(`Name: ${tamagotchi.name}`);
      const animalType = GameUI.createPara(`Species: ${tamagotchi.animalType}`);

      const animalImage = GameUI.createImg(
        GameUI.animalImages[tamagotchi.animalType],
      );

      const { progress: energyBar, label: energy } = GameUI.createProgress(
        tamagotchi.energy,
        100,
        `Energy: ${tamagotchi.energy}/100`,
      );
      const { progress: fullnessBar, label: fullness } = GameUI.createProgress(
        tamagotchi.fullness,
        100,
        `Fullness: ${tamagotchi.fullness}/100`,
      );
      const { progress: happinessBar, label: happiness } =
        GameUI.createProgress(
          tamagotchi.happiness,
          100,
          `Happiness: ${tamagotchi.happiness}/100`,
        );

      //Save references
      tamagotchi.energyBar = energyBar;
      tamagotchi.energyText = energy;
      tamagotchi.fullnessBar = fullnessBar;
      tamagotchi.fullnessText = fullness;
      tamagotchi.happinessBar = happinessBar;
      tamagotchi.happinessText = happiness;

      //Create buttons + add message of activity + check if any value reaches 0 after button press
      const btnDiv = document.createElement("div");
      const napBtn = GameUI.createActivityBtn("Nap");
      const playBtn = GameUI.createActivityBtn("Play");
      const eatBtn = GameUI.createActivityBtn("Eat");

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

  static updateUI() {
    Game.tamagotchis.forEach((tama) => {
      tama.energyBar.value = tama.energy;
      tama.energyText.innerText = `Energy: ${tama.energy}/100`;

      tama.fullnessBar.value = tama.fullness;
      tama.fullnessText.innerText = `Fullness: ${tama.fullness}/100`;

      tama.happinessBar.value = tama.happiness;
      tama.happinessText.innerText = `Happiness: ${tama.happiness}/100`;
    });
  }

  //Bootup-Screen
  static startBootSequence() {
    const bootScreen = document.getElementById("boot-screen");
    const bootText = document.querySelector(".boot-text");
    const app = document.getElementById("app");

    const lines = [
      "TAMAGOTCHI OS v1.0",
      "Initializing system...",
      "Loading...",
      "System ready.",
    ];

    //For restart game function:
    //Reset visual state
    bootText.textContent = "";
    app.classList.add("hidden");
    bootScreen.style.display = "flex";

    //Reset animation so it can replay
    // force reflow (forced layout recalculation)
    //  Browsers optimize performance by batching DOM reads and writes. If you remove a class and immediately re-add it,the browser may treat both operations as part of the same layout update.
    //  Void - simply evaluates the expression and discards the result. bootScreen.offsetWidth is a layout property. Reading it forces the browser to recalculate layout.
    bootScreen.classList.remove("power-on");
    void bootScreen.offsetWidth;
    bootScreen.classList.add("power-on");

    //Track where we are in the typing process
    //Which line we are typing
    let lineIndex = 0;
    //Which characters inside that line
    let charIndex = 0;

    function typeLine() {
      if (lineIndex < lines.length) {
        if (charIndex < lines[lineIndex].length) {
          //Type each character for the line we are on
          bootText.textContent += lines[lineIndex][charIndex];
          charIndex++;
          setTimeout(typeLine, 40);
        } else {
          //go to next line and reset character index
          bootText.textContent += "\n";
          lineIndex++;
          charIndex = 0;
          setTimeout(typeLine, 400);
        }
      } else {
        //After going through all the lines
        setTimeout(() => {
          bootScreen.style.display = "none";
          app.classList.remove("hidden");
        }, 800);
      }
    }

    bootScreen.classList.add("power-on");
    setTimeout(typeLine, 500);
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

//DOMcontentLoaded : Wait for the page to fully load
document.addEventListener("DOMContentLoaded", GameUI.startBootSequence);
