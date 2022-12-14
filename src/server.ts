import express from 'express';
import bodyParser from 'body-parser';
import {filterImageFromURL, deleteLocalFiles, isValidImage, isValidUrl} from './util/util';

(async () => {

  // Init the Express application
  const app = express();

  // Set the network port
  const port = process.env.PORT || 8082;
  
  // Use the body parser middleware for post requests
  app.use(bodyParser.json());

  

  // RESTFUL Endpoint for FilterObjects which takes image_url in queryParams
  app.get('/filteredimage',async (req: express.Request, res: express.Response) => {

    if (
      req.query &&
      req.query.image_url &&
      typeof req.query.image_url === 'string'
    ) 
    {
        const image_url: string = <string>req.query.image_url
      
        if(image_url === undefined || !image_url ){
          res.status(404)
              .send('URL for the image was not found !!!.');
        }
    
        if (!isValidUrl(image_url)) {
          return res.status(400).send({ error: 'image_url is invalid' })
        }
    
        if (!isValidImage(image_url)) {
          return res
            .status(422)
            .send({ error: 'image_url is not a valid image' })
        }
    
        try{
        const filterImageresult = await filterImageFromURL(image_url);
        res.status(200)
            .sendFile(filterImageresult,{},async function(err){
              if(!err){
                await deleteLocalFiles([filterImageresult]);
              }
        });
        }catch (error) {
              return res
                .status(422)
                .send({ error: 'error image could not be processed' })
      }
    }
    
    
   
  });

  // Root Endpoint
  // Displays a simple message to the user
  app.get( "/", async ( req, res ) => {
    res.send("try GET /filteredimage?image_url={{}}")
  } );
  

  // Start the Server
  app.listen( port, () => {
      console.log( `server running http://localhost:${ port }` );
      console.log( `press CTRL+C to stop server` );
  } );
})();