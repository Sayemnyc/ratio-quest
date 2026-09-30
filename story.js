export const FRAME = 'You and your friends are running a community bake sale and fundraiser to buy new books for the school library. Every decision, from mixing lemonade to reading the map to the final money count, needs ratio math to get right.';
export const chapters = [
  { name: 'Set up the sale', place: 'Lemonade Landing', color: 'mint', icon: '🍋', badge: 'Ratio Rookie', desc: 'Mix it. Make it. Get the crew ready.', action: 'Get the stand ready' },
  { name: 'Bring on the crowd', place: 'Bakery Borough', color: 'peach', icon: '🍪', badge: 'Proportion Pro', desc: 'Scale up recipes. Make every dollar count.', action: 'Open the bake sale' },
  { name: 'Save the library', place: 'Library Lookout', color: 'lavender', icon: '📚', badge: 'Master of Ratios', desc: 'Go big. Hit the goal. Fill those shelves.', action: 'Bring the books home' }
];
// Each choice acts on a bake-sale scene. Extra narrative never changes the supplied bank.
export const scenes = [
  ['🍋', 'Mix the lemonade', 'SYRUP → WATER', 'That pitcher is making some very dramatic lemonade. The crew puts it aside for a remix.', 'The lemonade is mixed! Your first customers are lining up.'],
  ['🥤', 'Plan the next batch', 'MORNING → AFTERNOON', 'The planning board gets a little tangled. Your crew hands you a fresh marker.', 'The sales pattern is clear. Now the crew knows when to stock up.'],
  ['🧑‍🍳', 'Assemble your crew', 'VOLUNTEERS → BAKERS', 'Someone is trying to carry three trays at once. Let’s rebalance the crew.', 'The crew is balanced. Every baker has the help they need.'],
  ['🍎', 'Shop for pie supplies', 'APPLE BAG → BUDGET', 'The shopping budget does a tiny backflip. Check the price of just one pound.', 'Apples are in the basket. Your budget stays on track.'],
  ['🎨', 'Mix the team colors', 'BLUE → WHITE', 'The banner turns a surprising shade. The paint crew saves a clean bucket for another mix.', 'The team color looks perfect. Hang that banner!'],
  ['🎟️', 'Organize the ticket desk', 'ADULTS → KIDS', 'The ticket board is getting crowded. The crew needs the smallest version of the ratio.', 'The ticket desk is organized. The line can keep moving.'],
  ['🤝', 'Make the volunteer plan', 'BOYS → GIRLS', 'The volunteer board is doing too much. Shrink both groups by the same factor.', 'The volunteer plan is ready. Everyone has a place on the crew.'],
  ['🚐', 'Fuel the delivery van', 'MILES → GALLONS', 'The driver raises an eyebrow at the fuel plan. Time for a quick pit stop.', 'The fuel plan is ready. Supplies are on their way!'],
  ['🍪', 'Set the cookie price', 'BOXES → DOLLARS', 'The price labels are confused. One cookie box needs one steady price.', 'Price tags are up. The cookie stand is open for business.'],
  ['🏷️', 'Choose a pricing plan', 'PLAN A ↔ PLAN B', 'The price board has a surprise charge hiding on it. Look at an order with no boxes.', 'Your price board scales fairly with every box. Customers are ready.'],
  ['🌾', 'Rescue the recipe card', 'FLOUR → BATCHES', 'The dough is looking a little mysterious. The crew brings a clean measuring cup.', 'Recipe rescued. Four batches are headed for the oven.'],
  ['🍫', 'Bake for a bigger crowd', 'SUGAR → SERVINGS', 'These brownies are taking an unexpected turn. Let’s resize that recipe together.', 'Ten servings are ready. The brownie fans cheer!'],
  ['🗺️', 'Navigate to the bakery', 'MAP → REAL ROAD', 'The driver almost takes a scenic detour. Check what each map centimeter stands for.', 'Route locked in. The van heads straight to the bakery.'],
  ['📚', 'Reserve the library share', 'PROFIT → BOOK FUND', 'The book envelope needs another count. The crew keeps every dollar on the table.', 'The library share is safely in its envelope. More books are getting closer.'],
  ['🛍️', 'Choose a flour deal', 'PRICE → ONE PACK', 'The bargain sign might be showing off. Compare the cost of just one pack.', 'Good deal secured. More of the budget can go toward books.'],
  ['🎁', 'Grow the wrapping team', 'VOLUNTEERS → BOXES', 'Gift boxes are piling up in a wobbly tower. Check how much one volunteer can wrap.', 'The bigger crew wraps the gifts. The sale is picking up speed!'],
  ['📐', 'Build the finale stage', 'BLUEPRINT → STAGE', 'The stage crew pauses with their tape measure. Let’s check the blueprint scale.', 'The stage fits the plan. The finale has a home.'],
  ['🚚', 'Check the delivery charge', 'BASE FEE + MILES', 'The invoice has a little surprise. Peek at the cost before the van drives anywhere.', 'The delivery fee is understood. Your budget has no surprises.'],
  ['🧁', 'Bake the big muffin batch', 'EGGS + MILK → MUFFINS', 'The muffin crew holds the mixing bowl. Both ingredients need to grow together.', 'The big batch is in the oven. Muffins for the whole crowd!'],
  ['💰', 'Thank your star seller', 'SALES → COMMISSION', 'The seller gives the calculator a curious look. Let’s check her share together.', 'Your star seller gets her share. Teamwork pays off.'],
  ['📦', 'Buy the supply crate', 'DISCOUNT → TAX', 'The checkout total looks surprising. The discount happens before the tax.', 'Crate purchased. You kept the discount and covered the tax.'],
  ['🛣️', 'Send the last supply truck', 'SPEED → DISTANCE', 'The route planner takes a wrong turn. Check the distance traveled in one hour.', 'The last truck is on schedule. Finale supplies are rolling in.'],
  ['🖌️', 'Paint the finale banner', 'CONCENTRATE + WATER', 'The paint is making a bold statement. Remember the bucket includes both ingredients.', 'The finale banner is ready. The library crowd gathers.'],
  ['📚', 'Reach the book goal', 'SALES − COSTS → BOOKS', 'The library shelf is almost ready. Check the profit per box, then make sure the goal is covered.', 'You did it! The bake sale reaches the goal. New books are coming to the school library.']
];
