import { OpenAI } from "openai";

const qwen =  new OpenAI({
      apiKey: process.env.DASHSCOPE_API_KEY,
      baseURL: "https://dashscope-intl.aliyuncs.com/compatible-mode/v1"
    })

export default qwen;