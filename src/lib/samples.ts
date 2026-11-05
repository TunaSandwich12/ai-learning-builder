import type { Activity, ActivityType } from "./schemas";

// One realistic sample per activity type, returned by /api/generate when FAKE_MODE=true.
// All share one topic (Grade 5 science: the water cycle) so the UI looks consistent.

type SampleMap = { [K in ActivityType]: Extract<Activity, { type: K }> };

export const samples = {
  multiple_choice: {
    type: "multiple_choice",
    title: "The Water Cycle Quiz",
    instructions: "Read each question and choose the best answer.",
    questions: [
      {
        question: "What process turns liquid water into water vapor?",
        options: [
          { text: "Evaporation", isCorrect: true },
          { text: "Condensation", isCorrect: false },
          { text: "Precipitation", isCorrect: false },
          { text: "Collection", isCorrect: false },
        ],
        explanation:
          "Evaporation happens when the sun heats liquid water and it changes into an invisible gas called water vapor.",
      },
      {
        question: "What forms when water vapor cools high in the sky?",
        options: [
          { text: "Rivers", isCorrect: false },
          { text: "Clouds", isCorrect: true },
          { text: "Groundwater", isCorrect: false },
          { text: "Puddles", isCorrect: false },
        ],
        explanation:
          "As water vapor rises it cools and condenses into tiny droplets that group together to form clouds.",
      },
      {
        question: "Which of these is a form of precipitation?",
        options: [
          { text: "Fog", isCorrect: false },
          { text: "Dew", isCorrect: false },
          { text: "Steam", isCorrect: false },
          { text: "Snow", isCorrect: true },
        ],
        explanation:
          "Precipitation is water falling from clouds to the ground, such as rain, snow, sleet or hail.",
      },
      {
        question: "What gives the water cycle the energy it needs to keep going?",
        options: [
          { text: "The moon", isCorrect: false },
          { text: "The wind", isCorrect: false },
          { text: "The sun", isCorrect: true },
          { text: "The ocean", isCorrect: false },
        ],
        explanation:
          "The sun's heat drives evaporation, which starts the cycle of water moving between the ground and the sky.",
      },
      {
        question: "What is it called when plants release water vapor through their leaves?",
        options: [
          { text: "Transpiration", isCorrect: true },
          { text: "Runoff", isCorrect: false },
          { text: "Infiltration", isCorrect: false },
          { text: "Condensation", isCorrect: false },
        ],
        explanation:
          "Transpiration is how plants give off water vapor from tiny openings in their leaves, adding water to the air.",
      },
    ],
  },

  true_false: {
    type: "true_false",
    title: "Water Cycle: True or False?",
    instructions: "Decide whether each statement is true or false.",
    statements: [
      {
        statement: "The sun provides the energy that drives the water cycle.",
        isTrue: true,
        explanation: "The sun's heat causes water to evaporate, which keeps the whole cycle moving.",
      },
      {
        statement: "Clouds are made of water vapor.",
        isTrue: false,
        explanation:
          "Water vapor is an invisible gas. Clouds are made of tiny liquid water droplets or ice crystals.",
      },
      {
        statement: "Hail is a type of precipitation.",
        isTrue: true,
        explanation: "Any water that falls from clouds to the ground, including hail, is precipitation.",
      },
      {
        statement: "Water only evaporates from oceans.",
        isTrue: false,
        explanation: "Water evaporates from lakes, rivers, puddles, soil and even wet clothes, not just oceans.",
      },
      {
        statement: "Some rainwater soaks into the ground and becomes groundwater.",
        isTrue: true,
        explanation: "Water that seeps into soil and rock is stored underground as groundwater.",
      },
      {
        statement: "The total amount of water on Earth is always getting smaller.",
        isTrue: false,
        explanation: "Water changes form and moves around, but the total amount on Earth stays about the same.",
      },
    ],
  },

  flashcards: {
    type: "flashcards",
    title: "Water Cycle Vocabulary",
    instructions: "Read the term on the front, say the meaning, then flip the card to check.",
    cards: [
      { front: "Evaporation", back: "When liquid water is heated and turns into water vapor." },
      { front: "Condensation", back: "When water vapor cools and turns back into tiny liquid droplets." },
      { front: "Precipitation", back: "Water falling from clouds as rain, snow, sleet or hail." },
      { front: "Transpiration", back: "When plants release water vapor through their leaves." },
      { front: "Runoff", back: "Water that flows over the ground into streams, rivers and lakes." },
      { front: "Groundwater", back: "Water stored underground in soil and the spaces between rocks." },
      { front: "Collection", back: "When water gathers in oceans, lakes and rivers." },
      { front: "Water vapor", back: "Water in the form of an invisible gas in the air." },
    ],
  },

  matching: {
    type: "matching",
    title: "Match the Water Cycle Process",
    instructions: "Match each process on the left with its description on the right.",
    pairs: [
      { left: "Evaporation", right: "Liquid water turns into a gas" },
      { left: "Condensation", right: "Water vapor cools and forms droplets" },
      { left: "Precipitation", right: "Water falls from clouds to the ground" },
      { left: "Transpiration", right: "Plants give off water through their leaves" },
      { left: "Runoff", right: "Water flows over land into rivers" },
      { left: "Collection", right: "Water gathers in oceans and lakes" },
    ],
  },

  ordering: {
    type: "ordering",
    title: "Put the Water Cycle in Order",
    instructions: "Drag the steps into the order they happen, starting with the first.",
    items: [
      "The sun heats water in oceans and lakes",
      "Water evaporates and rises as water vapor",
      "Water vapor cools and condenses into clouds",
      "Water falls back to Earth as precipitation",
      "Water collects in oceans, lakes and rivers",
    ],
  },
} satisfies SampleMap;

export function getSample(type: ActivityType): Activity {
  return samples[type];
}
