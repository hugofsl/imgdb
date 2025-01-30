import express from "express";
import multer from "multer";
import { PrismaClient } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";
import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import dotenv from "dotenv";
import { HeadObjectCommand } from "@aws-sdk/client-s3";
import sharp from "sharp";
import { ExiftoolProcess } from "node-exiftool";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import crypto from "crypto";

dotenv.config();
const app = express();
app.use(express.static("public"));
app.use(express.json()); // Add this line to parse JSON bodies

const prisma = new PrismaClient();
const ep = new ExiftoolProcess();

// Define __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuração do AWS S3 Client (v3)
const s3 = new S3Client({
  endpoint: process.env.AWS_S3_ENDPOINT,
  signatureVersion: 'v4',
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// Configuração do Multer (armazenamento em memória)
const storage = multer.memoryStorage();
const upload = multer({ storage });

/**
 * Rota para fazer upload de imagens e armazená-las no S3 e no PostgreSQL.
 */
app.post("/upload", upload.array("images"), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: "Nenhuma imagem enviada." });
    }

    const { collectionId } = req.body;
    const images = [];

    for (const file of req.files) {
      const fileKey = `${uuidv4()}-${file.originalname}`;

      // Salva a imagem temporariamente no servidor
      const tempImagePath = path.join(__dirname, `temp-${file.originalname}`);
      fs.writeFileSync(tempImagePath, file.buffer);

      // Extrai os metadados da imagem
      await ep.open();
      const metadata = await ep.readMetadata(tempImagePath, ['-File:all']);
      await ep.close();

      // Parâmetros para o upload no S3
      const uploadParams = {
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Key: fileKey,
        Body: file.buffer,
        ContentType: file.mimetype,
        ACL: "public-read", // Torna o arquivo público (acessível por URL)
      };

      // Enviar a imagem para o S3
      await s3.send(new PutObjectCommand(uploadParams));

      // Gerar a URL pública da imagem armazenada no S3
      const imageUrl = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileKey}`;

      // Salvar a URL no banco de dados
      const image = await prisma.image.create({
        data: {
          url: imageUrl,
          filename: file.originalname,
          metadata: metadata.data[0], // Salva os metadados extraídos
          collectionId: collectionId ? parseInt(collectionId) : null,
        },
      });

      images.push(image);

      // Remove o arquivo temporário
      fs.unlinkSync(tempImagePath);
    }

    res.status(201).json(images);
  } catch (error) {
    console.error("Erro no upload:", error);
    res.status(500).json({ error: "Erro ao fazer upload" });
  }
});

/**
 * Rota para atualizar os metadados de uma imagem no banco de dados.
 */
app.put("/image/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { metadata } = req.body;

    // Verifica se os metadados foram fornecidos
    if (!metadata) {
      return res.status(400).json({ error: "Metadados não fornecidos." });
    }

    const updatedImage = await prisma.image.update({
      where: { id: parseInt(id) },
      data: { metadata },
    });

    res.json(updatedImage);
  } catch (error) {
    console.error("Erro ao atualizar metadados:", error);
    res.status(500).json({ error: "Erro ao atualizar metadados" });
  }
});

/**
 * Rota para excluir uma imagem do banco de dados e do S3.
 */
app.delete("/image/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Busca a imagem no banco de dados
    const image = await prisma.image.findUnique({
      where: { id: parseInt(id) },
    });

    if (!image) {
      return res.status(404).json({ error: "Imagem não encontrada." });
    }

    const fileKey = image.url.split("/").pop(); // Extrai o nome do arquivo da URL

    // Exclui a imagem do S3
    await s3.send(
      new DeleteObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Key: fileKey,
      })
    );

    // Exclui a imagem do banco de dados
    await prisma.image.delete({
      where: { id: parseInt(id) },
    });

    res.json({ message: "Imagem excluída com sucesso." });
  } catch (error) {
    console.error("Erro ao excluir imagem:", error);
    res.status(500).json({ error: "Erro ao excluir imagem" });
  }
});

/**
 * Rota para verificar e limpar imagens excluídas do S3.
 */
app.get("/sync-images", async (req, res) => {
  try {
    const images = await prisma.image.findMany();

    for (const image of images) {
      const fileKey = image.url.split("/").pop(); // Extrai o nome do arquivo da URL

      try {
        // Verifica se o arquivo ainda existe no S3
        await s3.send(
          new HeadObjectCommand({
            Bucket: process.env.AWS_S3_BUCKET_NAME,
            Key: fileKey,
          })
        );
      } catch (error) {
        if (error.name === "NotFound") {
          // Se o arquivo não existir no S3, exclua o registro do banco de dados
          await prisma.image.delete({
            where: { id: image.id },
          });
          console.log(`Imagem excluída do banco de dados: ${image.filename}`);
        } else {
          console.error(`Erro ao verificar a imagem ${image.filename}:`, error);
        }
      }
    }

    res.json({ message: "Sincronização concluída." });
  } catch (error) {
    console.error("Erro ao sincronizar imagens:", error);
    res.status(500).json({ error: "Erro ao sincronizar imagens" });
  }
});

/**
 * Rota para buscar todas as imagens do banco de dados.
 */
app.get("/images", async (req, res) => {
  try {
    const images = await prisma.image.findMany();
    res.json(images);
  } catch (error) {
    console.error("Erro ao buscar imagens:", error);
    res.status(500).json({ error: "Erro ao buscar imagens" });
  }
});

/**
 * Rota para baixar uma imagem com metadados embutidos.
 */
app.get("/download/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Busca a imagem no banco de dados
    const image = await prisma.image.findUnique({
      where: { id: parseInt(id) },
    });

    if (!image) {
      return res.status(404).json({ error: "Imagem não encontrada." });
    }

    // Baixa a imagem do S3
    const getObjectParams = {
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: image.url.split('/').pop(),
    };
    const command = new GetObjectCommand(getObjectParams);
    const s3Response = await s3.send(command);

    // Salva a imagem temporariamente no servidor
    const tempImagePath = path.join(__dirname, `temp-${image.filename}`);
    const writeStream = fs.createWriteStream(tempImagePath);
    s3Response.Body.pipe(writeStream);

    writeStream.on('finish', async () => {
      // Embute os metadados na imagem
      await ep.open();
      await ep.writeMetadata(tempImagePath, {
        all: '',
        UserComment: JSON.stringify(image.metadata)
      }, ['overwrite_original']);
      await ep.close();

      // Envia a imagem com metadados embutidos como resposta
      res.setHeader('Content-Disposition', `attachment; filename=${image.filename}`);
      res.setHeader('Content-Type', s3Response.ContentType);
      res.sendFile(tempImagePath, (err) => {
        if (err) {
          console.error("Erro ao enviar arquivo:", err);
          res.status(500).json({ error: "Erro ao enviar arquivo" });
        }
        // Remove o arquivo temporário
        fs.unlinkSync(tempImagePath);
      });
    });
  } catch (error) {
    console.error("Erro ao baixar imagem:", error);
    res.status(500).json({ error: "Erro ao baixar imagem" });
  }
});

/**
 * Rota para criar uma nova coleção.
 */
app.post("/collections", async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ error: "Nome da coleção não fornecido." });
    }

    const collection = await prisma.collection.create({
      data: { name },
    });

    res.status(201).json(collection);
  } catch (error) {
    console.error("Erro ao criar coleção:", error);
    res.status(500).json({ error: "Erro ao criar coleção" });
  }
});

/**
 * Rota para buscar todas as coleções.
 */
app.get("/collections", async (req, res) => {
  try {
    const collections = await prisma.collection.findMany();
    res.json(collections);
  } catch (error) {
    console.error("Erro ao buscar coleções:", error);
    res.status(500).json({ error: "Erro ao buscar coleções" });
  }
});

/**
 * Rota para buscar uma coleção específica com suas imagens.
 */
app.get("/collections/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const collection = await prisma.collection.findUnique({
      where: { id: parseInt(id) },
      include: { images: true },
    });

    if (!collection) {
      return res.status(404).json({ error: "Coleção não encontrada." });
    }

    res.json(collection);
  } catch (error) {
    console.error("Erro ao buscar coleção:", error);
    res.status(500).json({ error: "Erro ao buscar coleção" });
  }
});

/**
 * Inicialização do servidor na porta configurada.
 */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Servidor rodando na porta ${PORT}`));