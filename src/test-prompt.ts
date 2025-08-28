export const testPrompts = [
    // Deep Reasoning & Complex Problem Solving (gpt-5o)
    {
        prompt: "Solve this complex mathematical problem step by step: Given a 3D matrix A with eigenvalues λ1, λ2, λ3, prove that det(A) = λ1 × λ2 × λ3 using matrix diagonalization and properties of determinants.",
        model: "gpt-5o",
    },
    {
        prompt: "Analyze the ethical implications of autonomous vehicles making split-second decisions in accident scenarios. Consider multiple stakeholders, legal frameworks, and moral philosophy principles.",
        model: "gpt-5o",
    },
    {
        prompt: "Design a distributed system architecture for a global e-commerce platform that can handle 1 million concurrent users with 99.99% uptime. Include fault tolerance, scalability, and security considerations.",
        model: "gpt-5o",
    },
    {
        prompt: "Create a comprehensive algorithm for natural language understanding that can parse ambiguous sentences, resolve references, and extract semantic meaning across multiple languages.",
        model: "gpt-5o",
    },
    {
        prompt: "Develop a machine learning model that can predict stock market trends by analyzing multiple data sources including news sentiment, technical indicators, and macroeconomic factors.",
        model: "gpt-5o",
    },

    // Long Context & Document Analysis (claude-sonnet-4)
    {
        prompt: "Analyze this 50-page research paper on climate change and provide a comprehensive summary with key findings, methodology critique, and implications for policy makers.",
        model: "claude-sonnet-4",
    },
    {
        prompt: "Review this 1000-line codebase and identify architectural patterns, potential bugs, performance bottlenecks, and suggest refactoring improvements.",
        model: "claude-sonnet-4",
    },
    {
        prompt: "Examine this legal contract and highlight potential issues, ambiguous clauses, missing protections, and areas that need clarification or modification.",
        model: "claude-sonnet-4",
    },
    {
        prompt: "Process this large dataset of customer feedback and create detailed insights about product satisfaction, common complaints, and actionable recommendations for improvement.",
        model: "claude-sonnet-4",
    },
    {
        prompt: "Analyze this historical document collection and identify patterns, connections, and insights that could inform current decision-making processes.",
        model: "claude-sonnet-4",
    },

    // Multimodal Tasks (gemini-2.5-pro)
    {
        prompt: "Describe the content of this image in detail, then create a story based on what you see, incorporating visual elements and emotional context.",
        model: "gemini-2.5-pro",
    },
    {
        prompt: "Analyze this video clip and provide a detailed transcript, identify key moments, and suggest how it could be edited for different audiences.",
        model: "gemini-2.5-pro",
    },
    {
        prompt: "Listen to this audio recording and transcribe it, then analyze the speaker's tone, emotion, and provide insights about the content.",
        model: "gemini-2.5-pro",
    },
    {
        prompt: "Create a multimedia presentation combining text, images, and video that explains quantum computing concepts to high school students.",
        model: "gemini-2.5-pro",
    },
    {
        prompt: "Design an interactive infographic that combines charts, images, and text to explain the impact of renewable energy on global economies.",
        model: "gemini-2.5-pro",
    },

    // Structured Reasoning & Planning (deepseek-v3.1)
    {
        prompt: "Create a detailed project plan for launching a new mobile app, including timeline, resource allocation, risk assessment, and milestone tracking.",
        model: "deepseek-v3.1",
    },
    {
        prompt: "Develop a step-by-step troubleshooting guide for diagnosing and fixing common computer hardware issues, organized by symptom and solution.",
        model: "deepseek-v3.1",
    },
    {
        prompt: "Design a curriculum for teaching artificial intelligence to middle school students, with clear learning objectives, activities, and assessment methods.",
        model: "deepseek-v3.1",
    },
    {
        prompt: "Create a comprehensive business strategy for entering a new market, including market analysis, competitive positioning, and implementation roadmap.",
        model: "deepseek-v3.1",
    },
    {
        prompt: "Develop a systematic approach to organizing a large personal library, including categorization methods, digital cataloging, and maintenance schedules.",
        model: "deepseek-v3.1",
    },

    // Tool Integration & Workflows (xai.grok-4)
    {
        prompt: "Design an automated workflow that integrates multiple APIs to collect data from social media, analyze sentiment, and generate marketing insights.",
        model: "xai.grok-4",
    },
    {
        prompt: "Create a system that can automatically generate code documentation, run tests, and deploy applications based on git commits and pull requests.",
        model: "xai.grok-4",
    },
    {
        prompt: "Develop an intelligent assistant that can coordinate between calendar apps, email clients, and project management tools to optimize productivity.",
        model: "xai.grok-4",
    },
    {
        prompt: "Design a workflow automation system that can process invoices, validate data, and integrate with accounting software for seamless financial management.",
        model: "xai.grok-4",
    },
    {
        prompt: "Create an AI-powered workflow that can analyze customer support tickets, categorize them, and route them to appropriate team members automatically.",
        model: "xai.grok-4",
    },

    // Real-time Research & Current Information (sonar-pro)
    {
        prompt: "What are the latest developments in quantum computing research as of this month? Please provide recent citations and current breakthroughs.",
        model: "sonar-pro",
    },
    {
        prompt: "Find the most recent statistics on global renewable energy adoption and provide sources for the data.",
        model: "sonar-pro",
    },
    {
        prompt: "What are the current trends in artificial intelligence regulation across different countries? Include recent policy changes and their implications.",
        model: "sonar-pro",
    },
    {
        prompt: "Research the latest developments in COVID-19 variants and provide current recommendations from health authorities with proper citations.",
        model: "sonar-pro",
    },
    {
        prompt: "What are the most recent findings on climate change impacts and mitigation strategies? Include current scientific consensus and recent studies.",
        model: "sonar-pro",
    },

    // Creative Writing & Content Generation (claude-sonnet-4)
    {
        prompt: "Write a compelling short story about a time traveler who discovers they can only travel to moments of their own life, exploring themes of regret and redemption.",
        model: "claude-sonnet-4",
    },
    {
        prompt: "Create a persuasive marketing campaign for an eco-friendly product, including taglines, social media content, and customer testimonials.",
        model: "claude-sonnet-4",
    },
    {
        prompt: "Write a comprehensive guide to sustainable living that inspires readers to make environmental changes in their daily lives.",
        model: "claude-sonnet-4",
    },
    {
        prompt: "Create a series of blog posts about the future of work, exploring remote work trends, automation impacts, and career development strategies.",
        model: "claude-sonnet-4",
    },
    {
        prompt: "Write a children's book about diversity and inclusion that teaches valuable lessons while being entertaining and age-appropriate.",
        model: "claude-sonnet-4",
    },

    // Coding & Software Development (gpt-5o)
    {
        prompt: "Write a Python function that implements a binary search tree with insertion, deletion, and traversal methods, including proper error handling.",
        model: "gpt-5o",
    },
    {
        prompt: "Create a React component for a dynamic data table with sorting, filtering, and pagination capabilities, including TypeScript interfaces.",
        model: "gpt-5o",
    },
    {
        prompt: "Develop a REST API using Node.js and Express that handles user authentication, CRUD operations, and includes comprehensive error handling.",
        model: "gpt-5o",
    },
    {
        prompt: "Write a Docker configuration for a microservices architecture with proper networking, volume management, and environment variable handling.",
        model: "gpt-5o",
    },
    {
        prompt: "Create a machine learning pipeline in Python that preprocesses data, trains multiple models, and evaluates their performance using cross-validation.",
        model: "gpt-5o",
    },

    // Data Analysis & Visualization (claude-sonnet-4)
    {
        prompt: "Analyze this dataset of e-commerce transactions and create visualizations that show seasonal trends, customer behavior patterns, and product performance metrics.",
        model: "claude-sonnet-4",
    },
    {
        prompt: "Process this survey data and generate insights about customer satisfaction, including statistical analysis and recommendations for improvement.",
        model: "claude-sonnet-4",
    },
    {
        prompt: "Create a comprehensive report analyzing social media engagement data, identifying peak posting times, content performance, and audience demographics.",
        model: "claude-sonnet-4",
    },
    {
        prompt: "Analyze this financial dataset and create visualizations showing investment performance, risk analysis, and portfolio optimization opportunities.",
        model: "claude-sonnet-4",
    },
    {
        prompt: "Process this healthcare dataset and identify patterns in patient outcomes, treatment effectiveness, and areas for quality improvement.",
        model: "claude-sonnet-4",
    },

    // Educational Content & Learning (deepseek-v3.1)
    {
        prompt: "Create a lesson plan for teaching photosynthesis to 5th graders, including hands-on activities, assessment methods, and differentiation strategies.",
        model: "deepseek-v3.1",
    },
    {
        prompt: "Develop a tutorial series for learning JavaScript from beginner to advanced, with practical exercises and real-world project examples.",
        model: "deepseek-v3.1",
    },
    {
        prompt: "Design a workshop on public speaking skills, including warm-up exercises, practice scenarios, and feedback mechanisms.",
        model: "deepseek-v3.1",
    },
    {
        prompt: "Create a study guide for learning a new language, including vocabulary building strategies, grammar explanations, and cultural context.",
        model: "deepseek-v3.1",
    },
    {
        prompt: "Develop a training program for new employees, covering company policies, job responsibilities, and professional development opportunities.",
        model: "deepseek-v3.1",
    },

    // Problem Solving & Critical Thinking (gpt-5o)
    {
        prompt: "A company needs to reduce operational costs by 20% while maintaining quality. Analyze the current processes and propose a comprehensive cost-cutting strategy.",
        model: "gpt-5o",
    },
    {
        prompt: "Design a system to detect and prevent fraud in online transactions, considering various attack vectors and implementing multiple security layers.",
        model: "gpt-5o",
    },
    {
        prompt: "Create a disaster recovery plan for a data center, including backup strategies, communication protocols, and business continuity measures.",
        model: "gpt-5o",
    },
    {
        prompt: "Develop a strategy for managing team conflicts in a remote work environment, considering cultural differences and communication challenges.",
        model: "gpt-5o",
    },
    {
        prompt: "Design an algorithm to optimize delivery routes for a logistics company, considering traffic patterns, delivery windows, and vehicle capacity.",
        model: "gpt-5o",
    },
];

export const promptCategories = {
    "Deep Reasoning & Complex Problem Solving": [0, 1, 2, 3, 4],
    "Long Context & Document Analysis": [5, 6, 7, 8, 9],
    "Multimodal Tasks": [10, 11, 12, 13, 14],
    "Structured Reasoning & Planning": [15, 16, 17, 18, 19],
    "Tool Integration & Workflows": [20, 21, 22, 23, 24],
    "Real-time Research & Current Information": [25, 26, 27, 28, 29],
    "Creative Writing & Content Generation": [30, 31, 32, 33, 34],
    "Coding & Software Development": [35, 36, 37, 38, 39],
    "Data Analysis & Visualization": [40, 41, 42, 43, 44],
    "Educational Content & Learning": [45, 46, 47, 48, 49],
    "Problem Solving & Critical Thinking": [50, 51, 52, 53, 54],
};

// Helper function to get prompts by category
export function getPromptsByCategory(
    category: string
): { prompt: string; model: string }[] {
    const indices = promptCategories[category as keyof typeof promptCategories];
    if (!indices) return [];
    return indices.map((index) => testPrompts[index]);
}

// Helper function to get a random prompt
export function getRandomPrompt(): { prompt: string; model: string } {
    const randomIndex = Math.floor(Math.random() * testPrompts.length);
    return testPrompts[randomIndex];
}

// Helper function to get prompts by model recommendation
export function getPromptsByModel(
    model: string
): { prompt: string; model: string }[] {
    const modelPromptMap: Record<string, number[]> = {
        "gpt-5o": [0, 1, 2, 3, 4, 35, 36, 37, 38, 39, 50, 51, 52, 53, 54],
        "claude-sonnet-4": [
            5, 6, 7, 8, 9, 30, 31, 32, 33, 34, 40, 41, 42, 43, 44,
        ],
        "gemini-2.5-pro": [10, 11, 12, 13, 14],
        "deepseek-v3.1": [15, 16, 17, 18, 19, 45, 46, 47, 48, 49],
        "xai.grok-4": [20, 21, 22, 23, 24],
        "sonar-pro": [25, 26, 27, 28, 29],
    };

    const indices = modelPromptMap[model];
    if (!indices) return [];
    return indices.map((index) => testPrompts[index]);
}
