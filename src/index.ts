import fs from "fs";

import { testPrompts } from "./test-prompt";
import { systemPrompt } from "./system-prompt";
import { Models, OllamaClient } from "./ollama";

interface Analysis {
    systemConfig: {
        cpu: string;
        memory: string;
    };
    model: string;
    totalPrompts: number;
    totalTimeTakenInSeconds: number;
    averageTimeTakenInSeconds: number;
    promptResponse: {
        order: number;
        prompt: string;
        expectedModel: string;
        responseModel: string;
        timeTakenInSeconds: number;
    }[];
}

const generateAnalysis = async (model: Models) => {
    const totalPrompts = 10;
    const analysis: Analysis = {
        systemConfig: {
            cpu: "8",
            memory: "16GB",
        },
        totalPrompts,
        totalTimeTakenInSeconds: 0,
        averageTimeTakenInSeconds: 0,
        model: model,
        promptResponse: [],
    };

    let index = 0;
    const startTime = Date.now();
    const ollamaClient = new OllamaClient({ model });

    console.log(`Testing ${testPrompts.length} prompts...`);
    for await (const testPrompt of testPrompts.slice(0, totalPrompts)) {
        const promptOrder = ++index;

        console.log(`\nTesting prompt number: ${promptOrder}`);
        const log = `Test_Prompt_[#${promptOrder}]_Timer`;

        // start timer
        console.time(log);

        const startTime = Date.now();
        const response = await ollamaClient.customChat({
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: testPrompt.prompt },
            ],
        });

        // end timer
        console.timeEnd(log);

        const { message } = response;
        const responseModel = message.nonReasoningContent;

        analysis.promptResponse.push({
            order: promptOrder,
            prompt: testPrompt.prompt,
            expectedModel: testPrompt.model,
            responseModel,
            timeTakenInSeconds: (Date.now() - startTime) / 1000,
        });
    }

    analysis.totalTimeTakenInSeconds = +(
        (Date.now() - startTime) /
        1000
    ).toFixed(2);
    analysis.averageTimeTakenInSeconds = +(
        analysis.totalTimeTakenInSeconds / analysis.totalPrompts
    ).toFixed(2);

    console.log(
        `Total time taken: ${analysis.totalTimeTakenInSeconds} seconds\n` +
            `Average time taken: ${analysis.averageTimeTakenInSeconds} seconds\n`
    );

    fs.writeFileSync(
        `analysis/analysis-${model}.json`,
        JSON.stringify(analysis, null, 2)
    );
};

(async () => {
    const model: Models = "llama3.2:3b";
    console.log(`Generating analysis for ${model}...`);
    await generateAnalysis(model);
})();
