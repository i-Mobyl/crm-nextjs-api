
// const cors = require("cors");
const express = require("express");
const app = express();
const PORT = 3001;

// const corsOptions = {
//   origin: 'http://localhost:3000',
//   optionsSuccessStatus: 200
// }

// app.use(cors(corsOptions));

// Path package is included in nodejs
const path = require("path");
const pathToFile = path.resolve("./data.json");

// readFileSync() stringifys the data
const getResources = () => JSON.parse(fs.readFileSync(pathToFile)); 

// fs package is included in nodejs
const fs = require("fs");

// Enable req.body to be received as json data
app.use(express.json());

// app.get("/", (req, res) => {
//   res.send("Hello World")
// })

// Get all resources
app.get("/api/resources", (req, res) => {
  const resources = getResources();
  res.send(resources);
})

// Get active resource (only 1 can be active)
app.get("/api/activeresource", (req, res) => {
  
  const resources = getResources();
  const activeResource = resources.find(res => res.status === "active");
  res.send(activeResource);
})

// Get a resource by id
app.get("/api/resources/:id", (req, res) => {
  const resources = getResources();
  const { id } = (req.params);
  const resource = resources.find(obj => obj.id === id);
  res.send(resource);
})

// Create a resource
app.post("/api/resources", (req, res) => {
  const resources = getResources();
  const resource = req.body;

  resource.createdAt = new Date();
  resource.status = "inactive";
  resource.id = Date.now().toString();
  resources.unshift(resource);

  // Write file and return result
  fs.writeFile(pathToFile, JSON.stringify(resources, null, 2), (error) => {
    if (error) {
      res.status(422).send("Error saving data!");
    } else {
      res.status(200).send("Data has been saved!");
    }
    
  })
})

// Modify a resource
app.patch("/api/resources/:id", (req, res) => {  
  
  const { id } = (req.params);

  // Get original resource
  const resources = getResources();
  const index = resources.findIndex(resource => resource.id === id);

  // Find any active resource
  const activeResource = resources.find(res => res.status === "active");

  // Disallow changes to completed resources
  if (resources[index].status === "complete"){
    return res.status(422).send("Resource is completed. No updates allowed.");
  }

  // Replace just that resource with the modified resource
  resources[index] = req.body;

  // Only a single resource can be active. If the request contains an active status...
  if (req.body.status === "active") {
    // then if there's already an active resource, deny the activation
    if (activeResource){
      return res.status(422).send("A resource is already active!");
    }

    // Activate resource
    resources[index].status = "active";
    resources[index].activationTime = new Date;

  }

  // Write file and return result
  fs.writeFile(pathToFile, JSON.stringify(resources, null, 2), (error) => {
    if (error) {
      res.status(422).send("Error saving data!");
    } else {
      res.status(200).send("Data has been updated!");
    }
  })
})


app.listen(PORT, () => {
  console.log("Server listening on port: " + PORT);
})



