# 🐾 Tamagotchi Game

A retro-inspired Tamagotchi-style web game where you can adopt and take care of virtual pets. The project was built as part of a frontend development assignment focused on **object-oriented programming (OOP)**, API integration, asynchronous JavaScript, and DOM manipulation.

🎮 **[Play the Game](https://bassamr14.github.io/JS2-FinalProject/)** · 

## 🎮 About the Project

The goal of the project was to create an interactive pet game where users can create pets, take care of them through different activities, and keep track of everything that happens during the game.

Each pet has its own:

* Name
* Animal type
* Energy
* Fullness
* Happiness

The pets start with a value of **50** for energy, fullness, and happiness, with all values being kept between **0–100**.

Users can create up to **four pets** and interact with them through different activities.

## ✨ Features

### 🐶 Create a Pet

Users can create their own pet by choosing:

* A custom name
* One of four available animal types

Pet images are automatically selected based on the chosen animal type.

Users can also generate a random name using the **Random User API**.

### 🎲 Random Names

The project integrates with:

**Random User API**
https://randomuser.me/api

The API is accessed using `fetch`, `async/await`, with error handling in case the API request fails.

### ❤️ Pet Activities

Each pet can perform three different activities:

| Activity | Energy | Fullness | Happiness |
| -------- | ------ | -------- | --------- |
| 😴 Nap   | +40    | -10      | -10       |
| 🎾 Play  | -10    | -10      | +30       |
| 🍖 Eat   | -15    | +30      | +5        |

After each activity, a message is displayed describing what happened, for example:

> "You played with Maya!"

All activities are also added to a **history log**, allowing the user to see everything that has happened during the game.

## ⏱️ Pet Needs & Timers

Every pet starts its own timer when it is created.

Every **10 seconds**, the pet's:

* Energy decreases by 10
* Fullness decreases by 10
* Happiness decreases by 10

If any of these values reaches **0**, the pet runs away due to neglect and is removed from the DOM.

This creates a continuously changing game state where the player needs to take care of their pets over time.

## 🧑‍💻 Object-Oriented Programming

The project was built using **object-oriented programming principles**.

Classes, constructors, properties, and methods are used to structure the pet logic and keep the application's behavior organized.

This helped separate the pet's state and behavior from the rest of the application and made it possible to manage multiple pets independently.

## 🎨 Design

Instead of creating a standard modern game interface, I decided to give the application a **retro CRT-inspired visual style**.

The design takes inspiration from old computer screens and classic games, using elements such as:

* CRT screen aesthetics
* Retro typography
* Pixel-inspired visuals
* Screen effects
* Nostalgic game-like UI

The styling was an opportunity to go beyond the functional requirements and create a more distinctive visual identity for the project.

## 🛠️ Technologies

* HTML
* CSS
* JavaScript
* Object-Oriented Programming (OOP)
* Fetch API
* Async/Await
* DOM manipulation
* Random User API

## 📚 What I Practiced

Through this project I worked with:

* Creating and using JavaScript classes
* Constructors and methods
* Managing object state
* Working with multiple instances of the same class
* DOM manipulation
* Event handling
* Timers with `setInterval`
* API requests with `fetch`
* Asynchronous JavaScript with `async/await`
* Error handling
* Dynamic UI updates
* Managing application state
* Creating a custom visual design from scratch

## 🚀 Future Improvements

Some ideas I could explore in the future:

* Add sound effects and background music
* Add more animal types
* Save pets using `localStorage`
* Add more activities
* Add animations for different pet states
* Add different stages of the pet's life
* Introduce a more complex mood/status system

---

**A small virtual pet game with a retro twist. 🐾📺**
