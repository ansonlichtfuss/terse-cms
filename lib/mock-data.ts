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
      {
        name: "extremely-long-filename-with-detailed-description-and-keywords-for-seo-purposes.md",
        path: "blog/extremely-long-filename-with-detailed-description-and-keywords-for-seo-purposes.md",
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
  {
    name: "very-long-folder-name-that-contains-multiple-words-and-should-be-truncated-with-ellipsis",
    path: "very-long-folder-name-that-contains-multiple-words-and-should-be-truncated-with-ellipsis",
    type: "directory",
    children: [
      {
        name: "nested-file-with-extremely-long-descriptive-name-that-exceeds-normal-display-width.md",
        path: "very-long-folder-name-that-contains-multiple-words-and-should-be-truncated-with-ellipsis/nested-file-with-extremely-long-descriptive-name-that-exceeds-normal-display-width.md",
        type: "file",
      },
    ],
  },
]

// Sample file content with front matter
export const mockFilesContent = {
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
  "blog/extremely-long-filename-with-detailed-description-and-keywords-for-seo-purposes.md": `---
title: This is an Extremely Long File Title That Will Test the Truncation Capabilities
date: 2023-10-20
isDraft: false
thumbnail: https://example.com/images/long-filename.jpg
keywords: very long filename, truncation test, ellipsis display, file explorer ui testing, responsive design
---

# Testing Long Filenames

This file has an extremely long filename to test the truncation capabilities of the file explorer UI.`,

  "very-long-folder-name-that-contains-multiple-words-and-should-be-truncated-with-ellipsis/nested-file-with-extremely-long-descriptive-name-that-exceeds-normal-display-width.md": `---
title: Nested File with Extremely Long Name
date: 2023-11-01
isDraft: true
thumbnail: https://example.com/images/nested-long-file.jpg
---

# Nested File with Long Name

This file is nested inside a folder with a very long name to test both folder and file name truncation in the UI.`,
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
    mockFilesContent[path] ||
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

export const mockFileContentTree = [
  {
    name: "content",
    path: "content",
    type: "directory",
    children: [
      {
        name: "blog",
        path: "content/blog",
        type: "directory",
        children: [
          {
            name: "hello-world.md",
            path: "content/blog/hello-world.md",
            type: "file",
            content:
              "---\ntitle: Hello World\ndate: 2023-01-01\ndescription: This is my first post\n---\n\n# Hello World\n\nThis is my first post on my new blog!",
          },
          {
            name: "second-post.md",
            path: "content/blog/second-post.md",
            type: "file",
            content:
              "---\ntitle: Second Post\ndate: 2023-01-02\ndescription: This is my second post\n---\n\n# Second Post\n\nThis is my second post on my new blog!",
          },
          {
            name: "this-is-a-very-long-file-name-that-should-be-truncated-with-ellipsis-to-fit-the-available-space.md",
            path: "content/blog/this-is-a-very-long-file-name-that-should-be-truncated-with-ellipsis-to-fit-the-available-space.md",
            type: "file",
            content:
              "---\ntitle: Long File Name Test\ndate: 2023-01-03\ndescription: Testing truncation\n---\n\n# Long File Name Test\n\nThis file has a very long name to test truncation.",
          },
        ],
      },
      {
        name: "pages",
        path: "content/pages",
        type: "directory",
        children: [
          {
            name: "about.md",
            path: "content/pages/about.md",
            type: "file",
            content: "---\ntitle: About\n---\n\n# About\n\nThis is the about page.",
          },
          {
            name: "contact.md",
            path: "content/pages/contact.md",
            type: "file",
            content: "---\ntitle: Contact\n---\n\n# Contact\n\nThis is the contact page.",
          },
        ],
      },
      {
        name: "this-is-a-very-long-folder-name-that-should-be-truncated-with-ellipsis-to-fit-the-available-space",
        path: "content/this-is-a-very-long-folder-name-that-should-be-truncated-with-ellipsis-to-fit-the-available-space",
        type: "directory",
        children: [
          {
            name: "example.md",
            path: "content/this-is-a-very-long-folder-name-that-should-be-truncated-with-ellipsis-to-fit-the-available-space/example.md",
            type: "file",
            content:
              "---\ntitle: Example\n---\n\n# Example\n\nThis is an example file in a folder with a very long name.",
          },
        ],
      },
    ],
  },
  {
    name: "public",
    path: "public",
    type: "directory",
    children: [
      {
        name: "images",
        path: "public/images",
        type: "directory",
        children: [
          {
            name: "logo.png",
            path: "public/images/logo.png",
            type: "file",
          },
        ],
      },
    ],
  },
  {
    name: "README.md",
    path: "README.md",
    type: "file",
    content: "# My Website\n\nThis is my website built with Next.js and Markdown.",
  },
]
