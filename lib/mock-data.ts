// Sample markdown files structure
export const mockFileTree = [
  {
    name: "blog",
    path: "blog",
    type: "directory",
    children: [
      {
        name: "getting-started.md",
        path: "blog/getting-started.md",
        type: "file",
      },
      {
        name: "advanced-features.md",
        path: "blog/advanced-features.md",
        type: "file",
      },
    ],
  },
  {
    name: "projects",
    path: "projects",
    type: "directory",
    children: [
      {
        name: "project-1.md",
        path: "projects/project-1.md",
        type: "file",
      },
      {
        name: "project-2.md",
        path: "projects/project-2.md",
        type: "file",
      },
    ],
  },
  {
    name: "about.md",
    path: "about.md",
    type: "file",
  },
  {
    name: "contact.md",
    path: "contact.md",
    type: "file",
  },
]

// Sample file content with front matter
export const mockFiles = {
  "about.md": `---
title: About Our Company
date: 2023-05-15
isDraft: false
thumbnail: https://example.com/images/about.jpg
location: San Francisco, CA
images:
  - url: https://example.com/images/team.jpg
    alt: Our team
    date: 2023-04-10
  - url: https://example.com/images/office.jpg
    alt: Our office
    date: 2023-03-22
    location: San Francisco, CA
---

# About Us

Welcome to our website. We are a team of developers passionate about creating amazing software.`,
  "contact.md": `---
title: Contact Information
date: 2023-06-20
isDraft: false
thumbnail: https://example.com/images/contact.jpg
images: []
---

# Contact Us

Feel free to reach out to us at contact@example.com or call us at (123) 456-7890.`,
  "blog/getting-started.md": `---
title: Getting Started with Our Product
date: 2023-07-05
isDraft: false
thumbnail: https://example.com/images/getting-started.jpg
images:
  - url: https://example.com/images/installation.jpg
    alt: Installation process
    date: 2023-07-01
    location: Documentation
---

# Getting Started

This guide will help you get started with our product.

## Installation

\`\`\`bash
npm install our-product
\`\`\`

## Usage

\`\`\`javascript
import { Product } from 'our-product';

const product = new Product();
product.start();
\`\`\``,
  "blog/advanced-features.md": `---
title: Advanced Features of Our Product
date: 2023-07-10
isDraft: true
thumbnail: https://example.com/images/advanced-features.jpg
images: []
---

# Advanced Features

This guide covers advanced features of our product.

## Feature 1

Feature 1 allows you to do amazing things.

## Feature 2

Feature 2 takes your experience to the next level.`,
  "projects/project-1.md": `---
title: Project 1: Our Flagship Solution
date: 2023-08-01
isDraft: false
thumbnail: https://example.com/images/project-1.jpg
images:
  - url: https://example.com/images/project-1-screenshot.jpg
    alt: Project 1 Screenshot
    date: 2023-07-25
    location: Dashboard
  - url: https://example.com/images/project-1-diagram.jpg
    alt: Project 1 Architecture Diagram
    date: 2023-07-20
    location: Documentation
---

# Project 1

This is our flagship project.

## Overview

Project 1 is designed to solve common problems in the industry.

## Technologies

- React
- Node.js
- MongoDB`,
  "projects/project-2.md": `---
title: Project 2: The Next Generation
date: 2023-09-15
isDraft: true
thumbnail: https://example.com/images/project-2.jpg
images:
  - url: https://example.com/images/project-2-screenshot.jpg
    alt: Project 2 Screenshot
    date: 2023-09-10
    location: Analytics Page
---

# Project 2

Our newest project.

## Overview

Project 2 builds on the success of Project 1 with new features.

## Technologies

- React
- GraphQL
- PostgreSQL`,
}

// Sample S3 media items
export const mockS3Items = {
  "": [
    {
      key: "images/",
      type: "folder",
    },
    {
      key: "documents/",
      type: "folder",
    },
    {
      key: "logo.png",
      type: "file",
      size: 24500,
      lastModified: "2023-06-15T10:30:00Z",
      url: "https://via.placeholder.com/150",
    },
    {
      key: "banner.jpg",
      type: "file",
      size: 125000,
      lastModified: "2023-07-20T14:45:00Z",
      url: "https://via.placeholder.com/1200x300",
    },
  ],
  "images/": [
    {
      key: "images/blog/",
      type: "folder",
    },
    {
      key: "images/projects/",
      type: "folder",
    },
    {
      key: "images/team.jpg",
      type: "file",
      size: 85000,
      lastModified: "2023-05-10T09:15:00Z",
      url: "https://via.placeholder.com/800x600",
    },
    {
      key: "images/office.jpg",
      type: "file",
      size: 92000,
      lastModified: "2023-05-12T11:20:00Z",
      url: "https://via.placeholder.com/800x600",
    },
    {
      key: "images/about.jpg",
      type: "file",
      size: 78000,
      lastModified: "2023-05-15T13:40:00Z",
      url: "https://via.placeholder.com/800x600",
    },
    {
      key: "images/contact.jpg",
      type: "file",
      size: 65000,
      lastModified: "2023-06-20T16:30:00Z",
      url: "https://via.placeholder.com/800x600",
    },
  ],
  "images/blog/": [
    {
      key: "images/blog/getting-started.jpg",
      type: "file",
      size: 110000,
      lastModified: "2023-07-05T08:25:00Z",
      url: "https://via.placeholder.com/800x600",
    },
    {
      key: "images/blog/installation.jpg",
      type: "file",
      size: 95000,
      lastModified: "2023-07-01T10:15:00Z",
      url: "https://via.placeholder.com/800x600",
    },
    {
      key: "images/blog/advanced-features.jpg",
      type: "file",
      size: 105000,
      lastModified: "2023-07-10T14:50:00Z",
      url: "https://via.placeholder.com/800x600",
    },
  ],
  "images/projects/": [
    {
      key: "images/projects/project-1.jpg",
      type: "file",
      size: 120000,
      lastModified: "2023-08-01T09:30:00Z",
      url: "https://via.placeholder.com/800x600",
    },
    {
      key: "images/projects/project-1-screenshot.jpg",
      type: "file",
      size: 135000,
      lastModified: "2023-07-25T11:45:00Z",
      url: "https://via.placeholder.com/800x600",
    },
    {
      key: "images/projects/project-1-diagram.jpg",
      type: "file",
      size: 85000,
      lastModified: "2023-07-20T13:20:00Z",
      url: "https://via.placeholder.com/800x600",
    },
    {
      key: "images/projects/project-2.jpg",
      type: "file",
      size: 115000,
      lastModified: "2023-09-15T15:10:00Z",
      url: "https://via.placeholder.com/800x600",
    },
    {
      key: "images/projects/project-2-screenshot.jpg",
      type: "file",
      size: 125000,
      lastModified: "2023-09-10T16:40:00Z",
      url: "https://via.placeholder.com/800x600",
    },
  ],
  "documents/": [
    {
      key: "documents/readme.md",
      type: "file",
      size: 5000,
      lastModified: "2023-06-10T10:00:00Z",
      url: "https://example.com/documents/readme.md",
    },
    {
      key: "documents/guide.pdf",
      type: "file",
      size: 250000,
      lastModified: "2023-06-12T14:30:00Z",
      url: "https://example.com/documents/guide.pdf",
    },
  ],
}

// Sample Git status
export const mockGitStatus = {
  modifiedFiles: ["blog/advanced-features.md", "projects/project-2.md"],
  isClean: false,
}

// Helper function to get a mock file
export function getMockFile(path: string) {
  return (
    mockFiles[path] ||
    `---
title: New File
date: ${new Date().toISOString().split("T")[0]}
isDraft: true
thumbnail: ""
images: []
---

# New File

This is a new file.`
  )
}

// Helper function to get mock S3 items for a path
export function getMockS3Items(path: string) {
  return mockS3Items[path] || []
}
