# Books Library Project

This project is a full-stack application for managing a library of books. It consists of a frontend built with Next.js and a backend powered by Node.js, along with a database for storing book information.

## Project Structure

```
books-library
├── docker-compose.yml       # Defines services for the application
├── frontend                 # Frontend application
│   ├── app                  # Next.js application pages
│   │   ├── books            # Book-related pages
│   │   │   ├── new          # Page for adding a new book
│   │   │   │   └── page.tsx
│   │   └── page.tsx        # Main entry point for the frontend
│   ├── components           # UI components
│   │   └── ui              # Reusable UI components
│   ├── features             # Features related to books
│   │   └── books            # Book-related features
│   ├── public               # Static assets
│   ├── package.json         # Frontend npm configuration
│   ├── tsconfig.json        # Frontend TypeScript configuration
│   └── next.config.mjs      # Next.js configuration
├── backend                  # Backend application
│   ├── src                  # Source code for the backend
│   │   └── index.ts        # Entry point for the backend
│   ├── package.json         # Backend npm configuration
│   ├── tsconfig.json        # Backend TypeScript configuration
│   ├── Dockerfile           # Dockerfile for building the backend
│   └── prisma               # Prisma database schema
│       └── schema.prisma    # Database schema definition
└── README.md                # Project documentation
```

## Getting Started

### Prerequisites

- Docker and Docker Compose installed on your machine.

### Setup

1. Clone the repository:
   ```
   git clone <repository-url>
   cd books-library
   ```

2. Build and run the application using Docker Compose:
   ```
   docker-compose up --build
   ```

3. Access the frontend application at `http://localhost:3000`.

### Features

- Add new books to the library.
- View the list of books.
- Responsive design for mobile and desktop.

### Contributing

Contributions are welcome! Please open an issue or submit a pull request for any improvements or bug fixes.

### License

This project is licensed under the MIT License. See the LICENSE file for more details.