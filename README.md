# Image Database Application

## English

This application allows users to upload, manage, and download images with metadata. The main functionalities include:

- **Image Upload**: Users can upload multiple images at once. The images are stored in a cloud bucket (e.g., AWS S3), and their metadata is extracted and saved in a database (e.g., PostgreSQL).
- **Metadata Management**: Users can view, edit, and update the metadata of uploaded images.
- **Image Collections**: Users can create collections to organize images. Images can be assigned to collections during upload or later.
- **Image Deletion**: Users can delete images from both the cloud bucket and the database.
- **Image Download**: Users can download images with embedded metadata.
- **Synchronization**: The application can synchronize the database with the cloud bucket to remove records of images that no longer exist in the bucket.

> **Note**: In this development context, AWS was used for both the database and the bucket.

### Backend

The backend of this application is built using Node.js and Express. It handles the following tasks:
- Image upload and storage in AWS S3.
- Metadata extraction using `node-exiftool`.
- Database operations using Prisma ORM with a PostgreSQL database.
- Image deletion from both S3 and the database.
- Synchronization of the database with the S3 bucket.
- Providing APIs for the frontend to interact with.

Technologies used:
- Node.js
- Express
- Prisma ORM
- PostgreSQL
- AWS S3
- `node-exiftool`
- `sharp`

### Frontend

The frontend of this application is built using HTML, CSS, and JavaScript. It provides a user interface for:
- Uploading images.
- Viewing and managing image metadata.
- Creating and managing image collections.
- Downloading images with embedded metadata.
- Deleting images.

Technologies used:
- HTML
- CSS
- JavaScript

## Português (Brazilian Portuguese)

Este aplicativo permite que os usuários façam upload, gerenciem e baixem imagens com metadados. As principais funcionalidades incluem:

- **Upload de Imagens**: Os usuários podem fazer upload de várias imagens de uma vez. As imagens são armazenadas em um bucket na nuvem (por exemplo, AWS S3), e seus metadados são extraídos e salvos em um banco de dados (por exemplo, PostgreSQL).
- **Gerenciamento de Metadados**: Os usuários podem visualizar, editar e atualizar os metadados das imagens carregadas.
- **Coleções de Imagens**: Os usuários podem criar coleções para organizar as imagens. As imagens podem ser atribuídas a coleções durante o upload ou posteriormente.
- **Exclusão de Imagens**: Os usuários podem excluir imagens tanto do bucket na nuvem quanto do banco de dados.
- **Download de Imagens**: Os usuários podem baixar imagens com metadados embutidos.
- **Sincronização**: O aplicativo pode sincronizar o banco de dados com o bucket na nuvem para remover registros de imagens que não existem mais no bucket.

> **Nota**: Neste contexto de desenvolvimento, foi utilizado o AWS tanto para o banco de dados quanto para o bucket.

### Backend

O backend deste aplicativo é construído usando Node.js e Express. Ele lida com as seguintes tarefas:
- Upload de imagens e armazenamento no AWS S3.
- Extração de metadados usando `node-exiftool`.
- Operações de banco de dados usando Prisma ORM com um banco de dados PostgreSQL.
- Exclusão de imagens tanto do S3 quanto do banco de dados.
- Sincronização do banco de dados com o bucket S3.
- Fornecimento de APIs para interação com o frontend.

Tecnologias usadas:
- Node.js
- Express
- Prisma ORM
- PostgreSQL
- AWS S3
- `node-exiftool`
- `sharp`

### Frontend

O frontend deste aplicativo é construído usando HTML, CSS e JavaScript. Ele fornece uma interface de usuário para:
- Upload de imagens.
- Visualização e gerenciamento de metadados de imagens.
- Criação e gerenciamento de coleções de imagens.
- Download de imagens com metadados embutidos.
- Exclusão de imagens.

Tecnologias usadas:
- HTML
- CSS
- JavaScript
