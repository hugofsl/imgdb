import express from "express";
import multer from "multer";
import { PrismaClient } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";
import AWS from "aws-sdk";
import dotenv from "dotenv";

dotenv.config();
const app = express();
app.use(express.json());
const prisma = new PrismaClient();
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

const storage = multer.memoryStorage();
const upload = multer({ storage });

// Upload de imagem para o S3 e banco de dados
app.post("/upload", upload.single("image"), async (req, res) => {
  try {
    const file = req.file;
    const fileKey = `${uuidv4()}-${file.originalname}`;
    const metadata = req.body.metadata ? JSON.parse(req.body.metadata) : {};
    
    const uploadParams = {
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: fileKey,
      Body: file.buffer,
      ContentType: file.mimetype,
      ACL: "public-read",
    };

    const s3Response = await s3.upload(uploadParams).promise();
    
    const image = await prisma.image.create({
      data: {
        url: s3Response.Location,
        filename: file.originalname,
        metadata,
      },
    });
    
    res.status(201).json(image);
  } catch (error) {
    res.status(500).json({ error: "Erro ao fazer upload" });
  }
});

// Atualizar metadados
app.put("/image/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { metadata } = req.body;
    
    const updatedImage = await prisma.image.update({
      where: { id: parseInt(id) },
      data: { metadata },
    });
    
    res.json(updatedImage);
  } catch (error) {
    res.status(500).json({ error: "Erro ao atualizar metadados" });
  }
});

app.get("/images", async (req, res) => {
  const images = await prisma.image.findMany();
  res.json(images);
});

app.listen(3000, () => console.log("Servidor rodando na porta 3000"));
