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

## Português (Brazilian Portuguese)

Este aplicativo permite que os usuários façam upload, gerenciem e baixem imagens com metadados. As principais funcionalidades incluem:

- **Upload de Imagens**: Os usuários podem fazer upload de várias imagens de uma vez. As imagens são armazenadas em um bucket na nuvem (por exemplo, AWS S3), e seus metadados são extraídos e salvos em um banco de dados (por exemplo, PostgreSQL).
- **Gerenciamento de Metadados**: Os usuários podem visualizar, editar e atualizar os metadados das imagens carregadas.
- **Coleções de Imagens**: Os usuários podem criar coleções para organizar as imagens. As imagens podem ser atribuídas a coleções durante o upload ou posteriormente.
- **Exclusão de Imagens**: Os usuários podem excluir imagens tanto do bucket na nuvem quanto do banco de dados.
- **Download de Imagens**: Os usuários podem baixar imagens com metadados embutidos.
- **Sincronização**: O aplicativo pode sincronizar o banco de dados com o bucket na nuvem para remover registros de imagens que não existem mais no bucket.

> **Nota**: Neste contexto de desenvolvimento, foi utilizado o AWS tanto para o banco de dados quanto para o bucket.
