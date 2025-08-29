import { type ChatResponse, type Config, Ollama } from "ollama";

// import { systemPrompt } from "./system-prompt";

interface CustomChatReturn extends Omit<ChatResponse, "message"> {
    message: Pick<ChatResponse["message"], "content"> & {
        nonReasoningContent: string;
    };
}
export type Models =
    | "qwen3:1.7b"
    | "deepseek-r1:1.5b"
    | "llama3.2:3b"
    | "gemma3n:e2b";

// Just for testing, you can change the model here
const ModelMaps: Record<Models, { model: Models; host: string }> = {
    "qwen3:1.7b": {
        model: "qwen3:1.7b",
        host: process.env.BASE_URL || "http://localhost:11434",
    },
    "deepseek-r1:1.5b": {
        model: "deepseek-r1:1.5b",
        host: process.env.BASE_URL || "http://localhost:11434",
    },
    "llama3.2:3b": {
        model: "llama3.2:3b",
        host: process.env.BASE_URL || "http://localhost:11434",
    },
    "gemma3n:e2b": {
        model: "gemma3n:e2b",
        host: process.env.BASE_URL || "http://localhost:11434",
    },
};

export class OllamaClient extends Ollama {
    private model: string;

    constructor(config: Partial<Config> & { model: keyof typeof ModelMaps }) {
        super({ host: ModelMaps[config.model].host, ...config });
        this.model = config?.model as string;
    }

    private getNonReasoningContent(content: string) {
        return content.replace(/<[\s\S]+>[\s\S]*?<\/[\s\S]+>/g, "").trim();
    }

    async customChat(
        request: Omit<Parameters<Ollama["chat"]>[0], "model">
    ): Promise<CustomChatReturn> {
        const response = await super.chat({ ...request, model: this.model });
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

// const SelectedModel: Models = "gemma3n:e2b";
// const ollamaClient = new OllamaClient({
//     model: SelectedModel,
//     host: ModelMaps[SelectedModel].host,
// });

// async () => {
//     console.time("customChat");
//     console.log("Model: ", ModelMaps[SelectedModel].model);
//     const response = await ollamaClient.customChat({
//         // model: "qwen3:1.7b", // 46s with `1.94GB / 3.74GB (RAM)` and `all Available CPU`
//         // model: "qwen3:4b", // Cloud not test `model requires more system memory (3.3 GiB) than is available (2.3 GiB)`
//         messages: [
//             { role: "system", content: systemPrompt },
//             { role: "user", content: "What is the capital of France?" },
//         ],
//     });
//     console.log(response.message.nonReasoningContent);
//     console.timeEnd("customChat");
// };

/**
 * docker run command
 * docker run -d \
 *  --name llama3 \
 *  -p 11434:11434 \
 *  -e OLLAMA_HOST=0.0.0.0 \
 *  -e OLLAMA_KEEP_ALIVE=-1 \
 *  -e OLLAMA_MAX_LOADED_MODELS=1 \
 *  -e OLLAMA_NUM_PARALLEL=1 \
 *  naveentag/fiesta-ai:llama3.2-3b
 */
