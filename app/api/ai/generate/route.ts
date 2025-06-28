import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json()

    if (!prompt) {
      return NextResponse.json(
        { message: 'Prompt is required' },
        { status: 400 }
      )
    }

    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { message: 'Gemini API key not configured' },
        { status: 500 }
      )
    }

    // Using Gemini Pro model via REST API
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `You are a helpful writing assistant. Generate high-quality, well-structured content based on the user's prompt. Format your response in plain text with proper paragraphs and line breaks in a format which can be easily supported by BlockNote
                
                example output that BlockNote understands 
                '[
  {
    "id": "0ab52cf9-ffdc-4abb-b302-095f95dff5c5",
    "type": "paragraph",
    "props": {
      "textColor": "default",
      "backgroundColor": "default",
      "textAlignment": "left"
    },
    "content": [
      {
        "type": "text",
        "text": "Here’s a full ",
        "styles": {}
      },
      {
        "type": "text",
        "text": "blog post on Microsoft Azure",
        "styles": {
          "bold": true
        }
      },
      {
        "type": "text",
        "text": " tailored for students, developers, and tech enthusiasts. If you want a specific topic (e.g., Azure Functions, DevOps, AI, or learning roadmap), let me know. For now, here’s a ",
        "styles": {}
      },
      {
        "type": "text",
        "text": "general introductory blog",
        "styles": {
          "bold": true
        }
      },
      {
        "type": "text",
        "text": ":",
        "styles": {}
      }
    ],
    "children": []
  },
  {
    "id": "355313be-e7b7-4d6f-924a-3083de1cf434",
    "type": "heading",
    "props": {
      "textColor": "default",
      "backgroundColor": "default",
      "textAlignment": "left",
      "level": 1
    },
    "content": [
      {
        "type": "text",
        "text": "🌩️ Getting Started with Microsoft Azure: The Future of Cloud Computing",
        "styles": {}
      }
    ],
    "children": []
  },
  {
    "id": "a188f8f4-7c9c-471c-b668-89b38a0ff7d7",
    "type": "quote",
    "props": {
      "textColor": "default",
      "backgroundColor": "default"
    },
    "content": [],
    "children": []
  },
  {
    "id": "f7ccf404-0293-4f87-b4af-22e5bf38d446",
    "type": "paragraph",
    "props": {
      "textColor": "default",
      "backgroundColor": "default",
      "textAlignment": "left"
    },
    "content": [
      {
        "type": "text",
        "text": "\"Cloud computing is no longer the future — it’s the present.\"\n",
        "styles": {
          "italic": true
        }
      },
      {
        "type": "text",
        "text": "Whether you're a developer, student, or business owner, chances are you've already interacted with cloud technology — and Microsoft Azure is one of its key players.",
        "styles": {}
      }
    ],
    "children": []
  },
  {
    "id": "771d2cbf-137a-4577-8c10-6e527c1b1f83",
    "type": "heading",
    "props": {
      "textColor": "default",
      "backgroundColor": "default",
      "textAlignment": "left",
      "level": 2
    },
    "content": [
      {
        "type": "text",
        "text": "🧠 What is Microsoft Azure?",
        "styles": {}
      }
    ],
    "children": []
  },
  {
    "id": "4c09c3cf-e80b-44f2-9121-a923bb373cb8",
    "type": "paragraph",
    "props": {
      "textColor": "default",
      "backgroundColor": "default",
      "textAlignment": "left"
    },
    "content": [
      {
        "type": "text",
        "text": "Microsoft Azure",
        "styles": {
          "bold": true
        }
      },
      {
        "type": "text",
        "text": " is a cloud computing platform and service provided by Microsoft. It offers a wide range of cloud services including:",
        "styles": {}
      }
    ],
    "children": []
  },
  {
    "id": "2619866c-e8b2-47a1-a700-12ed1b868925",
    "type": "bulletListItem",
    "props": {
      "textColor": "default",
      "backgroundColor": "default",
      "textAlignment": "left"
    },
    "content": [
      {
        "type": "text",
        "text": "Virtual Machines",
        "styles": {}
      }
    ],
    "children": []
  },
  {
    "id": "5d1f4a29-0cfe-4858-92f1-781319c1cbf4",
    "type": "bulletListItem",
    "props": {
      "textColor": "default",
      "backgroundColor": "default",
      "textAlignment": "left"
    },
    "content": [
      {
        "type": "text",
        "text": "Web and Mobile App Hosting",
        "styles": {}
      }
    ],
    "children": []
  },
  {
    "id": "863fde45-a6c7-478e-9180-b9e92b4e8019",
    "type": "bulletListItem",
    "props": {
      "textColor": "default",
      "backgroundColor": "default",
      "textAlignment": "left"
    },
    "content": [
      {
        "type": "text",
        "text": "Databases",
        "styles": {}
      }
    ],
    "children": []
  },
  {
    "id": "cb4655a8-7f04-4c7f-8dc7-a131fa6b2d73",
    "type": "bulletListItem",
    "props": {
      "textColor": "default",
      "backgroundColor": "default",
      "textAlignment": "left"
    },
    "content": [
      {
        "type": "text",
        "text": "AI and Machine Learning",
        "styles": {}
      }
    ],
    "children": []
  },
  {
    "id": "a2ae0560-5782-4a87-9663-487d9290049e",
    "type": "bulletListItem",
    "props": {
      "textColor": "default",
      "backgroundColor": "default",
      "textAlignment": "left"
    },
    "content": [
      {
        "type": "text",
        "text": "DevOps and Monitoring",
        "styles": {}
      }
    ],
    "children": []
  },
  {
    "id": "06a85238-fea4-4284-9525-fe0c4a257cef",
    "type": "bulletListItem",
    "props": {
      "textColor": "default",
      "backgroundColor": "default",
      "textAlignment": "left"
    },
    "content": [
      {
        "type": "text",
        "text": "IoT and Networking",
        "styles": {}
      }
    ],
    "children": []
  },
  {
    "id": "0175de0c-5bee-4977-b3df-ef2201862440",
    "type": "paragraph",
    "props": {
      "textColor": "default",
      "backgroundColor": "default",
      "textAlignment": "left"
    },
    "content": [
      {
        "type": "text",
        "text": "With Azure, you can build, test, deploy, and manage applications and services through Microsoft-managed data centers — without needing to manage physical infrastructure.",
        "styles": {}
      }
    ],
    "children": []
  },
  {
    "id": "2437d1b8-5ab2-4807-be7b-2c43e5d55cfb",
    "type": "heading",
    "props": {
      "textColor": "default",
      "backgroundColor": "default",
      "textAlignment": "left",
      "level": 2
    },
    "content": [
      {
        "type": "text",
        "text": "🚀 Why Should You Care About Azure?",
        "styles": {}
      }
    ],
    "children": []
  },
  {
    "id": "1b454193-94df-4bf9-ba91-f52a4d577494",
    "type": "paragraph",
    "props": {
      "textColor": "default",
      "backgroundColor": "default",
      "textAlignment": "left"
    },
    "content": [
      {
        "type": "text",
        "text": "Here’s why Azure is worth exploring:",
        "styles": {}
      }
    ],
    "children": []
  },
  {
    "id": "5358c463-3ce1-4e2b-b80e-a8139c599596",
    "type": "heading",
    "props": {
      "textColor": "default",
      "backgroundColor": "default",
      "textAlignment": "left",
      "level": 3
    },
    "content": [
      {
        "type": "text",
        "text": "1. ",
        "styles": {}
      },
      {
        "type": "text",
        "text": "Massive Career Opportunities",
        "styles": {
          "bold": true
        }
      }
    ],
    "children": []
  },
  {
    "id": "5983e633-752b-43c6-971d-a97faf6ed9fa",
    "type": "paragraph",
    "props": {
      "textColor": "default",
      "backgroundColor": "default",
      "textAlignment": "left"
    },
    "content": [
      {
        "type": "text",
        "text": "Azure is the ",
        "styles": {}
      },
      {
        "type": "text",
        "text": "second-largest cloud platform",
        "styles": {
          "bold": true
        }
      },
      {
        "type": "text",
        "text": " after AWS, and demand for Azure-certified professionals is growing rapidly. If you're a student or early-career developer, learning Azure gives you an edge.",
        "styles": {}
      }
    ],
    "children": []
  },
  {
    "id": "f8806bfc-56e8-4080-89c4-5ae3a5397b1f",
    "type": "heading",
    "props": {
      "textColor": "default",
      "backgroundColor": "default",
      "textAlignment": "left",
      "level": 3
    },
    "content": [
      {
        "type": "text",
        "text": "2. ",
        "styles": {}
      },
      {
        "type": "text",
        "text": "Free Tier for Students",
        "styles": {
          "bold": true
        }
      }
    ],
    "children": []
  },
  {
    "id": "1a2788d3-ccfa-44d5-a6ec-7e80545684f2",
    "type": "paragraph",
    "props": {
      "textColor": "default",
      "backgroundColor": "default",
      "textAlignment": "left"
    },
    "content": [
      {
        "type": "text",
        "text": "Microsoft offers ",
        "styles": {}
      },
      {
        "type": "text",
        "text": "Azure for Students",
        "styles": {
          "bold": true
        }
      },
      {
        "type": "text",
        "text": ", which includes $100 in free credits and access to services like Azure App Services, Cosmos DB, and GitHub Copilot — without needing a credit card.",
        "styles": {}
      }
    ],
    "children": []
  },
  {
    "id": "52603d67-cb55-494a-9875-af0be6d00c32",
    "type": "heading",
    "props": {
      "textColor": "default",
      "backgroundColor": "default",
      "textAlignment": "left",
      "level": 3
    },
    "content": [
      {
        "type": "text",
        "text": "3. ",
        "styles": {}
      },
      {
        "type": "text",
        "text": "Support for Multiple Languages & Frameworks",
        "styles": {
          "bold": true
        }
      }
    ],
    "children": []
  },
  {
    "id": "3b7d3ca3-38d7-400b-bb24-4e8347c03829",
    "type": "paragraph",
    "props": {
      "textColor": "default",
      "backgroundColor": "default",
      "textAlignment": "left"
    },
    "content": [
      {
        "type": "text",
        "text": "Azure supports ",
        "styles": {}
      },
      {
        "type": "text",
        "text": ".NET, Java, Node.js, Python, PHP",
        "styles": {
          "bold": true
        }
      },
      {
        "type": "text",
        "text": ", and even Docker containers and Kubernetes clusters.",
        "styles": {}
      }
    ],
    "children": []
  },
  {
    "id": "b055b317-f8f1-4e31-b590-be2282836472",
    "type": "heading",
    "props": {
      "textColor": "default",
      "backgroundColor": "default",
      "textAlignment": "left",
      "level": 2
    },
    "content": [
      {
        "type": "text",
        "text": "🛠️ Key Services to Explore",
        "styles": {}
      }
    ],
    "children": []
  },
  {
    "id": "3d235e2c-c33c-4010-8e2e-69f3649dde08",
    "type": "table",
    "props": {
      "textColor": "default"
    },
    "content": {
      "type": "tableContent",
      "columnWidths": [
        null,
        null
      ],
      "headerRows": 1,
      "rows": [
        {
          "cells": [
            {
              "type": "tableCell",
              "content": [
                {
                  "type": "text",
                  "text": "Service",
                  "styles": {}
                }
              ],
              "props": {
                "colspan": 1,
                "rowspan": 1,
                "backgroundColor": "default",
                "textColor": "default",
                "textAlignment": "left"
              }
            },
            {
              "type": "tableCell",
              "content": [
                {
                  "type": "text",
                  "text": "Description",
                  "styles": {}
                }
              ],
              "props": {
                "colspan": 1,
                "rowspan": 1,
                "backgroundColor": "default",
                "textColor": "default",
                "textAlignment": "left"
              }
            }
          ]
        },
        {
          "cells": [
            {
              "type": "tableCell",
              "content": [
                {
                  "type": "text",
                  "text": "Azure Virtual Machines",
                  "styles": {
                    "bold": true
                  }
                }
              ],
              "props": {
                "colspan": 1,
                "rowspan": 1,
                "backgroundColor": "default",
                "textColor": "default",
                "textAlignment": "left"
              }
            },
            {
              "type": "tableCell",
              "content": [
                {
                  "type": "text",
                  "text": "Run Linux or Windows-based virtual machines on-demand.",
                  "styles": {}
                }
              ],
              "props": {
                "colspan": 1,
                "rowspan": 1,
                "backgroundColor": "default",
                "textColor": "default",
                "textAlignment": "left"
              }
            }
          ]
        },
        {
          "cells": [
            {
              "type": "tableCell",
              "content": [
                {
                  "type": "text",
                  "text": "Azure App Services",
                  "styles": {
                    "bold": true
                  }
                }
              ],
              "props": {
                "colspan": 1,
                "rowspan": 1,
                "backgroundColor": "default",
                "textColor": "default",
                "textAlignment": "left"
              }
            },
            {
              "type": "tableCell",
              "content": [
                {
                  "type": "text",
                  "text": "Host web apps and REST APIs in the cloud.",
                  "styles": {}
                }
              ],
              "props": {
                "colspan": 1,
                "rowspan": 1,
                "backgroundColor": "default",
                "textColor": "default",
                "textAlignment": "left"
              }
            }
          ]
        },
        {
          "cells": [
            {
              "type": "tableCell",
              "content": [
                {
                  "type": "text",
                  "text": "Azure Functions",
                  "styles": {
                    "bold": true
                  }
                }
              ],
              "props": {
                "colspan": 1,
                "rowspan": 1,
                "backgroundColor": "default",
                "textColor": "default",
                "textAlignment": "left"
              }
            },
            {
              "type": "tableCell",
              "content": [
                {
                  "type": "text",
                  "text": "Serverless compute service — just write code and deploy.",
                  "styles": {}
                }
              ],
              "props": {
                "colspan": 1,
                "rowspan": 1,
                "backgroundColor": "default",
                "textColor": "default",
                "textAlignment": "left"
              }
            }
          ]
        },
        {
          "cells": [
            {
              "type": "tableCell",
              "content": [
                {
                  "type": "text",
                  "text": "Azure Blob Storage",
                  "styles": {
                    "bold": true
                  }
                }
              ],
              "props": {
                "colspan": 1,
                "rowspan": 1,
                "backgroundColor": "default",
                "textColor": "default",
                "textAlignment": "left"
              }
            },
            {
              "type": "tableCell",
              "content": [
                {
                  "type": "text",
                  "text": "Store massive amounts of unstructured data like images, videos, etc.",
                  "styles": {}
                }
              ],
              "props": {
                "colspan": 1,
                "rowspan": 1,
                "backgroundColor": "default",
                "textColor": "default",
                "textAlignment": "left"
              }
            }
          ]
        },
        {
          "cells": [
            {
              "type": "tableCell",
              "content": [
                {
                  "type": "text",
                  "text": "Azure DevOps",
                  "styles": {
                    "bold": true
                  }
                }
              ],
              "props": {
                "colspan": 1,
                "rowspan": 1,
                "backgroundColor": "default",
                "textColor": "default",
                "textAlignment": "left"
              }
            },
            {
              "type": "tableCell",
              "content": [
                {
                  "type": "text",
                  "text": "Complete CI/CD toolchain for modern app development.",
                  "styles": {}
                }
              ],
              "props": {
                "colspan": 1,
                "rowspan": 1,
                "backgroundColor": "default",
                "textColor": "default",
                "textAlignment": "left"
              }
            }
          ]
        },
        {
          "cells": [
            {
              "type": "tableCell",
              "content": [
                {
                  "type": "text",
                  "text": "Azure Cognitive Services",
                  "styles": {
                    "bold": true
                  }
                }
              ],
              "props": {
                "colspan": 1,
                "rowspan": 1,
                "backgroundColor": "default",
                "textColor": "default",
                "textAlignment": "left"
              }
            },
            {
              "type": "tableCell",
              "content": [
                {
                  "type": "text",
                  "text": "Add AI capabilities like vision, language, and search to your apps.",
                  "styles": {}
                }
              ],
              "props": {
                "colspan": 1,
                "rowspan": 1,
                "backgroundColor": "default",
                "textColor": "default",
                "textAlignment": "left"
              }
            }
          ]
        }
      ]
    },
    "children": []
  },
  {
    "id": "2e4d66dc-944a-49d7-bf75-444cc83c0ddf",
    "type": "heading",
    "props": {
      "textColor": "default",
      "backgroundColor": "default",
      "textAlignment": "left",
      "level": 2
    },
    "content": [
      {
        "type": "text",
        "text": "📚 Real-World Use Cases",
        "styles": {}
      }
    ],
    "children": []
  },
  {
    "id": "1e727b23-de96-4508-bcb1-07fb736f0acc",
    "type": "numberedListItem",
    "props": {
      "textColor": "default",
      "backgroundColor": "default",
      "textAlignment": "left",
      "start": 2394
    },
    "content": [
      {
        "type": "text",
        "text": "E-Commerce",
        "styles": {
          "bold": true
        }
      },
      {
        "type": "text",
        "text": ": Scale websites and manage peak traffic using Azure App Services and Azure SQL Database.",
        "styles": {}
      }
    ],
    "children": []
  },
  {
    "id": "11115e92-7218-414c-873f-0131d2c74f81",
    "type": "numberedListItem",
    "props": {
      "textColor": "default",
      "backgroundColor": "default",
      "textAlignment": "left"
    },
    "content": [
      {
        "type": "text",
        "text": "EdTech",
        "styles": {
          "bold": true
        }
      },
      {
        "type": "text",
        "text": ": Run machine learning models to predict student performance using Azure ML Studio.",
        "styles": {}
      }
    ],
    "children": []
  },
  {
    "id": "ca0e6cfd-4dbe-4325-9629-a3139a93eac6",
    "type": "numberedListItem",
    "props": {
      "textColor": "default",
      "backgroundColor": "default",
      "textAlignment": "left"
    },
    "content": [
      {
        "type": "text",
        "text": "Finance",
        "styles": {
          "bold": true
        }
      },
      {
        "type": "text",
        "text": ": Secure and analyze sensitive data using Azure Key Vault and Azure Synapse Analytics.",
        "styles": {}
      }
    ],
    "children": []
  },
  {
    "id": "4321cf01-c041-43ae-8540-1f8ba7eee93a",
    "type": "numberedListItem",
    "props": {
      "textColor": "default",
      "backgroundColor": "default",
      "textAlignment": "left"
    },
    "content": [
      {
        "type": "text",
        "text": "Startups",
        "styles": {
          "bold": true
        }
      },
      {
        "type": "text",
        "text": ": Quickly prototype MVPs with Azure Functions and Azure Cosmos DB.",
        "styles": {}
      }
    ],
    "children": []
  },
  {
    "id": "4f8c73b1-1df2-4be9-88e3-bfee320b2f3d",
    "type": "heading",
    "props": {
      "textColor": "default",
      "backgroundColor": "default",
      "textAlignment": "left",
      "level": 2
    },
    "content": [
      {
        "type": "text",
        "text": "🧑‍💻 How to Start Learning Azure?",
        "styles": {}
      }
    ],
    "children": []
  },
  {
    "id": "ab0cdc26-1a54-49d8-b04c-9f6c0684ef65",
    "type": "numberedListItem",
    "props": {
      "textColor": "default",
      "backgroundColor": "default",
      "textAlignment": "left",
      "start": 2826
    },
    "content": [
      {
        "type": "text",
        "text": "Create an account",
        "styles": {
          "bold": true
        }
      },
      {
        "type": "text",
        "text": ": ",
        "styles": {}
      },
      {
        "type": "link",
        "href": "https://azure.microsoft.com/en-us/free/",
        "content": [
          {
            "type": "text",
            "text": "https://azure.microsoft.com/en-us/free/",
            "styles": {}
          }
        ]
      }
    ],
    "children": []
  },
  {
    "id": "bb1b946f-9c9a-4baf-ba06-11c27604f711",
    "type": "numberedListItem",
    "props": {
      "textColor": "default",
      "backgroundColor": "default",
      "textAlignment": "left"
    },
    "content": [
      {
        "type": "text",
        "text": "Use Microsoft Learn",
        "styles": {
          "bold": true
        }
      },
      {
        "type": "text",
        "text": ": Hands-on labs and guided paths ",
        "styles": {}
      },
      {
        "type": "link",
        "href": "https://learn.microsoft.com/en-us/training/",
        "content": [
          {
            "type": "text",
            "text": "https://learn.microsoft.com/en-us/training/",
            "styles": {}
          }
        ]
      }
    ],
    "children": []
  },
  {
    "id": "cdd4ca21-3957-40f7-a427-cb5db667a4af",
    "type": "numberedListItem",
    "props": {
      "textColor": "default",
      "backgroundColor": "default",
      "textAlignment": "left"
    },
    "content": [
      {
        "type": "text",
        "text": "Certifications to Aim For",
        "styles": {
          "bold": true
        }
      },
      {
        "type": "text",
        "text": ":",
        "styles": {}
      }
    ],
    "children": [
      {
        "id": "62f91b8b-df6b-4610-b1a9-1386b95bd6a4",
        "type": "bulletListItem",
        "props": {
          "textColor": "default",
          "backgroundColor": "default",
          "textAlignment": "left"
        },
        "content": [
          {
            "type": "text",
            "text": "AZ-900 (Azure Fundamentals)",
            "styles": {}
          }
        ],
        "children": []
      },
      {
        "id": "a3e3f0c7-d7b5-4c73-9fb5-e01472df41a2",
        "type": "bulletListItem",
        "props": {
          "textColor": "default",
          "backgroundColor": "default",
          "textAlignment": "left"
        },
        "content": [
          {
            "type": "text",
            "text": "AZ-104 (Azure Administrator)",
            "styles": {}
          }
        ],
        "children": []
      },
      {
        "id": "323f421f-76f8-48c3-b095-3d6506c414b8",
        "type": "bulletListItem",
        "props": {
          "textColor": "default",
          "backgroundColor": "default",
          "textAlignment": "left"
        },
        "content": [
          {
            "type": "text",
            "text": "AZ-204 (Azure Developer)",
            "styles": {}
          }
        ],
        "children": []
      }
    ]
  },
  {
    "id": "12cbf54a-50e9-4282-94eb-9753a5b4ebb1",
    "type": "heading",
    "props": {
      "textColor": "default",
      "backgroundColor": "default",
      "textAlignment": "left",
      "level": 2
    },
    "content": [
      {
        "type": "text",
        "text": "💡 Final Thoughts",
        "styles": {}
      }
    ],
    "children": []
  },
  {
    "id": "762bb690-20ca-4364-9bbb-1e327fa93a1f",
    "type": "paragraph",
    "props": {
      "textColor": "default",
      "backgroundColor": "default",
      "textAlignment": "left"
    },
    "content": [
      {
        "type": "text",
        "text": "Azure is more than just a cloud platform — it’s an innovation ecosystem. Whether you're building a web app, training ML models, or deploying containers, Azure offers the tools to do it fast, securely, and globally.",
        "styles": {}
      }
    ],
    "children": []
  },
  {
    "id": "d1bc7bed-a1d1-4194-9685-3d39fcf145c2",
    "type": "quote",
    "props": {
      "textColor": "default",
      "backgroundColor": "default"
    },
    "content": [],
    "children": []
  },
  {
    "id": "93588bf2-0975-4fa5-ba33-1be134c1315d",
    "type": "paragraph",
    "props": {
      "textColor": "default",
      "backgroundColor": "default",
      "textAlignment": "left"
    },
    "content": [
      {
        "type": "text",
        "text": "🌐 ",
        "styles": {}
      },
      {
        "type": "text",
        "text": "“If you know how to code, Azure helps you deploy. If you don’t, Azure helps you click.”",
        "styles": {
          "italic": true
        }
      }
    ],
    "children": []
  },
  {
    "id": "84bb8b16-aa73-459d-bbab-b364c5f77d52",
    "type": "heading",
    "props": {
      "textColor": "default",
      "backgroundColor": "default",
      "textAlignment": "left",
      "level": 3
    },
    "content": [
      {
        "type": "text",
        "text": "📥 Want to dive deeper?",
        "styles": {}
      }
    ],
    "children": []
  },
  {
    "id": "de7e12e1-dfa1-4190-8d5c-869b1be78aa8",
    "type": "paragraph",
    "props": {
      "textColor": "default",
      "backgroundColor": "default",
      "textAlignment": "left"
    },
    "content": [
      {
        "type": "text",
        "text": "I can generate tutorials, certification roadmaps, or project ideas using Azure — just ask!",
        "styles": {}
      }
    ],
    "children": []
  },
  {
    "id": "677b7f24-583d-4e17-9e31-8fc544d0e847",
    "type": "paragraph",
    "props": {
      "textColor": "default",
      "backgroundColor": "default",
      "textAlignment": "left"
    },
    "content": [
      {
        "type": "text",
        "text": "Would you like this blog formatted as a Markdown or Word document too?",
        "styles": {}
      }
    ],
    "children": []
  },
  {
    "id": "b92fcc79-20c7-47ae-8f3e-b546fcbd1579",
    "type": "paragraph",
    "props": {
      "textColor": "default",
      "backgroundColor": "default",
      "textAlignment": "left"
    },
    "content": [],
    "children": []
  },
  {
    "id": "70a4af12-1d40-4a35-abd3-3296dabaaee0",
    "type": "paragraph",
    "props": {
      "textColor": "default",
      "backgroundColor": "default",
      "textAlignment": "left"
    },
    "content": [],
    "children": []
  }
]'
                .

User prompt: ${prompt}`
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1000,
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          }
        ]
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      console.error('Gemini API error:', error)
      return NextResponse.json(
        { message: 'Failed to generate content from Gemini' },
        { status: response.status }
      )
    }

    const data = await response.json()
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text

    if (!content) {
      return NextResponse.json(
        { message: 'No content generated' },
        { status: 500 }
      )
    }

    return NextResponse.json({ content })
  } catch (error) {
    console.error('AI generation error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}