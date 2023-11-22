import http, { IncomingMessage, Server, ServerResponse } from "http";
import fs from 'node:fs';
import url from 'node:url'
import path from 'node:path'
// import PromptSync from 'prompt-sync';
interface databaseOBject{
  "organization": string,
    "createdAt": string,
    "updatedAt": string
    "products": string[],
    "marketValue": string,
    "address": string,
    "ceo": string,
    "country": string,
    "noOfEmployees": number,
    "employees": string[],
    "id": number
}
const database = path.join(__dirname, "../", "database.json");
//const database = '/Users/macbook/Desktop/week-5-task-node-sq19-abdrasaq14/server/database.json'
const port = 3005;
const server: Server = http.createServer((req: IncomingMessage, res: ServerResponse) => {
  
  const { query } = url.parse(req.url as string, true);
    if (req.method === "GET") {
      const readMyFile = fs.readFileSync(database, 'utf-8');
      const existingArray:databaseOBject[] = JSON.parse(readMyFile);
      res.end(JSON.stringify(existingArray));
    }
    else if(req.method === "POST"){
      
      let bodyObject = '';
      req.on('data', (bit) => {
        bodyObject += bit.toString(); // to store the inputted data from the body to bodyObject
      });
  
      req.on('end', () => {
        const data = JSON.parse(bodyObject); // Parse the JSON data from the request body
        const key = 'id';
        
        fs.readFile(database, 'utf-8', (err, fileData) => {
          if (err) {
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end('Internal Server Error');
          } else {
            let existingData = JSON.parse(fileData);
            if(!data[key]){
              data[key] = existingData.length + 1
            }
            existingData.push(data); // Add the new data to the existing array
  
            fs.writeFile(database, JSON.stringify(existingData, null, 2), (err) => {
              if (err) {
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                res.end('Internal Server Error');
              } else {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(data));
              }
            });
          }
        });
      });
    }
    else if (req.method === 'DELETE') {
      if (!query.id) {
        res.writeHead(400, {"content-type": "text/json"});
        res.end('Kindly supply id to delete');
      } 
      else {
        const existingData = fs.readFileSync(database, 'utf-8');
        const existingArray = JSON.parse(existingData);
        const indexToDelete = parseInt(query.id as string);
  
        const dataToWriteBack:databaseOBject[] = existingArray.filter((item: any) => item.id !== indexToDelete);
        dataToWriteBack.map((item:databaseOBject, index:number) => {
          item.id = index + 1;
          return item;
        });
        fs.writeFileSync(database, JSON.stringify(dataToWriteBack, null, 2));
        res.writeHead(200, {"content-type": "text/json"});
        res.end(JSON.stringify(dataToWriteBack));
      }
 }
    else if (req.method === 'PATCH') {
      if (!query.id && !query.address) {
        res.writeHead(400, {"content-type": "text/json"});
        res.end('Kindly supply id and address of item to update');
      } 
      else {
        const existingData = fs.readFileSync(database, 'utf-8');
        const existingArray = JSON.parse(existingData);
        const indexToWriteTo = parseInt(query.id as string);
        for(const object of existingArray){
          if(object.id === indexToWriteTo){
            object.address = 'my new address'
          }
        }
        //const dataToWriteBack = existingArray.filter((item: any) => item.id !== indexToDelete);
        fs.writeFileSync(database, JSON.stringify(existingArray, null, 2));
        res.writeHead(200, {"content-type": "text/json"});
        res.end(JSON.stringify(existingArray));
      }
    

    }
    else if (req.method === 'PUT') {
      if (!query.id) {
        res.writeHead(400, {"content-type": "text/json"});
        res.end('Kindly supply id Of item to update');
      } 
      else {
        let body = '';
        req.on('data', (chunkOfData)=>{
          body += chunkOfData
        });
        req.on('end', ()=>{
          fs.readFile(database, 'utf-8', (err, dataReadFromFile)=>{
            if(err){
              //res.writeHead(500, {"content-type": "text/json"});
              res.end('Internal server error, unable to read file');
            }
            else{
              const dataToPutFromBody = JSON.parse(body)
              const existingArrayOfData = JSON.parse(dataReadFromFile);
              const key = 'id'
              if(!dataToPutFromBody[key]){
                dataToPutFromBody[key] = parseInt(query.id as string);
              }
              const indexToWriteTo = parseInt(query.id as string);
              existingArrayOfData.splice(indexToWriteTo -1, 1, dataToPutFromBody);
             
              fs.writeFileSync(database, JSON.stringify(existingArrayOfData, null, 2));
              res.writeHead(200, {"content-type": "text/json"});
              res.end(JSON.stringify(existingArrayOfData));
              
            }
          })
        })
        
      }
    

    }
  }
  
);
server.listen(port, ()=>{
  console.log(`server is now listenng at port ${port}`)
});
