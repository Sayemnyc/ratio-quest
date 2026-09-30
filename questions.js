// The 24-question bank. Text is verbatim from the spec; do not edit the math.
const TIERS = [
  {
    id: 1, name: "Foundation", icon: "🍋", badge: "Ratio Rookie",
    questions: [
      { id: "1.1", story: "First up: the lemonade stand. The perfect mix is 1 cup of lemon syrup for every 4 cups of water.", q: "What is the ratio of syrup to water?", options: ["1:4", "4:1", "1:5", "5:1"], answer: "1:4", hint: "A ratio compares two amounts in order. Which comes first, syrup or water?" },
      { id: "1.2", story: "Yesterday's sales: 6 cups sold in the morning, 10 in the afternoon.", q: "Simplify the ratio 6:10.", options: ["3:5", "2:3", "6:10", "1:2"], answer: "3:5", hint: "Divide both numbers by the same greatest number." },
      { id: "1.3", story: "A poster says the fundraiser needs volunteers and bakers in a 2:3 ratio.", q: "If 12 bakers sign up, how many volunteers keep the 2:3 ratio?", options: ["6", "8", "9", "18"], answer: "8", hint: "12 is 4 times 3. What is 4 times 2?" },
      { id: "1.4", story: "Apples for the apple pies: a 5-pound bag costs $10.", q: "What is the price per pound?", options: ["$2", "$5", "$0.50", "$15"], answer: "$2", hint: "Divide the total price by the total pounds." },
      { id: "1.5", story: "Team colors! The banner paint mix is 2 cans of blue for every 3 cans of white.", q: "You pour 10 cans of blue. How many cans of white keep the color right?", options: ["12", "13", "15", "20"], answer: "15", hint: "10 is 5 times 2, so multiply 3 by the same 5." },
      { id: "1.6", story: "Ticket sales so far: 12 adult tickets and 18 kid tickets.", q: "Simplify the ratio 12:18.", options: ["2:3", "3:4", "4:6", "6:9"], answer: "2:3", hint: "Both numbers are divisible by 6. (Watch out: some options are equivalent but not simplified.)" },
      { id: "1.7", story: "Class volunteers: 14 boys and 21 girls.", q: "What is the simplified ratio of boys to girls?", options: ["2:3", "14:21", "4:6", "7:3"], answer: "2:3", hint: "Both numbers are divisible by 7." },
      { id: "1.8", story: "Delivery day! The van drives 240 miles on 12 gallons of gas.", q: "How many miles per gallon is that?", options: ["12", "20", "28", "30"], answer: "20", hint: "Miles divided by gallons." }
    ]
  },
  {
    id: 2, name: "Builder", icon: "🧁", badge: "Proportion Pro",
    questions: [
      { id: "2.1", story: "Cookie boxes sell at a steady price: 2 boxes cost $6, and 5 boxes cost $15.", q: "What is the price per box (the constant of proportionality)?", options: ["$2", "$3", "$4", "$5"], answer: "$3", hint: "Divide any total cost by its number of boxes." },
      { id: "2.2", story: "Two pricing ideas. Plan A charges $3 per box. Plan B charges $10 plus $1 per box.", q: "Which plan is a proportional relationship?", options: ["Plan A only", "Plan B only", "Both plans", "Neither plan"], answer: "Plan A only", hint: "Proportional means zero boxes costs zero dollars. Which plan passes through (0,0)?" },
      { id: "2.3", story: "The recipe card is smudged: 9 cups of flour make 12 batches. You need the amount for 4 batches.", q: "Solve: x/4 = 9/12.", options: ["2", "3", "4", "6"], answer: "3", hint: "Cross-multiply: 12x = 36." },
      { id: "2.4", story: "The famous brownie recipe serves 4 and needs 2 cups of sugar.", q: "How much sugar for 10 servings?", options: ["4 cups", "5 cups", "6 cups", "8 cups"], answer: "5 cups", hint: "10 servings is 2.5 times 4 servings." },
      { id: "2.5", story: "The fair map scale: 1 cm on the map = 5 km of real road.", q: "The bakery is 7 cm away on the map. How far is the real drive?", options: ["12 km", "25 km", "35 km", "45 km"], answer: "35 km", hint: "Multiply 7 by 5." },
      { id: "2.6", story: "The library gets 20% of all profit.", q: "If the profit is $150, how much goes to the library?", options: ["$20", "$25", "$30", "$45"], answer: "$30", hint: "20% means 20 out of every 100." },
      { id: "2.7", story: "Two flour deals: a 12-pack for $8.40, or an 8-pack for $6.00.", q: "Which is the better buy per pack?", options: ["The 12-pack", "The 8-pack", "They are the same", "Cannot tell"], answer: "The 12-pack", hint: "Find each unit price first: $8.40/12 vs $6.00/8." },
      { id: "2.8", story: "3 volunteers wrap 45 gift boxes in one afternoon, all working at the same speed.", q: "How many boxes could 5 volunteers wrap?", options: ["60", "65", "75", "90"], answer: "75", hint: "First find boxes per volunteer." }
    ]
  },
  {
    id: 3, name: "Master", icon: "🏆", badge: "Master of Ratios",
    questions: [
      { id: "3.1", story: "The stage blueprint scale: 1 inch = 2 feet.", q: "The stage is 5.5 inches long on the blueprint. How long in real life?", options: ["7.5 ft", "10 ft", "11 ft", "12 ft"], answer: "11 ft", hint: "Multiply 5.5 by 2." },
      { id: "3.2", story: "The delivery van charges a $3 base fee plus $2 per mile.", q: "Is the total cost proportional to the miles driven?", options: ["Yes", "No", "Only under 10 miles", "Cannot tell"], answer: "No", hint: "At 0 miles, is the cost $0?" },
      { id: "3.3", story: "12 muffins need 3 eggs and 2 cups of milk.", q: "For 48 muffins, how many eggs and how much milk?", options: ["9 eggs, 6 cups", "12 eggs, 8 cups", "6 eggs, 4 cups", "15 eggs, 10 cups"], answer: "12 eggs, 8 cups", hint: "48 is 4 times 12. Scale both ingredients by 4." },
      { id: "3.4", story: "Your star seller earns 6% commission.", q: "She sells $850 of goods. What is her commission?", options: ["$48", "$51", "$54", "$60"], answer: "$51", hint: "6% = 0.06. Multiply 0.06 by 850." },
      { id: "3.5", story: "A $40 supply crate is 25% off, then 8% tax applies to the sale price.", q: "What do you pay in total?", options: ["$32.40", "$30.00", "$33.20", "$35.20"], answer: "$32.40", hint: "First find the sale price ($30), then compute 8% tax on that." },
      { id: "3.6", story: "The supply truck drives at a constant speed: 300 miles in 5 hours.", q: "How far does it go in 8 hours?", options: ["420 miles", "460 miles", "480 miles", "500 miles"], answer: "480 miles", hint: "Find miles per hour first." },
      { id: "3.7", story: "Paint for the finale banner: concentrate to water ratio is 1:3. You need 20 liters total.", q: "How many liters of concentrate?", options: ["4", "5", "6.67", "15"], answer: "5", hint: "The ratio has 4 total parts. Split 20 liters into 4 equal parts. (15 is the water, not the concentrate.)" },
      { id: "3.8", story: "FINAL CHALLENGE. Goal: raise $500. Each bake box sells for $5 and costs $2 to make.", q: "How many boxes must you sell to hit the goal?", options: ["100", "150", "166", "167"], answer: "167", hint: "Profit per box is $3. But 166 boxes only makes $498, which is short..." }
    ]
  }
];

const FRAME = "You and your friends are running a community bake sale and fundraiser to buy new books for the school library. Every decision, from mixing lemonade to reading the map to the final money count, needs ratio math to get right.";
