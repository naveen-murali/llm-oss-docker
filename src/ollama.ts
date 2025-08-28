import { type ChatResponse, type Config, Ollama } from "ollama";

import { systemPrompt } from "./system-prompt";

interface CustomChatReturn extends Omit<ChatResponse, "message"> {
    message: Pick<ChatResponse["message"], "content"> & {
        nonReasoningContent: string;
    };
}

// Just for testing, you can change the model here
const ModelMaps = {
    "qwen3:1.7b": {
        model: "qwen3:1.7b",
        host: "http://127.0.0.1:11434",
    },
    "qwen3:4b": {
        model: "qwen3:4b",
        host: "http://127.0.0.1:11435",
    },
};
const SelectedModel: keyof typeof ModelMaps = "qwen3:4b";

class OllamaClient extends Ollama {
    constructor(config?: Partial<Config>) {
        super({ host: ModelMaps[SelectedModel].host, ...config });
    }

    private getNonReasoningContent(content: string) {
        return content.replace(/<[\s\S]+>[\s\S]*?<\/[\s\S]+>/g, "").trim();
    }

    async customChat(
        request: Parameters<Ollama["chat"]>[0]
    ): Promise<CustomChatReturn> {
        const response = await super.chat(request);
        const nonReasoningContent = this.getNonReasoningContent(
            response.message.content
        );

        return {
            ...response,
            message: {
                ...response?.message,
                nonReasoningContent,
            },
        };
    }
}

const ollamaClient = new OllamaClient({
    host: ModelMaps[SelectedModel].host,
});

(async () => {
    console.time("customChat");
    const response = await ollamaClient.customChat({
        model: ModelMaps[SelectedModel].model,
        // model: "qwen3:1.7b", // 46s with `1.94GB / 3.74GB (RAM)` and `all Available CPU`
        // model: "qwen3:4b", // Cloud not test `model requires more system memory (3.3 GiB) than is available (2.3 GiB)`
        messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: "What is the capital of France?" },
        ],
    });
    console.log(JSON.stringify(response, null, 2));
    console.timeEnd("customChat");
})();
