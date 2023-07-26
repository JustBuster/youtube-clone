import express from "express";
import ffmpeg from "fluent-ffmpeg";
import {convertVideo, deleteRawVideo, downloadRawVideo, setupDirectories, uploadProcessedVideo} from "./storage";

setupDirectories();


const app = express();
app.use(express.json());

app.post("/process-video", async (req, res) => {

    // Get the bucket and filename from the Cloud Pub/Sub message
    let data;
    try {
      const message = Buffer.from(req.body.message.data, 'base64').toString('utf8');
      data = JSON.parse(message);
      if (!data.name) {
        throw new Error('Invalid message payload received.');
      }
    } catch (error) {
      console.error(error);
      return res.status(400).send('Bad Request: missing filename.');
    }

    const inputFileName = data.name;
    const outputFileName = `processed-${inputFileName}`;

    // Download Raw Video from Cloud Storage
    await downloadRawVideo(inputFileName);

    // Convert video to 360p
    try{
        await convertVideo(inputFileName, outputFileName);
    } catch (err){
        await Promise.all([
            deleteRawVideo(inputFileName),
            deleteRawVideo(outputFileName)
        ]);

        return res.status(500).send(`Internal Server Error: video processing failed. Error: ${err}`);
    }
    
    // Upload Processed Video to Cloud Storage
    await uploadProcessedVideo(outputFileName);
    
    await Promise.all([
        deleteRawVideo(inputFileName),
        deleteRawVideo(outputFileName)
    ]);

    return res.status(200).send(`Processing finished successfully`);
});

const port = process.env.PORT || 3000; //Checks if env defined port is available at runtime if not then sets it to port 3000
app.listen(port, () => {
    console.log(
        `Video processing service listening at http://localhost:${port}`
        );
});