const express = require("express");
const bodyParser = require("body-parser");

const app = express();

app.use(bodyParser.json());

const productWarehouseMapping = {
  A: "C1",
  B: "C1",
  C: "C1",
  D: "C2",
  E: "C2",
  F: "C2",
  G: "C3",
  H: "C3",
  I: "C3",
};

const distances = {
  C1: { C2: 4, L1: 3, C3: 5 },
  C2: { C1: 4, C3: 3, L1: 2.5 },
  C3: { C1: 5, C2: 3, L1: 2 },
  L1: { C1: 3, C2: 2.5, C3: 2 },
};

const productWeight = {
  A: 3,
  B: 2,
  C: 8,
  D: 12,
  E: 25,
  F: 15,
  G: 0.5,
  H: 1,
  I: 2,
};

const costPerUnitDistance = {
  "0-5": 10,
  "5+": 8,
};

let error;

function calculateDeliveryCost(weight, distance) {
  let baseCost;
  if (weight <= 5) {
    baseCost = costPerUnitDistance["0-5"];
  } else {
    baseCost =
      costPerUnitDistance["0-5"] +
      Math.ceil((weight - 5) / 5) * costPerUnitDistance["5+"];
  }
  const totalCost = baseCost * distance;
  return totalCost;
}

function calculateMinimumDeliveryCost(order) {
  let totalCost = 0;
  let currentLocation;

  const warehousesToVisit = {};
  for (const product in order) {
    const warehouse = productWarehouseMapping[product];
    warehousesToVisit[warehouse] = warehousesToVisit[warehouse] || {};
    warehousesToVisit[warehouse][product] = order[product];
  }

  for (const warehouse in warehousesToVisit) {
    if (currentLocation === "L1") {
      let distance = distances["L1"][warehouse];
      totalCost += distance * 10;
    }
    let warehouseWeight = 0;
    for (const product in warehousesToVisit[warehouse]) {
      warehouseWeight +=
        warehousesToVisit[warehouse][product] * productWeight[product];
    }
    const distanceToL1 = distances[warehouse]["L1"];
    const deliveryCost = calculateDeliveryCost(warehouseWeight, distanceToL1);
    totalCost += deliveryCost;
    currentLocation = "L1";
  }

  return totalCost;
}

app.post("/CalculateMinCost", (req, res) => {
  const order = req.body;
  if (!order || Object.keys(order).length === 0) {
    return res.status(400).json({
      success: false,
      message: "Order data is missing or empty.",
    });
  }

  try {
    const minCost = calculateMinimumDeliveryCost(order);
    return res.status(200).json({
      success: true,
      "Minimum Cost": minCost,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
